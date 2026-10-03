import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from fastapi import Request, Response, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database import get_db
from src.models.admin import AdminUser, AdminSession, AdminAuditLog

# Initialize Argon2 PasswordHasher (uses argon2id by default)
ph = PasswordHasher(
    time_cost=2,
    memory_cost=65536,  # 64 MB
    parallelism=2,
    hash_len=32,
    salt_len=16,
)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15
SESSION_LIFETIME_DAYS = 7
SESSION_COOKIE_NAME = "bonnivo_admin_session"
CSRF_HEADER_NAME = "x-admin-csrf"


def hash_password(password: str) -> str:
    """Hashes a password using Argon2id."""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against an Argon2id hash."""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def hash_token(token: str) -> str:
    """Computes a SHA-256 hash of a session or reset token for secure storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_secure_token() -> str:
    """Generates a high-entropy URL-safe cryptographic token."""
    return secrets.token_urlsafe(32)


def is_account_locked(admin: AdminUser) -> Tuple[bool, Optional[int]]:
    """
    Checks if an admin account is currently locked due to too many failed attempts.
    Returns (is_locked, remaining_minutes).
    """
    now = datetime.now(timezone.utc)
    if admin.locked_until and admin.locked_until > now:
        remaining_seconds = int((admin.locked_until - now).total_seconds())
        remaining_minutes = max(1, remaining_seconds // 60)
        return True, remaining_minutes
    return False, None


def register_failed_attempt(admin: AdminUser) -> Tuple[bool, Optional[int]]:
    """
    Increments failed attempts and locks account if threshold is reached.
    """
    now = datetime.now(timezone.utc)
    admin.failed_login_attempts += 1
    if admin.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
        admin.locked_until = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        return True, LOCKOUT_DURATION_MINUTES
    return False, None


def reset_failed_attempts(admin: AdminUser) -> None:
    """Resets failed login attempts after successful authentication."""
    admin.failed_login_attempts = 0
    admin.locked_until = None


async def log_admin_action(
    db: AsyncSession,
    action: str,
    admin_username: str,
    admin_id: Optional[str] = None,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AdminAuditLog:
    """Creates a permanent security audit record."""
    audit_log = AdminAuditLog(
        admin_id=admin_id,
        admin_username=admin_username,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details,
        ip_address=ip_address,
        created_at=datetime.now(timezone.utc),
    )
    db.add(audit_log)
    await db.flush()
    return audit_log


async def create_admin_session(
    db: AsyncSession,
    admin: AdminUser,
    response: Optional[Response] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    remember_me: bool = False,
) -> Tuple[str, str]:
    """
    Creates an authenticated session, stores hashed token, and sets httpOnly secure cookie.
    Returns (raw_session_token, csrf_token).
    """
    raw_session_token = generate_secure_token()
    csrf_token = generate_secure_token()
    token_hash = hash_token(raw_session_token)

    days = 14 if remember_me else SESSION_LIFETIME_DAYS
    expires_at = datetime.now(timezone.utc) + timedelta(days=days)

    session = AdminSession(
        admin_id=admin.id,
        session_token_hash=token_hash,
        csrf_token=csrf_token,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent[:255] if user_agent else None,
    )
    db.add(session)
    await db.flush()

    if response:
        max_age_seconds = days * 86400
        from src.core.config import settings
        is_prod = settings.ENVIRONMENT.lower() == "production"
        response.set_cookie(
            key=SESSION_COOKIE_NAME,
            value=raw_session_token,
            max_age=max_age_seconds,
            expires=max_age_seconds,
            httponly=True,
            secure=is_prod,
            samesite="lax",
            path="/",
        )

    return raw_session_token, csrf_token


async def get_current_admin(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> AdminUser:
    """
    Dependency that authenticates the admin from either:
    1. httpOnly cookie 'bonnivo_admin_session'
    2. Authorization header 'Bearer <token>'
    """
    raw_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not raw_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            raw_token = auth_header.replace("Bearer ", "").strip()

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="احراز هویت مدیریت الزامی است.",
        )

    token_hash = hash_token(raw_token)
    stmt = (
        select(AdminSession)
        .where(
            AdminSession.session_token_hash == token_hash,
            AdminSession.expires_at > datetime.now(timezone.utc),
        )
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نشست مدیریت منقضی شده یا نامعتبر است.",
        )

    admin = await db.get(AdminUser, session.admin_id)
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب مدیریت غیرفعال است.",
        )

    return admin
