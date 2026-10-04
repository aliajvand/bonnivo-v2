import pytest
from httpx import AsyncClient
from datetime import datetime, timezone, timedelta
from src.models.user import UserRole
from src.models.coupon import Coupon, CouponType, RedemptionStatus
from src.models.wallet import Wallet, WalletTransaction, TransactionType, WithdrawalStatus
from src.models.event import Event, EventModerationStatus
from src.models.feature_flag import PlatformFeatureFlag
from src.models.catalog import CanonicalProduct, ProductVariant, SellerOffer, Seller
from src.models.order import Order, OrderStatus, FulfillmentStage


from src.services.sms import default_sms_provider


async def get_auth_token(client: AsyncClient, phone: str = "09129998877", role: str = "CUSTOMER") -> str:
    # Trigger OTP request
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    sent_code = default_sms_provider.sent_otps.get(phone, "11111")
    verify_res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": sent_code})
    return verify_res.json()["access_token"]



@pytest.mark.asyncio
async def test_coupon_lifecycle_and_no_burn_on_cart(client: AsyncClient, db_session):
    # 1. Setup Admin to create coupon
    admin_token = await get_auth_token(client, "09120000001", "ADMIN")
    # Promote user to ADMIN in DB
    from src.models.user import User
    from sqlalchemy import select
    user_stmt = select(User).where(User.phone_number == "09120000001")
    user = (await db_session.execute(user_stmt)).scalar_one()
    user.role = UserRole.ADMIN
    await db_session.commit()

    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    now = datetime.now(timezone.utc)
    until = now + timedelta(days=30)

    # 2. Create coupon
    create_payload = {
        "code": "BONNIVO20",
        "coupon_type": "PERCENTAGE",
        "discount_value": 20,
        "max_discount_cap_tomans": 50000,
        "min_order_amount_tomans": 100000,
        "usage_limit": 10,
        "valid_until": until.isoformat(),
    }
    create_res = await client.post("/api/v1/coupons/admin", json=create_payload, headers=headers_admin)
    assert create_res.status_code == 201

    # 3. Customer validates coupon on cart
    cust_token = await get_auth_token(client, "09123334455", "CUSTOMER")
    headers_cust = {"Authorization": f"Bearer {cust_token}"}

    val_res = await client.post(
        "/api/v1/coupons/validate",
        json={"code": "BONNIVO20", "order_amount_tomans": 200000},
        headers=headers_cust,
    )
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["valid"] is True
    assert val_data["discount_amount_tomans"] == 40000  # 20% of 200,000 = 40,000
    assert val_data["final_amount_tomans"] == 160000

    # 4. CRITICAL RULE: Coupon was NOT burned simply by validating on cart!
    coupon_db = (await db_session.execute(select(Coupon).where(Coupon.code == "BONNIVO20"))).scalar_one()
    assert coupon_db.remaining_usage == 10  # Still 10!

    # 5. Burn coupon upon payment confirmation
    cust_user = (await db_session.execute(select(User).where(User.phone_number == "09123334455"))).scalar_one()
    test_order = Order(
        user_id=cust_user.id,
        total_amount_tomans=160000,
        discount_amount_tomans=40000,
        coupon_code="BONNIVO20",
        status=OrderStatus.PAYMENT_PENDING,
        fulfillment_stage=FulfillmentStage.CONFIRMED,
    )
    db_session.add(test_order)
    await db_session.commit()

    burn_res = await client.post(
        f"/api/v1/coupons/burn?coupon_code=BONNIVO20&order_id={test_order.id}",
        headers=headers_cust,
    )
    assert burn_res.status_code == 200
    await db_session.refresh(coupon_db)
    assert coupon_db.remaining_usage == 9  # Decremented only upon payment!


