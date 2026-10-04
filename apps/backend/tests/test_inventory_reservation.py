import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from src.main import app
from src.core.database import get_db
from src.core.security import create_access_token
from src.models.user import User, UserRole
from src.models.pet import PetSpecies
from src.models.catalog import Category, CanonicalProduct, Seller, SellerOffer
from src.models.order import Order, InventoryReservation


@pytest.mark.asyncio
async def test_inventory_reservation_and_split_shipment(db_session: AsyncSession):
    # Setup test users
    user_a = User(phone_number="09128880011", role=UserRole.PET_PARENT)
    user_b = User(phone_number="09128880022", role=UserRole.PET_PARENT)
    db_session.add_all([user_a, user_b])
    await db_session.flush()

    token_a = create_access_token({"sub": user_a.id, "phone": user_a.phone_number, "role": user_a.role.value})
    token_b = create_access_token({"sub": user_b.id, "phone": user_b.phone_number, "role": user_b.role.value})

    # Setup category and product
    category = Category(title_fa="غذای خشک سگ", slug="dog-dry-food-res")
    product = CanonicalProduct(
        category=category,
        title_fa="غذای خشک رویال کنین مینی ادالت ۸ کیلوگرم",
        slug="royal-canin-mini-adult-8kg-res",
        target_species=PetSpecies.DOG,
    )
    db_session.add_all([category, product])
    await db_session.flush()

    # Setup 2 distinct sellers for split shipment test
    seller_1 = Seller(
        user_id=user_a.id,
        store_name_fa="پت‌شاپ نیاوران",
        slug="niavaran-pet-res",
        national_id="0012345678",
        sheba_number="IR1200000000000000000001",
        phone_number="09128880011",
        address="تهران، نیاوران",
    )
    seller_2 = Seller(
        user_id=user_b.id,
        store_name_fa="پت‌استور سعادت‌آباد",
        slug="saadat-abad-pet-res",
        national_id="0012345679",
        sheba_number="IR1200000000000000000002",
        phone_number="09128880022",
        address="تهران، سعادت‌آباد",
    )
    db_session.add_all([seller_1, seller_2])
    await db_session.flush()

    # Offer 1: Seller 1, stock = 2
    offer_1 = SellerOffer(
        product_id=product.id,
        seller_id=seller_1.id,
        price_tomans=450000,
        stock_quantity=2,
        is_active=True,
    )
    # Offer 2: Seller 2, stock = 10
    offer_2 = SellerOffer(
        product_id=product.id,
        seller_id=seller_2.id,
        price_tomans=500000,
        stock_quantity=10,
        is_active=True,
    )
    db_session.add_all([offer_1, offer_2])
    await db_session.commit()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. User A reserves 2 items from Offer 1 (exhausting stock) and 1 item from Offer 2 (Split Shipment)
        payload_a = {
            "items": [
                {"offer_id": offer_1.id, "quantity": 2},
                {"offer_id": offer_2.id, "quantity": 1},
            ],
            "shipping_address": "تهران، میدان ونک، خیابان ملاصدرا",
            "shipping_timeslot": "۱۴:۰۰ تا ۱۸:۰۰",
        }
        res_a = await ac.post(
            "/api/v1/checkout/reserve",
            json=payload_a,
            headers={"Authorization": f"Bearer {token_a}"},
        )
        assert res_a.status_code == 201
        data_a = res_a.json()

        # Check reservation expiration is set to 30 mins
        assert data_a["reservation_minutes"] == 30
        assert "order_id" in data_a

        # Check split shipment: 2 separate packages for the 2 sellers
        assert len(data_a["packages"]) == 2
        seller_names = [p["seller_name"] for p in data_a["packages"]]
        assert "پت‌شاپ نیاوران" in seller_names
        assert "پت‌استور سعادت‌آباد" in seller_names

        # Total shipping reflects split packages: Seller 1 has subtotal 900,000 >= 800,000 (free shipping), Seller 2 has 500,000 (39,000 fee)
        assert data_a["total_shipping_tomans"] == 39000
        assert data_a["total_goods_tomans"] == (450000 * 2) + 500000
        assert data_a["grand_total_tomans"] == data_a["total_goods_tomans"] + 39000

        # 2. Concurrency/Stock Check: User B tries to reserve 1 item from Offer 1
        # Offer 1 had 2 in stock, but User A holds an active reservation for 2!
        payload_b = {
            "items": [
                {"offer_id": offer_1.id, "quantity": 1},
            ],
        }
        res_b = await ac.post(
            "/api/v1/checkout/reserve",
            json=payload_b,
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_b.status_code == 400
        assert "موجودی" in res_b.json()["detail"]

    app.dependency_overrides.clear()
