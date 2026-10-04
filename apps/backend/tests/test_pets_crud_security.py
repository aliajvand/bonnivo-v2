import pytest
from httpx import AsyncClient


async def get_user_token(client: AsyncClient, phone: str) -> str:
    # 1. Request OTP
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    from src.services.sms import default_sms_provider, StubSmsAdapter
    assert isinstance(default_sms_provider, StubSmsAdapter)
    code = default_sms_provider.sent_otps[phone]
    # 2. Verify OTP
    res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_pet_crud_and_idor_protection(client: AsyncClient):
    # Setup User A and User B
    token_a = await get_user_token(client, "09111111111")
    token_b = await get_user_token(client, "09222222222")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. User A creates Pet A (Milo)
    pet_payload = {
        "name": "میلو",
        "species": "DOG",
        "breed": "گلدن رتریور",
        "sex": "MALE",
        "weight_kg": 28.5,
        "is_neutered": True,
        "daily_food_grams": 350.0,
        "dietary_preferences": "غذای خشک بدون گلوتن",
    }
    create_res = await client.post("/api/v1/pets", json=pet_payload, headers=headers_a)
    assert create_res.status_code == 201
    pet_a = create_res.json()
    assert pet_a["name"] == "میلو"
    assert "qr_passport_token" in pet_a
    pet_id = pet_a["id"]

    # 2. User A lists pets and finds Milo
    list_res = await client.get("/api/v1/pets", headers=headers_a)
    assert list_res.status_code == 200
    pets_a = list_res.json()
    assert len(pets_a) >= 1
    assert any(p["id"] == pet_id for p in pets_a)

    # 3. IDOR TEST: User B attempts to read Pet A
    get_res_b = await client.get(f"/api/v1/pets/{pet_id}", headers=headers_b)
    assert get_res_b.status_code == 403
    assert "Forbidden" in get_res_b.json()["detail"]

    # 4. IDOR TEST: User B attempts to update Pet A
    update_res_b = await client.put(f"/api/v1/pets/{pet_id}", json={"name": "Hacked"}, headers=headers_b)
    assert update_res_b.status_code == 403

    # 5. IDOR TEST: User B attempts to delete Pet A
    delete_res_b = await client.delete(f"/api/v1/pets/{pet_id}", headers=headers_b)
    assert delete_res_b.status_code == 403

    # 6. User A updates Pet A
    update_res_a = await client.put(f"/api/v1/pets/{pet_id}", json={"weight_kg": 29.0}, headers=headers_a)
    assert update_res_a.status_code == 200
    assert update_res_a.json()["weight_kg"] == 29.0

    # 7. User A deletes Pet A
    delete_res_a = await client.delete(f"/api/v1/pets/{pet_id}", headers=headers_a)
    assert delete_res_a.status_code == 200

    # Verify Pet A is gone
    get_gone = await client.get(f"/api/v1/pets/{pet_id}", headers=headers_a)
    assert get_gone.status_code == 404
