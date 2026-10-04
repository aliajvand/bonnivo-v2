import uuid
from datetime import datetime, timezone, timedelta
import secrets
from typing import Optional
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base


class PawPointsLedger(Base):
    __tablename__ = "paw_points_ledger"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    points_delta: Mapped[int] = mapped_column(Integer, nullable=False) # e.g. +50 for streak, -100 for voucher
    reason: Mapped[str] = mapped_column(String(100), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class PawDiscountVoucher(Base):
    __tablename__ = "paw_discount_vouchers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, default=lambda: f"PAW-{secrets.token_hex(4).upper()}")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    discount_tomans: Mapped[int] = mapped_column(Integer, nullable=False)
    points_spent: Mapped[int] = mapped_column(Integer, nullable=False)
    is_redeemed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    redeemed_order_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc) + timedelta(days=30))

    user = relationship("User")
