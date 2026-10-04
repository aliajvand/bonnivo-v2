from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.pet import PetSpecies, PetSex
from src.models.adoption import (
    AdoptionListing,
    AdoptionApplication,
    AdoptionStatus,
    ApplicationStatus,
)

router = APIRouter(prefix="/adoption", tags=["Ethical Pet Adoption & Rehoming Hub"])


class CreateListingPayload(BaseModel):
    pet_name: str = Field(..., min_length=2, max_length=50)
    species: PetSpecies
    breed: str = Field(..., min_length=2, max_length=100)
    age_months: int = Field(..., ge=1, le=240)
    sex: PetSex = PetSex.UNKNOWN
    description: str = Field(..., min_length=10)
    city: str = Field(default="تهران")
    district: Optional[int] = Field(None, ge=1, le=22)
    health_status: str = Field(default="سالم و دارای شناسنامه")
    vaccination_status: str = Field(default="واکسیناسیون کامل")
    is_neutered: bool = False
    adoption_fee_tomans: int = Field(default=0, description="Strictly 0 for ethical rehoming")
    photo_url: Optional[str] = None


class ListingResponse(BaseModel):
    id: str
    publisher_id: str
    pet_name: str
    species: str
    breed: str
    age_months: int
    sex: str
    description: str
    city: str
    district: Optional[int]
    health_status: str
    vaccination_status: str
    is_neutered: bool
    adoption_fee_tomans: int
    status: str
    photo_url: Optional[str]
    created_at: datetime


class SubmitApplicationPayload(BaseModel):
    listing_id: str
    applicant_name: str = Field(..., min_length=3)
    applicant_phone: str = Field(..., min_length=10)
    experience_years: int = Field(default=0, ge=0)
    has_other_pets: bool = False
    housing_type: str = Field(default="آپارتمان")
    motivation: str = Field(..., min_length=10)


class ApplicationResponse(BaseModel):
    id: str
    listing_id: str
    applicant_id: str
    applicant_name: str
    applicant_phone: str
    experience_years: int
    has_other_pets: bool
    housing_type: str
    motivation: str
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime]


class ReviewApplicationPayload(BaseModel):
    action: ApplicationStatus = Field(..., description="APPROVED or REJECTED")


async def ensure_seed_listings(db: AsyncSession, publisher_id: str):
    """Seed ethical demo listings if database is empty"""
    count_stmt = select(AdoptionListing)
    existing = (await db.execute(count_stmt)).scalars().first()
    if not existing:
        seed_items = [
            AdoptionListing(
                publisher_id=publisher_id,
                pet_name="میشا",
                species=PetSpecies.CAT,
                breed="DSH ایرانی",
                age_months=8,
                sex=PetSex.FEMALE,
                description="میشا یک گربه بسیار آرام و خرخرو است که از خیابان امداد شده و الان کاملاً درمان شده است.",
                city="تهران",
                district=2,
                health_status="کاملاً سالم و انگل‌تراپی شده",
                vaccination_status="دوز اول و دوم سه گانه تزریق شده",
                is_neutered=True,
                adoption_fee_tomans=0,
                status=AdoptionStatus.AVAILABLE,
                photo_url="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop",
            ),
            AdoptionListing(
                publisher_id=publisher_id,
                pet_name="تدی",
                species=PetSpecies.DOG,
                breed="میکس تریر",
                age_months=14,
                sex=PetSex.MALE,
                description="تدی پرانرژی و مهربان است، آموزش‌های مقدماتی را دیده و به خانواده‌ای متعهد و پرمحبت واگذار می‌شود.",
                city="تهران",
                district=5,
                health_status="چکاپ کامل انجام شده، سلامت جسمانی عالی",
                vaccination_status="هاری و چندگانه کامل",
                is_neutered=True,
                adoption_fee_tomans=0,
                status=AdoptionStatus.AVAILABLE,
                photo_url="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop",
            ),
        ]
        db.add_all(seed_items)
        await db.commit()


