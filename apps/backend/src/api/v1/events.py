import secrets
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.event import Event, EventTicket, EventModerationStatus
from src.services.groq_service import enhance_persian_seo_content

router = APIRouter(prefix="/events", tags=["Events & Community"])


class EventPublicResponse(BaseModel):
    id: str
    title: str
    short_description: Optional[str] = None
    description: str
    image_url: Optional[str] = None
    event_date: datetime
    event_time: str
    location_name: str
    address: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_tomans: int
    capacity: int
    registered_count: int
    is_full: bool
    rules: Optional[str] = None
    schedule: Optional[str] = None
    created_at: datetime


class EventCreatePayload(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    short_description: Optional[str] = None
    description: str = Field(..., min_length=10)
    image_url: Optional[str] = None
    event_date: datetime
    event_time: str
    location_name: str
    address: str
    city: str = "تهران"
    latitude: Optional[float] = 35.7219
    longitude: Optional[float] = 51.3347
    price_tomans: int = 0
    capacity: int = 50
    rules: Optional[str] = None
    schedule: Optional[str] = None
    use_ai_enhancement: bool = False


class EventBookPayload(BaseModel):
    attendee_name: str = Field(..., min_length=2, max_length=100)
    attendee_phone: str = Field(..., min_length=10, max_length=15)


class EventTicketResponse(BaseModel):
    id: str
    event_id: str
    event_title: str
    event_date: datetime
    event_time: str
    location_name: str
    address: str
    ticket_code: str
    attendee_name: str
    attendee_phone: str
    price_paid_tomans: int
    is_checked_in: bool
    qr_code_data: Optional[str] = None
    created_at: datetime


class EventModeratePayload(BaseModel):
    status: EventModerationStatus
    admin_notes: Optional[str] = None


@router.get("", response_model=List[EventPublicResponse])
async def list_public_events(
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Public listing: only returns APPROVED and active events.
    """
    stmt = (
        select(Event)
        .where(
            Event.moderation_status == EventModerationStatus.APPROVED,
            Event.is_active == True,
        )
        .order_by(Event.event_date.asc())
    )
    if city:
        stmt = stmt.where(Event.city == city)

    res = await db.execute(stmt)
    events = res.scalars().all()

    return [
        EventPublicResponse(
            id=e.id,
            title=e.title,
            short_description=e.short_description,
            description=e.description,
            image_url=e.image_url or "/icons/events.svg",
            event_date=e.event_date,
            event_time=e.event_time,
            location_name=e.location_name,
            address=e.address,
            city=e.city,
            latitude=e.latitude,
            longitude=e.longitude,
            price_tomans=e.price_tomans,
            capacity=e.capacity,
            registered_count=e.registered_count,
            is_full=(e.registered_count >= e.capacity),
            rules=e.rules,
            schedule=e.schedule,
            created_at=e.created_at,
        )
        for e in events
    ]


@router.get("/{event_id}", response_model=EventPublicResponse)
async def get_event_detail(
    event_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Event).where(Event.id == event_id)
    res = await db.execute(stmt)
    e = res.scalar_one_or_none()

    if not e or not e.is_active:
        raise HTTPException(status_code=404, detail="رویداد مورد نظر یافت نشد.")

    # Only show approved events to public (unless admin/organizer handled elsewhere)
    if e.moderation_status != EventModerationStatus.APPROVED:
        raise HTTPException(status_code=404, detail="این رویداد هنوز تایید نشده است.")

    return EventPublicResponse(
        id=e.id,
        title=e.title,
        short_description=e.short_description,
        description=e.description,
        image_url=e.image_url or "/icons/events.svg",
        event_date=e.event_date,
        event_time=e.event_time,
        location_name=e.location_name,
        address=e.address,
        city=e.city,
        latitude=e.latitude,
        longitude=e.longitude,
        price_tomans=e.price_tomans,
        capacity=e.capacity,
        registered_count=e.registered_count,
        is_full=(e.registered_count >= e.capacity),
        rules=e.rules,
        schedule=e.schedule,
        created_at=e.created_at,
    )


@router.post("/{event_id}/book", response_model=EventTicketResponse)
async def book_event_ticket(
    event_id: str,
    payload: EventBookPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Event).where(Event.id == event_id).with_for_update()
    res = await db.execute(stmt)
    event = res.scalar_one_or_none()

    if not event or event.moderation_status != EventModerationStatus.APPROVED or not event.is_active:
        raise HTTPException(status_code=404, detail="رویداد معتبر برای رزرو وجود ندارد.")

    if event.registered_count >= event.capacity:
        raise HTTPException(status_code=400, detail="ظرفیت این رویداد تکمیل شده است.")

    # Generate unique ticket identifier
    ticket_code = f"BNV-{datetime.now().strftime('%y%m')}-{secrets.token_hex(4).upper()}"
    qr_data = f"https://bonnivo.ir/tickets/verify?code={ticket_code}"

    ticket = EventTicket(
        event_id=event.id,
        user_id=current_user.id,
        ticket_code=ticket_code,
        attendee_name=payload.attendee_name,
        attendee_phone=payload.attendee_phone,
        price_paid_tomans=event.price_tomans,
        qr_code_data=qr_data,
        is_checked_in=False,
    )
    event.registered_count += 1
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    return EventTicketResponse(
        id=ticket.id,
        event_id=event.id,
        event_title=event.title,
        event_date=event.event_date,
        event_time=event.event_time,
        location_name=event.location_name,
        address=event.address,
        ticket_code=ticket.ticket_code,
        attendee_name=ticket.attendee_name,
        attendee_phone=ticket.attendee_phone,
        price_paid_tomans=ticket.price_paid_tomans,
        is_checked_in=ticket.is_checked_in,
        qr_code_data=ticket.qr_code_data,
        created_at=ticket.created_at,
    )


@router.get("/tickets/my-tickets", response_model=List[EventTicketResponse])
async def list_my_tickets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(EventTicket)
        .options(selectinload(EventTicket.event))
        .where(EventTicket.user_id == current_user.id)
        .order_by(EventTicket.created_at.desc())
    )
    res = await db.execute(stmt)
    tickets = res.scalars().all()

    return [
        EventTicketResponse(
            id=t.id,
            event_id=t.event.id,
            event_title=t.event.title,
            event_date=t.event.event_date,
            event_time=t.event.event_time,
            location_name=t.event.location_name,
            address=t.event.address,
            ticket_code=t.ticket_code,
            attendee_name=t.attendee_name,
            attendee_phone=t.attendee_phone,
            price_paid_tomans=t.price_paid_tomans,
            is_checked_in=t.is_checked_in,
            qr_code_data=t.qr_code_data,
            created_at=t.created_at,
        )
        for t in tickets
    ]


@router.post("/organizer/events", status_code=status.HTTP_201_CREATED)
async def create_organizer_event(
    payload: EventCreatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    final_desc = payload.description
    final_short = payload.short_description

    # Optional Groq LLM SEO enhancement
    if payload.use_ai_enhancement:
        try:
            enhanced = await enhance_persian_seo_content(
                f"عنوان: {payload.title}\nشرح: {payload.description}"
            )
            if enhanced and "enhanced_content" in enhanced:
                final_desc = enhanced["enhanced_content"]
        except Exception:
            pass

    event = Event(
        title=payload.title,
        short_description=final_short or payload.title,
        description=final_desc,
        image_url=payload.image_url or "/icons/events.svg",
        event_date=payload.event_date,
        event_time=payload.event_time,
        location_name=payload.location_name,
        address=payload.address,
        city=payload.city,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_tomans=payload.price_tomans,
        capacity=payload.capacity,
        registered_count=0,
        rules=payload.rules,
        schedule=payload.schedule,
        organizer_id=current_user.id,
        moderation_status=EventModerationStatus.PENDING_REVIEW,
        is_active=True,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)

    return {
        "success": True,
        "message": "رویداد شما ثبت شد و جهت بررسی برای مدیریت ارسال گردید.",
        "event_id": event.id,
        "moderation_status": event.moderation_status,
    }


@router.get("/organizer/events")
async def list_organizer_events(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Event)
        .where(Event.organizer_id == current_user.id)
        .order_by(Event.created_at.desc())
    )
    res = await db.execute(stmt)
    events = res.scalars().all()
    return events


@router.get("/admin/pending")
async def list_pending_events(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    stmt = (
        select(Event)
        .where(Event.moderation_status == EventModerationStatus.PENDING_REVIEW)
        .order_by(Event.created_at.asc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/admin/{event_id}/moderate")
async def moderate_event(
    event_id: str,
    payload: EventModeratePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    stmt = select(Event).where(Event.id == event_id)
    res = await db.execute(stmt)
    event = res.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="رویداد یافت نشد")

    event.moderation_status = payload.status
    event.admin_notes = payload.admin_notes
    await db.commit()
    await db.refresh(event)

    return {
        "success": True,
        "message": f"وضعیت رویداد به {payload.status.value} تغییر یافت.",
        "event_id": event.id,
        "status": event.moderation_status,
    }
