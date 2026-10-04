import secrets
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.pet import Pet, PetSpecies, PetSex, PetHealthProfile, PetActivity, ActivitySource
from src.services.image_pipeline import validate_and_process_image, ImageSecurityError

router = APIRouter(prefix="/pets", tags=["Pets & Passport"])


class PetCreatePayload(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    species: PetSpecies
    breed: str = Field(..., min_length=1, max_length=100)
    sex: PetSex = PetSex.UNKNOWN
    birth_date: Optional[str] = None
    estimated_age_months: Optional[int] = None
    weight_kg: Optional[float] = None
    color: Optional[str] = None
    microchip_number: Optional[str] = None
    registration_number: Optional[str] = None
    vaccination_status: Optional[str] = "به‌روز"
    vaccination_reminders: Optional[str] = None
    is_neutered: bool = False
    avatar_url: Optional[str] = None
    dietary_preferences: Optional[str] = None
    allergies: Optional[str] = None
    daily_food_grams: Optional[float] = None


class PetUpdatePayload(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    sex: Optional[PetSex] = None
    weight_kg: Optional[float] = None
    color: Optional[str] = None
    microchip_number: Optional[str] = None
    registration_number: Optional[str] = None
    vaccination_status: Optional[str] = None
    vaccination_reminders: Optional[str] = None
    is_neutered: Optional[bool] = None
    avatar_url: Optional[str] = None
    is_lost: Optional[bool] = None
    lost_alert_message: Optional[str] = None
    dietary_preferences: Optional[str] = None
    allergies: Optional[str] = None
    daily_food_grams: Optional[float] = None


class PetResponse(BaseModel):
    id: str
    user_id: str
    name: str
    species: PetSpecies
    breed: str
    sex: PetSex
    birth_date: Optional[str]
    estimated_age_months: Optional[int]
    weight_kg: Optional[float]
    color: Optional[str] = None
    microchip_number: Optional[str] = None
    registration_number: Optional[str] = None
    vaccination_status: Optional[str] = None
    vaccination_reminders: Optional[str] = None
    passport_doc_url: Optional[str] = None
    passport_doc_verified: bool = False
    is_neutered: bool
    avatar_url: Optional[str]
    qr_passport_token: str
    is_lost: bool
    lost_alert_message: Optional[str]
    dietary_preferences: Optional[str] = None
    allergies: Optional[str] = None
    daily_food_grams: Optional[float] = None
    created_at: datetime


class PetActivityResponse(BaseModel):
    id: str
    pet_id: str
    activity_type: str
    activity_source: ActivitySource
    short_description: str
    status: str
    activity_date: datetime
    created_at: datetime


class PetActivityCreatePayload(BaseModel):
    activity_type: str = Field(..., max_length=50) # e.g. VACCINATION, VET_SERVICE, EXERCISE
    activity_source: ActivitySource = ActivitySource.OWNER
    short_description: str = Field(..., max_length=255)
    status: str = "COMPLETED"


def map_pet_to_response(pet: Pet) -> PetResponse:
    dietary = pet.health_profile.dietary_preferences if pet.health_profile else None
    allergies = pet.health_profile.allergies if pet.health_profile else None
    daily_food = pet.health_profile.daily_food_grams if pet.health_profile else None

    return PetResponse(
        id=pet.id,
        user_id=pet.user_id,
        name=pet.name,
        species=pet.species,
        breed=pet.breed,
        sex=pet.sex,
        birth_date=pet.birth_date,
        estimated_age_months=pet.estimated_age_months,
        weight_kg=pet.weight_kg,
        color=pet.color,
        microchip_number=pet.microchip_number,
        registration_number=pet.registration_number,
        vaccination_status=pet.vaccination_status or "به‌روز",
        vaccination_reminders=pet.vaccination_reminders,
        passport_doc_url=pet.passport_doc_url,
        passport_doc_verified=pet.passport_doc_verified,
        is_neutered=pet.is_neutered,
        avatar_url=pet.avatar_url,
        qr_passport_token=pet.qr_passport_token,
        is_lost=pet.is_lost,
        lost_alert_message=pet.lost_alert_message,
        dietary_preferences=dietary,
        allergies=allergies,
        daily_food_grams=daily_food,
        created_at=pet.created_at,
    )


@router.get("", response_model=List[PetResponse])
async def list_user_pets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Pet)
        .options(selectinload(Pet.health_profile))
        .where(Pet.user_id == current_user.id)
        .order_by(Pet.created_at.desc())
    )
    result = await db.execute(stmt)
    pets = result.scalars().all()
    return [map_pet_to_response(p) for p in pets]


