# گزارش جامع اعتبارسنجی و پالایش نهایی صفحه اصلی بونیو (Bonnivo Home)

**تاریخ اجرا:** ۲ اکتبر ۲۰۲۶  
**پروژه:** `C:\Users\programmer\Desktop\check\bonnivo-v2`  
**وضعیت کلی:** `VERIFIED`  
**گیت‌های کیفی:** تایپ‌چک ۰ خطا | بیلد تولیدی ۱۰۰٪ موفق (۳۳/۳۳ صفحه) | کنسول مرورگر ۰ اخطار هیدریشن و ۰ خطای رندرینگ

---

## ۱. مهارت‌های استفاده‌شده (Skills Actually Used)

۱. **`1-ui-pro-max` (UI/UX Authority):**  
   - مدیریت سیستم رنگی یکپارچه زمردی عمیق (`emerald-950` / `emerald-600`) و رنگ‌های خنثی گرم (`#F7F8F7`).
   - نسبت‌بندی مقیاس تصاویر محصولات و خدمات جهت حذف فضاهای خالی مرده.
   - حذف کامل کارت‌های تکراری دسته‌بندی و ایجاد ریتم عمودی روان در صفحه.

۲. **`2-threejs-3d` (Floating Island & 3D Hotspots):**  
   - محاسبه دقیق موقعیت ۴ هات‌اسپات شیشه‌ای روی سازه‌های واقعی جزیره متحرک:
     - فروشگاه: روی ساختمان فروشگاه با سایبان راه‌راه صورتی/سفید (`top-[48%] right-[70%]`).
     - کلینیک: روی ساختمان درمانی با نشان مثبت سبز (`top-[58%] right-[22%]`).
     - پتهای من: روی کلبه بالای تپه مرکزی (`top-[14%] right-[44%]`).
     - ایونت/جامعه: روی آلاچیق و محوطه چمن پایینی (`top-[76%] right-[38%]`).
   - انیمیشن شناوری آرام بدون افت فریم و سازگار با `prefers-reduced-motion`.

۳. **`3-fastapi-backend` (Data Integrity & Contracts):**  
   - اعتبارسنجی قرارداد داده‌های محصولات، مراکز درمانی، رویدادها و مربیان از دیتابیس بدون داده‌های فیک یا ساختگی.
   - حفظ ساختار لینک‌های مستقیم به صفحات اختصاصی (`/vets/[id]`, `/boarding/[id]`, `/events/[id]`, `/trainers/[id]`).

۴. **`4-nativewind-mobile` (Mobile & Responsive Language):**  
   - اعتبارسنجی کامل چیدمان ریسپانسیو در عرض‌های ۳۷۵px، ۳۹۰px و ۴۳۰px بدون کوچک‌ترین اسکرول افقی ناخواسته (`hasHorizontalScroll: false`).
   - تفکیک کامل نوار ناوبری ۶ تبه پایین موبایل از داک ۶ کپسولی هیرو.

۵. **`bonyo-sprint` (Governance & Verification Gates):**  
   - اجرای گیت‌های خودکار تایپ‌چک، ساخت باندل استاتیک و بازرسی عمیق DOM با هدلس کروم و ثبت شواهد تصویری.

---

## ۲. یافته‌های اولیه در شروع فاز (Baseline Findings)

- کارت‌های خدمات محلی (`LocalEcosystemSection`) بیش از حد بلند (`h-64`) و سنگین بودند و فضای عمودی زیادی اشغال می‌کردند.
- تصاویر محصولات درون کارت‌های ویترین دارای فضای خالی مرده خاکستری زیاد در اطراف بودند.
- بخش دسته‌بندی‌ها (۸ کارت جداگانه) با ناوبری و داک هیرو تکرار شده بود.
- کارت‌های مربیان و رویدادها نیازمند بنر تصویری سرتاسری و متناسب برای حس لوکس بودند.
- بخش برندها دارای پس‌زمینه‌های مستطیلی جعبه‌ای و نام‌های متنی بود که از حالت فلوتینگ و مینیمال خارج شده بود.
- دکمه هوش مصنوعی پشتیبان در سمت چپ قرار داشت و لوگوی فوتر در تم روشن دارای کنتراست تیره روی پس‌زمینه دارک فوتر بود.

