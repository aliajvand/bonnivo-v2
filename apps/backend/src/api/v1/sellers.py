import re
import uuid
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User, UserRole
from src.models.catalog import Seller

router = APIRouter(prefix="/sellers", tags=["Seller Onboarding & KYC"])


class SellerRegisterRequest(BaseModel):
    store_name_fa: str = Field(min_length=2, max_length=150)
    national_id: str = Field(min_length=10, max_length=10)
    sheba_number: str = Field(min_length=26, max_length=26)
    phone_number: str = Field(min_length=11, max_length=15)
    address: str = Field(min_length=5)
    city: str = Field(default="Tehran")

    @field_validator("national_id")
    @classmethod
    def validate_national_id(cls, v: str) -> str:
        if not re.match(r"^\d{10}$", v):
            raise ValueError("کد ملی باید دقیقا ۱۰ رقم باشد.")
        return v

    @field_validator("sheba_number")
    @classmethod
    def validate_sheba(cls, v: str) -> str:
        v_upper = v.upper().replace(" ", "")
        if not re.match(r"^IR\d{24}$", v_upper):
            raise ValueError("شماره شبا باید با IR شروع شده و دارای ۲۴ رقم باشد.")
        return v_upper


class SellerResponse(BaseModel):
    id: str
    user_id: str
    store_name_fa: str
    slug: str
    national_id: str
    sheba_number: str
    phone_number: str
    city: str
    address: str
    commission_rate: float
    is_verified: bool
    status: str


class SellerStatusUpdate(BaseModel):
    status: str = Field(description="APPROVED, REJECTED, SUSPENDED")


VALID_STATUS_TRANSITIONS = {
    "UNDER_REVIEW": ["APPROVED", "REJECTED"],
    "APPROVED": ["SUSPENDED"],
    "SUSPENDED": ["APPROVED"],
    "REJECTED": ["UNDER_REVIEW"],
}


@router.post("/register", response_model=SellerResponse, status_code=status.HTTP_201_CREATED)
async def register_seller(
    payload: SellerRegisterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check if user already registered as seller
    q = select(Seller).where(Seller.user_id == current_user.id)
    res = await db.execute(q)
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="شما قبلاً درخواست فروشندگی ثبت کرده‌اید.",
        )

    # Generate slug from store name
    slug = f"store-{uuid.uuid4().hex[:8]}"

    seller = Seller(
        user_id=current_user.id,
        store_name_fa=payload.store_name_fa,
        slug=slug,
        national_id=payload.national_id,
        sheba_number=payload.sheba_number,
        phone_number=payload.phone_number,
        address=payload.address,
        city=payload.city,
        commission_rate=0.10,
        is_verified=False,
        status="UNDER_REVIEW",
    )
    db.add(seller)
    await db.commit()
    await db.refresh(seller)

    return seller


@router.get("/me", response_model=SellerResponse)
async def get_my_seller_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Seller).where(Seller.user_id == current_user.id)
    res = await db.execute(q)
    seller = res.scalar_one_or_none()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="پروفایل فروشندگی یافت نشد.",
        )
    return seller


@router.patch("/{seller_id}/status", response_model=SellerResponse)
async def update_seller_status(
    seller_id: str,
    payload: SellerStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Admin only check
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="فقط مدیر سیستم مجاز به تغییر وضعیت احراز هویت فروشنده است.",
        )

    seller = await db.get(Seller, seller_id)
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="فروشنده یافت نشد.",
        )

    new_status = payload.status.upper()
    allowed = VALID_STATUS_TRANSITIONS.get(seller.status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"تغییر وضعیت از {seller.status} به {new_status} مجاز نیست.",
        )

    seller.status = new_status
    if new_status == "APPROVED":
        seller.is_verified = True
        # Elevate user role to SELLER
        seller_user = await db.get(User, seller.user_id)
        if seller_user and seller_user.role != UserRole.ADMIN:
            seller_user.role = UserRole.SELLER
    elif new_status in ["REJECTED", "SUSPENDED"]:
        seller.is_verified = False

    await db.commit()
    await db.refresh(seller)
    return seller


# --- Task 7.2: Inventory Management & Spreadsheet Import ---

class OfferRow(BaseModel):
    product_slug_or_barcode: str
    price_tomans: int = Field(gt=0)
    stock_quantity: int = Field(ge=0)
    is_active: bool = True


class BatchImportRequest(BaseModel):
    offers: List[OfferRow]


class SellerOfferResponse(BaseModel):
    id: str
    product_id: str
    product_title_fa: str
    price_tomans: int
    stock_quantity: int
    is_active: bool


