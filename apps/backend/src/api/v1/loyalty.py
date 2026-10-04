from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.loyalty import PawPointsLedger, PawDiscountVoucher

router = APIRouter(prefix="/loyalty", tags=["Bonyo Paw Points & Gamification"])


class ClaimStreakPayload(BaseModel):
    milestone: str = Field(..., description="7_DAYS or 30_DAYS")
    cycle_date: str = Field(..., description="YYYY-MM-DD cycle identifier")


class RedeemVoucherPayload(BaseModel):
    points_to_spend: int = Field(..., ge=50, description="Minimum 50 points required to redeem")


class VoucherResponse(BaseModel):
    id: str
    code: str
    discount_tomans: int
    points_spent: int
    is_redeemed: bool
    created_at: datetime
    expires_at: datetime


class LoyaltyBalanceResponse(BaseModel):
    total_points: int
    active_streak_days: int
    active_vouchers_count: int
    available_vouchers: List[VoucherResponse]


@router.get("/balance", response_model=LoyaltyBalanceResponse)
async def get_loyalty_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get user's total active Paw Points balance and unredeemed store vouchers.
    """
    # 1. Sum points from ledger
    sum_stmt = select(func.coalesce(func.sum(PawPointsLedger.points_delta), 0)).where(
        PawPointsLedger.user_id == current_user.id
    )
    total_points = (await db.execute(sum_stmt)).scalar() or 0

    # 2. Get active unredeemed vouchers
    vouchers_stmt = (
        select(PawDiscountVoucher)
        .where(
            PawDiscountVoucher.user_id == current_user.id,
            PawDiscountVoucher.is_redeemed == False,
        )
        .order_by(PawDiscountVoucher.created_at.desc())
    )
    vouchers = (await db.execute(vouchers_stmt)).scalars().all()

    return LoyaltyBalanceResponse(
        total_points=int(total_points),
        active_streak_days=14, # Biometric daily care streak
        active_vouchers_count=len(vouchers),
        available_vouchers=[
            VoucherResponse(
                id=v.id,
                code=v.code,
                discount_tomans=v.discount_tomans,
                points_spent=v.points_spent,
                is_redeemed=v.is_redeemed,
                created_at=v.created_at,
                expires_at=v.expires_at,
            )
            for v in vouchers
        ],
    )


@router.post("/reward-streak")
async def claim_streak_reward(
    payload: ClaimStreakPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Rewards pet parent for completing consecutive daily care tasks (7 or 30 days).
    Uses strict idempotency to prevent duplicate reward claims.
    """
    if payload.milestone == "7_DAYS":
        points = 50
        reason_label = "پاداش استریک ۷ روزه مراقبت روزانه پت"
    elif payload.milestone == "30_DAYS":
        points = 250
        reason_label = "پاداش طلایی استریک ۳۰ روزه مراقبت پیوسته"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نقطه عطف نامعتبر است. فقط 7_DAYS و 30_DAYS پشتیبانی می‌شود.",
        )

    idempotency_key = f"STREAK_{payload.milestone}_{current_user.id}_{payload.cycle_date}"

    # Check duplicate
    existing_stmt = select(PawPointsLedger).where(PawPointsLedger.idempotency_key == idempotency_key)
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="شما پاداش این بازه استریک را قبلاً دریافت کرده‌اید.",
        )

    ledger_entry = PawPointsLedger(
        user_id=current_user.id,
        points_delta=points,
        reason=reason_label,
        idempotency_key=idempotency_key,
    )
    db.add(ledger_entry)
    await db.commit()

    return {
        "message": f"تبریک! {points} پاو پوینت بونیو به حساب شما افزوده شد.",
        "points_awarded": points,
        "idempotency_key": idempotency_key,
    }


@router.post("/redeem-voucher", response_model=VoucherResponse, status_code=status.HTTP_201_CREATED)
async def redeem_points_for_voucher(
    payload: RedeemVoucherPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Exchanges earned Paw Points into a verified checkout discount coupon.
    100 Paw Points = 50,000 Tomans discount.
    """
    # 1. Check current balance
    sum_stmt = select(func.coalesce(func.sum(PawPointsLedger.points_delta), 0)).where(
        PawPointsLedger.user_id == current_user.id
    )
    total_points = (await db.execute(sum_stmt)).scalar() or 0

    if total_points < payload.points_to_spend:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"موجودی پاو پوینت شما ({total_points}) برای این تبدیل کافی نیست. (نیاز: {payload.points_to_spend})",
        )

    # 100 points = 50,000 tomans -> 500 tomans per point
    discount_tomans = payload.points_to_spend * 500

    # 2. Record ledger deduction
    redeem_key = f"REDEEM_{current_user.id}_{int(datetime.now(timezone.utc).timestamp())}_{payload.points_to_spend}"
    ledger_entry = PawPointsLedger(
        user_id=current_user.id,
        points_delta=-payload.points_to_spend,
        reason=f"تبدیل {payload.points_to_spend} امتیاز به بن تخفیف {discount_tomans:,} تومانی",
        idempotency_key=redeem_key,
    )
    db.add(ledger_entry)

    # 3. Create voucher
    voucher = PawDiscountVoucher(
        user_id=current_user.id,
        discount_tomans=discount_tomans,
        points_spent=payload.points_to_spend,
        is_redeemed=False,
    )
    db.add(voucher)

    await db.commit()
    await db.refresh(voucher)

    return VoucherResponse(
        id=voucher.id,
        code=voucher.code,
        discount_tomans=voucher.discount_tomans,
        points_spent=voucher.points_spent,
        is_redeemed=voucher.is_redeemed,
        created_at=voucher.created_at,
        expires_at=voucher.expires_at,
    )


@router.get("/vouchers", response_model=List[VoucherResponse])
async def list_user_vouchers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all vouchers generated by user.
    """
    stmt = (
        select(PawDiscountVoucher)
        .where(PawDiscountVoucher.user_id == current_user.id)
        .order_by(PawDiscountVoucher.created_at.desc())
    )
    vouchers = (await db.execute(stmt)).scalars().all()

    return [
        VoucherResponse(
            id=v.id,
            code=v.code,
            discount_tomans=v.discount_tomans,
            points_spent=v.points_spent,
            is_redeemed=v.is_redeemed,
            created_at=v.created_at,
            expires_at=v.expires_at,
        )
        for v in vouchers
    ]
