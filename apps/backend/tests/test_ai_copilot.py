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
async def test_ai_copilot_biometric_streaming(client: AsyncClient):
    token_a = await get_user_token(client, "09123332211")
    token_b = await get_user_token(client, "09128887766")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. Create Pet for User A
    pet_res = await client.post(
        "/api/v1/pets",
        json={
            "name": "ژیکو",
            "species": "DOG",
            "breed": "هاسکی سیبری",
            "sex": "MALE",
            "weight_kg": 24.0,
            "is_neutered": False,
            "daily_food_grams": 380.0,
        },
        headers=headers_a,
    )
    assert pet_res.status_code == 201
    pet_id = pet_res.json()["id"]

    # 2. IDOR TEST: User B tries to query copilot for Pet A
    chat_payload = {
        "pet_id": pet_id,
        "message": "میزان غذای مناسب برای وزن پت من چقدر است؟",
    }
    idor_res = await client.post("/api/v1/ai-copilot/chat", json=chat_payload, headers=headers_b)
    assert idor_res.status_code == 403

    # 3. User A queries copilot -> verify SSE streaming response
    stream_res = await client.post("/api/v1/ai-copilot/chat", json=chat_payload, headers=headers_a)
    assert stream_res.status_code == 200
    assert "text/event-stream" in stream_res.headers.get("content-type", "")

    body = stream_res.text
    assert "data:" in body
    assert "[DONE]" in body
    # Grounding check: response must reference pet's name and weight or food
    assert "ژیکو" in body
    assert "۲۴" in body or "24" in body or "گرم" in body
