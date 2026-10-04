import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.models.user import User, UserRole
from src.models.catalog import Category, CanonicalProduct, Seller, SellerOffer
from src.models.pet import PetSpecies


@pytest.mark.asyncio
async def test_multi_seller_offers_and_indexing(db_session: AsyncSession):
    # 1. Create Category
    cat = Category(slug="dog-food", title_fa="غذای خشک سگ")
    db_session.add(cat)
    await db_session.flush()

    # 2. Create Canonical Product
    prod = CanonicalProduct(
        category_id=cat.id,
        title_fa="غذای خشک سگ رفلکس پلاس ۱۵ کیلوگرم",
        slug="reflex-plus-dog-15kg",
        brand="Reflex Plus",
        target_species=PetSpecies.DOG,
        package_weight_grams=15000,
    )
    db_session.add(prod)
    await db_session.flush()

    # 3. Create 2 Sellers
    user1 = User(phone_number="09110001111", role=UserRole.SELLER)
    user2 = User(phone_number="09220002222", role=UserRole.SELLER)
    db_session.add_all([user1, user2])
    await db_session.flush()

    seller1 = Seller(user_id=user1.id, store_name_fa="پت‌شاپ نیاوران", slug="niavaran-pet", national_id="0011223344", sheba_number="IR12345", phone_number="02122222222", address="تهران، نیاوران")
    seller2 = Seller(user_id=user2.id, store_name_fa="پت‌لند پونک", slug="petland-poonak", national_id="0055667788", sheba_number="IR67890", phone_number="02144444444", address="تهران، پونک")
    db_session.add_all([seller1, seller2])
    await db_session.flush()

    # 4. Create 2 competing offers for the SAME product
    offer1 = SellerOffer(product_id=prod.id, seller_id=seller1.id, price_tomans=1850000, stock_quantity=5, is_active=True)
    offer2 = SellerOffer(product_id=prod.id, seller_id=seller2.id, price_tomans=1790000, stock_quantity=10, is_active=True)
    db_session.add_all([offer1, offer2])
    await db_session.commit()

    # 5. Query product with offers ordered by price
    stmt = (
        select(CanonicalProduct)
        .options(selectinload(CanonicalProduct.offers))
        .where(CanonicalProduct.id == prod.id)
    )
    res = await db_session.execute(stmt)
    loaded_prod = res.scalar_one()

    assert len(loaded_prod.offers) == 2
    prices = [o.price_tomans for o in loaded_prod.offers]
    assert 1850000 in prices
    assert 1790000 in prices
