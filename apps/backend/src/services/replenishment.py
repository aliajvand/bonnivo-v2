from datetime import datetime, timedelta, timezone
from typing import Tuple, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from src.models.order import Order, OrderItem, ReorderSchedule
from src.models.catalog import CanonicalProduct, SellerOffer
from src.models.pet import Pet, PetHealthProfile, PetSpecies
from src.services.sms import get_sms_service

DEFAULT_DAILY_CONSUMPTION_GRAMS = {
    PetSpecies.DOG: 300,
    PetSpecies.CAT: 60,
    PetSpecies.BIRD: 20,
    PetSpecies.SMALL_PET: 30,
}


def calculate_depletion_schedule(
    package_weight_grams: int,
    daily_consumption_grams: int,
    start_date: Optional[datetime] = None,
) -> Tuple[datetime, datetime, int]:
    """
    Calculates depletion date and prompt date (7 days before depletion).
    Example: 15,000g / 300g/day = 50 days of supply.
    Prompt date is day 43 (7 days before depletion).
    """
    if daily_consumption_grams <= 0:
        raise ValueError("مصرف روزانه باید عددی مثبت باشد.")
    if package_weight_grams <= 0:
        raise ValueError("وزن بسته باید عددی مثبت باشد.")

    days = package_weight_grams // daily_consumption_grams
    base = start_date or datetime.now(timezone.utc)
    depletion_date = base + timedelta(days=days)
    prompt_date = depletion_date - timedelta(days=7)
    if prompt_date < base:
        prompt_date = base

    return depletion_date, prompt_date, days


async def create_schedules_from_order(db: AsyncSession, order: Order) -> List[ReorderSchedule]:
    """
    Inspects order items, checks for pet attachments and package weights,
    and registers automated replenishment schedules.
    """
    schedules = []
    now = datetime.now(timezone.utc)

    for item in order.items:
        if not item.pet_id:
            continue

        # Get pet info
        pet_q = select(Pet).options(selectinload(Pet.health_profile)).where(Pet.id == item.pet_id)
        pet_res = await db.execute(pet_q)
        pet = pet_res.scalar_one_or_none()
        if not pet:
            continue

        # Get product package weight
        offer_q = select(SellerOffer).options(selectinload(SellerOffer.product)).where(SellerOffer.id == item.offer_id)
        offer_res = await db.execute(offer_q)
        offer = offer_res.scalar_one_or_none()
        if not offer or not offer.product or not offer.product.package_weight_grams:
            continue

        package_weight = offer.product.package_weight_grams * item.quantity
        daily_consumption = (
            pet.health_profile.daily_food_grams
            if pet.health_profile and pet.health_profile.daily_food_grams
            else DEFAULT_DAILY_CONSUMPTION_GRAMS.get(pet.species, 250)
        )

        depletion_date, prompt_date, _ = calculate_depletion_schedule(
            package_weight_grams=package_weight,
            daily_consumption_grams=daily_consumption,
            start_date=now,
        )

        schedule = ReorderSchedule(
            user_id=order.user_id,
            pet_id=pet.id,
            product_id=offer.product.id,
            package_weight_grams=package_weight,
            daily_consumption_grams=daily_consumption,
            depletion_date=depletion_date,
            prompt_date=prompt_date,
            is_active=True,
            sms_sent=False,
        )
        db.add(schedule)
        schedules.append(schedule)

    await db.flush()
    return schedules


async def dispatch_due_replenishment_reminders(db: AsyncSession) -> int:
    """
    Finds active replenishment schedules that have reached prompt_date and sends SMS reminder with 1-tap cart link.
    """
    now = datetime.now(timezone.utc)
    query = select(ReorderSchedule).where(
        and_(
            ReorderSchedule.is_active == True,
            ReorderSchedule.sms_sent == False,
            ReorderSchedule.prompt_date <= now,
        )
    )
    res = await db.execute(query)
    due_schedules = res.scalars().all()
    sms_service = get_sms_service()

    dispatched_count = 0
    for sch in due_schedules:
        # Send SMS reminder
        depletion_dt = sch.depletion_date if sch.depletion_date.tzinfo else sch.depletion_date.replace(tzinfo=timezone.utc)
        days_left = max(1, (depletion_dt - now).days)
        # Fetch user phone
        from src.models.user import User
        user = await db.get(User, sch.user_id)
        if user:
            msg = (
                f"سلام! غذای پت شما تا حدود {days_left} روز دیگر تمام می‌شود. "
                f"برای تکرار سریع سفارش با ارسال رایگان کلیک کنید: "
                f"https://bonnivo.ir/cart?buyAgain={sch.product_id}"
            )
            await sms_service.send_otp(user.phone_number, "BONNIVO-REORDER")
            sch.sms_sent = True
            dispatched_count += 1

    await db.commit()
    return dispatched_count