---

## ۳. فایل‌های بازرسی‌شده (Files Inspected)

- `apps/web/src/app/page.tsx`
- `apps/web/src/components/home/hero-island-banner.tsx`
- `apps/web/src/components/home/featured-products-row.tsx`
- `apps/web/src/components/home/local-ecosystem-section.tsx`
- `apps/web/src/components/home/latest-events-section.tsx`
- `apps/web/src/components/home/best-trainers-section.tsx`
- `apps/web/src/components/home/partner-brands-section.tsx`
- `apps/web/src/components/support/support-drawer.tsx`
- `apps/web/src/components/brand/bonyo-logo.tsx`
- `apps/web/src/components/layout/desktop-footer.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/next.config.ts`

---

## ۴. فایل‌های تغییریافته (Files Changed)

- [hero-island-banner.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/home/hero-island-banner.tsx): تنظیم دقیق ۴ هات‌اسپات روی ابنیه جزیره و بروزرسانی داک ۶ کپسولی به خدمات اکوسیستم.
- [page.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/app/page.tsx): حذف سکشن تکراری دسته‌بندی‌ها و تنظیم ریتم عمودی.
- [local-ecosystem-section.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/home/local-ecosystem-section.tsx): بازطراحی به کارت‌های فشرده، جذاب و مدرن با سربرگ تصویری `h-32 sm:h-36` و تگ‌های تخصصی.
- [latest-events-section.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/home/latest-events-section.tsx): افزوده شدن تصویر کاور فول‌عرض با حفظ ابعاد کامپکت و لینک عمیق `/events/[id]`.
- [best-trainers-section.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/home/best-trainers-section.tsx): تصویر پرتره فول‌عرض مربی، متادیتا و لینک عمیق `/trainers/[id]`.
- [featured-products-row.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/home/featured-products-row.tsx): ارتقای مقیاس تصویر محصول به ۹۰٪، رفع فضاهای مرده و تنظیم پس‌زمینه `#F7F8F6`.
- [partner-brands-section.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/home/partner-brands-section.tsx): تبدیل به نشان‌های بدون قاب شناور با موج انیمیشنی، درخشش ملایم و تولتیپ شناور در هاور و فوکوس.
- [support-drawer.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/support/support-drawer.tsx): انتقال دکمه چت هوشمند به پایین-راست (`right-5`) و باز شدن دراور از راست.
- [bonyo-logo.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/brand/bonyo-logo.tsx): پشتیبانی از پراپ `themeMode="dark"` جهت نمایش متن و نشان کاملاً سفید با کنتراست بالا.
- [desktop-footer.tsx](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/components/layout/desktop-footer.tsx): بکارگیری لوگوی پرکنتراست در پس‌زمینه تاریک جنگلی فوتر.
- [globals.css](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/src/app/globals.css): تعریف کی‌فریم `@keyframes waveFloat` و کلاس `.animate-wave-float`.
- [next.config.ts](file:///c:/Users/programmer/Desktop/check/bonnivo-v2/apps/web/next.config.ts): افزودن `images.unoptimized: true` جهت تضمین لود پایدار و مستقل از شبکه.

---

## ۵. بهبودهای بصری و تجربی (Visual Improvements)

- **هماهنگی رنگی:** حذف رنگ‌های تصادفی صورتی و بنفش متفرقه و تثبیت پالت سبز زمردی، خاکستری گرم و سفید خالص.
- **تراکم و تناسب کارت‌ها:** اصلاح ارتفاع و مقیاس المان‌ها به شکلی که حس یک محصول پیوسته و یکپارچه (نه چند تکه مجزا) القا شود.
- **تایپوگرافی و خوانایی:** تنظیم کنتراست متن‌ها و عنوان‌های بخش‌ها در هر دو تم تاریک و روشن.

---

## ۶. اعتبارسنجی هیرو (Hero Verification) — `VERIFIED`

- حفظ پس‌زمینه جنگلی تیره با هدر ترنسپرنت و گرادیانت زمردی عمقی.
- متن خوش‌آمدگویی و تیتر فارسی رسمی بدون انگلیسی اضافه.
- جانمایی متوازن دکمه‌های اقدام اصلی (CTA) و دسترسی مستقیم به فروشگاه و مشاوره آنلاین.

---

## ۷. اعتبارسنجی هات‌اسپات‌های ۳D جزیره (Hotspot Verification) — `VERIFIED`

- **فروشگاه:** دقیقاً روی سایبان راه‌راه (`top-[48%] right-[70%]`) با آیکون فروشگاه و وضعیت باز.
- **کلینیک:** روی سازه سفید با نشان مثبت سبز (`top-[58%] right-[22%]`) با آیکون بهداشت.
- **پت‌های من:** روی کلبه چوبی بالای تپه (`top-[14%] right-[44%]`) با آیکون شناسه پت.
- **ایونت:** روی آلاچیق و باغچه پایینی (`top-[76%] right-[38%]`) با آیکون تقویم.
- رفتار شیشه‌ای ملایم (Glassmorphism)، تپ-تارگت استاندارد و سازگاری کامل بدون همپوشانی.

---

## ۸. داک اکوسیستم هیرو (Ecosystem Dock) — `VERIFIED`

- داک کپسولی زیر جزیره دقیقاً شامل ۶ خدمت کلیدی بنیوو:
  ۱. `پت‌های من` (شناسنامه و سوابق)  
  ۲. `کلینیک` (نوبت‌دهی آنلاین)  
  ۳. `پزشکی و سلامت` (مشاوره تخصصی)  
  ۴. `مربی` (آموزش و رفتار)  
  ۵. `ایونت` (دورهمی و کارگاه)  
  ۶. `فروشگاه` (ملزومات اورجینال)
- حذف موارد اضافه مانند سگ، گربه، پرندگان و غذا از این داک.

---

## ۹. کارت‌های محصول (Product Cards) — `VERIFIED`

- مقیاس تصاویر به ۹۰٪ سطح محفظه ارتقا یافته و حاشیه‌های خاکستری مرده حذف شدند.
- سلسه‌مراتب برند، نام محصول، امتیاز، قیمت و دکمه خرید سریع رعایت شده است.
- کلیک روی تصویر، عنوان، قیمت و امتیاز مستقیماً کاربر را به `/shop/[slug]` هدایت می‌کند و تنها کلیک روی «افزودن به سبد» عملیات خرید را انجام می‌دهد.

---

## ۱۰. کارت‌های خدمات محلی (Service Cards) — `VERIFIED`

- کاهش ارتفاع سربرگ تصویر به `h-32 sm:h-36` و ایجاد کارت‌های مینیمال ادیتوریال.
- نمایش نشان اعتماد، ستاره و تعداد نظرات، محله/شهر و خدمات تخصصی.
- لینک مستقیم مراکز به صفحات اختصاصی (`/vets/[id]` و `/boarding/[id]`).

---

## ۱۱. کارت‌های رویداد (Event Cards) — `VERIFIED`

- حفظ ابعاد کامپکت با افزودن تصویر پوششی باکیفیت در بالای کارت.
- اطلاعات زمان، تاریخ، موقعیت و قیمت به صورت منظم و خوانا.
- لینک مستقیم به `/events/[id]`.

---

## ۱۲. کارت‌های مربیان (Trainer Cards) — `VERIFIED`

- تصویر پرتره تمام‌عرض در بخش فوقانی کارت.
- تگ تخصص، امتیاز رضایت، محدوده فعالیت و هزینه هر جلسه.
- لینک مستقیم به `/trainers/[id]`.

---

## ۱۳. سیستم برندهای شناور (Brand Floating System) — `VERIFIED`

- حذف کامل کارت‌ها و جعبه‌های صلب و مرزبندی‌های سنتی.
- استفاده از نشان‌های فلوتینگ بر روی بستر گرادیانتی ملایم با انیمیشن موجی نرم (`waveFloat`) با تاخیرهای فازی متفاوت.
- تولتیپ تعاملی در هاور و فوکوس کیبورد که نام فارسی، برند و تخصص را بدون اشغال فضای دائمی نشان می‌دهد.

---

## ۱۴. موقعیت هوش مصنوعی (AI Position) — `VERIFIED`

- قرارگیری در گوشه **پایین-راست** صفحه (`right-5 bottom-5` در دسکتاپ و بالاتر از نوار پایینی در موبایل).
- باز شدن دراور پشتیبانی از سمت راست و عدم تداخل با دکمه‌های سبد خرید یا ناوبری موبایل.

---

## ۱۵. فوتر و کنتراست لوگو (Footer & Logo Contrast) — `VERIFIED`

- پس‌زمینه جنگلی عمیق و مجلل فوتر (`#07120D`).
- نمایش لوگوی رسمی بونیو با متن فارسی کاملاً سفید و نشان فیروزه‌ای روشن با کنتراست بالا (`footerLogoColor: rgb(255, 255, 255)`).
- ستون‌بندی منظم خدمات، دسترسی سریع، راه‌های ارتباطی و لینک‌های قانونی.

---

## ۱۶. تم روشن (Light Mode) — `VERIFIED`

- پس‌زمینه سراسری صفحه با رنگ خنثی گرم (`#F7F8F7` / `rgb(247, 248, 247)`).
- سطوح برجسته کارت‌ها با سفید خالص (`#FFFFFF`) و سایه‌های بسیار ملایم و طبیعی.

---

## ۱۷. تم تاریک (Dark Mode) — `VERIFIED`

- هارمونی لایه‌های خنثی تیره و جنگلی با خطوط مرزی بسیار ظریف (`border-stone-800`).
- خوانایی عالی متون بدون استفاده از رنگ‌های نئونی آزاردهنده.

---

## ۱۸. موبایل و ریسپانسیو (Mobile Verification) — `VERIFIED`

- آزموده شده در عرض‌های ۳۷۵px، ۳۹۰px و ۴۳۰px.
- مقدار `hasHorizontalScroll: false` در تمامی ابعاد.
- گرید ۲ ستونه منظم محصولات در موبایل.
- نوار ناوبری ۶ آیتمی پایین موبایل فعال و مستقل از داک هیرو.

---

## ۱۹. پشتیبانی کامل از راست‌چین (RTL Verification) — `VERIFIED`

- صفت `<html lang="fa" dir="rtl">` فعال.
- استفاده کامل از پراپرتی‌های منطقی تیل‌ویند (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).

---

## ۲۰. یکپارچگی داده و بک‌اند (Backend/Data Verification) — `VERIFIED`

- تمامی آبجکت‌های محصولات، خدمات، رویدادها و مربیان مطابق قراردادهای تایپ‌شده فرانت و بک‌اند فراخوانی می‌شوند.
- عدم وجود موجودیت‌های جعلی یا بایندرهای ساختگی.

---

## ۲۱. کنسول مرورگر و هیدریشن (Browser Console) — `VERIFIED`

- **خطاهای هیدریشن:** ۰
- **اخطارهای تودرتویی تگ‌های <a> و <button>:** ۰
- **خطاهای رندرینگ React:** ۰

---

## ۲۲. بازرسی لینت (Lint) — `VERIFIED`

- اجرای `pnpm --filter web lint` بدون خطای مسدودکننده.

---

## ۲۳. بازرسی تایپ (Typecheck) — `VERIFIED`

- اجرای دستور `pnpm --filter web typecheck` با موفقیت کامل و ۰ خطا.

---

## ۲۴. ساخت نهایی پروژه (Build) — `VERIFIED`

- اجرای `pnpm --filter web build` با موفقیت.
- تولید بدون نقص تمامی ۳۳ مسیر استاتیک و داینامیک وب‌سایت بونیو.

---

## ۲۵. مسائل باقیمانده (Remaining Issues)

- **هیچ مسئله مسدودکننده یا شکستگی بصری باقی نمانده است.**
- وب‌سایت هم‌اکنون با بالاترین استانداردهای بصری، مهندسی و تجربی آماده بهره‌برداری و اجرا بر روی پورت `http://localhost:3001` است.

---
*ثبت‌شده توسط بونیو اسپرینت ایجنت — گزارش نهایی پالایش صفحه اصلی بونیو*
