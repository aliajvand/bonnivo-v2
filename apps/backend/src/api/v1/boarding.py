from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User, UserRole
from src.models.boarding import BoardingCenter, BoardingBooking, BoardingBookingStatus
from src.models.pet import Pet

router = APIRouter(prefix="/boarding", tags=["Pet Boarding & Daycare"])


class BoardingCenterResponse(BaseModel):
    id: str
    name: str
    slug: str
    city: str
    district: str
    address: str
    phone_number: str
    rating: float
    reviews_count: int
    daily_rate_toman: int
    capacity: int
    services: list
    image_url: str
    latitude: float
    longitude: float


class BoardingBookingPayload(BaseModel):
    pet_id: str
    check_in_date: str   # YYYY-MM-DD
    check_out_date: str  # YYYY-MM-DD
    special_instructions: Optional[str] = None


class BoardingBookingResponse(BaseModel):
    id: str
    center_id: str
    center_name: str
    pet_id: str
    pet_name: str
    check_in_date: str
    check_out_date: str
    total_days: int
    total_fee_toman: int
    status: BoardingBookingStatus
    created_at: datetime


@router.get("", response_model=List[BoardingCenterResponse])
async def list_boarding_centers(
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BoardingCenter).where(BoardingCenter.is_active == True)
    if city:
        stmt = stmt.where(BoardingCenter.city == city)
    res = await db.execute(stmt)
    centers = res.scalars().all()

    # Seed initial centers if database is fresh
    if not centers:
        sample_centers = [
            BoardingCenter(
                name="پانسیون و هتل ۵ ستاره پت پایتخت",
                slug="paytakht-pet-resort",
                city="تهران",
                district="زعفرانیه",
                address="زعفرانیه، خیابان آصف، کوچه سوم، پلاک ۱۲",
                phone_number="021-22448899",
                rating=4.9,
                reviews_count=32,
                daily_rate_toman=320000,
                capacity=25,
                services=["سوئیت‌های اختصاصی شیشه‌ای", "پایش ۲۴ ساعته دامپزشکی", "حیاط چمن بازی اختصاصی", "دوربین مداربسته زنده برای سرپرست"],
                image_url="/icons/home-care.svg",
                latitude=35.8050,
                longitude=51.4150,
            ),
            BoardingCenter(
                name="دهکده حیوانات خانگی بانی‌سنتر",
                slug="boni-center-village",
                city="تهران",
                district="لواسان",
                address="لواسان، بلوار امام، جنب پارک ساحلی",
                phone_number="021-26554411",
                rating=4.8,
                reviews_count=21,
                daily_rate_toman=280000,
                capacity=30,
                services=["فضای بازی آزاد ۵۰۰ متری", "استخر آب‌درمانی و بازی", "تغذیه سوپرمی تجویزی", "گزارش روزانه و عکس و فیلم"],
                image_url="/icons/home-care.svg",
                latitude=35.8200,
                longitude=51.5800,
            ),
        ]
        db.add_all(sample_centers)
        await db.commit()
        res = await db.execute(stmt)
        centers = res.scalars().all()

    return [
        BoardingCenterResponse(
            id=c.id,
            name=c.name,
            slug=c.slug,
            city=c.city,
            district=c.district,
            address=c.address,
            phone_number=c.phone_number,
            rating=c.rating,
            reviews_count=c.reviews_count,
            daily_rate_toman=c.daily_rate_toman,
            capacity=c.capacity,
            services=c.services or [],
            image_url=c.image_url or "/icons/home-care.svg",
            latitude=c.latitude,
            longitude=c.longitude,
        )
        for c in centers
    ]


@router.get("/{center_id}", response_model=BoardingCenterResponse)
async def get_boarding_center_detail(
    center_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(BoardingCenter).where(BoardingCenter.id == center_id)
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="مرکز پانسیون یافت نشد")

    return BoardingCenterResponse(
        id=c.id,
        name=c.name,
        slug=c.slug,
        city=c.city,
        district=c.district,
        address=c.address,
        phone_number=c.phone_number,
        rating=c.rating,
        reviews_count=c.reviews_count,
        daily_rate_toman=c.daily_rate_toman,
        capacity=c.capacity,
        services=c.services or [],
        image_url=c.image_url or "/icons/home-care.svg",
        latitude=c.latitude,
        longitude=c.longitude,
    )


@router.post("/{center_id}/book", response_model=BoardingBookingResponse)
async def book_boarding_stay(
    center_id: str,
    payload: BoardingBookingPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    c_stmt = select(BoardingCenter).where(BoardingCenter.id == center_id)
    c_res = await db.execute(c_stmt)
    center = c_res.scalar_one_or_none()
    if not center:
        raise HTTPException(status_code=404, detail="مرکز پانسیون یافت نشد")

    p_stmt = select(Pet).where(Pet.id == payload.pet_id)
    p_res = await db.execute(p_stmt)
    pet = p_res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت مورد نظر یافت نشد")
    if pet.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما مجاز به رزرو پانسیون برای پت سایر کاربران نیستید.",
        )

    try:
        d1 = datetime.strptime(payload.check_in_date, "%Y-%m-%d")
        d2 = datetime.strptime(payload.check_out_date, "%Y-%m-%d")
        days = max(1, (d2 - d1).days)
    except Exception:
        days = 1

    total_fee = days * center.daily_rate_toman

    booking = BoardingBooking(
        center_id=center.id,
        user_id=current_user.id,
        pet_id=pet.id,
        check_in_date=payload.check_in_date,
        check_out_date=payload.check_out_date,
        total_days=days,
        total_fee_toman=total_fee,
        special_instructions=payload.special_instructions,
        status=BoardingBookingStatus.CONFIRMED,
        is_paid=True,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    return BoardingBookingResponse(
        id=booking.id,
        center_id=center.id,
        center_name=center.name,
        pet_id=pet.id,
        pet_name=pet.name,
        check_in_date=booking.check_in_date,
        check_out_date=booking.check_out_date,
        total_days=booking.total_days,
        total_fee_toman=booking.total_fee_toman,
        status=booking.status,
        created_at=booking.created_at,
    )
