import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from src.main import app
from src.core.database import get_db
from src.core.security import create_access_token
from src.models.user import User, UserRole
from src.models.pet import Pet, PetSpecies, PetHealthProfile
from src.models.catalog import Category, CanonicalProduct, Seller, SellerOffer
from src.models.order import Order, OrderItem, OrderStatus, ReorderSchedule
from src.services.replenishment import calculate_depletion_schedule, dispatch_due_replenishment_reminders
from src.services.payment import MockPaymentGateway, get_payment_gateway


def test_calculate_depletion_schedule_unit():
    # 15kg (15,000g) at 300g/day = 50 days
    base_time = datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    depletion_date, prompt_date, days = calculate_depletion_schedule(
        package_weight_grams=15000,
        daily_consumption_grams=300,
        start_date=base_time,
    )
    assert days == 50
    assert depletion_date == base_time + timedelta(days=50)
    # Prompt date is 7 days before depletion (day 43)
    assert prompt_date == base_time + timedelta(days=43)


@pytest.mark.asyncio
async def test_order_payment_creates_reorder_schedule(db_session: AsyncSession):
    # Setup user & pet
    user = User(phone_number="09129991122", role=UserRole.PET_PARENT)
    db_session.add(user)
    await db_session.flush()

    token = create_access_token({"sub": user.id, "phone": user.phone_number, "role": user.role.value})

    pet = Pet(
        user_id=user.id,
        name="تدی",
        species=PetSpecies.DOG,
        breed="گلدن رتریور",
        qr_passport_token="token-reorder-teddy-123",
    )
    db_session.add(pet)
    await db_session.flush()

    profile = PetHealthProfile(pet_id=pet.id, daily_food_grams=300)
    db_session.add(profile)
    await db_session.flush()

    # Setup product with 15kg package weight
    category = Category(title_fa="غذای سگ", slug="dog-food-reorder")
    product = CanonicalProduct(
        category=category,
        title_fa="غذای خشک رویال کنین مکسی ادالت ۱۵ کیلوگرم",
        slug="royal-canin-maxi-adult-15kg",
        target_species=PetSpecies.DOG,
        package_weight_grams=15000,
    )
    seller = Seller(
        user_id=user.id,
        store_name_fa="پت‌استور مرکزی",
        slug="markazi-pet-reorder",
        national_id="0012888777",
        sheba_number="IR1200000000000000000077",
        phone_number="09129991122",
        address="تهران",
    )
    db_session.add_all([category, product, seller])
    await db_session.flush()

    offer = SellerOffer(
        product_id=product.id,
        seller_id=seller.id,
        price_tomans=1200000,
        stock_quantity=10,
        is_active=True,
    )
    db_session.add(offer)
    await db_session.flush()

    # Create Order with pet_id attached to item
    order = Order(
        user_id=user.id,
        status=OrderStatus.PAYMENT_PENDING,
        total_amount_tomans=1200000,
        payment_authority="AUTH_REORDER_TEST",
    )
    db_session.add(order)
    await db_session.flush()

    order_item = OrderItem(
        order_id=order.id,
        offer_id=offer.id,
        seller_id=seller.id,
        pet_id=pet.id,
        product_title=product.title_fa,
        quantity=1,
        unit_price_tomans=1200000,
        commission_tomans=120000,
    )
    db_session.add(order_item)
    await db_session.commit()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_payment_gateway] = lambda: MockPaymentGateway()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Verify Payment callback to trigger reorder schedule creation
        res = await ac.get("/api/v1/payment/verify?Authority=AUTH_REORDER_TEST&Status=OK")
        assert res.status_code == 200

        # 2. Query pet replenishment schedule endpoint
        res_sch = await ac.get(
            f"/api/v1/replenishment/pet/{pet.id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res_sch.status_code == 200
        data_sch = res_sch.json()
        assert data_sch is not None
        assert data_sch["days_total"] == 50
        assert data_sch["daily_consumption_grams"] == 300
        assert data_sch["package_weight_grams"] == 15000
        assert data_sch["is_active"] is True
        assert data_sch["sms_sent"] is False

        # 3. Test cron dispatch
        # Set prompt_date to past to simulate reaching reminder threshold
        from sqlalchemy import select
        q = select(ReorderSchedule).where(ReorderSchedule.pet_id == pet.id)
        sch_obj = (await db_session.execute(q)).scalar_one()
        sch_obj.prompt_date = datetime.now(timezone.utc) - timedelta(days=1)
        await db_session.commit()

        res_cron = await ac.post("/api/v1/replenishment/dispatch-cron")
        assert res_cron.status_code == 200
        assert res_cron.json()["reminders_dispatched"] == 1

        # Check sms_sent updated to True
        await db_session.refresh(sch_obj)
        assert sch_obj.sms_sent is True

    app.dependency_overrides.clear()
