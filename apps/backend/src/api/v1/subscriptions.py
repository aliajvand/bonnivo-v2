from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.pet import Pet
from src.models.subscription import PetFoodSubscription, SubscriptionFrequency, SubscriptionStatus

router = APIRouter(prefix="/subscriptions", tags=["Periodic Auto-Replenish Subscriptions"])


class CreateSubscriptionPayload(BaseModel):
    pet_id: str
    product_id: str
    product_title_fa: str
    weight_variant_text: str = "۲ کیلوگرم"
    package_weight_kg: float = Field(default=2.0, gt=0)
    daily_consumption_grams: float = Field(default=70.0, gt=0)
    unit_price_toman: int = Field(..., gt=0)
    frequency: SubscriptionFrequency = SubscriptionFrequency.MONTHLY
    delivery_address: str = Field(..., min_length=5)


class UpdateFrequencyPayload(BaseModel):
    frequency: SubscriptionFrequency
    next_delivery_date: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    pet_id: str
    pet_name: str
    product_id: str
    product_title_fa: str
    weight_variant_text: str
    package_weight_kg: float
    daily_consumption_grams: float
    unit_price_toman: int
    frequency: SubscriptionFrequency
    status: SubscriptionStatus
    days_duration: int
    next_delivery_date: str
    delivery_address: str
    created_at: datetime


def calculate_next_delivery_date(package_weight_kg: float, daily_consumption_grams: float) -> tuple[int, str]:
    total_grams = package_weight_kg * 1000.0
    days = max(7, int(total_grams / max(1.0, daily_consumption_grams)))
    next_date = datetime.now(timezone.utc) + timedelta(days=days)
    return days, next_date.strftime("%Y-%m-%d")


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    payload: CreateSubscriptionPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Verify Pet ownership
    pet_stmt = select(Pet).where(Pet.id == payload.pet_id)
    pet_res = await db.execute(pet_stmt)
    pet = pet_res.scalar_one_or_none()
    if not pet or pet.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی مجاز برای ثبت اشتراک این پت را ندارید.",
        )

    # 2. Calculate next delivery date based on pet food consumption
    days, next_delivery = calculate_next_delivery_date(
        payload.package_weight_kg,
        payload.daily_consumption_grams,
    )

    subscription = PetFoodSubscription(
        user_id=current_user.id,
        pet_id=pet.id,
        product_id=payload.product_id,
        product_title_fa=payload.product_title_fa,
        weight_variant_text=payload.weight_variant_text,
        package_weight_kg=payload.package_weight_kg,
        daily_consumption_grams=payload.daily_consumption_grams,
        unit_price_toman=payload.unit_price_toman,
        frequency=payload.frequency,
        status=SubscriptionStatus.ACTIVE,
        next_delivery_date=next_delivery,
        delivery_address=payload.delivery_address,
    )
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)

    return SubscriptionResponse(
        id=subscription.id,
        user_id=subscription.user_id,
        pet_id=pet.id,
        pet_name=pet.name,
        product_id=subscription.product_id,
        product_title_fa=subscription.product_title_fa,
        weight_variant_text=subscription.weight_variant_text,
        package_weight_kg=subscription.package_weight_kg,
        daily_consumption_grams=subscription.daily_consumption_grams,
        unit_price_toman=subscription.unit_price_toman,
        frequency=subscription.frequency,
        status=subscription.status,
        days_duration=days,
        next_delivery_date=subscription.next_delivery_date,
        delivery_address=subscription.delivery_address,
        created_at=subscription.created_at,
    )


