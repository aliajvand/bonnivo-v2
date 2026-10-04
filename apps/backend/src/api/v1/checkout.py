from datetime import datetime, timedelta, timezone
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, delete
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.catalog import SellerOffer, Seller, CanonicalProduct
from src.models.order import Order, OrderItem, OrderStatus, FulfillmentStage, InventoryReservation, UserCartItem
from src.models.coupon import Coupon, CouponRedemption, CouponType, RedemptionStatus

router = APIRouter(prefix="/checkout", tags=["Checkout & Reservations"])

RESERVATION_DURATION_MINUTES = 30
STANDARD_SHIPPING_FEE_TOMANS = 39000
FREE_SHIPPING_THRESHOLD_TOMANS = 800000


class CartItemInput(BaseModel):
    offer_id: str
    quantity: int = Field(gt=0, description="Quantity must be greater than 0")
    pet_id: Optional[str] = None


class CheckoutReserveRequest(BaseModel):
    items: List[CartItemInput]
    coupon_code: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_timeslot: Optional[str] = None


class PackageItemSummary(BaseModel):
    offer_id: str
    product_title: str
    quantity: int
    unit_price_tomans: int
    total_price_tomans: int
    lead_time_days: int = 0
    pet_id: Optional[str] = None


class SplitPackage(BaseModel):
    seller_id: str
    seller_name: str
    items: List[PackageItemSummary]
    package_subtotal_tomans: int
    shipping_fee_tomans: int
    package_total_tomans: int


class CheckoutReserveResponse(BaseModel):
    order_id: str
    status: OrderStatus
    total_goods_tomans: int
    discount_amount_tomans: int
    total_shipping_tomans: int
    grand_total_tomans: int
    coupon_code: Optional[str] = None
    calculated_lead_time_days: int
    earliest_delivery_date: str
    preparation_notice: Optional[str] = None
    packages: List[SplitPackage]
    reservation_expires_at: datetime
    reservation_minutes: int


@router.post("/reserve", response_model=CheckoutReserveResponse, status_code=status.HTTP_201_CREATED)
async def reserve_checkout(
    payload: CheckoutReserveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="سبد خرید خالی است.",
        )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=RESERVATION_DURATION_MINUTES)

    # 1. Check stock and active reservations for each item
    order_items_to_create = []
    reservations_to_create = []
    packages_map = {}
    max_lead_time = 0

    for item in payload.items:
        query = (
            select(SellerOffer)
            .options(selectinload(SellerOffer.seller), selectinload(SellerOffer.product))
            .where(SellerOffer.id == item.offer_id)
        )
        result = await db.execute(query)
        offer = result.scalar_one_or_none()

        if not offer or not offer.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"پیشنهاد فروش {item.offer_id} نامعتبر یا غیرفعال است.",
            )

        # Sum active unreleased reservations for this offer
        res_query = select(func.coalesce(func.sum(InventoryReservation.quantity), 0)).where(
            and_(
                InventoryReservation.offer_id == offer.id,
                InventoryReservation.is_released == False,
                InventoryReservation.expires_at > now,
            )
        )
        res_res = await db.execute(res_query)
        currently_reserved = res_res.scalar_one()

        available_stock = offer.stock_quantity - currently_reserved
        if available_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"موجودی کالای «{offer.product.title_fa}» کافی نیست (موجودی آزاد: {available_stock} عدد).",
            )

        # Check preparation lead time for this item
        item_lead = offer.product.lead_time_days or 0
        if item_lead > max_lead_time:
            max_lead_time = item_lead

        # Create reservation record
        reservation = InventoryReservation(
            offer_id=offer.id,
            user_id=current_user.id,
            quantity=item.quantity,
            expires_at=expires_at,
            is_released=False,
        )
        reservations_to_create.append(reservation)

        commission = int(offer.price_tomans * item.quantity * 0.10)

        seller_id = offer.seller_id
        seller_name = offer.seller.store_name_fa if offer.seller else "فروشگاه بونیوو"

        if seller_id not in packages_map:
            packages_map[seller_id] = {
                "seller_name": seller_name,
                "items": [],
                "subtotal": 0,
            }

        item_total = offer.price_tomans * item.quantity
        packages_map[seller_id]["subtotal"] += item_total
        packages_map[seller_id]["items"].append(
            PackageItemSummary(
                offer_id=offer.id,
                product_title=offer.product.title_fa,
                quantity=item.quantity,
                unit_price_tomans=offer.price_tomans,
                total_price_tomans=item_total,
                lead_time_days=item_lead,
                pet_id=item.pet_id,
            )
        )

        order_item = OrderItem(
            offer_id=offer.id,
            seller_id=seller_id,
            pet_id=item.pet_id,
            product_title=offer.product.title_fa,
            quantity=item.quantity,
            unit_price_tomans=offer.price_tomans,
            commission_tomans=commission,
            lead_time_days=item_lead,
            is_collected=False,
            is_packaged=False,
        )
        order_items_to_create.append(order_item)

    # 2. Build packages & shipping fees
    packages_list = []
    total_goods = 0
    total_shipping = 0

    for s_id, p_data in packages_map.items():
        subtotal = p_data["subtotal"]
        total_goods += subtotal

        shipping_fee = 0 if subtotal >= FREE_SHIPPING_THRESHOLD_TOMANS else STANDARD_SHIPPING_FEE_TOMANS
        total_shipping += shipping_fee

        packages_list.append(
            SplitPackage(
                seller_id=s_id,
                seller_name=p_data["seller_name"],
                items=p_data["items"],
                package_subtotal_tomans=subtotal,
                shipping_fee_tomans=shipping_fee,
                package_total_tomans=subtotal + shipping_fee,
            )
        )

    # 3. Process optional coupon without burning!
    discount_amount = 0
    valid_coupon_code = None
    if payload.coupon_code:
        c_code = payload.coupon_code.strip().upper()
        c_stmt = select(Coupon).where(Coupon.code == c_code, Coupon.is_active == True)
        c_res = await db.execute(c_stmt)
        coupon = c_res.scalar_one_or_none()
        if coupon and coupon.remaining_usage > 0 and coupon.valid_until >= now and coupon.valid_from <= now:
            if total_goods >= coupon.min_order_amount_tomans:
                if coupon.coupon_type == CouponType.PERCENTAGE:
                    raw = int(total_goods * (coupon.discount_value / 100.0))
                    discount_amount = min(raw, coupon.max_discount_cap_tomans or raw)
                else:
                    discount_amount = coupon.discount_value
                discount_amount = min(discount_amount, total_goods)
                valid_coupon_code = coupon.code

    grand_total = max(0, total_goods - discount_amount) + total_shipping

    # 4. Calculate earliest delivery date respecting item preparation lead time
    # Item 13: Order-level fulfillment readiness must respect maximum preparation time.
    delivery_offset_days = max(1, max_lead_time + 1)
    earliest_date_dt = now + timedelta(days=delivery_offset_days)
    earliest_delivery_date = earliest_date_dt.strftime("%Y-%m-%d")

    prep_notice = None
    if max_lead_time > 0:
        prep_notice = f"برخی اقلام سفارش نیازمند {max_lead_time} روز کاری آماده‌سازی هستند؛ ارسال سفارش از تاریخ {earliest_delivery_date} انجام خواهد شد."

    # 5. Create Order
    order = Order(
        user_id=current_user.id,
        status=OrderStatus.PAYMENT_PENDING,
        fulfillment_stage=FulfillmentStage.CONFIRMED,
        total_amount_tomans=grand_total,
        discount_amount_tomans=discount_amount,
        coupon_code=valid_coupon_code,
        calculated_lead_time_days=max_lead_time,
        shipping_address=payload.shipping_address,
        shipping_timeslot=payload.shipping_timeslot,
        stage_confirmed_at=now,
    )
    db.add(order)
    await db.flush()

    for oi in order_items_to_create:
        oi.order_id = order.id
        db.add(oi)

    for res in reservations_to_create:
        db.add(res)

    await db.commit()

    return CheckoutReserveResponse(
        order_id=order.id,
        status=order.status,
        total_goods_tomans=total_goods,
        discount_amount_tomans=discount_amount,
        total_shipping_tomans=total_shipping,
        grand_total_tomans=grand_total,
        coupon_code=valid_coupon_code,
        calculated_lead_time_days=max_lead_time,
        earliest_delivery_date=earliest_delivery_date,
        preparation_notice=prep_notice,
        packages=packages_list,
        reservation_expires_at=expires_at,
        reservation_minutes=RESERVATION_DURATION_MINUTES,
    )


