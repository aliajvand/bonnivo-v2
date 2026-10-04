import uuid
from datetime import datetime, timezone
import enum
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Integer, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.core.database import Base


class SettlementStatus(str, enum.Enum):
    CALCULATED = "CALCULATED"
    PAYA_SUBMITTED = "PAYA_SUBMITTED"
    SETTLED = "SETTLED"


class VendorSettlement(Base):
    __tablename__ = "vendor_settlements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id: Mapped[str] = mapped_column(String(36), ForeignKey("sellers.id", ondelete="CASCADE"), nullable=False, index=True)
    gross_sales_toman: Mapped[int] = mapped_column(Integer, nullable=False)
    platform_commission_toman: Mapped[int] = mapped_column(Integer, nullable=False) # 10%
    tax_withholding_toman: Mapped[int] = mapped_column(Integer, nullable=False)      # 9% on commission
    net_payout_toman: Mapped[int] = mapped_column(Integer, nullable=False)           # gross - commission - tax
    iban_sheba: Mapped[str] = mapped_column(String(30), nullable=False)
    paya_reference_id: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    status: Mapped[SettlementStatus] = mapped_column(SAEnum(SettlementStatus), default=SettlementStatus.CALCULATED, nullable=False)
    settled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    seller = relationship("Seller")
