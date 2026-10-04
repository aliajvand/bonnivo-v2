from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.pet import Pet
from src.models.nfc import SmartCollarTag

router = APIRouter(prefix="/nfc", tags=["Smart NFC Collar Tags"])


class ProvisionTagPayload(BaseModel):
    hardware_uid: str = Field(..., min_length=4, max_length=50, description="Physical NTAG UID")


class ClaimTagPayload(BaseModel):
    hardware_uid: str = Field(..., min_length=4, max_length=50)
    pet_id: str


class SmartTagResponse(BaseModel):
    id: str
    hardware_uid: str
    hardware_token: str
    pet_id: Optional[str]
    is_claimed: bool
    is_revoked: bool
    claimed_at: Optional[datetime]
    created_at: datetime


class NfcPublicResolveResponse(BaseModel):
    status: str
    is_active: bool
    is_lost: bool
    lost_alert_message: Optional[str]
    pet: Optional[dict] = None
    emergency_contact: Optional[dict] = None


@router.post("/provision", response_model=SmartTagResponse, status_code=status.HTTP_201_CREATED)
async def provision_nfc_tag(
    payload: ProvisionTagPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Factory/Admin provisioning of a physical NTAG collar chip with cryptographic unguessable token.
    """
    existing_stmt = select(SmartCollarTag).where(SmartCollarTag.hardware_uid == payload.hardware_uid)
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="این شناسه سخت‌افزاری تگ قبلاً در سامانه ثبت شده است.",
        )

    tag = SmartCollarTag(hardware_uid=payload.hardware_uid)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)

    return SmartTagResponse(
        id=tag.id,
        hardware_uid=tag.hardware_uid,
        hardware_token=tag.hardware_token,
        pet_id=tag.pet_id,
        is_claimed=tag.is_claimed,
        is_revoked=tag.is_revoked,
        claimed_at=tag.claimed_at,
        created_at=tag.created_at,
    )


@router.post("/claim", response_model=SmartTagResponse)
async def claim_nfc_tag(
    payload: ClaimTagPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Pet owner pairs an authentic Bonyo NFC Collar Tag to their verified pet.
    """
    # 1. Verify user owns this pet
    pet_stmt = select(Pet).where(Pet.id == payload.pet_id, Pet.user_id == current_user.id)
    pet = (await db.execute(pet_stmt)).scalar_one_or_none()
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="حیوان خانگی یافت نشد یا شما مالک این پت نیستید.",
        )

    # 2. Look up tag by hardware_uid
    tag_stmt = select(SmartCollarTag).where(SmartCollarTag.hardware_uid == payload.hardware_uid)
    tag = (await db.execute(tag_stmt)).scalar_one_or_none()
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="تگ هوشمند با این شناسه سخت‌افزاری در سامانه یافت نشد.",
        )

    if tag.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="این تگ هوشمند قبلاً باطل شده است و امکان اتصال مجدد ندارد.",
        )

    if tag.is_claimed and tag.pet_id != pet.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="این تگ قبلاً به حیوان خانگی دیگری متصل شده است.",
        )

    tag.pet_id = pet.id
    tag.is_claimed = True
    tag.claimed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(tag)

    return SmartTagResponse(
        id=tag.id,
        hardware_uid=tag.hardware_uid,
        hardware_token=tag.hardware_token,
        pet_id=tag.pet_id,
        is_claimed=tag.is_claimed,
        is_revoked=tag.is_revoked,
        claimed_at=tag.claimed_at,
        created_at=tag.created_at,
    )


@router.get("/resolve/{hardware_token}", response_model=NfcPublicResolveResponse)
async def resolve_nfc_tap(
    hardware_token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Public lookup triggered when a smartphone taps the physical NFC collar tag.
    Returns emergency contact and lost alert status without exposing private clinical notes.
    """
    tag_stmt = (
        select(SmartCollarTag)
        .options(selectinload(SmartCollarTag.pet).selectinload(Pet.owner))
        .where(SmartCollarTag.hardware_token == hardware_token)
    )
    tag = (await db.execute(tag_stmt)).scalar_one_or_none()

    if not tag or tag.is_revoked:
        return NfcPublicResolveResponse(
            status="REVOKED_OR_INVALID",
            is_active=False,
            is_lost=False,
            lost_alert_message="این تگ هوشمند غیرفعال یا باطل شده است.",
        )

    if not tag.is_claimed or not tag.pet:
        return NfcPublicResolveResponse(
            status="UNCLAIMED",
            is_active=True,
            is_lost=False,
            lost_alert_message="این تگ هوشمند هنوز توسط مالکی فعال نشده است.",
        )

    pet = tag.pet
    owner = pet.owner

    return NfcPublicResolveResponse(
        status="ACTIVE",
        is_active=True,
        is_lost=pet.is_lost,
        lost_alert_message=pet.lost_alert_message if pet.is_lost else None,
        pet={
            "id": pet.id,
            "name": pet.name,
            "species": pet.species.value if hasattr(pet.species, "value") else str(pet.species),
            "breed": pet.breed,
            "avatar_url": pet.avatar_url,
            "qr_passport_token": pet.qr_passport_token,
        },
        emergency_contact={
            "contact_name": owner.full_name or "سرپرست حیوان",
            "phone": owner.phone_number if pet.is_lost else (owner.phone_number[:4] + "***" + owner.phone_number[-4:] if owner.phone_number else None),
        } if owner else None,
    )


@router.post("/{tag_id}/revoke")
async def revoke_nfc_tag(
    tag_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Revoke a compromised or lost smart collar tag.
    """
    tag_stmt = select(SmartCollarTag).options(selectinload(SmartCollarTag.pet)).where(SmartCollarTag.id == tag_id)
    tag = (await db.execute(tag_stmt)).scalar_one_or_none()

    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="تگ هوشمند یافت نشد.")

    # Ownership check: tag must belong to a pet owned by current_user
    if tag.pet and tag.pet.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی ابطال این تگ هوشمند را ندارید.",
        )

    tag.is_revoked = True
    tag.is_claimed = False
    await db.commit()

    return {"message": "تگ هوشمند با موفقیت ابطال و غیرفعال شد.", "tag_id": tag_id, "is_revoked": True}
