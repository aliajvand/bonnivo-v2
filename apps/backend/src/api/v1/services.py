from datetime import datetime, timezone
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.pet import Pet
from src.models.vet import MedicalRecord

router = APIRouter(prefix="/services", tags=["Grooming & Boarding Services"])


class ServiceType(str):
    GROOMING = "GROOMING"  # اصلاح و آرایش مو
    WASH_AND_SPA = "WASH_AND_SPA"  # شست‌وشو و اسپا
    BOARDING = "BOARDING"  # پانسیون شبانه‌روزی
    DAY_CARE = "DAY_CARE"  # مهد روزانه


class ServiceBookingRequest(BaseModel):
    pet_id: str
    service_type: str = Field(..., description="GROOMING, WASH_AND_SPA, BOARDING, DAY_CARE")
    booking_date: str = Field(..., description="YYYY-MM-DD")
    preferred_time: str = Field(..., description="e.g. 10:00 - 12:00")
    duration_days: Optional[int] = Field(default=1, ge=1, le=30)
    pickup_required: bool = False
    delivery_address: Optional[str] = None
    special_care_notes: Optional[str] = None


class ServiceBookingResponse(BaseModel):
    booking_id: str
    pet_id: str
    pet_name: str
    service_type: str
    booking_date: str
    status: str
    vaccine_verified: bool
    last_vaccine_date: Optional[str]
    total_fee_toman: int
    message: str


SERVICE_PRICING = {
    "GROOMING": 380000,
    "WASH_AND_SPA": 290000,
    "BOARDING": 650000,  # Per day
    "DAY_CARE": 320000,
}


@router.post("/booking", response_model=ServiceBookingResponse, status_code=status.HTTP_201_CREATED)
async def book_pet_service(
    payload: ServiceBookingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch Pet and check ownership
    pet_stmt = select(Pet).where(Pet.id == payload.pet_id)
    pet_res = await db.execute(pet_stmt)
    pet = pet_res.scalar_one_or_none()
    if not pet or pet.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی مجاز برای ثبت رزرو برای این پت را ندارید.",
        )

    # 2. Automated Vaccine Validation Rule (Task 17.1)
    # Check if pet has any valid vaccine recorded in MedicalRecord
    vaccine_stmt = select(MedicalRecord).where(
        MedicalRecord.pet_id == pet.id,
        MedicalRecord.vaccine_administered.is_not(None),
    )
    vaccine_res = await db.execute(vaccine_stmt)
    vaccine_records = vaccine_res.scalars().all()

    if not vaccine_records:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "رزرو خدمات آرایشگاه و پانسیون مستلزم دارا بودن واکسیناسیون معتبر (هاری و چندگانه) "
                "در شناسنامه سلامت پت است. لطفاً ابتدا نسبت به ثبت پرونده واکسیناسیون توسط کلینیک اقدام فرمایید."
            ),
        )

    latest_vaccine = vaccine_records[-1]
    last_vaccine_str = (
        latest_vaccine.visit_date.strftime("%Y-%m-%d")
        if latest_vaccine.visit_date
        else "معتبر"
    )

    # 3. Calculate Fee
    base_fee = SERVICE_PRICING.get(payload.service_type, 350000)
    total_fee = base_fee * (payload.duration_days if payload.service_type == "BOARDING" else 1)
    if payload.pickup_required:
        total_fee += 120000  # Pet taxi service fee

    booking_id = f"SRV-{uuid.uuid4().hex[:8].upper()}"

    return ServiceBookingResponse(
        booking_id=booking_id,
        pet_id=pet.id,
        pet_name=pet.name,
        service_type=payload.service_type,
        booking_date=payload.booking_date,
        status="CONFIRMED",
        vaccine_verified=True,
        last_vaccine_date=last_vaccine_str,
        total_fee_toman=total_fee,
        message="رزرو خدمت با موفقیت ثبت و سلامت‌سنجی واکسیناسیون تایید شد.",
    )
