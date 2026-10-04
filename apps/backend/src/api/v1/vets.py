from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User, UserRole
from src.models.pet import Pet
from src.models.vet import Clinic, Veterinarian, Appointment, AppointmentStatus, MedicalRecord
from src.models.wallet import Wallet, WalletTransaction, TransactionType

router = APIRouter(prefix="/vets", tags=["Veterinary & Clinics"])


# Schemas
class ClinicSummaryResponse(BaseModel):
    id: str
    name: str
    slug: str
    district: str
    address: str
    phone_number: str
    rating: float
    reviews_count: int
    is_emergency_24h: bool
    services: list
    image_url: str
    latitude: float
    longitude: float


class VeterinarianResponse(BaseModel):
    id: str
    clinic_id: str
    full_name: str
    medical_license_number: str
    speciality: str
    avatar_url: str
    bio: str
    consultation_fee_toman: int
    is_active: bool
    blocked_dates: list


class ClinicDetailResponse(ClinicSummaryResponse):
    veterinarians: List[VeterinarianResponse]


class TimeslotItem(BaseModel):
    time: str
    is_available: bool


class BookAppointmentPayload(BaseModel):
    pet_id: str
    clinic_id: str
    vet_id: str
    appointment_date: str  # YYYY-MM-DD
    timeslot: str  # e.g. "16:00 - 16:30"
    reason_for_visit: str
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: str
    pet_id: str
    pet_name: str
    clinic_id: str
    clinic_name: str
    vet_id: str
    vet_name: str
    vet_speciality: str
    appointment_date: str
    timeslot: str
    status: AppointmentStatus
    reason_for_visit: str
    total_fee_toman: int
    cancellation_fee_toman: int
    refund_amount_toman: int
    is_paid: bool
    treatment_summary: Optional[str] = None
    treatment_performed: Optional[str] = None
    next_visit_needed: bool = False
    recommended_next_visit: Optional[str] = None
    reminder_required: bool = False
    created_at: datetime


class ClinicalNotesPayload(BaseModel):
    reason_for_visit: Optional[str] = None
    treatment_summary: str = Field(..., min_length=3)
    observations: Optional[str] = None
    treatment_performed: str = Field(..., min_length=3)
    next_visit_needed: bool = False
    recommended_next_visit: Optional[str] = None
    reminder_required: bool = False


class CancelAppointmentResponse(BaseModel):
    success: bool
    message: str
    hours_before_appointment: float
    cancellation_fee_toman: int
    refund_amount_toman: int
    wallet_credited: bool


class BlockDatePayload(BaseModel):
    date: str  # YYYY-MM-DD
    is_blocked: bool = True