@pytest.mark.asyncio
async def test_appointment_cancellation_tiered_refund_to_wallet(client: AsyncClient, db_session):
    # Setup Customer
    token = await get_auth_token(client, "09124445566", "CUSTOMER")
    headers = {"Authorization": f"Bearer {token}"}

    # Create Pet
    pet_res = await client.post("/api/v1/pets", json={"name": "تدی", "species": "DOG", "breed": "شیتزو"}, headers=headers)
    pet_id = pet_res.json()["id"]

    # Get Clinic & Vet
    clinics_res = await client.get("/api/v1/vets/clinics")
    clinic = clinics_res.json()[0]
    detail_res = await client.get(f"/api/v1/vets/clinics/{clinic['id']}")
    vet = detail_res.json()["veterinarians"][0]

    # 1. Book appointment 24 hours from now (<= 48h -> 20% fee, 80% refund)
    tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
    booking_res = await client.post(
        "/api/v1/vets/appointments",
        json={
            "pet_id": pet_id,
            "clinic_id": clinic["id"],
            "vet_id": vet["id"],
            "appointment_date": tomorrow,
            "timeslot": "16:00 - 16:30",
            "reason_for_visit": "چکاپ عمومی",
        },
        headers=headers,
    )
    assert booking_res.status_code == 201
    appt_id = booking_res.json()["id"]
    fee = booking_res.json()["total_fee_toman"]

    # 2. Cancel appointment
    cancel_res = await client.put(f"/api/v1/vets/appointments/{appt_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200
    cancel_data = cancel_res.json()
    assert cancel_data["success"] is True
    assert cancel_data["cancellation_fee_toman"] == int(fee * 0.20)
    assert cancel_data["refund_amount_toman"] == int(fee * 0.80)
    assert cancel_data["wallet_credited"] is True

    # 3. Verify user's wallet was credited
    wallet_res = await client.get("/api/v1/wallet/me", headers=headers)
    assert wallet_res.status_code == 200
    wallet_data = wallet_res.json()
    assert wallet_data["balance_tomans"] == int(fee * 0.80)
    assert len(wallet_data["transactions"]) == 1
    assert wallet_data["transactions"][0]["transaction_type"] == "CREDIT_REFUND"


@pytest.mark.asyncio
async def test_wallet_withdrawal_lifecycle(client: AsyncClient, db_session):
    # Customer with balance
    cust_token = await get_auth_token(client, "09125556677", "CUSTOMER")
    headers_cust = {"Authorization": f"Bearer {cust_token}"}

    # Admin
    admin_token = await get_auth_token(client, "09120000002", "ADMIN")
    from src.models.user import User
    from sqlalchemy import select
    user = (await db_session.execute(select(User).where(User.phone_number == "09120000002"))).scalar_one()
    user.role = UserRole.ADMIN
    await db_session.commit()
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # Add funds to user wallet
    from src.api.v1.wallet import get_or_create_wallet
    cust_user = (await db_session.execute(select(User).where(User.phone_number == "09125556677"))).scalar_one()
    wallet = await get_or_create_wallet(cust_user.id, db_session)
    wallet.balance_tomans = 100000
    await db_session.commit()

    # 1. Customer requests withdrawal
    withdraw_res = await client.post(
        "/api/v1/wallet/withdraw",
        json={"amount_tomans": 50000, "card_number": "6037991122334455"},
        headers=headers_cust,
    )
    assert withdraw_res.status_code == 200
    withdraw_id = withdraw_res.json()["id"]
    assert withdraw_res.json()["status"] == "REQUESTED"

    # Verify wallet deducted
    await db_session.refresh(wallet)
    assert wallet.balance_tomans == 50000

    # 2. Admin processes and rejects withdrawal -> funds refunded back to wallet
    proc_res = await client.post(
        f"/api/v1/wallet/admin/withdrawals/{withdraw_id}/process",
        json={"status": "REJECTED", "admin_note": "شماره شبا نامعتبر است"},
        headers=headers_admin,
    )
    assert proc_res.status_code == 200
    assert proc_res.json()["status"] == "REJECTED"

    await db_session.refresh(wallet)
    assert wallet.balance_tomans == 100000  # Refunded!


@pytest.mark.asyncio
async def test_platform_feature_flags_server_enforcement(client: AsyncClient, db_session):
    # 1. Fetch public feature flags
    flags_res = await client.get("/api/v1/feature-flags")
    assert flags_res.status_code == 200
    flags = {f["module_key"]: f["is_enabled"] for f in flags_res.json()}
    assert "events" in flags
    assert "shop" in flags
    assert "veterinary" in flags

    # 2. Admin toggles events module off
    admin_token = await get_auth_token(client, "09120000003", "ADMIN")
    from src.models.user import User
    from sqlalchemy import select
    user = (await db_session.execute(select(User).where(User.phone_number == "09120000003"))).scalar_one()
    user.role = UserRole.ADMIN
    await db_session.commit()
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    toggle_res = await client.post(
        "/api/v1/feature-flags/admin/events/toggle",
        json={"is_enabled": False},
        headers=headers_admin,
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_enabled"] is False

    # Check updated dict
    status_res = await client.get("/api/v1/feature-flags/status-dict")
    assert status_res.status_code == 200
    assert status_res.json()["events"] is False


@pytest.mark.asyncio
async def test_event_moderation_and_public_visibility(client: AsyncClient, db_session):
    # 1. Organizer creates event draft
    org_token = await get_auth_token(client, "09127778899", "ORGANIZER")
    headers_org = {"Authorization": f"Bearer {org_token}"}

    event_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    create_res = await client.post(
        "/api/v1/events/organizer/events",
        json={
            "title": "همایش سلامت و تغذیه سگ‌های آپارتمانی",
            "description": "کارگاه آموزشی تخصصی با حضور کارشناسان تغذیه و سلامت حیوانات",
            "event_date": event_date,
            "event_time": "17:00 - 19:30",
            "location_name": "فرهنگسرای نیاوران",
            "address": "تهران، انتهای خیابان پاسداران، روبروی پارک نیاوران",
            "capacity": 30,
            "price_tomans": 0,
        },
        headers=headers_org,
    )
    assert create_res.status_code == 201
    event_id = create_res.json()["event_id"]
    assert create_res.json()["moderation_status"] == "PENDING_REVIEW"

    # 2. Public listing must NOT show pending review event!
    public_res = await client.get("/api/v1/events")
    assert public_res.status_code == 200
    assert not any(e["id"] == event_id for e in public_res.json())

    # 3. Admin moderates and approves event
    admin_token = await get_auth_token(client, "09120000004", "ADMIN")
    from src.models.user import User
    from sqlalchemy import select
    user = (await db_session.execute(select(User).where(User.phone_number == "09120000004"))).scalar_one()
    user.role = UserRole.ADMIN
    await db_session.commit()
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    mod_res = await client.post(
        f"/api/v1/events/admin/{event_id}/moderate",
        json={"status": "APPROVED", "admin_notes": "محتوا تایید شد"},
        headers=headers_admin,
    )
    assert mod_res.status_code == 200
    assert mod_res.json()["status"] == "APPROVED"

    # 4. Now event IS publicly visible!
    public_res2 = await client.get("/api/v1/events")
    assert any(e["id"] == event_id for e in public_res2.json())

    # 5. Customer books a ticket
    cust_token = await get_auth_token(client, "09128889900", "CUSTOMER")
    headers_cust = {"Authorization": f"Bearer {cust_token}"}
    book_res = await client.post(
        f"/api/v1/events/{event_id}/book",
        json={"attendee_name": "سحر ابراهیمی", "attendee_phone": "09128889900"},
        headers=headers_cust,
    )
    assert book_res.status_code == 200
    ticket = book_res.json()
    assert "ticket_code" in ticket
    assert ticket["ticket_code"].startswith("BNV-")
    assert ticket["attendee_name"] == "سحر ابراهیمی"


@pytest.mark.asyncio
async def test_admin_product_variants_and_csv_export(client: AsyncClient, db_session):
    admin_token = await get_auth_token(client, "09120000005", "ADMIN")
    from src.models.user import User
    from sqlalchemy import select
    user = (await db_session.execute(select(User).where(User.phone_number == "09120000005"))).scalar_one()
    user.role = UserRole.ADMIN
    await db_session.commit()
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    from src.models.catalog import CanonicalProduct, Category
    from src.models.pet import PetSpecies
    p_stmt = select(CanonicalProduct).limit(1)
    p_res = await db_session.execute(p_stmt)
    product = p_res.scalar_one_or_none()
    if not product:
        cat = Category(slug="dog-food", title_fa="غذای سگ")
        db_session.add(cat)
        await db_session.flush()
        product = CanonicalProduct(
            category_id=cat.id,
            title_fa="غذای خشک سگ بالغ رویال کنین",
            slug="royal-canin-adult-dog-food",
            brand="Royal Canin",
            target_species=PetSpecies.DOG,
            price_tomans=350000,
            stock_quantity=20,
            is_active=True,
        )
        db_session.add(product)
        await db_session.commit()
        await db_session.refresh(product)

    # 1. Create product variant (e.g. 2kg weight)
    var_res = await client.post(
        f"/api/v1/admin/products/{product.id}/variants",
        json={
            "title_fa": "بسته ۲ کیلوگرم اقتصادی",
            "weight_grams": 2000,
            "price_tomans": 480000,
            "stock_quantity": 15,
            "lead_time_days": 1,
        },
        headers=headers_admin,
    )
    assert var_res.status_code == 200
    var_id = var_res.json()["variant_id"]

    # 2. Check catalog API returns the variant
    cat_res = await client.get(f"/api/v1/catalog/products/{product.slug}")
    assert cat_res.status_code == 200
    assert any(v["id"] == var_id for v in cat_res.json()["variants"])

    # 3. Export CSV with UTF-8 BOM
    csv_res = await client.get("/api/v1/admin/products/export-csv", headers=headers_admin)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "bonnivo_catalog_export.csv" in csv_res.headers["content-disposition"]
    # Check UTF-8 BOM is present
    assert csv_res.content.startswith(b"\xef\xbb\xbf")
