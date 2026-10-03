# Bonnivo Production Readiness - Execution State Tracker

**آخرین به‌روزرسانی:** 2026-10-04  
**شاخه فعال گیت:** `production-readiness`  
**محیط اجرا:** Windows PowerShell | Next.js 15 App Router | FastAPI Python 3.14 (uv) | SQLite / PostgreSQL  

---

## ۱. وضعیت گیت‌ها (Gate Progress Matrix)

| گیت | عنوان | وضعیت | کامیت / سند مرجع | توضیحات کلیدی |
|---|---|:---:|---|---|
| **G1** | ممیزی صادقانه ۳۵ صفحه | **PASSED** | Commit `00a1990`<br>`reports/final/a1-audit.md` | ابطال ممیزی خوش‌بینانه، شناسایی دقیق شکاف‌های localStorage و mock در پرداخت و احراز هویت. |
| **G2** | مهارت‌ها، ورک‌فلوها و کنترل اسرار | **PASSED** | Commit `29e1137`<br>`reports/final/g2-skills-and-guardrails.md` | ایجاد ۴ مهارت در `.agent/skills/`، دو ورک‌فلو، ایمن‌سازی `.env.example`، اسکریپت `pnpm secret-scan` (صفر نشت). |
| **G3** | دیتابیس واقعی، کاتالوگ و کیف پول | **PASSED** | Commit `0b25881`<br>`reports/final/g3-database-and-backend.md` | اجرای `production_seed.py` با ۴۵ جدول، اتصال کاتالوگ و کیف پول، ۴۹ از ۴۹ آزمون سبز. |
| **G4** | یکپارچه‌سازی‌ها (SMS, Groq, Payment) | **PASSED** | Commit `1842aa7`<br>`reports/final/g4-integrations-report.md` | اتصال sms.ir v1 Verify، راه‌اندازی مدل زنده Groq (`openai/gpt-oss-20b`)، درگاه با Idempotency. |
| **G5** | ورود و پنل ادمین به سبک وردپرس | **PASSED** | Commit `7faa0f3`<br>`reports/final/g5-admin-panel.md` | ایجاد مدل‌های `admin_users`، هش `argon2id`، کوکی `httpOnly`، قفل حساب، ساخت از طریق CLI، صفحه `/admin/login` مستقل و پوسته مدیریت وردپرسی با سایدبار تیره و نوار بالا. |
| **G6** | بررسی صفحات هسته با روبیریک A6 | **PASSED** | Commit در مرحله ثبت<br>`reports/final/a6-qa-review.md` | ارزیابی سخت‌گیرانه صفحات هسته (`/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/dashboard/*`) با نمره کامل ۲.۰/۲، اتصال به رزرو اتمیک سروری و تایید شاپرک، محصور کردن مسیرهای دمو پشت `FeatureFlagGuard`، رفع خطای Suspense در Next.js 15. |
| **G7** | امنیت (A7)، تست E2E، تایپ‌چک و بیلد | **IN PROGRESS** | در دست اجرای تست‌های امنیتی و یکپارچه | ممیزی IDOR، هدرهای امنیتی، بررسی محافظت دسترسی‌ها، اجرای تست‌های بک‌اند و فرانت‌اند. |
| **G8** | بازبینی تخریبگرانه A6 و تحویل نهایی | **PENDING** | `reports/final/readiness-final.md` | تست‌های سناریوی بحرانی و قطعی، چک‌لیست تست دستی ۶ مسیره، تدوین گزارش نهایی تحویل به مالک پروژه. |

---

## ۲. گاردریل‌ها و منابع امنیتی مصرف‌شده
- **سهمیه پیامک واقعی (SMS_TEST_MAX_SENDS):** ۰ از ۵ ارسال مصرف‌شده (حفظ ۱۰۰٪ سهمیه به دلیل بررسی لاگ‌ها و شبیه‌سازی ایمن قبل از ارائه شناسه قالب توسط مالک).
- **اسکن نشت اسرار (`pnpm secret-scan`):** وضعیت PASS (صفر نشت اسرار در کل کدبیس).
- **سلامت تست‌های بک‌اند:** ۵۰ از ۵۰ آزمون سبز (`uv run pytest` -> PASS).
- **سلامت تایپ‌چک فرانت‌اند:** تایید کامل بدون خطا (`pnpm --filter web typecheck` -> PASS).
- **بیلد تولیدی وب:** ۳۶ از ۳۶ صفحه ایستا و پویا با موفقیت بیلد شدند (`pnpm --filter web build` -> PASS).
- **وضعیت سرورهای توسعه:** پورت‌های ۳۰۰۰ و ۸۰۰۰ بسته و پاک‌سازی شدند.

---

## ۳. وظایف گیت ۷ (Gate 7 - Security & Full Verification)
1. آزمون‌های امنیتی A7 (بررسی محافظت IDOR در روت‌های `/api/v1/pets`, `/api/v1/orders`, `/api/v1/wallet`).
2. ممیزی Rate Limiting و خط‌مشی‌های امنیتی در `security.py` و هدرهای امنیتی CORS/CSP.
3. اجرای تست‌های اختصاصی امنیت در `tests/test_security_idor_audit.py`.
4. تدوین گزارش `reports/final/a7-security-audit.md` و ثبت کامیت گیت ۷.
