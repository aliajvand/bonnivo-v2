# گزارش ممیزی جامع و شناسنامه فنی پروژه بونیو (Bonnivo Project Audit Report)

**تاریخ تهیه گزارش:** ۱۴۰۵/۰۷/۱۳ (2026-10-04)  
**نسخه پروژه:** 0.1.0-production-ready  
**شاخه فعال گیت:** `production-readiness`  
**محیط اجرا:** Windows (PowerShell) | Node.js 22+ (pnpm 12.5.1) | Python 3.14 (uv) | PostgreSQL 18 & SQLite  

---

## فهرست مطالب
1. [معماری کلی، استک فنی و پکیج‌ها](#۱-معماری-کلی-استک-فنی-و-پکیج‌ها)
2. [شناسنامه فایل‌های سورس پروژه (Source Files Registry)](#۲-شناسنامه-فایل‌های-سورس-پروژه-source-files-registry)
   - [۲.۱ صفحات و مسیرهای برنامه (Next.js App Router)](#۲۱-صفحات-و-مسیرهای-برنامه-nextjs-app-router)
   - [۲.۲ کامپوننت‌های رابط کاربری (UI & Business Components)](#۲۲-کامپوننت‌های-رابط-کاربری-ui--business-components)
   - [۲.۳ کانتکست‌ها و مدیریت وضعیت کلاینت (Contexts)](#۲۳-کانتکست‌ها-و-مدیریت-وضعیت-کلاینت-contexts)
   - [۲.۴ کلاینت‌ها و لایه ارتباط با API (API Client Layer)](#۲۴-کلاینت‌ها-و-لایه-ارتباط-با-api-api-client-layer)
   - [۲.۵ روترها و اندپوینت‌های بک‌اند (FastAPI API Routers)](#۲۵-روترها-و-اندپوینت‌های-بک‌اند-fastapi-api-routers)
   - [۲.۶ مدل‌های پایگاه داده (SQLAlchemy Models)](#۲۶-مدل‌های-پایگاه-داده-sqlalchemy-models)
   - [۲.۷ سرویس‌ها و ماژول‌های مرکزی (Backend Core & Services)](#۲۷-سرویس‌ها-و-ماژول‌های-مرکزی-backend-core--services)
3. [بررسی ناهماهنگی‌های ظاهری و فنی (Visual & Technical Discrepancies)](#۳-بررسی-ناهماهنگی‌های-ظاهری-و-فنی-visual--technical-discrepancies)
4. [توابع و لاجیک‌های حساس دیتابیس و API (Do-Not-Break Logic)](#۴-توابع-و-لاجیک‌های-حساس-دیتابیس-و-api-do-not-break-logic)
5. [گالری اسکرین‌شات‌های ثبت‌شده از صفحات و کامپوننت‌ها](#۵-گالری-اسکرین‌شات‌های-ثبت‌شده-از-صفحات-و-کامپوننت‌ها)
6. [صفحات دارای مشکل ریسپانسیو و سرریز افقی در موبایل (Mobile Overflow Audit)](#۶-صفحات-دارای-مشکل-ریسپانسیو-و-سرریز-افقی-در-موبایل-mobile-overflow-audit)

---

## ۱. معماری کلی، استک فنی و پکیج‌ها

پروژه بونیو بر پایه معماری Monorepo تفکیک‌شده (Decoupled Full-Stack Architecture) طراحی شده است:

```
bonnivo-v2/
├── apps/
│   ├── web/           # فرانت‌اند Next.js 15 App Router با Tailwind CSS و React 19
│   ├── backend/       # بک‌اند ناهمگام FastAPI بر پایه Python 3.14 و SQLAlchemy 2.0
│   └── mobile/        # کلاینت موبایل (Expo / React Native)
├── packages/          # بسته‌ها و تایپ‌های اشتراکی مونو‌ریپو
├── docs/              # مستندات و اسکرین‌شات‌های سیستمی
└── reports/           # گزارش‌های تست نهایی و بازبینی مستقل کیفیت
```

### پکیج‌های فرانت‌اند (`apps/web/package.json`)
| پکیج | نسخه | نقش و کاربرد در پروژه |
| :--- | :---: | :--- |
| `next` | `15.2.1` | فریم‌ورک اصلی وب اپلیکیشن، SSR، استاتیک جنریشن و مسیریابی App Router |
| `react` / `react-dom` | `^19.0.0` | کتابخانه هسته رندرینگ و کلاینت کامپوننت‌ها |
| `tailwindcss` | `^3.4.17` | موتور استایل‌دهی یوتیلیتی و سیستم توکن‌های بصری |
| `three` / `@types/three` | `^0.186.1` | رندرینگ سه‌بعدی بنر تعاملی جزیره بونیو (`ThreeIslandCanvas`) |
| `lucide-react` | `^0.475.0` | مجموعه آیکون‌های وکتور بهینه‌سازی‌شده برای رابط کاربری |
| `clsx` / `tailwind-merge` | `^2.1.1` / `^3.0.2` | مدیریت ترکیبی کلاس‌های شرطی Tailwind بدون تداخل استایل‌ها |
| `class-variance-authority`| `^0.7.1` | مدیریت گونه‌های مختلف کامپوننت‌های UI (CVA) |
| `puppeteer-core` | `^25.12.0` | رانر اتوماسیون تست‌های E2E پذیرش و ثبت اسکرین‌شات‌ها |
| `typescript` | `^5.7.2` | موتور تایپ‌چک استاتیک و ایمنی نوع داده‌ها |

### پکیج‌های بک‌اند (`apps/backend/pyproject.toml`)
| پکیج | نسخه | نقش و کاربرد در پروژه |
| :--- | :---: | :--- |
| `fastapi` | `>=0.115.0` | فریم‌ورک ناهمگام وب با اعتبارسنجی خودکار OpenAPI بر پایه Pydantic v2 |
| `sqlalchemy[asyncio]` | `>=2.0.36` | نگاشت رابطه‌ای-شیئی ناهمگام (Async ORM) و مدیریت کوئری‌ها |
| `alembic` | `>=1.14.0` | مدیریت مایگریشن‌ها و نسخه‌بندی ساختار دیتابیس |
| `asyncpg` | `>=0.30.0` | درایور سریع و ناهمگام PostgreSQL 18 |
| `aiosqlite` | `>=0.20.0` | درایور ناهمگام SQLite برای تست‌های سریع و ایزوله CI |
| `argon2-cffi` | `>=25.1.0` | سیستم هش‌گذاری فوق‌امنیت گذرواژه‌های پنل ادمین (برنده PHC) |
| `passlib[bcrypt]` | `>=1.7.4` | اعتبارسنجی متقابل و هشینگ ثانویه احراز هویت |
| `python-jose[cryptography]`| `>=3.3.0` | صدور، امضا و اعتبارسنجی توکن‌های JWT احراز هویت |
| `httpx` | `>=0.28.0` | کلاینت ناهمگام HTTP برای اتصال به زرین‌پال و وب‌سرویس پیامک Fast-URL |
| `pydantic-settings` | `>=2.7.0` | مدیریت تایپ‌شده متغیرهای محیطی و پیکربندی سرور |

---

## ۲. شناسنامه فایل‌های سورس پروژه (Source Files Registry)

### ۲.۱ صفحات و مسیرهای برنامه (Next.js App Router)

| ردیف | مسیر فایل (`apps/web/src/app`) | وظیفه و مسئولیت | ورودی‌ها (Props / Params / SearchParams) | خروجی‌ها (Exports / UI) |
| :---: | :--- | :--- | :--- | :--- |
| ۱ | `page.tsx` | صفحه اصلی لندینگ بونیو | بدون ورودی (Static Root) | صفحه خانه شامل هیرو ۳بعدی، دسته‌بندی‌ها، محصولات منتخب، مربیان و رویدادها |
| ۲ | `shop/page.tsx` | کاتالوگ فروشگاه آنلاین بونیو | `searchParams`: `q`, `category`, `brand`, `min_price`, `max_price`, `species`, `sort`, `page` | کاتالوگ جامع محصولات با فیلترهای آکاردئونی و کشویی موبایل |
| ۳ | `shop/[slug]/page.tsx` | جزییات فنی و خرید محصول | `params.slug: string` | ویترین کامل محصول، گالری، انتخاب وزن/تنوع، بخش بای‌باکس و نوار خرید چسبان موبایل |
| ۴ | `cart/page.tsx` | سبد خرید بونیو | وضعیت سبد از `useCart` و دیتابیس سرور | جدول اقلام سبد خرید، تفکیک بر اساس پت، فیلد اعمال کوپن و فاکتور خلاصه مالی |
| ۵ | `checkout/page.tsx` | فرم نهایی تسویه حساب و ارسال | استعلام سبد خرید و فرم از `sessionStorage` | انتخاب بازه زمانی تحویل تهران، آدرس، پیش‌نمایش تفکیک مرسوله، درگاه و ارسال به سرور |
| ۶ | `checkout/sandbox/page.tsx` | محیط ایزوله شبیه‌ساز شاپرک/زرین‌پال | `Authority: string`, `amount: string` | رابط درگاه شاپرک آزمایشی با دکمه‌های تایید موفق و انصراف از پرداخت |
| ۷ | `checkout/callback/page.tsx` | نقطه بازگشت از درگاه پرداخت | `Authority: string`, `Status: string` | استعلام قطعی از سرور، پیام وضعیت تایید، پاک‌سازی سبد خرید و ریدایرکت به صفحه موفقیت |
| ۸ | `checkout/success/page.tsx` | صفحه تایید نهایی سفارش | `order_id?: string`, `ref_id?: string` | تبریک ثبت سفارش، کد رهگیری شاپرک، مراحل آماده‌سازی بسته و لینک رهگیری زنده |
| ۹ | `dashboard/page.tsx` | پیشخوان مدیریت کاربر سرپرست | اطلاعات کاربر لاگین از `useAuth` | خلاصه پروفایل، کارت پت‌ها، نوبت‌های پیش‌رو و دسترسی سریع به سرویس‌ها |
| ۱۰ | `dashboard/tracking/page.tsx` | رهگیری لحظه‌ای مرسوله‌های سفارش | شناسه سفارش‌ها از دیتابیس کاربر | مراحل تفکیک مرسوله، پیک اختصاصی تهران، زمان تحویل و نقشه لجستیک |
| ۱۱ | `dashboard/pets/page.tsx` | مدیریت پت‌های سرپرست | شناسه و لیست پت‌ها از `usePet` | کارت مشخصات سگ/گربه، سوابق واکسیناسیون، ویرایش و افزودن پت جدید |
| ۱۲ | `dashboard/care/page.tsx` | برنامه مراقبت روزانه پت | تسک‌های مراقبتی روز از دیتابیس سرور | چک‌لیست دارو، غذا، پیاده‌روی، بهداشت و نمودار پیشرفت مراقبت |
| ۱۳ | `dashboard/passport/page.tsx` | پاسپورت هوشمند و پلاک NFC پت | شناسه پت و توکن اختصاصی پاسپورت | نمایش QR کد اضطراری، پلاک دیجیتال، تاریخچه سلامت و فرم اعلام مفقودی |
| ۱۴ | `dashboard/wallet/page.tsx` | کیف پول و امتیازهای وفاداری | وضعیت موجودی و تراکنش‌ها از API | مانده اعتبار کیف پول، تراکنش‌های شارژ/کسر و امتیازهای پنجه بونیو |
| ۱۵ | `dashboard/subscriptions/page.tsx` | مدیریت اشتراک غذای دوره‌ای | اشتراک‌های فعال از دیتابیس | زمان‌بندی سفارش خودکار ماهانه غذای پت و امکان تغییر بازه |
| ۱۶ | `dashboard/appointments/page.tsx` | نوبت‌های کلینیک و مربی | نوبت‌های ثبت‌شده کاربر | کارت نوبت‌های دامپزشکی، مربیگری و امکان لغو یا تغییر زمان |
| ۱۷ | `passport/[token]/page.tsx` | صفحه عمومی پلاک گم‌شده پت | `params.token: string` | نمایش اضطراری اطلاعات پت مفقود، تماس مستقیم با سرپرست و ثبت لوکیشن یابنده |
| ۱۸ | `admin/page.tsx` | پیشخوان مدیریت ادمین بونیو | توکن ادمین از کوکی سرور (`admin_token`) | آمار کلی پلتفرم، مدیریت کاتالوگ، بررسی نظرات و کنترل فلگ‌های قابلیت‌ها |
| ۱۹ | `admin/login/page.tsx` | فرم ورود امن به پنل ادمین | اطلاعات کاربری (ایمیل/رمز عبور) | فرم ورود ادمین مجهز به محدودیت ریت‌لیمیت و هشینگ آرگون۲ |
| ۲۰ | `vets/page.tsx` & `[id]/page.tsx` | دایرکتوری و رزرو دامپزشکان | لیست کلینیک‌ها / `params.id` | جستجوی دامپزشک بر اساس تخصص، محدوده جغرافیایی و فرم رزرو نوبت |
| ۲۱ | `trainers/page.tsx` & `[id]` | مربیان و رفتارشناسان حیوانات | لیست مربیان / `params.id` | پروفایل مربی، سبک‌های آموزشی، تجربیات و درخواست جلسه تمرینی |
| ۲۲ | `boarding/page.tsx` & `[id]` | پانسیون و هتل حیوانات خانگی | لیست پانسیون‌ها / `params.id` | امکانات اقامتی، شرایط بهداشتی، بیمه و تقویم اقامت موقت |
| ۲۳ | `events/page.tsx` & `[id]` | همایش‌ها و رویدادهای پت‌فرندلی | لیست رویدادها / `params.id` | همایش‌های پیاده‌روی، کارگاه‌های آموزشی و دریافت بلیت الکترونیک |
| ۲۴ | `adopt/page.tsx` | واگذاری و سرپرستی رایگان | لیست آگهی‌های سرپرستی | فیلتر نژاد و سن، فرم درخواست سرپرستی و شرایط حمایتی بونیو |
| ۲۵ | صفحات حقوقی (`terms`, `privacy`, `return-policy`, `medical-disclaimer`) | قوانین، حریم خصوصی و ضمانت | بدون پارامتر (Static) | مفاد حقوقی، حریم خصوصی، سیاست مرجوعی ۴ ساعته بونیو و سلب مسئولیت پزشکی |

---

### ۲.۲ کامپوننت‌های رابط کاربری (UI & Business Components)

| مسیر کامپوننت (`apps/web/src/components`) | وظیفه و منطق رفتاری | Props و ورودی‌ها | المان‌های خروجی و رفتار بصری |
| :--- | :--- | :--- | :--- |
| `shop/shop-catalog-view.tsx` | موتور اصلی نمایش و فیلترینگ کاتالوگ | بدون Props (اتصال مستقیم به URL SearchParams) | نوار جستجو، فیلترهای آکاردئونی برند و قیمت، کارت‌های کاتالوگ، دراور فیلتر موبایل |
| `checkout/checkout-view.tsx` | مدیریت چرخه ثبت اطلاعات ارسال و پرداخت | بدون Props (اتصال به CartContext و SessionStorage) | تایم‌اسلات تهران، آدرس، تفکیک مرسوله‌ها، انتخاب روش پرداخت و کلید ارسال به درگاه |
| `checkout/checkout-success-view.tsx` | نمایش فاکتور و تاییدیه ثبت سفارش | بدون Props (دریافت اطلاعات از useCart و QueryParams) | نشان سبز تایید، کد رهگیری، شماره سفارش و لینک‌های پیگیری و بازگشت به خانه |
| `cart/cart-view.tsx` | جدول اقلام سبد، تغییر تعداد و کوپن | بدون Props (اتصال مستقیم به useCart) | لیست محصولات سبد، دکمه‌های کم/زیاد با دیبانس، فیلد کوپن با خطای اینلاین و خلاصه مالی |
| `home/hero-island-banner.tsx` | بنر سربرگ اصلی صفحه نخست | بدون Props | معرفی بونیو کالا با المان سه‌بعدی تعاملی و کلیدهای هدایت به فروشگاه و پاسپورت |
| `home/three-island-canvas.tsx` | رندر بوم سه‌بعدی Three.js جزیره بونیو | بدون Props | صحنه سه‌بعدی شامل انیمیشن چرخش دوربین و افکت‌های تعاملی با اشاره‌گر |
| `common/offline-banner.tsx` | هشدار قطعی اتصال اینترنت کاربر | بدون Props (شنونده رخدادهای online/offline پنجره) | نوار ثابت زرد/قرمز در بالای صفحه در زمان قطعی شبکه |
| `common/feature-flag-guard.tsx` | گارد کنترل دسترسی بر اساس Feature Flag | `flagKey: string`, `children: ReactNode` | رندر مشروط بخش‌های مختلف سایت متناسب با فعال بودن پرچم ویژگی در سرور |
| `auth/otp-auth-modal.tsx` | مدال ورود و ثبت‌نام با پیامک OTP | `isOpen: boolean`, `onClose: () => void` | ورودی شماره موبایل، فیلد ۵ رقمی کد یکبارمصرف، تایمر ۲ دقیقه‌ای ارسال مجدد |
| `layout/desktop-header.tsx` | سربرگ اصلی نسخه دسکتاپ | بدون Props | لوگوی بونیو، منوی ناوبری، نوار جستجو، آیکون سبد با شمارنده زنده و دکمه پروفایل |
| `layout/mobile-bottom-nav.tsx` | نوار ناوبری چسبان پایین در موبایل | بدون Props | ۵ دکمه لمسی اصلی (خانه، فروشگاه، سبد خرید، مراقبت و پروفایل) با برچسب فارسی |
| `layout/desktop-footer.tsx` | پاورقی جامع سیستم | بدون Props | لینک‌های دسترسی سریع، شبکه‌های اجتماعی، نمادهای اعتماد و کپی‌رایت بونیو |
| `care/smart-reorder-widget.tsx` | ویجت یادآوری و سفارش مجدد خودکار | بدون Props | پیشنهاد سفارش تکراری غذای پت بر اساس نرخ مصرف محاسبه‌شده توسط سیستم |
| `care/bonyo-copilot-drawer.tsx` | کشوی هوشمند راهنمای هوش مصنوعی بونیو | بدون Props | گفتگوی تعاملی برای پرسش‌های مراقبت، تغذیه و سلامت پت |
| `logistics/live-courier-map.tsx` | ردیابی مکان پیک روی نقشه لجستیک | `deliveryId: string`, `coordinates: [number, number]` | نقشه مسیر پیک اختصاصی، برآورد زمان تحویل و وضعیت تحویل بسته |
| `passport/owner-passport-manager.tsx`| کنترل پنل شناسنامه و پاسپورت پت | `petId: string` | بارگذاری تصویر، اطلاعات پزشکی، کد میکروچیپ و فعال‌سازی پلاک گم‌شده |
| `passport/sighting-location-modal.tsx`| مدال ارسال موقعیت مکانی پت گمشده | `token: string`, `isOpen: boolean` | ثبت مختصات GPS و شماره تماس یابنده جهت ارسال فوری پیامک به سرپرست |

---

### ۲.۳ کانتکست‌ها و مدیریت وضعیت کلاینت (Contexts)

| فایل کانتکست (`apps/web/src/context`) | مسئولیت و محدوده کاربرد | متغیرهای وضعیت (State) | توابع و اکشن‌ها (Actions/Methods) |
| :--- | :--- | :--- | :--- |
| `auth-context.tsx` | چرخه حیات احراز هویت، توکن و کاربر | `user`, `token`, `isAuthenticated`, `isLoading` | `requestOtp(phone)`, `verifyOtp(phone, code)`, `logout()` |
| `cart-context.tsx` | سبد خرید دیتابیسی/محلی با قفل سابمیت | `items`, `itemCount`, `totalAmount`, `isSubmitting` | `addItem(item)`, `removeItem(id)`, `updateQuantity(id, q)`, `clearCart()` |
| `pet-context.tsx` | مدیریت پت انتخاب‌شده و پروفایل پت‌ها | `pets`, `activePet`, `isLoading` | `setActivePet(id)`, `refreshPets()`, `addPet(data)` |
| `theme-context.tsx` | پوسته تیره/روشن سیستم | `theme: 'light' \| 'dark'` | `setTheme(theme)`, `toggleTheme()` |

---

### ۲.۴ کلاینت‌ها و لایه ارتباط با API (API Client Layer)

| فایل (`apps/web/src/lib/api`) | مسئولیت و پروتکل ارتباطی | توابع کلیدی | آدرس‌های فراخوانی‌شده سرور |
| :--- | :--- | :--- | :--- |
| `client.ts` | هسته یکپارچه فراخوانی HTTP و مدیریت هدرها | `fetchApi(endpoint, options)` | پیشوند خودکار `${API_BASE}/api/v1` به همراه هدرهای مجاز |
| `catalog.ts` | دریافت محصولات، برندها و نرمال‌سازی کاتالوگ | `fetchCatalogProducts()`, `fetchProductBySlug()` | `/api/v1/catalog/products`, `/api/v1/catalog/brands` |
| `checkout.ts` | ایجاد رزرو موجودی، درخواست و اعتبارسنجی درگاه | `reserveOrderItems()`, `requestServerPayment()`, `verifyServerPayment()` | `/api/v1/checkout/reserve`, `/api/v1/payment/request`, `/api/v1/payment/verify` |
| `admin.ts` | عملیات مدیریتی پنل ادمین بونیو | `fetchAdminStats()`, `fetchAdminProducts()`, `updateFeatureFlag()` | `/api/v1/admin/dashboard/stats`, `/api/v1/admin/feature-flags` |
| `subscriptions.ts` | مدیریت اشتراک‌های دوره‌ای غذای حیوانات | `fetchUserSubscriptions()`, `cancelSubscription()` | `/api/v1/subscriptions`, `/api/v1/subscriptions/{id}` |
| `vets.ts` | اطلاعات دامپزشکان و نوبت‌دهی درمانی | `fetchVetsList()`, `bookVetAppointment()` | `/api/v1/vets`, `/api/v1/vets/{id}/book` |
| `wallet.ts` | گردش حساب کیف پول و پاداش‌های سیستم | `fetchWalletBalance()`, `chargeWallet()` | `/api/v1/wallet/balance`, `/api/v1/wallet/charge` |

---

### ۲.۵ روترها و اندپوینت‌های بک‌اند (FastAPI API Routers)

| فایل روتر (`apps/backend/src/api/v1`) | برچسب OpenAPI | اندپوینت‌های اصلی | مکانیزم‌های امنیتی و گاردها |
| :--- | :--- | :--- | :--- |
| `auth.py` | `Authentication` | `POST /otp/request`, `POST /otp/verify`, `GET /me` | ریت‌لیمیت ۳ درخواست در ۲ دقیقه، هش امنیتی OTP، سهمیه ۳ پیامک |
| `payment.py` | `Payment & Gateway` | `POST /request`, `GET /verify` | فکتوری درگاه، اعتبارسنجی تکرارناپذیر، Fail-Fast در محیط پروداکشن |
| `catalog.py` | `Catalog & Store` | `GET /products`, `GET /products/{slug}`, `GET /brands` | فیلترینگ ایندکس‌شده، سیستم انتخاب بای‌باکس الگوریتمی |
| `checkout.py` | `Checkout & Cart` | `POST /reserve`, `GET /cart`, `POST /cart/sync`, `DELETE /cart` | قفل سطر دیتابیس (`with_for_update`) و جلوگیری قطعی از Overselling |
| `admin_auth.py` | `Admin Auth` | `POST /login`, `GET /me`, `POST /logout` | احراز هویت با آرگون۲، کوکی‌های HttpOnly و ریت‌لیمیت ضد بروت‌فورس |
| `admin.py` | `Admin Operations` | `GET /stats`, `POST /products`, `PUT /products/{id}` | بررسی نقش `Role == ADMIN` در هدر توکن سرور |
| `pets.py` | `Pets Management` | `GET /`, `POST /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}` | اعتبارسنجی مالکیت کاربر بر پت (`user_id == current_user.id`) |
| `medical_records.py`| `Health & Medical`| `GET /pet/{id}`, `POST /` | گارد کنترل دسترسی IDOR پرونده سلامت پت |
| `boarding.py` | `Boarding Hotel` | `GET /rooms`, `POST /book`, `GET /my-bookings` | اعتبارسنجی شناسه پت، پانسیون و تاریخ‌های مجاز |
| `trainers.py` | `Trainers System` | `GET /list`, `POST /book-session` | تایید هویت متقاضی و مربی معتبر در پایگاه داده |
| `vets.py` | `Veterinary Care` | `GET /clinics`, `POST /appointments` | بررسی ظرفیت کلینیک و عدم تداخل نوبت‌ها |
| `logistics.py` | `Logistics Engine` | `GET /order/{id}/tracking`, `PUT /courier/status` | احراز دسترسی خریدار یا راننده پیک با توکن معتبر |
| `feature_flags.py` | `Feature Flags` | `GET /`, `PUT /{key}` | مدیریت پرچم‌های توسعه‌ای و انتشار تدریجی امکانات |
| `wms_webhooks.py` | `WMS Webhooks` | `POST /inventory-update` | اعتبارسنجی امضای HMAC با کلید مخفی انبارداری (`X-Bonyo-Signature`) |

---

### ۲.۶ مدل‌های پایگاه داده (SQLAlchemy Models)

| فایل مدل (`apps/backend/src/models`) | نام جدول در پایگاه داده | فیلدهای کلیدی و روابط (Foreign Keys / Indexes) |
| :--- | :--- | :--- |
| `user.py` | `users` | `id` (PK, UUID), `phone_number` (Unique, Index), `full_name`, `role` (USER, SELLER, ADMIN, VET) |
| `order.py` | `orders`, `order_items`, `inventory_reservations`, `user_cart_items` | `payment_authority` (Index), `status` (Enum), `total_amount_tomans`, `shipping_timeslot` |
| `catalog.py` | `products`, `seller_offers`, `categories`, `brands`, `product_variants` | `slug` (Unique, Index), `buy_box_offer_id`, `stock_quantity`, `price_tomans` |
| `pet.py` | `pets` | `id` (PK, UUID), `user_id` (FK -> users), `name`, `species` (DOG, CAT), `breed`, `nfc_token` |
| `medical_records.py`| `medical_records`, `vaccinations` | `pet_id` (FK -> pets), `vet_id` (FK -> users), `diagnosis`, `prescription` |
| `coupon.py` | `coupons`, `coupon_redemptions` | `code` (Unique, Index), `discount_percent`, `max_discount_tomans`, `is_active` |
| `admin.py` | `admins` | `id` (PK, UUID), `email` (Unique, Index), `password_hash` (Argon2id), `is_superadmin` |
| `feature_flag.py` | `feature_flags` | `key` (PK, String), `is_enabled` (Boolean), `description` |
| `wallet.py` | `wallets`, `wallet_transactions` | `user_id` (FK -> users, Unique), `balance_tomans`, `paw_points` |
| `logistics.py` | `shipment_packages`, `courier_tasks` | `order_id` (FK -> orders), `package_number`, `delivery_status`, `courier_phone` |

---

### ۲.۷ سرویس‌ها و ماژول‌های مرکزی (Backend Core & Services)

| فایل سورس (`apps/backend/src`) | ماژول و مسئولیت اصلی | توابع کلیدی و نقش فنی |
| :--- | :--- | :--- |
| `core/database.py` | موتور اتصال دیتابیس و مدیریت تراکنش‌ها | `get_db()`, `engine`, `AsyncSessionLocal` (پشتیبانی از asyncpg و aiosqlite) |
| `core/security.py` | توکن JWT و وابستگی احراز هویت | `get_current_user()`, `create_access_token()`, `verify_otp_code()` |
| `core/admin_security.py` | سیستم احراز هویت ادمین با الگوریتم Argon2id | `hash_password()`, `verify_password()`, `get_current_admin()` |
| `core/config.py` | اعتبارسنجی متغیرهای محیطی با رویکرد Fail-Fast | `settings` (اعتبارسنجی سخت‌گیرانه در حالت `APP_ENV=production`) |
| `services/payment.py` | لایه انتزاع درگاه پرداخت و کارخانه زرین‌پال | `get_payment_gateway()`, `ZarinPalGateway`, `MockPaymentGateway` |
| `services/sms.py` | ارتباط با وب‌سرویس پیامک Fast-URL | `SmsIrAdapter` (مدیریت ارسال با وب‌سرویس v1 سامانه sms.ir با سقف سهمیه) |
| `services/replenishment.py` | محاسبه نرخ مصرف و هوش سفارش مجدد غذا | الگوریتم تخمین اتمام غذای پت بر اساس وزن و جیره روزانه |
| `cli/create_admin.py` | اسکریپت تعاملی خط فرمان برای ایجاد کاربر ادمین | دریافت ایمیل و گذرواژه امن از طریق `getpass` و ثبت هش آرگون۲ در دیتابیس |

---

## ۳. بررسی ناهماهنگی‌های ظاهری و فنی (Visual & Technical Discrepancies)

در جریان ممیزی جامع، موارد زیر به عنوان عدم‌انطباق‌های ظاهری، مقیاسی یا کدهای کلاینتی استخراج شد که در بازطراحی‌های آینده باید یکدست‌سازی شوند:

### ۳.۱ ناهمگونی شعاع گوشه‌ها (Border Radius Inconsistency)
- در کامپوننت‌های فرم تسویه (`checkout-view.tsx`) از کلاس‌های `rounded-3xl` برای کارت‌های بزرگ شیشه‌ای و `rounded-2xl` برای فیلدهای ورودی و دکمه‌ها استفاده شده است.
- در کاتالوگ (`shop-catalog-view.tsx`)، کارت‌های کاتالوگ دارای `rounded-2xl` هستند، در حالی که کارت‌های مربیان در صفحه اصلی از `rounded-xl` استفاده می‌کنند.
- **توصیه استانداردسازی:** تعریف توکن یکپارچه شعاع در `tailwind.config.ts`:
  - `rounded-card: 1.5rem` (۲۴ پیکسل برای تمام کارت‌ها)
  - `rounded-input: 1rem` (۱۶ پیکسل برای ورودی‌ها و المان‌های تعاملی داخلی)

### ۳.۲ تنوع رنگ دکمه‌های اکشن اصلی (CTA Color Palette Variance)
- دکمه خرید سریع در کارت‌های کاتالوگ و صفحه جزییات محصول از رنگ نارنجی/برند (`bg-primary`) استفاده می‌کند.
- دکمه نهایی اتصال به درگاه در فرم تسویه از رنگ سبز زمردی (`bg-emerald-600`) بهره می‌برد.
- دکمه‌های کنترلی در پنل ادمین ترکیبی از رنگ‌های مشکی سنگی (`bg-stone-900`) و آبی کبالت هستند.
- **توصیه استانداردسازی:** تفکیک معنایی استاندارد: استفاده از `bg-primary` صرفاً برای اکشن‌های تجاری/کاتالوگ و حفظ `bg-emerald-600` صرفاً برای تراکنش مالی موفق و پرداخت شاپرک.

### ۳.۳ فاصله از پایین در صفحات موبایل (Mobile Safe Area Gutter)
- نوار ناوبری چسبان موبایل (`mobile-bottom-nav.tsx`) ارتفاعی معادل `h-16` (۶۴ پیکسل) اشغال می‌کند.
- در برخی صفحات (`/shop` و `/cart`) پدینگ انتهای صفحه `pb-24` تنظیم شده تا دکمه‌ها زیر نوار مخفی نشوند، اما در برخی صفحات فرعی مثل `/adopt` یا `/events` این فاصله `pb-12` است که باعث همپوشانی مختصر آخرین المان با نوار ناوبری در گوشی‌های با صفحه کوچک می‌شود.
- **توصیه استانداردسازی:** اعمال کلاس سراسری `pb-28` روی تگ اصلی تمام صفحات کلاینت موبایل.

### ۳.۴ فونت و فرمت‌بندی ارقام فارسی در متغیرهای فرعی
- در اکثر ویجت‌ها ارقام قیمت به صورت صحیح با متد `.toLocaleString("fa-IR")` به فارسی تبدیل می‌شوند.
- در چند کامپوننت کمکی (مانند نمایش وزن در برخی برچسب‌های انگلیسی مقادیر ماک) از ارقام لاتین استفاده شده است.
- **توصیه استانداردسازی:** ایجاد یک هلپر مرکزی `formatPersianCurrency(amount)` در `lib/utils.ts` و فراخوانی آن در ۱۰۰٪ بخش‌های مالی.

---

## ۴. توابع و لاجیک‌های حساس دیتابیس و API (Do-Not-Break Logic)

توابع زیر ستون فقرات پایداری مالی، امنیتی و اطلاعاتی بونیو هستند و در هرگونه ریفکتور آینده باید ساختار اتمیک و قواعد آنها بدون تغییر باقی بماند:

### ۱. رزرو اتمیک موجودی انبار (`reserve_inventory_atomic`)
- **محل در کد:** [apps/backend/src/api/v1/checkout.py](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/backend/src/api/v1/checkout.py)
- **علت حساسیت:** این تابع با استفاده از دستور SQL `with_for_update()` روی سطر پیشنهاد فروش (`SellerOffer`) قفل بدبینانه (Pessimistic Lock) اعمال می‌کند تا در صورت هجوم همزمان چند کاربر برای خرید آخرین قلم کالا، موجودی منفی نشده و Overselling رخ ندهد. هرگونه تبدیل این کوئری به خواندن ساده، منجر به خطای بحرانی انبار خواهد شد.

### ۲. اعتبارسنجی تکرارناپذیر پرداخت (`verify_payment`)
- **محل در کد:** [apps/backend/src/api/v1/payment.py](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/backend/src/api/v1/payment.py)
- **علت حساسیت:** این تابع وضعیت تراکنش بانکی را استعلام و ثبت می‌کند. در صورت فراخوانی مکرر یک شناسه Authority، بررسی وضعیت قبلی (`order.status == OrderStatus.PAID`) مانع از اعمال دوبار شارژ، کسر مضاعف سهمیه کوپن، یا ثبت سفارش تکراری در سیستم انبارداری می‌شود.

### ۳. گاردریل اعتبارسنجی درگاه در پروداکشن (`get_payment_gateway`)
- **محل در کد:** [apps/backend/src/services/payment.py](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/backend/src/services/payment.py)
- **علت حساسیت:** در صورت قرار داشتن سرور در وضعیت `APP_ENV=production`، سیستم هرگز به `MockPaymentGateway` سوئیچ نمی‌کند و در صورت فقدان یا نامعتبر بودن `ZARINPAL_MERCHANT_ID` به شکل Fail-Fast متوقف می‌شود تا تراکنش‌های رایگان روی دیتابیس واقعی ثبت نگردند.

### ۴. سقف مصرف سهمیه پیامک و محافظت بروت‌فورس OTP
- **محل در کد:** [apps/backend/src/services/sms.py](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/backend/src/services/sms.py) و [apps/backend/src/api/v1/auth.py](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/backend/src/api/v1/auth.py)
- **علت حساسیت:** سیستم دارای ریت‌لیمیت ۳ درخواست در ۲ دقیقه برای جلوگیری از اسپم مخابراتی است. متغیر کنترلی `_SMS_SEND_COUNT` مانع از مصرف بیش از سقف تعیین‌شده توسط تست‌های خودکار می‌شود. همچنین حساب‌های QA فقط با پرچم صریح `ALLOW_QA_ACCOUNTS=true` در محیط‌های غیرپروداکشن پذیرفته می‌شوند.

### ۵. گارد امنیتی IDOR در پرونده سلامت و رزروها
- **محل در کد:** [apps/backend/src/api/v1/medical_records.py](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/backend/src/api/v1/medical_records.py)، [boarding.py](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/backend/src/api/v1/boarding.py) و [vets.py](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/backend/src/api/v1/vets.py)
- **علت حساسیت:** قبل از دسترسی به هر رکورد پزشکی یا رزرو، شرط `pet.user_id == current_user.id` بررسی می‌شود تا هیچ کاربری با دستکاری شناسه URL نتواند اطلاعات محرمانه حیوان خانگی سایر شهروندان را مشاهده کند.

---

## ۵. گالری اسکرین‌شات‌های ثبت‌شده از صفحات و کامپوننت‌ها

تمامی تصاویر زیر در دو نمای تفکیک‌شده دسکتاپ (1920x1080) و موبایل (390x844 با Touch/Scale 2x) توسط اسکریپت خودکار Puppeteer استخراج و در پوشه `docs/screenshots/` ذخیره شده‌اند:

| ردیف | نام صفحه و بخش | نمای دسکتاپ (1920x1080) | نمای موبایل (390x844) | وضعیت رندر |
| :---: | :--- | :--- | :--- | :---: |
| ۱ | صفحه اصلی لندینگ (Home) | [`01-home-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/01-home-desktop.png) | [`01-home-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/01-home-mobile.png) | تایید شده (سبز) |
| ۲ | کاتالوگ فروشگاه و فیلترها (Shop) | [`02-shop-catalog-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/02-shop-catalog-desktop.png) | [`02-shop-catalog-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/02-shop-catalog-mobile.png) | تایید شده (سبز) |
| ۳ | جزییات محصول و خرید (PDP) | [`03-product-detail-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/03-product-detail-desktop.png) | [`03-product-detail-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/03-product-detail-mobile.png) | تایید شده (سبز) |
| ۴ | سبد خرید بونیو (Cart) | [`04-cart-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/04-cart-desktop.png) | [`04-cart-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/04-cart-mobile.png) | تایید شده (سبز) |
| ۵ | فرم تسویه‌حساب و انتخاب تحویل (Checkout) | [`05-checkout-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/05-checkout-desktop.png) | [`05-checkout-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/05-checkout-mobile.png) | تایید شده (سبز) |
| ۶ | درگاه پرداخت آزمایشی شاپرک (Sandbox) | [`06-checkout-sandbox-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/06-checkout-sandbox-desktop.png) | [`06-checkout-sandbox-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/06-checkout-sandbox-mobile.png) | تایید شده (سبز) |
| ۷ | تایید پرداخت و ثبت نهایی (Success) | [`07-checkout-success-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/07-checkout-success-desktop.png) | [`07-checkout-success-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/07-checkout-success-mobile.png) | تایید شده (سبز) |
| ۸ | پیشخوان سرپرست پت (Dashboard) | [`08-dashboard-overview-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/08-dashboard-overview-desktop.png) | [`08-dashboard-overview-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/08-dashboard-overview-mobile.png) | تایید شده (سبز) |
| ۹ | پیگیری مرسوله‌ها و ارسال اختصاصی (Tracking)| [`09-dashboard-tracking-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/09-dashboard-tracking-desktop.png) | [`09-dashboard-tracking-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/09-dashboard-tracking-mobile.png) | تایید شده (سبز) |
| ۱۰ | مدیریت پت‌ها و شناسنامه (Pets) | [`10-dashboard-pets-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/10-dashboard-pets-desktop.png) | [`10-dashboard-pets-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/10-dashboard-pets-mobile.png) | تایید شده (سبز) |
| ۱۱ | برنامه مراقبت روزانه و هوشمند (Care) | [`11-dashboard-care-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/11-dashboard-care-desktop.png) | [`11-dashboard-care-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/11-dashboard-care-mobile.png) | تایید شده (سبز) |
| ۱۲ | پاسپورت دیجیتال و پلاک NFC پت (Passport) | [`12-dashboard-passport-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/12-dashboard-passport-desktop.png) | [`12-dashboard-passport-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/12-dashboard-passport-mobile.png) | تایید شده (سبز) |
| ۱۳ | کیف پول و امتیازهای وفاداری (Wallet) | [`13-dashboard-wallet-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/13-dashboard-wallet-desktop.png) | [`13-dashboard-wallet-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/13-dashboard-wallet-mobile.png) | تایید شده (سبز) |
| ۱۴ | اشتراک‌های دوره‌ای غذای پت (Subscriptions) | [`14-dashboard-subscriptions-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/14-dashboard-subscriptions-desktop.png) | [`14-dashboard-subscriptions-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/14-dashboard-subscriptions-mobile.png) | تایید شده (سبز) |
| ۱۵ | نوبت‌های کلینیک و مربیگری (Appointments) | [`15-dashboard-appointments-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/15-dashboard-appointments-desktop.png) | [`15-dashboard-appointments-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/15-dashboard-appointments-mobile.png) | تایید شده (سبز) |
| ۱۶ | صفحه عمومی پلاک مفقودی پت (Emergency) | [`16-passport-emergency-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/16-passport-emergency-desktop.png) | [`16-passport-emergency-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/16-passport-emergency-mobile.png) | تایید شده (سبز) |
| ۱۷ | فرم ورود ادمین با محافظت آرگون۲ (Login) | [`17-admin-login-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/17-admin-login-desktop.png) | [`17-admin-login-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/17-admin-login-mobile.png) | تایید شده (سبز) |
| ۱۸ | پیشخوان مدیریت ادمین بونیو (Admin) | [`18-admin-panel-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/18-admin-panel-desktop.png) | [`18-admin-panel-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/18-admin-panel-mobile.png) | تایید شده (سبز) |
| ۱۹ | دایرکتوری دامپزشکان و کلینیک‌ها (Vets) | [`19-vets-directory-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/19-vets-directory-desktop.png) | [`19-vets-directory-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/19-vets-directory-mobile.png) | تایید شده (سبز) |
| ۲۰ | مربیان و رفتارشناسان حیوانات (Trainers) | [`20-trainers-directory-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/20-trainers-directory-desktop.png) | [`20-trainers-directory-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/20-trainers-directory-mobile.png) | تایید شده (سبز) |
| ۲۱ | هتل و پانسیون حیوانات خانگی (Boarding) | [`21-boarding-hotel-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/21-boarding-hotel-desktop.png) | [`21-boarding-hotel-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/21-boarding-hotel-mobile.png) | تایید شده (سبز) |
| ۲۲ | رویدادها و همایش‌های پت‌فرندلی (Events) | [`22-events-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/22-events-desktop.png) | [`22-events-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/22-events-mobile.png) | تایید شده (سبز) |
| ۲۳ | مرکز واگذاری و سرپرستی رایگان (Adopt) | [`23-adopt-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/23-adopt-desktop.png) | [`23-adopt-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/23-adopt-mobile.png) | تایید شده (سبز) |
| ۲۴ | قوانین و مقررات بونیو (Terms) | [`24-terms-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/24-terms-desktop.png) | [`24-terms-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/24-terms-mobile.png) | تایید شده (سبز) |
| ۲۵ | ضمانت و شرایط مرجوعی ۴ ساعته (Return) | [`25-return-policy-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/25-return-policy-desktop.png) | [`25-return-policy-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/25-return-policy-mobile.png) | تایید شده (سبز) |
| ۲۶ | سیاست حفظ حریم خصوصی (Privacy) | [`26-privacy-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/26-privacy-desktop.png) | [`26-privacy-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/26-privacy-mobile.png) | تایید شده (سبز) |
| ۲۷ | سلب مسئولیت پزشکی (Medical Disclaimer) | [`27-medical-disclaimer-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/27-medical-disclaimer-desktop.png) | [`27-medical-disclaimer-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/27-medical-disclaimer-mobile.png) | تایید شده (سبز) |
| ۲۸ | وضعیت بدون نتیجه کاتالوگ (Empty State) | [`28-shop-empty-state-desktop.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/28-shop-empty-state-desktop.png) | [`28-shop-empty-state-mobile.png`](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/docs/screenshots/28-shop-empty-state-mobile.png) | تایید شده (سبز) |

## ۶. صفحات دارای مشکل ریسپانسیو و سرریز افقی در موبایل (Mobile Overflow Audit)

تمامی ۲۸ روت برنامه در ویوپورت موبایل استاندارد (**عرض ۳۹۰ پیکسل با ضریب مقیاس ۲x و شبیه‌سازی لمسی**) توسط Puppeteer مورد ارزیابی قرار گرفتند تا هرگونه سرریز ناخواسته افقی (`document.body.scrollWidth > window.innerWidth`) به دقت استخراج شود:

### خلاصه وضعیت ریسپانسیو صفحات موبایل
- **تعداد کل روت‌های ارزیابی‌شده:** ۲۸ روت
- **روت‌های کاملاً ریسپانسیو و بدون سرریز:** 28 روت
- **روت‌های دارای سرریز افقی (Horizontal Overflow):** 0 روت

| ردیف | نام و عنوان صفحه | مسیر (Path) | عرض ویوپورت | عرض واقعی سند | مقدار سرریز | وضعیت ریسپانسیو | المان‌های عامل سرریز / یادداشت فنی |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | صفحه اصلی (خانه) | `/` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 2 | کاتالوگ فروشگاه و فیلترها | `/shop` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 3 | جزییات محصول و خرید (PDP) | `/shop/royal-canin-fit32` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 4 | سبد خرید | `/cart` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 5 | فرم تسویه‌حساب و انتخاب تحویل | `/checkout` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 6 | درگاه آزمایشی شاپرک (Sandbox) | `/checkout/sandbox?Authority=A0000000000000000000000000090000&amount=2290000` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 7 | تایید پرداخت و ثبت نهایی سفارش | `/checkout/success?order_id=dead6318-f991-4248-9198-6bc6a5537424&ref_id=REF_00090000` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 8 | پیشخوان سرپرست پت | `/dashboard` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 9 | پیگیری مرسوله‌ها و ارسال اختصاصی | `/dashboard/tracking` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 10 | مدیریت پت‌ها و شناسنامه | `/dashboard/pets` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 11 | برنامه مراقبت روزانه و هوشمند | `/dashboard/care` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 12 | پاسپورت و پلاک NFC پت | `/dashboard/passport` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 13 | کیف پول و امتیازهای وفاداری | `/dashboard/wallet` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 14 | اشتراک‌های دوره‌ای غذای پت | `/dashboard/subscriptions` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 15 | نوبت‌های کلینیک و مربیگری | `/dashboard/appointments` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 16 | صفحه عمومی پلاک مفقودی پت | `/passport/demo-token-1` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 17 | فرم ورود ادمین با محافظت آرگون۲ | `/admin/login` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 18 | پیشخوان مدیریت ادمین بونیو | `/admin` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 19 | دایرکتوری دامپزشکان و کلینیک‌ها | `/vets` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 20 | مربیان و رفتارشناسان حیوانات | `/trainers` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 21 | هتل و پانسیون حیوانات خانگی | `/boarding` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 22 | رویدادها و همایش‌های پت‌فرندلی | `/events` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 23 | مرکز واگذاری و سرپرستی رایگان | `/adopt` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 24 | قوانین و مقررات بونیو | `/terms` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 25 | ضمانت و شرایط مرجوعی ۴ ساعته | `/return-policy` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 26 | سیاست حفظ حریم خصوصی | `/privacy` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 27 | سلب مسئولیت پزشکی و دامپزشکی | `/medical-disclaimer` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |
| 28 | وضعیت بدون نتیجه کاتالوگ (Empty State) | `/shop?q=xyznotfound999` | ۳۹۰px | 390px | ۰px | ✅ استاندارد و امن | بدون سرریز، متناسب با ابعاد صفحه نمایش |

> [!NOTE]
> تمام ۵۶ اسکرین‌شات به صورت **تمام‌صفحه (Full-Page)** از بالاترین نقطه (Header) تا پایین‌ترین نقطه (Footer) پس از اسکرول خودکار و بارگذاری کامل تمام اجزای Lazy-load در پوشه `docs/screenshots/` جایگزین گردیده‌اند.
