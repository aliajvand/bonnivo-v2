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
from src.models.trainer import Trainer, TrainerSession, TrainerSessionStatus
from src.models.pet import Pet

router = APIRouter(prefix="/trainers", tags=["Trainers & Pet Training"])


class TrainerResponse(BaseModel):
    id: str
    full_name: str
    speciality: str
    city: str
    bio: str
    hourly_rate_toman: int
    avatar_url: str
    rating: float
    reviews_count: int
    available_days: list
    blocked_dates: list


class TrainerBookingPayload(BaseModel):
    pet_id: str
    session_date: str  # YYYY-MM-DD
    timeslot: str
    session_type: Optional[str] = "آموزش مقدماتی"


class SessionCompletePayload(BaseModel):
    what_was_taught: str
    session_notes_owner_safe: str
    homework_exercises: Optional[str] = None
    internal_private_notes: Optional[str] = None
    recommended_next_session_date: Optional[str] = None


class TrainerSessionResponse(BaseModel):
    id: str
    trainer_id: str
    trainer_name: str
    pet_id: str
    pet_name: str
    session_date: str
    timeslot: str
    status: TrainerSessionStatus
    fee_toman: int
    session_type: Optional[str]
    what_was_taught: Optional[str]
    session_notes_owner_safe: Optional[str]
    homework_exercises: Optional[str]
    recommended_next_session_date: Optional[str]
    created_at: datetime


@router.get("", response_model=List[TrainerResponse])
async def list_trainers(
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Trainer).where(Trainer.is_active == True)
    if city:
        stmt = stmt.where(Trainer.city == city)
    res = await db.execute(stmt)
    trainers = res.scalars().all()

    # If database is empty on fresh dev run, seed 3 realistic trainers
    if not trainers:
        sample_trainers = [
            Trainer(
                user_id="seed_trainer_1",
                full_name="مهندس امیر حسینی",
                speciality="مربی بین‌المللی رفتارشناسی و اصلاح ناهنجاری سگ",
                city="تهران",
                bio="دارای مدرک بین‌المللی رفتارشناسی حیوانات و بیش از ۸ سال سابقه در مربیگری و آموزش اطاعت‌پذیری.",
                hourly_rate_toman=400000,
                avatar_url="/icons/trainer.svg",
                rating=4.9,
                reviews_count=24,
            ),
            Trainer(
                user_id="seed_trainer_2",
                full_name="خانم سارا کاظمی",
                speciality="آموزش مقدماتی، سگ کار و جامعه‌پذیری توله‌ها",
                city="تهران",
                bio="تخصص در جامعه‌پذیری و کنترل استرس جدایی در سگ‌های خانگی.",
                hourly_rate_toman=350000,
                avatar_url="/icons/trainer.svg",
                rating=4.8,
                reviews_count=19,
            ),
        ]
        db.add_all(sample_trainers)
        await db.commit()
        res = await db.execute(stmt)
        trainers = res.scalars().all()

    return [
        TrainerResponse(
            id=t.id,
            full_name=t.full_name,
            speciality=t.speciality,
            city=t.city,
            bio=t.bio,
            hourly_rate_toman=t.hourly_rate_toman,
            avatar_url=t.avatar_url or "/icons/trainer.svg",
            rating=t.rating,
            reviews_count=t.reviews_count,
            available_days=t.available_days or [],
            blocked_dates=t.blocked_dates or [],
        )
        for t in trainers
    ]


@router.get("/{trainer_id}", response_model=TrainerResponse)
async def get_trainer_detail(
    trainer_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Trainer).where(Trainer.id == trainer_id)
    res = await db.execute(stmt)
    t = res.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail="مربی یافت نشد")

    return TrainerResponse(
        id=t.id,
        full_name=t.full_name,
        speciality=t.speciality,
        city=t.city,
        bio=t.bio,
        hourly_rate_toman=t.hourly_rate_toman,
        avatar_url=t.avatar_url or "/icons/trainer.svg",
        rating=t.rating,
        reviews_count=t.reviews_count,
        available_days=t.available_days or [],
        blocked_dates=t.blocked_dates or [],
    )


