import uuid
from datetime import datetime, timezone
import enum
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Float, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base


class SubscriptionFrequency(str, enum.Enum):
    EVERY_2_WEEKS = "EVERY_2_WEEKS"
    MONTHLY = "MONTHLY"
    EVERY_2_MONTHS = "EVERY_2_MONTHS"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    CANCELLED = "CANCELLED"


class PetFoodSubscription(Base):
    __tablename__ = "pet_food_subscriptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[str] = mapped_column(String(100), nullable=False)
    product_title_fa: Mapped[str] = mapped_column(String(255), nullable=False)
    weight_variant_text: Mapped[str] = mapped_column(String(50), nullable=False)
    package_weight_kg: Mapped[float] = mapped_column(Float, default=2.0)
    daily_consumption_grams: Mapped[float] = mapped_column(Float, default=60.0)
    unit_price_toman: Mapped[int] = mapped_column(Integer, nullable=False)
    frequency: Mapped[SubscriptionFrequency] = mapped_column(SAEnum(SubscriptionFrequency), default=SubscriptionFrequency.MONTHLY)
    status: Mapped[SubscriptionStatus] = mapped_column(SAEnum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    next_delivery_date: Mapped[str] = mapped_column(String(20), nullable=False)  # YYYY-MM-DD
    delivery_address: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    pet = relationship("Pet")
    user = relationship("User")
