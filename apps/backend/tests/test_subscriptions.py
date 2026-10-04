import pytest
from httpx import AsyncClient


async def get_user_token(client: AsyncClient, phone: str) -> str:
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    from src.services.sms import default_sms_provider, StubSmsAdapter
    assert isinstance(default_sms_provider, StubSmsAdapter)
    code = default_sms_provider.sent_otps[phone]
    res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_auto_replenish_subscriptions_lifecycle(client: AsyncClient):
    token_a = await get_user_token(client, "09127778899")
    token_b = await get_user_token(client, "09126665544")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Create Pet for User A
    pet_res = await client.post(
        "/api/v1/pets",
        json={
            "name": "بارفی",
            "species": "CAT",
            "breed": "پرشین",
            "sex": "MALE",
            "weight_kg": 4.5,
            "is_neutered": True,
            "daily_food_grams": 60.0,
        },
        headers=headers_a,
    )
    assert pet_res.status_code == 201
    pet_id = pet_res.json()["id"]

    # 2. Create Food Subscription
    # 2.0 kg package (2000g) / 60g daily consumption = 33 days duration
    sub_payload = {
        "pet_id": pet_id,
        "product_id": "royal-canin-persian-adult",
        "product_title_fa": "غذای خشک گربه پرشین رویال کنین",
        "weight_variant_text": "۲ کیلوگرم",
        "package_weight_kg": 2.0,
        "daily_consumption_grams": 60.0,
        "unit_price_toman": 1850000,
        "frequency": "MONTHLY",
        "delivery_address": "تهران، شهرک غرب، خیابان مهستان، پلاک ۵",
    }
    create_res = await client.post("/api/v1/subscriptions", json=sub_payload, headers=headers_a)
    assert create_res.status_code == 201
    sub_data = create_res.json()
    sub_id = sub_data["id"]
    assert sub_data["pet_name"] == "بارفی"
    assert sub_data["status"] == "ACTIVE"
    assert sub_data["days_duration"] == 33
    assert sub_data["next_delivery_date"] is not None

    # 3. List my subscriptions
    list_res = await client.get("/api/v1/subscriptions/my", headers=headers_a)
    assert list_res.status_code == 200
    my_subs = list_res.json()
    assert len(my_subs) == 1
    assert my_subs[0]["id"] == sub_id

    # 4. IDOR TEST: User B attempts to pause User A's subscription
    pause_b = await client.put(f"/api/v1/subscriptions/{sub_id}/pause", headers=headers_b)
    assert pause_b.status_code == 403

    # 5. User A pauses subscription
    pause_a = await client.put(f"/api/v1/subscriptions/{sub_id}/pause", headers=headers_a)
    assert pause_a.status_code == 200
    assert pause_a.json()["status"] == "PAUSED"

    # 6. User A resumes subscription
    resume_a = await client.put(f"/api/v1/subscriptions/{sub_id}/resume", headers=headers_a)
    assert resume_a.status_code == 200
    assert resume_a.json()["status"] == "ACTIVE"

    # 7. User A cancels subscription
    cancel_a = await client.put(f"/api/v1/subscriptions/{sub_id}/cancel", headers=headers_a)
    assert cancel_a.status_code == 200
    assert cancel_a.json()["success"] is True
