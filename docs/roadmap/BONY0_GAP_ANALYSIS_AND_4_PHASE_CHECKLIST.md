# BONY0_GAP_ANALYSIS_AND_4_PHASE_CHECKLIST.md
**محصول:** بونیو (Bonyo) · **مبنا:** `folder-structure.txt` + `BONY0_FEATURE_FILE_MAP.md` · **تاریخ:** 2026-10-01

> برچسب‌های عدم قطعیت: `UNKNOWN_FROM_STRUCTURE` · `NEEDS_CODE_REVIEW` · `NEEDS_FOUNDER_DECISION`. هیچ ادعای «کار می‌کند» بر اساس نام فایل داده نشده است.

---

## 1. Product Philosophy and Working Model (قانون اساسی محصول)

**۱.۱ بونیو فروشگاه هوشمندی است که هر پت را می‌شناسد.** ما «یک فروشگاه آنلاین دیگر» نیستیم. تفاوت ما این است که قبل از نشان دادن محصول، می‌دانیم این محصول برای کدام حیوان است: گربهٔ ۳ ساله، عقیم‌شده، با حساسیت به مرغ. اگر یک قابلیت این دانش را تقویت نکند، اولویت ندارد.

**۱.۲ Pet Profile First.** هر داده‌ای که ساخته می‌شود (سفارش، یادآور، واکسن، وزن، اسکن QR، Autoship و در آینده رزرو و پانسیون) باید `pet_id` داشته باشد یا آگاهانه نداشته باشد. در کد فعلی، `pet-context.tsx` و `multi-pet-switcher.tsx` نقطهٔ شروع درست‌اند؛ اما نبود `/dashboard/pets/[petId]` یعنی هاب مرکزی هنوز ساخته نشده. **قانون:** هیچ صفحهٔ مراقبتی یا سلامتی بدون پت انتخاب‌شده رندر نمی‌شود؛ صفحهٔ فروشگاه بدون پت رندر می‌شود اما با پت شخصی‌سازی می‌شود.

**۱.۳ کاربرد روزانه قبل از تجارت تهاجمی.** دلیل بازگشت روزانهٔ کاربر «امروز» است (غذا، دارو، واکسن، وزن)، نه تخفیف. داشبورد امروز نباید با بنر تبلیغاتی پر شود؛ حداکثر یک کارت «خرید مجدد» که با دادهٔ واقعی مصرف توضیح داده شود.

**۱.۴ تجارت از فاز ۱ اجباری است.** بونیو از روز اول باید سفارش واقعی، پول واقعی و فروشندهٔ واقعی داشته باشد. اپ مراقبتی بدون درآمد یک پروژهٔ جانبی است. بنابراین مسیر `/shop → /shop/[productSlug] → /cart → /checkout → callback → /checkout/success → /dashboard/orders/[orderId]` مسیر بحرانی فاز ۱ است و در حال حاضر **دو حلقهٔ آن (PDP و callback) و یک انتهای آن (جزئیات سفارش) وجود ندارد.**

**۱.۵ پت‌شاپ‌ها شریک‌اند، نه تأمین‌کنندهٔ ناشناس موجودی.** فروشنده هویت، ویترین (`/sellers/[sellerSlug]`)، ساعات کاری، محدودهٔ ارسال و شاخص عملکرد دارد. Buy Box (`test_buy_box.py`) باید شفاف باشد: کاربر بداند چرا این فروشنده پیشنهاد اول است (قیمت، موجودی، SLA، فاصله). فروشنده باید بداند چرا برنده یا بازنده شده.

**۱.۶ خرید تکراری، نه سفارش یک‌باره.** شاخص موفقیت فاز ۱ «خرید دوم در ۶۰ روز» است، نه GMV ماه اول. `replenishment.py` و `smart-reorder-widget.tsx` قلب این استراتژی‌اند. Autoship فقط وقتی فعال می‌شود که پرداخت، موجودی و ارسال قابل اعتماد باشند؛ تا آن موقع پشت feature flag.

**۱.۷ سوابق سلامت خصوصی‌اند و هرگز به فروشنده نمایش داده نمی‌شوند.** فروشنده فقط می‌بیند: اقلام سفارش، آدرس ارسال (حداقلی)، نام گیرنده، شماره تماس پوشیده‌شده. فروشنده نمی‌بیند: نام پت، نژاد، حساسیت، دارو، واکسن، وزن، یادداشت سلامت. حتی «این سفارش برای گربه با حساسیت است» برای فروشنده قابل مشاهده نیست. این قانون باید در `apps/backend/src/core/security.py`، schema های پاسخ seller و تست خودکار اجرا شود، نه فقط در UI.

**۱.۸ Care-to-commerce باید قابل توضیح و غیرفریبنده باشد.** هر پیشنهاد محصول یک برچسب «چرا؟» دارد: «مناسب گربهٔ بالغ»، «۱۲ روز تا تمام شدن کیسهٔ قبلی»، «قبلاً خریده‌اید». ممنوع: «دامپزشکان توصیه می‌کنند» بدون منبع، ادعای درمانی، شمارش معکوس جعلی، «فقط ۲ عدد باقی مانده» غیرواقعی، و استفاده از دادهٔ سلامت برای قیمت‌گذاری.

**۱.۹ اعتماد بر حجم قابلیت مقدم است.** فروشندهٔ تأییدشده، قیمت شفاف (شامل هزینهٔ ارسال قبل از پرداخت)، موجودی قابل اعتماد (رزرو موجودی + همگام‌سازی)، و کیفیت عملیات (SLA پذیرش سفارش، بازپرداخت سریع) مهم‌تر از ۲۴ router است. ریپوی فعلی بیش از حد پهن شده (`nfc`, `adoption`, `ai_copilot`, `wms_webhooks`) در حالی که صفحهٔ جزئیات محصول ندارد. **این اولویت باید برعکس شود.**

**۱.۱۰ 3D لایهٔ premium اختیاری است، هرگز وابستگی عملکردی.** `island-progressive-container.tsx` الگوی درست است. هر کاری که در 3D ممکن است، در 2D هم ممکن است. 3D فقط در `/`؛ هرگز در cart، checkout، فرم سلامت، QR اضطراری، پنل فروشنده یا ادمین.

**۱.۱۱ باریک و قابل اعتماد، نه پهن و ناقص.** یک شهر، ۱–۲ گونه، ۵–۱۵ فروشندهٔ منتخب، ۴–۶ دستهٔ محصول. هر ماژول تا حالات loading/empty/error/unauthorized و تست E2E کامل نشده، «انجام‌شده» نیست. گزارش‌های `.bonyo/reports/*-completion-report.md` معیار «انجام‌شده» نیستند؛ launch gate این سند معیار است.

**۱.۱۲ هر فاز آینده به پروفایل پت وصل می‌شود.** رزرو دامپزشک (فاز ۲) سابقهٔ واکسن را با رضایت می‌خواند؛ پانسیون (فاز ۳) eligibility را از واکسن‌ها محاسبه می‌کند؛ رویداد (فاز ۳) بلیت را به پت می‌دهد؛ SaaS کلینیک (فاز ۴) رکورد `provider_verified` می‌نویسد. پس schema فاز ۱ باید `source`/`verification_state` و `Consent` را از الان داشته باشد.

**۱.۱۳ کیفیت مارکت‌پلیس قبل از رشد.** فروشنده‌ی self-service بدون moderation نداریم. هر فروشنده از صف `/admin/sellers` و هر محصول جدید از `/admin/products/moderation` عبور می‌کند. فروشنده offer روی محصول canonical می‌سازد، نه محصول تکراری.

**۱.۱۴ نه مارکت‌پلیس عمومی، نه شبکهٔ اجتماعی.** فید عمومی، لایک، فالو، پیام آزاد بین کاربران در فاز ۱–۳ وجود ندارد. `adoption` و `amber_alert` (هشدار جمعی) تا فاز ۴ و تا تعریف moderation منجمد می‌شوند؛ فقط «lost mode» پاسپورت در فاز ۱ می‌ماند.

**۱.۱۵ مرز نقش‌ها روشن است.** Pet Parent، Seller Owner، Seller Staff، Admin، Support، Finance هرکدام shell جدا (`/dashboard`, `/seller`, `/admin`)، مجوز جدا و لاگ جدا دارند. یک حساب می‌تواند چند نقش داشته باشد، اما هر درخواست در «زمینهٔ یک نقش» اجرا می‌شود.

**۱.۱۶ هر دسترسی حساس مجوزدار و ممیزی‌پذیر است.** خواندن سابقهٔ سلامت توسط هر کسی غیر از مالک، تغییر وضعیت فروشنده، بازپرداخت، تغییر نقش، مشاهدهٔ PII توسط پشتیبانی، و اسکن QR → در `AuditLog` append-only ثبت می‌شود.

**۱.۱۷ هیچ تشخیص AI یا ادعای پزشکی ناامن.** `ai_copilot.py` و `bonyo-copilot-drawer.tsx` در فاز ۱ خاموش‌اند. در هر فاز، AI توضیح‌پذیر، غیرتشخیصی، حریم‌محور و تحت کنترل انسان است و برای علائم اورژانسی فقط پیام «با دامپزشک تماس بگیرید» می‌دهد.

**۱.۱۸ فاز ۱ باید retention و خرید تکراری را ثابت کند قبل از گسترش.** ورود به فاز ۲ مشروط به: نگهداشت هفتگی پایدار، نرخ خرید دوم، کیفیت عملیات فروشنده و پایداری پرداخت است (بخش ۲).

**مدل کاری تیم:** هر تسک = یک ID چک‌لیست از بخش ۵ این سند → plan در `.bonyo/plans/` → checkpoint → پیاده‌سازی → audit در `.bonyo/audits/` → تأیید انسانی QA → تیک در این سند. عامل (`builder.md`) حق تیک‌زدن launch gate را ندارد؛ فقط `auditor.md` پیشنهاد می‌دهد و Product/QA تأیید می‌کند.

---

## 2. Phase Gate Definitions

| بُعد | فاز ۱: Commerce + Daily Care | فاز ۲: Trusted Local Services | فاز ۳: Boarding + Events + Loyalty | فاز ۴: Pet OS + B2B + Ecosystem |
|---|---|---|---|---|
| هدف | اثبات «مراقبت روزانه + خرید تکراری» با فروشندگان منتخب | افزودن متخصصان تأییدشده با رزرو ساختارمند | خدمات پرتکرار محلی و تجارت تکرارشونده | اکوسیستم یکپارچه و درآمد B2B |
| کاربر هدف | صاحب سگ/گربه در یک شهر؛ ۵–۱۵ پت‌شاپ | همان کاربران + دامپزشک، مربی، آرایشگر، پت‌سیتر | کاربران فعال فاز ۱–۲؛ پانسیون‌ها؛ برگزارکنندگان | کلینیک‌ها، فروشندگان چندشعبه، شرکا |
| نتیجهٔ کسب‌وکار | GMV واقعی، خرید دوم، فروشندهٔ فعال | GMV خدمات، کمیسیون رزرو | رزرو شب‌مانی، بلیت، Autoship بالغ | اشتراک SaaS، API شرکا |
| شرط شروع | تصمیمات F-01 تا F-12 (بخش ۱۰.C)؛ رفع شکاف‌های Critical سند ۱ | Gate فاز ۱ پاس + ۳ ماه دادهٔ پایدار | Gate فاز ۲ پاس؛ booking state machine پایدار | Gate فاز ۳ پاس؛ حداقل ۳ شریک B2B امضاشده |
| شرط لانچ | بخش ۱۲ Gate-1 | Gate-2 | Gate-3 | Gate-4 |
| شاخص آمادگی برای فاز بعد | WAU/MAU ≥ ۴۵٪؛ ≥۷۰٪ کاربر فعال با ≥۱ پت کامل؛ خرید دوم ۶۰ روزه ≥ ۲۵٪؛ پذیرش سفارش فروشنده < ۲ساعت در ≥۹۰٪؛ شکست پرداخت < ۳٪؛ لغو به‌دلیل ناموجودی < ۲٪ | ≥۹۵٪ رزروها بدون اختلاف؛ امتیاز ارائه‌دهنده ≥ ۴.۵؛ ۰ نقض رضایت سلامت | ۰ double-booking؛ نرخ حادثه ثبت‌شده و رسیدگی‌شده ۱۰۰٪؛ refund طبق سیاست ≥ ۹۸٪ | uptime ≥ ۹۹.۹٪؛ ۰ رخداد نشت داده |
| گسترش زودهنگام ممنوع | شهر دوم، فروشندهٔ self-service، خدمات، AI | پانسیون، پیام آزاد، تلەمدیسین | چند کشور، شبکهٔ اجتماعی | بین‌المللی‌سازی بدون مدل کسب‌وکار |
| ریسک‌های بحرانی | نشت سلامت به فروشنده؛ oversell؛ پرداخت reconcile‌نشده؛ فرانت روی mock | متخصص جعلی؛ مشاورهٔ پزشکی غیرمجاز | double-booking؛ حادثه برای حیوان؛ قیمت پنهان | قفل داده؛ تعهد قانونی |
| non-goal صریح | ویزیت آنلاین، نسخه، تشخیص AI، شبکهٔ اجتماعی، پانسیون کامل، ERP، چند ارز | نسخه‌نویسی، فروش دارو نسخه‌ای | بیمه، کامیونیتی باز | — |

---

## 3. Four-Phase Gap Analysis

### Phase 1 — Commerce + Pet Daily Care MVP

**A. شواهد موجود:** `api/v1/{auth,pets,care,medical_records,passport,catalog,checkout,payment,sellers,settlements,admin,analytics,replenishment,subscriptions}.py`؛ مدل‌های `user, pet, catalog, order, settlement, subscription`؛ ۲ migration؛ صفحات `/`, `/shop`, `/cart`, `/checkout`, `/checkout/success`, `/dashboard/{care,pets,profile,passport,tracking,subscriptions,seller,admin}`, `/passport/[token]`؛ کامپوننت‌های care، pet، passport، cart، checkout؛ context های auth/cart/pet؛ تست‌های بک‌اند مرتبط؛ `docs/01–13`.

**B. صفحات/routes ناموجود:** `/login`, `/onboarding`, `/dashboard` (index + layout), `/dashboard/pets/new`, `/dashboard/pets/[petId]` (+`/edit`, `/health`, `/vaccinations`, `/vaccinations/new`, `/medications`, `/medications/new`, `/weight`), `/dashboard/care/tasks/[taskId]`, `/dashboard/reminders` (+`/new`, `/[id]/edit`), `/dashboard/settings/notifications`, `/dashboard/addresses`, `/dashboard/orders`, `/dashboard/orders/[orderId]` (+`/tracking`), `/dashboard/reorder`, `/dashboard/support` (+`/[ticketId]`), `/shop/[productSlug]`, `/shop/c/[categorySlug]`, `/search`, `/sellers/[sellerSlug]`, `/checkout/payment/callback`, `/checkout/failed`, `/seller/apply` (+`/status`), `/seller/{products,products/new,products/[id],inventory,orders,orders/[id],settings,settlements}`, `/admin/{sellers,sellers/[id],products/moderation,categories,orders,orders/[id],refunds,users,support,audit-log}`, `/admin/login` (یا login مشترک با نقش)، `not-found.tsx`, `error.tsx`, `global-error.tsx`, `loading.tsx`, `/unauthorized`, `/maintenance`.

**C. کامپوننت‌های ناموجود:** کل `components/ui/*` (Button, Input, Select, DatePicker شمسی, Dialog, Drawer, BottomSheet, Toast, Skeleton, Badge, Table, Card, Tabs, Stepper)؛ `ProductCard`, `VariantSelector`, `OfferList`, `SellerBadge`, `CompatibilityBadge`, `CareTaskCard`, `ReminderCard`, `HealthTimelineItem`, `VerificationBadge`, `WeightChart`, `OrderStatusTimeline`, `CartItem`, `SellerGroup`, `AddressForm`, `DeliveryOptionPicker`, `QrPassportCard`, `PublicFieldToggle`, `AdminDataTable`, `VerificationQueue`, `SellerKpiCard`, `EmptyState`, `ErrorState`, `PageHeader`.

**D. Entities ناموجود یا اثبات‌نشده:** `Address`, `Cart`, `CartItem`, `SellerOrder` (split)، `Shipment` per SellerOrder، `Refund`, `Review`, `SupportTicket`, `Category` (جدا)، `Reminder`/`CareTaskOccurrence`, `Vaccination`, `Medication`, `WeightRecord` (جدا از HealthRecord؟)، `PassportToken` با `revoked_at`، `QrScanLog`, `Notification`, `NotificationPreference`, `NotificationDeliveryLog`, `PushToken`, `ConsentRecord`, `AuditLog`, `Role`/`UserRole`, `SellerStaff`, `FeatureFlag`. همچنین migration برای `settlement`, `subscription`, `logistics`, `vet`, `loyalty`, `amber_alert`, `nfc`, `adoption`.

**E. API های ناموجود:** cart CRUD؛ addresses CRUD؛ `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel`؛ `GET /catalog/categories`, `GET /catalog/search`؛ `GET /catalog/products/{slug}`؛ reviews؛ support tickets؛ notifications preferences/inbox؛ reminders؛ `POST /pets/{id}/passport/rotate`؛ admin: sellers approve/reject/suspend، products moderation، refunds، users، audit-log read؛ seller: offers CRUD، orders accept/reject/ship، store settings؛ `GET /ready`؛ OpenAPI export در CI.

**F. جریان‌های کاربر ناموجود:** ثبت‌نام→ساخت پت→اولین تسک (onboarding یکپارچه)؛ PDP→انتخاب variant→افزودن؛ پرداخت ناموفق→تلاش مجدد؛ مشاهدهٔ سفارش→پیگیری→ثبت نظر؛ واکسن→ساخت خودکار یادآور؛ «مشکل در سفارش»→تیکت؛ حذف حساب و export داده.

**G. جریان‌های seller/admin ناموجود:** درخواست فروشندگی→تأیید→ساخت offer→اولین سفارش؛ رد/پذیرش سفارش با دلیل؛ اعلام اتمام موجودی؛ تعلیق فروشنده و اثر روی offer ها؛ لغو و بازپرداخت؛ moderation محصول؛ مشاهدهٔ audit log.

**H. فرایندهای عملیاتی ناموجود:** playbook تأیید فروشنده (مدارک لازم، SLA ۴۸ ساعته)؛ playbook سفارش معوق؛ playbook بازپرداخت؛ تقویم تسویه؛ ساعات پشتیبانی و کانال؛ رویه رسیدگی به گزارش پت گم‌شده؛ incident response امنیتی؛ رویه بازگشت کالا.

**I. حریم/امنیت/ممیزی ناموجود:** `AuditLog` append-only؛ تست «seller هرگز داده سلامت نمی‌بیند»؛ rate limit روی `/auth/otp/*` و `/passport/*`؛ token rotation پاسپورت؛ نگهداری توکن در httpOnly cookie (NEEDS_CODE_REVIEW `auth-context.tsx`)؛ CSP/HSTS در `nginx/nginx.conf`؛ storage خصوصی برای مدارک KYC؛ سیاست حذف/نگهداری داده؛ `ConsentRecord`؛ حذف `bonnivo.db`.

**J. Analytics ناموجود:** نگاشت ۳۸ رویداد اجباری (بخش ۹) به `lib/analytics.ts` و `api/v1/analytics.py`؛ داشبورد funnel؛ رویدادهای سمت سرور برای پرداخت/سفارش (نه فقط کلاینت).

**K. QA/تست ناموجود:** نصب `@playwright/test` و حذف `e2e/playwright.d.ts` دست‌ساز؛ E2E برای ۸ جریان اصلی؛ unit test فرانت (Vitest + Testing Library) → MISSING؛ تست migration روی Postgres؛ تست contract با OpenAPI؛ تست a11y خودکار (axe)؛ تست RTL بصری؛ CI.