@router.get("/my", response_model=List[SubscriptionResponse])
async def list_my_subscriptions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PetFoodSubscription)
        .options(selectinload(PetFoodSubscription.pet))
        .where(PetFoodSubscription.user_id == current_user.id)
        .order_by(PetFoodSubscription.created_at.desc())
    )
    res = await db.execute(stmt)
    subs = res.scalars().all()

    results = []
    for s in subs:
        days = max(7, int((s.package_weight_kg * 1000.0) / max(1.0, s.daily_consumption_grams)))
        results.append(
            SubscriptionResponse(
                id=s.id,
                user_id=s.user_id,
                pet_id=s.pet_id,
                pet_name=s.pet.name if s.pet else "حیوان خانگی",
                product_id=s.product_id,
                product_title_fa=s.product_title_fa,
                weight_variant_text=s.weight_variant_text,
                package_weight_kg=s.package_weight_kg,
                daily_consumption_grams=s.daily_consumption_grams,
                unit_price_toman=s.unit_price_toman,
                frequency=s.frequency,
                status=s.status,
                days_duration=days,
                next_delivery_date=s.next_delivery_date,
                delivery_address=s.delivery_address,
                created_at=s.created_at,
            )
        )
    return results


@router.put("/{subscription_id}/pause", response_model=SubscriptionResponse)
async def pause_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PetFoodSubscription)
        .options(selectinload(PetFoodSubscription.pet))
        .where(PetFoodSubscription.id == subscription_id)
    )
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="اشتراک مورد نظر یافت نشد")
    if sub.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز به این اشتراک.")

    sub.status = SubscriptionStatus.PAUSED
    await db.commit()
    await db.refresh(sub)

    days = max(7, int((sub.package_weight_kg * 1000.0) / max(1.0, sub.daily_consumption_grams)))
    return SubscriptionResponse(
        id=sub.id,
        user_id=sub.user_id,
        pet_id=sub.pet_id,
        pet_name=sub.pet.name if sub.pet else "حیوان خانگی",
        product_id=sub.product_id,
        product_title_fa=sub.product_title_fa,
        weight_variant_text=sub.weight_variant_text,
        package_weight_kg=sub.package_weight_kg,
        daily_consumption_grams=sub.daily_consumption_grams,
        unit_price_toman=sub.unit_price_toman,
        frequency=sub.frequency,
        status=sub.status,
        days_duration=days,
        next_delivery_date=sub.next_delivery_date,
        delivery_address=sub.delivery_address,
        created_at=sub.created_at,
    )


@router.put("/{subscription_id}/resume", response_model=SubscriptionResponse)
async def resume_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PetFoodSubscription)
        .options(selectinload(PetFoodSubscription.pet))
        .where(PetFoodSubscription.id == subscription_id)
    )
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="اشتراک مورد نظر یافت نشد")
    if sub.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز به این اشتراک.")

    sub.status = SubscriptionStatus.ACTIVE
    # Refresh next delivery date from today
    days, next_delivery = calculate_next_delivery_date(sub.package_weight_kg, sub.daily_consumption_grams)
    sub.next_delivery_date = next_delivery

    await db.commit()
    await db.refresh(sub)

    return SubscriptionResponse(
        id=sub.id,
        user_id=sub.user_id,
        pet_id=sub.pet_id,
        pet_name=sub.pet.name if sub.pet else "حیوان خانگی",
        product_id=sub.product_id,
        product_title_fa=sub.product_title_fa,
        weight_variant_text=sub.weight_variant_text,
        package_weight_kg=sub.package_weight_kg,
        daily_consumption_grams=sub.daily_consumption_grams,
        unit_price_toman=sub.unit_price_toman,
        frequency=sub.frequency,
        status=sub.status,
        days_duration=days,
        next_delivery_date=sub.next_delivery_date,
        delivery_address=sub.delivery_address,
        created_at=sub.created_at,
    )


@router.put("/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(PetFoodSubscription).where(PetFoodSubscription.id == subscription_id)
    res = await db.execute(stmt)
    sub = res.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="اشتراک مورد نظر یافت نشد")
    if sub.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز به این اشتراک.")

    sub.status = SubscriptionStatus.CANCELLED
    await db.commit()

    return {"success": True, "message": "اشتراک با موفقیت لغو گردید."}
