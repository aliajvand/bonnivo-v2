import uuid
from datetime import datetime, timezone
import enum
from typing import Optional
from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base
from src.models.pet import PetSpecies, PetSex


class AdoptionStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    UNDER_REVIEW = "UNDER_REVIEW"
    ADOPTED = "ADOPTED"
    CANCELLED = "CANCELLED"


class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class AdoptionListing(Base):
    __tablename__ = "adoption_listings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    publisher_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    pet_name: Mapped[str] = mapped_column(String(50), nullable=False)
    species: Mapped[PetSpecies] = mapped_column(SAEnum(PetSpecies), nullable=False, index=True)
    breed: Mapped[str] = mapped_column(String(100), nullable=False)
    age_months: Mapped[int] = mapped_column(Integer, nullable=False)
    sex: Mapped[PetSex] = mapped_column(SAEnum(PetSex), default=PetSex.UNKNOWN, nullable=False)
    
    description: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(50), default="تهران", nullable=False)
    district: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # Tehran municipal district 1-22
    
    health_status: Mapped[str] = mapped_column(String(200), default="سالم و تحت نظر دامپزشک", nullable=False)
    vaccination_status: Mapped[str] = mapped_column(String(200), default="واکسینه شده", nullable=False)
    is_neutered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Strictly 0 Tomans for ethical rescue/rehoming (Commercial animal trading strictly forbidden)
    adoption_fee_tomans: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[AdoptionStatus] = mapped_column(SAEnum(AdoptionStatus), default=AdoptionStatus.AVAILABLE, nullable=False, index=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    publisher = relationship("User")
    applications = relationship("AdoptionApplication", back_populates="listing", cascade="all, delete-orphan")


class AdoptionApplication(Base):
    __tablename__ = "adoption_applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    listing_id: Mapped[str] = mapped_column(String(36), ForeignKey("adoption_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    applicant_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    applicant_name: Mapped[str] = mapped_column(String(100), nullable=False)
    applicant_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    experience_years: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    has_other_pets: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    housing_type: Mapped[str] = mapped_column(String(100), default="آپارتمان", nullable=False)
    motivation: Mapped[str] = mapped_column(Text, nullable=False)
    
    status: Mapped[ApplicationStatus] = mapped_column(SAEnum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False, index=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    listing = relationship("AdoptionListing", back_populates="applications")
    applicant = relationship("User")
