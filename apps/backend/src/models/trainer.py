import uuid
from datetime import datetime, timezone
import enum
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Float, Text, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base


class TrainerSessionStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Trainer(Base):
    __tablename__ = "trainers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    speciality: Mapped[str] = mapped_column(String(100), default="اصلاح رفتار و آموزش پایه", nullable=False)
    city: Mapped[str] = mapped_column(String(100), default="تهران", nullable=False, index=True)
    bio: Mapped[str] = mapped_column(Text, default="")
    hourly_rate_toman: Mapped[int] = mapped_column(Integer, default=350000, nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(255), default="/icons/trainer.svg")
    rating: Mapped[float] = mapped_column(Float, default=4.9)
    reviews_count: Mapped[int] = mapped_column(Integer, default=8)
    blocked_dates: Mapped[list] = mapped_column(JSON, default=list)
    available_days: Mapped[list] = mapped_column(JSON, default=lambda: ["saturday", "sunday", "monday", "tuesday", "wednesday"])
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sessions = relationship("TrainerSession", back_populates="trainer", cascade="all, delete-orphan")


class TrainerSession(Base):
    __tablename__ = "trainer_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id: Mapped[str] = mapped_column(String(36), ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    session_date: Mapped[str] = mapped_column(String(20), nullable=False) # "YYYY-MM-DD"
    timeslot: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[TrainerSessionStatus] = mapped_column(SAEnum(TrainerSessionStatus), default=TrainerSessionStatus.CONFIRMED, nullable=False)
    fee_toman: Mapped[int] = mapped_column(Integer, default=350000, nullable=False)
    
    # Session details recorded by trainer
    session_type: Mapped[str | None] = mapped_column(String(100), default="آموزش مقدماتی", nullable=True)
    what_was_taught: Mapped[str | None] = mapped_column(Text, nullable=True)
    session_notes_owner_safe: Mapped[str | None] = mapped_column(Text, nullable=True) # Visible to owner
    homework_exercises: Mapped[str | None] = mapped_column(Text, nullable=True)       # Visible to owner
    internal_private_notes: Mapped[str | None] = mapped_column(Text, nullable=True)  # Provider-only! Hidden from customer!
    recommended_next_session_date: Mapped[str | None] = mapped_column(String(20), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    trainer = relationship("Trainer", back_populates="sessions")
    pet = relationship("Pet")
    user = relationship("User")
