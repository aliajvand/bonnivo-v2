import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


async def get_user_token(client: AsyncClient, phone: str) -> str:
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    from src.services.sms import default_sms_provider, StubSmsAdapter
    assert isinstance(default_sms_provider, StubSmsAdapter)
    code = default_sms_provider.sent_otps[phone]
    res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_ethical_adoption_lifecycle_and_rules(client: AsyncClient, db_session: AsyncSession):
    publisher_token = await get_user_token(client, "09125550001")
    pub_headers = {"Authorization": f"Bearer {publisher_token}"}

    # 1. Test commercial fee prohibition: Listing with fee > 0 MUST fail
    commercial_payload = {
        "pet_name": "پاپی",
        "species": "DOG",
        "breed": "پامرانین خرسی",
        "age_months": 3,
        "description": "فروش توله پامرانین اصیل و وارداتی",
        "adoption_fee_tomans": 15000000, # 15 Million Tomans commercial sale
    }
    comm_res = await client.post("/api/v1/adoption/listings", headers=pub_headers, json=commercial_payload)
    assert comm_res.status_code == 400
    assert "خرید و فروش تجاری حیوانات" in comm_res.json()["detail"]

    # 2. Publish valid ethical adoption listing (fee = 0)
    ethical_payload = {
        "pet_name": "لئو",
        "species": "CAT",
        "breed": "DSH عقیم شده",
        "age_months": 10,
        "sex": "MALE",
        "description": "لئو بسیار مهربان و اجتماعی است. به فرد متعهد دارای سابقه نگهداری واگذار می‌شود.",
        "city": "تهران",
        "district": 3,
        "health_status": "واکسینه و عقیم‌شده",
        "vaccination_status": "کامل",
        "is_neutered": True,
        "adoption_fee_tomans": 0,
    }
    create_res = await client.post("/api/v1/adoption/listings", headers=pub_headers, json=ethical_payload)
    assert create_res.status_code == 201
    listing = create_res.json()
    assert listing["adoption_fee_tomans"] == 0
    assert listing["status"] == "AVAILABLE"
    listing_id = listing["id"]

    # 3. Explore public listings
    list_res = await client.get("/api/v1/adoption/listings?species=CAT")
    assert list_res.status_code == 200
    assert any(item["id"] == listing_id for item in list_res.json())

    # 4. Publisher cannot apply to their own listing
    self_app_res = await client.post(
        "/api/v1/adoption/applications",
        headers=pub_headers,
        json={
            "listing_id": listing_id,
            "applicant_name": "خودم",
            "applicant_phone": "09125550001",
            "motivation": "می‌خواهم پت خودم را دوباره بگیرم!",
        },
    )
    assert self_app_res.status_code == 400

    # 5. Prospective guardian submits application
    applicant_token = await get_user_token(client, "09125550002")
    app_headers = {"Authorization": f"Bearer {applicant_token}"}

    valid_app_payload = {
        "listing_id": listing_id,
        "applicant_name": "سارا تهرانی",
        "applicant_phone": "09125550002",
        "experience_years": 4,
        "has_other_pets": False,
        "housing_type": "آپارتمان با پنجره‌های توری‌دار",
        "motivation": "سابقه نگهداری گربه دارم و شرایط محیطی کاملاً امن و پر از محبت را برای لئو فراهم می‌کنم.",
    }
    apply_res = await client.post("/api/v1/adoption/applications", headers=app_headers, json=valid_app_payload)
    assert apply_res.status_code == 201
    application = apply_res.json()
    assert application["status"] == "PENDING"
    app_id = application["id"]

    # Prevent duplicate pending application
    dup_app_res = await client.post("/api/v1/adoption/applications", headers=app_headers, json=valid_app_payload)
    assert dup_app_res.status_code == 409

    # 6. IDOR Guard: Applicant cannot review application
    idor_review = await client.put(f"/api/v1/adoption/applications/{app_id}/review", headers=app_headers, json={"action": "APPROVED"})
    assert idor_review.status_code == 403

    # 7. Publisher reviews and approves application
    approve_res = await client.put(f"/api/v1/adoption/applications/{app_id}/review", headers=pub_headers, json={"action": "APPROVED"})
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

    # Verify listing status transitioned to ADOPTED
    apps_list = await client.get(f"/api/v1/adoption/listings/{listing_id}/applications", headers=pub_headers)
    assert apps_list.status_code == 200
    assert len(apps_list.json()) == 1