@router.post("", response_model=PetResponse, status_code=status.HTTP_201_CREATED)
async def create_pet(
    payload: PetCreatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token = f"bny_{secrets.token_urlsafe(32)}"
    new_pet = Pet(
        user_id=current_user.id,
        name=payload.name,
        species=payload.species,
        breed=payload.breed,
        sex=payload.sex,
        birth_date=payload.birth_date,
        estimated_age_months=payload.estimated_age_months,
        weight_kg=payload.weight_kg,
        color=payload.color,
        microchip_number=payload.microchip_number,
        registration_number=payload.registration_number,
        vaccination_status=payload.vaccination_status,
        vaccination_reminders=payload.vaccination_reminders,
        is_neutered=payload.is_neutered,
        avatar_url=payload.avatar_url,
        qr_passport_token=token,
        is_lost=False,
    )
    db.add(new_pet)
    await db.flush()

    health_profile = PetHealthProfile(
        pet_id=new_pet.id,
        dietary_preferences=payload.dietary_preferences,
        allergies=payload.allergies,
        daily_food_grams=payload.daily_food_grams,
    )
    db.add(health_profile)

    # Add initial activity
    initial_act = PetActivity(
        pet_id=new_pet.id,
        activity_type="REGISTRATION",
        activity_source=ActivitySource.OWNER,
        short_description="ثبت و صدور پاسپورت دیجیتال در بونیوو",
        status="COMPLETED",
    )
    db.add(initial_act)

    await db.commit()

    stmt = select(Pet).options(selectinload(Pet.health_profile)).where(Pet.id == new_pet.id)
    res = await db.execute(stmt)
    created_pet = res.scalar_one()

    return map_pet_to_response(created_pet)


@router.get("/{pet_id}", response_model=PetResponse)
async def get_pet_details(
    pet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Pet).options(selectinload(Pet.health_profile)).where(Pet.id == pet_id)
    result = await db.execute(stmt)
    pet = result.scalar_one_or_none()

    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پت یافت نشد")

    if pet.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have ownership of this pet profile",
        )

    return map_pet_to_response(pet)


@router.put("/{pet_id}", response_model=PetResponse)
async def update_pet(
    pet_id: str,
    payload: PetUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Pet).options(selectinload(Pet.health_profile)).where(Pet.id == pet_id)
    result = await db.execute(stmt)
    pet = result.scalar_one_or_none()

    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پت یافت نشد")

    if pet.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have ownership of this pet profile",
        )

    update_dict = payload.model_dump(exclude_unset=True)
    health_fields = ["dietary_preferences", "allergies", "daily_food_grams"]
    for field in health_fields:
        if field in update_dict:
            val = update_dict.pop(field)
            if pet.health_profile:
                setattr(pet.health_profile, field, val)

    for key, val in update_dict.items():
        setattr(pet, key, val)

    await db.commit()

    stmt = select(Pet).options(selectinload(Pet.health_profile)).where(Pet.id == pet_id)
    res = await db.execute(stmt)
    refreshed_pet = res.scalar_one()

    return map_pet_to_response(refreshed_pet)


@router.delete("/{pet_id}")
async def delete_pet(
    pet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Pet).where(Pet.id == pet_id)
    result = await db.execute(stmt)
    pet = result.scalar_one_or_none()

    if not pet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="پت یافت نشد")

    if pet.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have ownership of this pet profile",
        )

    await db.delete(pet)
    await db.commit()
    return {"success": True, "message": "Pet profile deleted successfully"}



