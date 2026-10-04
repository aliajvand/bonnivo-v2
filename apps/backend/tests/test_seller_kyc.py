import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from src.main import app
from src.core.database import get_db
from src.core.security import create_access_token
from src.models.user import User, UserRole
from src.models.catalog import Seller


@pytest.mark.asyncio
async def test_seller_kyc_registration_and_state_machine(db_session: AsyncSession):
    # Setup normal applicant user and admin user
    applicant = User(phone_number="09123330011", role=UserRole.PET_PARENT)
    admin = User(phone_number="09129990000", role=UserRole.ADMIN)
    db_session.add_all([applicant, admin])
    await db_session.commit()

    token_applicant = create_access_token({"sub": applicant.id, "phone": applicant.phone_number, "role": applicant.role.value})
    token_admin = create_access_token({"sub": admin.id, "phone": admin.phone_number, "role": admin.role.value})

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Invalid Sheba format test
        invalid_payload = {
            "store_name_fa": "پت‌شاپ نمونه",
            "national_id": "0012345678",
            "sheba_number": "12345",  # Invalid
            "phone_number": "09123330011",
            "address": "تهران، میرداماد",
            "city": "Tehran",
        }
        res_invalid = await ac.post(
            "/api/v1/sellers/register",
            json=invalid_payload,
            headers={"Authorization": f"Bearer {token_applicant}"},
        )
        assert res_invalid.status_code == 422

        # 2. Valid Registration
        valid_payload = {
            "store_name_fa": "پت‌شاپ نمونه میرداماد",
            "national_id": "0012345678",
            "sheba_number": "IR123456789012345678901234",
            "phone_number": "09123330011",
            "address": "تهران، میردامad، پلاک ۱۲",
            "city": "Tehran",
        }
        res_reg = await ac.post(
            "/api/v1/sellers/register",
            json=valid_payload,
            headers={"Authorization": f"Bearer {token_applicant}"},
        )
        assert res_reg.status_code == 201
        seller_data = res_reg.json()
        seller_id = seller_data["id"]
        assert seller_data["status"] == "UNDER_REVIEW"
        assert seller_data["is_verified"] is False

        # 3. Security: Normal user attempts to self-approve
        res_unauth = await ac.patch(
            f"/api/v1/sellers/{seller_id}/status",
            json={"status": "APPROVED"},
            headers={"Authorization": f"Bearer {token_applicant}"},
        )
        assert res_unauth.status_code == 403

        # 4. Invalid State Transition: UNDER_REVIEW -> SUSPENDED (not allowed)
        res_bad_trans = await ac.patch(
            f"/api/v1/sellers/{seller_id}/status",
            json={"status": "SUSPENDED"},
            headers={"Authorization": f"Bearer {token_admin}"},
        )
        assert res_bad_trans.status_code == 400

        # 5. Valid State Transition: UNDER_REVIEW -> APPROVED by Admin
        res_approve = await ac.patch(
            f"/api/v1/sellers/{seller_id}/status",
            json={"status": "APPROVED"},
            headers={"Authorization": f"Bearer {token_admin}"},
        )
        assert res_approve.status_code == 200
        approved_data = res_approve.json()
        assert approved_data["status"] == "APPROVED"
        assert approved_data["is_verified"] is True

        # Verify applicant's User role promoted to SELLER
        await db_session.refresh(applicant)
        assert applicant.role == UserRole.SELLER

    app.dependency_overrides.clear()
