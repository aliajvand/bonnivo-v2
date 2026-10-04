"""
Location & Geospatial Discovery API for Bonyo Ecosystem.
Supports:
- Multi-category discovery (Veterinarians, Trainers, Boarding Hotels, Events)
- Mandatory progressive search radius: 5 KM -> 10 KM -> 20 KM -> Zero-results
- Haversine distance calculation and user radius notification
- Marker and card synchronization data
"""

import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database import get_db
from src.models.vet import Clinic


router = APIRouter(prefix="/discovery", tags=["Geospatial & Map Discovery"])


class DiscoveryItem(BaseModel):
    id: str
    title: str
    category: str  # VET, TRAINER, BOARDING, EVENT
    district: str
    address: str
    phone: str
    rating: float
    reviews_count: int
    latitude: float
    longitude: float
    distance_km: float
    is_emergency: bool = False
    badge: Optional[str] = None
    image_url: str


class DiscoveryResponse(BaseModel):
    user_latitude: float
    user_longitude: float
    requested_category: Optional[str]
    active_radius_km: float
    stepped_up: bool
    status_message: str
    total_found: int
    items: List[DiscoveryItem]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# Seed locations for multi-role pet ecosystem discovery across Tehran
SEED_DISCOVERY_POIS = [
    # VETS
    {
        "id": "vet-poi-1",
        "title": "بیمارستان دامپزشکی شبانه‌روزی تهران",
        "category": "VET",
        "district": "سعادت‌آباد",
        "address": "بلوار دریا، خیابان گل‌ها، نبش کوچه دهم",
        "phone": "021-88691234",
        "rating": 4.9,
        "reviews_count": 84,
        "latitude": 35.7830,
        "longitude": 51.3712,
        "is_emergency": True,
        "badge": "اورژانس ۲۴ ساعته",
        "image_url": "/icons/health.svg",
    },
    {
        "id": "vet-poi-2",
        "title": "کلینیک تخصصی جراحی پرشین پت",
        "category": "VET",
        "district": "ونک / گاندی",
        "address": "میدان ونک، خیابان گاندی جنوبی، پلاک ۱۸",
        "phone": "021-88775678",
        "rating": 4.8,
        "reviews_count": 52,
        "latitude": 35.7592,
        "longitude": 51.4183,
        "is_emergency": False,
        "badge": "تخصصی ارتوپدی و جراحی",
        "image_url": "/icons/health.svg",
    },
    {
        "id": "vet-poi-3",
        "title": "مرکز دامپزشکی پایتخت",
        "category": "VET",
        "district": "شهرک غرب",
        "address": "بلوار دادمان، روبروی پارک خوارزم",
        "phone": "021-88089900",
        "rating": 4.7,
        "reviews_count": 39,
        "latitude": 35.7601,
        "longitude": 51.3654,
        "is_emergency": False,
        "badge": "آزمایشگاه و دندانپزشکی",
        "image_url": "/icons/health.svg",
    },
    {
        "id": "vet-poi-4",
        "title": "کلینیک حیوانات خانگی نیاوران",
        "category": "VET",
        "district": "نیاوران",
        "address": "خیابان باهنر، نرسیده به سه راه یاسر",
        "phone": "021-22804560",
        "rating": 4.9,
        "reviews_count": 67,
        "latitude": 35.8155,
        "longitude": 51.4682,
        "is_emergency": True,
        "badge": "واکسیناسیون و اورژانس",
        "image_url": "/icons/health.svg",
    },
    # TRAINERS
    {
        "id": "trainer-poi-1",
        "title": "آکادمی تربیت و رفتارشناسی سگ البرز",
        "category": "TRAINER",
        "district": "منطقه ۲۲ / چیتگر",
        "address": "بلوار کوهک، مجتمع پارک چیتگر، درب ۴",
        "phone": "0912-3344556",
        "rating": 4.9,
        "reviews_count": 41,
        "latitude": 35.7392,
        "longitude": 51.2185,
        "is_emergency": False,
        "badge": "مربی بین‌المللی IACP",
        "image_url": "/icons/dog.png",
    },
    {
        "id": "trainer-poi-2",
        "title": "مرکز رفتارشناسی و آموزش گربه و سگ ژیک",
        "category": "TRAINER",
        "district": "یوسف‌آباد",
        "address": "خیابان سید جمال‌الدین اسدآبادی، کوچه ۳۵",
        "phone": "0912-7788990",
        "rating": 4.8,
        "reviews_count": 28,
        "latitude": 35.7289,
        "longitude": 51.4052,
        "is_emergency": False,
        "badge": "مربی تایید شده بنیوو",
        "image_url": "/icons/dog.png",
    },
    {
        "id": "trainer-poi-3",
        "title": "مدرسه آموزش مقدماتی و گارد پارس",
        "category": "TRAINER",
        "district": "تهرانپارس",
        "address": "بزرگراه شهید باقری، خروجی فرجام شرق",
        "phone": "021-77881122",
        "rating": 4.6,
        "reviews_count": 19,
        "latitude": 35.7335,
        "longitude": 51.5284,
        "is_emergency": False,
        "badge": "آموزش مقدماتی تا پیشرفته",
        "image_url": "/icons/dog.png",
    },
    # BOARDING
    {
        "id": "boarding-poi-1",
        "title": "هتل و پانسیون پنج‌ستاره حیوانات ولنجک",
        "category": "BOARDING",
        "district": "ولنجک",
        "address": "خیابان ساسان، انتهای کوچه یاسمن، ویلای ۲۲",
        "phone": "021-22415500",
        "rating": 5.0,
        "reviews_count": 35,
        "latitude": 35.8080,
        "longitude": 51.3980,
        "is_emergency": False,
        "badge": "نظارت ۲۴ ساعته دامپزشک",
        "image_url": "/icons/cat.png",
    },
    {
        "id": "boarding-poi-2",
        "title": "باغ اقامتی و هتل اختصاصی لواسان",
        "category": "BOARDING",
        "district": "لواسانات",
        "address": "بلوار امام خمینی لواسان، فرعی ناران، باغ بهشت",
        "phone": "0912-1112233",
        "rating": 4.9,
        "reviews_count": 48,
        "latitude": 35.8234,
        "longitude": 51.6241,
        "is_emergency": False,
        "badge": "فضای باز ۱۰۰۰ متری با وبکم",
        "image_url": "/icons/dog.png",
    },
    {
        "id": "boarding-poi-3",
        "title": "پانسیون اختصاصی گربه‌ها نیلوفر",
        "category": "BOARDING",
        "district": "گیشا",
        "address": "کوی نصر (گیشا)، بین خیابان ۱۲ و ۱۴",
        "phone": "021-88241234",
        "rating": 4.7,
        "reviews_count": 22,
        "latitude": 35.7265,
        "longitude": 51.3756,
        "is_emergency": False,
        "badge": "سوئیت‌های مجزا و بدون قفس",
        "image_url": "/icons/cat.png",
    },
    # EVENTS
    {
        "id": "event-poi-1",
        "title": "گردهمایی فصلی سرپرستان سگ‌های نژاد کوچک",
        "category": "EVENT",
        "district": "پارک پردیسان",
        "address": "بزرگراه حکیم، ورودی غربی پارک طبیعت پردیسان",
        "phone": "021-88220000",
        "rating": 4.9,
        "reviews_count": 92,
        "latitude": 35.7483,
        "longitude": 51.3592,
        "is_emergency": False,
        "badge": "رویداد فضای باز",
        "image_url": "/icons/all.png",
    },
    {
        "id": "event-poi-2",
        "title": "کارگاه آموزشی فوریت‌های پزشکی و احیای پت",
        "category": "EVENT",
        "district": "میدان ونک",
        "address": "خیابان ملاصدرا، سالن همایش‌های اکوسیستم بنیوو",
        "phone": "021-88601234",
        "rating": 5.0,
        "reviews_count": 45,
        "latitude": 35.7570,
        "longitude": 51.4110,
        "is_emergency": False,
        "badge": "با اعطای گواهی معتبر",
        "image_url": "/icons/health.svg",
    },
]