class CartItemResponse(BaseModel):
    id: str
    offer_id: str
    product_id: str
    product_title: str
    brand: Optional[str] = None
    seller_name: str
    unit_price_tomans: int
    quantity: int
    pet_id: Optional[str] = None
    lead_time_days: int = 0


class CartSyncRequest(BaseModel):
    items: List[CartItemInput]


@router.get("/cart", response_model=List[CartItemResponse])
async def get_user_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(UserCartItem)
        .options(
            selectinload(UserCartItem.offer).selectinload(SellerOffer.product),
            selectinload(UserCartItem.offer).selectinload(SellerOffer.seller),
        )
        .where(UserCartItem.user_id == current_user.id)
    )
    res = await db.execute(query)
    cart_items = res.scalars().all()

    response = []
    for ci in cart_items:
        if not ci.offer or not ci.offer.is_active:
            continue
        product = ci.offer.product
        seller = ci.offer.seller
        response.append(
            CartItemResponse(
                id=ci.id,
                offer_id=ci.offer_id,
                product_id=product.id if product else "",
                product_title=product.title_fa if product else "",
                brand=getattr(product, "brand", None),
                seller_name=seller.store_name_fa if seller else "بونیو کالا",
                unit_price_tomans=ci.offer.price_tomans,
                quantity=ci.quantity,
                pet_id=ci.pet_id,
                lead_time_days=getattr(ci.offer, "lead_time_days", 0),
            )
        )
    return response


@router.post("/cart/sync", response_model=List[CartItemResponse])
async def sync_user_cart(
    payload: CartSyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Remove existing items for this user
    await db.execute(delete(UserCartItem).where(UserCartItem.user_id == current_user.id))

    # Add new items
    for item in payload.items:
        offer = await db.scalar(select(SellerOffer).where(SellerOffer.id == item.offer_id))
        if offer and offer.is_active:
            new_item = UserCartItem(
                user_id=current_user.id,
                offer_id=item.offer_id,
                quantity=item.quantity,
                pet_id=item.pet_id,
            )
            db.add(new_item)

    await db.commit()
    return await get_user_cart(current_user=current_user, db=db)


@router.delete("/cart")
async def clear_user_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(delete(UserCartItem).where(UserCartItem.user_id == current_user.id))
    await db.commit()
    return {"success": True, "message": "سبد خرید با موفقیت خالی شد."}
