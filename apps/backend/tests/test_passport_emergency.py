import pytest
from httpx import AsyncClient
from tests.test_pets_crud_security import get_user_token
from src.services.sms import default_sms_provider, StubSmsAdapter


@pytest.mark.asyncio
async def test_passport_token_and_emergency_api(client: AsyncClient):
    # 1. User registers and creates Pet
    token = await get_user_token(client, "09123334455")
    headers = {"Authorization": f"Bearer {token}"}

    pet_res = await client.post(
        "/api/v1/pets",
        json={
            "name": "برفی",
            "species": "CAT",
            "breed": "پرشین",
            "dietary_preferences": "فوق‌العاده حساس به ماهی (اطلاعات خصوصی)",
        },
        headers=headers,
    )
    assert pet_res.status_code == 201
    pet_data = pet_res.json()
    qr_token = pet_data["qr_passport_token"]

    # 2. Token Entropy Check
    assert len(qr_token) >= 40
    assert qr_token.startswith("bny_")

    # 3. Public Passport Access (ZERO AUTH)
    public_res = await client.get(f"/api/v1/passport/{qr_token}")
    assert public_res.status_code == 200
    passport_data = public_res.json()
    assert passport_data["pet_name"] == "برفی"
    assert passport_data["species"] == "CAT"
    assert passport_data["is_lost"] is False
    assert passport_data["masked_owner_phone"] == "0912***4455"

    # Privacy Protection Check: private data MUST NOT be exposed
    assert "dietary_preferences" not in passport_data
    assert "user_id" not in passport_data
    assert "health_book_image_url" not in passport_data

    # 4. Finder Contact Dispatch
    contact_res = await client.post(
        f"/api/v1/passport/{qr_token}/contact",
        json={"finder_name": "علی رضایی", "location_note": "پارک ملت، روبروی آب‌نما"},
    )
    assert contact_res.status_code == 200
    assert isinstance(default_sms_provider, StubSmsAdapter)
    assert len(default_sms_provider.sent_templates) >= 1
    last_sent = default_sms_provider.sent_templates[-1]
    assert last_sent["phone"] == "09123334455"
    assert last_sent["template"] == "LOST_PET_SCAN_ALERT"


@pytest.mark.asyncio
async def test_passport_rate_limiting(client: AsyncClient):
    token = await get_user_token(client, "09125556677")
    pet_res = await client.post(
        "/api/v1/pets",
        json={"name": "فندق", "species": "BIRD", "breed": "عروس هلندی"},
        headers={"Authorization": f"Bearer {token}"},
    )
    qr_token = pet_res.json()["qr_passport_token"]

    # Request 10 times (within rate limit)
    for _ in range(10):
        res = await client.get(f"/api/v1/passport/{qr_token}")
        assert res.status_code == 200

    # 11th request must be rejected with 429
    blocked = await client.get(f"/api/v1/passport/{qr_token}")
    assert blocked.status_code == 429
    assert "Rate limit exceeded" in blocked.json()["detail"]


@pytest.mark.asyncio
async def test_passport_emergency_sighting(client: AsyncClient):
    token = await get_user_token(client, "09127778899")
    pet_res = await client.post(
        "/api/v1/pets",
        json={"name": "تدی", "species": "DOG", "breed": "گلدن رتریور"},
        headers={"Authorization": f"Bearer {token}"},
    )
    qr_token = pet_res.json()["qr_passport_token"]

    sighting_res = await client.post(
        f"/api/v1/passport/{qr_token}/emergency-sighting",
        json={
            "latitude": 35.7981,
            "longitude": 51.4293,
            "address_description": "میدان تجریش، ابتدای خیابان فناخسرو",
            "finder_phone": "09129990000",
        },
    )
    assert sighting_res.status_code == 200
    data = sighting_res.json()
    assert data["success"] is True
    assert "35.798100,51.429300" in data["mapsUrl"]
    assert "تدی" in data["message"]