@router.get("/nearby", response_model=DiscoveryResponse)
async def discover_nearby(
    lat: float = Query(35.7219, description="User latitude (default: Central Tehran)"),
    lng: float = Query(51.3347, description="User longitude (default: Central Tehran)"),
    category: Optional[str] = Query(None, description="Filter: VET, TRAINER, BOARDING, EVENT"),
    db: AsyncSession = Depends(get_db),
):
    """
    Mandatory stepped expansion radius search:
    1. First search: 5 KM
    2. If no results: 10 KM
    3. If no results: 20 KM
    4. If still no results: clear empty state with notification
    """
    # 1. Fetch clinics from database
    q_clinics = select(Clinic)
    res_clinics = await db.execute(q_clinics)
    db_clinics = res_clinics.scalars().all()

    all_pois = list(SEED_DISCOVERY_POIS)
    for c in db_clinics:
        all_pois.append({
            "id": c.id,
            "title": c.name,
            "category": "VET",
            "district": c.district,
            "address": c.address,
            "phone": c.phone_number,
            "rating": c.rating,
            "reviews_count": c.reviews_count,
            "latitude": c.latitude or 35.7219,
            "longitude": c.longitude or 51.3347,
            "is_emergency": c.is_emergency_24h,
            "badge": "اورژانس ۲۴ ساعته" if c.is_emergency_24h else "کلینیک تاییدشده",
            "image_url": c.image_url or "/icons/health.svg",
        })

    # Filter by category if requested
    cat_upper = category.upper() if category else None
    if cat_upper:
        filtered_pool = [p for p in all_pois if p["category"] == cat_upper]
    else:
        filtered_pool = all_pois

    # Calculate distances
    scored_pool = []
    for item in filtered_pool:
        dist = haversine_km(lat, lng, item["latitude"], item["longitude"])
        scored_pool.append({**item, "distance_km": dist})

    # Sort ascending by distance
    scored_pool.sort(key=lambda x: x["distance_km"])

    # Progressive search step execution: 5 KM -> 10 KM -> 20 KM
    results_5km = [x for x in scored_pool if x["distance_km"] <= 5.0]
    if results_5km:
        return DiscoveryResponse(
            user_latitude=lat,
            user_longitude=lng,
            requested_category=cat_upper,
            active_radius_km=5.0,
            stepped_up=False,
            status_message="نتایج تا ۵ کیلومتری شما",
            total_found=len(results_5km),
            items=[DiscoveryItem(**x) for x in results_5km],
        )

    # Step 2: 10 KM expansion
    results_10km = [x for x in scored_pool if x["distance_km"] <= 10.0]
    if results_10km:
        return DiscoveryResponse(
            user_latitude=lat,
            user_longitude=lng,
            requested_category=cat_upper,
            active_radius_km=10.0,
            stepped_up=True,
            status_message="چیزی در ۵ کیلومتری پیدا نشد؛ نتایج تا ۱۰ کیلومتر گسترش یافت",
            total_found=len(results_10km),
            items=[DiscoveryItem(**x) for x in results_10km],
        )

    # Step 3: 20 KM expansion
    results_20km = [x for x in scored_pool if x["distance_km"] <= 20.0]
    if results_20km:
        return DiscoveryResponse(
            user_latitude=lat,
            user_longitude=lng,
            requested_category=cat_upper,
            active_radius_km=20.0,
            stepped_up=True,
            status_message="چیزی در ۱۰ کیلومتری پیدا نشد؛ نتایج تا ۲۰ کیلومتر گسترش یافت",
            total_found=len(results_20km),
            items=[DiscoveryItem(**x) for x in results_20km],
        )

    # Final zero-results state
    return DiscoveryResponse(
        user_latitude=lat,
        user_longitude=lng,
        requested_category=cat_upper,
        active_radius_km=20.0,
        stepped_up=False,
        status_message="هیچ مرکزی تا شعاع ۲۰ کیلومتری شما یافت نشد",
        total_found=0,
        items=[],
    )
