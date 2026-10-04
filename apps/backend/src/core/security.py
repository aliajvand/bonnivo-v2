from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
import hashlib
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.config import settings
from src.core.database import get_db
from src.models.user import User, UserRole

security_scheme = HTTPBearer(auto_error=False)


def hash_otp_code(code: str) -> str:
    return hashlib.sha256(f"{code}:{settings.SECRET_KEY}".encode("utf-8")).hexdigest()


def verify_otp_code(code: str, hashed: str) -> bool:
    return hash_otp_code(code) == hashed


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(
    request: Request = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token: Optional[str] = None
    if credentials:
        token = credentials.credentials
    elif request and request.cookies:
        token = request.cookies.get("bonnivo_access_token") or request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
    return user


def require_role(allowed_roles: list[UserRole]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role {current_user.role}",
            )
        return current_user
    return role_checker


# In-memory sliding window rate limiter for OTP requests: phone -> list of timestamps
_rate_limits: Dict[str, list[datetime]] = {}


def check_rate_limit(phone_number: str, max_requests: int = 3, window_minutes: int = 2) -> bool:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(minutes=window_minutes)
    timestamps = _rate_limits.get(phone_number, [])
    # keep only recent
    valid_timestamps = [ts for ts in timestamps if ts > cutoff]
    if len(valid_timestamps) >= max_requests:
        return False
    valid_timestamps.append(now)
    _rate_limits[phone_number] = valid_timestamps
    return True