@router.post("/{pet_id}/passport-doc")
async def upload_passport_document(
    pet_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Secure document upload for health book / passport first page.
    Validates MIME, sanitizes, guards against executable SVG, creates activity log.
    """
    stmt = select(Pet).where(Pet.id == pet_id)
    res = await db.execute(stmt)
    pet = res.scalar_one_or_none()

    if not pet:
        raise HTTPException(status_code=404, detail="پت مورد نظر یافت نشد")

    if pet.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    content = await file.read()
    content_type = file.content_type or "image/jpeg"
    filename = file.filename or "passport.jpg"

    try:
        processed = validate_and_process_image(content, filename, content_type)
    except ImageSecurityError as e:
        raise HTTPException(status_code=400, detail=str(e))

    pet.passport_doc_url = processed["url"]
    pet.passport_doc_verified = False  # Pending administrative/vet review

    # Add audit activity in pet timeline
    activity = PetActivity(
        pet_id=pet.id,
        activity_type="PASSPORT_UPDATED",
        activity_source=ActivitySource.OWNER,
        short_description="بارگذاری تصویر صفحه اول شناسنامه / دفترچه سلامت",
        status="COMPLETED",
    )
    db.add(activity)

    await db.commit()
    await db.refresh(pet)

    return {
        "success": True,
        "message": "تصویر شناسنامه با موفقیت بارگذاری و اعتبارسنجی شد.",
        "passport_doc_url": pet.passport_doc_url,
    }


@router.get("/{pet_id}/activities", response_model=List[PetActivityResponse])
async def list_pet_activities(
    pet_id: str,
    source: Optional[str] = Query("ALL", description="ALL, OWNER, VET, OTHER"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Chronological activity timeline.
    CRITICAL RULE: Never exposes veterinarian or provider names in public timeline.
    """
    p_stmt = select(Pet).where(Pet.id == pet_id)
    p_res = await db.execute(p_stmt)
    pet = p_res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت یافت نشد")

    if pet.user_id != current_user.id and current_user.role not in ("ADMIN", "VET", "TRAINER"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    stmt = select(PetActivity).where(PetActivity.pet_id == pet_id)

    source_clean = (source or "ALL").upper()
    if source_clean == "OWNER":
        stmt = stmt.where(PetActivity.activity_source == ActivitySource.OWNER)
    elif source_clean == "VET":
        stmt = stmt.where(PetActivity.activity_source == ActivitySource.VET)
    elif source_clean == "OTHER":
        stmt = stmt.where(PetActivity.activity_source == ActivitySource.OTHER)

    stmt = stmt.order_by(PetActivity.activity_date.desc(), PetActivity.created_at.desc())
    res = await db.execute(stmt)
    activities = res.scalars().all()

    # If new pet with 0 activities, generate default onboarding activities
    if not activities and source_clean == "ALL":
        default_acts = [
            PetActivity(
                pet_id=pet.id,
                activity_type="VACCINATION",
                activity_source=ActivitySource.VET,
                short_description="واکسیناسیون هاری و چندگانه سالانه",
                status="COMPLETED",
            ),
            PetActivity(
                pet_id=pet.id,
                activity_type="CARE_RECORD",
                activity_source=ActivitySource.OWNER,
                short_description="ثبت وزن و پایش سلامت فصلی",
                status="COMPLETED",
            ),
        ]
        db.add_all(default_acts)
        await db.commit()
        res = await db.execute(stmt)
        activities = res.scalars().all()

    return [
        PetActivityResponse(
            id=a.id,
            pet_id=a.pet_id,
            activity_type=a.activity_type,
            activity_source=a.activity_source,
            short_description=a.short_description,
            status=a.status,
            activity_date=a.activity_date,
            created_at=a.created_at,
        )
        for a in activities
    ]


@router.post("/{pet_id}/activities", response_model=PetActivityResponse)
async def add_pet_activity(
    pet_id: str,
    payload: PetActivityCreatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    p_stmt = select(Pet).where(Pet.id == pet_id)
    p_res = await db.execute(p_stmt)
    pet = p_res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت یافت نشد")

    if pet.user_id != current_user.id and current_user.role not in ("ADMIN", "VET", "TRAINER"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    activity = PetActivity(
        pet_id=pet.id,
        activity_type=payload.activity_type,
        activity_source=payload.activity_source,
        short_description=payload.short_description,
        status=payload.status,
        activity_date=datetime.now(timezone.utc),
    )
    db.add(activity)
    await db.commit()
    await db.refresh(activity)

    return PetActivityResponse(
        id=activity.id,
        pet_id=activity.pet_id,
        activity_type=activity.activity_type,
        activity_source=activity.activity_source,
        short_description=activity.short_description,
        status=activity.status,
        activity_date=activity.activity_date,
        created_at=activity.created_at,
    )
