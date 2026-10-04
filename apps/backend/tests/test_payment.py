import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.main import app
from src.core.database import get_db
from src.core.security import create_access_token
from src.models.user import User, UserRole
from src.models.pet import PetSpecies
from src.models.catalog import Category, CanonicalProduct, Seller, SellerOffer
from src.models.order import Order, OrderItem, OrderStatus, InventoryReservation
from src.services.payment import MockPaymentGateway, get_payment_gateway


@pytest.mark.asyncio
async def test_zarinpal_payment_flow_and_commission(db_session: AsyncSession):
    # Setup users
    user_buyer = User(phone_number="09127770001", role=UserRole.PET_PARENT)
    user_other = User(phone_number="09127770002", role=UserRole.PET_PARENT)
    db_session.add_all([user_buyer, user_other])
    await db_session.flush()

    token_buyer = create_access_token({"sub": user_buyer.id, "phone": user_buyer.phone_number, "role": user_buyer.role.value})
    token_other = create_access_token({"sub": user_other.id, "phone": user_other.phone_number, "role": user_other.role.value})

    # Catalog & Seller
    category = Category(title_fa="غذای گربه", slug="cat-food-pay")
    product = CanonicalProduct(
        category=category,
        title_fa="غذای خشک رفلکس گربه بالغ",
        slug="reflex-adult-cat-pay",
        target_species=PetSpecies.CAT,
    )
    seller = Seller(
        user_id=user_other.id,
        store_name_fa="پت‌استور پایتخت",
        slug="paytakht-pet-pay",
        national_id="0012999888",
        sheba_number="IR1200000000000000000099",
        phone_number="09127770002",
        address="تهران، ونک",
    )
    db_session.add_all([category, product, seller])
    await db_session.flush()

    offer = SellerOffer(
        product_id=product.id,
        seller_id=seller.id,
        price_tomans=600000,
        stock_quantity=5,
        is_active=True,
    )
    db_session.add(offer)
    await db_session.flush()

    # Create Order for buyer
    order = Order(
        user_id=user_buyer.id,
        status=OrderStatus.PAYMENT_PENDING,
        total_amount_tomans=639000,  # 600,000 + 39,000 shipping
    )
    db_session.add(order)
    await db_session.flush()

    order_item = OrderItem(
        order_id=order.id,
        offer_id=offer.id,
        seller_id=seller.id,
        product_title=product.title_fa,
        quantity=1,
        unit_price_tomans=600000,
        commission_tomans=60000,  # 10%
    )
    db_session.add(order_item)

    from datetime import datetime, timezone, timedelta
    reservation = InventoryReservation(
        offer_id=offer.id,
        user_id=user_buyer.id,
        quantity=1,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
        is_released=False,
    )
    db_session.add(reservation)
    await db_session.commit()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_payment_gateway] = lambda: MockPaymentGateway()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Security Check: Other user attempts to pay for buyer's order
        res_forbidden = await ac.post(
            "/api/v1/payment/request",
            json={"order_id": order.id},
            headers={"Authorization": f"Bearer {token_other}"},
        )
        assert res_forbidden.status_code == 403

        # 2. Buyer requests payment URL
        res_pay = await ac.post(
            "/api/v1/payment/request",
            json={"order_id": order.id},
            headers={"Authorization": f"Bearer {token_buyer}"},
        )
        assert res_pay.status_code == 200
        pay_data = res_pay.json()
        assert "authority" in pay_data
        assert "payment_url" in pay_data
        authority = pay_data["authority"]

        # 3. Callback verification with Status=OK
        res_verify = await ac.get(f"/api/v1/payment/verify?Authority={authority}&Status=OK")
        assert res_verify.status_code == 200
        verify_data = res_verify.json()
        assert verify_data["status"] == "PAID"
        assert verify_data["payment_ref_id"].startswith("REF_")
        assert verify_data["commission_deducted_tomans"] == 60000

        # 4. Verify DB mutations: Stock reduced from 5 to 4, Reservation released
        await db_session.refresh(offer)
        assert offer.stock_quantity == 4

        await db_session.refresh(reservation)
        assert reservation.is_released is True

        # 5. IDEMPOTENCY TEST: Re-verify the already-paid order
        res_verify_again = await ac.get(f"/api/v1/payment/verify?Authority={authority}&Status=OK")
        assert res_verify_again.status_code == 200
        verify_again_data = res_verify_again.json()
        assert verify_again_data["status"] == "PAID"
        assert verify_again_data["payment_ref_id"] == verify_data["payment_ref_id"]
        # Stock must NOT be deducted a second time
        await db_session.refresh(offer)
        assert offer.stock_quantity == 4, "Idempotent verify must not deduct stock twice!"

        # 6. Invalid / Non-existent Authority returns 404
        res_not_found = await ac.get("/api/v1/payment/verify?Authority=NON_EXISTENT_AUTH&Status=OK")
        assert res_not_found.status_code == 404

        # 7. Failed Callback Test: User cancels payment
        order_fail = Order(
            user_id=user_buyer.id,
            status=OrderStatus.PAYMENT_PENDING,
            total_amount_tomans=100000,
            payment_authority="AUTH_FAIL_123",
        )
        db_session.add(order_fail)
        await db_session.commit()

        res_fail = await ac.get("/api/v1/payment/verify?Authority=AUTH_FAIL_123&Status=NOK")
        assert res_fail.status_code == 400
        await db_session.refresh(order_fail)
        assert order_fail.status == OrderStatus.CANCELLED

        # 8. Server-Side Cart Persistence Test
        # Buyer syncs cart items to DB
        res_sync = await ac.post(
            "/api/v1/checkout/cart/sync",
            json={"items": [{"offer_id": offer.id, "quantity": 2, "pet_id": None}]},
            headers={"Authorization": f"Bearer {token_buyer}"},
        )
        assert res_sync.status_code == 200
        cart_data = res_sync.json()
        assert len(cart_data) == 1
        assert cart_data[0]["offer_id"] == offer.id
        assert cart_data[0]["quantity"] == 2

        # Buyer fetches cart from DB
        res_get_cart = await ac.get(
            "/api/v1/checkout/cart",
            headers={"Authorization": f"Bearer {token_buyer}"},
        )
        assert res_get_cart.status_code == 200
        assert len(res_get_cart.json()) == 1

        # Clear cart
        res_del_cart = await ac.delete(
            "/api/v1/checkout/cart",
            headers={"Authorization": f"Bearer {token_buyer}"},
        )
        assert res_del_cart.status_code == 200
        res_empty = await ac.get(
            "/api/v1/checkout/cart",
            headers={"Authorization": f"Bearer {token_buyer}"},
        )
        assert len(res_empty.json()) == 0

    app.dependency_overrides.clear()
