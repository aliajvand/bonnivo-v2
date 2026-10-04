from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.order import Order, OrderItem, OrderStatus, FulfillmentStage, InventoryReservation
from src.models.catalog import SellerOffer
from src.models.coupon import Coupon, CouponRedemption, RedemptionStatus
from src.services.payment import get_payment_gateway, PaymentGateway

router = APIRouter(prefix="/payment", tags=["Payment & Gateway"])


class PaymentRequestPayload(BaseModel):
    order_id: str
    callback_url: Optional[str] = "http://localhost:3000/checkout/callback"


class PaymentRequestResponse(BaseModel):
    order_id: str
    authority: str
    payment_url: str
    amount_tomans: int


class PaymentVerifyResponse(BaseModel):
    order_id: str
    status: OrderStatus
    payment_ref_id: str
    total_amount_tomans: int
    commission_deducted_tomans: int
    message: str


class OrderItemTrackingStatus(BaseModel):
    item_id: str
    product_title: str
    is_collected: bool
    is_packaged: bool


class OrderTrackingResponse(BaseModel):
    order_id: str
    status: OrderStatus
    fulfillment_stage: FulfillmentStage
    total_amount_tomans: int
    calculated_lead_time_days: int
    shipping_address: Optional[str]
    stage_confirmed_at: Optional[datetime]
    stage_collected_at: Optional[datetime]
    stage_packaged_at: Optional[datetime]
    stage_sending_at: Optional[datetime]
    stage_courier_at: Optional[datetime]
    stage_delivered_at: Optional[datetime]
    items: List[OrderItemTrackingStatus]


class AdvanceStagePayload(BaseModel):
    stage: FulfillmentStage
    complete_item_ids: Optional[List[str]] = None


@router.post("/request", response_model=PaymentRequestResponse)
async def request_payment(
    payload: PaymentRequestPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    gateway: PaymentGateway = Depends(get_payment_gateway),
):
    query = select(Order).where(Order.id == payload.order_id)
    result = await db.execute(query)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="سفارش یافت نشد.",
        )

    # Ownership check
    if order.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="شما دسترسی به این سفارش ندارید.",
        )

    if order.status != OrderStatus.PAYMENT_PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"وضعیت سفارش نامعتبر است: {order.status}",
        )

    success, authority, payment_url = await gateway.request_payment(
        amount_tomans=order.total_amount_tomans,
        description=f"پرداخت سفارش بونیوو #{order.id[:8]}",
        callback_url=payload.callback_url or "http://localhost:3000/checkout/callback",
        mobile=current_user.phone_number,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"خطا در ارتباط با درگاه پرداخت: {authority}",
        )

    order.payment_authority = authority
    await db.commit()

    return PaymentRequestResponse(
        order_id=order.id,
        authority=authority,
        payment_url=payment_url,
        amount_tomans=order.total_amount_tomans,
    )


@router.get("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(
    Authority: str = Query(..., description="ZarinPal payment authority token"),
    Status: str = Query(..., description="Gateway status: OK or NOK"),
    db: AsyncSession = Depends(get_db),
    gateway: PaymentGateway = Depends(get_payment_gateway),
):
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.payment_authority == Authority)
        .order_by(Order.created_at.desc())
    )
    result = await db.execute(query)
    order = result.scalars().first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="سفارشی با این شناسه پرداخت یافت نشد.",
        )

    if order.status == OrderStatus.PAID:
        return PaymentVerifyResponse(
            order_id=order.id,
            status=order.status,
            payment_ref_id=order.payment_ref_id or "ALREADY_VERIFIED",
            total_amount_tomans=order.total_amount_tomans,
            commission_deducted_tomans=sum(item.commission_tomans for item in order.items),
            message="سفارش قبلاً با موفقیت پرداخت شده است.",
        )

    # Item 14: Never mark unpaid order as successful!
    if Status.upper() != "OK":
        order.status = OrderStatus.CANCELLED
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="پرداخت توسط کاربر لغو شد یا در درگاه تایید نشد.",
        )

    success, ref_id_or_error = await gateway.verify_payment(
        authority=Authority,
        amount_tomans=order.total_amount_tomans,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"تایید تراکنش با شکست مواجه شد: {ref_id_or_error}",
        )

    # 1. Deduct permanent stock from seller offers and release reservations
    total_commission = 0
    for item in order.items:
        total_commission += item.commission_tomans
        offer_q = select(SellerOffer).where(SellerOffer.id == item.offer_id)
        offer_res = await db.execute(offer_q)
        offer = offer_res.scalar_one_or_none()
        if offer:
            offer.stock_quantity = max(0, offer.stock_quantity - item.quantity)

    offer_ids = [item.offer_id for item in order.items]
    res_q = select(InventoryReservation).where(
        InventoryReservation.user_id == order.user_id,
        InventoryReservation.offer_id.in_(offer_ids),
        InventoryReservation.is_released == False,
    )
    res_result = await db.execute(res_q)
    reservations = res_result.scalars().all()
    for res in reservations:
        res.is_released = True

    # 2. Update order to PAID and advance tracking stage to CONFIRMED
    now = datetime.now(timezone.utc)
    order.status = OrderStatus.PAID
    order.payment_ref_id = ref_id_or_error
    order.fulfillment_stage = FulfillmentStage.CONFIRMED
    order.stage_confirmed_at = now

    # 3. Item 12: Burn coupon now upon verified payment!
    if order.coupon_code:
        c_q = select(Coupon).where(Coupon.code == order.coupon_code).with_for_update()
        c_res = await db.execute(c_q)
        coupon = c_res.scalar_one_or_none()
        if coupon and coupon.remaining_usage > 0:
            coupon.remaining_usage -= 1
            redemption = CouponRedemption(
                coupon_id=coupon.id,
                user_id=order.user_id,
                order_id=order.id,
                discount_amount_tomans=order.discount_amount_tomans,
                status=RedemptionStatus.BURNED,
                burned_at=now,
            )
            db.add(redemption)

    # 4. Create Smart Replenishment Schedules for any pet food purchases
    from src.services.replenishment import create_schedules_from_order
    await create_schedules_from_order(db, order)

    # 5. Clear user's active cart in DB upon successful order payment
    from src.models.order import UserCartItem
    from sqlalchemy import delete
    await db.execute(delete(UserCartItem).where(UserCartItem.user_id == order.user_id))

    await db.commit()

    return PaymentVerifyResponse(
        order_id=order.id,
        status=order.status,
        payment_ref_id=ref_id_or_error,
        total_amount_tomans=order.total_amount_tomans,
        commission_deducted_tomans=total_commission,
        message="پرداخت با موفقیت انجام و سفارش ثبت نهایی شد.",
    )


