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
async def test_shared_medical_records_and_idor_protection(client: AsyncClient, db_session: AsyncSession):
    # 1. Seed Clinic and Vet (idempotent)
    from sqlalchemy import select
    c_stmt = select(Clinic).where(Clinic.slug == "mehregan-vet")
    clinic = (await db_session.execute(c_stmt)).scalar_one_or_none()
    if not clinic:
        clinic = Clinic(
            name="کلینیک تخصصی مهرگان",
            slug="mehregan-vet",
            district="منطقه ۲ - سعادت‌آباد",
            address="تهران، سعادت‌آباد، میدان سرو",
            phone_number="02122091100",
            services=["داخلی", "واکسیناسیون"],
            image_url="/icons/health.svg",
        )
        db_session.add(clinic)
        await db_session.flush()

    v_stmt = select(Veterinarian).where(Veterinarian.medical_license_number == "VET-99412")
    vet = (await db_session.execute(v_stmt)).scalar_one_or_none()
    if not vet:
        vet = Veterinarian(
            clinic_id=clinic.id,
            full_name="دکتر سارا کیانی",
            medical_license_number="VET-99412",
            speciality="طب داخلی و پیشگیری",
            avatar_url="/icons/health.svg",
            bio="متخصص بهداشت و واکسیناسیون حیوانات خانگی",
            consultation_fee_toman=400000,
            is_active=True,
        )
        db_session.add(vet)
        await db_session.commit()


    # 2. Setup User A (owner) and User B (attacker)
    token_a = await get_user_token(client, "09121110011")
    token_b = await get_user_token(client, "09129990099")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Create Pet for User A
    pet_res = await client.post(
        "/api/v1/pets",
        json={
            "name": "لونا",
            "species": "CAT",
            "breed": "بریتیش شورت‌هیر",
            "sex": "FEMALE",
            "weight_kg": 3.5,
            "is_neutered": True,
            "daily_food_grams": 55.0,
        },
        headers=headers_a,
    )
    assert pet_res.status_code == 201
    pet_id = pet_res.json()["id"]

    # 3. Create Medical Record by authorized owner / vet context
    rec_payload = {
        "pet_id": pet_id,
        "vet_id": vet.id,
        "diagnosis": "سلامت عمومی کامل، تجویز واکسیناسیون یادآور سالانه",
        "prescriptions": [
            {
                "drug_name": "قطره مولتی ویتامین پت",
                "dosage": "۵ قطره در روز",
                "instructions": "همراه با وعده صبحگاهی",
                "duration_days": 30,
            }
        ],
        "vaccine_administered": "Rabies + DHPP (هاری و چندگانه)",
        "vaccine_next_due_date": "2027-10-01",
        "allergies_noted": "فاقد آلرژی دارویی",
        "weight_kg": 3.8,  # Pet gained weight
        "vet_signature_license": "VET-99412",
    }
    rec_res = await client.post("/api/v1/medical-records", json=rec_payload, headers=headers_a)
    assert rec_res.status_code == 201
    rec_data = rec_res.json()
    assert rec_data["pet_name"] == "لونا"
    assert rec_data["vet_name"] == "دکتر سارا کیانی"
    assert rec_data["vaccine_administered"] == "Rabies + DHPP (هاری و چندگانه)"
    assert len(rec_data["prescriptions"]) == 1

    # 4. Verify pet's weight was updated to 3.8kg
    get_pet_res = await client.get(f"/api/v1/pets/{pet_id}", headers=headers_a)
    assert get_pet_res.status_code == 200
    assert get_pet_res.json()["weight_kg"] == 3.8

    # 5. User A retrieves medical records
    list_rec_a = await client.get(f"/api/v1/medical-records/pets/{pet_id}", headers=headers_a)
    assert list_rec_a.status_code == 200
    records_a = list_rec_a.json()
    assert len(records_a) == 1
    assert records_a[0]["diagnosis"] == "سلامت عمومی کامل، تجویز واکسیناسیون یادآور سالانه"

    # 6. IDOR TEST: User B attempts to access Pet A's medical records
    list_rec_b = await client.get(f"/api/v1/medical-records/pets/{pet_id}", headers=headers_b)
    assert list_rec_b.status_code == 403
    assert "غیرمجاز" in list_rec_b.json()["detail"]
