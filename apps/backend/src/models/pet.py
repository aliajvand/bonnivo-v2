import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Float, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base
import enum


class PetSpecies(str, enum.Enum):
    DOG = "DOG"
    CAT = "CAT"
    BIRD = "BIRD"
    SMALL_PET = "SMALL_PET"
    OTHER = "OTHER"


class PetSex(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    UNKNOWN = "UNKNOWN"


class TaskCategory(str, enum.Enum):
    WALK = "WALK"
    FOOD = "FOOD"
    MEDICATION = "MEDICATION"
    HYGIENE = "HYGIENE"
    WATER = "WATER"


class ActivitySource(str, enum.Enum):
    OWNER = "OWNER"
    VET = "VET"
    OTHER = "OTHER"


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    species: Mapped[PetSpecies] = mapped_column(SAEnum(PetSpecies), nullable=False)
    breed: Mapped[str] = mapped_column(String(100), nullable=False)
    sex: Mapped[PetSex] = mapped_column(SAEnum(PetSex), default=PetSex.UNKNOWN, nullable=False)
    birth_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    estimated_age_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    microchip_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    registration_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vaccination_status: Mapped[str | None] = mapped_column(String(100), default="به‌روز", nullable=True)
    vaccination_reminders: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    passport_doc_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    passport_doc_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    is_neutered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    qr_passport_token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    is_lost: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    lost_alert_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="pets")
    health_profile = relationship("PetHealthProfile", back_populates="pet", uselist=False, cascade="all, delete-orphan")
    care_tasks = relationship("CareTask", back_populates="pet", cascade="all, delete-orphan")
    activities = relationship("PetActivity", back_populates="pet", cascade="all, delete-orphan", order_by="desc(PetActivity.activity_date)")


class PetHealthProfile(Base):
    __tablename__ = "pet_health_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), unique=True, nullable=False)
    dietary_preferences: Mapped[str | None] = mapped_column(Text, nullable=True)
    allergies: Mapped[str | None] = mapped_column(Text, nullable=True)
    health_book_image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    medical_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    daily_food_grams: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet", back_populates="health_profile")


class CareTask(Base):
    __tablename__ = "care_tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    species: Mapped[PetSpecies] = mapped_column(SAEnum(PetSpecies), nullable=False)
    category: Mapped[TaskCategory] = mapped_column(SAEnum(TaskCategory), nullable=False)
    target_metric: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_value: Mapped[int | None] = mapped_column(Integer, nullable=True)
    scheduled_time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    scheduled_date: Mapped[str | None] = mapped_column(String(20), nullable=True) # YYYY-MM-DD
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    creator_role: Mapped[str] = mapped_column(String(50), default="OWNER", nullable=False) # OWNER, VET, SYSTEM
    creator_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet", back_populates="care_tasks")
    completions = relationship("TaskCompletion", back_populates="task", cascade="all, delete-orphan")


class TaskCompletion(Base):
    __tablename__ = "task_completions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id: Mapped[str] = mapped_column(String(36), ForeignKey("care_tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    achieved_value: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    task = relationship("CareTask", back_populates="completions")


class PetActivity(Base):
    __tablename__ = "pet_activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. VET_SERVICE, VACCINATION, BOARDING, EXERCISE, TRAINING, EVENT, CARE_RECORD
    activity_source: Mapped[ActivitySource] = mapped_column(SAEnum(ActivitySource), default=ActivitySource.OWNER, nullable=False, index=True)
    short_description: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="COMPLETED", nullable=False) # COMPLETED, SCHEDULED, IN_PROGRESS
    activity_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet", back_populates="activities")
