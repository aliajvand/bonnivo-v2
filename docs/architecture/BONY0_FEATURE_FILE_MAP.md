# BONY0_FEATURE_FILE_MAP.md
**محصول:** بونیو (Bonyo) · **ورودی تحلیل:** `folder-structure.txt` (خروجی `tree /F` ویندوز، ۱۰۱٬۳۹۳ خط) · **تاریخ تحلیل:** ۱۴۰۵/۰۷/۰۹ (2026-10-01)

> **روش:** از ~۹۳٬۸۰۰ مسیر، پس از حذف `node_modules`، `apps/backend/.venv`، `__pycache__`، `.pytest_cache` و کش‌ها، **۳۶۹ مسیر معنادار** باقی ماند. این سند فقط بر اساس **نام و جایگاه فایل‌ها** است؛ محتوای هیچ فایلی خوانده نشده. هر جا «Implemented» آمده یعنی «شواهد ساختاری قوی»، نه «کار می‌کند». وابستگی‌ها از روی پوشه‌های نصب‌شده در `node_modules/.pnpm` و `apps/backend/.venv/Lib/site-packages` استخراج شده‌اند.

---

## 1. Executive Inventory Summary

| حوزه | وضعیت | شواهد (مسیر دقیق) | توضیح |
|---|---|---|---|
| Monorepo | EXISTS | `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` | pnpm workspace؛ اعضای workspace از روی ساختار: `apps/web`, `packages/api-client` (عضویت `apps/backend` و `apps/mobile` → NEEDS_CODE_REVIEW) |
| Web frontend | PARTIAL | `apps/web/src/app/**` (۱۸ صفحه)، `apps/web/next.config.ts` | Next.js 15.2.1 + React 19.3 + TypeScript 5.9 + Tailwind 3.4.19 (App Router) |
| Backend | PARTIAL | `apps/backend/src/api/v1/*.py` (۲۴ router)، `apps/backend/src/models/*.py` (۱۲ مدل) | FastAPI 0.142، SQLAlchemy 2.1 async، asyncpg + aiosqlite، python-jose (JWT)، passlib/bcrypt، httpx، opentelemetry-api |
| Mobile | MISSING | `apps/mobile/` (پوشهٔ **کاملاً خالی**) | فقط skill `/.agents/skills/4-nativewind-mobile/SKILL.md` نیت React Native + NativeWind را نشان می‌دهد |
| Shared packages | PARTIAL | `packages/api-client/src/{client.ts,index.ts,types.ts}` | تنها پکیج مشترک؛ `packages/ui`، `packages/config`، `packages/tokens` → MISSING |
| Database / migrations | PARTIAL | `apps/backend/alembic.ini`, `apps/backend/migrations/versions/9fed3f4f72ba_create_initial_schema.py`, `apps/backend/migrations/versions/2a5b5c0fa7d7_create_catalog_and_orders.py` | فقط **۲ migration** در برابر **۱۲ فایل مدل** → احتمال قوی schema drift |
| Local DB artifact | EXISTS (ریسک) | `apps/backend/bonnivo.db` | فایل SQLite داخل ریپو؛ ادعای PostgreSQL را تضعیف می‌کند و ممکن است دادهٔ آزمایشی/شخصی داشته باشد |
| UI / design system | PARTIAL | `apps/web/tailwind.config.ts`, `apps/web/src/app/globals.css`, `apps/web/src/lib/utils.ts`, `docs/10-design-system.md` | `clsx` + `tailwind-merge` + `class-variance-authority` + `lucide-react` نصب‌اند، اما پوشهٔ `components/ui` (primitives به سبک shadcn) **وجود ندارد**؛ Radix نصب نیست |
| 3D | PARTIAL | `apps/web/src/components/home/three-island-canvas.tsx`, `island-progressive-container.tsx`, `hero-island-banner.tsx`, `three@0.186.1` | خود `three` نصب است؛ `@react-three/fiber` و `@react-three/drei` **نصب نیستند**. هیچ مدل `.glb/.gltf` وجود ندارد |
| Backend tests | EXISTS | `apps/backend/tests/` (۲۹ فایل تست + `conftest.py`) | پوشش اسمی گسترده؛ کیفیت → NEEDS_CODE_REVIEW |
| Web tests | PLACEHOLDER | `apps/web/e2e/core-flows.spec.ts`, `apps/web/e2e/playwright.d.ts`, `apps/web/playwright.config.ts` | فقط یک spec؛ وجود `playwright.d.ts` دست‌ساز نشان می‌دهد `@playwright/test` در `apps/web/node_modules` نصب نیست (فقط `playwright-core@1.63.0` در root). Unit test وب → MISSING |
| Deployment | PARTIAL | `docker-compose.yml`, `apps/backend/Dockerfile`, `apps/web/Dockerfile`, `nginx/nginx.conf`, `.dockerignore` | محیط staging/prod، IaC، secrets management → MISSING |
| CI/CD | MISSING | — | هیچ `.github/workflows`، `.gitlab-ci.yml` یا مشابه آن نیست |
| Env config | MISSING | — | `.env.example` وجود ندارد؛ `apps/backend/src/core/config.py` از `pydantic-settings` + `python-dotenv` استفاده می‌کند (از روی وابستگی‌ها) |
| Documentation | EXISTS | `docs/01-product-brief.md` … `docs/13-3d-island-asset-map.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/roadmap/*.md` | ساختار مستندات خوب است؛ `docs/plans/` خالی است. هم‌راستایی محتوا با ۴ فاز جدید → NEEDS_CODE_REVIEW |
| Agent / skills | EXISTS | `AGENTS.md`, `.agentignore`, `.agents/agents/{orchestrator,builder,auditor}.md`, `.agents/rules/{architecture,frontend,security}.md`, `.agents/skills/*/SKILL.md`, `.bonyo/**` | توسعهٔ عامل‌محور (agent-driven) با state، checkpoint، audit و گزارش |
| Agent self-reports | EXISTS (ریسک) | `.bonyo/reports/phase-1-completion-report.md`, `.bonyo/reports/phase-2-3-4-completion-report.md` | **ادعای تکمیل هر ۴ فاز** توسط عامل؛ با ساختار (نبود صفحهٔ جزئیات محصول، mobile خالی، ۲ migration) سازگار نیست → NEEDS_CODE_REVIEW |

### ابهام‌های فنی اصلی
1. **تعریف فازها در ریپو با تعریف جدید محصول فرق دارد.** نام audit ها: `.bonyo/audits/phase-2-health-network.md`، `phase-3-logistics-marketplace.md`، `phase-4-hardware-social.md`. یعنی فاز ۲ ریپو «شبکهٔ سلامت»، فاز ۳ «لجستیک/مارکت‌پلیس» و فاز ۴ «سخت‌افزار/اجتماعی» است؛ اما در نقشهٔ جدید فاز ۲ = خدمات محلی، فاز ۳ = پانسیون/رویداد/وفاداری، فاز ۴ = اکوسیستم B2B. **همهٔ تصمیم‌ها و گزارش‌های `.bonyo/` باید بازنگاشت شوند.**
2. **دوگانگی نام برند:** `bonnivo.db`, `bonnivo-logo-*.svg`, `bonnivo-floating-island.svg` در برابر `bonyo-sprint`, `bonyo-copilot-drawer.tsx`, `.bonyo/` → NEEDS_FOUNDER_DECISION.
3. **دو entrypoint بک‌اند:** `apps/backend/main.py` و `apps/backend/src/main.py` → کدام اصلی است؟ NEEDS_CODE_REVIEW.
4. **مدل‌های بدون migration:** `adoption.py`, `amber_alert.py`, `logistics.py`, `loyalty.py`, `nfc.py`, `settlement.py`, `subscription.py`, `vet.py` در `apps/backend/src/models/` هیچ migration هم‌نامی ندارند (ممکن است با `create_all` ساخته شوند) → NEEDS_CODE_REVIEW.
5. **فرانت روی داده‌ی mock:** `apps/web/src/data/mock-catalog.ts` و `mock-pets.ts` وجود دارند؛ کلاینت API فقط برای `subscriptions` و `vets` در `apps/web/src/lib/api/` هست → احتمال زیاد که catalog/pets/cart/checkout به API واقعی وصل نیستند.
6. **دو لایهٔ کلاینت API موازی:** `packages/api-client/src/*` در برابر `apps/web/src/lib/api/*` و `apps/web/src/types/*` → تکرار تایپ و قرارداد.
7. **`health.py` مبهم:** `apps/backend/src/api/v1/health.py` + `tests/test_health.py` احتمالاً healthcheck سرویس است، نه سلامت حیوان؛ سلامت حیوان در `medical_records.py` است → NEEDS_CODE_REVIEW.
8. **مسیرهای seller و admin زیر `/dashboard`** هستند (`/dashboard/seller`, `/dashboard/admin`) و `middleware.ts` وجود ندارد → مرز نقش‌ها در سطح route نامشخص.
9. **ماژول‌های خارج از فاز ۱ پیش‌ساخته شده‌اند:** `ai_copilot`, `amber_alert`, `nfc`, `adoption`, `logistics`, `wms_webhooks`, `vets`, `services`, `loyalty`.
10. **artifact های ناخواسته در ریپو:** `apps/web/tsconfig.tsbuildinfo`, `structure.txt`, `folder-structure.txt`, `apps/backend/bonnivo.db`، و `.venv` و `node_modules` (اگر commit شده‌اند — از `.gitignore` قابل اثبات نیست → UNKNOWN_FROM_STRUCTURE).

---

## 2. Repository Architecture Map

```
.
├── AGENTS.md · .agentignore · docker-compose.yml · package.json · pnpm-workspace.yaml
├── .agents/            # قوانین، نقش‌ها و skill های عامل‌های توسعه
├── .bonyo/             # state/plan/checkpoint/audit/report اسپرینت‌های عاملی
├── apps/
│   ├── backend/        # FastAPI
│   │   ├── main.py · alembic.ini · Dockerfile · pyproject.toml · bonnivo.db
│   │   ├── migrations/versions/ (2 فایل)
│   │   ├── src/{main.py, api/v1 (24), core (3), models (12), services (3)}
│   │   └── tests/ (29 + conftest)
│   ├── web/            # Next.js App Router
│   │   ├── src/app/ (18 page.tsx) · src/components/ (14 گروه، 25 فایل)
│   │   ├── src/{context,data,lib,types}/ · public/icons/ · e2e/
│   └── mobile/         # خالی
├── packages/api-client/src/
├── docs/ (15 سند + roadmap/4) · docs/plans/ (خالی)
├── icons/              # کپی تکراری apps/web/public/icons
└── nginx/nginx.conf
```

| Path | Purpose | Current Evidence | Maturity | Relevant Phase(s) | Notes |
|---|---|---|---|---|---|
| `apps/web` | وب‌اپ مشتری + پنل فروشنده + پنل ادمین در یک اپ | ۱۸ route، ۲۵ کامپوننت، ۳ context | PARTIAL | 1 (هسته)، 2/3/4 (پیش‌ساخته) | صفحهٔ جزئیات محصول، سفارش‌ها، سلامت، auth route، error/not-found وجود ندارند |
| `apps/backend` | API، مدل داده، سرویس‌ها | ۲۴ router، ۱۲ مدل، ۳ سرویس، ۲۹ تست | PARTIAL | 1–4 | گستره زیاد، عمق نامعلوم؛ migration ناقص |
| `apps/mobile` | اپ موبایل | خالی | MISSING | 1 (در صورت تصمیم) | فعلاً `manifest.ts` نشان می‌دهد PWA جایگزین است |
| `packages/api-client` | کلاینت TS مشترک | ۳ فایل | PARTIAL / Scaffold | مشترک | باید منبع واحد قرارداد شود (تولید از OpenAPI) |
| `docs` | قانون اساسی محصول، دامنه، داده، API، طراحی | ۱۹ سند | EXISTS | 1 + نقشه آینده | باید با تعریف ۴ فاز جدید یکسان شود |
| `.agents` | قوانین/نقش/skill عامل‌ها | ۳ agent، ۳ rule، ۵ skill | EXISTS | Infra | `rules/security.md` باید قوانین «فروشنده هرگز دادهٔ سلامت نبیند» را صریح داشته باشد → NEEDS_CODE_REVIEW |
| `.bonyo` | حافظه و گزارش اسپرینت عاملی | ۳۰ audit، ۶ checkpoint، ۵ plan، ۳ report، ۳ state | EXISTS | Infra | گزارش‌های تکمیل خودساخته‌اند؛ مبنای go/no-go نیستند |
| `nginx` | reverse proxy | `nginx.conf` | Config only | Infra | TLS، rate-limit، security headers → NEEDS_CODE_REVIEW |
| `docker-compose.yml` | اجرای محلی | ۱ فایل | Config only | Infra | وجود سرویس Postgres/Redis/MinIO → UNKNOWN_FROM_STRUCTURE |
| `icons` (root) | دارایی‌های برند | ۲۰ فایل | Obsolete candidate | — | دقیقاً تکرار `apps/web/public/icons` |