@router.get("/tracking/{order_id}", response_model=OrderTrackingResponse)
async def get_order_tracking(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Item 16: Customer and Staff Order Tracking across 6 fulfillment stages.
    """
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order_id)
    )
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="سفارش یافت نشد")

    if order.user_id != current_user.id and current_user.role not in ("ADMIN", "LOGISTICS"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    return OrderTrackingResponse(
        order_id=order.id,
        status=order.status,
        fulfillment_stage=order.fulfillment_stage,
        total_amount_tomans=order.total_amount_tomans,
        calculated_lead_time_days=order.calculated_lead_time_days,
        shipping_address=order.shipping_address,
        stage_confirmed_at=order.stage_confirmed_at,
        stage_collected_at=order.stage_collected_at,
        stage_packaged_at=order.stage_packaged_at,
        stage_sending_at=order.stage_sending_at,
        stage_courier_at=order.stage_courier_at,
        stage_delivered_at=order.stage_delivered_at,
        items=[
            OrderItemTrackingStatus(
                item_id=it.id,
                product_title=it.product_title,
                is_collected=it.is_collected,
                is_packaged=it.is_packaged,
            )
            for it in order.items
        ],
    )


@router.post("/tracking/{order_id}/advance-stage")
async def advance_order_stage(
    order_id: str,
    payload: AdvanceStagePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Item 16: Operational staff updates subtasks. Order stage advances ONLY
    when all required items for that stage are completed.
    """
    if current_user.role not in ("ADMIN", "LOGISTICS", "SELLER"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز برای تغییر مراحل لجستیک")

    stmt = select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="سفارش یافت نشد")

    now = datetime.now(timezone.utc)

    # Mark items completed if provided
    if payload.complete_item_ids:
        for it in order.items:
            if it.id in payload.complete_item_ids:
                if payload.stage == FulfillmentStage.COLLECTING_ITEMS:
                    it.is_collected = True
                elif payload.stage == FulfillmentStage.PACKAGING:
                    it.is_packaged = True

    # Rule: If stage is COLLECTING_ITEMS or PACKAGING, advance order only when ALL items are completed
    if payload.stage == FulfillmentStage.COLLECTING_ITEMS:
        all_collected = all(it.is_collected for it in order.items)
        if all_collected:
            order.fulfillment_stage = FulfillmentStage.COLLECTING_ITEMS
            order.stage_collected_at = now
    elif payload.stage == FulfillmentStage.PACKAGING:
        all_packaged = all(it.is_packaged for it in order.items)
        if all_packaged:
            order.fulfillment_stage = FulfillmentStage.PACKAGING
            order.stage_packaged_at = now
    else:
        order.fulfillment_stage = payload.stage
        if payload.stage == FulfillmentStage.SENDING:
            order.stage_sending_at = now
        elif payload.stage == FulfillmentStage.HANDED_TO_COURIER:
            order.stage_courier_at = now
        elif payload.stage == FulfillmentStage.DELIVERED:
            order.stage_delivered_at = now
            order.status = OrderStatus.DELIVERED

    await db.commit()
    await db.refresh(order)

    return {
        "success": True,
        "order_id": order.id,
        "fulfillment_stage": order.fulfillment_stage,
        "message": f"مرحله سفارش به {order.fulfillment_stage.value} به‌روزرسانی شد.",
    }
