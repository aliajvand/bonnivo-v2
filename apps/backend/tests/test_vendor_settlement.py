import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.catalog import Seller


async def get_user_token(client: AsyncClient, phone: str) -> str:
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    from src.services.sms import default_sms_provider, StubSmsAdapter
    assert isinstance(default_sms_provider, StubSmsAdapter)
    code = default_sms_provider.sent_otps[phone]
    res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_vendor_settlement_ledger_and_invariants(client: AsyncClient, db_session: AsyncSession):
    # 1. Setup Seller User and Attacker User
    token_seller = await get_user_token(client, "09125550011")
    token_other = await get_user_token(client, "09125550022")
    headers_seller = {"Authorization": f"Bearer {token_seller}"}
    headers_other = {"Authorization": f"Bearer {token_other}"}

    me_res = await client.get("/api/v1/auth/me", headers=headers_seller)
    seller_user_id = me_res.json()["id"]

    seller = Seller(
        user_id=seller_user_id,
        store_name_fa="پت‌شاپ آریا ونک",
        slug="aria-vanak-pet",
        national_id="0011223344",
        sheba_number="IR900120000000001234567890",
        phone_number="02188771122",
        city="تهران",
        address="تهران، میدان ونک، خیابان ملاصدرا",
        is_verified=True,
    )
    db_session.add(seller)
    await db_session.commit()

    # 2. IDOR TEST: Other user tries to calculate settlement for Seller
    settlement_payload = {
        "seller_id": seller.id,
        "gross_sales_toman": 10000000,  # 10 Million Toman
        "iban_sheba": "IR900120000000001234567890",
    }
    idor_res = await client.post("/api/v1/settlements/calculate", json=settlement_payload, headers=headers_other)
    assert idor_res.status_code == 403

    # 3. Authorized Seller calculates settlement
    res_calc = await client.post("/api/v1/settlements/calculate", json=settlement_payload, headers=headers_seller)
    assert res_calc.status_code == 201
    settlement_data = res_calc.json()

    # 4. Accounting Invariant Assertions:
    gross = settlement_data["gross_sales_toman"]
    comm = settlement_data["platform_commission_toman"]
    tax = settlement_data["tax_withholding_toman"]
    net = settlement_data["net_payout_toman"]

    assert gross == 10000000
    assert comm == 1000000   # 10%
    assert tax == 90000      # 9% on 1,000,000
    assert net == 8910000    # 10,000,000 - 1,000,000 - 90,000
    assert (comm + tax + net) == gross  # Zero leakage invariant!

    assert "PAYA-" in settlement_data["paya_reference_id"]
    assert settlement_data["status"] == "PAYA_SUBMITTED"

    # 5. List My Settlements
    list_res = await client.get("/api/v1/settlements/my", headers=headers_seller)
    assert list_res.status_code == 200
    my_records = list_res.json()
    assert len(my_records) >= 1
    assert any(r["id"] == settlement_data["id"] for r in my_records)
