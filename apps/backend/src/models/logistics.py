import uuid
from datetime import datetime, timezone
import enum
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Integer, Float, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base


class CourierStatus(str, enum.Enum):
    COURIER_ASSIGNED = "COURIER_ASSIGNED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"


class DeliveryTier(str, enum.Enum):
    STANDARD = "STANDARD"       # تحویل همان روز
    EXPRESS_3H = "EXPRESS_3H"   # ارسال فوری زیر ۳ ساعت تهران


VALID_COURIER_TRANSITIONS = {
    CourierStatus.COURIER_ASSIGNED: [CourierStatus.PICKED_UP, CourierStatus.FAILED],
    CourierStatus.PICKED_UP: [CourierStatus.IN_TRANSIT, CourierStatus.FAILED],
    CourierStatus.IN_TRANSIT: [CourierStatus.DELIVERED, CourierStatus.FAILED],
    CourierStatus.DELIVERED: [],
    CourierStatus.FAILED: [CourierStatus.COURIER_ASSIGNED], # Retry
}


class CourierShipment(Base):
    __tablename__ = "courier_shipments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    courier_name: Mapped[str] = mapped_column(String(100), nullable=False)
    courier_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    tehran_district: Mapped[int] = mapped_column(Integer, nullable=False) # 1-22
    delivery_tier: Mapped[DeliveryTier] = mapped_column(SAEnum(DeliveryTier), default=DeliveryTier.STANDARD, nullable=False)
    status: Mapped[CourierStatus] = mapped_column(SAEnum(CourierStatus), default=CourierStatus.COURIER_ASSIGNED, nullable=False)
    current_lat: Mapped[float] = mapped_column(Float, default=35.6892)
    current_lng: Mapped[float] = mapped_column(Float, default=51.3890)
    estimated_delivery_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    order = relationship("Order")
