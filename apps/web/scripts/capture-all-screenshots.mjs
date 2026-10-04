import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = path.resolve(process.cwd(), "docs/screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGES_TO_CAPTURE = [
  { id: "01-home", path: "/", nameFa: "صفحه اصلی (خانه)" },
  { id: "02-shop-catalog", path: "/shop", nameFa: "کاتالوگ فروشگاه و فیلترها" },
  { id: "03-product-detail", path: "/shop/royal-canin-fit32", fallbackPath: "/shop", nameFa: "جزییات محصول و خرید (PDP)" },
  { id: "04-cart", path: "/cart", nameFa: "سبد خرید" },
  { id: "05-checkout", path: "/checkout", nameFa: "فرم تسویه‌حساب و انتخاب تحویل" },
  { id: "06-checkout-sandbox", path: "/checkout/sandbox?Authority=A0000000000000000000000000090000&amount=2290000", nameFa: "درگاه آزمایشی شاپرک (Sandbox)" },
  { id: "07-checkout-success", path: "/checkout/success?order_id=dead6318-f991-4248-9198-6bc6a5537424&ref_id=REF_00090000", nameFa: "تایید پرداخت و ثبت نهایی سفارش" },
  { id: "08-dashboard-overview", path: "/dashboard", nameFa: "پیشخوان سرپرست پت" },
  { id: "09-dashboard-tracking", path: "/dashboard/tracking", nameFa: "پیگیری مرسوله‌ها و ارسال اختصاصی" },
  { id: "10-dashboard-pets", path: "/dashboard/pets", nameFa: "مدیریت پت‌ها و شناسنامه" },
  { id: "11-dashboard-care", path: "/dashboard/care", nameFa: "برنامه مراقبت روزانه و هوشمند" },
  { id: "12-dashboard-passport", path: "/dashboard/passport", nameFa: "پاسپورت و پلاک NFC پت" },
  { id: "13-dashboard-wallet", path: "/dashboard/wallet", nameFa: "کیف پول و امتیازهای وفاداری" },
  { id: "14-dashboard-subscriptions", path: "/dashboard/subscriptions", nameFa: "اشتراک‌های دوره‌ای غذای پت" },
  { id: "15-dashboard-appointments", path: "/dashboard/appointments", nameFa: "نوبت‌های کلینیک و مربیگری" },
  { id: "16-passport-emergency", path: "/passport/demo-token-1", nameFa: "صفحه عمومی پلاک مفقودی پت" },
  { id: "17-admin-login", path: "/admin/login", nameFa: "فرم ورود ادمین با محافظت آرگون۲" },
  { id: "18-admin-panel", path: "/admin", nameFa: "پیشخوان مدیریت ادمین بونیو" },
  { id: "19-vets-directory", path: "/vets", nameFa: "دایرکتوری دامپزشکان و کلینیک‌ها" },
  { id: "20-trainers-directory", path: "/trainers", nameFa: "مربیان و رفتارشناسان حیوانات" },
  { id: "21-boarding-hotel", path: "/boarding", nameFa: "هتل و پانسیون حیوانات خانگی" },
  { id: "22-events", path: "/events", nameFa: "رویدادها و همایش‌های پت‌فرندلی" },
  { id: "23-adopt", path: "/adopt", nameFa: "مرکز واگذاری و سرپرستی رایگان" },
  { id: "24-terms", path: "/terms", nameFa: "قوانین و مقررات بونیو" },
  { id: "25-return-policy", path: "/return-policy", nameFa: "ضمانت و شرایط مرجوعی ۴ ساعته" },
  { id: "26-privacy", path: "/privacy", nameFa: "سیاست حفظ حریم خصوصی" },
  { id: "27-medical-disclaimer", path: "/medical-disclaimer", nameFa: "سلب مسئولیت پزشکی و دامپزشکی" },
  { id: "28-shop-empty-state", path: "/shop?q=xyznotfound999", nameFa: "وضعیت بدون نتیجه کاتالوگ (Empty State)" },
];