---

## 3. File and Folder Ownership Map

### 3.1 ریشه و زیرساخت

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` | Config | تعریف workspace و اسکریپت‌ها | DevEx | Shared | Config only | — | اسکریپت‌های dev/build/test | pnpm | وجود اسکریپت `lint`/`typecheck`/`test` → NEEDS_CODE_REVIEW |
| `docker-compose.yml` | Config | اجرای محلی سرویس‌ها | DevOps | Shared | Config only | env vars | کانتینر web/backend/nginx | `apps/*/Dockerfile`, `nginx/nginx.conf` | سرویس Postgres/Object storage باید تأیید شود |
| `apps/backend/Dockerfile`, `apps/web/Dockerfile` | Config | ساخت image | DevOps | Shared | Config only | سورس | image | `uv.lock`, `pnpm-lock.yaml` | multi-stage و non-root user → NEEDS_CODE_REVIEW |
| `nginx/nginx.conf` | Config | proxy/routing | DevOps/Security | Shared | Config only | درخواست HTTP | مسیریابی به web/api | compose | CSP، HSTS، limit_req برای `/auth/otp` و `/passport/*` لازم است |
| `.gitignore`, `.dockerignore`, `.agentignore` | Config | حذف artifact | DevEx | Shared | Config only | — | — | — | `bonnivo.db`, `tsconfig.tsbuildinfo`, `.venv` باید ignore باشند |
| `AGENTS.md` | Doc | قانون کار عامل‌ها | DevEx | Shared | Implemented | — | راهنمای عامل | `.agents/**` | باید به «Pet Profile First» و فازبندی جدید ارجاع دهد |
| `structure.txt`, `folder-structure.txt` | Artifact | خروجی tree | — | — | Obsolete candidate | — | — | — | حذف از ریپو |
| `icons/*` | Asset | لوگو و آیکن دسته‌ها | Brand | 1 | Obsolete candidate | — | — | — | تکرار؛ منبع واحد = `apps/web/public/icons` یا `packages/brand-assets` |

### 3.2 عامل‌ها و حافظهٔ پروژه

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `.agents/agents/orchestrator.md`, `builder.md`, `auditor.md` | Agent config | نقش‌های برنامه‌ریز/سازنده/ممیز | DevEx | Shared | Implemented | task | plan/code/audit | `.bonyo/state/*` | auditor باید gate فاز جدید را اجرا کند |
| `.agents/rules/architecture.md`, `frontend.md`, `security.md` | Rules | قواعد معماری/فرانت/امنیت | Governance | Shared | Implemented | — | — | — | باید قواعد RTL، no-3D-in-checkout، seller-data-isolation را صریحاً داشته باشند → NEEDS_CODE_REVIEW |
| `.agents/skills/1-ui-pro-max/SKILL.md` | Skill | UI | Design system | 1 | Implemented | — | — | `docs/10-design-system.md` | با Bonyo Care System هم‌راستا شود |
| `.agents/skills/2-threejs-3d/SKILL.md` | Skill | 3D | 3D Island | 1 (اختیاری) | Implemented | — | — | `three` | باید fallback 2D را الزامی کند |
| `.agents/skills/3-fastapi-backend/SKILL.md` | Skill | Backend | Backend | Shared | Implemented | — | — | — | — |
| `.agents/skills/4-nativewind-mobile/SKILL.md` | Skill | Mobile | Mobile | 1/2 | Missing counterpart | — | — | `apps/mobile` | skill هست، اپ نیست |
| `.agents/skills/bonyo-sprint/SKILL.md` | Skill | چرخهٔ اسپرینت | PM | Shared | Implemented | — | `.bonyo/*` | — | — |
| `.bonyo/state/current-task.md`, `sprint-state.md`, `decisions.md` | State | وضعیت جاری و تصمیم‌ها | PM | Shared | Implemented | — | — | — | `decisions.md` باید با `docs/03-decisions.md` ادغام/همگام شود (دو منبع حقیقت) |
| `.bonyo/plans/{account-settings,pet-management,task-1.3,task-2.2,task-9.2}.md` | Plan | برنامهٔ تسک | PM | 1 | Implemented | — | — | — | — |
| `.bonyo/checkpoints/*-baseline.md` (۶ فایل) | Checkpoint | خط پایه قبل از تغییر | PM | 1 | Implemented | — | — | — | — |
| `.bonyo/audits/task-*.md` (۲۵ فایل) + `account-settings.md`, `pet-management.md` | Audit | ممیزی تسک‌ها | QA | 1 | Implemented | — | — | — | شماره‌گذاری task-1.3 تا task-15.1 با `docs/roadmap/phase-1-checklist.md` باید تطبیق داده شود |
| `.bonyo/audits/phase-2-health-network.md`, `phase-3-logistics-marketplace.md`, `phase-4-hardware-social.md` | Audit | ممیزی فازهای قدیمی | QA | 2–4 (قدیم) | Obsolete candidate | — | — | — | تعریف فاز منسوخ؛ بازنگاشت لازم |
| `.bonyo/reports/phase-1-completion-report.md` | Report | ادعای تکمیل فاز ۱ | PM | 1 | Unknown from structure | — | — | — | با شکاف‌های این سند در تضاد است |
| `.bonyo/reports/phase-2-3-4-completion-report.md` | Report | ادعای تکمیل فاز ۲–۴ | PM | 2–4 | Obsolete candidate | — | — | — | خطرناک برای تصمیم‌گیری؛ علامت «غیرمعتبر تا بازبینی» |

### 3.3 Backend — هسته و داده

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `apps/backend/main.py` | Entrypoint | اجرای اپ (احتمالی) | Infra | Shared | Obsolete candidate | — | ASGI app | `src/main.py` | دوگانه با `src/main.py` |
| `apps/backend/src/main.py` | Entrypoint | ساخت FastAPI، ثبت router ها | Infra | Shared | Implemented | — | ASGI app | `api/v1/*` | ثبت شدن همهٔ ۲۴ router و feature-flag آن‌ها → NEEDS_CODE_REVIEW |
| `apps/backend/src/core/config.py` | Core | تنظیمات | Infra | Shared | Implemented | env | Settings | pydantic-settings | `.env.example` وجود ندارد |
| `apps/backend/src/core/database.py` | Core | engine/session | Data | Shared | Implemented | DATABASE_URL | AsyncSession | asyncpg/aiosqlite | پشتیبانی همزمان SQLite/Postgres؛ PostGIS → MISSING |
| `apps/backend/src/core/security.py` | Core | JWT، hash، وابستگی کاربر جاری | Auth | 1 | Implemented | token | user/roles | python-jose, passlib | مدل نقش/مجوز ریزدانه → NEEDS_CODE_REVIEW |
| `apps/backend/alembic.ini`, `migrations/env.py`, `script.py.mako` | Migration config | — | Data | Shared | Config only | — | — | SQLAlchemy | — |
| `migrations/versions/9fed3f4f72ba_create_initial_schema.py` | Migration | schema اولیه (احتمالاً user/pet) | Data | 1 | Partial | — | جداول | `models/user.py`, `models/pet.py` | — |
| `migrations/versions/2a5b5c0fa7d7_create_catalog_and_orders.py` | Migration | catalog + order | Commerce | 1 | Partial | — | جداول | `models/catalog.py`, `models/order.py` | جداول settlement/subscription/logistics/... بدون migration |
| `apps/backend/bonnivo.db` | Artifact | DB محلی SQLite | — | — | Obsolete candidate | — | — | — | حذف و ignore؛ بررسی نشت داده |
| `apps/backend/pyproject.toml`, `uv.lock` | Config | وابستگی Python | DevEx | Shared | Config only | — | — | uv | Python 3.14 در `.venv` (خیلی جدید؛ سازگاری کتابخانه‌ها) |
| `apps/backend/README.md` | Doc | راهنمای اجرا | DevEx | Shared | Implemented | — | — | — | — |

### 3.4 Backend — مدل‌ها

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `models/user.py` | Model | User (و احتمالاً Role/Seller/OTP) | Auth/Account | 1 | Partial | — | User | — | Seller، Address، Consent جدا نیستند → NEEDS_CODE_REVIEW |
| `models/pet.py` | Model | Pet (و احتمالاً CareTask/Vaccination/Weight/PassportToken) | Pet Profile, Care, Health | 1 | Partial | — | Pet, … | user | Reminder, HealthRecord, WeightRecord, QrToken باید جدا قابل اثبات باشند |
| `models/catalog.py` | Model | Product/Variant/Offer (Buy Box) | Catalog | 1 | Partial | — | — | — | `test_buy_box.py` نشانهٔ مدل canonical product + seller offer است ✔ |
| `models/order.py` | Model | Order/OrderItem | Orders | 1 | Partial | — | — | catalog, user | SellerOrder (split)، Payment، Refund، Shipment جدا؟ → NEEDS_CODE_REVIEW |
| `models/settlement.py` | Model | تسویه با فروشنده | Seller finance | 1 (پشتیبان) | Partial | — | — | order | بدون migration |
| `models/subscription.py` | Model | اشتراک/Autoship | Autoship | 1 (foundation) | Partial | — | — | catalog, pet | بدون migration؛ پشت feature flag |
| `models/logistics.py` | Model | dispatch/courier | Shipment | 1 (Shipment ساده) / 3 | Partial | — | — | order | dispatch و live courier خارج از دامنهٔ فاز ۱ |
| `models/vet.py` | Model | دامپزشک/نوبت | Provider booking | 2 | Partial (پیش‌ساخته) | — | — | user, pet | فاز ۲ |
| `models/loyalty.py` | Model | امتیاز (Paw Points) | Loyalty | 3 | Partial (پیش‌ساخته) | — | — | order | فاز ۳ |
| `models/amber_alert.py` | Model | هشدار گم‌شدن جمعی | Lost pet | 1 (Lost mode پایه) / 4 (community alert) | Partial (پیش‌ساخته) | — | — | pet, location | دادهٔ مکانی حساس |
| `models/nfc.py` | Model | تگ NFC | QR/Hardware | 4 | Partial (پیش‌ساخته) | — | — | pet | سخت‌افزار خارج از فاز ۱ |
| `models/adoption.py` | Model | واگذاری/پذیرش | Adoption | 4 | Partial (پیش‌ساخته) | — | — | — | — |
| `models/__init__.py` | Model registry | ثبت مدل‌ها برای Alembic | Data | Shared | Implemented | — | metadata | همه | — |
| — | Model | AuditLog | Security | 1 | Missing counterpart | — | — | — | `test_security_idor_audit.py` هست ولی مدل audit دیده نمی‌شود |
| — | Model | Notification, NotificationPreference, NotificationLog | Notifications | 1 | Missing counterpart | — | — | — | — |
| — | Model | Reminder (جدا از CareTask) | Reminders | 1 | Missing counterpart / UNKNOWN | — | — | — | — |
| — | Model | Address, Cart (سمت سرور) | Checkout | 1 | Missing counterpart | — | — | — | سبد فقط در `context/cart-context.tsx` |
| — | Model | Review, SupportTicket, Category (جدا) | Commerce/Support | 1 | Missing counterpart | — | — | — | `test_admin_disputes.py` نشان می‌دهد Dispute جایی تعریف شده |
| — | Model | Consent | Privacy | 1 | Missing counterpart | — | — | — | — |

### 3.5 Backend — API routers

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `api/v1/auth.py` | Router | OTP پیامکی، توکن | Auth | 1 | Implemented | phone, otp | JWT | `services/sms.py`, `core/security.py` | تست: `test_auth_otp.py` |
| `api/v1/pets.py` | Router | CRUD پت | Pet Profile | 1 | Implemented | pet payload | Pet | `models/pet.py` | تست: `test_pets_crud_security.py` (IDOR) ✔ |
| `api/v1/care.py` | Router | تسک‌های مراقبت روزانه | Daily Care | 1 | Implemented | task | CareTask | pet | تست: `test_care_tasks.py` |
| `api/v1/medical_records.py` | Router | سوابق پزشکی | Health Timeline | 1 | Implemented | record | HealthRecord | pet, vet? | تست: `test_medical_records.py`؛ نبود دسترسی فروشنده باید اثبات شود |
| `api/v1/passport.py` | Router | پاسپورت QR، نمای اضطراری | QR Passport | 1 | Implemented | token | public view | pet | تست: `test_passport_emergency.py` |
| `api/v1/catalog.py` | Router | کاتالوگ، Buy Box | Catalog | 1 | Implemented | query | products/offers | `models/catalog.py` | تست: `test_catalog_models.py`, `test_buy_box.py` |
| `api/v1/checkout.py` | Router | ثبت سفارش، رزرو موجودی | Checkout | 1 | Implemented | cart | order | catalog, order | تست: `test_inventory_reservation.py` |
| `api/v1/payment.py` + `services/payment.py` | Router+Service | درگاه پرداخت | Payment | 1 | Partial | order | redirect/verify | درگاه (نامشخص) | تست: `test_payment.py`؛ ارائه‌دهنده → NEEDS_FOUNDER_DECISION |
| `api/v1/sellers.py` | Router | KYC، موجودی، fulfillment | Seller panel | 1 | Implemented | seller data | — | user, catalog | تست: `test_seller_kyc.py`, `test_seller_inventory_fulfillment.py` |
| `api/v1/settlements.py` | Router | تسویه فروشنده | Seller finance | 1 | Partial | — | — | settlement | تست: `test_vendor_settlement.py` |
| `api/v1/admin.py` | Router | ادمین، اختلافات | Admin/Ops | 1 | Partial | — | — | همه | تست: `test_admin_disputes.py` |
| `api/v1/analytics.py` | Router | دریافت رویداد | Analytics | 1 | Partial | event | — | — | تست: `test_analytics.py`؛ هم‌خوانی با `docs/11-analytics-plan.md` |
| `api/v1/replenishment.py` + `services/replenishment.py` | Router+Service | پیش‌بینی خرید مجدد | Reorder | 1 | Implemented | order history | due date | order | تست: `test_replenishment.py` |
| `api/v1/subscriptions.py` | Router | Autoship | Autoship | 1 (flag) | Implemented | plan | subscription | subscription | تست: `test_subscriptions.py` |
| `api/v1/logistics.py` | Router | dispatch پیک | Shipment | 1 (tracking) / 3 | Partial | — | — | logistics | تست: `test_logistics_dispatch.py` |
| `api/v1/wms_webhooks.py` | Router | webhook انبار | WMS | 4 (ERP) | Obsolete candidate برای فاز ۱ | webhook | — | — | فاز ۱ صراحتاً warehouse/ERP را مستثنا کرده |
| `api/v1/health.py` | Router | healthcheck (احتمالی) | Infra | Shared | Unknown from structure | — | status | — | — |
| `api/v1/ai_copilot.py` | Router | دستیار هوشمند | AI | 4 | Partial (پیش‌ساخته، پرریسک) | prompt | answer | LLM؟ | با «no AI diagnosis» در تضاد بالقوه؛ تست: `test_ai_copilot.py` |
| `api/v1/amber_alert.py` | Router | هشدار گم‌شدن، گزارش مشاهده | Lost pet | 1 (lost mode) / 4 | Partial | location | alert | pet | تست: `test_amber_alert.py` |
| `api/v1/nfc.py` | Router | تگ NFC | Hardware | 4 | Partial (پیش‌ساخته) | — | — | — | تست: `test_nfc_tags.py` |
| `api/v1/vets.py` | Router | دامپزشک و نوبت | Provider booking | 2 | Partial (پیش‌ساخته) | — | — | vet | تست: `test_vet_booking.py` |
| `api/v1/services.py` | Router | خدمات + قید واکسن | Services/Boarding | 2/3 | Partial (پیش‌ساخته) | — | — | pet vaccinations | تست: `test_services_vaccine_guard.py` (ارزشمند برای فاز ۳) |
| `api/v1/loyalty.py` | Router | امتیاز | Loyalty | 3 | Partial (پیش‌ساخته) | — | — | — | تست: `test_loyalty.py` |
| `api/v1/adoption.py` | Router | پذیرش حیوان | Adoption | 4 | Partial (پیش‌ساخته) | — | — | — | تست: `test_adoption.py` |
| `services/sms.py` | Service | ارسال پیامک | Notifications/Auth | 1 | Implemented | msg | — | ارائه‌دهندهٔ SMS | تست: `test_sms_dispatcher.py` |

### 3.6 Web — زیرساخت و state

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `apps/web/src/app/layout.tsx` | Layout | `<html dir="rtl" lang="fa">`، فونت، provider ها | Shell | 1 | Implemented | — | shell | context/* | تأیید `dir="rtl"` و فونت فارسی → NEEDS_CODE_REVIEW |
| `apps/web/src/app/globals.css` | Style | توکن‌های CSS | Design system | 1 | Partial | — | CSS vars | tailwind | — |
| `apps/web/tailwind.config.ts` | Config | رنگ/فونت | Design system | 1 | Partial | — | theme | — | پلاگین RTL/logical properties → UNKNOWN |
| `apps/web/src/app/manifest.ts` | PWA | manifest | Mobile web | 1 | Implemented | — | manifest | — | service worker/offline → MISSING |
| `apps/web/next.config.ts` | Config | Next config | Infra | Shared | Config only | — | — | — | تصاویر remote (S3)، security headers → NEEDS_CODE_REVIEW |
| `apps/web/src/context/auth-context.tsx` | State | نشست کاربر | Auth | 1 | Implemented | token | user | api | محل نگهداری توکن (localStorage vs httpOnly cookie) → NEEDS_CODE_REVIEW (حیاتی) |
| `apps/web/src/context/cart-context.tsx` | State | سبد سمت کلاینت | Cart | 1 | Partial | items | cart | — | سبد سرور، چند فروشنده‌ای و ماندگار → MISSING |
| `apps/web/src/context/pet-context.tsx` | State | پت انتخاب‌شده | Pet switcher | 1 | Implemented | pets | selectedPet | — | ✔ ستون «Pet Profile First» |
| `apps/web/src/data/mock-catalog.ts`, `mock-pets.ts` | Mock | داده ساختگی | Catalog/Pet | — | Obsolete candidate | — | — | — | باید فقط در dev/storybook استفاده شود |
| `apps/web/src/lib/api/subscriptions.ts`, `vets.ts` | API client | فراخوانی API | Autoship / Vets | 1 / 2 | Partial | — | — | backend | جایگزینی با `packages/api-client` |
| `apps/web/src/lib/analytics.ts` | Lib | ارسال رویداد | Analytics | 1 | Partial | event | — | `api/v1/analytics.py` | taxonomy رویداد → NEEDS_CODE_REVIEW |
| `apps/web/src/lib/utils.ts` | Lib | `cn()` | Design system | 1 | Implemented | — | — | clsx, tailwind-merge | — |
| `apps/web/src/types/{auth,cart,catalog,pet,subscription,vet}.ts` | Types | تایپ دامنه | Shared | 1/2 | Partial | — | — | — | تکرار با `packages/api-client/src/types.ts` |
| `packages/api-client/src/client.ts`, `index.ts`, `types.ts` | Package | کلاینت مشترک | Shared | 1 | Scaffold | — | — | — | تولید خودکار از OpenAPI → MISSING |
| `apps/web/scripts/ts-resolve.mjs` | Script | resolver برای اجرای TS | DevEx | Shared | Unknown from structure | — | — | — | احتمالاً برای اجرای تست بدون runner؛ بازبینی |
| `apps/web/playwright.config.ts`, `e2e/core-flows.spec.ts`, `e2e/playwright.d.ts` | Test | E2E جریان اصلی | QA | 1 | Scaffold | — | — | `@playwright/test` | پکیج نصب نیست؛ `d.ts` دست‌ساز = تست احتمالاً اجرا نمی‌شود |
| `apps/web/tsconfig.tsbuildinfo` | Artifact | — | — | — | Obsolete candidate | — | — | — | ignore |

### 3.7 Web — کامپوننت‌ها

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `components/auth/otp-auth-modal.tsx` | Component | ورود با OTP | Auth | 1 | Implemented | phone | session | auth-context | route مستقل `/login` ندارد (deep link و redirect-after-login) |
| `components/pet/pet-onboarding-wizard.tsx` | Component | ساخت پت چندمرحله‌ای | Pet Profile | 1 | Implemented | pet fields | Pet | pet-context, api | فیلدهای کامل (energy, allergy, spay) → NEEDS_CODE_REVIEW |
| `components/pet/multi-pet-switcher.tsx` | Component | تعویض پت | Pet switcher | 1 | Implemented | pets | selectedPet | pet-context | — |
| `components/care/today-care-dashboard.tsx` | Component | داشبورد امروز | Daily Care | 1 | Implemented | tasks | completion | care API | snooze/skip/reschedule → NEEDS_CODE_REVIEW |
| `components/care/smart-reorder-widget.tsx` | Component | Buy Again در داشبورد | Reorder | 1 | Implemented | replenishment | add-to-cart | cart-context | پل care→commerce ✔ |
| `components/care/bonyo-copilot-drawer.tsx` | Component | چت AI | AI | 4 | Partial (پیش‌ساخته) | prompt | answer | `ai_copilot.py` | پشت flag؛ خارج از فاز ۱ |
| `components/home/hero-island-banner.tsx` | Component | بنر قهرمان | Home/Brand | 1 | Implemented | — | CTA | island | — |
| `components/home/island-progressive-container.tsx` | Component | بارگذاری تدریجی 3D | 3D | 1 (اختیاری) | Implemented | capability | 3D یا 2D | three-island-canvas | الگوی صحیح progressive enhancement ✔ |
| `components/home/three-island-canvas.tsx` | Component | صحنهٔ three.js | 3D | 1 (اختیاری) | Partial | — | canvas | three | بدون R3F؛ dispose/cleanup → NEEDS_CODE_REVIEW |
| `components/home/featured-products-row.tsx` | Component | محصولات ویژه | Catalog | 1 | Implemented | products | → product | mock-catalog؟ | لینک به جزئیات محصول ممکن نیست (route ندارد) |
| `components/home/home-care-teaser.tsx` | Component | تیزر مراقبت | Daily Care | 1 | Implemented | — | → `/dashboard/care` | — | — |
| `components/layout/desktop-header.tsx` | Nav | هدر دسکتاپ | Navigation | 1 | Implemented | — | — | auth, cart | — |
| `components/layout/mobile-bottom-nav.tsx` | Nav | ناوبری پایین موبایل | Navigation | 1 | Implemented | — | — | — | — |
| `components/shop/shop-catalog-view.tsx` | Component | لیست کاتالوگ | Catalog | 1 | Partial | products | add-to-cart | mock-catalog | فیلتر دسته/جستجو/سازگاری با پت → NEEDS_CODE_REVIEW |
| `components/cart/cart-view.tsx` | Component | سبد | Cart | 1 | Partial | cart | → checkout | cart-context | گروه‌بندی بر اساس فروشنده → UNKNOWN |
| `components/checkout/checkout-view.tsx` | Component | تسویه | Checkout | 1 | Partial | cart, address | order | checkout API | آدرس/روش ارسال/پرداخت → NEEDS_CODE_REVIEW |
| `components/checkout/checkout-success-view.tsx` | Component | موفقیت سفارش | Order success | 1 | Implemented | order | → tracking | — | — |
| `components/logistics/live-courier-map.tsx` | Component | نقشهٔ زندهٔ پیک | Tracking | 3 | Partial (پیش‌ساخته) | courier location | map | logistics | برای فاز ۱ Order Status Timeline کافی است |
| `components/passport/owner-passport-manager.tsx` | Component | مدیریت پاسپورت توسط مالک | QR Passport | 1 | Implemented | pet | QR, toggles | passport API | — |
| `components/passport/sighting-location-modal.tsx` | Component | گزارش مشاهده با مکان | Lost mode | 1 | Implemented | geolocation | sighting | amber_alert API | رضایت مکانی و rate limit |
| `components/seller/seller-dashboard-view.tsx` | Component | داشبورد فروشنده (تک‌فایل) | Seller panel | 1 | Partial | — | — | sellers API | محصولات/موجودی/سفارش‌ها در یک view؛ تفکیک لازم |
| `components/admin/admin-panel-view.tsx` | Component | پنل ادمین (تک‌فایل) | Admin | 1 | Partial | — | — | admin API | صف تأیید فروشنده، moderation، refund جدا نیستند |
| `components/dashboard/paw-points-widget.tsx` | Component | امتیاز وفاداری | Loyalty | 3 | Partial (پیش‌ساخته) | — | — | loyalty API | خارج از فاز ۱ |
| `components/support/support-drawer.tsx` | Component | پشتیبانی | Support | 1 | Partial | — | ticket? | — | API تیکت → MISSING |
| — | Component | `components/ui/*` (Button, Input, Dialog, …) | Design system | 1 | Missing counterpart | — | — | — | — |

### 3.8 Web — دارایی‌ها

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `apps/web/public/icons/bonnivo-logo-{horizontal,vertical,mark}.svg` | Asset | لوگو | Brand | 1 | Implemented | — | — | — | نام فایل «bonnivo» |
| `apps/web/public/icons/bonnivo-floating-island.svg` | Asset | جزیرهٔ 2D | 3D fallback | 1 | Implemented | — | — | — | fallback بالقوهٔ صحنهٔ 3D ✔ |
| `apps/web/public/icons/{all,dog,cat,birds,small-pets}.{svg,png}` | Asset | آیکن گونه | Catalog / Pet | 1 | Implemented | — | — | — | — |
| `apps/web/public/icons/{food,health,toys}.{svg,png}` | Asset | آیکن دسته | Catalog | 1 | Implemented | — | — | — | — |

### 3.9 Docs

| Path | Type | Existing Responsibility | Product Module | Phase | Current Status | Expected Inputs | Expected Outputs | Depends On | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `docs/01-product-brief.md` | Doc | خلاصهٔ محصول | Product | All | Implemented | — | — | — | باید جملهٔ «فروشگاه هوشمندی که هر پت را می‌شناسد» را داشته باشد |
| `docs/02-phase-1-scope.md` | Doc | دامنهٔ فاز ۱ | Product | 1 | Implemented | — | — | — | با فاز ۱ جدید (multi-vendor از روز اول) تطبیق |
| `docs/03-decisions.md`, `docs/04-open-questions.md`, `docs/05-assumptions.md`, `docs/06-non-goals.md` | Doc | تصمیم/سؤال/فرض/غیرهدف | Governance | All | Implemented | — | — | — | `06-non-goals.md` با وجود `nfc`/`ai_copilot`/`adoption` در کد مقایسه شود |
| `docs/07-user-flows.md` | Doc | جریان‌های کاربر | UX | 1 | Implemented | — | — | — | — |
| `docs/08-data-model.md` | Doc | مدل داده | Data | 1 | Implemented | — | — | — | مقایسه با `models/*` و migration ها |
| `docs/09-api-contract.md` | Doc | قرارداد API | API | 1 | Implemented | — | — | — | OpenAPI ماشینی (`openapi.json`) → MISSING |
| `docs/10-design-system.md` | Doc | سیستم طراحی | Design | 1 | Implemented | — | — | — | — |
| `docs/11-analytics-plan.md` | Doc | برنامهٔ رویداد | Analytics | 1 | Implemented | — | — | — | — |
| `docs/12-security-privacy.md` | Doc | امنیت/حریم | Security | 1 | Implemented | — | — | — | — |
| `docs/13-3d-island-asset-map.md` | Doc | نقشهٔ دارایی 3D | 3D | 1 | Implemented | — | — | — | — |
| `docs/ARCHITECTURE.md`, `docs/ROADMAP.md` | Doc | معماری و نقشهٔ راه | Arch | All | Implemented | — | — | — | ROADMAP باید با ۴ فاز جدید بازنویسی شود |
| `docs/roadmap/phase-1-checklist.md`, `phase-1-roadmap.md`, `phase-2-3-4-checklist.md`, `progress.md` | Doc | چک‌لیست و پیشرفت | PM | 1–4 | Partial | — | — | — | `phase-2-3-4-checklist.md` با تعریف قدیم فازها |
| `docs/plans/` | Folder | — | — | — | Scaffold | — | — | — | خالی |

---

## 4. Page / Route / Screen Map

> وضعیت: `Exists` = فایل `page.tsx` هست · `Partial` = هست ولی حالات/اتصال ناقص · `MISSING_REQUIRED_PAGE` = لازم برای فاز مربوط و نیست · `Premature` = برای فاز بعدی پیش‌ساخته شده.
> هیچ‌کدام از `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`, `middleware.ts` و هیچ `layout.tsx` تودرتو (مثلاً `dashboard/layout.tsx`) در ساختار نیست؛ بنابراین ستون «Missing States» برای همهٔ صفحات موجود حداقل شامل *loading/error/not-found سطح route* است.

### 4.1 صفحات موجود

| Route / Screen | Platform | Existing Path(s) | Purpose | Primary Role | Required Data | Primary CTA | Links To | Linked From | Phase | Status | Missing States |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` خانه | Web | `src/app/page.tsx`, `components/home/*` | معرفی برند، جزیره، تیزر مراقبت، محصولات ویژه | Pet Parent | featured products, selected pet (اختیاری) | «پروفایل پتت را بساز» / «ورود به فروشگاه» | `/shop`, `/dashboard/care`, `/dashboard/pets`, `/shop/[productSlug]` (ندارد) | header logo، bottom nav | 1 | Partial | 3D-fail fallback (احتمالاً موجود)، empty محصولات، personalized state بر اساس پت |
| `/shop` فروشگاه | Web | `src/app/shop/page.tsx`, `components/shop/shop-catalog-view.tsx` | لیست محصولات | Pet Parent | products, offers, categories, selected pet | «افزودن به سبد» | `/cart`, `/shop/[productSlug]` (ندارد), `/shop/c/[categorySlug]` (ندارد) | `/`, header, bottom nav, smart-reorder | 1 | Partial | empty نتایج، error API، فیلتر بدون نتیجه، pagination، degraded (بدون موجودی) |
| `/cart` سبد | Web | `src/app/cart/page.tsx`, `components/cart/cart-view.tsx` | بازبینی سبد | Pet Parent | cart (چندفروشنده‌ای)، موجودی لحظه‌ای | «ادامهٔ خرید» | `/checkout`, `/shop`, `/shop/[productSlug]` | header cart icon, add-to-cart toast | 1 | Partial | empty cart، آیتم ناموجود، تغییر قیمت، unauthorized→login |
| `/checkout` | Web | `src/app/checkout/page.tsx`, `components/checkout/checkout-view.tsx` | آدرس، ارسال، پرداخت | Pet Parent | address, shipping options per seller, totals | «پرداخت» | درگاه → `/checkout/payment/callback` (ندارد) → `/checkout/success` | `/cart` | 1 | Partial | unauthorized، آدرس خالی، موجودی تمام‌شده هنگام پرداخت، پرداخت ناموفق، timeout |
| `/checkout/success` | Web | `src/app/checkout/success/page.tsx`, `components/checkout/checkout-success-view.tsx` | تأیید سفارش | Pet Parent | order id, sub-orders | «پیگیری سفارش» | `/dashboard/orders/[orderId]` (ندارد), `/dashboard/tracking`, `/shop` | callback پرداخت | 1 | Partial | order not found، پرداخت در انتظار تأیید |
| `/dashboard/care` امروز | Web | `src/app/dashboard/care/page.tsx`, `components/care/today-care-dashboard.tsx`, `smart-reorder-widget.tsx`, `bonyo-copilot-drawer.tsx` | تسک‌های امروز + خرید مجدد | Pet Parent | selected pet, today tasks, reminders, replenishment | «انجام شد» | `/dashboard/pets/[petId]` (ندارد), `/dashboard/reminders` (ندارد), `/cart`, `/shop/[productSlug]` | home teaser, bottom nav | 1 | Partial | بدون پت (incomplete profile)، بدون تسک (empty)، offline تیک‌زدن |
| `/dashboard/pets` | Web | `src/app/dashboard/pets/page.tsx`, `components/pet/*` | لیست/افزودن پت | Pet Parent | pets | «افزودن پت» | wizard، `/dashboard/pets/[petId]` (ندارد), `/dashboard/passport` | switcher، home | 1 | Partial | empty (اولین پت)، error آپلود عکس |
| `/dashboard/profile` | Web | `src/app/dashboard/profile/page.tsx` (+ `.bonyo/plans/account-settings.md`) | حساب کاربری | Pet Parent | user | «ذخیره» | `/dashboard/settings/notifications` (ندارد), `/dashboard/addresses` (ندارد) | header avatar | 1 | Partial | — |
| `/dashboard/passport` | Web | `src/app/dashboard/passport/page.tsx`, `components/passport/owner-passport-manager.tsx` | QR، فیلدهای عمومی، Lost mode | Pet Parent | pet, qr token, public fields | «فعال‌سازی حالت گم‌شده» | `/passport/[token]` (پیش‌نمایش), `/dashboard/pets/[petId]` | pet profile (ندارد)، nav | 1 | Partial | پت انتخاب نشده، تولید مجدد توکن |
| `/passport/[token]` عمومی | Web | `src/app/passport/[token]/page.tsx`, `components/passport/sighting-location-modal.tsx` | نمای اضطراری/پت گم‌شده | Public | فیلدهای مجاز عمومی، روش تماس امن | «تماس با صاحب» / «گزارش مشاهده» | — (عمداً بدون لینک به داخل) | اسکن QR | 1 | Partial | token نامعتبر/لغوشده، lost mode خاموش، رد مجوز مکان |
| `/dashboard/tracking` | Web | `src/app/dashboard/tracking/page.tsx`, `components/logistics/live-courier-map.tsx` | پیگیری ارسال | Pet Parent | shipment status | — | `/dashboard/orders/[orderId]` | checkout success | 1 (به‌صورت timeline) | Partial | بدون orderId در route (کدام سفارش؟) → باید `/dashboard/orders/[orderId]/tracking` شود |
| `/dashboard/subscriptions` | Web | `src/app/dashboard/subscriptions/page.tsx`, `lib/api/subscriptions.ts` | مدیریت Autoship | Pet Parent | subscriptions | «توقف/رد کردن/ویرایش/لغو» | `/shop/[productSlug]` | profile، product detail | 1 (flag) | Partial | flag خاموش، empty |
| `/dashboard/seller` | Seller Panel | `src/app/dashboard/seller/page.tsx`, `components/seller/seller-dashboard-view.tsx` | همهٔ پنل فروشنده در یک صفحه | Seller | KPI، سفارش‌ها، موجودی | «پذیرش سفارش» | زیرصفحه‌ها (ندارند) | ؟ (ورودی نامشخص) | 1 | Partial | unauthorized (non-seller)، فروشندهٔ تأییدنشده، empty |
| `/dashboard/admin` | Admin | `src/app/dashboard/admin/page.tsx`, `components/admin/admin-panel-view.tsx` | همهٔ پنل ادمین در یک صفحه | Admin | صف‌ها، سفارش‌ها، اختلافات | «تأیید فروشنده» | زیرصفحه‌ها (ندارند) | ؟ | 1 | Partial | unauthorized، audit trail |
| `/dashboard/appointments` | Web | `src/app/dashboard/appointments/page.tsx` | نوبت‌های دامپزشکی | Pet Parent | bookings | — | `/vets/[id]` | — | 2 | Premature | پشت flag/حذف از nav فاز ۱ |
| `/vets` | Web | `src/app/vets/page.tsx`, `lib/api/vets.ts` | دایرکتوری دامپزشک | Pet Parent | providers | — | `/vets/[id]` | ؟ | 2 | Premature | — |
| `/vets/[id]` | Web | `src/app/vets/[id]/page.tsx` | پروفایل دامپزشک | Pet Parent | provider | «رزرو» | `/dashboard/appointments` | `/vets` | 2 | Premature | — |
| `/adopt` | Web | `src/app/adopt/page.tsx` | پذیرش حیوان | Public | listings | — | — | ؟ | 4 | Premature | — |
| `manifest` | Shared | `src/app/manifest.ts` | PWA | — | — | — | — | — | 1 | Exists | — |

### 4.2 صفحات/مسیرهای لازمِ ناموجود (فاز ۱)

| Route / Screen | Platform | Existing Path(s) | Purpose | Primary Role | Required Data | Primary CTA | Links To | Linked From | Phase | Status | Missing States |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/login` (+ `?next=`) | Web | فقط `components/auth/otp-auth-modal.tsx` | ورود/ثبت‌نام deep-linkable | Shared | phone | «دریافت کد» | `?next` | همه صفحات محافظت‌شده | 1 | MISSING_REQUIRED_PAGE | rate limit، کد منقضی |
| `/onboarding` | Web | wizard موجود | جریان اولین ورود: کاربر→پت→رضایت | Pet Parent | — | «شروع» | `/dashboard/care` | `/login` | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard` (index + `layout.tsx`) | Web | — | shell داشبورد + نقش‌محور redirect | Shared | user roles | — | care/seller/admin | login | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/pets/new` | Web/Mobile | wizard | افزودن پت با URL | Pet Parent | — | «ذخیره» | `/dashboard/pets/[petId]` | pets list, switcher, empty states | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/pets/[petId]` | Web/Mobile | — | پروفایل پت (هاب مرکزی) | Pet Parent | pet, summary | «ویرایش» | health, passport, care, `/shop?petId=` | switcher, care, pets | 1 | MISSING_REQUIRED_PAGE | پروفایل ناقص (progress) |
| `/dashboard/pets/[petId]/edit` | Web/Mobile | — | ویرایش | Pet Parent | pet | «ذخیره» | profile | profile | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/pets/[petId]/health` | Web/Mobile | — | Health Timeline | Pet Parent | records | «افزودن رکورد» | vaccinations, medications, weight | profile, care | 1 | MISSING_REQUIRED_PAGE | empty |
| `/dashboard/pets/[petId]/vaccinations` (+`/new`) | Web/Mobile | — | واکسن‌ها | Pet Parent | vaccinations | «افزودن واکسن» | reminder create | health | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/pets/[petId]/medications` (+`/new`) | Web/Mobile | — | داروها | Pet Parent | meds | «افزودن دارو» | reminder | health | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/pets/[petId]/weight` | Web/Mobile | — | نمودار وزن | Pet Parent | weights | «ثبت وزن» | health | health, care | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/care/tasks/[taskId]` | Web/Mobile | — | جزئیات تسک | Pet Parent | task | «انجام شد/تعویق/رد» | care | care | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/reminders` (+`/new`, `/[id]/edit`) | Web/Mobile | — | مرکز یادآور | Pet Parent | reminders | «یادآور جدید» | care | care, health | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/settings/notifications` | Web/Mobile | — | ترجیحات اعلان، quiet hours | Pet Parent | prefs | «ذخیره» | — | profile | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/addresses` | Web/Mobile | — | مدیریت آدرس | Pet Parent | addresses | «افزودن آدرس» | checkout | profile, checkout | 1 | MISSING_REQUIRED_PAGE | — |
| `/shop/[productSlug]` | Web/Mobile | — | **جزئیات محصول** | Pet Parent | product, variants, offers, compatibility, reviews | «افزودن به سبد» | cart, seller store, subscriptions | shop, home, search, reorder | 1 | MISSING_REQUIRED_PAGE (**Critical**) | ناموجود، همه پیشنهادها تمام |
| `/shop/c/[categorySlug]` | Web/Mobile | — | صفحهٔ دسته | Pet Parent | products | — | product | shop, home icons | 1 | MISSING_REQUIRED_PAGE | — |
| `/search?q=` | Web/Mobile | — | نتایج جستجو | Pet Parent | results | — | product | header search | 1 | MISSING_REQUIRED_PAGE | بدون نتیجه |
| `/sellers/[sellerSlug]` | Web | — | ویترین فروشگاه | Pet Parent | seller profile, offers | — | product | product detail (seller badge) | 1 | MISSING_REQUIRED_PAGE | — |
| `/checkout/payment/callback` | Web | — | بازگشت از درگاه | Pet Parent | gateway params | — | success / failure | درگاه | 1 | MISSING_REQUIRED_PAGE | تأیید دوباره، پرداخت ناموفق |
| `/checkout/failed` | Web | — | شکست پرداخت | Pet Parent | order | «تلاش مجدد» | checkout | callback | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/orders` | Web/Mobile | — | تاریخچهٔ سفارش | Pet Parent | orders | «خرید مجدد» | order detail | profile, success | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/orders/[orderId]` (+`/tracking`) | Web/Mobile | — | جزئیات و پیگیری | Pet Parent | order, seller orders, shipments | «ثبت نظر» / «پشتیبانی» | review, support | orders, success, notification | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/reorder` | Web/Mobile | فقط widget | Buy Again کامل | Pet Parent | replenishment | «افزودن همه» | cart | care widget | 1 | MISSING_REQUIRED_PAGE | — |
| `/dashboard/support` (+`/[ticketId]`) | Web | `support-drawer.tsx` | تیکت‌های کاربر | Pet Parent | tickets | «تیکت جدید» | order | order detail | 1 | MISSING_REQUIRED_PAGE | — |
| `/seller/apply` | Web | — | درخواست فروشندگی | Seller | KYC | «ارسال درخواست» | status | landing فروشنده | 1 | MISSING_REQUIRED_PAGE | — |
| `/seller` (layout + dashboard) | Seller Panel | `dashboard/seller/page.tsx` | جایگزین مسیر فعلی | Seller | KPI | — | زیرصفحه‌ها | login (نقش seller) | 1 | Needs redesign | — |
| `/seller/products`, `/seller/products/new`, `/seller/products/[id]` | Seller Panel | — | محصول/پیشنهاد | Seller | catalog, offers | «افزودن پیشنهاد» | inventory | seller nav | 1 | MISSING_REQUIRED_PAGE | — |
| `/seller/inventory` | Seller Panel | — | موجودی، کمبود | Seller | stock | «به‌روزرسانی» | products | dashboard KPI | 1 | MISSING_REQUIRED_PAGE | — |
| `/seller/orders`, `/seller/orders/[id]` | Seller Panel | — | سفارش‌ها | Seller | seller orders (بدون دادهٔ سلامت) | «پذیرش/ارسال» | — | dashboard, alert | 1 | MISSING_REQUIRED_PAGE | — |
| `/seller/settings` | Seller Panel | — | پروفایل، ساعات، محدودهٔ ارسال | Seller | store | «ذخیره» | — | nav | 1 | MISSING_REQUIRED_PAGE | — |
| `/seller/settlements` | Seller Panel | — | تسویه‌ها | Seller | settlements | — | — | nav | 1 | MISSING_REQUIRED_PAGE | — |
| `/admin` (layout + dashboard) | Admin | `dashboard/admin/page.tsx` | جایگزین مسیر فعلی | Admin | KPI | — | زیرصفحه‌ها | admin login | 1 | Needs redesign | — |
| `/admin/sellers` (+`/[id]`) | Admin | — | صف تأیید/تعلیق | Admin | applications | «تأیید/رد» | — | admin dashboard | 1 | MISSING_REQUIRED_PAGE | — |
| `/admin/products/moderation` | Admin | — | moderation | Admin | pending products | «تأیید» | — | dashboard | 1 | MISSING_REQUIRED_PAGE | — |
| `/admin/categories` | Admin | — | دسته‌ها | Admin | tree | — | — | — | 1 | MISSING_REQUIRED_PAGE | — |
| `/admin/orders` (+`/[id]`), `/admin/refunds` | Admin | — | عملیات سفارش و بازپرداخت | Admin/Support | orders | «لغو/بازپرداخت» | — | — | 1 | MISSING_REQUIRED_PAGE | — |
| `/admin/users`, `/admin/support`, `/admin/audit-log` | Admin | — | کاربران، تیکت‌ها، لاگ | Admin/Support | — | — | — | — | 1 | MISSING_REQUIRED_PAGE | — |
| `not-found.tsx`, `error.tsx`, `global-error.tsx`, `/unauthorized`, `/maintenance` | Shared | — | حالات سراسری | Shared | — | «بازگشت به خانه» | `/` | همه | 1 | MISSING_REQUIRED_PAGE | — |
| اپ موبایل (همهٔ صفحات بالا برای Pet Parent) | Mobile | `apps/mobile/` خالی | — | Pet Parent | — | — | — | — | 1 (اگر تصمیم شود) | MISSING_REQUIRED_PAGE | — |

### 4.3 نقشهٔ روابط ناوبری (هدف)

- `/` → `/dashboard/care` · `/` → `/shop` · `/` → `/shop/c/[categorySlug]` (آیکن‌های `dog.svg`, `cat.svg`, `food.svg`…) · `/` → `/shop/[productSlug]`
- `/dashboard/care` → `/dashboard/pets/[petId]` · → `/dashboard/reminders` · → `/dashboard/care/tasks/[taskId]` · → `/shop/[productSlug]` (از `smart-reorder-widget`) · → `/dashboard/reorder`
- `/dashboard/pets/[petId]` → `/health` · → `/vaccinations` · → `/medications` · → `/weight` · → `/dashboard/passport?petId=` · → `/shop?petId=`
- `/shop` → `/shop/[productSlug]` → `/cart` → `/checkout` → درگاه → `/checkout/payment/callback` → `/checkout/success` → `/dashboard/orders/[orderId]` → `/dashboard/orders/[orderId]/tracking`
- `/shop/[productSlug]` → `/sellers/[sellerSlug]` · → `/dashboard/subscriptions` (ساخت Autoship)
- `/dashboard/orders` → `/dashboard/orders/[orderId]` → «خرید مجدد» → `/cart`
- `/seller` → `/seller/orders` → `/seller/orders/[id]` · `/seller` → `/seller/inventory` (از KPI کمبود موجودی)
- `/admin` → `/admin/sellers` → `/admin/sellers/[id]` · `/admin` → `/admin/products/moderation` · `/admin` → `/admin/refunds`
- `/passport/[token]` → هیچ لینک داخلی به داده خصوصی؛ فقط CTA تماس امن و `sighting-location-modal`

---

## 5. Phase 1 Feature-to-Page Matrix

> **قاعدهٔ حالات (برای همهٔ ردیف‌ها الزامی):** هر صفحه باید `loading` (skeleton)، `empty` (با CTA)، `error` (با «تلاش مجدد»)، `offline/degraded`، `unauthorized` و در صورت نیاز `incomplete profile` داشته باشد. ستون «حالات خاص» فقط موارد ویژهٔ هر ماژول را می‌آورد. endpoint های زیر «پیشنهادی/استنباطی» هستند؛ وجود فایل router در ستون API ذکر شده، اما شکل دقیق endpoint ها → NEEDS_CODE_REVIEW.

| ماژول | صفحات / Routes | کامپوننت‌ها (موجود ✔ / لازم ✚) | API endpoints | Entities | نقش و مجوز | حالات خاص | نقاط ورود | معیار موفقیت |
|---|---|---|---|---|---|---|---|---|
| auth | `/login`, `/onboarding` | ✔ `otp-auth-modal.tsx` ✚ `OtpInput`, `PhoneInput` | `auth.py`: `POST /auth/otp/request`, `POST /auth/otp/verify`, `POST /auth/refresh`, `POST /auth/logout` | User, OtpChallenge, Session/RefreshToken | Public → Authenticated | کد منقضی، تلاش زیاد (429)، شمارهٔ نامعتبر | header، هر route محافظت‌شده | ورود < ۶۰ ثانیه؛ ۰ نشت توکن در localStorage |
| user account | `/dashboard/profile`, `/dashboard/addresses` | ✔ صفحهٔ profile ✚ `AddressForm` | `GET/PATCH /users/me`, `CRUD /users/me/addresses` | User, Address, ConsentRecord | owner only | پروفایل ناقص | avatar header | ویرایش و حذف حساب کار کند |
| pet profile | `/dashboard/pets`, `/new`, `/[petId]`, `/[petId]/edit` | ✔ `pet-onboarding-wizard.tsx` ✚ `PetProfileHeader`, `PetAvatar`, `ProfileCompleteness` | `pets.py`: `GET/POST /pets`, `GET/PATCH/DELETE /pets/{id}`, `POST /pets/{id}/photo` | Pet (species, breed, sex, birth_date/age_estimate, weight, energy_level, feeding_preference, allergies, health_notes, neuter_status) | owner + household (بعداً) | آپلود عکس ناموفق، نژاد نامشخص | care, switcher, home | ≥۷۰٪ کاربران ثبت‌نامی یک پت بسازند |
| pet switcher | سراسری در header/care/shop | ✔ `multi-pet-switcher.tsx`, `pet-context.tsx` | — (از `GET /pets`) | — | owner | بدون پت | همهٔ صفحات pet-aware | پت انتخابی در URL (`?petId=`) پایدار بماند |
| today dashboard | `/dashboard/care` | ✔ `today-care-dashboard.tsx` | `GET /care/today?pet_id=` | CareTask, CareTaskOccurrence | owner | بدون پت → onboarding؛ بدون تسک → پیشنهاد قالب | bottom nav, home teaser | DAU/WAU ≥ ۳۵٪ در پایلوت |
| care tasks | `/dashboard/care/tasks/[taskId]` | ✚ `CareTaskCard`, `TaskActionSheet` | `care.py`: `POST /care/tasks`, `PATCH /care/tasks/{id}`, `POST /care/occurrences/{id}/complete|skip|snooze` | CareTask (recurrence RRULE), Occurrence(status) | owner | تیک آفلاین و همگام‌سازی | care | انجام تسک idempotent |
| reminders | `/dashboard/reminders`, `/new`, `/[id]/edit` | ✚ `ReminderCard`, `RecurrencePicker` | `GET/POST/PATCH/DELETE /reminders` (یا یکپارچه با care) → NEEDS_CODE_REVIEW | Reminder, ReminderSchedule | owner | quiet hours | care, vaccination, medication | ≥۹۸٪ یادآورها سر وقت ارسال شوند |
| health timeline | `/dashboard/pets/[petId]/health` | ✚ `HealthTimelineItem`, `VerificationBadge` | `medical_records.py`: `GET /pets/{id}/health-timeline` | HealthRecord(type, source=owner_entered/provider_verified/imported) | owner only؛ **seller: ممنوع** | empty | pet profile | ۰ دسترسی غیرمالک در تست IDOR |
| vaccination | `/[petId]/vaccinations`, `/new` | ✚ `VaccinationForm` | `GET/POST /pets/{id}/vaccinations` | Vaccination(vaccine, date, next_due, clinic_name, source) | owner | تاریخ آینده/گذشته | health, care | ساخت خودکار reminder برای next_due |
| medication | `/[petId]/medications`, `/new` | ✚ `MedicationForm`, `DoseSchedule` | `GET/POST/PATCH /pets/{id}/medications` | Medication(name, dose, frequency, start, end) | owner | بدون نسخه؛ متن «جایگزین نظر دامپزشک نیست» | health | — |
| weight tracking | `/[petId]/weight` | ✚ `WeightChart`, `WeightEntryForm` | `GET/POST /pets/{id}/weights` | WeightRecord(kg, measured_at) | owner | یک نقطه داده | care, health | نمودار با ≥۲ نقطه |
| QR passport | `/dashboard/passport?petId=`, `/passport/[token]` | ✔ `owner-passport-manager.tsx`, `sighting-location-modal.tsx` ✚ `QrPassportCard`, `PublicFieldToggle` | `passport.py`: `GET /passport/{token}` (public), `PATCH /pets/{id}/passport`, `POST /pets/{id}/passport/rotate`, `POST /passport/{token}/sightings` | PassportToken(random ≥128bit, revoked_at), PublicFieldConfig, ScanLog, Sighting | public: فقط فیلدهای مجاز | token لغوشده، lost mode | pet profile | هیچ فیلد پزشکی در پاسخ عمومی |
| catalog | `/shop` | ✔ `shop-catalog-view.tsx` ✚ `ProductCard`, `FilterSheet` | `catalog.py`: `GET /catalog/products?species=&life_stage=&category=` | Product (canonical), Variant, Offer | public | بدون موجودی | home, nav | p95 < 800ms |
| product categories | `/shop/c/[categorySlug]` | ✚ `CategoryGrid` (آیکن‌های `public/icons/*`) | `GET /catalog/categories` | Category(tree, slug) | public | — | home icons | — |
| search | `/search?q=` | ✚ `SearchBar`, `SearchResults` | `GET /catalog/search?q=` | (index فارسی: نرمال‌سازی ی/ک) | public | بدون نتیجه با پیشنهاد | header | ≥۹۰٪ جستجوها نتیجه داشته باشند |
| product detail | `/shop/[productSlug]` | ✚ `VariantSelector`, `OfferList`, `CompatibilityBadge`, `SellerBadge` | `GET /catalog/products/{slug}`, `GET /catalog/products/{id}/offers` | Product, Variant(weight/flavor/size/color/packaging), Compatibility | public | همه offer ها ناموجود | shop, search, home, reorder | نرخ add-to-cart ≥ ۸٪ |
| seller offer | داخل product detail + `/seller/products/[id]` | ✚ `OfferRow`, `BuyBoxWinner` | Buy Box در `catalog.py` (`test_buy_box.py`) | Offer(seller_id, variant_id, price, stock, status) | seller: فقط offer خود | قیمت تغییرکرده | — | قانون Buy Box شفاف و مستند |
| cart | `/cart` | ✔ `cart-view.tsx`, `cart-context.tsx` ✚ `CartItem`, `SellerGroup` | `GET/POST/PATCH/DELETE /cart/items` (MISSING) | Cart, CartItem(offer_id) | owner/guest | ناموجود شدن آیتم | header icon | سبد در دستگاه‌های مختلف یکسان |
| checkout | `/checkout` | ✔ `checkout-view.tsx` ✚ `AddressSelector`, `DeliveryOptionPicker`, `OrderSummary` | `checkout.py`: `POST /checkout/quote`, `POST /checkout` (Idempotency-Key) | CheckoutSession, InventoryReservation (`test_inventory_reservation.py`) | authenticated | رزرو منقضی | cart | ۰ oversell |
| payment | `/checkout/payment/callback`, `/checkout/failed` | ✚ `PaymentStatus` | `payment.py`: `POST /payments/{order_id}/start`, `GET|POST /payments/callback`, `POST /payments/{id}/verify` | Payment(status, gateway_ref, amount_rial) | system | callback تکراری، تأیید دیرهنگام | checkout | ۱۰۰٪ پرداخت‌ها reconcile |
| order success | `/checkout/success?orderId=` | ✔ `checkout-success-view.tsx` | `GET /orders/{id}` | Order | owner | pending verify | callback | — |
| order tracking | `/dashboard/orders/[orderId]/tracking` | ✔ `live-courier-map.tsx` (فاز ۳) ✚ `OrderStatusTimeline` | `GET /orders/{id}/shipments` | Shipment(status, carrier, tracking_code) | owner | بدون کد رهگیری | order detail, notification | — |
| order history | `/dashboard/orders`, `/[orderId]` | ✚ `OrderCard` | `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel` | Order, SellerOrder, OrderItem | owner | — | profile | — |
| reorder | `/dashboard/reorder` + widget | ✔ `smart-reorder-widget.tsx` | `replenishment.py`: `GET /replenishment/due?pet_id=` | ReplenishmentEstimate | owner | داده کم | care, orders | ≥۲۰٪ خرید دوم در ۶۰ روز |
| Autoship foundation | `/dashboard/subscriptions` | ✔ صفحه + `lib/api/subscriptions.ts` | `subscriptions.py`: `GET/POST /subscriptions`, `POST /{id}/pause|skip|cancel`, `PATCH /{id}` | Subscription(status, interval, next_run_at) | owner | flag خاموش | product detail | pause/skip/cancel بدون تماس پشتیبانی |
| seller onboarding | `/seller/apply`, `/seller/apply/status` | ✚ `SellerApplicationForm`, `DocumentUpload` | `sellers.py`: `POST /sellers/applications`, `GET /sellers/applications/me` (`test_seller_kyc.py`) | Seller, SellerApplication, KycDocument | applicant | رد شده با دلیل | landing فروشنده | زمان تأیید < ۴۸ ساعت |
| seller dashboard | `/seller` | ✔ `seller-dashboard-view.tsx` ✚ `SellerKpiCard` | `GET /sellers/me/dashboard` | — | seller owner/staff | فروشندهٔ suspended | login | — |
| seller products | `/seller/products`, `/new`, `/[id]` | ✚ `ProductPicker` (اتصال به canonical)، `OfferForm` | `POST /sellers/me/offers`, `PATCH /sellers/me/offers/{id}`, `POST /sellers/me/product-requests` | Offer, ProductRequest | seller | محصول در صف moderation | seller nav | — |
| seller inventory | `/seller/inventory` | ✚ `InventoryTable`, `LowStockBadge` | `PATCH /sellers/me/offers/{id}/stock` (`test_seller_inventory_fulfillment.py`) | InventoryLevel, StockMovement | seller | — | KPI | دقت موجودی ≥ ۹۸٪ |
| seller orders | `/seller/orders`, `/[id]` | ✚ `SellerOrderTable` | `GET /sellers/me/orders`, `POST /sellers/me/orders/{id}/accept|reject|ship` | SellerOrder(state machine) | seller؛ **بدون Pet health** | SLA نزدیک | alert | پذیرش سفارش < ۲ ساعت کاری |
| admin dashboard | `/admin` | ✔ `admin-panel-view.tsx` ✚ `AdminDataTable` | `admin.py`: `GET /admin/metrics` | — | admin (scoped) | — | admin login | — |
| seller verification | `/admin/sellers`, `/[id]` | ✚ `VerificationQueue` | `POST /admin/sellers/{id}/approve|reject|suspend` | SellerApplication, AuditLog | admin | — | admin dashboard | هر تصمیم در AuditLog |
| product moderation | `/admin/products/moderation` | ✚ `ModerationCard` | `POST /admin/products/{id}/approve|reject` | ProductRequest, Product.status | admin/moderator | — | admin dashboard | — |
| support / operations | `/dashboard/support`, `/admin/support`, `/admin/orders`, `/admin/refunds` | ✔ `support-drawer.tsx` ✚ `TicketThread` | `POST /support/tickets`, `GET /admin/support/tickets`, `POST /admin/orders/{id}/refund` (`test_admin_disputes.py`) | SupportTicket, Dispute, Refund | support/finance | — | order detail | پاسخ اول < ۴ ساعت کاری |
| notifications | `/dashboard/settings/notifications`, `/dashboard/notifications` | ✚ `NotificationItem`, `PreferenceToggle` | `GET/PATCH /notifications/preferences`, `GET /notifications` | Notification, Preference, DeliveryLog | owner | quiet hours | profile | ۰ پیامک تکراری |
| design system | — | ✔ `tailwind.config.ts`, `globals.css`, `lib/utils.ts` ✚ `components/ui/*` | — | — | — | — | — | همهٔ صفحات فقط از primitives استفاده کنند |
| RTL / accessibility | — | ✔ `layout.tsx` (؟) | — | — | — | اعداد فارسی، تاریخ شمسی | — | WCAG 2.2 AA روی ۱۰ جریان اصلی |
| analytics | — | ✔ `lib/analytics.ts` | `analytics.py`: `POST /analytics/events` | AnalyticsEvent | system | consent خاموش | — | ۳۸ رویداد اجباری فاز ۱ ارسال شوند |

---

## 6. Cross-Linking and Navigation Gaps

| # | نوع شکاف | شرح | Severity | Phase | اثر روی کاربر | لینک/Route پیشنهادی دقیق | پیش‌نیاز |
|---|---|---|---|---|---|---|---|
| G1 | Checkout path break | صفحهٔ جزئیات محصول وجود ندارد؛ `featured-products-row.tsx` و `shop-catalog-view.tsx` به جایی برای انتخاب variant لینک نمی‌دهند | Critical | 1 | انتخاب وزن/طعم و مقایسهٔ فروشنده ناممکن | `src/app/shop/[productSlug]/page.tsx` + لینک از `ProductCard` | API `GET /catalog/products/{slug}` |
| G2 | Checkout path break | callback پرداخت route ندارد | Critical | 1 | پرداخت بدون تأیید سرور | `src/app/checkout/payment/callback/page.tsx` → `/checkout/success?orderId=` یا `/checkout/failed` | انتخاب درگاه |
| G3 | Orphan / dead-end | `/checkout/success` به جزئیات سفارش نمی‌رسد چون `/dashboard/orders/[orderId]` نیست | Critical | 1 | کاربر سفارشش را گم می‌کند | `src/app/dashboard/orders/[orderId]/page.tsx` | Order API |
| G4 | Ambiguous route | `/dashboard/tracking` شناسهٔ سفارش ندارد | High | 1 | کدام سفارش؟ | `/dashboard/orders/[orderId]/tracking`؛ `/dashboard/tracking` → redirect به لیست سفارش‌ها | G3 |
| G5 | Care-flow break | پروفایل پت route ندارد؛ هاب «Pet Profile First» غایب است | Critical | 1 | سلامت/پاسپورت/خرید به پت وصل نمی‌شود | `src/app/dashboard/pets/[petId]/page.tsx` | `pets.py` |
| G6 | Care-flow break | Health Timeline، واکسن، دارو، وزن صفحه ندارند در حالی که `medical_records.py` هست | Critical | 1 | API بدون UI | `/dashboard/pets/[petId]/{health,vaccinations,medications,weight}` | G5 |
| G7 | Care-flow break | مرکز یادآور و ترجیحات اعلان صفحه ندارند | High | 1 | کنترل اعلان ناممکن | `/dashboard/reminders`, `/dashboard/settings/notifications` | Notification model |
| G8 | Missing deep link | ورود فقط مودال است | High | 1 | لینک پیامکی/ایمیلی به صفحات محافظت‌شده نمی‌تواند redirect کند | `/login?next=/dashboard/orders/123` + `middleware.ts` | auth-context |
| G9 | Role boundary | seller و admin زیر `/dashboard/*` با shell مشتری | High | 1 | نشت UI/نقش؛ ناوبری مخلوط | route group های `src/app/(seller)/seller/*` و `src/app/(admin)/admin/*` با `layout.tsx` و guard سرور | مدل نقش |
| G10 | Seller-flow break | پنل فروشنده یک view است؛ محصولات/موجودی/سفارش زیرصفحه ندارند | High | 1 | مدیریت روزانه ناممکن در مقیاس | `/seller/{products,inventory,orders,settings,settlements}` | `sellers.py` |
| G11 | Seller-flow break | ورود فروشندهٔ جدید (apply) وجود ندارد | Critical | 1 | جذب فروشنده = هدف اول کسب‌وکار | `/seller/apply`, `/seller/apply/status` | `test_seller_kyc.py` API |
| G12 | Admin-flow break | صف تأیید، moderation، refund، کاربران، audit صفحه ندارند | High | 1 | عملیات دستی خارج از سیستم | `/admin/{sellers,products/moderation,categories,orders,refunds,users,support,audit-log}` | admin API |
| G13 | Missing counterparts | دسته و جستجو صفحه ندارند؛ آیکن‌های دسته در `public/icons` بی‌مقصدند | High | 1 | کشف محصول ضعیف | `/shop/c/[categorySlug]`, `/search` | Category API |
| G14 | Orphan pages (premature) | `/vets`, `/vets/[id]`, `/dashboard/appointments`, `/adopt` | Medium | 2/4 | کاربر وارد قابلیت ناقص/بدون تأیید می‌شود | پشت feature flag؛ حذف از `desktop-header.tsx` و `mobile-bottom-nav.tsx` | flag system |
| G15 | Duplicate flows | ادعای «Buy Again» هم در `smart-reorder-widget` و هم در `subscriptions`؛ مسیر واحد نیست | Medium | 1 | سردرگمی خرید مجدد vs اشتراک | widget → `/dashboard/reorder`؛ Autoship فقط از product detail و reorder | — |
| G16 | Missing global states | `not-found.tsx`, `error.tsx`, `global-error.tsx`, `loading.tsx` در `src/app/` نیستند | High | 1 | صفحهٔ خطای انگلیسی پیش‌فرض Next | ساخت هر ۴ فایل در `src/app/` با متن فارسی | design system |
| G17 | Missing back-navigation | بدون layout تودرتو، breadcrumb/back در موبایل تضمینی نیست | Medium | 1 | گیر افتادن در جریان‌های عمیق | `components/layout/page-header.tsx` با دکمهٔ بازگشت RTL (فلش راست) | — |
| G18 | Missing mobile counterpart | `apps/mobile` خالی | Medium (اگر PWA پذیرفته شود) / High (اگر اپ لازم باشد) | 1 | نوتیف push بومی ممکن نیست | تصمیم: PWA در فاز ۱ + Expo در فاز ۱.۵ | NEEDS_FOUNDER_DECISION |
| G19 | Public QR leakage path | `/passport/[token]` نباید به `/dashboard/*` لینک دهد؛ نیاز به بررسی | High | 1 | نشت داده | فقط CTA تماس امن | NEEDS_CODE_REVIEW |
| G20 | Missing support entry | `support-drawer.tsx` به سفارش مشخص متصل نیست | Medium | 1 | تیکت بی‌زمینه | دکمهٔ «مشکل در سفارش» در `/dashboard/orders/[orderId]` → `/dashboard/support/new?orderId=` | Ticket API |

---

## 7. API and Data Ownership Map

| Domain | Existing Files | Existing / Implied Endpoints | Required Client Screens | Entities | Sensitive Data | Missing APIs | Phase | Notes |
|---|---|---|---|---|---|---|---|---|
| auth | `api/v1/auth.py`, `core/security.py`, `services/sms.py`, `tests/test_auth_otp.py` | OTP request/verify (implied) | `/login`, modal | User, OtpChallenge | شماره تلفن | refresh/logout/revoke sessions، `GET /auth/sessions` | 1 | rate limit per phone+IP |
| users | `models/user.py` | `/users/me` (implied) | `/dashboard/profile` | User, Address, Consent | PII | addresses CRUD، `DELETE /users/me`، export | 1 | — |
| pets | `api/v1/pets.py`, `models/pet.py`, `tests/test_pets_crud_security.py` | CRUD | pets, profile, switcher | Pet, PetPhoto | عکس، سلامت | photo upload به S3 با presigned URL | 1 | ✔ تست IDOR |
| health records | `api/v1/medical_records.py`, `tests/test_medical_records.py` | records CRUD (implied) | health, vaccinations, medications, weight | HealthRecord, Vaccination, Medication, WeightRecord | **بسیار حساس** | timeline aggregate، `source`/`verification_state` | 1 | جدایی مدل → NEEDS_CODE_REVIEW |
| reminders | `api/v1/care.py`, `tests/test_care_tasks.py` | care tasks | care, reminders | CareTask, Reminder | کم | snooze/skip/reschedule، reminder CRUD | 1 | worker زمان‌بند → MISSING |
| notifications | `services/sms.py`, `tests/test_sms_dispatcher.py` | — | settings/notifications | Notification, Preference, Log | شماره | preferences، inbox، push token | 1 | push/web-push → MISSING |
| catalog | `api/v1/catalog.py`, `models/catalog.py`, `tests/test_catalog_models.py` | list/detail | shop, category, search, PDP | Product, Category, Compatibility | — | categories، search، slug lookup | 1 | — |
| product variants | `models/catalog.py` (فرض) | — | PDP | Variant | — | variant attributes API | 1 | NEEDS_CODE_REVIEW |
| seller offers | `models/catalog.py`, `tests/test_buy_box.py` | Buy Box | PDP, seller products | Offer | قیمت خرید فروشنده | `/sellers/me/offers` | 1 | ✔ |
| inventory | `api/v1/sellers.py`, `api/v1/checkout.py`, `tests/test_inventory_reservation.py`, `test_seller_inventory_fulfillment.py` | reservation | seller inventory | InventoryLevel, Reservation | — | stock movements، low-stock | 1 | ✔ رزرو |
| carts | `context/cart-context.tsx` (کلاینت) | — | cart | Cart, CartItem | — | **کل API سبد** | 1 | MISSING |
| orders | `models/order.py`, migration `2a5b5c0fa7d7_*` | create (via checkout) | orders, detail | Order, SellerOrder, OrderItem | آدرس | list/detail/cancel؛ split per seller | 1 | NEEDS_CODE_REVIEW split |
| payments | `api/v1/payment.py`, `services/payment.py`, `tests/test_payment.py` | start/callback (implied) | callback, failed | Payment, PaymentAttempt | تراکنش | reconcile، refund به درگاه | 1 | idempotency |
| shipments | `api/v1/logistics.py`, `models/logistics.py`, `tests/test_logistics_dispatch.py` | dispatch | tracking | Shipment, DispatchJob | آدرس، مکان پیک | per-SellerOrder shipment | 1/3 | live map = فاز ۳ |
| reviews | — | — | PDP، order detail | Review(verified_purchase) | — | **همه** | 1 | MISSING |
| reorder | `api/v1/replenishment.py`, `services/replenishment.py`, `tests/test_replenishment.py` | due estimates | reorder, widget | ReplenishmentEstimate | عادت خرید | `POST /reorder/{order_id}` → cart | 1 | ✔ |
| Autoship | `api/v1/subscriptions.py`, `models/subscription.py`, `tests/test_subscriptions.py`, `lib/api/subscriptions.ts` | CRUD (implied) | subscriptions | Subscription, SubscriptionRun | روش پرداخت | pause/skip/run log | 1 (flag) / 3 | بدون migration |
| sellers | `api/v1/sellers.py`, `tests/test_seller_kyc.py` | KYC | apply, seller panel | Seller, KycDocument, SellerStaff | **مدارک هویتی** | staff، store settings، service area | 1 | مدارک در storage خصوصی |
| settlements | `api/v1/settlements.py`, `models/settlement.py`, `tests/test_vendor_settlement.py` | — | `/seller/settlements`, `/admin/finance` | Settlement, Payout, Commission | مالی | payout export | 1 | بدون migration |
| admin | `api/v1/admin.py`, `tests/test_admin_disputes.py` | disputes | `/admin/*` | — | همه | sellers approve، moderation، users | 1 | scope+audit |
| support | `components/support/support-drawer.tsx` | — | support | SupportTicket, Dispute | محتوای پیام | ticket CRUD | 1 | MISSING backend |
| audit logs | `tests/test_security_idor_audit.py` | — | `/admin/audit-log` | AuditLog(actor, action, target, ip, at) | — | read API، append-only | 1 | مدل → MISSING/UNKNOWN |
| QR passport | `api/v1/passport.py`, `api/v1/amber_alert.py`, `tests/test_passport_emergency.py`, `test_amber_alert.py` | public view, sightings | passport pages | PassportToken, ScanLog, Sighting | مکان یابنده | rotate/revoke، scan log | 1 | ✔ |
| vets / services | `api/v1/vets.py`, `api/v1/services.py`, `models/vet.py` | booking | vets, appointments | Provider, Booking | سلامت | — | 2/3 | پیش‌ساخته؛ freeze |
| loyalty | `api/v1/loyalty.py`, `models/loyalty.py` | points | paw-points-widget | LoyaltyLedger | — | — | 3 | freeze |
| NFC / adoption / AI / WMS | `api/v1/nfc.py`, `adoption.py`, `ai_copilot.py`, `wms_webhooks.py` | — | `/adopt`, copilot drawer | NfcTag, AdoptionListing | AI prompt شامل سلامت | — | 4 | freeze؛ از router اصلی جدا شود |
| health check | `api/v1/health.py`, `tests/test_health.py` | `/health` (احتمالی) | — | — | — | `/ready` با چک DB | Shared | — |

---

## 8. Design System and UI Inventory

> مکان پیشنهادی مشترک: `packages/ui/src/primitives/*` (بی‌نیاز از دامنه) و `packages/ui/src/bonyo/*` (کامپوننت‌های دامنه‌ای Bonyo Care System). توکن‌ها: `packages/tokens/src/tokens.ts` → خروجی برای `tailwind.config.ts` (web) و NativeWind (mobile). تا ساخت پکیج، مسیر موقت: `apps/web/src/components/ui/*`.

| آیتم | وضعیت | Path فعلی | مکان پیشنهادی | اولویت فاز ۱ | یادداشت |
|---|---|---|---|---|---|
| Tokens | Partial | `apps/web/tailwind.config.ts`, `src/app/globals.css`, `docs/10-design-system.md` | `packages/tokens` | P0 | deep teal، forest، navy، gold، ivory، terracotta، success/warning/critical باید نام semantic داشته باشند (`--color-action-primary` نه `--teal-700`) |
| Colors | Partial / UNKNOWN | همان | `packages/tokens` | P0 | کنتراست AA برای teal روی ivory بررسی شود |
| Typography | UNKNOWN_FROM_STRUCTURE | `layout.tsx` | `packages/tokens` | P0 | فونت فارسی (Vazirmatn/IRANSansX) در `node_modules` دیده نمی‌شود؛ احتمالاً `next/font` یا فایل محلی |
| RTL support | UNKNOWN_FROM_STRUCTURE | `layout.tsx` | — | P0 | استفاده از logical properties (`ms-*`, `pe-*`)؛ آیکن جهت‌دار mirror شود |
| Layout primitives (Stack, Container, PageHeader) | Missing | — | `packages/ui/primitives` | P0 | — |
| Button | Missing (فقط `cva` نصب) | — | `primitives/button.tsx` | P0 | — |
| Input / Textarea | Missing | — | `primitives/input.tsx` | P0 | ورودی ارقام فارسی↔لاتین |
| Select | Missing | — | `primitives/select.tsx` | P0 | Radix نصب نیست |
| Date / time picker | Missing | — | `primitives/date-picker.tsx` | P0 | تقویم شمسی الزامی (واکسن/دارو/یادآور) |
| Card | Missing | — | `primitives/card.tsx` | P0 | — |
| Table | Missing | — | `primitives/table.tsx` | P0 (seller/admin) | — |
| Chart | Missing | — | `primitives/chart.tsx` | P1 | نمودار وزن، KPI فروشنده |
| Dialog | Partial | `otp-auth-modal.tsx`, `sighting-location-modal.tsx` (سفارشی) | `primitives/dialog.tsx` | P0 | focus trap و Esc → NEEDS_CODE_REVIEW |
| Drawer | Partial | `bonyo-copilot-drawer.tsx`, `support-drawer.tsx` | `primitives/drawer.tsx` | P0 | — |
| Bottom sheet | Missing | — | `primitives/bottom-sheet.tsx` | P0 | فیلتر، اقدام تسک در موبایل |
| Toast | Missing | — | `primitives/toast.tsx` | P0 | add-to-cart، task done |
| Loading skeleton | Missing | — | `primitives/skeleton.tsx` | P0 | — |
| Empty state | Missing | — | `bonyo/empty-state.tsx` | P0 | تصویرسازی گونه‌ها از `public/icons/*` |
| Error state | Missing | — | `bonyo/error-state.tsx` | P0 | — |
| Status badge | Missing | — | `primitives/badge.tsx` | P0 | وضعیت سفارش/فروشنده/verification |
| Pet Avatar | Partial (احتمالاً داخل switcher) | `multi-pet-switcher.tsx` | `bonyo/pet-avatar.tsx` | P0 | fallback آیکن گونه |
| Product Card | Partial (inline) | `featured-products-row.tsx`, `shop-catalog-view.tsx` | `bonyo/product-card.tsx` | P0 | برچسب سازگاری با پت |
| Seller Badge | Missing | — | `bonyo/seller-badge.tsx` | P0 | «فروشندهٔ تأییدشده» |
| Care Task Card | Partial (inline) | `today-care-dashboard.tsx` | `bonyo/care-task-card.tsx` | P0 | — |
| Reminder Card | Missing | — | `bonyo/reminder-card.tsx` | P0 | — |
| Health Timeline Item | Missing | — | `bonyo/health-timeline-item.tsx` | P0 | badge `owner_entered`/`provider_verified`/`imported` |
| Cart Item | Partial (inline) | `cart-view.tsx` | `bonyo/cart-item.tsx` | P0 | — |
| Order Status Timeline | Missing | — | `bonyo/order-status-timeline.tsx` | P0 | جایگزین `live-courier-map` در فاز ۱ |
| QR Passport Card | Partial | `owner-passport-manager.tsx` | `bonyo/qr-passport-card.tsx` | P0 | چاپی/قابل دانلود |
| Admin Data Table | Missing | `admin-panel-view.tsx` (تک view) | `bonyo/admin-data-table.tsx` | P0 | فیلتر، صفحه‌بندی سرور |
| Seller KPI Card | Partial (inline) | `seller-dashboard-view.tsx` | `bonyo/seller-kpi-card.tsx` | P1 | — |
| Navigation | Exists | `layout/desktop-header.tsx`, `layout/mobile-bottom-nav.tsx` | `apps/web/src/components/layout` | P0 | nav جدا برای seller/admin → Missing |
| Icons | Exists | `lucide-react@0.475`, `public/icons/*` | — | — | — |

---

## 9. 3D Island Asset and Feature Map

> **شواهد:** `three@0.186.1`، `@types/three` (به‌همراه وابستگی‌های تایپی `@dimforge/rapier3d-compat`, `@tweenjs/tween.js`, `meshoptimizer`, `fflate` — این‌ها احتمالاً فقط وابستگی `@types/three` هستند نه استفادهٔ واقعی). **هیچ فایل `.glb`, `.gltf`, `.ktx2`, `.hdr` یا texture وجود ندارد**؛ بنابراین صحنهٔ فعلی یا procedural است یا ناقص → NEEDS_CODE_REVIEW. سند مرجع: `docs/13-3d-island-asset-map.md`.

| Asset Path | Asset Type | Intended Zone | Bonyo Feature | Phase | Usability | 2D Fallback Needed | Performance Risk | Notes |
|---|---|---|---|---|---|---|---|---|
| `apps/web/src/components/home/three-island-canvas.tsx` | three.js scene | کل جزیره | Brand/Home | 1 (اختیاری) | Unknown | بله | متوسط-زیاد (موبایل ارزان) | بدون R3F؛ مدیریت dispose، `prefers-reduced-motion` |
| `apps/web/src/components/home/island-progressive-container.tsx` | Loader | — | Progressive enhancement | 1 | Usable (اسمی) | خود fallback را مدیریت می‌کند | کم | باید: WebGL check، `saveData`، dynamic import |
| `apps/web/src/components/home/hero-island-banner.tsx` | UI | — | Hero | 1 | Usable | — | کم | — |
| `apps/web/public/icons/bonnivo-floating-island.svg` | SVG | کل جزیره | 2D fallback | 1 | Usable | خودش fallback است | کم | hotspot های قابل کلیک ندارد (فرض) |
| `icons/bonnivo-floating-island.svg` | SVG (تکراری) | — | — | — | Obsolete | — | — | حذف |
| `public/icons/{dog,cat,birds,small-pets,all}.svg/png` | آیکن | Pet Home | Pet Profile / species | 1 | Usable | — | کم | — |
| `public/icons/food.svg/png` | آیکن | Food Zone | Feeding / Reorder | 1 | Usable | — | کم | — |
| `public/icons/health.svg/png` | آیکن | Clinic | Health Timeline | 1 | Usable | — | کم | — |
| `public/icons/toys.svg/png` | آیکن | Park / Store | Daily Care / Commerce | 1 | Usable | — | کم | — |
| — (MISSING) | GLB zone | Pet Home → Pet Profile | `/dashboard/pets/[petId]` | 1 | — | بله: کارت پت | — | فراداده لازم: `zoneId`, `route`, `ariaLabel`, `lod`, `sizeKb` |
| — (MISSING) | GLB zone | Clinic → Health / Vaccination | `/dashboard/pets/[petId]/health` | 1 | — | بله | — | — |
| — (MISSING) | GLB zone | Store → Commerce | `/shop` | 1 | — | بله | — | — |
| — (MISSING) | GLB zone | Food Zone → Feeding / Reorder | `/dashboard/reorder` | 1 | — | بله | — | — |
| — (MISSING) | GLB zone | Park → Daily Care | `/dashboard/care` | 1 | — | بله | — | — |
| — (MISSING) | GLB zone | Passport Station → QR | `/dashboard/passport` | 1 | — | بله | — | — |
| — (MISSING) | GLB zone | Training Center | provider directory | 2 | Locked state | بله | — | نمایش «به‌زودی» بدون لینک |
| — (MISSING) | GLB zone | Boarding Hotel | boarding search | 3 | Locked | بله | — | — |
| — (MISSING) | GLB zone | Event Venue | events | 3 | Locked | بله | — | — |
| — (MISSING) | GLB zone | Community Hub | community | 4 | Locked | بله | — | — |

**قواعد:** بودجهٔ کل ≤ ۲.۵MB gzip، lazy بعد از LCP، فقط در `/`؛ هرگز در `/cart`, `/checkout`, فرم‌های سلامت، `/passport/[token]`, `/seller/*`, `/admin/*`. هر zone باید معادل 2D قابل دسترس با کیبورد داشته باشد.

---

## 10. Document 1 Final Summary

**قوی‌ترین بخش‌ها:** پوشش API بک‌اند (۲۴ router با ۲۹ تست هم‌نام)، مدل Buy Box (`test_buy_box.py`)، رزرو موجودی (`test_inventory_reservation.py`)، تست امنیت IDOR (`test_pets_crud_security.py`, `test_security_idor_audit.py`)، پاسپورت اضطراری (`passport.py` + `/passport/[token]`)، الگوی progressive 3D، مستندات شماره‌دار `docs/01…13`، و حاکمیت عاملی (`.agents`, `.bonyo`).

**شکننده‌ترین بخش‌ها:** (۱) فرانت روی mock (`data/mock-*.ts`)، (۲) فقدان صفحهٔ جزئیات محصول و سفارش، (۳) ۲ migration برای ۱۲ مدل، (۴) `bonnivo.db` در ریپو، (۵) seller/admin به‌صورت تک‌فایل زیر `/dashboard`، (۶) نبود CI و `.env.example`، (۷) E2E احتمالاً غیرقابل اجرا، (۸) mobile خالی، (۹) گزارش‌های تکمیل خودساخته.

**آمادهٔ فاز ۱ با اطمینان بالا (پس از code review):** auth OTP، pets CRUD، care tasks، passport عمومی، catalog + Buy Box، inventory reservation، replenishment.

**نیازمند تصمیم بنیان‌گذار:** نام برند (Bonyo/Bonnivo)، درگاه پرداخت، مدل fulfillment، PWA یا اپ بومی، دامنهٔ Autoship در لانچ، سرنوشت ماژول‌های پیش‌ساخته، مدل کمیسیون/تسویه.

**مشکوک به منسوخ/تکراری:** `icons/` (root)، `structure.txt`, `folder-structure.txt`, `apps/backend/bonnivo.db`, `apps/web/tsconfig.tsbuildinfo`, `apps/backend/main.py` (در برابر `src/main.py`), `apps/web/src/data/mock-*.ts` (در production), `.bonyo/audits/phase-{2,3,4}-*.md`, `.bonyo/reports/phase-2-3-4-completion-report.md`, `docs/roadmap/phase-2-3-4-checklist.md` (تعریف قدیم).

**نیازمند code review:** `core/security.py`, `context/auth-context.tsx` (محل توکن)، `models/order.py` (split)، `models/pet.py` (تفکیک سلامت)، `api/v1/medical_records.py` (کنترل دسترسی)، `api/v1/passport.py` (فیلتر فیلد عمومی)، `api/v1/ai_copilot.py` (ادعای پزشکی)، `services/payment.py` (idempotency/verify)، `src/main.py` (ثبت router ها)، `migrations/versions/*` در برابر `models/*`.

### Top 20 route / feature / file mapping actions
1. ساخت `apps/web/src/app/shop/[productSlug]/page.tsx` + `ProductCard` لینک‌دار.
2. ساخت `apps/web/src/app/dashboard/pets/[petId]/page.tsx` به‌عنوان هاب پت.
3. ساخت `/dashboard/pets/[petId]/{health,vaccinations,medications,weight}` روی `medical_records.py`.
4. ساخت `/checkout/payment/callback` و `/checkout/failed`.
5. ساخت `/dashboard/orders` و `/dashboard/orders/[orderId]` (+`/tracking`)؛ redirect `/dashboard/tracking`.
6. انتقال `/dashboard/seller` به `src/app/(seller)/seller/*` با layout و guard.
7. انتقال `/dashboard/admin` به `src/app/(admin)/admin/*`.
8. ساخت `/seller/apply` روی API KYC.
9. ساخت `/admin/sellers` و `/admin/products/moderation`.
10. ساخت `/login?next=` و `apps/web/src/middleware.ts`.
11. ساخت `not-found.tsx`, `error.tsx`, `global-error.tsx`, `loading.tsx`.
12. جایگزینی `data/mock-*.ts` با `packages/api-client`؛ حذف `lib/api/*` تکراری.
13. تولید migration برای ۸ مدل بدون migration؛ حذف `bonnivo.db`.
14. API سبد سمت سرور و اتصال `cart-context.tsx`.
15. ساخت `/dashboard/reminders` و `/dashboard/settings/notifications`.
16. ساخت `/shop/c/[categorySlug]` و `/search`.
17. feature flag برای `vets`, `appointments`, `adopt`, `ai_copilot`, `nfc`, `loyalty`, `live-courier-map`, `wms_webhooks`.
18. ساخت `packages/ui` و `packages/tokens`.
19. حذف `icons/` root، `structure.txt`, `tsconfig.tsbuildinfo`؛ به‌روزرسانی `.gitignore`.
20. یکپارچه‌سازی `apps/backend/main.py` و `src/main.py`.
