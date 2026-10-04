from datetime import datetime, timedelta, timezone
import random
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.config import settings
from src.core.database import get_db
from src.core.security import (
    check_rate_limit,
    hash_otp_code,
    verify_otp_code,
    create_access_token,
    get_current_user,
)
from src.models.user import User, UserRole, OtpVerification, UserSession
from src.services.sms import get_sms_provider, SmsProviderInterface
from src.fixtures.qa_seeds import QA_PERSONAS

router = APIRouter(prefix="/auth", tags=["Authentication"])


class OtpRequestPayload(BaseModel):
    phone_number: str = Field(..., pattern=r"^09\d{9}$", description="Valid Iranian mobile number, e.g., 09123456789")


class OtpVerifyPayload(BaseModel):
    phone_number: str = Field(..., pattern=r"^09\d{9}$")
    code: str = Field(..., min_length=5, max_length=5, description="5-digit OTP verification code")


class UserResponse(BaseModel):
    id: str
    phone_number: str
    full_name: str | None
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


@router.post("/otp/request")
async def request_otp(
    payload: OtpRequestPayload,
    db: AsyncSession = Depends(get_db),
    sms_service: SmsProviderInterface = Depends(get_sms_provider),
):
    phone = payload.phone_number

    # 1. Rate Limiting Check (max 3 req / 2 min)
    if not check_rate_limit(phone, max_requests=3, window_minutes=2):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please wait 2 minutes before retrying.",
        )

    # 2. Generate 5-digit code
    is_qa = (
        bool(settings.ALLOW_QA_ACCOUNTS)
        and settings.ENVIRONMENT.lower() != "production"
        and any(p["phone_number"] == phone for p in QA_PERSONAS)
    )
    if is_qa:
        code = getattr(settings, "QA_DEFAULT_OTP", "12345")
    else:
        code = f"{random.randint(10000, 99999)}"
    code_hash = hash_otp_code(code)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=2)

    # 3. Store OTP record in database
    otp_record = OtpVerification(
        phone_number=phone,
        code_hash=code_hash,
        expires_at=expires_at,
        is_verified=False,
    )
    db.add(otp_record)
    await db.commit()

    # 4. Dispatch SMS
    await sms_service.send_otp(phone, code)

    return {
        "success": True,
        "message": "OTP verification code sent successfully",
        "expires_in_seconds": 120,
    }


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(
    payload: OtpVerifyPayload,
    db: AsyncSession = Depends(get_db),
):
    phone = payload.phone_number
    code = payload.code

    is_qa = (
        bool(settings.ALLOW_QA_ACCOUNTS)
        and settings.ENVIRONMENT.lower() != "production"
        and any(p["phone_number"] == phone for p in QA_PERSONAS)
    )
    is_qa_match = is_qa and code == getattr(settings, "QA_DEFAULT_OTP", "12345")

    # 1. Find valid unexpired OTP record
    now = datetime.now(timezone.utc)
    stmt = (
        select(OtpVerification)
        .where(
            OtpVerification.phone_number == phone,
            OtpVerification.is_verified == False,
            OtpVerification.expires_at > now,
        )
        .order_by(OtpVerification.created_at.desc())
    )
    result = await db.execute(stmt)
    otp_record = result.scalars().first()

    if not otp_record and not is_qa_match:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code",
        )

    # 2. Verify code hash
    if otp_record:
        if not is_qa_match and not verify_otp_code(code, otp_record.code_hash):
            otp_record.attempts += 1
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect verification code",
            )
        otp_record.is_verified = True

    # 3. Get or create User
    user_stmt = select(User).where(User.phone_number == phone)
    user_res = await db.execute(user_stmt)
    user = user_res.scalar_one_or_none()

    if not user:
        qa_persona = next((p for p in QA_PERSONAS if p["phone_number"] == phone), None) if is_qa else None
        user = User(
            id=qa_persona["id"] if qa_persona else str(uuid.uuid4()),
            phone_number=phone,
            full_name=qa_persona["full_name"] if qa_persona else None,
            role=qa_persona["role"] if qa_persona else UserRole.PET_PARENT,
            is_active=True,
        )
        db.add(user)
        await db.flush()
    elif user.role == UserRole.ADMIN and (not settings.DEMO_MODE and settings.ENVIRONMENT.lower() == "production"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="حساب‌های مدیریت سیستم صرفاً از طریق درگاه امن ورود مدیریت (/admin/login) مجاز به ورود هستند.",
        )

    # 4. Create Session & JWT
    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    session_record = UserSession(
        user_id=user.id,
        token_hash=hash_otp_code(access_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db.add(session_record)
    await db.commit()
    await db.refresh(user)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=60 * 24 * 7 * 60,
        user=UserResponse(
            id=user.id,
            phone_number=user.phone_number,
            full_name=user.full_name,
            role=user.role.value,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        phone_number=current_user.phone_number,
        full_name=current_user.full_name,
        role=current_user.role.value,
        created_at=current_user.created_at,
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Delete user sessions
    stmt = select(UserSession).where(UserSession.user_id == current_user.id)
    res = await db.execute(stmt)
    for session in res.scalars():
        await db.delete(session)
    await db.commit()
    return {"success": True, "message": "Logged out successfully"}
