import hashlib
import hmac
import json
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.catalog import Category, CanonicalProduct, Seller, SellerOffer
from src.models.pet import PetSpecies
from src.models.user import User, UserRole
from src.api.v1.wms_webhooks import WMS_SECRET_KEY


@pytest.mark.asyncio
async def test_wms_webhook_signature_and_stock_sync(client: AsyncClient, db_session: AsyncSession):
    # 1. Seed Category, Product, Seller A and Seller B
    category = Category(title_fa="تغذیه سگ", slug="dog-food-wms")
    db_session.add(category)
    await db_session.flush()

    product = CanonicalProduct(
        category_id=category.id,
        title_fa="غذای خشک رفلکس سگ بالغ",
        slug="reflex-adult-dog-wms",
        brand="Reflex",
        target_species=PetSpecies.DOG,
    )
    db_session.add(product)
    await db_session.flush()

    user_a = User(
        id="usr-wms-seller-a",
        phone_number="09121111111",
        full_name="فروشنده سپیدار",
        role=UserRole.SELLER,
    )
    user_b = User(
        id="usr-wms-seller-b",
        phone_number="09122222222",
        full_name="فروشنده پت پارس",
        role=UserRole.SELLER,
    )
    db_session.add_all([user_a, user_b])
    await db_session.flush()

    seller_a = Seller(
        user_id="usr-wms-seller-a",
        store_name_fa="انبار مرکزی تامین سپیدار",
        slug="sepidar-wms-warehouse",
        national_id="1111222233",
        sheba_number="IR111111111111111111111111",
        phone_number="02177889900",
        city="تهران",
        address="تهران، خیابان دماوند، انبار مرکزی",
        is_verified=True,
    )
    seller_b = Seller(
        user_id="usr-wms-seller-b",
        store_name_fa="انبار پت پارس",
        slug="pet-pars-wms-warehouse",
        national_id="2222333344",
        sheba_number="IR222222222222222222222222",
        phone_number="02188990011",
        city="تهران",
        address="تهران، خیابان آزادی، انبار غربی",
        is_verified=True,
    )
    db_session.add_all([seller_a, seller_b])
    await db_session.flush()

    offer_a = SellerOffer(
        seller_id=seller_a.id,
        product_id=product.id,
        price_tomans=1200000,
        stock_quantity=10,
        is_active=True,
    )
    offer_b = SellerOffer(
        seller_id=seller_b.id,
        product_id=product.id,
        price_tomans=1250000,
        stock_quantity=5,
        is_active=True,
    )
    db_session.add_all([offer_a, offer_b])
    await db_session.commit()

    # 2. Prepare Webhook Payload for Seller A
    payload = {
        "seller_id": seller_a.id,
        "sync_event_id": "WMS-EVT-99881",
        "inventory_updates": [
            {"offer_id": offer_a.id, "stock_quantity": 45},
            {"offer_id": offer_b.id, "stock_quantity": 999},  # Malicious attempt to alter Seller B's stock
        ],
    }
    payload_json_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")

    # 3. Test Invalid Signature -> Rejected with 401
    bad_headers = {"X-Bonyo-Signature": "invalid-tampered-hmac-signature", "Content-Type": "application/json"}
    bad_res = await client.post("/api/v1/webhooks/wms/sync-stock", content=payload_json_bytes, headers=bad_headers)
    assert bad_res.status_code == 401
    assert "امضای امنیتی" in bad_res.json()["detail"]

    # 4. Test Valid HMAC-SHA256 Signature
    valid_signature = hmac.new(WMS_SECRET_KEY.encode(), payload_json_bytes, hashlib.sha256).hexdigest()
    good_headers = {"X-Bonyo-Signature": valid_signature, "Content-Type": "application/json"}

    good_res = await client.post("/api/v1/webhooks/wms/sync-stock", content=payload_json_bytes, headers=good_headers)
    assert good_res.status_code == 200
    res_data = good_res.json()
    assert res_data["success"] is True
    assert res_data["updated_offers_count"] == 1  # Only Seller A's offer was updated!

    # 5. Verify database records:
    # Offer A stock must be updated to 45
    await db_session.refresh(offer_a)
    assert offer_a.stock_quantity == 45

    # Offer B stock MUST REMAIN 5 (Tenant isolation preserved!)
    await db_session.refresh(offer_b)
    assert offer_b.stock_quantity == 5
