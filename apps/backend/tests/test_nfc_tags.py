import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.pet import Pet, PetSpecies, PetSex


async def get_user_token(client: AsyncClient, phone: str) -> str:
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    from src.services.sms import default_sms_provider, StubSmsAdapter
    assert isinstance(default_sms_provider, StubSmsAdapter)
    code = default_sms_provider.sent_otps[phone]
    res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_nfc_provision_claim_and_resolve(client: AsyncClient, db_session: AsyncSession):
    token = await get_user_token(client, "09129990001")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a pet for the user
    pet_res = await client.post(
        "/api/v1/pets",
        headers=headers,
        json={
            "name": "راکی",
            "species": "DOG",
            "breed": "هاسکی سیبری",
            "sex": "MALE",
        },
    )
    assert pet_res.status_code == 201
    pet_id = pet_res.json()["id"]

    # 2. Factory provisioning of an NTAG213 collar tag
    hardware_uid = "04:5A:2B:8C:9D:1E:0F"
    prov_res = await client.post(
        "/api/v1/nfc/provision",
        headers=headers,
        json={"hardware_uid": hardware_uid},
    )
    assert prov_res.status_code == 201
    tag_data = prov_res.json()
    assert tag_data["hardware_uid"] == hardware_uid
    assert tag_data["is_claimed"] is False
    hardware_token = tag_data["hardware_token"]
    tag_id = tag_data["id"]

    # 3. Before claim, public tap returns UNCLAIMED
    unclaimed_res = await client.get(f"/api/v1/nfc/resolve/{hardware_token}")
    assert unclaimed_res.status_code == 200
    assert unclaimed_res.json()["status"] == "UNCLAIMED"

    # 4. User claims the NFC collar tag to their pet
    claim_res = await client.post(
        "/api/v1/nfc/claim",
        headers=headers,
        json={
            "hardware_uid": hardware_uid,
            "pet_id": pet_id,
        },
    )
    assert claim_res.status_code == 200
    claimed_data = claim_res.json()
    assert claimed_data["is_claimed"] is True
    assert claimed_data["pet_id"] == pet_id

    # 5. Public NFC tap resolves pet emergency profile
    resolve_res = await client.get(f"/api/v1/nfc/resolve/{hardware_token}")
    assert resolve_res.status_code == 200
    resolve_data = resolve_res.json()
    assert resolve_data["status"] == "ACTIVE"
    assert resolve_data["pet"]["name"] == "راکی"
    assert resolve_data["pet"]["breed"] == "هاسکی سیبری"
    assert resolve_data["is_lost"] is False

    # 6. IDOR Guard: User 2 cannot claim or revoke User 1's tag
    user2_token = await get_user_token(client, "09129990002")
    user2_headers = {"Authorization": f"Bearer {user2_token}"}
    
    # User 2 tries to claim User 1's already claimed tag for their own pet
    user2_pet_res = await client.post(
        "/api/v1/pets",
        headers=user2_headers,
        json={"name": "بلا", "species": "CAT", "breed": "پرشین", "sex": "FEMALE"},
    )
    user2_pet_id = user2_pet_res.json()["id"]

    dup_claim_res = await client.post(
        "/api/v1/nfc/claim",
        headers=user2_headers,
        json={"hardware_uid": hardware_uid, "pet_id": user2_pet_id},
    )
    assert dup_claim_res.status_code == 409

    # User 2 tries to revoke User 1's tag
    revoke_idor_res = await client.post(f"/api/v1/nfc/{tag_id}/revoke", headers=user2_headers)
    assert revoke_idor_res.status_code == 403

    # 7. Legitimate owner revokes the tag
    revoke_res = await client.post(f"/api/v1/nfc/{tag_id}/revoke", headers=headers)
    assert revoke_res.status_code == 200
    assert revoke_res.json()["is_revoked"] is True

    # After revocation, public tap returns revoked status
    post_revoke_res = await client.get(f"/api/v1/nfc/resolve/{hardware_token}")
    assert post_revoke_res.status_code == 200
    assert post_revoke_res.json()["status"] == "REVOKED_OR_INVALID"