**L. Design-system ناموجود:** بخش ۸ سند ۱؛ به‌ویژه DatePicker شمسی، BottomSheet، Toast، Skeleton، EmptyState.

**M. موبایل/ریسپانسیو ناموجود:** `apps/mobile` خالی؛ service worker/offline برای PWA؛ web push؛ تست روی ۳۶۰px؛ safe-area در `mobile-bottom-nav.tsx`.

**N. وابستگی‌ها:** درگاه پرداخت؛ سرویس SMS (`services/sms.py`)؛ object storage S3-compatible؛ Postgres مدیریت‌شده؛ شرکت ارسال/پیک؛ فروشندگان منتخب.

**O. تصمیم‌های بنیان‌گذار:** F-01 تا F-22 در بخش ۱۰.C.

**P. موارد deferred:** vets/appointments، adopt، ai_copilot، nfc، loyalty/paw-points، live-courier-map، wms_webhooks، amber_alert جمعی، services، Autoship با charge خودکار.

**Q. ریسک‌ها:** R-01 تا R-12 در بخش ۱۰.A.

**R. Definition of Done:** Gate-1 در بخش ۱۲ + همهٔ آیتم‌های P0 بخش ۵ تیک خورده.

### Phase 2 — Trusted Local Services Marketplace

**A. شواهد:** `api/v1/vets.py`, `models/vet.py`, `tests/test_vet_booking.py`, `api/v1/services.py`, `tests/test_services_vaccine_guard.py`, `src/app/vets/page.tsx`, `src/app/vets/[id]/page.tsx`, `src/app/dashboard/appointments/page.tsx`, `lib/api/vets.ts`, `types/vet.ts`, `.bonyo/audits/phase-2-health-network.md` (تعریف قدیم). فقط vet پوشش دارد؛ مربی، آرایشگر، پت‌سیتر، پیاده‌روی، پت‌تاکسی، daycare → MISSING.
**B. صفحات:** `/providers`, `/providers/map`, `/providers/[slug]`, `/providers/[slug]/services/[serviceId]`, `/book/[serviceId]`, `/book/[bookingId]/confirm`, `/dashboard/bookings`, `/dashboard/bookings/[id]`, `/dashboard/bookings/[id]/cancel`, `/dashboard/pets/[petId]/sharing`, `/provider/apply`, `/provider`, `/provider/calendar`, `/provider/services`, `/provider/bookings`, `/provider/credentials`, `/admin/providers`, `/admin/disputes`, `/dashboard/bookings/[id]/review`, `/dashboard/bookings/[id]/dispute`.
**C. کامپوننت‌ها:** `ProviderCard`, `CredentialBadge`, `MapView` (2D، بدون 3D)، `AvailabilityCalendar`, `SlotPicker`, `CancellationPolicyBox`, `ConsentScopeSelector`, `PreVisitForm`, `EmergencyDisclaimer`.
**D. Entities:** `Provider`, `ProviderType`, `Credential`, `CredentialReview`, `ServiceOffering`, `AvailabilityRule`, `AvailabilityException`, `Booking`, `BookingEvent`, `CancellationPolicy`, `HealthShareGrant(scope, expires_at, revoked_at)`, `ProviderReview`, `Dispute` (گسترش)، `ProviderLocation` (PostGIS `geography(Point)`).
**E. APIs:** `GET /providers?near=&type=`, `GET /providers/{slug}`, `GET /services/{id}/slots`, `POST /bookings`, `POST /bookings/{id}/confirm|cancel|complete|no_show`, `POST /pets/{id}/share-grants`, `DELETE /share-grants/{id}`, `GET /provider/me/bookings`, `POST /provider/credentials`, `POST /admin/providers/{id}/verify`.
**F. جریان کاربر:** جستجو→پروفایل→انتخاب خدمت→slot→پرداخت/درخواست→تأیید→یادآور→انجام→نظر؛ اشتراک سوابق با scope و انقضا.
**G. جریان ارائه‌دهنده/ادمین:** apply→آپلود مدرک→بررسی→فعال‌سازی؛ مدیریت تقویم؛ پذیرش/رد؛ ثبت انجام؛ بررسی اختلاف.
**H. عملیات:** معیار تأیید هر نوع ارائه‌دهنده (پروانهٔ نظام دامپزشکی برای vet)، تمدید سالانهٔ مدرک، رویه no-show، رویه شکایت.
**I. حریم:** هر خواندن رکورد سلامت توسط provider → AuditLog؛ grant پیش‌فرض ۷ روز؛ لغو فوری؛ مکان دقیق کاربر هرگز به provider داده نشود جز آدرس رزرو.
**J. Analytics:** `provider_viewed`, `booking_started`, `booking_confirmed`, `booking_cancelled`, `booking_completed`, `share_grant_created`, `share_grant_revoked`, `provider_review_submitted`, `dispute_opened`.
**K. QA:** تست state machine رزرو؛ تست concurrency slot؛ تست scope grant؛ E2E رزرو.
**L. DS:** Calendar، SlotPicker، Map، Rating.
**M. موبایل:** نقشهٔ لمسی، اعلان یادآوری نوبت.
**N. وابستگی:** PostGIS، سرویس نقشهٔ ایرانی (نشان/بلد/Map.ir) → NEEDS_FOUNDER_DECISION.
**O. تصمیم:** انواع ارائه‌دهندهٔ لانچ، مدل درآمد (کمیسیون/اشتراک)، پرداخت پیش یا پس از خدمت.
**P. Defer:** چت آزاد، ویزیت آنلاین، نسخه.
**Q. ریسک:** متخصص جعلی؛ مشاورهٔ پزشکی خارج از چارچوب؛ نشت مکان.
**R. DoD:** Gate-2.

### Phase 3 — Boarding + Events + Loyalty + Subscription

**A. شواهد:** `api/v1/services.py` + `tests/test_services_vaccine_guard.py` (پایهٔ eligibility)، `api/v1/loyalty.py`, `models/loyalty.py`, `tests/test_loyalty.py`, `components/dashboard/paw-points-widget.tsx`, `api/v1/subscriptions.py` (پایهٔ Autoship پیشرفته)، `components/logistics/live-courier-map.tsx`, `api/v1/logistics.py`. پانسیون، اتاق، رویداد، بلیت → MISSING.
**B. صفحات:** `/boarding`, `/boarding/[propertySlug]`, `/boarding/[propertySlug]/book` (مراحل: تاریخ→پت→eligibility→اتاق→add-on→deposit)، `/dashboard/stays/[reservationId]`, `/dashboard/stays/[reservationId]/reports`, `/boarding-manager/{calendar,rooms,reservations,check-in,check-out,incidents,reports}`, `/events`, `/events/[slug]`, `/events/[slug]/tickets`, `/dashboard/tickets/[ticketId]`, `/organizer/{events,events/new,attendees,check-in}`, `/dashboard/loyalty`, `/dashboard/subscriptions/[id]`, `/gift-cards`, `/bundles/[slug]`.
**C. کامپوننت‌ها:** `RoomMap` (2D، شبیه سینما، eligibility-first)، `PriceBreakdown`, `AddOnSelector`, `EligibilityChecklist`, `DailyReportCard`, `IncidentForm`, `TicketQr`, `CapacityBar`, `PointsLedger`.
**D. Entities:** `BoardingProperty`, `Room`, `RoomType(standard/private/premium/vip)`, `RoomInventoryNight` (unique room_id+date)، `RatePlan`, `PriceRule`, `AddOn`, `Reservation`, `ReservationPet`, `Deposit`, `CheckIn`, `CheckOut`, `DailyReport`, `MedicationAdministrationLog`, `FeedingLog`, `Incident`, `EmergencyVetConsent`, `Event`, `TicketType`, `Ticket`, `Waitlist`, `LoyaltyAccount`, `LoyaltyLedger`, `Promotion`, `Bundle`, `GiftCard`.
**E. APIs:** `GET /boarding/{id}/availability?from=&to=&pet_id=`, `POST /boarding/quotes`, `POST /reservations` (hold + deposit)، `POST /reservations/{id}/check-in|check-out`, `POST /reservations/{id}/daily-reports`, `POST /incidents`, `GET /events`, `POST /events/{id}/tickets`, `POST /tickets/{id}/scan`, `GET /loyalty/me`.
**F–H.** جریان رزرو با eligibility اول؛ check-in با تأیید واکسن؛ گزارش روزانه با عکس؛ حادثه با اعلان فوری؛ عملیات: SOP پانسیون، پروتکل اورژانس، سیاست refund.
**I.** رسانهٔ گزارش روزانه فقط برای مالک؛ رضایت اورژانس امضاشده؛ لاگ تجویز دارو.
**J.** `boarding_search`, `reservation_held`, `deposit_paid`, `check_in_completed`, `daily_report_viewed`, `incident_reported`, `ticket_purchased`, `ticket_scanned`, `points_earned`, `points_redeemed`.
**K.** تست concurrency روی `RoomInventoryNight`؛ تست قیمت‌گذاری تعطیلات شمسی؛ تست refund.
**N.** تقویم تعطیلات رسمی ایران؛ storage ویدیو.
**O.** مدل پانسیون (شریک یا مدیریت‌شده)، مقدار deposit، ارزش امتیاز.
**P.** کیف پول، NFT/gamification شدید.
**Q.** double-booking؛ حادثه؛ قیمت پنهان؛ گیمیفیکیشن فریبنده.
**R.** Gate-3.

### Phase 4 — Pet OS + B2B SaaS + Ecosystem

**A. شواهد:** `api/v1/ai_copilot.py`, `components/care/bonyo-copilot-drawer.tsx`, `api/v1/nfc.py`, `models/nfc.py`, `api/v1/adoption.py`, `models/adoption.py`, `src/app/adopt/page.tsx`, `api/v1/amber_alert.py`, `api/v1/wms_webhooks.py`, `.bonyo/audits/phase-4-hardware-social.md`. همه پیش‌ساخته و منجمد.
**B. صفحات:** `/clinic` (SaaS)، `/clinic/{patients,appointments,records,staff,settings}`, `/provider/crm`, `/seller/enterprise/{locations,reports,forecast}`, `/settings/integrations`, `/partners` (portal)، `/partners/api-keys`, `/admin/reports`, `/dashboard/data-export`, `/places` (در صورت تأیید)، `/adopt` (بازطراحی).
**C–E.** `Organization`, `Location`, `OrgMembership`, `ApiClient`, `ApiKey(hashed)`, `Webhook`, `WebhookDelivery`, `IntegrationConnection`, `RecordExchange` (FHIR-like)، `DemandForecast`, `DataExportJob`؛ APIs: OAuth2 client credentials، `/partner/v1/*`، `POST /me/export`.
**F–H.** onboarding سازمان، چندشعبه، صدور کلید API، SLA شرکا.
**I.** scope OAuth؛ rotation کلید؛ data processing agreement.
**J.** `org_created`, `api_key_issued`, `webhook_failed`, `data_export_requested`.
**K.** تست بار؛ chaos؛ contract test شرکا.
**N.** observability کامل (OpenTelemetry — `opentelemetry-api` نصب است ولی exporter/SDK نیست).
**O.** قیمت SaaS، استانداردهای تبادل داده، ورود به بیمه.
**P.** بین‌المللی‌سازی پیش از اثبات.
**Q.** تضعیف تجربهٔ مصرف‌کننده؛ قفل داده.
**R.** Gate-4.

---

## 4. Missing Pages and Routes Register

> ترتیب: فاز، سپس جریان. P0 = مسدودکنندهٔ لانچ فاز.

