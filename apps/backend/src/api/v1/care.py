from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User, UserRole
from src.models.pet import Pet, CareTask, TaskCompletion, PetSpecies, TaskCategory

router = APIRouter(prefix="/care", tags=["Daily Care Tasks"])


class CareTaskResponse(BaseModel):
    id: str
    pet_id: str
    title: str
    species: PetSpecies
    category: TaskCategory
    target_metric: Optional[str] = None
    target_value: Optional[int] = None
    scheduled_time: Optional[str] = None
    scheduled_date: Optional[str] = None
    is_locked: bool = False
    creator_role: str = "OWNER"
    is_completed: bool
    completed_at: Optional[datetime] = None


class CareTaskCreatePayload(BaseModel):
    pet_id: str
    title: str = Field(..., min_length=2, max_length=100)
    category: TaskCategory = TaskCategory.FOOD
    target_metric: Optional[str] = None
    target_value: Optional[int] = None
    scheduled_time: Optional[str] = None
    scheduled_date: Optional[str] = None  # YYYY-MM-DD


class CareSummaryResponse(BaseModel):
    pet_id: str
    total_tasks: int
    completed_tasks: int
    progress_percentage: int
    walk_target_minutes: int
    walk_completed_minutes: int


def generate_default_species_tasks(pet_id: str, species: PetSpecies, pet_name: str, today_str: str) -> List[CareTask]:
    if species == PetSpecies.DOG:
        return [
            CareTask(pet_id=pet_id, title=f"پیاده‌روی روزانه {pet_name}", species=species, category=TaskCategory.WALK, target_metric="MINUTES", target_value=40, scheduled_time="08:30", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
            CareTask(pet_id=pet_id, title=f"وعده غذای اصلی {pet_name}", species=species, category=TaskCategory.FOOD, target_metric="GRAMS", target_value=250, scheduled_time="19:00", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
            CareTask(pet_id=pet_id, title="بررسی و تعویض آب تازه", species=species, category=TaskCategory.WATER, scheduled_time="12:00", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
        ]
    elif species == PetSpecies.CAT:
        return [
            CareTask(pet_id=pet_id, title="بررسی و تمیز کردن خاک گربه", species=species, category=TaskCategory.HYGIENE, scheduled_time="09:00", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
            CareTask(pet_id=pet_id, title=f"وعده غذای مرطوب {pet_name}", species=species, category=TaskCategory.FOOD, target_metric="GRAMS", target_value=85, scheduled_time="13:30", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
            CareTask(pet_id=pet_id, title=f"بازی و تحرک روزانه {pet_name}", species=species, category=TaskCategory.WALK, target_metric="MINUTES", target_value=20, scheduled_time="21:00", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
            CareTask(pet_id=pet_id, title="خمیر مالت ضد گلوله مویی", species=species, category=TaskCategory.MEDICATION, scheduled_time="10:00", scheduled_date=today_str, creator_role="VET", is_locked=True),
        ]
    else:
        return [
            CareTask(pet_id=pet_id, title="شارژ یونجه تازه و پلت", species=species, category=TaskCategory.FOOD, scheduled_time="09:00", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
            CareTask(pet_id=pet_id, title="بررسی سر ساچمه‌ای آبخوری", species=species, category=TaskCategory.WATER, scheduled_time="11:00", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
            CareTask(pet_id=pet_id, title="بررسی خشکی پوشال و بستر", species=species, category=TaskCategory.HYGIENE, scheduled_time="18:00", scheduled_date=today_str, creator_role="OWNER", is_locked=False),
        ]


@router.get("/tasks", response_model=List[CareTaskResponse])
async def get_pet_tasks(
    pet_id: str,
    filter_role: Optional[str] = Query("ALL", alias="filter", description="ALL, OWNER, VET, SYSTEM"),
    date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify ownership
    pet_stmt = select(Pet).options(selectinload(Pet.care_tasks)).where(Pet.id == pet_id)
    res = await db.execute(pet_stmt)
    pet = res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت مورد نظر یافت نشد")
    if pet.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, UserRole.VETERINARIAN, "ADMIN", "VET", "VETERINARIAN"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    today_str = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Query tasks directly
    tasks_stmt = select(CareTask).where(CareTask.pet_id == pet_id)
    if date:
        tasks_stmt = tasks_stmt.where((CareTask.scheduled_date == date) | (CareTask.scheduled_date == None))

    tasks_res = await db.execute(tasks_stmt)
    tasks = list(tasks_res.scalars().all())

    # If no tasks exist for this pet, seed default tasks with date
    if not tasks:
        defaults = generate_default_species_tasks(pet.id, pet.species, pet.name, today_str)
        for t in defaults:
            db.add(t)
        await db.commit()
        tasks_res = await db.execute(tasks_stmt)
        tasks = list(tasks_res.scalars().all())

    # Filter by creator_role
    f_clean = (filter_role or "ALL").upper()
    if f_clean == "OWNER":
        tasks = [t for t in tasks if t.creator_role == "OWNER"]
    elif f_clean == "VET":
        tasks = [t for t in tasks if t.creator_role == "VET"]
    elif f_clean in ("SYSTEM", "OTHER"):
        tasks = [t for t in tasks if t.creator_role in ("SYSTEM", "OTHER")]

    # Query latest completions
    task_ids = [t.id for t in tasks]
    completed_task_ids = {}
    if task_ids:
        comp_stmt = select(TaskCompletion).where(TaskCompletion.task_id.in_(task_ids))
        comp_res = await db.execute(comp_stmt)
        completions = comp_res.scalars().all()
        completed_task_ids = {c.task_id: c.completed_at for c in completions}

    return [
        CareTaskResponse(
            id=t.id,
            pet_id=t.pet_id,
            title=t.title,
            species=t.species,
            category=t.category,
            target_metric=t.target_metric,
            target_value=t.target_value,
            scheduled_time=t.scheduled_time,
            scheduled_date=t.scheduled_date,
            is_locked=t.is_locked,
            creator_role=t.creator_role,
            is_completed=(t.id in completed_task_ids),
            completed_at=completed_task_ids.get(t.id),
        )
        for t in tasks
    ]


@router.post("/tasks", response_model=CareTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_care_task(
    payload: CareTaskCreatePayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pet_stmt = select(Pet).where(Pet.id == payload.pet_id)
    res = await db.execute(pet_stmt)
    pet = res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت مورد نظر یافت نشد")

    if pet.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, UserRole.VETERINARIAN, "ADMIN", "VET", "VETERINARIAN"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    is_vet = (current_user.role in (UserRole.VETERINARIAN, "VET", "VETERINARIAN"))
    role_str = "VET" if is_vet else "OWNER"
    is_locked = is_vet

    new_task = CareTask(
        pet_id=pet.id,
        title=payload.title,
        species=pet.species,
        category=payload.category,
        target_metric=payload.target_metric,
        target_value=payload.target_value,
        scheduled_time=payload.scheduled_time,
        scheduled_date=payload.scheduled_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        is_locked=is_locked,
        creator_role=role_str,
        creator_id=current_user.id,
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    return CareTaskResponse(
        id=new_task.id,
        pet_id=new_task.pet_id,
        title=new_task.title,
        species=new_task.species,
        category=new_task.category,
        target_metric=new_task.target_metric,
        target_value=new_task.target_value,
        scheduled_time=new_task.scheduled_time,
        scheduled_date=new_task.scheduled_date,
        is_locked=new_task.is_locked,
        creator_role=new_task.creator_role,
        is_completed=False,
        completed_at=None,
    )


@router.delete("/tasks/{task_id}")
async def delete_care_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CareTask).options(selectinload(CareTask.pet)).where(CareTask.id == task_id)
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="وظیفه مراقبتی یافت نشد")

    # Item 26 Guard: Provider-created locked items cannot be deleted by ordinary user
    if task.is_locked and current_user.role not in (UserRole.VETERINARIAN, UserRole.ADMIN, "VET", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="این مورد مراقبتی توسط دامپزشک تجویز شده و قفل است. امکان حذف آن توسط کاربر عادی وجود ندارد.",
        )

    if task.pet.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, UserRole.VETERINARIAN, "ADMIN", "VET"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    await db.delete(task)
    await db.commit()
    return {"success": True, "message": "وظیفه مراقبتی با موفقیت حذف شد."}


@router.post("/tasks/{task_id}/toggle", response_model=CareTaskResponse)
async def toggle_task_completion(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CareTask).options(selectinload(CareTask.pet)).where(CareTask.id == task_id)
    res = await db.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="وظیفه مراقبتی یافت نشد")
    if task.pet.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, "ADMIN"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    comp_stmt = select(TaskCompletion).where(TaskCompletion.task_id == task_id)
    comp_res = await db.execute(comp_stmt)
    comp = comp_res.scalar_one_or_none()

    if comp:
        await db.delete(comp)
        await db.commit()
        return CareTaskResponse(
            id=task.id,
            pet_id=task.pet_id,
            title=task.title,
            species=task.species,
            category=task.category,
            target_metric=task.target_metric,
            target_value=task.target_value,
            scheduled_time=task.scheduled_time,
            scheduled_date=task.scheduled_date,
            is_locked=task.is_locked,
            creator_role=task.creator_role,
            is_completed=False,
            completed_at=None,
        )
    else:
        now = datetime.now(timezone.utc)
        new_comp = TaskCompletion(
            task_id=task.id,
            completed_at=now,
            achieved_value=task.target_value,
        )
        db.add(new_comp)
        await db.commit()
        return CareTaskResponse(
            id=task.id,
            pet_id=task.pet_id,
            title=task.title,
            species=task.species,
            category=task.category,
            target_metric=task.target_metric,
            target_value=task.target_value,
            scheduled_time=task.scheduled_time,
            scheduled_date=task.scheduled_date,
            is_locked=task.is_locked,
            creator_role=task.creator_role,
            is_completed=True,
            completed_at=now,
        )


@router.get("/summary", response_model=CareSummaryResponse)
async def get_daily_care_summary(
    pet_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pet_stmt = select(Pet).options(selectinload(Pet.care_tasks)).where(Pet.id == pet_id)
    res = await db.execute(pet_stmt)
    pet = res.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="پت مورد نظر یافت نشد")
    if pet.user_id != current_user.id and current_user.role not in (UserRole.ADMIN, "ADMIN"):
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز")

    tasks_stmt = select(CareTask).where(CareTask.pet_id == pet_id)
    tasks_res = await db.execute(tasks_stmt)
    tasks = list(tasks_res.scalars().all())
    total = len(tasks)
    if total == 0:
        return CareSummaryResponse(
            pet_id=pet_id,
            total_tasks=0,
            completed_tasks=0,
            progress_percentage=0,
            walk_target_minutes=0,
            walk_completed_minutes=0,
        )

    task_ids = [t.id for t in tasks]
    comp_stmt = select(TaskCompletion).where(TaskCompletion.task_id.in_(task_ids))
    comp_res = await db.execute(comp_stmt)
    completions = comp_res.scalars().all()
    completed_ids = {c.task_id for c in completions}

    completed_count = len(completed_ids)
    progress_percentage = int((completed_count / total) * 100)

    walk_target = sum(t.target_value or 0 for t in tasks if t.category == TaskCategory.WALK and t.target_metric == "MINUTES")
    walk_completed = sum(t.target_value or 0 for t in tasks if t.category == TaskCategory.WALK and t.target_metric == "MINUTES" and t.id in completed_ids)

    return CareSummaryResponse(
        pet_id=pet_id,
        total_tasks=total,
        completed_tasks=completed_count,
        progress_percentage=progress_percentage,
        walk_target_minutes=walk_target or 40,
        walk_completed_minutes=walk_completed,
    )