@router.get("/clinics", response_model=List[ClinicSummaryResponse])
async def list_clinics(
    district: Optional[str] = None,
    service: Optional[str] = None,
    emergency_only: bool = False,
    query: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    # Seed defaults if empty
    count_stmt = select(Clinic).limit(1)
    has_any = (await db.execute(count_stmt)).scalar_one_or_none()
    if not has_any:
        c1 = Clinic(
            name="بیمارستان دامپزشکی پایتخت",
            slug="paytakht-vet-hospital",
            district="منطقه ۱ - ولنجک",
            address="تهران، ولنجک، خیابان چهاردهم، پلاک ۱۲",
            phone_number="02122401122",
            rating=4.9,
            reviews_count=64,
            is_emergency_24h=True,
            services=["جراحی تخصصی", "بخش اورژانس ۲۴ ساعته", "سونوگرافی و رادیولوژی", "دندانپزشکی", "واکسیناسیون"],
            image_url="/icons/health.svg",
            latitude=35.8010,
            longitude=51.4050,
        )
        c2 = Clinic(
            name="کلینیک تخصصی مهرگان سعادت‌آباد",
            slug="mehregan-vet-saadat-abad",
            district="منطقه ۲ - سعادت‌آباد",
            address="تهران، سعادت‌آباد، میدان کاج، خیابان سرو غربی",
            phone_number="02122095566",
            rating=4.8,
            reviews_count=42,
            is_emergency_24h=False,
            services=["طب داخلی", "واکسیناسیون", "چکاپ دوره‌ای", "گرومینگ و اصلاح"],
            image_url="/icons/health.svg",
            latitude=35.7800,
            longitude=51.3700,
        )
        c3 = Clinic(
            name="مرکز جامع اورژانس حیوانات تهران غرب",
            slug="tehran-west-vet-emergency",
            district="منطقه ۵ - پونک",
            address="تهران، پونک، بلوار میرزابابایی، پلاک ۸۵",
            phone_number="02144482010",
            rating=4.7,
            reviews_count=39,
            is_emergency_24h=True,
            services=["بخش اورژانس ۲۴ ساعته", "آی‌سی‌یو و بستری", "آزمایشگاه خون", "جراحی بافت نرم"],
            image_url="/icons/health.svg",
            latitude=35.7600,
            longitude=51.3300,
        )
        db.add_all([c1, c2, c3])
        await db.flush()

        v1 = Veterinarian(
            clinic_id=c1.id,
            full_name="دکتر آرین پارسا",
            medical_license_number="VET-88391",
            speciality="جراحی تخصصی و ارتوپدی حیوانات کوچک",
            bio="فارغ‌التحصیل دانشگاه تهران با بیش از ۱۰ سال سابقه جراحی تخصصی و تروما",
            consultation_fee_toman=500000,
            is_active=True,
        )
        v2 = Veterinarian(
            clinic_id=c1.id,
            full_name="دکتر نیلوفر سپهری",
            medical_license_number="VET-88714",
            speciality="طب داخلی، رادیولوژی و تشخیص بالینی",
            bio="متخصص بیماری‌های داخلی و سونوگرافی داپلر سگ و گربه",
            consultation_fee_toman=420000,
            is_active=True,
        )
        v3 = Veterinarian(
            clinic_id=c2.id,
            full_name="دکتر سارا کیانی",
            medical_license_number="VET-99412",
            speciality="طب پیشگیری، واکسیناسیون و تغذیه",
            bio="عضو انجمن جهانی دامپزشکی حیوانات کوچک (WSAVA) و متخصص رژیم‌های درمانی",
            consultation_fee_toman=380000,
            is_active=True,
        )
        v4 = Veterinarian(
            clinic_id=c3.id,
            full_name="دکتر پویا رستمی",
            medical_license_number="VET-77190",
            speciality="اورژانس و مراقبت‌های ویژه (ICU)",
            bio="متخصص مراقبت‌های بحرانی و احیای حیوانات خانگی",
            consultation_fee_toman=450000,
            is_active=True,
        )
        db.add_all([v1, v2, v3, v4])
        await db.commit()

    stmt = select(Clinic)
    if emergency_only:
        stmt = stmt.where(Clinic.is_emergency_24h == True)
    if district:
        stmt = stmt.where(Clinic.district.ilike(f"%{district}%"))
    if query:
        stmt = stmt.where(Clinic.name.ilike(f"%{query}%") | Clinic.address.ilike(f"%{query}%"))

    res = await db.execute(stmt)
    clinics = res.scalars().all()

    # Filter by service if provided
    if service:
        clinics = [c for c in clinics if any(service.lower() in s.lower() for s in c.services)]

    return [
        ClinicSummaryResponse(
            id=c.id,
            name=c.name,
            slug=c.slug,
            district=c.district,
            address=c.address,
            phone_number=c.phone_number,
            rating=c.rating,
            reviews_count=c.reviews_count,
            is_emergency_24h=c.is_emergency_24h,
            services=c.services,
            image_url=c.image_url,
            latitude=c.latitude or 35.7219,
            longitude=c.longitude or 51.3347,
        )
        for c in clinics
    ]


@router.get("/clinics/{clinic_id}", response_model=ClinicDetailResponse)
async def get_clinic_detail(
    clinic_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Clinic)
        .options(selectinload(Clinic.veterinarians))
        .where(Clinic.id == clinic_id)
    )
    res = await db.execute(stmt)
    clinic = res.scalar_one_or_none()
    if not clinic:
        raise HTTPException(status_code=404, detail="کلینیک مورد نظر یافت نشد")

    vets = [
        VeterinarianResponse(
            id=v.id,
            clinic_id=v.clinic_id,
            full_name=v.full_name,
            medical_license_number=v.medical_license_number,
            speciality=v.speciality,
            avatar_url=v.avatar_url,
            bio=v.bio,
            consultation_fee_toman=v.consultation_fee_toman,
            is_active=v.is_active,
            blocked_dates=v.blocked_dates or [],
        )
        for v in clinic.veterinarians
        if v.is_active
    ]

    return ClinicDetailResponse(
        id=clinic.id,
        name=clinic.name,
        slug=clinic.slug,
        district=clinic.district,
        address=clinic.address,
        phone_number=clinic.phone_number,
        rating=clinic.rating,
        reviews_count=clinic.reviews_count,
        is_emergency_24h=clinic.is_emergency_24h,
        services=clinic.services,
        image_url=clinic.image_url,
        latitude=clinic.latitude or 35.7219,
        longitude=clinic.longitude or 51.3347,
        veterinarians=vets,
    )


