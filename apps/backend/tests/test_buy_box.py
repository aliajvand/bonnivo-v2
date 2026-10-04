import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.user import User, UserRole
from src.models.catalog import Category, CanonicalProduct, Seller, SellerOffer
from src.models.pet import PetSpecies


@pytest.mark.asyncio
async def test_buy_box_selection_algorithm(client: AsyncClient, db_session: AsyncSession):
    # 1. Seed Category and Product
    cat = Category(slug="cat-food", title_fa="غذای گربه")
    db_session.add(cat)
    await db_session.flush()

    prod = CanonicalProduct(
        category_id=cat.id,
        title_fa="پوچ رویال کنین مدل اینستینکتین",
        slug="royal-canin-instinctive-pouch",
        brand="Royal Canin",
        target_species=PetSpecies.CAT,
        package_weight_grams=85,
    )
    db_session.add(prod)
    await db_session.flush()

    # 2. Seed 3 Sellers
    u1 = User(phone_number="09331111111", role=UserRole.SELLER)
    u2 = User(phone_number="09332222222", role=UserRole.SELLER)
    u3 = User(phone_number="09333333333", role=UserRole.SELLER)
    db_session.add_all([u1, u2, u3])
    await db_session.flush()

    s1 = Seller(user_id=u1.id, store_name_fa="فروشگاه ارزان ولی بدون موجودی", slug="cheap-no-stock", national_id="111", sheba_number="IR1", phone_number="0211", address="تهران")
    s2 = Seller(user_id=u2.id, store_name_fa="پت‌شاپ VIP زعفرانیه", slug="zaferanieh-pet", national_id="222", sheba_number="IR2", phone_number="0212", address="تهران")
    s3 = Seller(user_id=u3.id, store_name_fa="بونیو اکسپرس سعادت‌آباد", slug="bonyo-express", national_id="333", sheba_number="IR3", phone_number="0213", address="تهران")
    db_session.add_all([s1, s2, s3])
    await db_session.flush()

    # 3. Create 3 Offers:
    # Offer 1: cheapest (90,000) BUT stock = 0
    o1 = SellerOffer(product_id=prod.id, seller_id=s1.id, price_tomans=90000, stock_quantity=0, is_active=True)
    # Offer 2: expensive (140,000), stock = 20
    o2 = SellerOffer(product_id=prod.id, seller_id=s2.id, price_tomans=140000, stock_quantity=20, is_active=True)
    # Offer 3: best in-stock price (110,000), stock = 12 -> MUST CAPTURE BUY BOX
    o3 = SellerOffer(product_id=prod.id, seller_id=s3.id, price_tomans=110000, stock_quantity=12, is_active=True)

    db_session.add_all([o1, o2, o3])
    await db_session.commit()

    # 4. Request product via API
    res = await client.get(f"/api/v1/catalog/products/{prod.slug}")
    assert res.status_code == 200
    data = res.json()

    # 5. Assert Buy Box Winner is Offer 3
    buy_box = data["buy_box_offer"]
    assert buy_box is not None
    assert buy_box["price_tomans"] == 110000
    assert buy_box["store_name_fa"] == "بونیو اکسپرس سعادت‌آباد"
    assert buy_box["is_buy_box_winner"] is True

    # 6. Assert Alternative Offers contains Offer 2
    alts = data["alternative_offers"]
    assert len(alts) == 1
    assert alts[0]["price_tomans"] == 140000
    assert alts[0]["store_name_fa"] == "پت‌شاپ VIP زعفرانیه"

    # Out-of-stock Offer 1 must NOT be shown
    assert not any(a["price_tomans"] == 90000 for a in alts)
