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
async def test_amber_alert_broadcast_and_resolve(client: AsyncClient, db_session: AsyncSession):
    token = await get_user_token(client, "09128880001")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create pet
    pet_res = await client.post(
        "/api/v1/pets",
        headers=headers,
        json={"name": "فندق", "species": "DOG", "breed": "شیتزو", "sex": "MALE"},
    )
    assert pet_res.status_code == 201
    pet_id = pet_res.json()["id"]

    # 2. Trigger geo-fenced Amber Alert in District 2 (Sa'adat Abad)
    alert_payload = {
        "pet_id": pet_id,
        "last_seen_latitude": 35.7831,
        "last_seen_longitude": 51.3712,
        "district": 2,
        "details": "فندق در پارک پرواز سعادت‌آباد گم شده است. دارای قلاده قرمز رنگ است.",
        "contact_phone": "09128880001",
        "radius_km": 3.0,
    }

    broadcast_res = await client.post("/api/v1/lost-pet/broadcast", headers=headers, json=alert_payload)
    assert broadcast_res.status_code == 201
    alert_data = broadcast_res.json()
    assert alert_data["pet_id"] == pet_id
    assert alert_data["district"] == 2
    assert alert_data["status"] == "ACTIVE"
    assert alert_data["broadcast_recipient_count"] >= 12
    alert_id = alert_data["id"]

    # Check pet status was updated to is_lost = True
    pet_check = await client.get(f"/api/v1/pets/{pet_id}", headers=headers)
    assert pet_check.status_code == 200
    assert pet_check.json()["is_lost"] is True
    assert "پارک پرواز" in pet_check.json()["lost_alert_message"]

    # 3. Public community list displays active alert
    feed_res = await client.get("/api/v1/lost-pet/active-alerts?district=2")
    assert feed_res.status_code == 200
    feed_items = feed_res.json()
    assert any(item["id"] == alert_id for item in feed_items)

    # 4. IDOR Protection: User 2 cannot resolve User 1's alert
    user2_token = await get_user_token(client, "09128880002")
    user2_headers = {"Authorization": f"Bearer {user2_token}"}
    resolve_idor_res = await client.post(f"/api/v1/lost-pet/{alert_id}/resolve", headers=user2_headers)
    assert resolve_idor_res.status_code == 403

    # 5. Legitimate owner resolves the alert
    resolve_res = await client.post(f"/api/v1/lost-pet/{alert_id}/resolve", headers=headers)
    assert resolve_res.status_code == 200

    # Verify pet is restored to normal status
    pet_restored = await client.get(f"/api/v1/pets/{pet_id}", headers=headers)
    assert pet_restored.status_code == 200
    assert pet_restored.json()["is_lost"] is False
    assert pet_restored.json()["lost_alert_message"] is None