@router.get("/listings", response_model=List[ListingResponse])
async def list_adoption_listings(
    species: Optional[PetSpecies] = None,
    district: Optional[int] = Query(None, ge=1, le=22),
    db: AsyncSession = Depends(get_db),
):
    """
    Explore available ethical rescue and rehoming pet listings.
    """
    # Auto-seed if needed with system user
    user_stmt = select(User).limit(1)
    first_user = (await db.execute(user_stmt)).scalar_one_or_none()
    if first_user:
        await ensure_seed_listings(db, first_user.id)

    query = select(AdoptionListing).where(AdoptionListing.status == AdoptionStatus.AVAILABLE).order_by(AdoptionListing.created_at.desc())
    if species:
        query = query.where(AdoptionListing.species == species)
    if district:
        query = query.where(AdoptionListing.district == district)

    listings = (await db.execute(query)).scalars().all()

    return [
        ListingResponse(
            id=item.id,
            publisher_id=item.publisher_id,
            pet_name=item.pet_name,
            species=item.species.value if hasattr(item.species, "value") else str(item.species),
            breed=item.breed,
            age_months=item.age_months,
            sex=item.sex.value if hasattr(item.sex, "value") else str(item.sex),
            description=item.description,
            city=item.city,
            district=item.district,
            health_status=item.health_status,
            vaccination_status=item.vaccination_status,
            is_neutered=item.is_neutered,
            adoption_fee_tomans=item.adoption_fee_tomans,
            status=item.status.value,
            photo_url=item.photo_url,
            created_at=item.created_at,
        )
        for item in listings
    ]


@router.post("/listings", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_adoption_listing(
    payload: CreateListingPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Publish an ethical rehoming profile. Strictly rejects commercial sales (fee must be 0).
    """
    if payload.adoption_fee_tomans > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="خرید و فروش تجاری حیوانات در بونیو اکیداً ممنوع است. واگذاری صرفاً باید رایگان و حمایتی (۰ تومان) باشد.",
        )

    listing = AdoptionListing(
        publisher_id=current_user.id,
        pet_name=payload.pet_name,
        species=payload.species,
        breed=payload.breed,
        age_months=payload.age_months,
        sex=payload.sex,
        description=payload.description,
        city=payload.city,
        district=payload.district,
        health_status=payload.health_status,
        vaccination_status=payload.vaccination_status,
        is_neutered=payload.is_neutered,
        adoption_fee_tomans=0,
        status=AdoptionStatus.AVAILABLE,
        photo_url=payload.photo_url,
    )
    db.add(listing)
    await db.commit()
    await db.refresh(listing)

    return ListingResponse(
        id=listing.id,
        publisher_id=listing.publisher_id,
        pet_name=listing.pet_name,
        species=listing.species.value if hasattr(listing.species, "value") else str(listing.species),
        breed=listing.breed,
        age_months=listing.age_months,
        sex=listing.sex.value if hasattr(listing.sex, "value") else str(listing.sex),
        description=listing.description,
        city=listing.city,
        district=listing.district,
        health_status=listing.health_status,
        vaccination_status=listing.vaccination_status,
        is_neutered=listing.is_neutered,
        adoption_fee_tomans=listing.adoption_fee_tomans,
        status=listing.status.value,
        photo_url=listing.photo_url,
        created_at=listing.created_at,
    )


@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_adoption_application(
    payload: SubmitApplicationPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Prospective pet guardian submits an adoption and suitability application.
    """
    listing_stmt = select(AdoptionListing).where(AdoptionListing.id == payload.listing_id)
    listing = (await db.execute(listing_stmt)).scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="آگهی واگذاری یافت نشد.")

    if listing.publisher_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شما نمی‌توانید برای آگهی واگذاری ثبت شده توسط خودتان درخواست ثبت کنید.",
        )

    # Check for duplicate pending application
    dup_stmt = select(AdoptionApplication).where(
        AdoptionApplication.listing_id == payload.listing_id,
        AdoptionApplication.applicant_id == current_user.id,
        AdoptionApplication.status == ApplicationStatus.PENDING,
    )
    existing_app = (await db.execute(dup_stmt)).scalar_one_or_none()
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="شما قبلاً یک درخواست در حال بررسی برای این حیوان ثبت کرده‌اید.",
        )

    application = AdoptionApplication(
        listing_id=listing.id,
        applicant_id=current_user.id,
        applicant_name=payload.applicant_name,
        applicant_phone=payload.applicant_phone,
        experience_years=payload.experience_years,
        has_other_pets=payload.has_other_pets,
        housing_type=payload.housing_type,
        motivation=payload.motivation,
        status=ApplicationStatus.PENDING,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)

    return ApplicationResponse(
        id=application.id,
        listing_id=application.listing_id,
        applicant_id=application.applicant_id,
        applicant_name=application.applicant_name,
        applicant_phone=application.applicant_phone,
        experience_years=application.experience_years,
        has_other_pets=application.has_other_pets,
        housing_type=application.housing_type,
        motivation=application.motivation,
        status=application.status.value,
        created_at=application.created_at,
        reviewed_at=application.reviewed_at,
    )


