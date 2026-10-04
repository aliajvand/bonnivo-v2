from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User, UserRole
from src.models.order import Order
from src.models.logistics import CourierShipment, CourierStatus, DeliveryTier, VALID_COURIER_TRANSITIONS

router = APIRouter(prefix="/logistics", tags=["Tehran Logistics & Express Dispatch"])


class AssignCourierPayload(BaseModel):
    order_id: str
    courier_name: str
    courier_phone: str
    tehran_district: int = Field(..., ge=1, le=22)
    delivery_tier: DeliveryTier = DeliveryTier.STANDARD


class UpdateCourierStatusPayload(BaseModel):
    new_status: CourierStatus
    notes: Optional[str] = None


class UpdateCourierLocationPayload(BaseModel):
    latitude: float
    longitude: float


class CourierShipmentResponse(BaseModel):
    id: str
    order_id: str
    courier_name: str
    courier_phone: str
    tehran_district: int
    delivery_tier: DeliveryTier
    status: CourierStatus
    current_lat: float
    current_lng: float
    estimated_delivery_time: Optional[datetime]
    delivered_at: Optional[datetime]
    created_at: datetime


def calculate_tehran_delivery_fee(district: int, tier: DeliveryTier) -> int:
    if 1 <= district <= 5:
        base = 45000
    elif 6 <= district <= 14:
        base = 55000
    else:
        base = 65000

    if tier == DeliveryTier.EXPRESS_3H:
        return base + 40000
    return base


@router.get("/estimate-fee")
async def estimate_delivery_fee(
    district: int = 1,
    tier: DeliveryTier = DeliveryTier.STANDARD,
):
    if not (1 <= district <= 22):
        raise HTTPException(status_code=400, detail="شماره منطقه شهرداری تهران باید بین ۱ تا ۲۲ باشد.")

    fee = calculate_tehran_delivery_fee(district, tier)
    sla_hours = 3 if tier == DeliveryTier.EXPRESS_3H else 24

    return {
        "tehran_district": district,
        "delivery_tier": tier,
        "fee_toman": fee,
        "sla_hours": sla_hours,
        "guaranteed_delivery_text": f"ارسال اکسپرس در کمتر از {sla_hours} ساعت" if tier == DeliveryTier.EXPRESS_3H else "ارسال در همان روز",
    }


@router.post("/dispatch", response_model=CourierShipmentResponse, status_code=status.HTTP_201_CREATED)
async def dispatch_courier(
    payload: AssignCourierPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify Order exists
    order_stmt = select(Order).where(Order.id == payload.order_id)
    order_res = await db.execute(order_stmt)
    order = order_res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="سفارش مورد نظر یافت نشد.")

    # Check if already assigned
    existing_stmt = select(CourierShipment).where(CourierShipment.order_id == payload.order_id)
    existing_res = await db.execute(existing_stmt)
    if existing_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="برای این سفارش قبلاً سفیر اختصاص داده شده است.")

    eta_delta = timedelta(hours=3) if payload.delivery_tier == DeliveryTier.EXPRESS_3H else timedelta(hours=24)
    estimated_eta = datetime.now(timezone.utc) + eta_delta

    shipment = CourierShipment(
        order_id=payload.order_id,
        courier_name=payload.courier_name,
        courier_phone=payload.courier_phone,
        tehran_district=payload.tehran_district,
        delivery_tier=payload.delivery_tier,
        status=CourierStatus.COURIER_ASSIGNED,
        current_lat=35.7219,
        current_lng=51.3347,
        estimated_delivery_time=estimated_eta,
    )
    db.add(shipment)
    await db.commit()
    await db.refresh(shipment)

    return CourierShipmentResponse(
        id=shipment.id,
        order_id=shipment.order_id,
        courier_name=shipment.courier_name,
        courier_phone=shipment.courier_phone,
        tehran_district=shipment.tehran_district,
        delivery_tier=shipment.delivery_tier,
        status=shipment.status,
        current_lat=shipment.current_lat,
        current_lng=shipment.current_lng,
        estimated_delivery_time=shipment.estimated_delivery_time,
        delivered_at=shipment.delivered_at,
        created_at=shipment.created_at,
    )


@router.put("/shipments/{shipment_id}/status", response_model=CourierShipmentResponse)
async def transition_shipment_status(
    shipment_id: str,
    payload: UpdateCourierStatusPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourierShipment).where(CourierShipment.id == shipment_id)
    res = await db.execute(stmt)
    shipment = res.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="مرسوله مورد نظر یافت نشد.")

    # State Machine Transition Validation
    allowed_next = VALID_COURIER_TRANSITIONS.get(shipment.status, [])
    if payload.new_status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"تغییر وضعیت نامعتبر در ماشین حالت مرسوله: "
                f"انتقال از '{shipment.status.value}' به '{payload.new_status.value}' مجاز نیست. "
                f"وضعیت‌های مجاز بعدی: {[s.value for s in allowed_next]}"
            ),
        )

    shipment.status = payload.new_status
    if payload.new_status == CourierStatus.DELIVERED:
        shipment.delivered_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(shipment)

    return CourierShipmentResponse(
        id=shipment.id,
        order_id=shipment.order_id,
        courier_name=shipment.courier_name,
        courier_phone=shipment.courier_phone,
        tehran_district=shipment.tehran_district,
        delivery_tier=shipment.delivery_tier,
        status=shipment.status,
        current_lat=shipment.current_lat,
        current_lng=shipment.current_lng,
        estimated_delivery_time=shipment.estimated_delivery_time,
        delivered_at=shipment.delivered_at,
        created_at=shipment.created_at,
    )


@router.put("/shipments/{shipment_id}/location")
async def update_courier_location(
    shipment_id: str,
    payload: UpdateCourierLocationPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CourierShipment).where(CourierShipment.id == shipment_id)
    res = await db.execute(stmt)
    shipment = res.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="مرسوله مورد نظر یافت نشد.")

    shipment.current_lat = payload.latitude
    shipment.current_lng = payload.longitude
    await db.commit()

    return {"success": True, "lat": shipment.current_lat, "lng": shipment.current_lng}


@router.get("/orders/{order_id}/tracking", response_model=CourierShipmentResponse)
async def track_order_shipment(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch Order & verify IDOR
    order_stmt = select(Order).where(Order.id == order_id)
    order_res = await db.execute(order_stmt)
    order = order_res.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="سفارش مورد نظر یافت نشد.")

    if order.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="دسترسی به اطلاعات رهگیری این سفارش غیرمجاز است.")

    stmt = select(CourierShipment).where(CourierShipment.order_id == order_id)
    res = await db.execute(stmt)
    shipment = res.scalar_one_or_none()
    if not shipment:
        raise HTTPException(status_code=404, detail="هنوز سفیر برای این سفارش تخصیص نیافته است.")

    return CourierShipmentResponse(
        id=shipment.id,
        order_id=shipment.order_id,
        courier_name=shipment.courier_name,
        courier_phone=shipment.courier_phone,
        tehran_district=shipment.tehran_district,
        delivery_tier=shipment.delivery_tier,
        status=shipment.status,
        current_lat=shipment.current_lat,
        current_lng=shipment.current_lng,
        estimated_delivery_time=shipment.estimated_delivery_time,
        delivered_at=shipment.delivered_at,
        created_at=shipment.created_at,
    )
