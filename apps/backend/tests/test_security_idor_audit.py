import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession
from src.main import app
from src.core.database import get_db
from src.core.security import create_access_token, _rate_limits
from src.models.user import User, UserRole
from src.models.pet import Pet, PetSpecies
from src.models.order import Order, OrderStatus
from src.models.vet import Clinic, Veterinarian, Appointment, AppointmentStatus
from src.models.boarding import BoardingCenter
from src.models.trainer import Trainer, TrainerSession, TrainerSessionStatus


@pytest.mark.asyncio
async def test_comprehensive_idor_and_security_audit(db_session: AsyncSession):
    # Setup User A (Victim) and User B (Attacker)
    user_a = User(phone_number="09121110001", role=UserRole.PET_PARENT)
    user_b = User(phone_number="09121110002", role=UserRole.PET_PARENT)
    db_session.add_all([user_a, user_b])
    await db_session.flush()

    token_a = create_access_token({"sub": user_a.id, "phone": user_a.phone_number, "role": user_a.role.value})
    token_b = create_access_token({"sub": user_b.id, "phone": user_b.phone_number, "role": user_b.role.value})

    # User A's private pet
    pet_a = Pet(
        user_id=user_a.id,
        name="کوکو",
        species=PetSpecies.CAT,
        breed="بریتیش",
        qr_passport_token="qr-token-coco-audit",
    )
    # User A's private order
    order_a = Order(
        user_id=user_a.id,
        status=OrderStatus.PAYMENT_PENDING,
        total_amount_tomans=500000,
        shipping_address="تهران، پاسداران، خیابان گلستان، پلاک ۵",
    )

    # Clinic & Vet for testing medical records
    clinic = Clinic(
        name="کلینیک تخصصی بونیو",
        slug="bonnivo-audit-clinic",
        district="سعادت‌آباد",
        address="سعادت‌آباد، خیابان سرو",
        phone_number="02122110000",
    )
    db_session.add(clinic)
    await db_session.flush()

    vet = Veterinarian(
        clinic_id=clinic.id,
        full_name="دکتر رامین کیانی",
        medical_license_number="VET-AUDIT-99",
        speciality="داخلی و جراحی",
    )
    db_session.add(vet)
    await db_session.flush()

    # Boarding center
    boarding_center = BoardingCenter(
        name="پانسیون اختصاصی شمال تهران",
        slug="boarding-north-audit",
        city="تهران",
        district="نیاوران",
        address="نیاوران، خیابان باهنر",
        phone_number="02122334455",
        daily_rate_toman=250000,
        capacity=10,
    )
    db_session.add(boarding_center)
    await db_session.flush()

    db_session.add_all([pet_a, order_a])
    await db_session.flush()

    # Trainer and session
    trainer = Trainer(
        user_id=user_a.id,
        full_name="مربی تست",
        speciality="تربیت مقدماتی",
        city="تهران",
    )
    db_session.add(trainer)
    await db_session.flush()

    trainer_session = TrainerSession(
        trainer_id=trainer.id,
        user_id=user_a.id,
        pet_id=pet_a.id,
        session_date="2026-10-15",
        timeslot="10:00 - 11:00",
        fee_toman=350000,
        status=TrainerSessionStatus.CONFIRMED,
    )
    db_session.add(trainer_session)
    await db_session.commit()

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. IDOR on Pet Profile: Attacker (User B) tries to read Victim (User A)'s pet
        res_pet_get = await ac.get(
            f"/api/v1/pets/{pet_a.id}",
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_pet_get.status_code == 403
        assert "Forbidden" in res_pet_get.json()["detail"] or "ownership" in res_pet_get.json()["detail"]

        # 2. IDOR on Pet Update: Attacker tries to modify Victim's pet name
        res_pet_put = await ac.put(
            f"/api/v1/pets/{pet_a.id}",
            json={"name": "نام هک شده"},
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_pet_put.status_code == 403

        # 3. IDOR on Pet Delete: Attacker tries to delete Victim's pet
        res_pet_del = await ac.delete(
            f"/api/v1/pets/{pet_a.id}",
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_pet_del.status_code == 403

        # 4. IDOR on Checkout Payment: Attacker tries to initiate payment for Victim's order
        res_pay = await ac.post(
            "/api/v1/payment/request",
            json={"order_id": order_a.id},
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_pay.status_code == 403
        assert "دسترسی" in res_pay.json()["detail"]

        # 5. IDOR on Medical Records: Attacker tries to view Victim's pet medical records
        res_med_get = await ac.get(
            f"/api/v1/medical-records/pets/{pet_a.id}",
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_med_get.status_code == 403

        # 6. IDOR on Medical Records Create: Attacker tries to create medical record for Victim's pet
        res_med_create = await ac.post(
            "/api/v1/medical-records",
            json={
                "pet_id": pet_a.id,
                "vet_id": vet.id,
                "diagnosis": "تست تشخیصی غیرمجاز",
                "vet_signature_license": "VET-FAKE-001",
            },
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_med_create.status_code == 403

        # 7. IDOR on Boarding: Attacker tries to book boarding stay for Victim's pet
        res_boarding = await ac.post(
            f"/api/v1/boarding/{boarding_center.id}/book",
            json={
                "pet_id": pet_a.id,
                "check_in_date": "2026-10-20",
                "check_out_date": "2026-10-25",
            },
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_boarding.status_code == 403

        # 8. IDOR on Trainer Booking: Attacker tries to book session for Victim's pet
        res_trainer_book = await ac.post(
            f"/api/v1/trainers/{trainer.id}/book",
            json={
                "pet_id": pet_a.id,
                "session_date": "2026-10-18",
                "timeslot": "14:00 - 15:00",
            },
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_trainer_book.status_code == 403

        # 9. IDOR on Trainer Session Completion: Attacker (not assigned trainer/admin) tries to complete
        res_session_comp = await ac.post(
            f"/api/v1/trainers/sessions/{trainer_session.id}/complete",
            json={
                "what_was_taught": "دستور بیا و بنشین",
                "session_notes_owner_safe": "تمرین خوب انجام شد",
            },
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_session_comp.status_code == 403

        # 10. IDOR on Subscriptions: Attacker tries to create subscription for Victim's pet
        res_sub = await ac.post(
            "/api/v1/subscriptions",
            json={
                "pet_id": pet_a.id,
                "product_id": "prod-sample-1",
                "product_title_fa": "غذای خشک گربه",
                "unit_price_toman": 450000,
                "delivery_address": "تهران، اقدسیه، پلاک ۱۰",
            },
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_sub.status_code == 403

        # 11. IDOR on Admin operations: Attacker tries to access admin sellers
        res_admin = await ac.get(
            "/api/v1/admin/sellers/pending",
            headers={"Authorization": f"Bearer {token_b}"},
        )
        assert res_admin.status_code == 403

        # 12. Privacy Leak Guard on QR Passport Public Scan:
        # Zero-auth public access must NOT leak raw phone or home address
        res_qr = await ac.get(f"/api/v1/passport/{pet_a.qr_passport_token}")
        assert res_qr.status_code == 200
        qr_data = res_qr.json()
        assert "masked_owner_phone" in qr_data
        assert qr_data["masked_owner_phone"] == "0912***0001"  # Masked!
        assert "09121110001" not in str(qr_data)
        assert "پاسداران" not in str(qr_data)

        # 13. Security Headers Verification
        res_headers = await ac.get("/api/v1/health")
        assert res_headers.status_code == 200
        assert "content-security-policy" in res_headers.headers
        assert "default-src 'self'" in res_headers.headers["content-security-policy"]
        assert res_headers.headers["x-content-type-options"] == "nosniff"
        assert res_headers.headers["x-frame-options"] == "SAMEORIGIN"

        # 14. Rate Limiting on OTP request (Max 3 requests in 2 minutes)
        test_rate_phone = "09359998877"
        _rate_limits.pop(test_rate_phone, None)  # Ensure clean slate
        # 3 allowed requests
        for _ in range(3):
            r = await ac.post("/api/v1/auth/otp/request", json={"phone_number": test_rate_phone})
            assert r.status_code == 200
        # 4th request must be rejected with 429
        r_exceeded = await ac.post("/api/v1/auth/otp/request", json={"phone_number": test_rate_phone})
        assert r_exceeded.status_code == 429
        assert "Too many OTP requests" in r_exceeded.json()["detail"]

        # 15. Rate Limiting on Admin Login (Max 10 requests from same IP in 2 minutes)
        admin_ip_key = "admin_login:127.0.0.1"
        _rate_limits.pop(admin_ip_key, None)
        _rate_limits.pop("admin_login:unknown", None)
        for _ in range(10):
            await ac.post(
                "/api/v1/admin/auth/login",
                json={"username_or_email": "nonexistent_admin", "password": "wrong_password_123"},
            )
        # 11th request must be rate-limited with 429
        r_admin_rate = await ac.post(
            "/api/v1/admin/auth/login",
            json={"username_or_email": "nonexistent_admin", "password": "wrong_password_123"},
        )
        assert r_admin_rate.status_code == 429
        assert "بیش از حد مجاز" in r_admin_rate.json()["detail"]

    app.dependency_overrides.clear()
