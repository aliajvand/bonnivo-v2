import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.vet import Clinic, Veterinarian


async def get_user_token(client: AsyncClient, phone: str) -> str:
    await client.post("/api/v1/auth/otp/request", json={"phone_number": phone})
    from src.services.sms import default_sms_provider, StubSmsAdapter
    assert isinstance(default_sms_provider, StubSmsAdapter)
    code = default_sms_provider.sent_otps[phone]
    res = await client.post("/api/v1/auth/otp/verify", json={"phone_number": phone, "code": code})
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.mark.asyncio
async def test_grooming_boarding_vaccine_guard(client: AsyncClient, db_session: AsyncSession):
    # 1. Setup User and Unvaccinated Pet
    token = await get_user_token(client, "09124445566")
    headers = {"Authorization": f"Bearer {token}"}

    pet_res = await client.post(
        "/api/v1/pets",
        json={
            "name": "فندق",
            "species": "DOG",
            "breed": "پامرانین",
            "sex": "MALE",
            "weight_kg": 4.1,
            "is_neutered": False,
            "daily_food_grams": 75.0,
        },
        headers=headers,
    )
    assert pet_res.status_code == 201
    pet_id = pet_res.json()["id"]

    # 2. Attempt to book Boarding WITHOUT vaccine record -> Must be rejected with 400
    booking_req = {
        "pet_id": pet_id,
        "service_type": "BOARDING",
        "booking_date": "2026-10-20",
        "preferred_time": "11:00 - 13:00",
        "duration_days": 3,
        "pickup_required": True,
    }
    rejected_res = await client.post("/api/v1/services/booking", json=booking_req, headers=headers)
    assert rejected_res.status_code == 400
    assert "واکسیناسیون معتبر" in rejected_res.json()["detail"]

    # 3. Add Vet & Clinic, then record vaccination
    clinic = Clinic(
        name="مرکز خدمات تخصصی حیوانات البرز",
        slug="alborz-pet-clinic",
        district="منطقه ۳ - ظفر",
        address="تهران، دستگردی، پلاک ۹۰",
        phone_number="02122223333",
        services=["گرومینگ", "پانسیون", "واکسیناسیون"],
        image_url="/icons/health.svg",
    )
    db_session.add(clinic)
    await db_session.flush()

    vet = Veterinarian(
        clinic_id=clinic.id,
        full_name="دکتر کامران شمس",
        medical_license_number="VET-77112",
        speciality="بهداشت و واکسیناسیون",
        consultation_fee_toman=350000,
        is_active=True,
    )
    db_session.add(vet)
    await db_session.commit()

    # Admin/authorized vaccination record
    vaccine_payload = {
        "pet_id": pet_id,
        "vet_id": vet.id,
        "diagnosis": "تزریق واکسن هاری و هپاتیت دوره‌ای",
        "prescriptions": [],
        "vaccine_administered": "Rabies + Nobivac",
        "vaccine_next_due_date": "2027-10-20",
        "weight_kg": 4.1,
        "vet_signature_license": "VET-77112",
    }
    vac_res = await client.post("/api/v1/medical-records", json=vaccine_payload, headers=headers)
    assert vac_res.status_code == 201

    # 4. Attempt booking again -> Must succeed with verified vaccine status
    approved_res = await client.post("/api/v1/services/booking", json=booking_req, headers=headers)
    assert approved_res.status_code == 201
    booking_data = approved_res.json()
    assert booking_data["status"] == "CONFIRMED"
    assert booking_data["vaccine_verified"] is True
    # Fee check: 3 days * 650,000 + 120,000 pickup = 2,070,000
    assert booking_data["total_fee_toman"] == (3 * 650000) + 120000