@router.post("/offers/import", status_code=status.HTTP_200_OK)
async def import_seller_offers(
    payload: BatchImportRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify seller profile
    q = select(Seller).where(Seller.user_id == current_user.id)
    res = await db.execute(q)
    seller = res.scalar_one_or_none()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما پروفایل فروشنده معتبر ندارید.",
        )

    from src.models.catalog import CanonicalProduct, SellerOffer
    updated_count = 0
    created_count = 0

    for row in payload.offers:
        # Match product by barcode or slug
        prod_q = select(CanonicalProduct).where(
            (CanonicalProduct.barcode == row.product_slug_or_barcode)
            | (CanonicalProduct.slug == row.product_slug_or_barcode)
        )
        prod_res = await db.execute(prod_q)
        product = prod_res.scalar_one_or_none()

        if not product:
            continue

        # Check existing offer
        off_q = select(SellerOffer).where(
            SellerOffer.seller_id == seller.id,
            SellerOffer.product_id == product.id,
        )
        off_res = await db.execute(off_q)
        offer = off_res.scalar_one_or_none()

        if offer:
            offer.price_tomans = row.price_tomans
            offer.stock_quantity = row.stock_quantity
            offer.is_active = row.is_active
            updated_count += 1
        else:
            new_offer = SellerOffer(
                seller_id=seller.id,
                product_id=product.id,
                price_tomans=row.price_tomans,
                stock_quantity=row.stock_quantity,
                is_active=row.is_active,
            )
            db.add(new_offer)
            created_count += 1

    await db.commit()
    return {
        "status": "success",
        "created_count": created_count,
        "updated_count": updated_count,
        "total_processed": len(payload.offers),
    }


@router.get("/offers", response_model=List[SellerOfferResponse])
async def list_seller_offers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Seller).where(Seller.user_id == current_user.id)
    res = await db.execute(q)
    seller = res.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=403, detail="پروفایل فروشنده یافت نشد.")

    from src.models.catalog import SellerOffer
    from sqlalchemy.orm import selectinload

    off_q = (
        select(SellerOffer)
        .options(selectinload(SellerOffer.product))
        .where(SellerOffer.seller_id == seller.id)
    )
    off_res = await db.execute(off_q)
    offers = off_res.scalars().all()

    return [
        SellerOfferResponse(
            id=o.id,
            product_id=o.product_id,
            product_title_fa=o.product.title_fa,
            price_tomans=o.price_tomans,
            stock_quantity=o.stock_quantity,
            is_active=o.is_active,
        )
        for o in offers
    ]


class OfferUpdatePayload(BaseModel):
    price_tomans: Optional[int] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None


@router.patch("/offers/{offer_id}")
async def update_single_offer(
    offer_id: str,
    payload: OfferUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from src.models.catalog import SellerOffer

    q = select(Seller).where(Seller.user_id == current_user.id)
    seller = (await db.execute(q)).scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز است.")

    off = await db.get(SellerOffer, offer_id)
    if not off or off.seller_id != seller.id:
        raise HTTPException(status_code=404, detail="پیشنهاد فروش یافت نشد.")

    if payload.price_tomans is not None:
        off.price_tomans = payload.price_tomans
    if payload.stock_quantity is not None:
        off.stock_quantity = payload.stock_quantity
    if payload.is_active is not None:
        off.is_active = payload.is_active

    await db.commit()
    return {"status": "updated", "id": off.id}


# --- Task 7.3: Seller Order Fulfillment & SLA Tracker ---

class FulfillmentUpdatePayload(BaseModel):
    status: str = Field(description="PREPARING, SHIPPED, DELIVERED")
    courier_name: Optional[str] = "پیک اختصاصی بونیو اکسپرس"
    tracking_number: Optional[str] = None


@router.get("/orders")
async def list_seller_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Seller).where(Seller.user_id == current_user.id)
    seller = (await db.execute(q)).scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز است.")

    from src.models.order import OrderItem, Order
    from sqlalchemy.orm import selectinload

    items_q = (
        select(OrderItem)
        .options(selectinload(OrderItem.order))
        .where(OrderItem.seller_id == seller.id)
    )
    items_res = await db.execute(items_q)
    items = items_res.scalars().all()

    return [
        {
            "order_item_id": it.id,
            "order_id": it.order_id,
            "product_title": it.product_title,
            "quantity": it.quantity,
            "unit_price_tomans": it.unit_price_tomans,
            "commission_tomans": it.commission_tomans,
            "order_status": it.order.status.value if it.order else "UNKNOWN",
            "shipping_address": it.order.shipping_address if it.order else None,
            "shipping_timeslot": it.order.shipping_timeslot if it.order else None,
            "created_at": it.order.created_at if it.order else None,
        }
        for it in items
    ]


@router.patch("/orders/{order_item_id}/fulfillment")
async def update_order_fulfillment(
    order_item_id: str,
    payload: FulfillmentUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from src.models.order import OrderItem, Order, OrderStatus
    from sqlalchemy.orm import selectinload
    from src.services.sms import get_sms_provider

    q = select(Seller).where(Seller.user_id == current_user.id)
    seller = (await db.execute(q)).scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز است.")

    item_q = select(OrderItem).options(selectinload(OrderItem.order)).where(OrderItem.id == order_item_id)
    item_res = await db.execute(item_q)
    item = item_res.scalar_one_or_none()

    if not item or item.seller_id != seller.id:
        raise HTTPException(status_code=404, detail="آیتم سفارش متعلق به این فروشگاه یافت نشد.")

    # Update order status if shipped
    if payload.status == "SHIPPED":
        item.order.status = OrderStatus.SHIPPED
        # Dispatch notification to buyer
        sms = get_sms_provider()
        buyer = await db.get(User, item.order.user_id)
        if buyer:
            await sms.send_otp(buyer.phone_number, f"BONNIVO-TRACKING-{payload.tracking_number or '123'}")

    await db.commit()
    return {
        "status": "success",
        "order_item_id": item.id,
        "new_order_status": item.order.status.value,
        "courier": payload.courier_name,
        "tracking_number": payload.tracking_number,
    }

