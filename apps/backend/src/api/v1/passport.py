from datetime import datetime, timezone, timedelta
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.core.database import get_db
from src.models.pet import Pet, PetSpecies
from src.services.sms import get_sms_provider, SmsProviderInterface

router = APIRouter(prefix="/passport", tags=["QR Passport & Emergency"])


class PublicPetPassportResponse(BaseModel):
    pet_name: str
    species: PetSpecies
    breed: str
    avatar_url: Optional[str] = None
    is_lost: bool
    lost_alert_message: Optional[str] = None
    masked_owner_phone: str
    emergency_instructions: str


class FinderContactPayload(BaseModel):
    finder_name: Optional[str] = "یک همشهری دلسوز"
    finder_phone: Optional[str] = None
    location_note: Optional[str] = None


class SightingReportPayload(BaseModel):
    latitude: float
    longitude: float
    address_description: Optional[str] = None
    finder_phone: Optional[str] = None
    finder_name: Optional[str] = "یک همشهری دلسوز"
    note: Optional[str] = None


# Rate limiter: token -> list of request datetimes (max 10 req / min)
_passport_rate_limits: Dict[str, list[datetime]] = {}


def check_passport_rate_limit(token: str, max_requests: int = 10, window_seconds: int = 60) -> bool:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=window_seconds)
    timestamps = _passport_rate_limits.get(token, [])
    valid_timestamps = [ts for ts in timestamps if ts > cutoff]
    if len(valid_timestamps) >= max_requests:
        return False
    valid_timestamps.append(now)
    _passport_rate_limits[token] = valid_timestamps
    return True


def mask_phone_number(phone: str) -> str:
    if len(phone) >= 11:
        return f"{phone[:4]}***{phone[-4:]}"
    return f"{phone[:2]}***{phone[-2:]}"


@router.get("/{token}", response_model=PublicPetPassportResponse)
async def get_public_passport(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    # 1. Rate Limiting Check (10 req/min)
    if not check_passport_rate_limit(token, max_requests=10, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 10 scans per minute allowed.",
        )

    # 2. Query pet with owner
    stmt = (
        select(Pet)
        .options(selectinload(Pet.owner))
        .where(Pet.qr_passport_token == token)
    )
    res = await db.execute(stmt)
    pet = res.scalar_one_or_none()

    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid passport token")

    owner_phone = pet.owner.phone_number if pet.owner else "09120000000"
    masked_phone = mask_phone_number(owner_phone)

    return PublicPetPassportResponse(
        pet_name=pet.name,
        species=pet.species,
        breed=pet.breed,
        avatar_url=pet.avatar_url,
        is_lost=pet.is_lost,
        lost_alert_message=pet.lost_alert_message,
        masked_owner_phone=masked_phone,
        emergency_instructions="در صورت مشاهده این حیوان لطفاً به آن آب و پناه دهید و از طریق دکمه تماس به سرپرست اطلاع دهید.",
    )


@router.post("/{token}/contact")
async def notify_owner_via_passport(
    token: str,
    payload: FinderContactPayload,
    db: AsyncSession = Depends(get_db),
    sms_service: SmsProviderInterface = Depends(get_sms_provider),
):
    stmt = (
        select(Pet)
        .options(selectinload(Pet.owner))
        .where(Pet.qr_passport_token == token)
    )
    res = await db.execute(stmt)
    pet = res.scalar_one_or_none()
    if not pet or not pet.owner:
        raise HTTPException(status_code=404, detail="Invalid passport token")

    # Send SMS alert to owner
    owner_phone = pet.owner.phone_number
    sms_text = f"پلاک قلاده {pet.name} اسکن شد! موقعیت اعلامی: {payload.location_note or 'نامشخص'}"
    await sms_service.send_template_sms(
        owner_phone,
        "LOST_PET_SCAN_ALERT",
        {"pet_name": pet.name, "location": payload.location_note or ""},
    )

    return {"success": True, "message": "اطلاعیه اضطراری برای سرپرست ارسال شد."}


@router.post("/{token}/emergency-sighting")
async def report_pet_emergency_sighting(
    token: str,
    payload: SightingReportPayload,
    db: AsyncSession = Depends(get_db),
    sms_service: SmsProviderInterface = Depends(get_sms_provider),
):
    stmt = (
        select(Pet)
        .options(selectinload(Pet.owner))
        .where(Pet.qr_passport_token == token)
    )
    res = await db.execute(stmt)
    pet = res.scalar_one_or_none()
    if not pet or not pet.owner:
        raise HTTPException(status_code=404, detail="Invalid passport token")

    owner_phone = pet.owner.phone_number
    maps_url = f"https://maps.google.com/?q={payload.latitude:.6f},{payload.longitude:.6f}"
    location_desc = payload.address_description or "موقعیت زنده GPS ثبت شده"
    
    await sms_service.send_template_sms(
        owner_phone,
        "LOST_PET_SCAN_ALERT",
        {
            "pet_name": pet.name,
            "location": f"{location_desc} ({maps_url})",
        },
    )

    return {
        "success": True,
        "message": f"موقعیت مکانی {pet.name} با موفقیت ثبت شد و پیامک اضطراری برای سرپرست ارسال گردید.",
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "mapsUrl": maps_url,
    }