@router.get("/vets/{vet_id}/timeslots", response_model=List[TimeslotItem])
async def get_vet_timeslots(
    vet_id: str,
    date: str,  # YYYY-MM-DD
    db: AsyncSession = Depends(get_db),
):
    # Check if vet has blocked this date
    v_stmt = select(Veterinarian).where(Veterinarian.id == vet_id)
    v_res = await db.execute(v_stmt)
    vet = v_res.scalar_one_or_none()
    if vet and date in (vet.blocked_dates or []):
        return []

    # Standard slots
    standard_slots = [
        "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30",
        "16:00 - 16:30", "16:30 - 17:00", "17:00 - 17:30",
        "17:30 - 18:00", "18:00 - 18:30", "18:30 - 19:00"
    ]

    # Query already booked slots for this vet & date
    stmt = (
        select(Appointment.timeslot)
        .where(
            Appointment.vet_id == vet_id,
            Appointment.appointment_date == date,
            Appointment.status != AppointmentStatus.CANCELLED,
        )
    )
    res = await db.execute(stmt)
    booked_slots = set(res.scalars().all())

    return [
        TimeslotItem(time=slot, is_available=(slot not in booked_slots))
        for slot in standard_slots
    ]


@router.post("/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    payload: BookAppointmentPayload,
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
            detail="شما دسترسی مجاز برای ثبت نوبت این پت را ندارید.",
        )

    # 2. Verify Vet & Clinic
    vet_stmt = (
        select(Veterinarian)
        .options(selectinload(Veterinarian.clinic))
        .where(Veterinarian.id == payload.vet_id, Veterinarian.clinic_id == payload.clinic_id)
    )
    vet_res = await db.execute(vet_stmt)
    vet = vet_res.scalar_one_or_none()
    if not vet or not vet.is_active:
        raise HTTPException(status_code=404, detail="دامپزشک یا کلینیک انتخابی نامعتبر است.")

    # 3. Check blocked dates
    if payload.appointment_date in (vet.blocked_dates or []):
        raise HTTPException(status_code=400, detail="دامپزشک در این تاریخ نوبت خالی ندارد.")

    # 4. Check for slot conflict
    conflict_stmt = select(Appointment).where(
        Appointment.vet_id == payload.vet_id,
        Appointment.appointment_date == payload.appointment_date,
        Appointment.timeslot == payload.timeslot,
        Appointment.status != AppointmentStatus.CANCELLED,
    )
    conflict_res = await db.execute(conflict_stmt)
    if conflict_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="این بازه زمانی قبلاً توسط کاربر دیگری رزرو شده است.")

    # Parse start_time timestamp
    start_time = None
    try:
        time_part = payload.timeslot.split("-")[0].strip()
        dt_str = f"{payload.appointment_date} {time_part}"
        start_time = datetime.strptime(dt_str, "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
    except Exception:
        start_time = datetime.now(timezone.utc) + timedelta(days=2)

    # 5. Create Appointment
    appointment = Appointment(
        user_id=current_user.id,
        pet_id=pet.id,
        clinic_id=vet.clinic_id,
        vet_id=vet.id,
        appointment_date=payload.appointment_date,
        timeslot=payload.timeslot,
        start_time=start_time,
        status=AppointmentStatus.CONFIRMED,
        reason_for_visit=payload.reason_for_visit,
        notes=payload.notes,
        total_fee_toman=vet.consultation_fee_toman,
        is_paid=True,
    )
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)

    return AppointmentResponse(
        id=appointment.id,
        pet_id=pet.id,
        pet_name=pet.name,
        clinic_id=vet.clinic.id,
        clinic_name=vet.clinic.name,
        vet_id=vet.id,
        vet_name=vet.full_name,
        vet_speciality=vet.speciality,
        appointment_date=appointment.appointment_date,
        timeslot=appointment.timeslot,
        status=appointment.status,
        reason_for_visit=appointment.reason_for_visit,
        total_fee_toman=appointment.total_fee_toman,
        cancellation_fee_toman=appointment.cancellation_fee_toman,
        refund_amount_toman=appointment.refund_amount_toman,
        is_paid=appointment.is_paid,
        created_at=appointment.created_at,
    )


