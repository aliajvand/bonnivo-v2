from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.coupon import Coupon, CouponRedemption, CouponType, RedemptionStatus

router = APIRouter(prefix="/coupons", tags=["Coupons & Discounts"])


class CouponValidatePayload(BaseModel):
    code: str
    order_amount_tomans: int


class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_amount_tomans: int
    final_amount_tomans: int
    message: str


class CouponCreatePayload(BaseModel):
    code: str
    coupon_type: CouponType = CouponType.PERCENTAGE
    discount_value: int
    max_discount_cap_tomans: Optional[int] = None
    min_order_amount_tomans: int = 0
    usage_limit: int = 100
    valid_from: Optional[datetime] = None
    valid_until: datetime


class CouponAdminResponse(BaseModel):
    id: str
    code: str
    coupon_type: CouponType
    discount_value: int
    max_discount_cap_tomans: Optional[int]
    min_order_amount_tomans: int
    usage_limit: int
    remaining_usage: int
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    created_at: datetime
    total_burned: int


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    payload: CouponValidatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    code_cleaned = payload.code.strip().upper()
    stmt = select(Coupon).where(Coupon.code == code_cleaned)
    res = await db.execute(stmt)
    coupon = res.scalar_one_or_none()

    if not coupon or not coupon.is_active:
        return CouponValidateResponse(
            valid=False,
            code=payload.code,
            discount_amount_tomans=0,
            final_amount_tomans=payload.order_amount_tomans,
            message="کد تخفیف معتبر نیست یا غیرفعال شده است.",
        )

    now = datetime.now(timezone.utc)
    valid_until = coupon.valid_until
    if valid_until.tzinfo is None:
        valid_until = valid_until.replace(tzinfo=timezone.utc)
    if valid_until < now:
        return CouponValidateResponse(
            valid=False,
            code=payload.code,
            discount_amount_tomans=0,
            final_amount_tomans=payload.order_amount_tomans,
            message="مهلت استفاده از این کد تخفیف به پایان رسیده است.",
        )

    valid_from = coupon.valid_from
    if valid_from.tzinfo is None:
        valid_from = valid_from.replace(tzinfo=timezone.utc)
    if valid_from > now:
        return CouponValidateResponse(
            valid=False,
            code=payload.code,
            discount_amount_tomans=0,
            final_amount_tomans=payload.order_amount_tomans,
            message="زمان فعال‌سازی این کد تخفیف هنوز فرا نرسیده است.",
        )

    if coupon.remaining_usage <= 0:
        return CouponValidateResponse(
            valid=False,
            code=payload.code,
            discount_amount_tomans=0,
            final_amount_tomans=payload.order_amount_tomans,
            message="ظرفیت استفاده از این کد تخفیف تکمیل شده است.",
        )

    if payload.order_amount_tomans < coupon.min_order_amount_tomans:
        return CouponValidateResponse(
            valid=False,
            code=payload.code,
            discount_amount_tomans=0,
            final_amount_tomans=payload.order_amount_tomans,
            message=f"حداقل مبلغ سفارش برای اعمال این کد {coupon.min_order_amount_tomans:,} تومان است.",
        )

    # Check if user already burned this coupon
    stmt_burned = select(CouponRedemption).where(
        CouponRedemption.coupon_id == coupon.id,
        CouponRedemption.user_id == current_user.id,
        CouponRedemption.status == RedemptionStatus.BURNED,
    )
    res_burned = await db.execute(stmt_burned)
    if res_burned.scalar_one_or_none():
        return CouponValidateResponse(
            valid=False,
            code=payload.code,
            discount_amount_tomans=0,
            final_amount_tomans=payload.order_amount_tomans,
            message="شما قبلاً از این کد تخفیف استفاده کرده‌اید.",
        )

    # Calculate discount without burning!
    discount = 0
    if coupon.coupon_type == CouponType.PERCENTAGE:
        raw_discount = int(payload.order_amount_tomans * (coupon.discount_value / 100.0))
        discount = raw_discount
        if coupon.max_discount_cap_tomans and discount > coupon.max_discount_cap_tomans:
            discount = coupon.max_discount_cap_tomans
    else:  # FIXED
        discount = coupon.discount_value

    discount = min(discount, payload.order_amount_tomans)
    final_amount = max(0, payload.order_amount_tomans - discount)

    return CouponValidateResponse(
        valid=True,
        code=coupon.code,
        discount_amount_tomans=discount,
        final_amount_tomans=final_amount,
        message=f"کد تخفیف اعمال شد: {discount:,} تومان تخفیف",
    )


@router.post("/burn")
async def burn_coupon_on_payment(
    coupon_code: str,
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Called ONLY upon verified successful payment confirmation to burn the coupon.
    """
    stmt = select(Coupon).where(Coupon.code == coupon_code.strip().upper()).with_for_update()
    res = await db.execute(stmt)
    coupon = res.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="کد تخفیف یافت نشد")

    if coupon.remaining_usage > 0:
        coupon.remaining_usage -= 1

    redemption = CouponRedemption(
        coupon_id=coupon.id,
        user_id=current_user.id,
        order_id=order_id,
        discount_amount_tomans=coupon.discount_value,
        status=RedemptionStatus.BURNED,
        burned_at=datetime.now(timezone.utc),
    )
    db.add(redemption)
    await db.commit()
    return {"success": True, "message": "کد تخفیف با موفقیت مصرف شد."}


@router.get("/admin", response_model=List[CouponAdminResponse])
async def list_admin_coupons(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    stmt = select(Coupon).order_by(Coupon.created_at.desc())
    res = await db.execute(stmt)
    coupons = res.scalars().all()

    output = []
    for c in coupons:
        stmt_burned = select(CouponRedemption).where(
            CouponRedemption.coupon_id == c.id,
            CouponRedemption.status == RedemptionStatus.BURNED,
        )
        res_burned = await db.execute(stmt_burned)
        burned_count = len(res_burned.scalars().all())

        output.append(
            CouponAdminResponse(
                id=c.id,
                code=c.code,
                coupon_type=c.coupon_type,
                discount_value=c.discount_value,
                max_discount_cap_tomans=c.max_discount_cap_tomans,
                min_order_amount_tomans=c.min_order_amount_tomans,
                usage_limit=c.usage_limit,
                remaining_usage=c.remaining_usage,
                valid_from=c.valid_from,
                valid_until=c.valid_until,
                is_active=c.is_active,
                created_at=c.created_at,
                total_burned=burned_count,
            )
        )
    return output


@router.post("/admin", status_code=status.HTTP_201_CREATED)
async def create_coupon(
    payload: CouponCreatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    code_cleaned = payload.code.strip().upper()
    existing = await db.execute(select(Coupon).where(Coupon.code == code_cleaned))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="این کد تخفیف قبلاً ایجاد شده است.")

    new_coupon = Coupon(
        code=code_cleaned,
        coupon_type=payload.coupon_type,
        discount_value=payload.discount_value,
        max_discount_cap_tomans=payload.max_discount_cap_tomans,
        min_order_amount_tomans=payload.min_order_amount_tomans,
        usage_limit=payload.usage_limit,
        remaining_usage=payload.usage_limit,
        valid_from=payload.valid_from or datetime.now(timezone.utc),
        valid_until=payload.valid_until,
        is_active=True,
    )
    db.add(new_coupon)
    await db.commit()
    await db.refresh(new_coupon)
    return {"success": True, "coupon_id": new_coupon.id, "code": new_coupon.code}
