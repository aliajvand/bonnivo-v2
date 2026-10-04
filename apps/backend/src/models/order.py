import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Integer, Float, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base
import enum


class OrderStatus(str, enum.Enum):
    PAYMENT_PENDING = "PAYMENT_PENDING"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class FulfillmentStage(str, enum.Enum):
    CONFIRMED = "CONFIRMED"                      # ۱. ثبت و تأیید سفارش
    COLLECTING_ITEMS = "COLLECTING_ITEMS"        # ۲. در حال جمع‌آوری محصولات
    PACKAGING = "PACKAGING"                      # ۳. در حال بسته‌بندی
    SENDING = "SENDING"                          # ۴. در حال ارسال
    HANDED_TO_COURIER = "HANDED_TO_COURIER"      # ۵. تحویل به پیک
    DELIVERED = "DELIVERED"                      # ۶. تحویل به مشتری


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    status: Mapped[OrderStatus] = mapped_column(SAEnum(OrderStatus), default=OrderStatus.PAYMENT_PENDING, nullable=False)
    fulfillment_stage: Mapped[FulfillmentStage] = mapped_column(SAEnum(FulfillmentStage), default=FulfillmentStage.CONFIRMED, nullable=False)
    total_amount_tomans: Mapped[int] = mapped_column(Integer, nullable=False)
    discount_amount_tomans: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    coupon_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    calculated_lead_time_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    shipping_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    shipping_timeslot: Mapped[str | None] = mapped_column(String(100), nullable=True)
    payment_authority: Mapped[str | None] = mapped_column(String(100), nullable=True)
    payment_ref_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    stage_confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    stage_collected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stage_packaged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stage_sending_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stage_courier_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stage_delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("seller_offers.id", ondelete="RESTRICT"), nullable=False)
    seller_id: Mapped[str] = mapped_column(String(36), ForeignKey("sellers.id", ondelete="RESTRICT"), nullable=False, index=True)
    pet_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("pets.id", ondelete="SET NULL"), nullable=True)
    product_title: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price_tomans: Mapped[int] = mapped_column(Integer, nullable=False)
    commission_tomans: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lead_time_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    # Operational stage sub-tasks for multi-item/supplier fulfillment
    is_collected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_packaged: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    order = relationship("Order", back_populates="items")


class InventoryReservation(Base):
    __tablename__ = "inventory_reservations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("seller_offers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    is_released: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ReorderSchedule(Base):
    __tablename__ = "reorder_schedules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pet_id: Mapped[str] = mapped_column(String(36), ForeignKey("pets.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("canonical_products.id", ondelete="CASCADE"), nullable=False)
    package_weight_grams: Mapped[int] = mapped_column(Integer, nullable=False)
    daily_consumption_grams: Mapped[int] = mapped_column(Integer, nullable=False)
    depletion_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    prompt_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)  # 7 days before depletion
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sms_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserCartItem(Base):
    __tablename__ = "user_cart_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("seller_offers.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    pet_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("pets.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    offer = relationship("SellerOffer")
