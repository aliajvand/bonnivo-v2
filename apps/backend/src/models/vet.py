import uuid
from datetime import datetime, timezone
import enum
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Float, Text, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base


class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Clinic(Base):
    __tablename__ = "clinics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    district: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=4.8)
    reviews_count: Mapped[int] = mapped_column(Integer, default=12)
    is_emergency_24h: Mapped[bool] = mapped_column(Boolean, default=False)
    services: Mapped[list] = mapped_column(JSON, default=list)
    image_url: Mapped[str] = mapped_column(String(255), default="/icons/health.svg")
    latitude: Mapped[float] = mapped_column(Float, default=35.7219)
    longitude: Mapped[float] = mapped_column(Float, default=51.3347)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    veterinarians = relationship("Veterinarian", back_populates="clinic", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="clinic")


class Veterinarian(Base):
    __tablename__ = "veterinarians"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    clinic_id: Mapped[str] = mapped_column(String(36), ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    medical_license_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    speciality: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(255), default="/icons/health.svg")
    bio: Mapped[str] = mapped_column(Text, default="")
    consultation_fee_toman: Mapped[int] = mapped_column(Integer, default=450000)
    blocked_dates: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    clinic = relationship("Clinic", back_populates="veterinarians")
    appointments = relationship("Appointment", back_populates="veterinarian")
    medical_records = relationship("MedicalRecord", back_populates="veterinarian")


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    clinic_id: Mapped[str] = mapped_column(String(36), ForeignKey("clinics.id", ondelete="CASCADE"), nullable=False, index=True)
    vet_id: Mapped[str] = mapped_column(String(36), ForeignKey("veterinarians.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_date: Mapped[str] = mapped_column(String(20), nullable=False) # e.g. "2026-10-15"
    timeslot: Mapped[str] = mapped_column(String(30), nullable=False) # e.g. "10:00 - 10:30"
    start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True) # Full start timestamp
    status: Mapped[AppointmentStatus] = mapped_column(SAEnum(AppointmentStatus), default=AppointmentStatus.CONFIRMED, nullable=False)
    reason_for_visit: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Clinical encounter details recorded by veterinarian
    treatment_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    observations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    treatment_performed: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_visit_needed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    recommended_next_visit: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reminder_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    total_fee_toman: Mapped[int] = mapped_column(Integer, default=450000)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Cancellation & Refund breakdown (Item 32: <=48h -> 80% refund/20% fee; 48h-72h -> 90% refund/10% fee; >72h -> 100% refund)
    cancellation_fee_toman: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    refund_amount_toman: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    clinic = relationship("Clinic", back_populates="appointments")
    veterinarian = relationship("Veterinarian", back_populates="appointments")
    pet = relationship("Pet")
    user = relationship("User")


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    vet_id: Mapped[str] = mapped_column(String(36), ForeignKey("veterinarians.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    visit_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    diagnosis: Mapped[str] = mapped_column(Text, nullable=False)
    prescriptions: Mapped[list] = mapped_column(JSON, default=list)
    vaccine_administered: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    vaccine_next_due_date: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    allergies_noted: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    vet_signature_license: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    veterinarian = relationship("Veterinarian", back_populates="medical_records")
    pet = relationship("Pet")
