import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from src.main import app
from src.core.database import get_db
from src.core.security import create_access_token
from src.models.user import User, UserRole
from src.models.catalog import Seller
from src.models.order import Order, OrderStatus


@pytest.mark.asyncio
async def test_admin_seller_verification_and_disputes(db_session: AsyncSession):
    # Setup users
    admin_user = User(phone_number="09120000001", role=UserRole.ADMIN)
    normal_user = User(phone_number="09120000002", role=UserRole.PET_PARENT)
    seller_user = User(phone_number="09120000003", role=UserRole.PET_PARENT)
    db_session.add_all([admin_user, normal_user, seller_user])
    await db_session.flush()

    token_admin = create_access_token({"sub": admin_user.id, "phone": admin_user.phone_number, "role": admin_user.role.value})
    token_normal = create_access_token({"sub": normal_user.id, "phone": normal_user.phone_number, "role": normal_user.role.value})

    # Setup pending seller
    seller = Seller(
        user_id=seller_user.id,
        store_name_fa="پت‌شاپ زیتون",
        slug="zeytoon-pet",
        national_id="0011998877",
        sheba_number="IR9900000000000000000099",
        phone_number="09120000003",
        address="تهران",
        status="UNDER_REVIEW",
        is_verified=False,
    )
    # Setup order with dispute
    order = Order(
        user_id=normal_user.id,
        status=OrderStatus.PAID,
        total_amount_tomans=450000,
        shipping_address="تهران",
    )
    db_session.add_all([seller, order])
    await db_session.commit()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Security Check: Normal user denied access (403 Forbidden)
        res_forbidden = await ac.get(
            "/api/v1/admin/sellers/pending",
            headers={"Authorization": f"Bearer {token_normal}"},
        )
        assert res_forbidden.status_code == 403

        # 2. Admin lists pending sellers
        res_pending = await ac.get(
            "/api/v1/admin/sellers/pending",
            headers={"Authorization": f"Bearer {token_admin}"},
        )
        assert res_pending.status_code == 200
        pending_list = res_pending.json()
        assert len(pending_list) >= 1
        assert any(s["id"] == seller.id for s in pending_list)

        # 3. Admin approves seller
        res_action = await ac.post(
            f"/api/v1/admin/sellers/{seller.id}/action",
            json={"action": "APPROVE"},
            headers={"Authorization": f"Bearer {token_admin}"},
        )
        assert res_action.status_code == 200
        assert res_action.json()["new_status"] == "APPROVED"
        await db_session.refresh(seller)
        assert seller.is_verified is True

        # 4. Admin lists disputes & resolves 4-hour return claim
        res_disputes = await ac.get(
            "/api/v1/admin/disputes",
            headers={"Authorization": f"Bearer {token_admin}"},
        )
        assert res_disputes.status_code == 200
        assert len(res_disputes.json()) >= 1

        res_resolve = await ac.post(
            f"/api/v1/admin/disputes/{order.id}/resolve",
            json={
                "resolution": "REFUND_BUYER",
                "refund_amount_tomans": 450000,
                "admin_notes": "تایید مرجوعی ۴ ساعته به علت بسته‌بندی نامناسب",
            },
            headers={"Authorization": f"Bearer {token_admin}"},
        )
        assert res_resolve.status_code == 200
        assert "کیف پول" in res_resolve.json()["message"]

        await db_session.refresh(order)
        assert order.status == OrderStatus.CANCELLED

    app.dependency_overrides.clear()
