from datetime import datetime, timezone, timedelta
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from src.core.database import get_db
from src.core.security import check_rate_limit
from src.models.admin import AdminUser, AdminSession, AdminPasswordReset, AdminAuditLog
from src.core.admin_security import (
    verify_password,
    hash_password,
    hash_token,
    generate_secure_token,
    is_account_locked,
    register_failed_attempt,
    reset_failed_attempts,
    log_admin_action,
    create_admin_session,
    get_current_admin,
    SESSION_COOKIE_NAME,
    CSRF_HEADER_NAME,
)

router = APIRouter(prefix="/admin/auth", tags=["Admin Authentication"])


class AdminLoginPayload(BaseModel):
    username_or_email: str = Field(min_length=3, description="نام کاربری یا ایمیل مدیر")
    password: str = Field(min_length=6, description="گذرواژه حساب مدیریت")
    remember_me: bool = Field(default=False, description="مرا به خاطر بسپار")


class AdminLoginResponse(BaseModel):
    status: str
    message: str
    csrf_token: str
    token: str
    admin: dict


class AdminMeResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    is_active: bool
    last_login_at: Optional[str]
    created_at: str


class ForgotPasswordPayload(BaseModel):
    username_or_email: str


class ResetPasswordPayload(BaseModel):
    token: str = Field(min_length=10)
    new_password: str = Field(min_length=8)


class AdminAuditLogItem(BaseModel):
    id: str
    admin_username: str
    action: str
    target_type: Optional[str]
    target_id: Optional[str]
    details: Optional[str]
    ip_address: Optional[str]
    created_at: str


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    payload: AdminLoginPayload,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    ip_addr = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent")

    # IP-based rate limiting on admin login
    if not check_rate_limit(f"admin_login:{ip_addr}", max_requests=10, window_minutes=2):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="تعداد تلاش‌های ورود از این مبدا بیش از حد مجاز است. لطفاً پس از چند دقیقه مجدداً تلاش کنید.",
        )

    # Find admin by username or email
    stmt = (
        select(AdminUser)
        .where(
            or_(
                AdminUser.username == payload.username_or_email.strip(),
                AdminUser.email == payload.username_or_email.strip().lower(),
            )
        )
    )
    res = await db.execute(stmt)
    admin = res.scalar_one_or_none()

    generic_error = "نام کاربری یا گذرواژه نادرست است."

    if not admin:
        # Dummy verification to mitigate timing attacks
        verify_password("dummy_password", "$argon2id$v=19$m=65536,t=2,p=2$dummyhashdummyhash$dummyhashdummyhash")
        await log_admin_action(
            db,
            action="LOGIN_FAILED_UNKNOWN_USER",
            admin_username=payload.username_or_email[:50],
            details=f"تلاش ناموفق برای ورود با شناسه ناشناس: {payload.username_or_email}",
            ip_address=ip_addr,
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=generic_error,
        )

    # Check if account is locked
    locked, remaining_minutes = is_account_locked(admin)
    if locked:
        await log_admin_action(
            db,
            action="LOGIN_BLOCKED_LOCKED_ACCOUNT",
            admin_username=admin.username,
            admin_id=admin.id,
            details=f"تلاش ورود به حساب قفل شده. زمان باقیمانده: {remaining_minutes} دقیقه",
            ip_address=ip_addr,
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"حساب کاربری به دلیل ۵ تلاش ناموفق موقتاً قفل شده است. لطفاً پس از {remaining_minutes} دقیقه دوباره تلاش کنید.",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب مدیریت شما غیرفعال شده است. با مدیر ارشد تماس بگیرید.",
        )

    # Verify password
    if not verify_password(payload.password, admin.password_hash):
        now_locked, lock_mins = register_failed_attempt(admin)
        await log_admin_action(
            db,
            action="LOGIN_FAILED_WRONG_PASSWORD",
            admin_username=admin.username,
            admin_id=admin.id,
            details=f"گذرواژه نادرست. تعداد تلاش‌های ناموفق: {admin.failed_login_attempts}",
            ip_address=ip_addr,
        )
        await db.commit()

        if now_locked:
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"حساب شما به دلیل ۵ تلاش ناموفق به مدت {lock_mins} دقیقه مسدود شد.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=generic_error,
        )

    # Successful login: reset failed attempts
    reset_failed_attempts(admin)
    admin.last_login_at = datetime.now(timezone.utc)

    # Create session with secure cookie
    raw_session_token, csrf_token = await create_admin_session(
        db=db,
        admin=admin,
        response=response,
        ip_address=ip_addr,
        user_agent=user_agent,
        remember_me=payload.remember_me,
    )

    await log_admin_action(
        db,
        action="LOGIN_SUCCESS",
        admin_username=admin.username,
        admin_id=admin.id,
        details="ورود موفق به پنل مدیریت",
        ip_address=ip_addr,
    )
    await db.commit()

    return AdminLoginResponse(
        status="success",
        message="ورود موفقیت‌آمیز بود.",
        csrf_token=csrf_token,
        token=raw_session_token,
        admin={
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
        },
    )


