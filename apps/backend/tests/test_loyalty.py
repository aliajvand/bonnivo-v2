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
async def test_paw_points_gamification_and_voucher_redemption(client: AsyncClient, db_session: AsyncSession):
    token = await get_user_token(client, "09126660001")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Initial balance should be 0
    balance_res = await client.get("/api/v1/loyalty/balance", headers=headers)
    assert balance_res.status_code == 200
    assert balance_res.json()["total_points"] == 0

    # 2. Reward 7-day care streak (+50 points)
    reward_res = await client.post(
        "/api/v1/loyalty/reward-streak",
        headers=headers,
        json={"milestone": "7_DAYS", "cycle_date": "2026-W40"},
    )
    assert reward_res.status_code == 200
    assert reward_res.json()["points_awarded"] == 50

    # Idempotency test: claiming the same streak cycle twice must return 409
    dup_res = await client.post(
        "/api/v1/loyalty/reward-streak",
        headers=headers,
        json={"milestone": "7_DAYS", "cycle_date": "2026-W40"},
    )
    assert dup_res.status_code == 409

    # 3. Reward 30-day golden care streak (+250 points)
    reward30_res = await client.post(
        "/api/v1/loyalty/reward-streak",
        headers=headers,
        json={"milestone": "30_DAYS", "cycle_date": "2026-M10"},
    )
    assert reward30_res.status_code == 200
    assert reward30_res.json()["points_awarded"] == 250

    # Total points should now be 50 + 250 = 300
    balance_res2 = await client.get("/api/v1/loyalty/balance", headers=headers)
    assert balance_res2.status_code == 200
    assert balance_res2.json()["total_points"] == 300

    # 4. Try redeeming more points than available -> 400 Bad Request
    fail_redeem = await client.post(
        "/api/v1/loyalty/redeem-voucher",
        headers=headers,
        json={"points_to_spend": 500},
    )
    assert fail_redeem.status_code == 400

    # 5. Redeem 100 points for a 50,000 Tomans checkout discount voucher
    redeem_res = await client.post(
        "/api/v1/loyalty/redeem-voucher",
        headers=headers,
        json={"points_to_spend": 100},
    )
    assert redeem_res.status_code == 201
    voucher = redeem_res.json()
    assert voucher["discount_tomans"] == 50000
    assert voucher["points_spent"] == 100
    assert voucher["code"].startswith("PAW-")
    assert voucher["is_redeemed"] is False

    # 6. Verify ledger balance decremented to 300 - 100 = 200
    final_balance = await client.get("/api/v1/loyalty/balance", headers=headers)
    assert final_balance.status_code == 200
    assert final_balance.json()["total_points"] == 200
    assert final_balance.json()["active_vouchers_count"] == 1