| ID | Page / Route / Screen | Platform | Phase | Why Needed | Existing Evidence | Status | Priority | Dependencies | Primary Role | Key Links | Acceptance Criteria |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PG-1-01 | Onboarding `/onboarding` | Web/Mobile | 1 | اولین تجربه: کاربر→پت→رضایت | `pet-onboarding-wizard.tsx` | Partial | P0 | auth | Pet Parent | →`/dashboard/care` | کاربر جدید در ≤۳ دقیقه پت می‌سازد و به Today می‌رسد |
| PG-1-02 | Login/Register `/login?next=` | Web/Mobile | 1 | deep link و redirect | `otp-auth-modal.tsx` | Partial | P0 | `auth.py` | Shared | →`next` | redirect پس از ورود به مسیر اصلی؛ 429 فارسی |
| PG-1-03 | Account recovery (تغییر شماره) | Web | 1 | گم شدن سیم‌کارت | — | Missing | P1 | Support playbook | Pet Parent | `/dashboard/profile` | تغییر شماره با تأیید پشتیبانی و AuditLog |
| PG-1-04 | User profile `/dashboard/profile` | Web/Mobile | 1 | حساب | `dashboard/profile/page.tsx` | Partial | P0 | users API | Pet Parent | →addresses, notifications | ویرایش نام/ایمیل؛ حذف حساب |
| PG-1-05 | Notification prefs `/dashboard/settings/notifications` | Web/Mobile | 1 | کنترل کانال و quiet hours | — | Missing | P0 | Notification model | Pet Parent | ←profile | تغییر کانال per category ذخیره و رعایت شود |
| PG-1-06 | Pet list `/dashboard/pets` | Web/Mobile | 1 | چند پت | `dashboard/pets/page.tsx` | Partial | P0 | pets API | Pet Parent | →`[petId]`, `/new` | empty state با CTA |
| PG-1-07 | Pet switcher (global) | Shared | 1 | زمینهٔ پت | `multi-pet-switcher.tsx` | Exists | P0 | pet-context | Pet Parent | همه صفحات | انتخاب در URL و storage پایدار |
| PG-1-08 | Add pet `/dashboard/pets/new` | Web/Mobile | 1 | URL مستقل | wizard | Partial | P0 | pets API | Pet Parent | →`[petId]` | همهٔ فیلدهای Phase 1B |
| PG-1-09 | Edit pet `/dashboard/pets/[petId]/edit` | Web/Mobile | 1 | ویرایش | — | Missing | P0 | pets API | Pet Parent | ←profile | ویرایش و حذف نرم |
| PG-1-10 | Pet profile `/dashboard/pets/[petId]` | Web/Mobile | 1 | هاب Pet Profile First | — | Missing | P0 | pets API | Pet Parent | →health, passport, care, shop | درصد تکمیل پروفایل و لینک به همهٔ زیرصفحه‌ها |
| PG-1-11 | Today `/dashboard/care` | Web/Mobile | 1 | بازگشت روزانه | `today-care-dashboard.tsx` | Partial | P0 | `care.py` | Pet Parent | →task, reminders, reorder | تسک‌های امروز پت انتخابی؛ offline تیک |
| PG-1-12 | Task detail `/dashboard/care/tasks/[taskId]` | Web/Mobile | 1 | جزئیات/تکرار | — | Missing | P1 | care API | Pet Parent | ←care | ویرایش recurrence |
| PG-1-13 | Task completion (sheet) | Web/Mobile | 1 | انجام/تعویق/رد | inline | Partial | P0 | occurrence API | Pet Parent | care | idempotent؛ undo ۵ ثانیه |
| PG-1-14 | Reminder center `/dashboard/reminders` | Web/Mobile | 1 | مدیریت یادآورها | — | Missing | P0 | reminder API | Pet Parent | ←care, health | لیست per pet |
| PG-1-15 | Reminder create/edit `/dashboard/reminders/new`, `/[id]/edit` | Web/Mobile | 1 | ساخت | — | Missing | P0 | reminder API | Pet Parent | ←vaccination | DatePicker شمسی + تکرار |
| PG-1-16 | Vaccination list `/dashboard/pets/[petId]/vaccinations` | Web/Mobile | 1 | سابقه واکسن | `medical_records.py` | Missing | P0 | health API | Pet Parent | ←health | next_due نمایش |
| PG-1-17 | Add vaccination `/…/vaccinations/new` | Web/Mobile | 1 | ثبت | — | Missing | P0 | health API | Pet Parent | →reminder | source=owner_entered |
| PG-1-18 | Medication list `/…/medications` | Web/Mobile | 1 | داروها | `medical_records.py` | Missing | P0 | health API | Pet Parent | ←health | فعال/پایان‌یافته |
| PG-1-19 | Add medication `/…/medications/new` | Web/Mobile | 1 | ثبت | — | Missing | P0 | health API | Pet Parent | →reminder | متن سلب مسئولیت |
| PG-1-20 | Weight history `/…/weight` | Web/Mobile | 1 | روند وزن | — | Missing | P1 | weights API | Pet Parent | ←health, care | نمودار RTL |
| PG-1-21 | Add weight (sheet) | Web/Mobile | 1 | ثبت سریع | — | Missing | P1 | weights API | Pet Parent | care | واحد kg، اعتبارسنجی بازه |
| PG-1-22 | Health timeline `/…/health` | Web/Mobile | 1 | دید یکپارچه | `medical_records.py` | Missing | P0 | health API | Pet Parent | ←profile | badge منبع رکورد |
| PG-1-23 | QR passport `/dashboard/passport?petId=` | Web/Mobile | 1 | مدیریت QR | `owner-passport-manager.tsx` | Partial | P0 | `passport.py` | Pet Parent | →public preview | toggle فیلدها، rotate توکن، lost mode |
| PG-1-24 | Public QR `/passport/[token]` | Web | 1 | پت گم‌شده | `passport/[token]/page.tsx` | Partial | P0 | `passport.py` | Public | — | فقط فیلدهای مجاز؛ بدون 3D؛ LCP<2s روی 3G |
| PG-1-25 | Store home `/shop` | Web/Mobile | 1 | ورود به تجارت | `shop/page.tsx` | Partial | P0 | catalog API | Pet Parent | →category, PDP | داده واقعی نه mock |
| PG-1-26 | Category `/shop/c/[categorySlug]` | Web/Mobile | 1 | کشف | icons | Missing | P0 | categories API | Pet Parent | ←home | فیلتر species/life stage |
| PG-1-27 | Search `/search?q=` | Web/Mobile | 1 | کشف | — | Missing | P0 | search API | Pet Parent | ←header | نرمال‌سازی فارسی |
| PG-1-28 | Product detail `/shop/[productSlug]` | Web/Mobile | 1 | variant و offer | — | Missing | P0 | catalog API | Pet Parent | →cart, seller | انتخاب variant، Buy Box، چرا مناسب پت |
| PG-1-29 | Seller store `/sellers/[sellerSlug]` | Web | 1 | شراکت با پت‌شاپ | — | Missing | P1 | sellers API | Pet Parent | ←PDP | ساعات، محدوده، امتیاز |
| PG-1-30 | Cart `/cart` | Web/Mobile | 1 | سبد | `cart-view.tsx` | Partial | P0 | cart API | Pet Parent | →checkout | گروه‌بندی per seller، سرور-محور |
| PG-1-31 | Address management `/dashboard/addresses` | Web/Mobile | 1 | ارسال | — | Missing | P0 | address API | Pet Parent | ←checkout | استان/شهر/کدپستی |
| PG-1-32 | Delivery option (step) | Web/Mobile | 1 | هزینه ارسال شفاف | — | Missing | P0 | quote API | Pet Parent | checkout | هزینه per seller قبل از پرداخت |
| PG-1-33 | Checkout `/checkout` | Web/Mobile | 1 | پرداخت | `checkout-view.tsx` | Partial | P0 | `checkout.py` | Pet Parent | →gateway | Idempotency-Key؛ بدون 3D |
| PG-1-34 | Payment return `/checkout/payment/callback` | Web | 1 | تأیید سرور | — | Missing | P0 | `payment.py` | Pet Parent | →success/failed | verify سمت سرور؛ تکرار امن |
| PG-1-35 | Order success `/checkout/success` | Web/Mobile | 1 | تأیید | `checkout-success-view.tsx` | Partial | P0 | orders API | Pet Parent | →order detail | شماره سفارش و زیرسفارش‌ها |
| PG-1-36 | Order list `/dashboard/orders` | Web/Mobile | 1 | تاریخچه | — | Missing | P0 | orders API | Pet Parent | →detail | صفحه‌بندی |
| PG-1-37 | Order detail `/dashboard/orders/[orderId]` | Web/Mobile | 1 | وضعیت | — | Missing | P0 | orders API | Pet Parent | →tracking, review, support | timeline per seller |
| PG-1-38 | Shipment tracking `/…/[orderId]/tracking` | Web/Mobile | 1 | پیگیری | `dashboard/tracking/page.tsx` | Needs redesign | P1 | shipments API | Pet Parent | ←detail | OrderStatusTimeline |
| PG-1-39 | Buy Again `/dashboard/reorder` | Web/Mobile | 1 | خرید تکراری | `smart-reorder-widget.tsx` | Partial | P0 | `replenishment.py` | Pet Parent | →cart | برچسب «چرا الان؟» |
| PG-1-40 | Autoship mgmt `/dashboard/subscriptions` | Web/Mobile | 1 | اشتراک | `dashboard/subscriptions/page.tsx` | Partial | P1 | `subscriptions.py` | Pet Parent | ←PDP | pause/skip/edit/cancel؛ flag |
| PG-1-41 | Seller onboarding `/seller/apply` | Web | 1 | جذب فروشنده | — | Missing | P0 | KYC API | Seller | →status | آپلود مدارک امن |
| PG-1-42 | Seller verification status `/seller/apply/status` | Web | 1 | شفافیت | — | Missing | P0 | KYC API | Seller | ←apply | دلیل رد |
| PG-1-43 | Seller settings `/seller/settings` | Seller Panel | 1 | ویترین | — | Missing | P0 | sellers API | Seller | ←nav | ساعات، محدوده |
| PG-1-44 | Seller product list `/seller/products` | Seller Panel | 1 | offer ها | — | Missing | P0 | offers API | Seller | →edit | فیلتر وضعیت |
| PG-1-45 | Seller product create/edit `/seller/products/new`, `/[id]` | Seller Panel | 1 | ساخت offer | — | Missing | P0 | offers API | Seller | ←list | انتخاب canonical یا درخواست محصول |
| PG-1-46 | Seller offer/pricing (tab) | Seller Panel | 1 | قیمت | — | Missing | P0 | offers API | Seller | product | تاریخچه قیمت |
| PG-1-47 | Seller inventory `/seller/inventory` | Seller Panel | 1 | موجودی | `test_seller_inventory_fulfillment.py` | Missing | P0 | inventory API | Seller | ←KPI | bulk update |
| PG-1-48 | Seller order list `/seller/orders` | Seller Panel | 1 | عملیات | — | Missing | P0 | seller orders API | Seller | →detail | SLA timer |
| PG-1-49 | Seller order detail `/seller/orders/[id]` | Seller Panel | 1 | اقدام | — | Missing | P0 | seller orders API | Seller | ←list | بدون دادهٔ سلامت |
| PG-1-50 | Seller dashboard `/seller` | Seller Panel | 1 | KPI | `seller-dashboard-view.tsx` | Needs redesign | P0 | dashboard API | Seller | →همه | KPI + هشدار |
| PG-1-51 | Admin login | Admin | 1 | ورود ادمین با 2FA | — | Missing | P0 | auth | Admin | →`/admin` | 2FA الزامی |
| PG-1-52 | Admin dashboard `/admin` | Admin | 1 | نمای کلی | `admin-panel-view.tsx` | Needs redesign | P0 | admin API | Admin | →صف‌ها | شمارش صف‌ها |
| PG-1-53 | Seller verification queue `/admin/sellers` | Admin | 1 | کنترل کیفیت | — | Missing | P0 | admin API | Admin | →`[id]` | تأیید/رد با دلیل + AuditLog |
| PG-1-54 | Product moderation `/admin/products/moderation` | Admin | 1 | کیفیت کاتالوگ | — | Missing | P0 | admin API | Admin | ←dashboard | — |
| PG-1-55 | Category management `/admin/categories` | Admin | 1 | درخت دسته | — | Missing | P1 | categories API | Admin | — | drag-sort RTL |
| PG-1-56 | Order operations `/admin/orders` | Admin | 1 | عملیات | — | Missing | P0 | admin API | Support | →refund | جستجو با شماره |
| PG-1-57 | Refund/cancellation `/admin/refunds` | Admin | 1 | مالی | `test_admin_disputes.py` | Missing | P0 | refund API | Finance | ←orders | تأیید دو مرحله‌ای بالای سقف |
| PG-1-58 | User management `/admin/users` | Admin | 1 | پشتیبانی | — | Missing | P1 | admin API | Admin | — | PII mask |
| PG-1-59 | Support ticket list `/admin/support` + `/dashboard/support` | Admin/Web | 1 | پشتیبانی | `support-drawer.tsx` | Missing | P0 | ticket API | Support | →detail | — |
| PG-1-60 | Support ticket detail `/…/[ticketId]` | Admin/Web | 1 | پشتیبانی | — | Missing | P0 | ticket API | Support | ←list | پیوند به سفارش |
| PG-1-61 | 404 `not-found.tsx` | Shared | 1 | حالت سراسری | — | Missing | P0 | DS | Shared | →`/` | فارسی RTL |
| PG-1-62 | Unauthorized `/unauthorized` | Shared | 1 | نقش | — | Missing | P0 | middleware | Shared | →login | — |
| PG-1-63 | Maintenance/degraded `/maintenance` | Shared | 1 | عملیات | — | Missing | P1 | flag | Shared | — | فعال‌سازی بدون deploy |
| PG-1-64 | Global error `error.tsx`, `global-error.tsx` | Shared | 1 | پایداری | — | Missing | P0 | Sentry | Shared | — | گزارش خطا |
| PG-1-65 | Offline/retry states | Web/Mobile | 1 | شبکه ضعیف | `manifest.ts` | Missing | P1 | service worker | Shared | — | care قابل تیک آفلاین |
| PG-2-01 | Provider directory `/providers` | Web/Mobile | 2 | بازار خدمات تأییدشده | `src/app/vets/*`, `dashboard/appointments` | Needs redesign | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-02 | Provider map `/providers/map` | Web/Mobile | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-03 | Provider profile `/providers/[slug]` | Web/Mobile | 2 | بازار خدمات تأییدشده | `src/app/vets/*`, `dashboard/appointments` | Needs redesign | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-04 | Service detail `/providers/[slug]/services/[id]` | Web/Mobile | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-05 | Provider calendar `/provider/calendar` | Web | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Provider | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-06 | Booking request `/book/[serviceId]` | Web/Mobile | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-07 | Booking confirmation `/book/[bookingId]/confirm` | Web/Mobile | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-08 | Booking detail `/dashboard/bookings/[id]` | Web/Mobile | 2 | بازار خدمات تأییدشده | `src/app/vets/*`, `dashboard/appointments` | Needs redesign | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-09 | Cancellation `/dashboard/bookings/[id]/cancel` | Web/Mobile | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-10 | Provider dashboard `/provider` | Web | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Provider | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-11 | Provider onboarding `/provider/apply` | Web | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Provider | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-12 | Credential upload/review `/provider/credentials`, `/admin/providers` | Web | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Provider | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-13 | Medical record consent `/dashboard/pets/[petId]/sharing` | Web/Mobile | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-14 | Review flow `/dashboard/bookings/[id]/review` | Web/Mobile | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Pet Parent | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-2-15 | Dispute flow `/dashboard/bookings/[id]/dispute`, `/admin/disputes` | Web/Mobile | 2 | بازار خدمات تأییدشده | — | Deferred | P1 | Gate-1، Provider model | Support | به پروفایل پت | state machine، حالات کامل، AuditLog |
| PG-3-01 | Boarding search `/boarding` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-02 | Boarding detail `/boarding/[slug]` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-03 | Room selection (step) | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-04 | Boarding calendar `/boarding-manager/calendar` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Boarding Manager | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-05 | Add-on selection (step) | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-06 | Eligibility form (step) | Web/Mobile | 3 | خدمات پرتکرار | `test_services_vaccine_guard.py` | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-07 | Vaccination eligibility (step) | Web/Mobile | 3 | خدمات پرتکرار | `test_services_vaccine_guard.py` | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-08 | Deposit checkout (step) | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-09 | Reservation `/dashboard/stays/[id]` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-10 | Check-in `/boarding-manager/check-in` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Boarding Manager | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-11 | Check-out `/boarding-manager/check-out` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Boarding Manager | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-12 | Daily report feed `/dashboard/stays/[id]/reports` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-13 | Incident report `/boarding-manager/incidents` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Boarding Manager | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-14 | Event list `/events` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-15 | Event detail `/events/[slug]` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-16 | Ticket selection `/events/[slug]/tickets` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-17 | Ticket checkout (step) | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-18 | QR ticket `/dashboard/tickets/[id]` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-19 | Organizer dashboard `/organizer` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Organizer | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-20 | Loyalty dashboard `/dashboard/loyalty` | Web/Mobile | 3 | خدمات پرتکرار | `paw-points-widget.tsx`, `loyalty.py` | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-21 | Autoship plan `/dashboard/subscriptions/[id]` | Web/Mobile | 3 | خدمات پرتکرار | `subscriptions.py` | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-3-22 | Gift card / bundle `/gift-cards`, `/bundles/[slug]` | Web/Mobile | 3 | خدمات پرتکرار | — | Deferred | P2 | Gate-2 | Pet Parent | به پروفایل پت | eligibility-first، قیمت شفاف، ۰ double-booking |
| PG-4-01 | Clinic SaaS `/clinic` | Web | 4 | اکوسیستم | — | Deferred | P2 | Gate-3 | Provider | — | scope OAuth، AuditLog، observability |
| PG-4-02 | Provider CRM `/provider/crm` | Web | 4 | اکوسیستم | — | Deferred | P2 | Gate-3 | Provider | — | scope OAuth، AuditLog، observability |
| PG-4-03 | Enterprise seller `/seller/enterprise` | Web | 4 | اکوسیستم | — | Deferred | P2 | Gate-3 | Seller | — | scope OAuth، AuditLog، observability |
| PG-4-04 | Integration settings `/settings/integrations` | Web | 4 | اکوسیستم | — | Deferred | P2 | Gate-3 | Seller | — | scope OAuth، AuditLog، observability |
| PG-4-05 | API keys / partner portal `/partners` | Web | 4 | اکوسیستم | — | Deferred | P2 | Gate-3 | Shared | — | scope OAuth، AuditLog، observability |
| PG-4-06 | Advanced reports `/admin/reports` | Web | 4 | اکوسیستم | — | Deferred | P2 | Gate-3 | Admin | — | scope OAuth، AuditLog، observability |
| PG-4-07 | Data export `/dashboard/data-export` | Web | 4 | اکوسیستم | — | Deferred | P2 | Gate-3 | Pet Parent | — | scope OAuth، AuditLog، observability |
| PG-4-08 | Community / places `/places` (در صورت تأیید) | Web | 4 | اکوسیستم | — | Deferred | P2 | Gate-3 | Pet Parent | — | scope OAuth، AuditLog، observability |
| PG-4-09 | Adoption `/adopt` | Web | 4 | اکوسیستم | `src/app/adopt/page.tsx`, `adoption.py` | Deferred | P2 | Gate-3 | Pet Parent | — | scope OAuth، AuditLog، observability |

---

## 5. Four-Phase Master Checklist

> «(Shared infra)» = زیرساخت مشترک بین فازها. فیلد «—» یعنی کاربرد ندارد.

### Phase 1 — Commerce + Pet Daily Care MVP


#### 1. Product and scope decisions

- [ ] P1-PRD-01: تأیید رسمی دامنهٔ فاز ۱ جدید و منسوخ‌اعلام‌کردن تعریف قدیم فازها در `.bonyo`
  - Category: Product
  - Phase: Phase 1
  - Priority: P0
  - Owner: Founder/Product
  - Current status: Partial
  - Relevant paths: `docs/02-phase-1-scope.md`, `docs/ROADMAP.md`, `.bonyo/audits/phase-2-health-network.md`, `.bonyo/reports/phase-2-3-4-completion-report.md`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: `docs/ROADMAP.md` با ۴ فاز این سند بازنویسی؛ فایل‌های فاز قدیم با هدر «منسوخ» علامت‌گذاری
  - Test / verification: بازبینی دو نفره Founder+Product
  - Analytics / monitoring: —
  - Decision required: F-01..F-22
  - Evidence: ناسازگاری نام audit ها با فازهای جدید
- [ ] P1-PRD-02: تصمیم سرنوشت ماژول‌های پیش‌ساخته (freeze / flag / حذف)
  - Category: Product
  - Phase: Phase 1
  - Priority: P0
  - Owner: Founder/Product
  - Current status: Missing
  - Relevant paths: `api/v1/{vets,services,loyalty,adoption,ai_copilot,nfc,amber_alert,wms_webhooks,logistics}.py`, `src/app/{vets,adopt,dashboard/appointments}`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-DEV-04
  - Acceptance criteria: جدول تصمیم در `docs/03-decisions.md` برای هر ماژول
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: ۹ ماژول خارج از فاز ۱
- [ ] P1-PRD-03: تعریف «پت کامل» (حداقل فیلدهای اجباری) و معیار پروفایل ناقص
  - Category: Product
  - Phase: Phase 1
  - Priority: P0
  - Owner: Product/Design
  - Current status: Unknown
  - Relevant paths: `components/pet/pet-onboarding-wizard.tsx`, `models/pet.py`
  - Required pages/routes: `/dashboard/pets/[petId]`
  - Required APIs/entities: Pet
  - Dependencies: —
  - Acceptance criteria: لیست فیلدهای اجباری/اختیاری مستند در `docs/08-data-model.md`
  - Test / verification: —
  - Analytics / monitoring: `pet_profile_completed`
  - Decision required: بله
  - Evidence: —
- [ ] P1-PRD-04: تعریف قانون Buy Box و برچسب‌های توضیح پیشنهاد
  - Category: Product
  - Phase: Phase 1
  - Priority: P0
  - Owner: Product
  - Current status: Partial
  - Relevant paths: `tests/test_buy_box.py`, `models/catalog.py`
  - Required pages/routes: `/shop/[productSlug]`
  - Required APIs/entities: Offer
  - Dependencies: —
  - Acceptance criteria: فرمول مستند (قیمت+ارسال+SLA+موجودی)؛ متن برچسب‌ها فارسی
  - Test / verification: مرور تست با فرمول
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: وجود تست buy box

#### 2. Repository and developer experience

