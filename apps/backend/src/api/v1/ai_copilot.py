import asyncio
import json
from typing import Optional, AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from src.core.database import get_db
from src.core.security import get_current_user
from src.models.user import User
from src.models.pet import Pet, PetHealthProfile

router = APIRouter(prefix="/ai-copilot", tags=["Bonyo Care AI Health & Nutrition Copilot"])


class AICopilotChatRequest(BaseModel):
    pet_id: str
    message: str = Field(..., min_length=2, max_length=1000)


def generate_biometric_response(pet: Pet, user_message: str) -> list[str]:
    """
    Constructs contextual, biometric-grounded veterinary/nutrition advice
    tailored to the pet's species, breed, weight, neutered status, and daily food.
    """
    species_fa = "سگ" if str(pet.species).upper() == "DOG" else "گربه"
    neutered_fa = "عقیم‌شده" if pet.is_neutered else "عقیم‌نشده"
    weight_str = f"{pet.weight_kg:.1f} کیلوگرم" if pet.weight_kg else "نامشخص"
    daily_grams = None
    if getattr(pet, "health_profile", None) and pet.health_profile.daily_food_grams:
        daily_grams = pet.health_profile.daily_food_grams
    elif pet.weight_kg:
        daily_grams = pet.weight_kg * 15.0
    daily_food_str = f"{daily_grams:.0f} گرم در روز" if daily_grams else "۱۰۰ گرم در روز"

    msg_lower = user_message.lower()

    if any(w in msg_lower for w in ["غذا", "کالری", "تغذیه", "وزن", "چاقی", "لاغری"]):
        return [
            f"سلام! من دستیار هوشمند سلامت بونیو هستم. 🐾\n\n",
            f"با بررسی پرونده بیومتریک **{pet.name}** ({species_fa}، نژاد {pet.breed}، وزن {weight_str}، وضعیت {neutered_fa}):\n\n",
            f"• **میزان مصرف مجاز کالری:** بر پایه وزن بیومتریک {weight_str}، مصرف استاندارد غذای خشک حدود {daily_food_str} در دو وعده توصیه می‌شود.\n",
            "• **پروتئین و چربی:** با توجه به فیزیک بدنی این نژاد، ترجیحاً از فرمولاسیون‌های غنی از اسیدهای چرب امگا ۳ و ۶ برای درخشش پوشش و سلامت مفاصل استفاده فرمایید.\n",
            "• **تشویقی‌ها:** حداکثر ۱۰ درصد از کل کالری دریافتی روزانه باید از تشویقی‌ها تأمین شود.\n\n",
            "⚠️ *یادآوری ایمنی:* در صورت مشاهده هرگونه تغییر ناگهانی در اشتها، مشورت با دامپزشک کلینیک همکار بونیو ضروری است.",
        ]
    elif any(w in msg_lower for w in ["واکسن", "بیماری", "انگل", "علائم", "تب", "استفراغ", "اسهال"]):
        return [
            f"سلام! وضعیت اضطراری یا سلامتی **{pet.name}** مورد پایش قرار گرفت. 🩺\n\n",
            f"• با توجه به گونه ({species_fa}) و پرونده سلامت فعلی، واکسیناسیون‌های دوره‌ای (هاری و چندگانه) و ضدانگل باید هر ۳ تا ۱۲ ماه تمدید شوند.\n",
            "• **علائم نیازمند اقدام فوری:** بی‌حالی شدید، استفراغ مکرر بیش از ۲ بار در ۲۴ ساعت، یا تغییر در تنفس.\n",
            "• **توصیه تخصصی:** پیشنهاد می‌کنم فوراً از بخش [نوبت‌دهی کلینیک‌ها](/vets) برای ویزیت حضوری یا تماس با کلینیک‌های ۲۴ ساعته اقدام کنید.\n\n",
            "⚠️ *سلب مسئولیت پزشکی:* توصیه‌های هوش مصنوعی جایگزین معاینه و تشخیص مستقیم دامپزشک متخصص نیست.",
        ]
    elif any(w in msg_lower for w in ["آرایش", "شستشو", "پوست", "مو", "ریزش"]):
        return [
            f"سلام! در خصوص بهداشت و مراقبت از پوشش مویی **{pet.name}** ({pet.breed}): 🛁\n\n",
            "• شست‌وشو با شامپوی مخصوص و با PH تنظیم‌شده برای حیوانات خانگی هر ۳ الی ۴ هفته یک‌بار کافی است تا لایه چربی محافظ پوست آسیب نبیند.\n",
            "• برس‌کشی روزانه برای نژادهای با تراکم موی بالا از تشکیل گره و نمدی شدن مو جلوگیری می‌کند.\n",
            "• شما می‌توانید از بخش [خدمات آرایش و گرومینگ](/dashboard/care) نوبت با اعزام در محل یا کلینیک رزرو فرمایید.",
        ]
    else:
        return [
            f"درود! من دستیار هوشمند اختصاصی بونیو برای مراقبت از **{pet.name}** هستم. 🐾\n\n",
            f"اطلاعات بیومتریک پت شما:\n",
            f"• گونه و نژاد: {species_fa} {pet.breed}\n",
            f"• وزن فعلی: {weight_str}\n",
            f"• جیره غذایی استاندارد: {daily_food_str}\n\n",
            f"در پاسخ به پرسش شما («{user_message}»):\n",
            "سیستم پایش بونیو توصیه می‌کند برنامه‌های روتین بهداشتی، بازی‌های ذهنی روزانه (حداقل ۳۰ دقیقه) و حفظ ثبات در محیط زندگی پت رعایت شود.\n",
            "آیا مایلید وضعیت واکسن‌ها، پرونده‌های پزشکی اخیر، یا برنامه شارژ خودکار غذای {pet.name} را بررسی کنم؟",
        ]


@router.post("/chat")
async def chat_with_copilot(
    payload: AICopilotChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Fetch pet and verify ownership
    stmt = (
        select(Pet)
        .options(selectinload(Pet.health_profile))
        .where(Pet.id == payload.pet_id)
    )
    res = await db.execute(stmt)
    pet = res.scalar_one_or_none()
    if not pet or pet.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="دسترسی به اطلاعات این پت مجاز نیست.",
        )

    # 2. Generate chunks
    chunks = generate_biometric_response(pet, payload.message)

    async def sse_event_stream() -> AsyncGenerator[str, None]:
        for chunk in chunks:
            data = json.dumps({"text": chunk, "pet_name": pet.name}, ensure_ascii=False)
            yield f"data: {data}\n\n"
            await asyncio.sleep(0.04)
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        sse_event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
