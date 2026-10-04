import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.vet import Clinic, Veterinarian, AppointmentStatus


async def get_user_token(client: AsyncClient, phone: str) -> str:
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    from src.services.sms import default_sms_provider, StubSmsAdapter
    assert isinstance(default_sms_provider, StubSmsAdapter)
    code = default_sms_provider.sent_otps[phone]
    res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_vet_clinic_listing_and_booking_flow(client: AsyncClient, db_session: AsyncSession):
    # 1. Seed Clinic and Veterinarian (idempotent)
    from sqlalchemy import select
    c_stmt = select(Clinic).where(Clinic.slug == "paytakht-vet-hospital")
    clinic = (await db_session.execute(c_stmt)).scalar_one_or_none()
    if not clinic:
        clinic = Clinic(
            name="بیمارستان دامپزشکی پایتخت",
            slug="paytakht-vet-hospital",
            district="منطقه ۱ - ولنجک",
            address="تهران، ولنجک، خیابان چهاردهم، پلاک ۱۲",
            phone_number="02122401122",
            rating=4.9,
            reviews_count=48,
            is_emergency_24h=True,
            services=["داخلی", "جراحی", "سونوگرافی", "دندانپزشکی", "بخش اورژانس ۲۴ ساعته"],
            image_url="/icons/health.svg",
        )
        db_session.add(clinic)
        await db_session.flush()

    v_stmt = select(Veterinarian).where(Veterinarian.clinic_id == clinic.id)
    vet = (await db_session.execute(v_stmt)).scalars().first()
    if not vet:
        vet = Veterinarian(
            clinic_id=clinic.id,
            full_name="دکتر آرین پارسا",
            medical_license_number="VET-88391",
            speciality="جراحی تخصصی و ارتوپدی حیوانات کوچک",
            avatar_url="/icons/health.svg",
            bio="متخصص جراحی با بیش از ۱۰ سال سابقه در مراکز مرجع تهران",
            consultation_fee_toman=500000,
            is_active=True,
        )
        db_session.add(vet)
        await db_session.commit()


    # 2. Query clinics via API
    res = await client.get("/api/v1/vets/clinics")
    assert res.status_code == 200
    clinics = res.json()
    assert len(clinics) >= 1
    found_clinic = next(c for c in clinics if c["id"] == clinic.id)
    assert found_clinic["is_emergency_24h"] is True
    assert found_clinic["district"] == "منطقه ۱ - ولنجک"

    # Query with emergency filter
    res_emerg = await client.get("/api/v1/vets/clinics?emergency_only=true")
    assert res_emerg.status_code == 200
    assert any(c["id"] == clinic.id for c in res_emerg.json())

    # 3. Query clinic detail
    res_detail = await client.get(f"/api/v1/vets/clinics/{clinic.id}")
    assert res_detail.status_code == 200
    detail_data = res_detail.json()
    assert len(detail_data["veterinarians"]) >= 1
    assert any(v["full_name"] == "دکتر آرین پارسا" for v in detail_data["veterinarians"])

    # 4. Check timeslots
    res_slots = await client.get(f"/api/v1/vets/vets/{vet.id}/timeslots?date=2026-10-15")
    assert res_slots.status_code == 200
    slots = res_slots.json()
    assert len(slots) > 0
    assert all(s["is_available"] is True for s in slots)

    # 5. User setup and Pet creation
    token_user = await get_user_token(client, "09351112233")
    headers_user = {"Authorization": f"Bearer {token_user}"}

    pet_res = await client.post(
        "/api/v1/pets",
        json={
            "name": "تدی",
            "species": "DOG",
            "breed": "شیتزو",
            "sex": "MALE",
            "weight_kg": 6.2,
            "is_neutered": True,
            "daily_food_grams": 90.0,
        },
        headers=headers_user,
    )
    assert pet_res.status_code == 201
    pet_id = pet_res.json()["id"]

    # 6. Book appointment
    booking_payload = {
        "pet_id": pet_id,
        "clinic_id": clinic.id,
        "vet_id": vet.id,
        "appointment_date": "2026-10-15",
        "timeslot": "16:00 - 16:30",
        "reason_for_visit": "ویزیت دوره‌ای و چکاپ مفاصل",
        "notes": "کمی در پای راست لنگش دارد",
    }
    book_res = await client.post("/api/v1/vets/appointments", json=booking_payload, headers=headers_user)
    assert book_res.status_code == 201
    appt = book_res.json()
    assert appt["pet_name"] == "تدی"
    assert appt["vet_name"] == "دکتر آرین پارسا"
    assert appt["status"] == "CONFIRMED"
    appt_id = appt["id"]

    # 7. Check timeslots again: "16:00 - 16:30" should now be unavailable
    res_slots_after = await client.get(f"/api/v1/vets/vets/{vet.id}/timeslots?date=2026-10-15")
    assert res_slots_after.status_code == 200
    booked_slot_obj = next(s for s in res_slots_after.json() if s["time"] == "16:00 - 16:30")
    assert booked_slot_obj["is_available"] is False

    # 8. Slot conflict check: Trying to book same slot again should fail with 400
    conflict_res = await client.post("/api/v1/vets/appointments", json=booking_payload, headers=headers_user)
    assert conflict_res.status_code == 400
    assert "قبلاً" in conflict_res.json()["detail"]

    # 9. Get my appointments
    my_appts_res = await client.get("/api/v1/vets/appointments/my", headers=headers_user)
    assert my_appts_res.status_code == 200
    my_appts = my_appts_res.json()
    assert any(a["id"] == appt_id for a in my_appts)

    # 10. Cancel appointment
    cancel_res = await client.put(f"/api/v1/vets/appointments/{appt_id}/cancel", headers=headers_user)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["success"] is True

    # Slot should be available again after cancellation
    res_slots_canceled = await client.get(f"/api/v1/vets/vets/{vet.id}/timeslots?date=2026-10-15")
    assert res_slots_canceled.status_code == 200
    freed_slot = next(s for s in res_slots_canceled.json() if s["time"] == "16:00 - 16:30")
    assert freed_slot["is_available"] is True
