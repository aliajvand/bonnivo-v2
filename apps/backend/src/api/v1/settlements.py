from datetime import datetime, timezone
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User, UserRole
from src.models.catalog import Seller
from src.models.settlement import VendorSettlement, SettlementStatus

router = APIRouter(prefix="/settlements", tags=["Multi-Vendor Automated Settlement"])


class GenerateSettlementPayload(BaseModel):
    seller_id: str
    gross_sales_toman: int = Field(..., gt=0)
    iban_sheba: str = Field(..., min_length=24, max_length=26)


class VendorSettlementResponse(BaseModel):
    id: str
    seller_id: str
    seller_name: str
    gross_sales_toman: int
    platform_commission_toman: int
    tax_withholding_toman: int
    net_payout_toman: int
    iban_sheba: str
    paya_reference_id: str
    status: SettlementStatus
    settled_at: Optional[datetime]
    created_at: datetime


def calculate_settlement_ledger(gross_sales_toman: int) -> tuple[int, int, int]:
    """
    Standard accounting rule:
    - Platform Commission: 10% of gross
    - Tax Withholding (VAT on service): 9% of platform commission
    - Net Payout: gross_sales - platform_commission - tax_withholding
    """
    commission = int(gross_sales_toman * 0.10)
    tax = int(commission * 0.09)
    net_payout = gross_sales_toman - commission - tax
    return commission, tax, net_payout


@router.post("/calculate", response_model=VendorSettlementResponse, status_code=status.HTTP_201_CREATED)
async def generate_vendor_settlement(
    payload: GenerateSettlementPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify Seller
    seller_stmt = select(Seller).where(Seller.id == payload.seller_id)
    seller_res = await db.execute(seller_stmt)
    seller = seller_res.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=404, detail="فروشنده مورد نظر یافت نشد.")

    # Authorization: seller owner or admin
    if current_user.role != UserRole.ADMIN and seller.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز به ساخت رکورد تسویه این فروشنده.")

    commission, tax, net_payout = calculate_settlement_ledger(payload.gross_sales_toman)
    paya_ref = f"PAYA-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

    settlement = VendorSettlement(
        seller_id=seller.id,
        gross_sales_toman=payload.gross_sales_toman,
        platform_commission_toman=commission,
        tax_withholding_toman=tax,
        net_payout_toman=net_payout,
        iban_sheba=payload.iban_sheba,
        paya_reference_id=paya_ref,
        status=SettlementStatus.PAYA_SUBMITTED,
    )
    db.add(settlement)
    await db.commit()
    await db.refresh(settlement)

    return VendorSettlementResponse(
        id=settlement.id,
        seller_id=seller.id,
        seller_name=seller.store_name_fa,
        gross_sales_toman=settlement.gross_sales_toman,
        platform_commission_toman=settlement.platform_commission_toman,
        tax_withholding_toman=settlement.tax_withholding_toman,
        net_payout_toman=settlement.net_payout_toman,
        iban_sheba=settlement.iban_sheba,
        paya_reference_id=settlement.paya_reference_id,
        status=settlement.status,
        settled_at=settlement.settled_at,
        created_at=settlement.created_at,
    )


@router.get("/my", response_model=List[VendorSettlementResponse])
async def list_my_settlements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch sellers owned by current user
    seller_stmt = select(Seller).where(Seller.user_id == current_user.id)
    seller_res = await db.execute(seller_stmt)
    sellers = {s.id: s.store_name_fa for s in seller_res.scalars().all()}

    if not sellers and current_user.role != UserRole.ADMIN:
        return []

    stmt = select(VendorSettlement).order_by(VendorSettlement.created_at.desc())
    if current_user.role != UserRole.ADMIN:
        stmt = stmt.where(VendorSettlement.seller_id.in_(sellers.keys()))

    res = await db.execute(stmt)
    records = res.scalars().all()

    return [
        VendorSettlementResponse(
            id=r.id,
            seller_id=r.seller_id,
            seller_name=sellers.get(r.seller_id, "فروشگاه بونیو"),
            gross_sales_toman=r.gross_sales_toman,
            platform_commission_toman=r.platform_commission_toman,
            tax_withholding_toman=r.tax_withholding_toman,
            net_payout_toman=r.net_payout_toman,
            iban_sheba=r.iban_sheba,
            paya_reference_id=r.paya_reference_id,
            status=r.status,
            settled_at=r.settled_at,
            created_at=r.created_at,
        )
        for r in records
    ]


@router.put("/{settlement_id}/confirm-paya")
async def confirm_paya_settlement(
    settlement_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="تنها مدیر مالی سیستم مجاز به نهایی‌سازی تسویه پایا است.")

    stmt = select(VendorSettlement).where(VendorSettlement.id == settlement_id)
    res = await db.execute(stmt)
    record = res.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="رکورد تسویه یافت نشد.")

    record.status = SettlementStatus.SETTLED
    record.settled_at = datetime.now(timezone.utc)
    await db.commit()

    return {"success": True, "message": "تراکنش پایا تأیید و تسویه به وضعیت SETTLED منتقل گردید."}
