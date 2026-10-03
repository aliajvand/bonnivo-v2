import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app
from src.core.admin_security import hash_password, SESSION_COOKIE_NAME
from src.models.admin import AdminUser
from src.core.database import AsyncSessionLocal
from sqlalchemy import select


@pytest.mark.asyncio
async def test_admin_auth_full_lifecycle():
    # 1. Setup a dedicated test admin
    test_username = "security_admin"
    test_email = "secadmin@bonnivo.ir"
    test_password = "SecurePassword2026!"

    async with AsyncSessionLocal() as session:
        # cleanup if exists
        stmt = select(AdminUser).where(AdminUser.username == test_username)
        res = await session.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            await session.delete(existing)
            await session.commit()

        new_admin = AdminUser(
            username=test_username,
            email=test_email,
            full_name="مدیر تست امنیت",
            password_hash=hash_password(test_password),
            is_active=True,
            failed_login_attempts=0,
        )
        session.add(new_admin)
        await session.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Test 1: Wrong password -> 401 generic error
        bad_login = await ac.post(
            "/api/v1/admin/auth/login",
            json={"username_or_email": test_username, "password": "WrongPassword123!"},
        )
        assert bad_login.status_code == 401
        assert "نام کاربری یا گذرواژه نادرست است" in bad_login.json()["detail"]

        # Test 2: Successful login
        good_login = await ac.post(
            "/api/v1/admin/auth/login",
            json={"username_or_email": test_username, "password": test_password},
        )
        assert good_login.status_code == 200
        data = good_login.json()
        assert data["status"] == "success"
        assert "csrf_token" in data
        assert SESSION_COOKIE_NAME in good_login.cookies

        # Test 3: Get current admin (/me) via Cookie
        cookie_dict = {SESSION_COOKIE_NAME: good_login.cookies[SESSION_COOKIE_NAME]}
        me_res = await ac.get(
            "/api/v1/admin/auth/me",
            cookies=cookie_dict,
        )
        assert me_res.status_code == 200
        assert me_res.json()["username"] == test_username

        # Test 4: Access audit logs via Bearer Header
        audit_res = await ac.get(
            "/api/v1/admin/auth/audit-logs",
            headers={"Authorization": f"Bearer {data['token']}"},
        )
        assert audit_res.status_code == 200
        assert len(audit_res.json()) > 0

        # Test 5: Logout
        logout_res = await ac.post(
            "/api/v1/admin/auth/logout",
            cookies=cookie_dict,
        )
        assert logout_res.status_code == 200

        # Test 6: Verify me fails after logout
        me_after_logout = await ac.get(
            "/api/v1/admin/auth/me",
            cookies=cookie_dict,
        )
        assert me_after_logout.status_code == 401
