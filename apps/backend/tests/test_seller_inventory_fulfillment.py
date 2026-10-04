import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from src.main import app
from src.core.database import get_db
from src.core.security import create_access_token
from src.models.user import User, UserRole
from src.models.pet import PetSpecies
from src.models.catalog import Category, CanonicalProduct, Seller, SellerOffer
from src.models.order import Order, OrderItem, OrderStatus


@pytest.mark.asyncio
async def test_seller_inventory_import_and_fulfillment(db_session: AsyncSession):
    # Setup seller user & buyer user
    seller_user = User(phone_number="09121234567", role=UserRole.SELLER)
    buyer_user = User(phone_number="09129876543", role=UserRole.PET_PARENT)
    db_session.add_all([seller_user, buyer_user])
    await db_session.flush()

    token_seller = create_access_token({"sub": seller_user.id, "phone": seller_user.phone_number, "role": seller_user.role.value})

    # Setup approved seller
    seller = Seller(
        user_id=seller_user.id,
        store_name_fa="پت‌شاپ طلایی",
        slug="golden-pet",
        national_id="0011223344",
        sheba_number="IR1100000000000000000011",
        phone_number="09121234567",
        address="تهران",
        is_verified=True,
        status="APPROVED",
    )
    # Setup catalog product with barcode
    category = Category(title_fa="مکمل و دارویی", slug="pet-supplements")
    product = CanonicalProduct(
        category=category,
        title_fa="قرص مولتی‌ویتامین سگ بیفار",
        slug="beaphar-dog-multivitamin",
        barcode="8711231123456",
        target_species=PetSpecies.DOG,
    )
    db_session.add_all([seller, category, product])
    await db_session.commit()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Batch Excel/Spreadsheet import mapping barcode to offer
        import_payload = {
            "offers": [
                {
                    "product_slug_or_barcode": "8711231123456",
                    "price_tomans": 320000,
                    "stock_quantity": 25,
                    "is_active": True,
                }
            ]
        }
        res_import = await ac.post(
            "/api/v1/sellers/offers/import",
            json=import_payload,
            headers={"Authorization": f"Bearer {token_seller}"},
        )
        assert res_import.status_code == 200
        assert res_import.json()["created_count"] == 1

        # 2. Re-upload with stock update (25 -> 40)
        import_payload["offers"][0]["stock_quantity"] = 40
        res_reimport = await ac.post(
            "/api/v1/sellers/offers/import",
            json=import_payload,
            headers={"Authorization": f"Bearer {token_seller}"},
        )
        assert res_reimport.status_code == 200
        assert res_reimport.json()["updated_count"] == 1

        # 3. List seller offers
        res_list = await ac.get(
            "/api/v1/sellers/offers",
            headers={"Authorization": f"Bearer {token_seller}"},
        )
        assert res_list.status_code == 200
        offers_list = res_list.json()
        assert len(offers_list) == 1
        assert offers_list[0]["stock_quantity"] == 40
        offer_id = offers_list[0]["id"]

        # 4. Patch single offer directly
        res_patch = await ac.patch(
            f"/api/v1/sellers/offers/{offer_id}",
            json={"price_tomans": 310000, "stock_quantity": 38},
            headers={"Authorization": f"Bearer {token_seller}"},
        )
        assert res_patch.status_code == 200

        # 5. Order fulfillment: Create paid order for this item
        order = Order(
            user_id=buyer_user.id,
            status=OrderStatus.PAID,
            total_amount_tomans=349000,
            shipping_address="تهران، میرداماد",
            shipping_timeslot="۹ تا ۱۲",
        )
        db_session.add(order)
        await db_session.flush()

        order_item = OrderItem(
            order_id=order.id,
            offer_id=offer_id,
            seller_id=seller.id,
            product_title=product.title_fa,
            quantity=1,
            unit_price_tomans=310000,
            commission_tomans=31000,
        )
        db_session.add(order_item)
        await db_session.commit()

        # Query seller orders
        res_orders = await ac.get(
            "/api/v1/sellers/orders",
            headers={"Authorization": f"Bearer {token_seller}"},
        )
        assert res_orders.status_code == 200
        seller_orders = res_orders.json()
        assert len(seller_orders) == 1
        assert seller_orders[0]["order_item_id"] == order_item.id

        # Update fulfillment to SHIPPED with tracking number
        res_fulfill = await ac.patch(
            f"/api/v1/sellers/orders/{order_item.id}/fulfillment",
            json={
                "status": "SHIPPED",
                "courier_name": "بونیو اکسپرس",
                "tracking_number": "BNV-987654",
            },
            headers={"Authorization": f"Bearer {token_seller}"},
        )
        assert res_fulfill.status_code == 200
        fulfill_data = res_fulfill.json()
        assert fulfill_data["new_order_status"] == "SHIPPED"
        assert fulfill_data["tracking_number"] == "BNV-987654"

    app.dependency_overrides.clear()