- [ ] P1-DEV-01: یکپارچه‌سازی entrypoint بک‌اند
  - Category: Backend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `apps/backend/main.py`, `apps/backend/src/main.py`, `apps/backend/Dockerfile`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: فقط یک entrypoint؛ Dockerfile و README به آن اشاره کنند
  - Test / verification: `uvicorn` محلی و در compose بالا بیاید
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: دو فایل main.py
- [ ] P1-DEV-02: پاک‌سازی artifact ها از ریپو و `.gitignore`
  - Category: DevOps (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Missing
  - Relevant paths: `apps/backend/bonnivo.db`, `apps/web/tsconfig.tsbuildinfo`, `structure.txt`, `folder-structure.txt`, `icons/`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: فایل‌ها حذف و ignore؛ بررسی تاریخچهٔ git برای دادهٔ واقعی در `bonnivo.db`
  - Test / verification: `git ls-files` شامل آن‌ها نباشد
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: وجود فایل‌ها
- [ ] P1-DEV-03: جایگزینی کلاینت‌های تکراری با `packages/api-client` تولیدشده از OpenAPI
  - Category: Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend/Backend
  - Current status: Partial
  - Relevant paths: `packages/api-client/src/*`, `apps/web/src/lib/api/*`, `apps/web/src/types/*`
  - Required pages/routes: —
  - Required APIs/entities: `/openapi.json`
  - Dependencies: P1-DEV-05
  - Acceptance criteria: `apps/web/src/lib/api/` و `types/` حذف یا re-export؛ اسکریپت `pnpm gen:api`
  - Test / verification: typecheck سبز
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: دو لایهٔ کلاینت
- [ ] P1-DEV-04: زیرساخت feature flag (backend + web)
  - Category: Backend/Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `src/core/config.py`, `src/main.py`
  - Required pages/routes: nav
  - Required APIs/entities: `GET /config/flags`
  - Dependencies: —
  - Acceptance criteria: router های منجمد فقط با flag ثبت شوند؛ nav از flag پیروی کند
  - Test / verification: تست: flag خاموش → 404
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-DEV-05: CI: lint، typecheck، pytest، build، export OpenAPI
  - Category: DevOps (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Missing
  - Relevant paths: `.github/workflows/ci.yml` (ساخت)
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: هر PR: ruff/mypy، `pytest apps/backend/tests`, `pnpm -r typecheck`, `next build`, Playwright smoke
  - Test / verification: pipeline سبز روی main
  - Analytics / monitoring: زمان CI
  - Decision required: پلتفرم CI
  - Evidence: نبود CI
- [ ] P1-DEV-06: حذف وابستگی فرانت به `data/mock-*.ts` در production
  - Category: Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Partial
  - Relevant paths: `apps/web/src/data/mock-catalog.ts`, `mock-pets.ts`
  - Required pages/routes: `/`, `/shop`, `/dashboard/pets`
  - Required APIs/entities: catalog, pets
  - Dependencies: P1-DEV-03
  - Acceptance criteria: grep import mock در `src/app` و `components` صفر؛ mock فقط در تست
  - Test / verification: lint rule `no-restricted-imports`
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: وجود mock

#### 3. Environment / config / secrets

- [ ] P1-ENV-01: ساخت `.env.example` برای backend و web
  - Category: DevOps (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Missing
  - Relevant paths: `apps/backend/.env.example`, `apps/web/.env.example`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: همهٔ کلیدهای `core/config.py` مستند؛ بدون مقدار واقعی
  - Test / verification: اجرای تازه با کپی فایل
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: نبود فایل
- [ ] P1-ENV-02: Postgres به‌عنوان تنها DB در staging/prod؛ SQLite فقط تست
  - Category: Backend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend/DevOps
  - Current status: Partial
  - Relevant paths: `src/core/database.py`, `docker-compose.yml`, `aiosqlite`, `asyncpg`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: compose سرویس Postgres 16 دارد؛ تست‌ها هم روی Postgres اجرا شوند (testcontainers)
  - Test / verification: pytest روی Postgres
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: وجود هر دو driver
- [ ] P1-ENV-03: مدیریت secrets (JWT، SMS، درگاه، S3)
  - Category: DevOps/Security (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Unknown
  - Relevant paths: `src/core/config.py`, `src/core/security.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: secrets از vault/CI secrets؛ کلید JWT ≥ 256bit؛ rotation مستند
  - Test / verification: scan با gitleaks
  - Analytics / monitoring: —
  - Decision required: ارائه‌دهندهٔ hosting
  - Evidence: —
- [ ] P1-ENV-04: محیط staging جدا با دادهٔ ساختگی
  - Category: DevOps (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Missing
  - Relevant paths: `docker-compose.yml`, `nginx/nginx.conf`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-ENV-02
  - Acceptance criteria: URL staging، DB جدا، درگاه sandbox
  - Test / verification: smoke test خودکار
  - Analytics / monitoring: uptime
  - Decision required: hosting داخل ایران؟
  - Evidence: —

#### 4. Design system / RTL / accessibility

- [ ] P1-DS-01: ساخت `packages/tokens` با توکن‌های semantic Bonyo Care System
  - Category: Design/Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Design
  - Current status: Partial
  - Relevant paths: `apps/web/tailwind.config.ts`, `src/app/globals.css`, `docs/10-design-system.md`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: توکن رنگ (teal/forest/navy/gold/ivory/terracotta/success/warning/critical)، فاصله، radius، سایه؛ مصرف در tailwind
  - Test / verification: snapshot توکن
  - Analytics / monitoring: —
  - Decision required: تأیید برند
  - Evidence: —
- [ ] P1-DS-02: ساخت primitives در `packages/ui` (Button, Input, Select, Dialog, Drawer, BottomSheet, Toast, Skeleton, Badge, Card, Table)
  - Category: Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: `apps/web/src/lib/utils.ts`, `class-variance-authority`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-DS-01
  - Acceptance criteria: هر primitive: variants، حالت disabled/loading، RTL، focus ring
  - Test / verification: Storybook یا صفحهٔ `/dev/ui` + axe
  - Analytics / monitoring: —
  - Decision required: انتخاب Radix/Ark
  - Evidence: نبود `components/ui`
- [ ] P1-DS-03: DatePicker شمسی و فرمت اعداد/ارز فارسی
  - Category: Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: vaccinations, medications, reminders
  - Required APIs/entities: —
  - Dependencies: P1-DS-02
  - Acceptance criteria: ورود/نمایش تاریخ جلالی، ذخیره UTC؛ ریال/تومان با جداکننده فارسی
  - Test / verification: unit test تبدیل
  - Analytics / monitoring: —
  - Decision required: تومان یا ریال در UI
  - Evidence: —
- [ ] P1-DS-04: تأیید RTL و فونت فارسی در `layout.tsx`
  - Category: Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Unknown
  - Relevant paths: `apps/web/src/app/layout.tsx`
  - Required pages/routes: همه
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: `<html lang="fa" dir="rtl">`، فونت self-hosted، logical properties، mirror آیکن جهت‌دار
  - Test / verification: تست بصری Playwright در 360/768/1280
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: NEEDS_CODE_REVIEW
- [ ] P1-DS-05: کامپوننت‌های دامنه (PetAvatar, ProductCard, CareTaskCard, ReminderCard, HealthTimelineItem, CartItem, OrderStatusTimeline, QrPassportCard, SellerBadge, EmptyState, ErrorState)
  - Category: Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend/Design
  - Current status: Partial
  - Relevant paths: `components/{care,cart,pet,passport,home}/*`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-DS-02
  - Acceptance criteria: استخراج از view های inline به `packages/ui/src/bonyo`
  - Test / verification: تست رندر
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: کامپوننت‌های inline
- [ ] P1-DS-06: ممیزی دسترس‌پذیری WCAG 2.2 AA روی ۱۰ جریان
  - Category: QA/Design (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: QA
  - Current status: Missing
  - Relevant paths: `apps/web/e2e/*`
  - Required pages/routes: login, onboarding, care, PDP, cart, checkout, passport public, seller orders, admin queue
  - Required APIs/entities: —
  - Dependencies: P1-DS-02
  - Acceptance criteria: ۰ خطای critical axe؛ کیبورد کامل؛ کنتراست
  - Test / verification: `@axe-core/playwright`
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-DS-07: قاعدهٔ 3D: فقط `/`، با fallback و reduced-motion
  - Category: Frontend (Shared infra)
  - Phase: Phase 1
  - Priority: P1
  - Owner: Frontend
  - Current status: Partial
  - Relevant paths: `components/home/island-progressive-container.tsx`, `three-island-canvas.tsx`, `public/icons/bonnivo-floating-island.svg`
  - Required pages/routes: `/`
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: WebGL/`saveData`/reduced-motion → SVG؛ dynamic import؛ Lighthouse موبایل ≥ 80
  - Test / verification: Lighthouse CI
  - Analytics / monitoring: LCP/INP
  - Decision required: اولویت 3D (F-17)
  - Evidence: —

#### 5. Authentication and role-based access

- [ ] P1-AUTH-01: بازبینی OTP: طول کد، انقضا، rate limit per phone/IP، قفل موقت
  - Category: Backend/Security
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/auth.py`, `services/sms.py`, `tests/test_auth_otp.py`
  - Required pages/routes: `/login`
  - Required APIs/entities: `POST /auth/otp/request|verify`
  - Dependencies: —
  - Acceptance criteria: کد ۶ رقمی، ۲ دقیقه، ≤۵ درخواست/ساعت، hash در DB
  - Test / verification: تست brute-force
  - Analytics / monitoring: `login_completed`, `sign_up_completed`
  - Decision required: —
  - Evidence: تست otp
- [ ] P1-AUTH-02: توکن در httpOnly Secure cookie + refresh rotation
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Unknown
  - Relevant paths: `context/auth-context.tsx`, `core/security.py`
  - Required pages/routes: —
  - Required APIs/entities: `POST /auth/refresh|logout`
  - Dependencies: —
  - Acceptance criteria: هیچ توکن در localStorage؛ CSRF محافظت
  - Test / verification: تست XSS-safe
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: NEEDS_CODE_REVIEW
- [ ] P1-AUTH-03: مدل نقش/مجوز: Role, UserRole, Permission + dependency `require_permission`
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Unknown
  - Relevant paths: `models/user.py`, `core/security.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: نقش‌های pet_parent, seller_owner, seller_staff, admin, support, finance, super_admin
  - Test / verification: تست ماتریس نقش (بخش ۷)
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-AUTH-04: `middleware.ts` و route group های `(parent)`, `(seller)`, `(admin)`
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: `apps/web/src/app/dashboard/{seller,admin}`
  - Required pages/routes: `/seller/*`, `/admin/*`, `/login`
  - Required APIs/entities: `GET /users/me`
  - Dependencies: P1-AUTH-03
  - Acceptance criteria: redirect نقش‌محور؛ guard سرور برای هر layout
  - Test / verification: E2E: pet parent به `/admin` → `/unauthorized`
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: seller/admin زیر dashboard
- [ ] P1-AUTH-05: 2FA برای admin/finance/super_admin
  - Category: Security
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: admin login
  - Required APIs/entities: `POST /auth/2fa/*`
  - Dependencies: P1-AUTH-03
  - Acceptance criteria: TOTP اجباری
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 6. Pet profile

- [ ] P1-PET-01: تکمیل schema پت: species, breed, sex, birth_date|age_estimate, weight, energy_level, feeding_preference, allergies[], health_notes, neuter_status, photo_key
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `models/pet.py`, `migrations/versions/9fed3f4f72ba_*`
  - Required pages/routes: —
  - Required APIs/entities: `/pets`
  - Dependencies: —
  - Acceptance criteria: migration جدید؛ enum ها مستند
  - Test / verification: test CRUD
  - Analytics / monitoring: `pet_created`
  - Decision required: —
  - Evidence: NEEDS_CODE_REVIEW
- [ ] P1-PET-02: آپلود عکس پت با presigned URL به S3 خصوصی
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/dashboard/pets/new`
  - Required APIs/entities: `POST /pets/{id}/photo-upload-url`
  - Dependencies: P1-ENV-03
  - Acceptance criteria: حداکثر 5MB، strip EXIF/GPS، thumbnail
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: storage provider
  - Evidence: —
- [ ] P1-PET-03: صفحات `/dashboard/pets/new`, `/[petId]`, `/[petId]/edit`
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: `components/pet/*`, `context/pet-context.tsx`
  - Required pages/routes: سه route
  - Required APIs/entities: `/pets/*`
  - Dependencies: P1-DS-05
  - Acceptance criteria: هاب پروفایل با لینک به health/passport/care/shop؛ نوار تکمیل
  - Test / verification: E2E ساخت و ویرایش
  - Analytics / monitoring: `pet_profile_completed`
  - Decision required: —
  - Evidence: —
- [ ] P1-PET-04: پایداری پت انتخابی در URL (`?petId=`) و switcher
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Frontend
  - Current status: Partial
  - Relevant paths: `multi-pet-switcher.tsx`, `pet-context.tsx`
  - Required pages/routes: همه
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: refresh صفحه پت را حفظ کند
  - Test / verification: E2E
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 7. Daily care and reminders

- [ ] P1-CARE-01: مدل تکرار (RRULE) و Occurrence با status: pending/done/skipped/snoozed
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Unknown
  - Relevant paths: `api/v1/care.py`, `tests/test_care_tasks.py`, `models/pet.py`
  - Required pages/routes: —
  - Required APIs/entities: `POST /care/occurrences/{id}/complete|skip|snooze`
  - Dependencies: —
  - Acceptance criteria: idempotent؛ timezone `Asia/Tehran`
  - Test / verification: تست تکرار و DST-free
  - Analytics / monitoring: `care_task_completed`
  - Decision required: —
  - Evidence: —
- [ ] P1-CARE-02: worker زمان‌بند یادآور (Celery/ARQ/APScheduler) با lock
  - Category: Backend/DevOps
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `services/sms.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-NOTIF-01
  - Acceptance criteria: ارسال در ±۲ دقیقه؛ بدون تکرار
  - Test / verification: تست با ساعت جعلی
  - Analytics / monitoring: `reminder_sent`
  - Decision required: انتخاب queue
  - Evidence: نبود worker
- [ ] P1-CARE-03: صفحات `/dashboard/reminders` و create/edit و task detail
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: `today-care-dashboard.tsx`
  - Required pages/routes: سه route
  - Required APIs/entities: reminders API
  - Dependencies: P1-DS-03
  - Acceptance criteria: snooze ۱ساعت/فردا، skip، reschedule
  - Test / verification: E2E
  - Analytics / monitoring: `reminder_created`, `reminder_snoozed`, `reminder_completed`
  - Decision required: —
  - Evidence: —
- [ ] P1-CARE-04: حالات Today: بدون پت، بدون تسک، آفلاین
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Unknown
  - Relevant paths: `today-care-dashboard.tsx`
  - Required pages/routes: `/dashboard/care`
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: هر سه حالت با CTA
  - Test / verification: تست حالت
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 8. Health timeline and privacy

- [ ] P1-HLT-01: تفکیک entity ها: Vaccination, Medication, WeightRecord, HealthNote با `source` و `verification_state`
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Unknown
  - Relevant paths: `api/v1/medical_records.py`, `models/pet.py`, `models/vet.py`
  - Required pages/routes: —
  - Required APIs/entities: `/pets/{id}/vaccinations|medications|weights|health-timeline`
  - Dependencies: —
  - Acceptance criteria: enum: owner_entered, provider_verified, imported
  - Test / verification: تست migration
  - Analytics / monitoring: `vaccination_record_created`, `medication_record_created`, `weight_logged`
  - Decision required: —
  - Evidence: NEEDS_CODE_REVIEW
- [ ] P1-HLT-02: تست خودکار: هیچ endpoint seller/admin-non-privileged داده سلامت برنگرداند
  - Category: QA/Security
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `tests/test_security_idor_audit.py`, `tests/test_medical_records.py`
  - Required pages/routes: —
  - Required APIs/entities: همه seller APIs
  - Dependencies: P1-AUTH-03
  - Acceptance criteria: تست schema پاسخ seller: فیلدهای ممنوع ندارد
  - Test / verification: pytest
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-HLT-03: صفحات health, vaccinations(+new), medications(+new), weight
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: چهار route
  - Required APIs/entities: health APIs
  - Dependencies: P1-PET-03
  - Acceptance criteria: ساخت خودکار reminder از next_due؛ متن «جایگزین دامپزشک نیست»
  - Test / verification: E2E
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 9. QR passport

- [ ] P1-QR-01: توکن غیرقابل حدس (≥128bit) با rotate/revoke
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Unknown
  - Relevant paths: `api/v1/passport.py`, `tests/test_passport_emergency.py`
  - Required pages/routes: `/passport/[token]`
  - Required APIs/entities: `POST /pets/{id}/passport/rotate`
  - Dependencies: —
  - Acceptance criteria: توکن قبلی بلافاصله 404
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: NEEDS_CODE_REVIEW
- [ ] P1-QR-02: allow-list فیلدهای عمومی و ماسک تماس (تماس از طریق relay/پیامک)
  - Category: Backend/Product
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Unknown
  - Relevant paths: `passport.py`, `owner-passport-manager.tsx`
  - Required pages/routes: `/dashboard/passport`
  - Required APIs/entities: `PATCH /pets/{id}/passport`
  - Dependencies: F-12
  - Acceptance criteria: پیش‌فرض: نام، عکس، گونه، «حساسیت دارد: بله/خیر»؛ شماره هرگز خام
  - Test / verification: snapshot پاسخ عمومی
  - Analytics / monitoring: `qr_passport_viewed`, `qr_public_page_viewed`
  - Decision required: بله
  - Evidence: —
- [ ] P1-QR-03: ScanLog + rate limit + اعلان اسکن به مالک
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `api/v1/amber_alert.py`, `sighting-location-modal.tsx`
  - Required pages/routes: —
  - Required APIs/entities: `POST /passport/{token}/sightings`
  - Dependencies: P1-NOTIF-01
  - Acceptance criteria: مکان فقط با رضایت یابنده؛ دقت ≤ ۱۰۰ متر
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-QR-04: منجمد کردن amber alert جمعی؛ نگه داشتن فقط lost mode
  - Category: Product/Backend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/amber_alert.py`, `models/amber_alert.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-DEV-04
  - Acceptance criteria: broadcast جمعی پشت flag خاموش
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 10. Product catalog and search

- [ ] P1-CAT-01: صفحهٔ جزئیات محصول `/shop/[productSlug]`
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: `shop-catalog-view.tsx`, `featured-products-row.tsx`
  - Required pages/routes: `/shop/[productSlug]`
  - Required APIs/entities: `GET /catalog/products/{slug}`
  - Dependencies: P1-DS-05
  - Acceptance criteria: variant selector، offer list، Buy Box، برچسب سازگاری، تصاویر
  - Test / verification: E2E PDP→cart
  - Analytics / monitoring: `product_viewed`, `add_to_cart`
  - Decision required: —
  - Evidence: Critical gap G1
- [ ] P1-CAT-02: Category API + `/shop/c/[categorySlug]`
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `models/catalog.py`, `public/icons/*`
  - Required pages/routes: category route
  - Required APIs/entities: `GET /catalog/categories`
  - Dependencies: —
  - Acceptance criteria: درخت ۲ سطحی؛ slug فارسی/لاتین
  - Test / verification: تست
  - Analytics / monitoring: `category_viewed`
  - Decision required: دسته‌های لانچ (F-10)
  - Evidence: —
- [ ] P1-CAT-03: جستجوی فارسی (Postgres FTS/trigram + نرمال‌سازی ی/ک، اعداد)
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/search`
  - Required APIs/entities: `GET /catalog/search`
  - Dependencies: P1-ENV-02
  - Acceptance criteria: «غذای گربه» و «غذاي گربه» یک نتیجه
  - Test / verification: تست
  - Analytics / monitoring: `search_performed`
  - Decision required: —
  - Evidence: —
- [ ] P1-CAT-04: فیلدهای سازگاری (species, life_stage, context) روی Product
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Unknown
  - Relevant paths: `models/catalog.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: فیلتر با پت انتخابی
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 11. Seller offers, inventory and pricing

- [ ] P1-OFR-01: Offer CRUD فروشنده روی canonical product + ProductRequest
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/sellers.py`, `models/catalog.py`
  - Required pages/routes: `/seller/products/*`
  - Required APIs/entities: `/sellers/me/offers`
  - Dependencies: P1-AUTH-03
  - Acceptance criteria: فروشنده فقط offer خود؛ محصول جدید → moderation
  - Test / verification: تست IDOR
  - Analytics / monitoring: `seller_product_created`
  - Decision required: —
  - Evidence: —
- [ ] P1-OFR-02: موجودی + StockMovement + low-stock
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `tests/test_seller_inventory_fulfillment.py`, `tests/test_inventory_reservation.py`
  - Required pages/routes: `/seller/inventory`
  - Required APIs/entities: `PATCH /sellers/me/offers/{id}/stock`
  - Dependencies: —
  - Acceptance criteria: رزرو در checkout ≤ ۱۵ دقیقه؛ آزادسازی خودکار
  - Test / verification: تست concurrency
  - Analytics / monitoring: `seller_inventory_updated`
  - Decision required: —
  - Evidence: تست‌ها موجود
- [ ] P1-OFR-03: تاریخچهٔ قیمت و منع تغییر قیمت پس از رزرو
  - Category: Backend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: قیمت در CartItem snapshot شود
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 12. Cart, checkout, payment and orders

- [ ] P1-ORD-01: Cart سمت سرور + ادغام guest cart پس از ورود
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `context/cart-context.tsx`, `cart-view.tsx`
  - Required pages/routes: `/cart`
  - Required APIs/entities: `/cart/items`
  - Dependencies: —
  - Acceptance criteria: گروه‌بندی per seller؛ اعلام تغییر قیمت/ناموجودی
  - Test / verification: E2E
  - Analytics / monitoring: `cart_viewed`
  - Decision required: —
  - Evidence: سبد فقط کلاینت
- [ ] P1-ORD-02: Address CRUD + Delivery quote per seller
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `checkout-view.tsx`
  - Required pages/routes: `/dashboard/addresses`, `/checkout`
  - Required APIs/entities: `/users/me/addresses`, `POST /checkout/quote`
  - Dependencies: F-06
  - Acceptance criteria: هزینه ارسال قبل از پرداخت
  - Test / verification: تست
  - Analytics / monitoring: `checkout_started`
  - Decision required: مدل fulfillment
  - Evidence: —
- [ ] P1-ORD-03: Order split: Order → SellerOrder → OrderItem با state machine
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Unknown
  - Relevant paths: `models/order.py`, `migrations/versions/2a5b5c0fa7d7_*`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: بخش ۸ این سند
  - Test / verification: تست انتقال حالت
  - Analytics / monitoring: `order_created`
  - Decision required: —
  - Evidence: NEEDS_CODE_REVIEW
- [ ] P1-ORD-04: Payment: start، callback، verify سمت سرور، idempotency، reconcile روزانه
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/payment.py`, `services/payment.py`, `tests/test_payment.py`
  - Required pages/routes: `/checkout/payment/callback`, `/checkout/failed`
  - Required APIs/entities: `/payments/*`
  - Dependencies: F-07
  - Acceptance criteria: callback تکراری بی‌اثر؛ مبلغ از سرور
  - Test / verification: تست + sandbox
  - Analytics / monitoring: `payment_started`, `payment_completed`, `payment_failed`
  - Decision required: درگاه
  - Evidence: —
- [ ] P1-ORD-05: صفحات `/dashboard/orders`, `/[orderId]`, `/[orderId]/tracking`؛ redirect `/dashboard/tracking`
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: `dashboard/tracking/page.tsx`, `live-courier-map.tsx`
  - Required pages/routes: سه route
  - Required APIs/entities: `/orders/*`
  - Dependencies: P1-ORD-03
  - Acceptance criteria: OrderStatusTimeline per seller؛ لغو قبل از پذیرش
  - Test / verification: E2E
  - Analytics / monitoring: `order_cancelled`, `order_delivered`
  - Decision required: —
  - Evidence: G3, G4
- [ ] P1-ORD-06: Review فقط پس از تحویل (verified purchase)
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: order detail, PDP
  - Required APIs/entities: `POST /orders/{id}/items/{itemId}/review`
  - Dependencies: P1-ORD-03
  - Acceptance criteria: moderation قبل از نمایش
  - Test / verification: تست
  - Analytics / monitoring: `review_submitted`
  - Decision required: —
  - Evidence: —

#### 13. Reorder and Autoship foundation

- [ ] P1-RE-01: صفحهٔ `/dashboard/reorder` و دکمهٔ «خرید مجدد» در order detail
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Partial
  - Relevant paths: `smart-reorder-widget.tsx`, `api/v1/replenishment.py`
  - Required pages/routes: `/dashboard/reorder`
  - Required APIs/entities: `GET /replenishment/due`, `POST /reorder/{orderId}`
  - Dependencies: P1-ORD-01
  - Acceptance criteria: برچسب «حدود X روز تا اتمام» با فرمول توضیح‌پذیر
  - Test / verification: E2E
  - Analytics / monitoring: `reorder_viewed`, `reorder_completed`
  - Decision required: —
  - Evidence: —
- [ ] P1-RE-02: Autoship پشت flag؛ بدون charge خودکار تا تصمیم F-07
  - Category: Product/Backend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/subscriptions.py`, `models/subscription.py`, `dashboard/subscriptions/page.tsx`
  - Required pages/routes: `/dashboard/subscriptions`
  - Required APIs/entities: `/subscriptions/*`
  - Dependencies: P1-DEV-04
  - Acceptance criteria: pause/skip/edit/cancel؛ اجرای دوره = یادآور + سبد آماده
  - Test / verification: تست
  - Analytics / monitoring: `autoship_started`, `autoship_paused`
  - Decision required: بله
  - Evidence: migration ندارد
- [ ] P1-RE-03: migration برای `subscription`
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `models/subscription.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: alembic upgrade/downgrade سبز
  - Test / verification: تست migration
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 14. Seller onboarding and seller dashboard

- [ ] P1-SEL-01: `/seller/apply` + `/seller/apply/status` روی KYC
  - Category: Frontend/Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Partial
  - Relevant paths: `api/v1/sellers.py`, `tests/test_seller_kyc.py`
  - Required pages/routes: دو route
  - Required APIs/entities: `POST /sellers/applications`
  - Dependencies: P1-PET-02 (storage)
  - Acceptance criteria: مدارک: جواز کسب، کارت ملی، شبا؛ storage خصوصی
  - Test / verification: E2E
  - Analytics / monitoring: `seller_application_submitted`
  - Decision required: مدارک لازم
  - Evidence: —
- [ ] P1-SEL-02: shell فروشنده `/seller` با زیرصفحات products, inventory, orders, settings, settlements
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Needs redesign
  - Relevant paths: `components/seller/seller-dashboard-view.tsx`, `dashboard/seller/page.tsx`
  - Required pages/routes: `/seller/*`
  - Required APIs/entities: seller APIs
  - Dependencies: P1-AUTH-04
  - Acceptance criteria: هر بخش route جدا؛ nav جدا
  - Test / verification: E2E
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: تک‌فایل
- [ ] P1-SEL-03: state machine سفارش فروشنده: accept/reject(دلیل)/pack/ship + SLA
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `tests/test_seller_inventory_fulfillment.py`
  - Required pages/routes: `/seller/orders/[id]`
  - Required APIs/entities: `POST /sellers/me/orders/{id}/*`
  - Dependencies: P1-ORD-03
  - Acceptance criteria: عدم پذیرش در ۲ ساعت → هشدار ادمین
  - Test / verification: تست
  - Analytics / monitoring: `seller_order_accepted`, `seller_order_fulfilled`
  - Decision required: SLA
  - Evidence: —
- [ ] P1-SEL-04: Seller Staff با مجوز محدود
  - Category: Backend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/seller/settings/staff`
  - Required APIs/entities: `/sellers/me/staff`
  - Dependencies: P1-AUTH-03
  - Acceptance criteria: staff نمی‌تواند شبا/تسویه ببیند
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-SEL-05: تسویه: migration + صفحهٔ `/seller/settlements`
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/settlements.py`, `models/settlement.py`, `tests/test_vendor_settlement.py`
  - Required pages/routes: `/seller/settlements`
  - Required APIs/entities: `GET /sellers/me/settlements`
  - Dependencies: F-08
  - Acceptance criteria: گزارش per دوره با کمیسیون
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: چرخهٔ تسویه
  - Evidence: migration ندارد

#### 15. Admin and operations

- [ ] P1-ADM-01: shell ادمین `/admin` با route group و nav
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Needs redesign
  - Relevant paths: `components/admin/admin-panel-view.tsx`
  - Required pages/routes: `/admin/*`
  - Required APIs/entities: admin APIs
  - Dependencies: P1-AUTH-04
  - Acceptance criteria: —
  - Test / verification: E2E
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: تک‌فایل
- [ ] P1-ADM-02: صف تأیید فروشنده و تعلیق
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `api/v1/admin.py`
  - Required pages/routes: `/admin/sellers`, `/[id]`
  - Required APIs/entities: `POST /admin/sellers/{id}/approve|reject|suspend`
  - Dependencies: P1-SEC-01
  - Acceptance criteria: تعلیق → offer ها غیرفعال
  - Test / verification: تست
  - Analytics / monitoring: `seller_approved`
  - Decision required: —
  - Evidence: —
- [ ] P1-ADM-03: moderation محصول و مدیریت دسته
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/admin/products/moderation`, `/admin/categories`
  - Required APIs/entities: `/admin/products/*`, `/admin/categories`
  - Dependencies: P1-CAT-02
  - Acceptance criteria: —
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-ADM-04: عملیات سفارش، لغو و بازپرداخت با سقف و تأیید دوم
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `tests/test_admin_disputes.py`
  - Required pages/routes: `/admin/orders`, `/admin/refunds`
  - Required APIs/entities: `POST /admin/orders/{id}/refund`
  - Dependencies: F-09
  - Acceptance criteria: بازپرداخت بالای سقف نیازمند finance
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: سیاست بازپرداخت
  - Evidence: —
- [ ] P1-ADM-05: تیکت پشتیبانی (backend + `/dashboard/support` + `/admin/support`)
  - Category: Backend/Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `components/support/support-drawer.tsx`
  - Required pages/routes: چهار route
  - Required APIs/entities: `/support/tickets`
  - Dependencies: —
  - Acceptance criteria: تیکت به سفارش لینک شود
  - Test / verification: E2E
  - Analytics / monitoring: `support_ticket_created`
  - Decision required: ساعات پشتیبانی
  - Evidence: —
- [ ] P1-ADM-06: داشبورد KPI پایه ادمین
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Frontend
  - Current status: Partial
  - Relevant paths: `admin-panel-view.tsx`, `api/v1/analytics.py`
  - Required pages/routes: `/admin`
  - Required APIs/entities: `GET /admin/metrics`
  - Dependencies: P1-OBS-01
  - Acceptance criteria: GMV، سفارش، فروشندهٔ فعال، صف‌ها
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 16. Notifications

- [ ] P1-NOTIF-01: مدل Notification, Preference, DeliveryLog + dispatcher چندکاناله
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `services/sms.py`, `tests/test_sms_dispatcher.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-CARE-02
  - Acceptance criteria: کانال‌ها: SMS، web push، in-app؛ quiet hours ۲۲–۸؛ سقف روزانه
  - Test / verification: تست
  - Analytics / monitoring: delivery rate
  - Decision required: F-14
  - Evidence: sms موجود
- [ ] P1-NOTIF-02: صفحهٔ ترجیحات و inbox
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/dashboard/settings/notifications`, `/dashboard/notifications`
  - Required APIs/entities: `/notifications/*`
  - Dependencies: P1-NOTIF-01
  - Acceptance criteria: toggle per category
  - Test / verification: E2E
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-NOTIF-03: هشدار سفارش جدید به فروشنده (SMS + in-app)
  - Category: Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-SEL-03
  - Acceptance criteria: ارسال ≤ ۱ دقیقه
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 17. Analytics and observability

- [ ] P1-OBS-01: taxonomy ۳۸ رویداد و ارسال سرور/کلاینت
  - Category: Analytics (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Product/Frontend
  - Current status: Partial
  - Relevant paths: `lib/analytics.ts`, `api/v1/analytics.py`, `docs/11-analytics-plan.md`
  - Required pages/routes: —
  - Required APIs/entities: `POST /analytics/events`
  - Dependencies: —
  - Acceptance criteria: رویدادهای پرداخت/سفارش سمت سرور
  - Test / verification: تست ارسال
  - Analytics / monitoring: بخش ۹
  - Decision required: ابزار (self-host)
  - Evidence: —
- [ ] P1-OBS-02: logging ساختاریافته + error tracking + metrics
  - Category: DevOps (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Partial
  - Relevant paths: `opentelemetry-api` (فقط API)
  - Required pages/routes: —
  - Required APIs/entities: `/health`, `/ready`
  - Dependencies: —
  - Acceptance criteria: SDK/exporter OTel، Sentry، request-id
  - Test / verification: —
  - Analytics / monitoring: p95، 5xx
  - Decision required: —
  - Evidence: —
- [ ] P1-OBS-03: alert ها: پرداخت ناموفق > ۵٪، صف SMS، 5xx
  - Category: DevOps (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-OBS-02
  - Acceptance criteria: کانال هشدار on-call
  - Test / verification: تست هشدار
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 18. Security and audit logs

- [ ] P1-SEC-01: AuditLog append-only + endpoint خواندن ادمین
  - Category: Backend (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `tests/test_security_idor_audit.py`
  - Required pages/routes: `/admin/audit-log`
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: ثبت: تغییر نقش، تأیید فروشنده، refund، دسترسی PII، rotate QR
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: مدل دیده نمی‌شود
- [ ] P1-SEC-02: security headers و rate limit در `nginx/nginx.conf`
  - Category: DevOps (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Unknown
  - Relevant paths: `nginx/nginx.conf`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: CSP، HSTS، X-Frame-Options، limit_req برای auth/passport
  - Test / verification: scan با ZAP
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-SEC-03: بازبینی امنیتی ۹ فایل حساس (بخش ۱۰ سند ۱)
  - Category: Security (Shared infra)
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `core/security.py`, `auth-context.tsx`, `medical_records.py`, `passport.py`, `payment.py`, `sellers.py`, `admin.py`, `ai_copilot.py`, `main.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: گزارش کتبی یافته‌ها
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-SEC-04: سیاست نگهداری/حذف داده و حذف حساب
  - Category: Legal/Backend (Shared infra)
  - Phase: Phase 1
  - Priority: P1
  - Owner: Legal
  - Current status: Missing
  - Relevant paths: `docs/12-security-privacy.md`
  - Required pages/routes: `/dashboard/profile`
  - Required APIs/entities: `DELETE /users/me`
  - Dependencies: —
  - Acceptance criteria: حذف نرم ۳۰ روز سپس سخت؛ سفارش‌ها ناشناس
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: —

#### 19. QA and testing

- [ ] P1-QA-01: نصب `@playwright/test` و حذف `e2e/playwright.d.ts`
  - Category: QA
  - Phase: Phase 1
  - Priority: P0
  - Owner: QA
  - Current status: Partial
  - Relevant paths: `apps/web/playwright.config.ts`, `e2e/core-flows.spec.ts`, `e2e/playwright.d.ts`, `scripts/ts-resolve.mjs`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: `pnpm --filter web e2e` اجرا شود
  - Test / verification: CI
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: پکیج نصب نیست
- [ ] P1-QA-02: E2E ۸ جریان: onboarding، care، QR عمومی، PDP→پرداخت sandbox، order detail، seller apply→approve، seller order accept، refund
  - Category: QA
  - Phase: Phase 1
  - Priority: P0
  - Owner: QA
  - Current status: Missing
  - Relevant paths: `apps/web/e2e/*`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-QA-01
  - Acceptance criteria: همه سبز روی staging
  - Test / verification: CI nightly
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-QA-03: unit test فرانت (Vitest + RTL)
  - Category: Frontend
  - Phase: Phase 1
  - Priority: P1
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: پوشش ≥ ۶۰٪ برای `packages/ui` و context ها
  - Test / verification: CI
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-QA-04: بازبینی کیفیت ۲۹ تست بک‌اند و اجرا روی Postgres
  - Category: QA/Backend
  - Phase: Phase 1
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `apps/backend/tests/*`, `conftest.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-ENV-02
  - Acceptance criteria: گزارش پوشش ≥ ۷۰٪ ماژول‌های فاز ۱
  - Test / verification: pytest-cov
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 20. Staging, pilot launch and support operations

- [ ] P1-OPS-01: پایلوت بسته: ۵–۱۵ فروشنده، ۲۰۰–۵۰۰ کاربر دعوتی، یک شهر
  - Category: Operations
  - Phase: Phase 1
  - Priority: P0
  - Owner: Founder/Operations
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: Gate-1
  - Acceptance criteria: قرارداد فروشنده، آموزش پنل
  - Test / verification: —
  - Analytics / monitoring: داشبورد پایلوت
  - Decision required: F-01, F-05
  - Evidence: —
- [ ] P1-OPS-02: playbook ها: تأیید فروشنده، سفارش معوق، بازپرداخت، پت گم‌شده، incident امنیتی
  - Category: Operations
  - Phase: Phase 1
  - Priority: P0
  - Owner: Operations
  - Current status: Missing
  - Relevant paths: `docs/` (ساخت `docs/ops/*.md`)
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: هر playbook مالک و SLA دارد
  - Test / verification: tabletop exercise
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-OPS-03: rollback و backup: snapshot روزانه DB، تست restore
  - Category: DevOps
  - Phase: Phase 1
  - Priority: P0
  - Owner: DevOps
  - Current status: Missing
  - Relevant paths: `docker-compose.yml`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: P1-ENV-04
  - Acceptance criteria: RPO ≤ ۲۴h، RTO ≤ ۴h
  - Test / verification: restore drill
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P1-OPS-04: متن‌های حقوقی: قوانین، حریم خصوصی، شرایط فروشنده، سیاست بازگشت
  - Category: Legal
  - Phase: Phase 1
  - Priority: P0
  - Owner: Legal
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/legal/*`
  - Required APIs/entities: —
  - Dependencies: F-09, F-11
  - Acceptance criteria: فارسی، نسخه‌دار، رضایت ثبت‌شده
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: —
### Phase 2 — Trusted Local Services


#### 1. Provider model and verification

- [ ] P2-PRV-01: مدل Provider/ProviderType/Credential با چرخهٔ بررسی و انقضا
  - Category: Backend
  - Phase: Phase 2
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `models/vet.py`, `api/v1/vets.py`
  - Required pages/routes: `/provider/apply`, `/provider/credentials`
  - Required APIs/entities: `/provider/*`, `/admin/providers`
  - Dependencies: Gate-1
  - Acceptance criteria: vet از مدل عمومی Provider ارث ببرد؛ انقضای مدرک خودکار غیرفعال کند
  - Test / verification: pytest
  - Analytics / monitoring: `provider_application_submitted`
  - Decision required: انواع لانچ
  - Evidence: vets فقط
- [ ] P2-PRV-02: SOP تأیید هر نوع ارائه‌دهنده (پروانه نظام دامپزشکی، گواهی مربی)
  - Category: Operations/Legal
  - Phase: Phase 2
  - Priority: P0
  - Owner: Operations
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/admin/providers`
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: چک‌لیست مدارک per type؛ دو بازبین برای vet
  - Test / verification: audit نمونه
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: —

#### 2. Provider directory and map

- [ ] P2-DIR-01: PostGIS و جستجوی نزدیک
  - Category: Backend/DevOps
  - Phase: Phase 2
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `src/core/database.py`
  - Required pages/routes: `/providers`, `/providers/map`
  - Required APIs/entities: `GET /providers?near=`
  - Dependencies: P1-ENV-02
  - Acceptance criteria: index GiST؛ p95 < 500ms
  - Test / verification: تست
  - Analytics / monitoring: `provider_search`
  - Decision required: سرویس نقشه
  - Evidence: —
- [ ] P2-DIR-02: بازطراحی `/vets` به `/providers` با فیلتر نوع
  - Category: Frontend
  - Phase: Phase 2
  - Priority: P1
  - Owner: Frontend
  - Current status: Needs redesign
  - Relevant paths: `src/app/vets/*`, `lib/api/vets.ts`
  - Required pages/routes: `/providers/*`
  - Required APIs/entities: —
  - Dependencies: P2-DIR-01
  - Acceptance criteria: redirect 301 از `/vets`
  - Test / verification: E2E
  - Analytics / monitoring: `provider_viewed`
  - Decision required: —
  - Evidence: صفحات موجود

#### 3. Service catalog

- [ ] P2-SVC-01: ServiceOffering با قیمت شفاف، مدت، eligibility
  - Category: Backend
  - Phase: Phase 2
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/services.py`, `tests/test_services_vaccine_guard.py`
  - Required pages/routes: `/providers/[slug]/services/[id]`
  - Required APIs/entities: `/services/*`
  - Dependencies: P2-PRV-01
  - Acceptance criteria: قیمت نهایی قبل از رزرو
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: vaccine guard

#### 4. Availability and booking

- [ ] P2-BK-01: AvailabilityRule/Exception و slot generation
  - Category: Backend
  - Phase: Phase 2
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/provider/calendar`
  - Required APIs/entities: `GET /services/{id}/slots`
  - Dependencies: P2-SVC-01
  - Acceptance criteria: timezone ثابت؛ تعطیلات
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P2-BK-02: Booking state machine با قفل slot و Idempotency
  - Category: Backend
  - Phase: Phase 2
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `tests/test_vet_booking.py`
  - Required pages/routes: `/book/*`, `/dashboard/bookings/*`
  - Required APIs/entities: `/bookings/*`
  - Dependencies: P2-BK-01
  - Acceptance criteria: requested→confirmed→completed/cancelled/no_show
  - Test / verification: تست concurrency
  - Analytics / monitoring: `booking_confirmed`, `booking_cancelled`
  - Decision required: سیاست لغو
  - Evidence: —

#### 5. Consent and health-record sharing

- [ ] P2-CON-01: HealthShareGrant با scope، انقضا، لغو
  - Category: Backend
  - Phase: Phase 2
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `api/v1/medical_records.py`
  - Required pages/routes: `/dashboard/pets/[petId]/sharing`
  - Required APIs/entities: `/pets/{id}/share-grants`
  - Dependencies: P1-SEC-01
  - Acceptance criteria: پیش‌فرض ۷ روز؛ هر خواندن → AuditLog
  - Test / verification: تست
  - Analytics / monitoring: `share_grant_created`, `share_grant_revoked`
  - Decision required: —
  - Evidence: —
- [ ] P2-CON-02: pre-visit form و آپلود سند/عکس
  - Category: Frontend/Backend
  - Phase: Phase 2
  - Priority: P1
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/book/[id]/pre-visit`
  - Required APIs/entities: `POST /bookings/{id}/attachments`
  - Dependencies: P2-CON-01
  - Acceptance criteria: فقط provider همان booking ببیند
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 6. Provider dashboard

- [ ] P2-PD-01: shell `/provider` با calendar, bookings, services, credentials
  - Category: Frontend
  - Phase: Phase 2
  - Priority: P0
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/provider/*`
  - Required APIs/entities: provider APIs
  - Dependencies: P1-AUTH-04
  - Acceptance criteria: —
  - Test / verification: E2E
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 7. Reviews and disputes

- [ ] P2-RV-01: Review فقط پس از booking.completed
  - Category: Backend
  - Phase: Phase 2
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/dashboard/bookings/[id]/review`
  - Required APIs/entities: `POST /bookings/{id}/review`
  - Dependencies: P2-BK-02
  - Acceptance criteria: یک نظر per booking
  - Test / verification: تست
  - Analytics / monitoring: `provider_review_submitted`
  - Decision required: —
  - Evidence: —
- [ ] P2-RV-02: Dispute workflow برای خدمات
  - Category: Backend/Operations
  - Phase: Phase 2
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `tests/test_admin_disputes.py`
  - Required pages/routes: `/admin/disputes`
  - Required APIs/entities: `/disputes/*`
  - Dependencies: —
  - Acceptance criteria: SLA ۴۸ ساعت
  - Test / verification: تست
  - Analytics / monitoring: `dispute_opened`
  - Decision required: —
  - Evidence: —

#### 8. Support operations

- [ ] P2-SUP-01: playbook no-show، لغو دیرهنگام، شکایت پزشکی
  - Category: Operations
  - Phase: Phase 2
  - Priority: P0
  - Owner: Operations
  - Current status: Missing
  - Relevant paths: `docs/ops/*`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: مستند و آموزش‌دیده
  - Test / verification: tabletop
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 9. Analytics and quality controls

- [ ] P2-AN-01: داشبورد کیفیت ارائه‌دهنده (لغو، no-show، امتیاز)
  - Category: Analytics
  - Phase: Phase 2
  - Priority: P1
  - Owner: Product
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/admin/providers/quality`
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: هشدار زیر آستانه
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 10. QA, privacy and launch gate

- [ ] P2-QA-01: DPIA (ارزیابی اثر حریم) برای اشتراک سلامت و مکان
  - Category: Legal/Security
  - Phase: Phase 2
  - Priority: P0
  - Owner: Legal
  - Current status: Missing
  - Relevant paths: `docs/12-security-privacy.md`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: گزارش امضاشده
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
- [ ] P2-QA-02: E2E رزرو کامل و لغو
  - Category: QA
  - Phase: Phase 2
  - Priority: P0
  - Owner: QA
  - Current status: Missing
  - Relevant paths: `apps/web/e2e/*`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: سبز
  - Test / verification: CI
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
### Phase 3 — Boarding + Events + Loyalty + Subscription


#### 1. Boarding domain model

- [ ] P3-BD-01: BoardingProperty, Room, RoomType, Amenity
  - Category: Backend
  - Phase: Phase 3
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/boarding/[slug]`
  - Required APIs/entities: `/boarding/*`
  - Dependencies: Gate-2
  - Acceptance criteria: —
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: مدل شراکت
  - Evidence: —

#### 2. Room inventory and availability

- [ ] P3-RI-01: RoomInventoryNight با unique(room_id, night) و hold با TTL
  - Category: Backend
  - Phase: Phase 3
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: room selection
  - Required APIs/entities: `GET /boarding/{id}/availability`
  - Dependencies: P3-BD-01
  - Acceptance criteria: ۰ double-booking در تست ۱۰۰ درخواست همزمان
  - Test / verification: load test
  - Analytics / monitoring: `reservation_held`
  - Decision required: —
  - Evidence: —

#### 3. Eligibility and vaccination validation

- [ ] P3-EL-01: موتور eligibility (گونه، اندازه، واکسن معتبر تا تاریخ check-out)
  - Category: Backend
  - Phase: Phase 3
  - Priority: P0
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `tests/test_services_vaccine_guard.py`
  - Required pages/routes: eligibility step
  - Required APIs/entities: `POST /boarding/eligibility`
  - Dependencies: P1-HLT-01
  - Acceptance criteria: دلیل رد به زبان ساده
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: واکسن‌های اجباری
  - Evidence: guard موجود

#### 4. Pricing and add-ons

- [ ] P3-PR-01: RatePlan + PriceRule (آخر هفته، تعطیلات شمسی، اندازه) + AddOn
  - Category: Backend
  - Phase: Phase 3
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: add-on step
  - Required APIs/entities: `POST /boarding/quotes`
  - Dependencies: —
  - Acceptance criteria: PriceBreakdown خط‌به‌خط؛ بدون هزینهٔ پنهان
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 5. Booking / deposit / cancellation

- [ ] P3-BK-01: Reservation + Deposit + سیاست لغو پلکانی
  - Category: Backend
  - Phase: Phase 3
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `api/v1/payment.py`
  - Required pages/routes: deposit checkout
  - Required APIs/entities: `/reservations/*`
  - Dependencies: P1-ORD-04
  - Acceptance criteria: refund خودکار طبق سیاست
  - Test / verification: تست
  - Analytics / monitoring: `deposit_paid`
  - Decision required: مقدار deposit
  - Evidence: —

#### 6. Check-in / check-out

- [ ] P3-CI-01: check-in با تأیید واکسن، وسایل، رضایت اورژانس
  - Category: Frontend/Backend
  - Phase: Phase 3
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/boarding-manager/check-in`
  - Required APIs/entities: `POST /reservations/{id}/check-in`
  - Dependencies: P3-BK-01
  - Acceptance criteria: EmergencyVetConsent امضاشده
  - Test / verification: E2E
  - Analytics / monitoring: `check_in_completed`
  - Decision required: —
  - Evidence: —

#### 7. Daily updates and incident management

- [ ] P3-DU-01: DailyReport + FeedingLog + MedicationAdministrationLog
  - Category: Backend
  - Phase: Phase 3
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/dashboard/stays/[id]/reports`
  - Required APIs/entities: `/reservations/{id}/daily-reports`
  - Dependencies: —
  - Acceptance criteria: حداقل ۱ گزارش روزانه با عکس
  - Test / verification: تست
  - Analytics / monitoring: `daily_report_viewed`
  - Decision required: —
  - Evidence: —
- [ ] P3-IN-01: Incident با اعلان فوری به مالک و ادمین
  - Category: Backend/Operations
  - Phase: Phase 3
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/boarding-manager/incidents`
  - Required APIs/entities: `POST /incidents`
  - Dependencies: P1-NOTIF-01
  - Acceptance criteria: اعلان ≤ ۵ دقیقه؛ SOP
  - Test / verification: تست
  - Analytics / monitoring: `incident_reported`
  - Decision required: —
  - Evidence: —

#### 8. Events and tickets

- [ ] P3-EV-01: Event, TicketType, Ticket, Waitlist + QR ticket
  - Category: Backend
  - Phase: Phase 3
  - Priority: P1
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/events/*`, `/dashboard/tickets/[id]`
  - Required APIs/entities: `/events/*`, `POST /tickets/{id}/scan`
  - Dependencies: —
  - Acceptance criteria: ظرفیت قطعی؛ اسکن یک‌بار
  - Test / verification: تست
  - Analytics / monitoring: `ticket_purchased`, `ticket_scanned`
  - Decision required: —
  - Evidence: —
- [ ] P3-EV-02: پنل برگزارکننده
  - Category: Frontend
  - Phase: Phase 3
  - Priority: P1
  - Owner: Frontend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/organizer/*`
  - Required APIs/entities: —
  - Dependencies: P3-EV-01
  - Acceptance criteria: —
  - Test / verification: E2E
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 9. Loyalty and subscription

- [ ] P3-LY-01: بازطراحی loyalty به LoyaltyLedger قابل حسابرسی؛ ضد گیمیفیکیشن فریبنده
  - Category: Backend/Product
  - Phase: Phase 3
  - Priority: P1
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/loyalty.py`, `models/loyalty.py`, `paw-points-widget.tsx`
  - Required pages/routes: `/dashboard/loyalty`
  - Required APIs/entities: `/loyalty/*`
  - Dependencies: —
  - Acceptance criteria: ledger دوطرفه؛ انقضای شفاف
  - Test / verification: تست
  - Analytics / monitoring: `points_earned`, `points_redeemed`
  - Decision required: ارزش امتیاز
  - Evidence: پیش‌ساخته
- [ ] P3-AS-01: Autoship بالغ با charge خودکار (در صورت پشتیبانی درگاه)
  - Category: Backend
  - Phase: Phase 3
  - Priority: P1
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `api/v1/subscriptions.py`
  - Required pages/routes: `/dashboard/subscriptions/[id]`
  - Required APIs/entities: —
  - Dependencies: F-07
  - Acceptance criteria: اطلاع ۴۸ ساعت قبل از charge
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 10. Operations, QA and launch gate

- [ ] P3-OPS-01: SOP پانسیون و آموزش کارکنان + بیمه مسئولیت
  - Category: Operations/Legal
  - Phase: Phase 3
  - Priority: P0
  - Owner: Operations
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: امضای شریک
  - Test / verification: audit
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —
### Phase 4 — Pet OS + B2B SaaS + Ecosystem


#### 1. Clinic SaaS and B2B model

- [ ] P4-SAAS-01: Organization/Location/OrgMembership و tenant isolation
  - Category: Backend
  - Phase: Phase 4
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/clinic/*`
  - Required APIs/entities: `/orgs/*`
  - Dependencies: Gate-3
  - Acceptance criteria: row-level isolation؛ تست نشت بین tenant
  - Test / verification: تست
  - Analytics / monitoring: `org_created`
  - Decision required: قیمت SaaS
  - Evidence: —

#### 2. Advanced seller / provider CRM

- [ ] P4-CRM-01: CRM مشتری برای فروشنده با دادهٔ تجمیعی، بدون دادهٔ سلامت
  - Category: Backend/Product
  - Phase: Phase 4
  - Priority: P1
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/seller/crm`, `/provider/crm`
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: فقط تاریخچهٔ خرید با رضایت
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 3. Data interoperability and consent

- [ ] P4-INT-01: تبادل رکورد سلامت (الگوی FHIR) با grant
  - Category: Backend
  - Phase: Phase 4
  - Priority: P1
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `api/v1/medical_records.py`
  - Required pages/routes: —
  - Required APIs/entities: `/exchange/*`
  - Dependencies: P2-CON-01
  - Acceptance criteria: provider_verified نوشته شود
  - Test / verification: contract test
  - Analytics / monitoring: —
  - Decision required: استاندارد
  - Evidence: —

#### 4. Partner APIs and integrations

- [ ] P4-API-01: OAuth2 client credentials + ApiKey hashed + Webhook با retry/signature
  - Category: Backend
  - Phase: Phase 4
  - Priority: P0
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: `api/v1/wms_webhooks.py`
  - Required pages/routes: `/partners/*`
  - Required APIs/entities: `/partner/v1/*`
  - Dependencies: —
  - Acceptance criteria: rotation کلید؛ HMAC
  - Test / verification: تست
  - Analytics / monitoring: `api_key_issued`, `webhook_failed`
  - Decision required: —
  - Evidence: webhook پیش‌ساخته
- [ ] P4-API-02: یکپارچگی POS/موجودی
  - Category: Backend
  - Phase: Phase 4
  - Priority: P2
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/settings/integrations`
  - Required APIs/entities: —
  - Dependencies: P4-API-01
  - Acceptance criteria: همگام‌سازی ≤ ۵ دقیقه
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 5. Analytics and forecasting

- [ ] P4-AN-01: پیش‌بینی تقاضا و بینش موجودی برای فروشنده
  - Category: Analytics
  - Phase: Phase 4
  - Priority: P2
  - Owner: Backend
  - Current status: Partial
  - Relevant paths: `services/replenishment.py`
  - Required pages/routes: `/seller/enterprise/forecast`
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: توضیح‌پذیر
  - Test / verification: backtest
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 6. Multi-location and enterprise operations

- [ ] P4-ML-01: فروشندهٔ چندشعبه با موجودی per location
  - Category: Backend
  - Phase: Phase 4
  - Priority: P1
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/seller/enterprise/locations`
  - Required APIs/entities: —
  - Dependencies: P4-SAAS-01
  - Acceptance criteria: —
  - Test / verification: تست
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 7. Community / adoption / insurance evaluation

- [ ] P4-COM-01: ارزیابی adoption و community با moderation؛ بازطراحی `/adopt`
  - Category: Product/Legal
  - Phase: Phase 4
  - Priority: P2
  - Owner: Product
  - Current status: Partial
  - Relevant paths: `api/v1/adoption.py`, `src/app/adopt/page.tsx`, `api/v1/amber_alert.py`
  - Required pages/routes: `/adopt`, `/places`
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: سند تصمیم go/no-go
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: پیش‌ساخته
- [ ] P4-AI-01: ارزیابی AI copilot: غیرتشخیصی، توضیح‌پذیر، human-in-loop
  - Category: Product/Legal
  - Phase: Phase 4
  - Priority: P2
  - Owner: Product
  - Current status: Partial
  - Relevant paths: `api/v1/ai_copilot.py`, `bonyo-copilot-drawer.tsx`, `tests/test_ai_copilot.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: guardrail اورژانس؛ عدم ارسال سلامت به LLM خارجی بدون رضایت
  - Test / verification: red-team
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: پیش‌ساخته

#### 8. Data portability, privacy and governance

- [ ] P4-DP-01: DataExportJob و `/dashboard/data-export`
  - Category: Backend
  - Phase: Phase 4
  - Priority: P1
  - Owner: Backend
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: `/dashboard/data-export`
  - Required APIs/entities: `POST /me/export`
  - Dependencies: —
  - Acceptance criteria: ZIP شامل JSON + PDF پاسپورت سلامت
  - Test / verification: تست
  - Analytics / monitoring: `data_export_requested`
  - Decision required: —
  - Evidence: —

#### 9. Platform observability and resilience

- [ ] P4-OBS-01: OTel SDK کامل، tracing بین سرویس، SLO
  - Category: DevOps (Shared infra)
  - Phase: Phase 4
  - Priority: P0
  - Owner: DevOps
  - Current status: Partial
  - Relevant paths: `opentelemetry-api`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: SLO ۹۹.۹٪
  - Test / verification: chaos test
  - Analytics / monitoring: —
  - Decision required: —
  - Evidence: —

#### 10. Scale and expansion launch gate

- [ ] P4-SC-01: تست بار ۱۰× ترافیک پایلوت و طرح DR چندمنطقه‌ای
  - Category: DevOps
  - Phase: Phase 4
  - Priority: P0
  - Owner: DevOps
  - Current status: Missing
  - Relevant paths: —
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: p95 پایدار
  - Test / verification: k6
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: —
- [ ] P4-NFC-01: ارزیابی تگ NFC (سخت‌افزار) به‌عنوان مکمل QR
  - Category: Product
  - Phase: Phase 4
  - Priority: P2
  - Owner: Product
  - Current status: Partial
  - Relevant paths: `api/v1/nfc.py`, `models/nfc.py`, `tests/test_nfc_tags.py`
  - Required pages/routes: —
  - Required APIs/entities: —
  - Dependencies: —
  - Acceptance criteria: تصمیم تأمین و هزینه
  - Test / verification: —
  - Analytics / monitoring: —
  - Decision required: بله
  - Evidence: پیش‌ساخته

---

## 6. Feature Completion Criteria

> **قواعد مشترک برای همهٔ ویژگی‌ها:** DoR = PRD یک‌صفحه‌ای + طرح UI تأییدشده (موبایل اول، RTL) + قرارداد OpenAPI + نقش‌ها مشخص + رویدادهای analytics تعریف‌شده. DoD = کد merge شده با CI سبز + حالات loading/empty/error/unauthorized + تست‌ها + بازبینی a11y و امنیت + رویدادها در داشبورد + playbook عملیات (در صورت نیاز) + flag برای rollback. جدول زیر فقط موارد **خاص** هر ویژگی را می‌گوید.

| ویژگی | DoR خاص | DoD خاص | حداقل route | API | مجوز | حالات | موبایل/RTL | رویدادها | تست | a11y | امنیت | آمادگی عملیاتی | Flag/Rollback |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Auth | ارائه‌دهندهٔ SMS قراردادی | rate limit فعال؛ cookie httpOnly | `/login`, `/onboarding` | otp request/verify, refresh, logout | public→auth | کد منقضی، 429 | autofill `one-time-code` | sign_up_completed, login_completed | unit+E2E+brute-force | label و اعلان خطا خوانا | pen-test OTP | playbook تغییر شماره | خیر (هسته) |
| Pet Profile | فیلدهای اجباری (P1-PRD-03) | هاب با لینک به ۴ زیرصفحه | list, new, [petId], edit | pets CRUD, photo | owner | پروفایل ناقص | ۳۶۰px | pet_created, pet_profile_completed | IDOR + E2E | فرم کامل کیبوردی | EXIF strip | — | خیر |
| Daily Care | مدل تکرار | تیک idempotent؛ offline queue | care, task detail | occurrences | owner | بدون پت/تسک | gesture | care_task_* | تست تکرار | دکمه‌های ≥ ۴۴px | — | — | خیر |
| Health Timeline | entity ها جدا | badge منبع؛ سلب مسئولیت | health, vacc, meds, weight | health APIs | owner only | empty | نمودار RTL | vaccination_record_created… | تست عدم دسترسی seller | نمودار با جدول جایگزین | تست leak | — | خیر |
| QR Passport | سیاست فیلد عمومی (F-12) | rotate، scan log | passport, `/passport/[token]` | public view, rotate, sightings | public allow-list | token لغوشده | بدون 3D | qr_* | snapshot پاسخ عمومی | کنتراست بالا | rate limit | playbook پت گم‌شده | lost-mode flag |
| Catalog | دسته‌ها (F-10) | دادهٔ واقعی | shop, category, search | catalog APIs | public | بدون نتیجه | فیلتر bottom sheet | catalog_viewed, category_viewed, search_performed | تست جستجوی فارسی | — | — | moderation آماده | — |
| Product Detail | قانون Buy Box | variant + offer + سازگاری | `/shop/[productSlug]` | detail, offers | public | همه ناموجود | گالری لمسی | product_viewed, add_to_cart | E2E | alt تصویر | — | — | — |
| Seller Offer / Inventory | قرارداد فروشنده | رزرو و آزادسازی | seller products/inventory | offers, stock | seller own | قیمت تغییرکرده | جدول ریسپانسیو | seller_inventory_updated | concurrency | — | IDOR | آموزش فروشنده | — |
| Cart | — | سرور-محور، ادغام guest | `/cart` | cart CRUD | owner/guest | ناموجود | — | cart_viewed | E2E | — | — | — | — |
| Checkout | درگاه + fulfillment | quote شفاف؛ Idempotency | checkout, callback, failed | quote, checkout | auth | رزرو منقضی | بدون 3D | checkout_started | E2E sandbox | فرم آدرس کامل | CSRF | — | maintenance flag |
| Orders | state machine | split per seller | orders, detail, tracking | orders | owner | — | timeline | order_created, order_cancelled, order_delivered | تست انتقال | — | IDOR | playbook تأخیر | — |
| Reorder | فرمول replenishment | برچسب توضیح‌پذیر | reorder | due, reorder | owner | داده کم | — | reorder_viewed, reorder_completed | unit فرمول | — | — | — | flag |
| Autoship | F-07 | pause/skip/cancel self-service | subscriptions | subscriptions | owner | flag خاموش | — | autoship_started, autoship_paused | تست چرخه | — | — | ظرفیت fulfillment | **الزامی** |
| Seller Panel | قرارداد + KYC | ۶ زیرصفحه | `/seller/*` | seller APIs | seller owner/staff | suspended | tablet | seller_* | E2E | جدول کیبوردی | بدون داده سلامت | آموزش + SLA | — |
| Admin Panel | SOP ها | ۹ زیرصفحه + audit | `/admin/*` | admin APIs | scoped | — | دسکتاپ اول | seller_approved | E2E | — | 2FA، AuditLog | تیم ops | — |
| Notifications | کانال‌ها (F-14) | quiet hours؛ dedupe | settings, inbox | prefs, inbox | owner | — | push PWA | reminder_* | تست dedupe | — | opt-out | مانیتور صف | per-channel flag |
| Provider Booking | Gate-1 | state machine؛ grant | `/providers/*`, `/book/*` | bookings | provider/owner | — | — | booking_* | concurrency | — | consent | SOP | الزامی |
| Boarding | Gate-2 | ۰ double-booking | `/boarding/*` | reservations | boarding mgr | — | room map 2D | reservation_* | load | — | رسانه خصوصی | SOP + بیمه | الزامی |
| Events | Gate-2 | اسکن یک‌بار | `/events/*` | tickets | organizer | ظرفیت پر | QR آفلاین | ticket_* | تست | — | — | SOP ورود | الزامی |
| Loyalty | ارزش امتیاز | ledger | `/dashboard/loyalty` | loyalty | owner | — | — | points_* | تست ledger | — | ضد تقلب | — | الزامی |
| B2B SaaS | Gate-3 + شریک | tenant isolation | `/clinic/*`, `/partners/*` | org, partner | org roles | — | دسکتاپ | org_* | تست نشت tenant | — | OAuth | SLA | الزامی |

---

## 7. Roles and Permission Gap Matrix

> وضعیت فعلی: مدل نقش در `models/user.py`/`core/security.py` → UNKNOWN_FROM_STRUCTURE. همهٔ نقش‌های زیر باید صریحاً تعریف شوند.

| نقش | دسترسی لازم | ممنوع | محدودیت دادهٔ حساس | نیاز به تأیید | لاگ ممیزی | فاز |
|---|---|---|---|---|---|---|
| Pet Parent | پت‌ها، سلامت، سفارش‌ها، آدرس‌ها، پاسپورت خودش | دادهٔ دیگران، پنل‌ها | مالک کامل دادهٔ خود | — | تغییر فیلد عمومی QR، حذف حساب | 1 |
| Household Member | پت‌های مشترک با سطح view/edit | حذف پت، تغییر مالکیت، پرداخت با کارت مالک | فقط با دعوت و scope | دعوت مالک | پذیرش/لغو دعوت | 1 (مدل) / 4 (کامل) |
| Seller Owner | فروشگاه، offer، موجودی، سفارش‌های خود، تسویه | **هر دادهٔ پت/سلامت**، سفارش دیگر فروشندگان، PII کامل خریدار | فقط نام گیرنده، آدرس ارسال، تلفن ماسک‌شده تا تحویل | تأیید ادمین (KYC) | تغییر قیمت، شبا، staff | 1 |
| Seller Staff | سفارش و موجودی | تسویه، شبا، تنظیمات staff | مانند Seller Owner | دعوت owner | همه اقدامات سفارش | 1 |
| Admin | صف‌ها، moderation، عملیات | خواندن سلامت بدون دلیل ثبت‌شده؛ refund بالای سقف | دسترسی PII با «دلیل» | 2FA | **همه اقدامات** | 1 |
| Support Agent | تیکت، سفارش، پروفایل کاربر (ماسک) | سلامت، تسویه، تغییر نقش | PII ماسک؛ unmask با دلیل | 2FA | unmask و هر تغییر | 1 |
| Finance Operator | refund، تسویه، reconcile | کاتالوگ، سلامت | دادهٔ مالی | 2FA + تأیید دوم بالای سقف | همه | 1 |
| Moderator | محصولات، نظرات، (بعداً) پروفایل provider | سفارش، مالی، سلامت | — | — | تصمیمات | 1 |
| Super Admin | مدیریت نقش‌ها، flag ها | استفادهٔ روزمره | break-glass | ۲ نفره | همه + هشدار | 1 |
| System / Background Worker | ارسال اعلان، رزرو، reconcile | خواندن سلامت جز برای یادآور خود | token سرویس با scope حداقلی | — | job ها | 1 |
| Veterinarian | پروفایل، تقویم، رزرو، رکورد سلامت **فقط با grant** | جستجوی آزاد بیماران | scope + انقضا | تأیید پروانه | هر خواندن رکورد | 2 |
| Clinic Manager | کارکنان و تقویم کلینیک | رکورد بدون grant | مانند vet | تأیید کلینیک | همه | 2 / 4 |
| Trainer | رزروها، یادداشت رفتاری | سلامت (جز با grant رفتاری) | — | تأیید مدرک | — | 2 |
| Groomer | رزروها، حساسیت‌ها (با grant) | سایر سلامت | فقط allergy با grant | تأیید | — | 2 |
| Pet Sitter / Walker | رزرو، دستور مراقبت، آدرس در زمان رزرو | آدرس پس از پایان رزرو | آدرس موقت | تأیید هویت | دسترسی آدرس | 2 |
| Boarding Manager | اتاق، رزرو، check-in، گزارش، حادثه | سلامت خارج از رزرو فعال | واکسن/دارو با grant رزرو | تأیید ملک | تجویز دارو، حادثه | 3 |
| Boarding Staff | گزارش روزانه، لاگ غذا/دارو | قیمت، مالی | — | دعوت manager | همه لاگ‌ها | 3 |
| Event Organizer | رویداد، بلیت، اسکن | دادهٔ پت جز نام/گونه | — | تأیید | اسکن، refund | 3 |
| Public QR Viewer | فقط فیلدهای allow-list | هر چیز دیگر | — | — | ScanLog | 1 |

---

## 8. Data, API, and State-Machine Gaps

> ستون‌ها فشرده شده‌اند: **E/F/R** = entities/fields/relationships · **IDX/MIG** = index و migration · **SD** = soft delete/retention · **SM** = state machine · **VAL** = validation · **IDEM** = idempotency · **AUD** = audit · **API/AUTHZ/ERR** · **JOB/NOTIF** = webhook/background job و trigger اعلان.

| دامنه | E/F/R ناموجود | IDX/MIG | SD | SM | VAL | IDEM | AUD | API/AUTHZ/ERR | JOB/NOTIF |
|---|---|---|---|---|---|---|---|---|---|
| seller verification | SellerApplication(status, reviewer_id, reason), KycDocument(storage_key, type) | idx(status, created_at)؛ migration جدید | مدارک ۵ سال پس از قطع همکاری | draft→submitted→under_review→approved/rejected→suspended→reinstated | شبا ۲۶ کاراکتر IR، کد ملی | submit یکتا per user | همه انتقال‌ها | admin-only approve؛ خطای `SELLER_NOT_APPROVED` | اعلان نتیجه به فروشنده |
| product moderation | ProductRequest, Product.status, ModerationDecision | idx(status) | — | pending→approved/rejected/needs_changes | تصویر ≥ 800px، عنوان فارسی | — | تصمیم | moderator | اعلان فروشنده |
| inventory | InventoryLevel(offer_id, on_hand, reserved), StockMovement | unique(offer_id)؛ check(on_hand ≥ reserved ≥ 0) | movements ۲ سال | — | — | update با version (optimistic) | تغییر دستی | seller own؛ `INSUFFICIENT_STOCK` | low-stock alert |
| cart | Cart(user_id/guest_token), CartItem(offer_id, qty, price_snapshot) | idx(user_id) | پاک‌سازی guest ۳۰ روز | — | qty ≤ stock | — | — | owner | یادآور سبد رها (opt-in) |
| checkout | CheckoutSession, InventoryReservation(expires_at) | idx(expires_at) | — | open→reserved→paid/expired | مبلغ از سرور | `Idempotency-Key` header | — | `RESERVATION_EXPIRED`, `PRICE_CHANGED` | job آزادسازی رزرو |
| payment | Payment(order_id, amount, gateway, ref, status), PaymentAttempt | unique(gateway, ref) | ۱۰ سال (مالی) | initiated→pending→succeeded/failed/cancelled→refunded(partial) | مبلغ = order.total | callback idempotent بر ref | همه | system؛ `PAYMENT_VERIFY_FAILED` | reconcile روزانه |
| order | Order, SellerOrder(seller_id, status, sla_due_at), OrderItem | idx(seller_id, status) | ۱۰ سال | placed→paid→(per SellerOrder) pending_acceptance→accepted→packed→shipped→delivered / rejected / cancelled | — | — | تغییر حالت | owner/seller own | اعلان هر انتقال |
| shipment | Shipment(seller_order_id, carrier, tracking_code, status), ShipmentEvent | idx(tracking_code) | — | created→picked_up→in_transit→delivered/failed/returned | — | webhook dedupe | — | — | webhook حامل |
| refund | Refund(payment_id, amount, reason, approved_by[]) | — | ۱۰ سال | requested→approved→processing→completed/failed | amount ≤ captured | یکتا per request | **همه** | finance؛ سقف | اعلان کاربر |
| reminder | Reminder(pet_id, rrule, channel, next_fire_at), Occurrence | idx(next_fire_at) | ۱ سال occurrences | scheduled→sent→done/snoozed/skipped | rrule معتبر | fire یکتا per occurrence | — | owner | worker هر دقیقه |
| vaccination | Vaccination(pet_id, vaccine_code, given_at, next_due_at, source, verification_state, document_key) | idx(pet_id) | soft delete؛ حذف کامل با حساب | owner_entered→provider_verified | given_at ≤ امروز | — | خواندن غیرمالک | owner؛ seller ممنوع | reminder next_due |
| medication | Medication(dose, unit, frequency, start, end) + DoseLog | — | مانند بالا | active→completed/stopped | — | — | — | owner | reminder dose |
| QR token | PassportToken(token_hash, pet_id, created_at, revoked_at), PublicFieldConfig, QrScanLog(ip_hash, at, coarse_location) | unique(token_hash) | scan log ۹۰ روز | active→revoked | — | — | rotate | public read allow-list؛ `TOKEN_REVOKED` → 404 عمومی | اعلان اسکن |
| provider credential | Credential(type, number, issuer, expires_at, status) | idx(expires_at) | — | submitted→verified/rejected→expired | — | — | همه | admin | هشدار انقضا ۳۰ روز |
| booking | Booking(slot, provider_id, pet_id, status, policy_snapshot), BookingEvent | exclusion constraint روی (provider, tstzrange) | — | requested→confirmed→checked_in→completed / cancelled_by_user / cancelled_by_provider / no_show | — | ایجاد idempotent | — | owner/provider | یادآور ۲۴h و ۲h |
| boarding room availability | RoomInventoryNight(room_id, night, status, hold_expires_at) | unique(room_id, night) | — | free→held→booked→blocked | — | hold idempotent | — | — | job آزادسازی hold |
| boarding reservation | Reservation, ReservationPet, Deposit, CheckIn/Out, DailyReport, Incident | — | رسانه ۱ سال | held→deposit_paid→confirmed→checked_in→checked_out / cancelled / no_show | eligibility | — | حادثه، دارو | — | گزارش روزانه |
| ticket | Ticket(code_hash, status), TicketType(capacity) | unique(code_hash) | — | reserved→paid→scanned / refunded / void | ظرفیت | scan یکتا | scan | — | — |
| loyalty / subscription | LoyaltyLedger(delta, reason, ref), Subscription(status, interval, next_run_at), SubscriptionRun | idx(next_run_at) | — | sub: active→paused→cancelled؛ run: scheduled→skipped/created_order/failed | — | run یکتا per دوره | — | owner | اعلان ۴۸h قبل |
| consent | ConsentRecord(user_id, purpose, version, granted_at, revoked_at), HealthShareGrant | idx(user_id, purpose) | تاریخچهٔ کامل | granted→revoked/expired | — | — | **همه** | owner | — |
| audit log | AuditLog(actor_id, actor_role, action, target_type, target_id, reason, ip_hash, at, diff) | idx(target), idx(actor), partition ماهانه | ۲ سال؛ append-only (بدون UPDATE/DELETE) | — | — | — | — | super_admin/admin read | هشدار اقدامات حساس |

**یافتهٔ مشترک:** برای `settlement`, `subscription`, `logistics`, `vet`, `loyalty`, `amber_alert`, `nfc`, `adoption` هیچ migration در `apps/backend/migrations/versions/` نیست. قبل از هر کار جدید: `alembic revision --autogenerate` روی Postgres و بازبینی دستی.

---

## 9. Analytics and Observability Checklist

### فاز ۱
- **رویدادهای کلیدی (اجباری):** `sign_up_completed`, `login_completed`, `pet_created`, `pet_profile_completed`, `care_task_created`, `care_task_completed`, `reminder_created`, `reminder_snoozed`, `reminder_completed`, `vaccination_record_created`, `medication_record_created`, `weight_logged`, `qr_passport_viewed`, `qr_public_page_viewed`, `catalog_viewed`, `category_viewed`, `search_performed`, `product_viewed`, `add_to_cart`, `cart_viewed`, `checkout_started`, `payment_started`, `payment_completed`, `payment_failed`, `order_created`, `order_cancelled`, `order_delivered`, `reorder_viewed`, `reorder_completed`, `autoship_started`, `autoship_paused`, `seller_application_submitted`, `seller_approved`, `seller_product_created`, `seller_inventory_updated`, `seller_order_accepted`, `seller_order_fulfilled`, `support_ticket_created`.
- **ویژگی‌های مشترک هر رویداد:** `user_id` (hash)، `pet_id` (در صورت وجود)، `session_id`, `platform`, `app_version`, `ts`. **هرگز** متن سلامت، نام دارو یا حساسیت در payload نباشد.
- **رویدادهای سمت سرور:** `payment_*`, `order_*`, `seller_order_*`, `seller_approved` (کلاینت قابل اعتماد نیست).
- **Funnel کاربر:** sign_up → pet_created → pet_profile_completed → care_task_completed (D1) → product_viewed → add_to_cart → checkout_started → payment_completed → reorder_completed (D60).
- **Funnel فروشنده:** seller_application_submitted → seller_approved → seller_product_created → seller_inventory_updated → seller_order_accepted → seller_order_fulfilled.
- **KPI کسب‌وکار:** GMV، AOV، نرخ خرید دوم ۶۰ روزه، WAU/MAU، درصد کاربران با پت کامل، فروشندهٔ فعال هفتگی.
- **قابلیت اطمینان:** uptime API ≥ ۹۹.۵٪؛ p95 API < ۵۰۰ms؛ نرخ موفقیت callback پرداخت ≥ ۹۹٪؛ تحویل SMS ≥ ۹۵٪.
- **عملیاتی:** زمان پذیرش سفارش فروشنده، نرخ رد، لغو به‌دلیل ناموجودی، زمان تأیید فروشنده، زمان پاسخ اول تیکت.
- **هشدار:** payment_failed > ۵٪ در ۱۵ دقیقه؛ 5xx > ۱٪؛ صف SMS > ۵ دقیقه؛ سفارش بدون پذیرش > ۲ ساعت؛ backup ناموفق.
- **داشبورد:** Funnel، Retention cohort، Seller ops، Payment health، Reminder delivery.

### فاز ۲
- **رویدادها:** `provider_search`, `provider_viewed`, `booking_started`, `booking_confirmed`, `booking_cancelled`, `booking_completed`, `booking_no_show`, `share_grant_created`, `share_grant_revoked`, `provider_review_submitted`, `dispute_opened`, `provider_application_submitted`, `provider_verified`.
- **Funnel کاربر:** search → view → booking_started → confirmed → completed → review. **Funnel ارائه‌دهنده:** apply → verified → first slot → first completed booking.
- **KPI:** GMV خدمات، نرخ تکمیل، امتیاز میانگین. **قابلیت اطمینان:** ۰ تداخل slot. **هشدار:** no-show > ۱۰٪؛ مدرک منقضی فعال. **داشبورد:** کیفیت ارائه‌دهنده.

### فاز ۳
- **رویدادها:** `boarding_search`, `eligibility_failed`, `reservation_held`, `deposit_paid`, `check_in_completed`, `check_out_completed`, `daily_report_viewed`, `incident_reported`, `event_viewed`, `ticket_purchased`, `ticket_scanned`, `waitlist_joined`, `points_earned`, `points_redeemed`, `autoship_order_created`.
- **KPI:** اشغال شبانه، درآمد per شب، نرخ رویداد پر، نرخ تمدید Autoship. **هشدار:** double-booking (باید ۰ باشد)، حادثهٔ بی‌پاسخ > ۱۵ دقیقه.

### فاز ۴
- **رویدادها:** `org_created`, `org_member_invited`, `api_key_issued`, `webhook_delivered`, `webhook_failed`, `integration_connected`, `data_export_requested`, `record_exchanged`.
- **KPI:** MRR SaaS، churn سازمان، تماس API. **قابلیت اطمینان:** SLO ۹۹.۹٪، تحویل webhook ≥ ۹۹٪. **داشبورد:** per-tenant usage، API health.

---

## 10. Risks, Dependencies, and Founder Decisions

### A. Risk register

| ID | Risk | Phase | Likelihood | Impact | Mitigation | Owner | Trigger |
|---|---|---|---|---|---|---|---|
| R-01 | نشت دادهٔ سلامت به فروشنده از طریق schema پاسخ مشترک | 1 | Medium | Critical | schema جدا برای seller + تست P1-HLT-02 | Backend | هر تغییر در `sellers.py`/`order.py` |
| R-02 | فرانت روی mock؛ لانچ با دادهٔ غیرواقعی | 1 | High | High | P1-DEV-06 + lint rule | Frontend | import از `data/mock-*` |
| R-03 | schema drift: ۸ مدل بدون migration | 1 | High | High | P1-RE-03 و autogenerate روی Postgres | Backend | خطای `relation does not exist` |
| R-04 | oversell در چندفروشنده | 1 | Medium | High | رزرو + optimistic locking | Backend | لغو به‌دلیل ناموجودی > ۲٪ |
| R-05 | پرداخت reconcile‌نشده / callback تکراری | 1 | Medium | Critical | idempotency + reconcile روزانه | Backend/Finance | اختلاف گزارش درگاه |
| R-06 | گزارش‌های تکمیل عامل به‌عنوان حقیقت پذیرفته شوند | 1 | High | High | فقط launch gate این سند معتبر است | Product | استناد به `.bonyo/reports/*` در go/no-go |
| R-07 | پراکندگی تیم روی ماژول‌های فاز ۲–۴ | 1 | High | High | freeze با flag (P1-PRD-02) | Founder | PR جدید روی `nfc`/`adoption`/`ai_copilot` |
| R-08 | ادعای پزشکی AI | 1–4 | Medium | Critical | `ai_copilot` خاموش؛ guardrail | Product/Legal | فعال‌شدن flag |
| R-09 | فروشندهٔ کم‌کیفیت و SLA ضعیف | 1 | Medium | High | انتخاب دستی ۵–۱۵ فروشنده، SLA در قرارداد | Operations | پذیرش > ۲h |
| R-10 | توکن JWT در localStorage → XSS | 1 | Unknown | High | P1-AUTH-02 | Backend | بازبینی `auth-context.tsx` |
| R-11 | عملکرد 3D روی موبایل ارزان | 1 | Medium | Medium | progressive + بودجه | Frontend | LCP > 2.5s |
| R-12 | تحریم/دسترسی سرویس‌های خارجی (CDN، push، Sentry) | 1 | High | Medium | سرویس‌های self-host/داخلی | DevOps | قطع سرویس |
| R-13 | پروانهٔ جعلی ارائه‌دهنده | 2 | Medium | Critical | SOP دو بازبین | Operations | شکایت |
| R-14 | double-booking پانسیون | 3 | Medium | Critical | unique constraint + load test | Backend | هر تداخل |
| R-15 | حادثه برای حیوان در پانسیون | 3 | Low | Critical | SOP، بیمه، رضایت اورژانس | Operations | Incident |
| R-16 | نشت بین tenant در SaaS | 4 | Low | Critical | RLS + تست | Backend | — |

### B. Dependency register

| ID | Dependency | Type | Phase | Blocking Level | Owner | Required By |
|---|---|---|---|---|---|---|
| D-01 | درگاه پرداخت (شاپرک: زرین‌پال/IDPay/بانکی) با sandbox | External | 1 | Blocking | Founder/Finance | P1-ORD-04 |
| D-02 | سرویس SMS (کاوه‌نگار/قاصدک/…) و خط خدماتی | External | 1 | Blocking | Founder | P1-AUTH-01 |
| D-03 | Object storage S3-compatible (ArvanCloud/MinIO) | Infra | 1 | Blocking | DevOps | P1-PET-02 |
| D-04 | Postgres مدیریت‌شده + backup | Infra | 1 | Blocking | DevOps | P1-ENV-02 |
| D-05 | شریک ارسال/پیک per شهر | External | 1 | Blocking | Operations | P1-ORD-02 |
| D-06 | قرارداد ۵–۱۵ فروشندهٔ اولیه | Business | 1 | Blocking | Founder | P1-OPS-01 |
| D-07 | تأیید برند و نام نهایی | Decision | 1 | High | Founder | P1-DS-01 |
| D-08 | queue/worker (Redis + ARQ/Celery) | Infra | 1 | Blocking | Backend | P1-CARE-02 |
| D-09 | پلتفرم CI | Infra | 1 | High | DevOps | P1-DEV-05 |
| D-10 | مشاور حقوقی (حریم، تجارت الکترونیک، اینماد) | Legal | 1 | Blocking | Founder | P1-OPS-04 |
| D-11 | سرویس نقشهٔ داخلی + PostGIS | External | 2 | Blocking | Backend | P2-DIR-01 |
| D-12 | تقویم تعطیلات رسمی | Data | 3 | High | Backend | P3-PR-01 |

### C. Founder decision register

| ID | Decision Needed | Why It Matters | Options | Recommended Default | Deadline / Phase Gate | Impact if Delayed |
|---|---|---|---|---|---|---|
| F-01 | جغرافیای لانچ | ارسال، فروشنده، مارکتینگ | تهران / شهر دیگر / چند شهر | فقط تهران (چند منطقه) | قبل از P1-OPS-01 | جذب فروشنده متوقف |
| F-02 | گونهٔ هدف / بخش اول | دسته‌ها، تسک‌ها، محتوا | سگ+گربه / فقط گربه / همه | سگ + گربه؛ پرندگان و کوچک‌ها فقط کاتالوگ | Sprint بعدی | schema و محتوا مبهم |
| F-03 | مدل مارکت‌پلیس | کمیسیون، Buy Box | marketplace کامل / curated / هیبرید | curated marketplace با فروشندگان دعوتی | قبل از P1-PRD-04 | — |
| F-04 | مالکیت موجودی | ریسک مالی | فروشنده / بونیو / هیبرید | ۱۰۰٪ فروشنده در فاز ۱ | Gate-1 | — |
| F-05 | فروشندگان و قراردادهای اولیه | پایلوت | — | ۵–۱۵ پت‌شاپ با SLA مکتوب | ۶ هفته قبل از پایلوت | پایلوت ممکن نیست |
| F-06 | مدل fulfillment | هزینه ارسال، tracking | فروشنده ارسال / پیک بونیو / حامل | فروشنده ارسال + هزینه ثابت per فروشنده | قبل از P1-ORD-02 | checkout ناقص |
| F-07 | ارائه‌دهندهٔ پرداخت و قابلیت charge مکرر | Autoship | زرین‌پال / IDPay / بانک / پرداخت مستقیم (direct debit) | یک PSP با sandbox؛ Autoship بدون charge خودکار | قبل از P1-ORD-04 | پرداخت مسدود |
| F-08 | زمان‌بندی تسویه و کمیسیون | اعتماد فروشنده | هفتگی / دوهفته‌ای / ماهانه | هفتگی پس از تحویل + ۷ روز | قبل از P1-SEL-05 | ریزش فروشنده |
| F-09 | سیاست بازگشت/بازپرداخت | حقوقی و عملیات | — | ۷ روز برای کالای باز نشده؛ غذا باز شده غیرقابل بازگشت | قبل از P1-OPS-04 | — |
| F-10 | سیاست تخفیف | حاشیه | کد تخفیف / بدون تخفیف | فقط کد تخفیف اولین خرید با سقف | Gate-1 | — |
| F-11 | دسته‌های محصول در لانچ | کاتالوگ | — | غذا خشک/تر، تشویقی، خاک گربه، بهداشت، اسباب‌بازی | قبل از P1-CAT-02 | — |
| F-12 | سیاست اطلاعات عمومی QR | حریم | حداقلی / قابل تنظیم | پیش‌فرض حداقلی + قابل تنظیم؛ تماس از طریق relay | قبل از P1-QR-02 | — |
| F-13 | سیاست حریم سلامت | قانونی | — | فقط مالک؛ اشتراک با grant از فاز ۲ | قبل از P1-HLT-01 | — |
| F-14 | کانال‌های اعلان | هزینه SMS | SMS / web push / ایمیل | web push + in-app پیش‌فرض؛ SMS برای OTP و سفارش | قبل از P1-NOTIF-01 | هزینه بالا |
| F-15 | زمان لانچ موبایل | `apps/mobile` خالی | بومی همزمان / PWA اول | PWA در فاز ۱؛ Expo پس از Gate-1 | الان | پراکندگی |
| F-16 | تأیید طراحی و برند (Bonyo vs Bonnivo) | دارایی‌ها | — | «بونیو / Bonyo» و تغییر نام فایل‌ها | الان | دوباره‌کاری |
| F-17 | اولویت 3D Island | هزینه | الان / بعد | فقط hero موجود؛ zone ها پس از Gate-1 | الان | — |
| F-18 | تیم / بودجه / زمان | واقع‌بینی | — | ۱۲–۱۶ هفته تا پایلوت با ۲ FE، ۲ BE، ۱ طراح، ۱ QA، ۱ ops | الان | — |
| F-19 | الزامات حقوقی (اینماد، حریم، مالیات) | لانچ | — | مشاور حقوقی | Gate-1 | لانچ غیرقانونی |
| F-20 | ساعات پشتیبانی | SLA | — | ۹–۲۱ شنبه تا پنجشنبه | Gate-1 | — |
| F-21 | gate گسترش خدمات | فاز ۲ | — | معیارهای بخش ۲ | Gate-1 | ورود زودهنگام |
| F-22 | gate گسترش پانسیون | فاز ۳ | — | معیارهای بخش ۲ + بیمه | Gate-2 | ریسک حادثه |
| F-23 | سرنوشت ماژول‌های پیش‌ساخته | تمرکز | حذف / flag / شاخهٔ جدا | flag خاموش + عدم توسعه | الان | پراکندگی |

---

## 11. What Not to Build Yet

| فاز | مورد | دلیل | ریسک | شرط بازنگری | فاز آینده |
|---|---|---|---|---|---|
| 1 | توسعهٔ بیشتر `ai_copilot.py` / `bonyo-copilot-drawer.tsx` | ادعای پزشکی | Critical | guardrail + بازبینی حقوقی | 4 |
| 1 | `vets.py`, `/vets/*`, `/dashboard/appointments` | نیاز به تأیید ارائه‌دهنده و consent | High | Gate-1 | 2 |
| 1 | `services.py` (جز vaccine guard به‌عنوان کتابخانه) | — | Medium | Gate-1 | 2/3 |
| 1 | `loyalty.py`, `paw-points-widget.tsx` | گیمیفیکیشن قبل از retention واقعی | Medium | خرید دوم ≥ ۲۵٪ | 3 |
| 1 | `live-courier-map.tsx`، dispatch زنده | fulfillment توسط فروشنده | Medium | پیک اختصاصی | 3 |
| 1 | `wms_webhooks.py` | ERP مستثنا | Medium | شریک WMS | 4 |
| 1 | `nfc.py` | سخت‌افزار | Medium | تقاضای اثبات‌شده QR | 4 |
| 1 | `adoption.py`, `/adopt` | moderation و حقوقی | High | سیاست community | 4 |
| 1 | amber alert جمعی (broadcast مکانی) | حریم مکان، سوءاستفاده | High | moderation + rate limit | 4 |
| 1 | Autoship با charge خودکار | پرداخت مکرر نامشخص | High | F-07 | 3 |
| 1 | فروشندهٔ self-service بدون moderation | کیفیت | High | ۳ ماه SLA پایدار | 2+ |
| 1 | اپ بومی موبایل | منابع | Medium | Gate-1 | 1.5 |
| 1 | zone های 3D کامل | هزینه | Low | Gate-1 | 2 |
| 1 | توصیه‌گر ML | داده کم | Medium | ≥ ۱۰k سفارش | 4 |
| 1 | چند ارز/چند کشور | — | — | — | 4+ |
| 1 | پیام آزاد کاربر↔فروشنده | moderation | High | سیاست | 2 |
| 2 | ویزیت آنلاین / نسخه | قانونی | Critical | مجوز | — |
| 2 | چت آزاد با provider | moderation | High | ابزار moderation | 3 |
| 3 | کیف پول / اعتبار ذخیره | مجوز پرداخت | High | مجوز | 4 |
| 3 | گیمیفیکیشن رقابتی | فریبنده | Medium | — | — |
| 4 | بیمه | قانونی | High | شریک بیمه | 4+ |
| 4 | شبکهٔ اجتماعی باز | خلاف فلسفه | High | — | — |
| 4 | بین‌المللی‌سازی | مدل کسب‌وکار | Medium | اثبات بازار داخلی | — |

---

## 12. Launch Gates

| معیار | Gate-1 (Commerce + Care) | Gate-2 (Services) | Gate-3 (Boarding/Events/Loyalty) | Gate-4 (Ecosystem) |
|---|---|---|---|---|
| کامل‌بودن محصول | همهٔ P0 بخش ۵ فاز ۱؛ ۶۵ صفحهٔ فاز ۱ ثبت‌شده در بخش ۴ با وضعیت Exists | همه P0 فاز ۲ | همه P0 فاز ۳ | همه P0 فاز ۴ |
| طراحی | Bonyo Care System تأییدشده؛ همه صفحات با primitives | Calendar/Map | RoomMap 2D | داشبورد B2B |
| کیفیت کد | CI سبز؛ ۰ import از mock؛ یک entrypoint؛ migration سبز روی Postgres | — | — | — |
| تست‌ها | ۸ E2E سبز؛ pytest ≥ ۷۰٪ | E2E رزرو؛ concurrency | load test ۰ double-booking | تست نشت tenant |
| امنیت | P1-SEC-01..03؛ pen-test OTP/QR/IDOR | consent audit | — | OAuth review |
| حریم | تست عدم دسترسی seller به سلامت؛ متن حریم منتشرشده | DPIA | رسانه خصوصی | DPA شرکا |
| دسترس‌پذیری | WCAG AA روی ۱۰ جریان | — | — | — |
| مانیتورینگ | Sentry + metrics + ۵ هشدار بخش ۹ | — | — | SLO |
| playbook عملیات | ۵ playbook P1-OPS-02 | no-show، شکایت | SOP پانسیون، حادثه | SLA شرکا |
| پشتیبانی | تیکت + ساعات اعلام‌شده + ۲ نفر آموزش‌دیده | — | پشتیبانی آخر هفته | — |
| آمادگی فروشنده/ارائه‌دهنده | ≥ ۵ فروشندهٔ تأییدشده با ≥ ۳۰۰ offer فعال | ≥ ۱۰ ارائه‌دهندهٔ تأییدشده | ≥ ۳ پانسیون | ≥ ۳ شریک |
| پرداخت و بازپرداخت | ۲۰ تراکنش واقعی کوچک + ۵ refund موفق در staging/prod | deposit | deposit + refund پلکانی | — |
| rollback | flag برای Autoship/QR lost mode؛ restore drill موفق | flag booking | flag boarding | flag per tenant |
| معیار پایلوت | ۴ هفته: ≥ ۲۰۰ کاربر، ≥ ۱۵۰ سفارش، شکست پرداخت < ۳٪، ۰ رخداد حریم | ۴ هفته: ≥ ۱۰۰ رزرو | ≥ ۵۰ شب | ≥ ۱ شریک فعال |
| تصمیم go/no-go | Founder + Product + QA lead (امضای سه‌گانه) | همان + Ops | همان + Legal | همان + CTO |

---

## 13. Final Prioritized Action Plan

### A. Top 30 actions before Phase 1 launch
1. منسوخ‌اعلام‌کردن تعریف قدیم فازها و `.bonyo/reports/*-completion-report.md` (P1-PRD-01).
2. freeze ماژول‌های فاز ۲–۴ پشت flag (P1-PRD-02, P1-DEV-04).
3. حذف `bonnivo.db` و artifact ها؛ بررسی تاریخچهٔ git (P1-DEV-02).
4. یکپارچه‌سازی `main.py` (P1-DEV-01).
5. Postgres تنها DB + migration برای ۸ مدل (P1-ENV-02, P1-RE-03).
6. CI کامل (P1-DEV-05).
7. `.env.example` و secrets (P1-ENV-01, P1-ENV-03).
8. توکن در httpOnly cookie (P1-AUTH-02).
9. مدل نقش و `middleware.ts` و route group ها (P1-AUTH-03, P1-AUTH-04).
10. `packages/tokens` + `packages/ui` primitives (P1-DS-01, P1-DS-02).
11. DatePicker شمسی (P1-DS-03).
12. جایگزینی mock با API واقعی از طریق `packages/api-client` (P1-DEV-03, P1-DEV-06).
13. صفحهٔ جزئیات محصول (P1-CAT-01).
14. دسته و جستجوی فارسی (P1-CAT-02, P1-CAT-03).
15. Cart سمت سرور (P1-ORD-01).
16. Address + delivery quote (P1-ORD-02).
17. Order split و state machine (P1-ORD-03).
18. پرداخت با callback و reconcile (P1-ORD-04).
19. صفحات سفارش و tracking (P1-ORD-05).
20. هاب پروفایل پت (P1-PET-03).
21. صفحات سلامت و تفکیک entity ها (P1-HLT-01, P1-HLT-03).
22. تست عدم دسترسی seller به سلامت (P1-HLT-02).
23. worker یادآور و مرکز یادآور (P1-CARE-02, P1-CARE-03).
24. بازبینی QR: توکن، allow-list، scan log (P1-QR-01..03).
25. `/seller/apply` و shell فروشنده (P1-SEL-01, P1-SEL-02).
26. state machine سفارش فروشنده + هشدار (P1-SEL-03, P1-NOTIF-03).
27. پنل ادمین: صف فروشنده، moderation، refund (P1-ADM-01..04).
28. AuditLog و هدرهای امنیتی (P1-SEC-01, P1-SEC-02).
29. Playwright واقعی و ۸ E2E (P1-QA-01, P1-QA-02).
30. playbook ها، متون حقوقی و restore drill (P1-OPS-02..04).

### B. Top 20 actions to prepare Phase 2 without building it prematurely
1. فیلد `source` و `verification_state` روی رکوردهای سلامت از فاز ۱.
2. `ConsentRecord` از فاز ۱.
3. AuditLog با `target_type` عمومی (قابل استفاده برای grant).
4. مدل نقش قابل گسترش (Provider roles بدون migration شکننده).
5. نگه‌داشتن `test_vet_booking.py` و `test_services_vaccine_guard.py` سبز ولی منجمد.
6. تبدیل منطق vaccine guard به سرویس مستقل `services/eligibility.py` (بدون UI).
7. نصب PostGIS در Postgres staging (بدون استفاده).
8. ذخیرهٔ آدرس با lat/lng اختیاری از فاز ۱.
9. مستندسازی SOP تأیید ارائه‌دهنده در `docs/` بدون کد.
10. طراحی حالت «قفل/به‌زودی» برای Training Center در جزیره (بدون لینک).
11. تعریف Dispute عمومی (order + booking) در schema.
12. Review مدل عمومی با `subject_type`.
13. Notification category «booking» رزرو شده در preferences.
14. شناسایی ۱۰ دامپزشک/مربی برای مصاحبه کیفی.
15. تحقیق سرویس نقشهٔ داخلی (D-11).
16. پیش‌نویس سیاست لغو خدمات.
17. پیش‌نویس DPIA.
18. حذف `/vets` از nav و sitemap.
19. redirect plan `/vets` → `/providers`.
20. معیارهای Gate-1→2 در داشبورد فعال.

### C. Top 15 architecture decisions that prevent Phase 3 rework
1. همهٔ مبالغ به ریال integer (`BIGINT`)، نه float.
2. همهٔ زمان‌ها `timestamptz` UTC؛ نمایش Asia/Tehran؛ تاریخ شبانه (`date`) برای inventory شبانه.
3. Payment مستقل از Order (polymorphic `payable_type`) تا deposit و ticket هم استفاده کنند.
4. Refund مستقل با partial refund.
5. state machine عمومی (جدول `*_events` append-only) برای order/booking/reservation.
6. Idempotency-Key middleware سراسری.
7. Hold/Reservation با TTL به‌عنوان الگوی مشترک (inventory، slot، room، ticket).
8. Pricing engine با `PriceRule` قابل ترکیب (برای boarding و bundle).
9. Eligibility engine مستقل از boarding/event.
10. رسانه در storage خصوصی با URL امضاشده کوتاه‌مدت.
11. Notification dispatcher مبتنی بر template و category.
12. LoyaltyLedger دوطرفه (نه ستون `points`).
13. Subscription با `SubscriptionRun` (نه cron روی جدول اصلی).
14. Organization/Location از ابتدا nullable روی Seller (آمادگی چندشعبه).
15. OpenAPI به‌عنوان منبع حقیقت و تولید کلاینت.

### D. Top 15 ecosystem decisions for Phase 4
1. مدل tenant (schema per tenant یا RLS) — پیشنهاد RLS.
2. استاندارد تبادل سلامت (الگوی FHIR سبک).
3. سیاست مالکیت داده: دادهٔ پت متعلق به صاحب است، نه کلینیک.
4. قیمت‌گذاری SaaS (per seat / per location).
5. OAuth2 برای شرکا و scope ها.
6. سیاست webhook (امضا، retry، replay).
7. حد نرخ API per شریک.
8. سیاست AI: محلی/داخلی، بدون ارسال سلامت به سرویس خارجی.
9. go/no-go adoption و community.
10. go/no-go NFC.
11. go/no-go بیمه.
12. فرمت data export.
13. SLO و قرارداد سطح خدمت B2B.
14. مرز محصول B2B و B2C (جلوگیری از آسیب تجربهٔ مصرف‌کننده).
15. معیار ورود به بازار دوم.

### E. Immediate next 10 tasks (بر اساس شواهد ساختار)
1. **Code review ۹ فایل حساس** (`core/security.py`, `context/auth-context.tsx`, `api/v1/medical_records.py`, `api/v1/passport.py`, `services/payment.py`, `api/v1/sellers.py`, `api/v1/admin.py`, `api/v1/ai_copilot.py`, `src/main.py`) و ثبت نتیجه در `.bonyo/audits/security-baseline.md`.
2. **حذف `apps/backend/bonnivo.db`**، `tsconfig.tsbuildinfo`، `structure.txt`، `folder-structure.txt`، پوشهٔ `icons/` root؛ به‌روزرسانی `.gitignore`.
3. **اجرای `alembic revision --autogenerate` روی Postgres** و مقایسه با `models/*`؛ ساخت migration برای ۸ مدل.
4. **ساخت `.github/workflows/ci.yml`** با pytest، typecheck، build.
5. **نصب `@playwright/test`**، حذف `e2e/playwright.d.ts`، اجرای `core-flows.spec.ts`.
6. **اضافه‌کردن feature flag** و خاموش‌کردن `vets`, `services`, `loyalty`, `adoption`, `ai_copilot`, `nfc`, `wms_webhooks`, amber broadcast؛ حذف لینک‌ها از `desktop-header.tsx` و `mobile-bottom-nav.tsx`.
7. **ساخت `apps/web/src/app/shop/[productSlug]/page.tsx`** روی `catalog.py` (اولین صفحهٔ واقعی بدون mock).
8. **ساخت `apps/web/src/app/dashboard/pets/[petId]/page.tsx`** به‌عنوان هاب و لینک از `multi-pet-switcher.tsx`.
9. **ساخت `checkout/payment/callback` و `dashboard/orders/[orderId]`** برای بستن مسیر خرید.
10. **بازنویسی `docs/ROADMAP.md` و `docs/roadmap/phase-2-3-4-checklist.md`** با ۴ فاز این سند و ثبت تصمیم‌های F-01, F-07, F-15, F-16, F-23 در `docs/03-decisions.md`.