@router.get("/appointments/my", response_model=List[AppointmentResponse])
async def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Appointment)
        .options(
            selectinload(Appointment.clinic),
            selectinload(Appointment.veterinarian),
            selectinload(Appointment.pet),
        )
        .where(Appointment.user_id == current_user.id)
        .order_by(Appointment.created_at.desc())
    )
    res = await db.execute(stmt)
    appointments = res.scalars().all()

    return [
        AppointmentResponse(
            id=a.id,
            pet_id=a.pet.id,
            pet_name=a.pet.name,
            clinic_id=a.clinic.id,
            clinic_name=a.clinic.name,
            vet_id=a.veterinarian.id,
            vet_name=a.veterinarian.full_name,
            vet_speciality=a.veterinarian.speciality,
            appointment_date=a.appointment_date,
            timeslot=a.timeslot,
            status=a.status,
            reason_for_visit=a.reason_for_visit,
            total_fee_toman=a.total_fee_toman,
            cancellation_fee_toman=a.cancellation_fee_toman,
            refund_amount_toman=a.refund_amount_toman,
            is_paid=a.is_paid,
            treatment_summary=a.treatment_summary,
            treatment_performed=a.treatment_performed,
            next_visit_needed=a.next_visit_needed,
            recommended_next_visit=a.recommended_next_visit,
            reminder_required=a.reminder_required,
            created_at=a.created_at,
        )
        for a in appointments
    ]


@router.put("/appointments/{appointment_id}/cancel", response_model=CancelAppointmentResponse)
async def cancel_appointment_with_refund_tiers(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Item 32: Precise appointment cancellation refund tiers:
    - <= 48h before appointment: 20% non-refundable, 80% refunded to Wallet.
    - > 48h and up to 72h: 10% non-refundable, 90% refunded to Wallet.
    - > 72h: 100% refunded to Wallet.
    """
    stmt = (
        select(Appointment)
        .options(selectinload(Appointment.veterinarian))
        .where(Appointment.id == appointment_id)
    )
    res = await db.execute(stmt)
    appointment = res.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="نوبت مورد نظر یافت نشد")

    if appointment.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, "ADMIN"):
        raise HTTPException(status_code=403, detail="شما اجازه لغو این نوبت را ندارید.")

    if appointment.status == AppointmentStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="این نوبت قبلاً لغو شده است.")

    now = datetime.now(timezone.utc)
    appt_time = appointment.start_time
    if not appt_time:
        try:
            time_part = appointment.timeslot.split("-")[0].strip()
            appt_time = datetime.strptime(f"{appointment.appointment_date} {time_part}", "%Y-%m-%d %H:%M").replace(tzinfo=timezone.utc)
        except Exception:
            appt_time = now + timedelta(hours=24)
    elif appt_time.tzinfo is None:
        appt_time = appt_time.replace(tzinfo=timezone.utc)

    hours_diff = (appt_time - now).total_seconds() / 3600.0

    fee_total = appointment.total_fee_toman
    if hours_diff <= 48.0:
        cancellation_fee = int(fee_total * 0.20)
        refund_amount = fee_total - cancellation_fee
    elif hours_diff <= 72.0:
        cancellation_fee = int(fee_total * 0.10)
        refund_amount = fee_total - cancellation_fee
    else:
        cancellation_fee = 0
        refund_amount = fee_total

    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancellation_fee_toman = cancellation_fee
    appointment.refund_amount_toman = refund_amount
    appointment.cancelled_at = now

    # Credit refund into user's Wallet
    if refund_amount > 0 and appointment.is_paid:
        w_stmt = select(Wallet).where(Wallet.user_id == appointment.user_id)
        w_res = await db.execute(w_stmt)
        wallet = w_res.scalar_one_or_none()
        if not wallet:
            wallet = Wallet(user_id=appointment.user_id, balance_tomans=0)
            db.add(wallet)
            await db.flush()

        wallet.balance_tomans += refund_amount
        tx = WalletTransaction(
            wallet_id=wallet.id,
            amount_tomans=refund_amount,
            transaction_type=TransactionType.CREDIT_REFUND,
            reference_id=appointment.id,
            reference_type="APPOINTMENT_CANCELLATION",
            description=f"استرداد هزینه نوبت لغو شده (کارمزد لغو: {cancellation_fee:,} تومان)",
        )
        db.add(tx)

    await db.commit()

    return CancelAppointmentResponse(
        success=True,
        message=f"نوبت با موفقیت لغو شد. مبلغ {refund_amount:,} تومان به کیف پول شما واریز گردید.",
        hours_before_appointment=round(hours_diff, 1),
        cancellation_fee_toman=cancellation_fee,
        refund_amount_toman=refund_amount,
        wallet_credited=True,
    )


@router.post("/appointments/{appointment_id}/clinical-notes")
async def record_clinical_encounter_notes(
    appointment_id: str,
    payload: ClinicalNotesPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Item 23: Veterinarian records clinical summary, treatment performed, observations, and next visit recommendations.
    """
    stmt = select(Appointment).where(Appointment.id == appointment_id)
    res = await db.execute(stmt)
    appointment = res.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="نوبت یافت نشد")

    if current_user.role not in (UserRole.ADMIN, UserRole.VETERINARIAN, "ADMIN", "VET", "VETERINARIAN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ثبت یادداشت‌های بالینی فقط توسط دامپزشک یا مدیر مجاز است.",
        )

    if payload.reason_for_visit:
        appointment.reason_for_visit = payload.reason_for_visit
    appointment.treatment_summary = payload.treatment_summary
    appointment.observations = payload.observations
    appointment.treatment_performed = payload.treatment_performed
    appointment.next_visit_needed = payload.next_visit_needed
    appointment.recommended_next_visit = payload.recommended_next_visit
    appointment.reminder_required = payload.reminder_required
    appointment.status = AppointmentStatus.COMPLETED

    await db.commit()
    await db.refresh(appointment)

    return {
        "success": True,
        "message": "اطلاعات بالینی و توصیه‌های ویزیت با موفقیت در پرونده ثبت شد.",
        "appointment_id": appointment.id,
    }


