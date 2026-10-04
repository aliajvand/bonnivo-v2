from datetime import datetime, timezone
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.feature_flag import PlatformFeatureFlag

router = APIRouter(prefix="/feature-flags", tags=["Platform Feature Flags"])


class FeatureFlagResponse(BaseModel):
    module_key: str
    name_fa: str
    is_enabled: bool
    description: Optional[str] = None
    updated_at: datetime


class FeatureFlagTogglePayload(BaseModel):
    is_enabled: bool


DEFAULT_MODULES = [
    {"module_key": "shop", "name_fa": "فروشگاه آنلاین و ملزومات", "is_enabled": True, "description": "کاتالوگ محصولات، سبد خرید، تخفیف‌ها و تسویه حساب"},
    {"module_key": "veterinary", "name_fa": "خدمات دامپزشکی و کلینیک‌ها", "is_enabled": True, "description": "جستجوی کلینیک، رزرو نوبت، پرونده سلامت و کنسلی"},
    {"module_key": "trainers", "name_fa": "مربیان و آموزش رفتارشناسی", "is_enabled": True, "description": "لیست مربیان مجرب، رزرو جلسات آموزشی و گزارش تمرینات"},
    {"module_key": "boarding", "name_fa": "پانسیون و نگهداری موقت", "is_enabled": True, "description": "هتل‌های حیوانات، رزرو اقامت و دوربین مداربسته"},
    {"module_key": "events", "name_fa": "رویدادها و همایش‌های جامعه حیوانات", "is_enabled": True, "description": "رویدادهای تفریحی، کارگاه‌ها و صدور بلیت دیجیتال"},
]


async def ensure_default_flags(db: AsyncSession):
    stmt = select(PlatformFeatureFlag)
    res = await db.execute(stmt)
    existing = {f.module_key: f for f in res.scalars().all()}

    changed = False
    for mod in DEFAULT_MODULES:
        if mod["module_key"] not in existing:
            new_flag = PlatformFeatureFlag(
                module_key=mod["module_key"],
                name_fa=mod["name_fa"],
                is_enabled=mod["is_enabled"],
                description=mod["description"],
            )
            db.add(new_flag)
            changed = True
    if changed:
        await db.commit()


@router.get("", response_model=List[FeatureFlagResponse])
async def list_public_feature_flags(db: AsyncSession = Depends(get_db)):
    """
    Publicly accessible endpoint so frontend layout, navigation and ecosystem blocks
    can dynamically adapt to server-side enabled modules.
    """
    await ensure_default_flags(db)
    stmt = select(PlatformFeatureFlag)
    res = await db.execute(stmt)
    flags = res.scalars().all()
    return [
        FeatureFlagResponse(
            module_key=f.module_key,
            name_fa=f.name_fa,
            is_enabled=f.is_enabled,
            description=f.description,
            updated_at=f.updated_at,
        )
        for f in flags
    ]


@router.get("/status-dict")
async def get_flags_status_dict(db: AsyncSession = Depends(get_db)) -> Dict[str, bool]:
    await ensure_default_flags(db)
    stmt = select(PlatformFeatureFlag)
    res = await db.execute(stmt)
    flags = res.scalars().all()
    return {f.module_key: f.is_enabled for f in flags}


@router.post("/admin/{module_key}/toggle", response_model=FeatureFlagResponse)
async def toggle_feature_flag(
    module_key: str,
    payload: FeatureFlagTogglePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="تنها مدیران سامانه مجاز به تغییر قابلیت‌های پلتفرم هستند.")

    await ensure_default_flags(db)
    stmt = select(PlatformFeatureFlag).where(PlatformFeatureFlag.module_key == module_key)
    res = await db.execute(stmt)
    flag = res.scalar_one_or_none()
    if not flag:
        raise HTTPException(status_code=404, detail="ماژول درخواستی در لیست قابلیت‌ها تعریف نشده است.")

    flag.is_enabled = payload.is_enabled
    flag.updated_by = current_user.id
    await db.commit()
    await db.refresh(flag)

    return FeatureFlagResponse(
        module_key=flag.module_key,
        name_fa=flag.name_fa,
        is_enabled=flag.is_enabled,
        description=flag.description,
        updated_at=flag.updated_at,
    )
