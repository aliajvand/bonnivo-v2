import uuid
from datetime import datetime, timezone
import enum
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Float, Text, Enum as SAEnum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base


class BoardingBookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    CHECKED_OUT = "CHECKED_OUT"
    CANCELLED = "CANCELLED"


class BoardingCenter(Base):
    __tablename__ = "boarding_centers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    city: Mapped[str] = mapped_column(String(100), default="تهران", nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=4.8)
    reviews_count: Mapped[int] = mapped_column(Integer, default=15)
    daily_rate_toman: Mapped[int] = mapped_column(Integer, default=250000, nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    services: Mapped[list] = mapped_column(JSON, default=lambda: ["فضای بازی اختصاصی", "پایش دامپزشکی", "تغذیه اختصاصی", "دوربین آنلاین"])
    image_url: Mapped[str] = mapped_column(String(255), default="/icons/home-care.svg")
    latitude: Mapped[float] = mapped_column(Float, default=35.7500)
    longitude: Mapped[float] = mapped_column(Float, default=51.3800)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    bookings = relationship("BoardingBooking", back_populates="center", cascade="all, delete-orphan")


class BoardingBooking(Base):
    __tablename__ = "boarding_bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    center_id: Mapped[str] = mapped_column(String(36), ForeignKey("boarding_centers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    check_in_date: Mapped[str] = mapped_column(String(20), nullable=False)  # "YYYY-MM-DD"
    check_out_date: Mapped[str] = mapped_column(String(20), nullable=False) # "YYYY-MM-DD"
    total_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_fee_toman: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[BoardingBookingStatus] = mapped_column(SAEnum(BoardingBookingStatus), default=BoardingBookingStatus.CONFIRMED, nullable=False)
    special_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    center = relationship("BoardingCenter", back_populates="bookings")
    pet = relationship("Pet")
    user = relationship("User")