@router.post("/logout")
async def admin_logout(
    request: Request,
    response: Response,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not raw_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            raw_token = auth_header.replace("Bearer ", "").strip()

    if raw_token:
        token_hash = hash_token(raw_token)
        stmt = select(AdminSession).where(AdminSession.session_token_hash == token_hash)
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if session:
            await db.delete(session)

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=True,
        samesite="lax",
    )

    await log_admin_action(
        db,
        action="LOGOUT",
        admin_username=admin.username,
        admin_id=admin.id,
        details="خروج از پنل مدیریت",
        ip_address=request.client.host if request.client else None,
    )
    await db.commit()

    return {"status": "success", "message": "خروج با موفقیت انجام شد."}


@router.get("/me", response_model=AdminMeResponse)
async def admin_get_me(
    admin: AdminUser = Depends(get_current_admin),
):
    return AdminMeResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        is_active=admin.is_active,
        last_login_at=admin.last_login_at.isoformat() if admin.last_login_at else None,
        created_at=admin.created_at.isoformat(),
    )


@router.post("/forgot-password")
async def admin_forgot_password(
    payload: ForgotPasswordPayload,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    ip_addr = request.client.host if request.client else None
    stmt = (
        select(AdminUser)
        .where(
            or_(
                AdminUser.username == payload.username_or_email.strip(),
                AdminUser.email == payload.username_or_email.strip().lower(),
            )
        )
    )
    res = await db.execute(stmt)
    admin = res.scalar_one_or_none()

    uniform_response = {
        "status": "success",
        "message": "در صورت وجود حساب کاربری مدیریت، دستورالعمل بازیابی گذرواژه ارسال شد.",
    }

    if admin and admin.is_active:
        reset_token = generate_secure_token()
        token_hash = hash_token(reset_token)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

        pr = AdminPasswordReset(
            admin_id=admin.id,
            reset_token_hash=token_hash,
            expires_at=expires_at,
            is_used=False,
        )
        db.add(pr)

        await log_admin_action(
            db,
            action="PASSWORD_RESET_REQUESTED",
            admin_username=admin.username,
            admin_id=admin.id,
            details="درخواست توکن بازیابی گذرواژه ۳۰ دقیقه‌ای",
            ip_address=ip_addr,
        )
        await db.commit()

    return uniform_response


@router.post("/reset-password")
async def admin_reset_password(
    payload: ResetPasswordPayload,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    token_hash = hash_token(payload.token)
    now = datetime.now(timezone.utc)

    stmt = (
        select(AdminPasswordReset)
        .where(
            AdminPasswordReset.reset_token_hash == token_hash,
            AdminPasswordReset.expires_at > now,
            AdminPasswordReset.is_used == False,
        )
    )
    res = await db.execute(stmt)
    reset_record = res.scalar_one_or_none()

    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="توکن بازیابی نامعتبر است یا منقضی شده است.",
        )

    admin = await db.get(AdminUser, reset_record.admin_id)
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="حساب کاربری یافت نشد یا غیرفعال است.",
        )

    # Update password with Argon2id
    admin.password_hash = hash_password(payload.new_password)
    reset_failed_attempts(admin)
    reset_record.is_used = True

    # Invalidate all existing sessions for this admin
    stmt_sessions = select(AdminSession).where(AdminSession.admin_id == admin.id)
    res_sessions = await db.execute(stmt_sessions)
    for s in res_sessions.scalars().all():
        await db.delete(s)

    await log_admin_action(
        db,
        action="PASSWORD_RESET_COMPLETED",
        admin_username=admin.username,
        admin_id=admin.id,
        details="گذرواژه مدیر با موفقیت تغییر یافت و تمام نشست‌های قبلی باطل شدند.",
        ip_address=request.client.host if request.client else None,
    )
    await db.commit()

    return {"status": "success", "message": "گذرواژه شما با موفقیت تغییر یافت. اکنون می‌توانید وارد شوید."}


@router.get("/audit-logs", response_model=List[AdminAuditLogItem])
async def list_admin_audit_logs(
    limit: int = 50,
    offset: int = 0,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(AdminAuditLog)
        .order_by(AdminAuditLog.created_at.desc())
        .limit(min(limit, 100))
        .offset(offset)
    )
    res = await db.execute(stmt)
    logs = res.scalars().all()

    return [
        AdminAuditLogItem(
            id=log.id,
            admin_username=log.admin_username,
            action=log.action,
            target_type=log.target_type,
            target_id=log.target_id,
            details=log.details,
            ip_address=log.ip_address,
            created_at=log.created_at.isoformat(),
        )
        for log in logs
    ]