@router.get("/applications/my", response_model=List[ApplicationResponse])
async def list_my_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List adoption applications submitted by the current authenticated user.
    """
    stmt = (
        select(AdoptionApplication)
        .where(AdoptionApplication.applicant_id == current_user.id)
        .order_by(AdoptionApplication.created_at.desc())
    )
    apps = (await db.execute(stmt)).scalars().all()

    return [
        ApplicationResponse(
            id=a.id,
            listing_id=a.listing_id,
            applicant_id=a.applicant_id,
            applicant_name=a.applicant_name,
            applicant_phone=a.applicant_phone,
            experience_years=a.experience_years,
            has_other_pets=a.has_other_pets,
            housing_type=a.housing_type,
            motivation=a.motivation,
            status=a.status.value,
            created_at=a.created_at,
            reviewed_at=a.reviewed_at,
        )
        for a in apps
    ]


@router.get("/listings/{listing_id}/applications", response_model=List[ApplicationResponse])
async def get_listing_applications(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Listing owner reviews submitted guardian applications. Enforces strict IDOR ownership.
    """
    listing_stmt = select(AdoptionListing).where(AdoptionListing.id == listing_id)
    listing = (await db.execute(listing_stmt)).scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="آگهی واگذاری یافت نشد.")

    if listing.publisher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="تنها ثبت‌کننده آگهی مجاز به مشاهده درخواست‌های واگذاری این حیوان است.",
        )

    apps_stmt = select(AdoptionApplication).where(AdoptionApplication.listing_id == listing_id)
    apps = (await db.execute(apps_stmt)).scalars().all()

    return [
        ApplicationResponse(
            id=a.id,
            listing_id=a.listing_id,
            applicant_id=a.applicant_id,
            applicant_name=a.applicant_name,
            applicant_phone=a.applicant_phone,
            experience_years=a.experience_years,
            has_other_pets=a.has_other_pets,
            housing_type=a.housing_type,
            motivation=a.motivation,
            status=a.status.value,
            created_at=a.created_at,
            reviewed_at=a.reviewed_at,
        )
        for a in apps
    ]


@router.put("/applications/{application_id}/review", response_model=ApplicationResponse)
async def review_adoption_application(
    application_id: str,
    payload: ReviewApplicationPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Listing publisher approves or rejects an adoption applicant.
    """
    app_stmt = (
        select(AdoptionApplication)
        .options(selectinload(AdoptionApplication.listing))
        .where(AdoptionApplication.id == application_id)
    )
    application = (await db.execute(app_stmt)).scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="درخواست واگذاری یافت نشد.")

    if application.listing.publisher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی بررسی درخواست‌های این آگهی را ندارید.",
        )

    application.status = payload.action
    application.reviewed_at = datetime.now(timezone.utc)

    if payload.action == ApplicationStatus.APPROVED:
        application.listing.status = AdoptionStatus.ADOPTED

    await db.commit()
    await db.refresh(application)

    return ApplicationResponse(
        id=application.id,
        listing_id=application.listing_id,
        applicant_id=application.applicant_id,
        applicant_name=application.applicant_name,
        applicant_phone=application.applicant_phone,
        experience_years=application.experience_years,
        has_other_pets=application.has_other_pets,
        housing_type=application.housing_type,
        motivation=application.motivation,
        status=application.status.value,
        created_at=application.created_at,
        reviewed_at=application.reviewed_at,
    )
