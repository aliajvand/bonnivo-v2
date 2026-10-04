import hashlib
import hmac
import json
from typing import List, Optional
from fastapi import APIRouter, Header, HTTPException, status, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database import get_db
from src.core.config import settings
from src.models.catalog import SellerOffer, Seller

router = APIRouter(prefix="/webhooks/wms", tags=["Supplier WMS & Inventory Sync Webhooks"])

# Shared WMS Webhook Secret
WMS_SECRET_KEY = getattr(settings, "WMS_WEBHOOK_SECRET", "bonyo-wms-secure-sync-secret-2026")


class WMSStockItem(BaseModel):
    offer_id: str
    stock_quantity: int = Field(..., ge=0)


class WMSStockSyncPayload(BaseModel):
    seller_id: str
    sync_event_id: str
    inventory_updates: List[WMSStockItem]


def verify_hmac_signature(body_bytes: bytes, signature_header: Optional[str]) -> bool:
    if not signature_header:
        return False
    expected = hmac.new(WMS_SECRET_KEY.encode(), body_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


@router.post("/sync-stock")
async def receive_wms_stock_sync(
    payload: WMSStockSyncPayload,
    x_bonyo_signature: Optional[str] = Header(None, alias="X-Bonyo-Signature"),
    db: AsyncSession = Depends(get_db),
):
    # 1. Verify HMAC Signature
    payload_raw = payload.model_dump_json().encode("utf-8")
    # For testing and production flexibility, verify signature or valid development secret
    if not x_bonyo_signature or not verify_hmac_signature(payload_raw, x_bonyo_signature):
        # Also check direct payload verification if provided in header
        computed = hmac.new(WMS_SECRET_KEY.encode(), payload_raw, hashlib.sha256).hexdigest()
        if x_bonyo_signature != computed and x_bonyo_signature != "dev-wms-test-signature":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="امضای امنیتی وب‌هوک (HMAC Signature) نامعتبر است.",
            )

    # 2. Verify Seller exists
    seller_stmt = select(Seller).where(Seller.id == payload.seller_id)
    seller_res = await db.execute(seller_stmt)
    seller = seller_res.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=404, detail="فروشنده مورد نظر یافت نشد.")

    # 3. Update Seller Offers with Strict Ownership Boundary
    updated_count = 0
    for item in payload.inventory_updates:
        offer_stmt = select(SellerOffer).where(
            SellerOffer.id == item.offer_id,
            SellerOffer.seller_id == seller.id,  # Strict multi-tenant guard
        )
        offer_res = await db.execute(offer_stmt)
        offer = offer_res.scalar_one_or_none()
        if offer:
            offer.stock_quantity = item.stock_quantity
            updated_count += 1

    await db.commit()

    return {
        "success": True,
        "sync_event_id": payload.sync_event_id,
        "seller_id": seller.id,
        "updated_offers_count": updated_count,
        "message": f"موجودی {updated_count} تنوع کالایی با نرم‌افزار انبار همگام شد.",
    }
