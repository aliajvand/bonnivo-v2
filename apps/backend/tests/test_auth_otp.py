import pytest
from httpx import AsyncClient
from src.services.sms import default_sms_provider, StubSmsAdapter


@pytest.mark.asyncio
async def test_otp_flow_complete(client: AsyncClient):
    phone = "09123456789"

    # 1. Request OTP
    req_res = await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    assert req_res.status_code == 200
    assert req_res.json()["success"] is True

    # Check that SMS stub captured the code
    assert isinstance(default_sms_provider, StubSmsAdapter)
    sent_code = default_sms_provider.sent_otps.get(phone)
    assert sent_code is not None
    assert len(sent_code) == 5

    # 2. Try invalid code
    bad_res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": "00000"})
    assert bad_res.status_code == 400

    # 3. Verify with correct code
    verify_res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": sent_code})
    assert verify_res.status_code == 200
    token_data = verify_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    assert token_data["user"]["phone_number"] == phone
    assert token_data["user"]["role"] == "PET_PARENT"

    # 4. Access authenticated /me endpoint
    me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["phone_number"] == phone
    assert me_data["role"] == "PET_PARENT"


@pytest.mark.asyncio
async def test_otp_invalid_phone_format(client: AsyncClient):
    # Invalid Iranian phone format (must be 09...)
    res = await client.post("/api/v1/auth/otp/request", json={"phone_number": "123456"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_otp_rate_limiting(client: AsyncClient):
    phone = "09998887766"
    # Make 3 requests (within limit)
    for _ in range(3):
        res = await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
        assert res.status_code == 200

    # 4th request must be blocked with 429
    blocked_res = await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    assert blocked_res.status_code == 429


@pytest.mark.asyncio
async def test_qa_account_deterministic_login(client: AsyncClient):
    # Persona 1: Customer (09120000001)
    qa_phone = "09120000001"
    req_res = await client.post("/api/v1/auth/otp/request", json={"phone_number": qa_phone})
    assert req_res.status_code == 200

    # Deterministic QA OTP is 12345
    verify_res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": qa_phone, "code": "12345"})
    assert verify_res.status_code == 200
    data = verify_res.json()
    assert data["user"]["phone_number"] == qa_phone
    assert data["user"]["full_name"] == "سارا محمدی (مشتری تستی)"
    assert "access_token" in data


def test_production_fail_fast_config_validation():
    from src.core.config import Settings
    import pytest

    # Fail-fast: In production, DEBUG=True, default JWT, or ALLOW_QA_ACCOUNTS must raise ValueError
    with pytest.raises(ValueError, match="CRITICAL PRODUCTION SECURITY VIOLATIONS DETECTED"):
        Settings(
            APP_ENV="production",
            DEBUG=True,
            JWT_SECRET="short",
            ALLOW_QA_ACCOUNTS=True,
            DEMO_MODE=True,
            COOKIE_SECURE=False,
        )


@pytest.mark.asyncio
async def test_sms_ir_adapter_contract():
    from src.services.sms import SmsIrAdapter
    adapter = SmsIrAdapter()
    # Missing credentials / template should safely return True simulated without crashing
    res = await adapter.send_otp("09123456789", "12345")
    assert res is True

