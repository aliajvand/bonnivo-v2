from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.order import ReorderSchedule
from src.services.replenishment import dispatch_due_replenishment_reminders

router = APIRouter(prefix="/replenishment", tags=["Smart Replenishment & Reorder"])


class ReorderScheduleResponse(BaseModel):
    id: str
    pet_id: str
    product_id: str
    package_weight_grams: int
    daily_consumption_grams: int
    depletion_date: datetime
    prompt_date: datetime
    days_total: int
    days_remaining: int
    depletion_percentage: float
    is_active: bool
    sms_sent: bool


@router.get("/pet/{pet_id}", response_model=Optional[ReorderScheduleResponse])
async def get_pet_replenishment_schedule(
    pet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(ReorderSchedule)
        .where(
            and_(
                ReorderSchedule.pet_id == pet_id,
                ReorderSchedule.user_id == current_user.id,
                ReorderSchedule.is_active == True,
            )
        )
        .order_by(ReorderSchedule.created_at.desc())
    )
    result = await db.execute(query)
    schedule = result.scalar_one_or_none()

    if not schedule:
        return None

    now = datetime.now(timezone.utc)
    depletion_dt = schedule.depletion_date if schedule.depletion_date.tzinfo else schedule.depletion_date.replace(tzinfo=timezone.utc)
    created_dt = schedule.created_at if schedule.created_at.tzinfo else schedule.created_at.replace(tzinfo=timezone.utc)
    prompt_dt = schedule.prompt_date if schedule.prompt_date.tzinfo else schedule.prompt_date.replace(tzinfo=timezone.utc)

    days_total = max(1, schedule.package_weight_grams // schedule.daily_consumption_grams)
    seconds_remaining = (depletion_dt - now).total_seconds()
    days_remaining = max(0, int(seconds_remaining // 86400))
    seconds_elapsed = max(0.0, (now - created_dt).total_seconds())
    total_seconds = days_total * 86400
    depletion_pct = min(100.0, round((seconds_elapsed / total_seconds) * 100.0, 1))

    return ReorderScheduleResponse(
        id=schedule.id,
        pet_id=schedule.pet_id,
        product_id=schedule.product_id,
        package_weight_grams=schedule.package_weight_grams,
        daily_consumption_grams=schedule.daily_consumption_grams,
        depletion_date=depletion_dt,
        prompt_date=prompt_dt,
        days_total=days_total,
        days_remaining=days_remaining,
        depletion_percentage=depletion_pct,
        is_active=schedule.is_active,
        sms_sent=schedule.sms_sent,
    )


@router.post("/dispatch-cron")
async def trigger_replenishment_cron(
    db: AsyncSession = Depends(get_db),
):
    dispatched = await dispatch_due_replenishment_reminders(db)
    return {"status": "ok", "reminders_dispatched": dispatched}
