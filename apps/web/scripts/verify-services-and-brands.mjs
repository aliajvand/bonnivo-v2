import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3001";
const SCREENSHOT_DIR = path.resolve(__dirname, "../../../.bonyo/reports/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verify() {
  console.log("=== RUNNING TARGETED QA FOR SERVICES & 2-ROW ZIGZAG BRANDS ===");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1440,900",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleLogs = [];
  const hydrationErrors = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      consoleLogs.push(text);
    }
    if (text.includes("Hydration") || text.includes("hydrat")) {
      hydrationErrors.push(text);
    }
  });

  page.on("pageerror", (err) => {
    consoleLogs.push(err.toString());
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));

  // 1. Audit Service Cards vs Event Cards
  const domAudit = await page.evaluate(() => {
    const serviceCards = Array.from(document.querySelectorAll('a[href^="/vets/"], a[href^="/boarding/"]')).map((el) => {
      const img = el.querySelector("img");
      const imgContainer = img?.parentElement;
      return {
        href: el.getAttribute("href"),
        title: el.querySelector("h3")?.textContent?.trim(),
        hasImage: !!img,
        imgSrc: img?.src,
        imgContainerHeightClass: imgContainer?.className,
        hasBadges: !!el.querySelector(".rounded-full"),
        hasRating: el.textContent.includes("۴.۹"),
      };
    });

    const eventCards = Array.from(document.querySelectorAll('a[href^="/events/"]')).map((el) => {
      const img = el.querySelector("img");
      const imgContainer = img?.parentElement;
      return {
        href: el.getAttribute("href"),
        title: el.querySelector("h3")?.textContent?.trim(),
        imgContainerHeightClass: imgContainer?.className,
      };
    });

    const brandLogos = Array.from(document.querySelectorAll('a[href*="/shop?brand="]')).map((el) => ({
      href: el.getAttribute("href"),
      label: el.getAttribute("aria-label"),
      letter: el.textContent?.trim(),
    }));

    return {
      serviceCards,
      eventCards,
      brandCount: brandLogos.length,
      brandLogos,
    };
  });

  console.log("DOM Audit:", JSON.stringify(domAudit, null, 2));

  // Scroll to services section and capture screenshot
  await page.evaluate(() => {
    const el = document.querySelector('a[href^="/vets/"]');
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "services_card_event_match.png") });

  // Scroll to brand section, hover over Royal Canin emblem to verify tooltip
  await page.evaluate(() => {
    const brandSec = document.querySelector('a[href*="/shop?brand="]');
    if (brandSec) brandSec.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise((r) => setTimeout(r, 600));

  const royalCaninEmblem = await page.$('a[href*="Royal%20Canin"]');
  if (royalCaninEmblem) {
    await royalCaninEmblem.hover();
    await new Promise((r) => setTimeout(r, 600));
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "brand_2row_zigzag_tooltip_hover.png") });

  // Mobile Viewport Test (390px)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  await page.evaluate(() => {
    const el = document.querySelector('a[href^="/vets/"]');
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "services_mobile_390.png") });

  await page.evaluate(() => {
    const brandSec = document.querySelector('a[href*="/shop?brand="]');
    if (brandSec) brandSec.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "brands_mobile_390.png") });

  await browser.close();

  console.log("\n=== QA VERIFICATION COMPLETED ===");
  console.log(`Console Errors: ${consoleLogs.length}`);
  console.log(`Hydration Warnings: ${hydrationErrors.length}`);
  console.log(`Service Cards Verified: ${domAudit.serviceCards.length}`);
  console.log(`Brands Verified: ${domAudit.brandCount}`);
}

verify().catch(console.error);
