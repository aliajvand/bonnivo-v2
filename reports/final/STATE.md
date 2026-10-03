# Bonnivo Production Readiness - Execution State Tracker

**آخرین به‌روزرسانی:** 2026-10-04 (ادامه پس از قطعی موقت ارتباط)
**شاخه فعال گیت:** `production-readiness`
**محیط اجرا:** Windows PowerShell | Next.js 15 App Router | FastAPI Python 3.14 (uv) | SQLite / PostgreSQL

---

## ۱. وضعیت گیت‌ها (Gate Progress Matrix)

| گیت | عنوان | وضعیت | کامیت / سند مرجع | توضیحات کلیدی |
|---|---|---|---|---|
| **G1** | ممیزی صادقانه ۳۵ صفحه | **PASSED** | Commit `00a1990`<br>`reports/final/a1-audit.md` | ابطال ممیزی خوش‌بینانه، شناسایی دقیق شکاف‌های localStorage و mock در پرداخت و احراز هویت. |
| **G2** | مهارت‌ها، ورک‌فلوها و کنترل اسرار | **PASSED** | Commit `29e1137`<br>`reports/final/g2-skills-and-guardrails.md` | ایجاد ۴ مهارت در `.agent/skills/`، دو ورک‌فلو، ایمن‌سازی `.env.example`، اسکریپت `pnpm secret-scan` (صفر نشت). |
| **G3** | دیتابیس واقعی، کاتالوگ و کیف پول | **PASSED** | Commit `0b25881`<br>`reports/final/g3-database-and-backend.md` | اجرای `production_seed.py` با ۴۵ جدول، اتصال کاتالوگ و کیف پول، ۴۹ از ۴۹ آزمون سبز. |
| **G4** | یکپارچه‌سازی‌ها (SMS, Groq, Payment) | **PASSED** | Commit `1842aa7`<br>`reports/final/g4-integrations-report.md` | اتصال sms.ir v1 Verify، راه‌اندازی مدل زنده Groq (`openai/gpt-oss-20b`)، درگاه با Idempotency. |
| **G5** | ورود و پنل ادمین به سبک وردپرس | **PASSED** | Commit در مرحله ثبت<br>`reports/final/g5-admin-panel.md` | ایجاد مدل‌های `admin_users`، هش `argon2id`، کوکی `httpOnly`، قفل حساب، ساخت از طریق CLI، صفحه `/admin/login` مستقل و پوسته مدیریت وردپرسی با سایدبار تیره و نوار بالا. |
| **G6** | بررسی صفحات هسته با روبیریک A6 | **IN PROGRESS** | در دست پیاده‌سازی و ارزیابی | نمره‌دهی صفحات هسته (`/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/dashboard/*`) بر اساس مهارت‌های ecommerce-ux, persian-rtl, production-hardening و خاموش کردن مسیرهای دمو پشت فیچرفلگ. |
| **G7** | امنیت (A7)، تست E2E، تایپ‌چک و بیلد | **PENDING** | - | ممیزی IDOR، هدرهای امنیتی، تست مسیر طلایی Playwright E2E، بیلد پروداکشن وب و سرور. |
| **G8** | بازبینی تخریبگرانه A6 و تحویل نهایی | **PENDING** | - | تست‌های مرزی (اینترنت قطع، کلیک سریع، ۳۲۰px، رفرش فرم)، تدوین `reports/final/readiness-final.md`. |

---

## ۲. گاردریل‌ها و منابع امنیتی مصرف‌شده
- **سهمیه پیامک واقعی (SMS_TEST_MAX_SENDS):** ۰ از ۵ ارسال (حفظ کامل سهمیه؛ تست‌های قبلی موک بودند به دلیل خالی بودن شناسه قالب).
- **اسکن نشت اسرار (`pnpm secret-scan`):** وضعیت PASS (هیچ رمزی نشت نکرده است).
- **سلامت تست‌های بک‌اند:** ۴۹ از ۴۹ آزمون پاس (`uv run pytest` -> PASS).
- **سلامت تایپ‌چک فرانت‌اند:** تایید کامل (`pnpm --filter web typecheck` -> PASS).
- **وضعیت سرورهای توسعه:** پورت‌های ۳۰۰۰ و ۸۰۰۰ بسته و پاک‌سازی شدند.

---

## ۳. وظایف فوری گیت ۵ (Gate 5 In-Flight Tasks)
1. ساخت جداول جدید `admin_users`، `admin_sessions`، `admin_password_resets` و `admin_audit_logs` در دیتابیس با اسکریپت همگام‌ساز.
2. پیاده‌سازی کامل اندپوینت‌های احراز هویت ادمین در `apps/backend/src/api/v1/admin_auth.py` (`login`, `logout`, `me`, `forgot-password`, `reset-password`, `audit-logs`).
3. اضافه کردن دستور CLI برای ساخت ادمین در `apps/backend/src/cli.py` (`create-admin`).
4. اضافه کردن روت‌های احراز هویت ادمین به `apps/backend/src/main.py`.
5. طراحی و ساخت صفحه ورود مستقل `/admin/login` به سبک وردپرس در فرانت‌اند.
6. پیاده‌سازی پوسته مدیریت سبک وردپرس در `/admin` شامل سایدبار راست تیره و تاشو، نوار بالا و تب‌های مدیریت کاتالوگ، فروشندگان، مرجوعی‌ها، نقدها، لاگ‌های ممیزی و فیچرفلگ‌ها.
7. افزودن ریدایرکت از `/dashboard/admin` به `/admin`.
8. اجرای آزمون‌های بک‌اند برای ادمین و تایپ‌چک وب، ثبت گزارش و کامیت گیت ۵.