async function main() {
  console.log("=== BONNIVO COMPREHENSIVE SCREENSHOT GENERATOR ===");
  console.log(`Target: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();

  // Step 1: Pre-authenticate QA user session so dashboard & checkout pages render cleanly
  console.log("[1/3] Setting up authenticated QA session...");
  try {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0", timeout: 25000 });

    const authRes = await page.evaluate(async () => {
      try {
        await fetch("/api/v1/auth/otp/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: "09120000001" }),
        });
        const vRes = await fetch("/api/v1/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone_number: "09120000001", code: "12345" }),
        });
        const vData = await vRes.json();
        if (vData.access_token) {
          localStorage.setItem("bonnivo_auth_token_v1", vData.access_token);
          localStorage.setItem("bonnivo_user_profile_v1", JSON.stringify(vData.user));
          return true;
        }
      } catch (e) {
        return false;
      }
      return false;
    });
    console.log(`QA Auth Session established: ${authRes}`);

    // Pre-populate cart items for Cart & Checkout screenshot completeness
    await page.evaluate(() => {
      const demoCartItem = {
        id: "item-pdp-1",
        offerId: "prod-rc-fit32-offer-1",
        productTitle: "غذای خشک گربه فیت ۳۲ رویال کنین",
        sellerName: "انبار مرکزی بونیو",
        unitPriceTomans: 1450000,
        discountedPriceTomans: 1350000,
        quantity: 1,
        leadTimeDays: 0,
        image: "/icons/food.svg",
        weightText: "۲ کیلوگرم",
      };
      localStorage.setItem("bonnivo_cart_items_v1", JSON.stringify([demoCartItem]));
    });
  } catch (err) {
    console.warn("Pre-auth setup warning:", err.message);
  }

  // Step 2: Capture Desktop (1920x1080)
  console.log("\n[2/3] Capturing Desktop Viewports (1920x1080)...");
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const results = [];

  for (const item of PAGES_TO_CAPTURE) {
    const filename = `${item.id}-desktop.png`;
    const targetPath = path.join(OUTPUT_DIR, filename);
    const url = `${BASE_URL}${item.path}`;

    try {
      console.log(`  -> Capturing ${item.id} (Desktop)...`);
      await page.goto(url, { waitUntil: "networkidle0", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 600));

      // Check if page 404ed and fallback if needed
      const is404 = await page.evaluate(() => document.body.innerText.includes("404") || document.body.innerText.includes("یافت نشد"));
      if (is404 && item.fallbackPath) {
        await page.goto(`${BASE_URL}${item.fallbackPath}`, { waitUntil: "networkidle0" });
        await new Promise((r) => setTimeout(r, 500));
      }

      await page.screenshot({ path: targetPath, fullPage: false });
      results.push({ ...item, desktopFile: filename, desktopSuccess: true });
    } catch (err) {
      console.error(`     Error capturing ${item.id} desktop: ${err.message}`);
      results.push({ ...item, desktopFile: filename, desktopSuccess: false });
    }
  }

  // Step 3: Capture Mobile (390x844)
  console.log("\n[3/3] Capturing Mobile Viewports (390x844)...");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  for (let i = 0; i < PAGES_TO_CAPTURE.length; i++) {
    const item = PAGES_TO_CAPTURE[i];
    const filename = `${item.id}-mobile.png`;
    const targetPath = path.join(OUTPUT_DIR, filename);
    const url = `${BASE_URL}${item.path}`;

    try {
      console.log(`  -> Capturing ${item.id} (Mobile)...`);
      await page.goto(url, { waitUntil: "networkidle0", timeout: 20000 });
      await new Promise((r) => setTimeout(r, 600));

      await page.screenshot({ path: targetPath, fullPage: false });
      results[i].mobileFile = filename;
      results[i].mobileSuccess = true;
    } catch (err) {
      console.error(`     Error capturing ${item.id} mobile: ${err.message}`);
      results[i].mobileFile = filename;
      results[i].mobileSuccess = false;
    }
  }

  await browser.close();

  console.log("\n=== SCREENSHOT CAPTURE COMPLETED ===");
  console.log(`Total captured: ${results.filter(r => r.desktopSuccess && r.mobileSuccess).length} / ${results.length}`);
}

main().catch((err) => {
  console.error("FATAL screenshot runner error:", err);
  process.exit(1);
});