@router.post("/{trainer_id}/book", response_model=TrainerSessionResponse)
async def book_trainer_session(
    trainer_id: str,
    payload: TrainerBookingPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    t_stmt = select(Trainer).where(Trainer.id == trainer_id)
    t_res = await db.execute(t_stmt)
    trainer = t_res.scalar_one_or_none()
    if not trainer:
        raise HTTPException(status_code=404, detail="مربی یافت نشد")

    p_stmt = select(Pet).where(Pet.id == payload.pet_id)
    p_res = await db.execute(p_stmt)
    pet = p_res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت مورد نظر یافت نشد")

    if pet.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما مجاز به رزرو نوبت مربی برای پت سایر کاربران نیستید.",
        )

    # Check blocked dates
    if payload.session_date in (trainer.blocked_dates or []):
        raise HTTPException(status_code=400, detail="مربی در این تاریخ نوبت خالی ندارد.")

    session = TrainerSession(
        trainer_id=trainer.id,
        user_id=current_user.id,
        pet_id=pet.id,
        session_date=payload.session_date,
        timeslot=payload.timeslot,
        session_type=payload.session_type,
        fee_toman=trainer.hourly_rate_toman,
        status=TrainerSessionStatus.CONFIRMED,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return TrainerSessionResponse(
        id=session.id,
        trainer_id=trainer.id,
        trainer_name=trainer.full_name,
        pet_id=pet.id,
        pet_name=pet.name,
        session_date=session.session_date,
        timeslot=session.timeslot,
        status=session.status,
        fee_toman=session.fee_toman,
        session_type=session.session_type,
        what_was_taught=session.what_was_taught,
        session_notes_owner_safe=session.session_notes_owner_safe,
        homework_exercises=session.homework_exercises,
        recommended_next_session_date=session.recommended_next_session_date,
        created_at=session.created_at,
    )


@router.post("/sessions/{session_id}/complete")
async def record_completed_session(
    session_id: str,
    payload: SessionCompletePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(TrainerSession)
        .options(selectinload(TrainerSession.trainer))
        .where(TrainerSession.id == session_id)
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="جلسه آموزشی یافت نشد")

    is_admin = current_user.role in (UserRole.ADMIN, "ADMIN")
    is_assigned_trainer = session.trainer and session.trainer.user_id == current_user.id
    if not is_admin and not is_assigned_trainer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ثبت گزارش جلسه آموزشی فقط توسط مربی اختصاص‌یافته یا مدیر امکان‌پذیر است.",
        )

    session.what_was_taught = payload.what_was_taught
    session.session_notes_owner_safe = payload.session_notes_owner_safe
    session.homework_exercises = payload.homework_exercises
    session.internal_private_notes = payload.internal_private_notes
    session.recommended_next_session_date = payload.recommended_next_session_date
    session.status = TrainerSessionStatus.COMPLETED

    await db.commit()
    await db.refresh(session)

    return {
        "success": True,
        "message": "اطلاعات جلسه آموزشی با موفقیت ثبت شد و در دسترس صاحب پت قرار گرفت.",
        "session_id": session.id,
    }


@router.get("/sessions/my-sessions", response_model=List[TrainerSessionResponse])
async def list_my_trainer_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(TrainerSession)
        .options(selectinload(TrainerSession.trainer), selectinload(TrainerSession.pet))
        .where(TrainerSession.user_id == current_user.id)
        .order_by(TrainerSession.session_date.desc())
    )
    res = await db.execute(stmt)
    sessions = res.scalars().all()

    return [
        TrainerSessionResponse(
            id=s.id,
            trainer_id=s.trainer.id,
            trainer_name=s.trainer.full_name,
            pet_id=s.pet.id,
            pet_name=s.pet.name,
            session_date=s.session_date,
            timeslot=s.timeslot,
            status=s.status,
            fee_toman=s.fee_toman,
            session_type=s.session_type,
            what_was_taught=s.what_was_taught,
            session_notes_owner_safe=s.session_notes_owner_safe,
            homework_exercises=s.homework_exercises,
            recommended_next_session_date=s.recommended_next_session_date,
            created_at=s.created_at,
        )
        for s in sessions
    ]