@router.get("/pets/{pet_id}/medical-history")
async def get_authorized_pet_medical_history(
    pet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Item 23: Functional medical history endpoint for 'مشاهده سوابق درمانی'.
    """
    p_stmt = select(Pet).where(Pet.id == pet_id)
    p_res = await db.execute(p_stmt)
    pet = p_res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت یافت نشد")

    # Guard: only pet owner or authorized vet/admin can view medical records
    if pet.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, UserRole.VETERINARIAN, "ADMIN", "VET", "VETERINARIAN"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز به پرونده پزشکی محرمانه")

    stmt = (
        select(Appointment)
        .options(selectinload(Appointment.veterinarian), selectinload(Appointment.clinic))
        .where(
            Appointment.pet_id == pet_id,
            Appointment.status == AppointmentStatus.COMPLETED,
        )
        .order_by(Appointment.appointment_date.desc())
    )
    res = await db.execute(stmt)
    appts = res.scalars().all()

    return [
        {
            "id": a.id,
            "date": a.appointment_date,
            "clinic_name": a.clinic.name if a.clinic else "کلینیک مرکزی",
            "vet_name": a.veterinarian.full_name if a.veterinarian else "دامپزشک معالج",
            "reason_for_visit": a.reason_for_visit,
            "treatment_summary": a.treatment_summary or "معاینه عمومی و ثبت علائم حیاتی",
            "treatment_performed": a.treatment_performed or "تجویز دارو و پایش رژیم غذایی",
            "next_visit_needed": a.next_visit_needed,
            "recommended_next_visit": a.recommended_next_visit,
        }
        for a in appts
    ]


@router.post("/availability/block-date")
async def block_veterinarian_date(
    payload: BlockDatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Veterinarian).where(Veterinarian.user_id == current_user.id)
    res = await db.execute(stmt)
    vet = res.scalar_one_or_none()
    if not vet:
        # Fallback to first vet in dev environment
        vet = (await db.execute(select(Veterinarian).limit(1))).scalar_one_or_none()
        if not vet:
            raise HTTPException(status_code=404, detail="پروفایل دامپزشکی یافت نشد")

    blocked = list(vet.blocked_dates or [])
    if payload.is_blocked:
        if payload.date not in blocked:
            blocked.append(payload.date)
    else:
        if payload.date in blocked:
            blocked.remove(payload.date)

    vet.blocked_dates = blocked
    await db.commit()
    return {"success": True, "date": payload.date, "blocked_dates": vet.blocked_dates}
