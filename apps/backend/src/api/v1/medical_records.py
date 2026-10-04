from datetime import datetime, timezone
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User, UserRole
from src.models.pet import Pet
from src.models.vet import MedicalRecord, Veterinarian, Appointment

router = APIRouter(prefix="/medical-records", tags=["Shared Medical Records & Prescriptions"])


class PrescriptionItem(BaseModel):
    drug_name: str
    dosage: str
    instructions: str
    duration_days: Optional[int] = 7


class CreateMedicalRecordPayload(BaseModel):
    pet_id: str
    vet_id: str
    appointment_id: Optional[str] = None
    diagnosis: str = Field(..., min_length=3)
    prescriptions: List[PrescriptionItem] = Field(default_factory=list)
    vaccine_administered: Optional[str] = None
    vaccine_next_due_date: Optional[str] = None
    allergies_noted: Optional[str] = None
    weight_kg: Optional[float] = None
    vet_signature_license: str = Field(..., min_length=3)


class MedicalRecordResponse(BaseModel):
    id: str
    pet_id: str
    pet_name: str
    vet_id: str
    vet_name: str
    vet_speciality: str
    appointment_id: Optional[str]
    visit_date: datetime
    diagnosis: str
    prescriptions: List[Any]
    vaccine_administered: Optional[str]
    vaccine_next_due_date: Optional[str]
    allergies_noted: Optional[str]
    weight_kg: Optional[float]
    vet_signature_license: str
    created_at: datetime


@router.post("", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_medical_record(
    payload: CreateMedicalRecordPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch Pet
    pet_stmt = select(Pet).where(Pet.id == payload.pet_id)
    pet_res = await db.execute(pet_stmt)
    pet = pet_res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت مورد نظر یافت نشد")

    # 2. Verify Vet
    vet_stmt = select(Veterinarian).where(Veterinarian.id == payload.vet_id)
    vet_res = await db.execute(vet_stmt)
    vet = vet_res.scalar_one_or_none()
    if not vet:
        raise HTTPException(status_code=404, detail="دامپزشک مورد نظر یافت نشد")

    # 3. IDOR / Ownership Verification on Appointment if provided
    if payload.appointment_id:
        appt_stmt = select(Appointment).where(Appointment.id == payload.appointment_id)
        appt_res = await db.execute(appt_stmt)
        appointment = appt_res.scalar_one_or_none()
        if not appointment:
            raise HTTPException(status_code=404, detail="نوبت مورد نظر یافت نشد")
        if appointment.pet_id != pet.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="نوبت ارائه‌شده متعلق به این پت نیست.",
            )
        if appointment.vet_id != vet.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="نوبت ارائه‌شده متعلق به این دامپزشک نیست.",
            )
        if current_user.role != UserRole.ADMIN and appointment.user_id != current_user.id and pet.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="شما دسترسی به این نوبت را ندارید.",
            )

    # General Authorization: Pet owner or Admin can record
    if current_user.role != UserRole.ADMIN and current_user.id != pet.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ثبت پرونده پزشکی فقط توسط سرپرست پت یا مدیر امکان‌پذیر است.",
        )

    # 3. Create Record
    prescriptions_data = [p.model_dump() for p in payload.prescriptions]
    record = MedicalRecord(
        pet_id=pet.id,
        vet_id=vet.id,
        appointment_id=payload.appointment_id,
        visit_date=datetime.now(timezone.utc),
        diagnosis=payload.diagnosis,
        prescriptions=prescriptions_data,
        vaccine_administered=payload.vaccine_administered,
        vaccine_next_due_date=payload.vaccine_next_due_date,
        allergies_noted=payload.allergies_noted,
        weight_kg=payload.weight_kg,
        vet_signature_license=payload.vet_signature_license,
    )
    db.add(record)

    # Update pet weight if recorded
    if payload.weight_kg and payload.weight_kg > 0:
        pet.weight_kg = payload.weight_kg

    await db.commit()
    await db.refresh(record)

    return MedicalRecordResponse(
        id=record.id,
        pet_id=pet.id,
        pet_name=pet.name,
        vet_id=vet.id,
        vet_name=vet.full_name,
        vet_speciality=vet.speciality,
        appointment_id=record.appointment_id,
        visit_date=record.visit_date,
        diagnosis=record.diagnosis,
        prescriptions=record.prescriptions,
        vaccine_administered=record.vaccine_administered,
        vaccine_next_due_date=record.vaccine_next_due_date,
        allergies_noted=record.allergies_noted,
        weight_kg=record.weight_kg,
        vet_signature_license=record.vet_signature_license,
        created_at=record.created_at,
    )


@router.get("/pets/{pet_id}", response_model=List[MedicalRecordResponse])
async def get_pet_medical_records(
    pet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch Pet & check IDOR permission
    pet_stmt = select(Pet).where(Pet.id == pet_id)
    pet_res = await db.execute(pet_stmt)
    pet = pet_res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت مورد نظر یافت نشد")

    if pet.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="دسترسی به پرونده پزشکی این پت غیرمجاز است.")

    # 2. Fetch Records
    records_stmt = (
        select(MedicalRecord)
        .options(selectinload(MedicalRecord.veterinarian))
        .where(MedicalRecord.pet_id == pet_id)
        .order_by(MedicalRecord.created_at.desc())
    )
    res = await db.execute(records_stmt)
    records = res.scalars().all()

    return [
        MedicalRecordResponse(
            id=r.id,
            pet_id=pet.id,
            pet_name=pet.name,
            vet_id=r.veterinarian.id,
            vet_name=r.veterinarian.full_name,
            vet_speciality=r.veterinarian.speciality,
            appointment_id=r.appointment_id,
            visit_date=r.visit_date,
            diagnosis=r.diagnosis,
            prescriptions=r.prescriptions or [],
            vaccine_administered=r.vaccine_administered,
            vaccine_next_due_date=r.vaccine_next_due_date,
            allergies_noted=r.allergies_noted,
            weight_kg=r.weight_kg,
            vet_signature_license=r.vet_signature_license,
            created_at=r.created_at,
        )
        for r in records
    ]
