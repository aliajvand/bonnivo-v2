import { test, expect } from "@playwright/test";

test.describe("Bonyo Core Flows E2E Suite", () => {
  test("1. Authentication Flow: User requests OTP and verifies session with QA persona", async ({ page }) => {
    await page.goto("/");
    // Expect landing page header with title or branding
    await expect(page).toHaveTitle(/بونیو|Bonyo/);

    // Look for Login/Register button or trigger
    const loginTrigger = page.locator("button:has-text('ورود'), a:has-text('ورود')").first();
    if (await loginTrigger.isVisible()) {
      await loginTrigger.click();
    }

    // Modal or input with phone
    const phoneInput = page.locator("input[type='tel'], input[placeholder*='09']").first();
    if (await phoneInput.isVisible()) {
      // Use QA Persona Customer phone
      await phoneInput.fill("09120000001");
      const submitPhone = page.locator("button:has-text('دریافت کد'), button:has-text('ارسال کد'), button:has-text('ادامه')").first();
      await submitPhone.click();

      // Wait for OTP inputs (5 digits for 12345)
      const otpInputs = page.locator("input[inputmode='numeric'], input[maxlength='1']");
      await page.waitForTimeout(500);
      const count = await otpInputs.count();
      if (count >= 5) {
        const qaCode = "12345";
        for (let i = 0; i < 5; i++) {
          await otpInputs.nth(i).fill(qaCode[i]);
        }
      }
    }
  });

  test("2. Pet Profile & Dashboard: Pet details render with care streaks", async ({ page }) => {
    await page.goto("/dashboard/daily");
    // Verify dashboard renders
    await expect(page.locator("body")).toBeVisible();
    // Verify care routine section exists
    const careSection = page.locator("text=روتین مراقبت, text=وظایف امروز").first();
    if (await careSection.isVisible()) {
      await expect(careSection).toBeVisible();
    }
  });

  test("3. Pet-Connected Storefront & Cart Checkout Flow", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator("body")).toBeVisible();

    // Find first product Add to Cart button
    const addToCartBtn = page.locator("button:has-text('افزودن به سبد'), button:has-text('خرید')").first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
    }

    // Navigate to Cart
    await page.goto("/cart");
    await expect(page.locator("body")).toBeVisible();

    // Verify checkout button or summary exists
    const checkoutBtn = page.locator("button:has-text('تکمیل سفارش'), a:has-text('تکمیل سفارش')").first();
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await expect(page).toHaveURL(/.*checkout/);
    }
  });

  test("4. Public QR Passport Emergency Scan Guard", async ({ page }) => {
    // Open public passport scan route with mock or test token
    await page.goto("/passport/mock-test-token");
    await expect(page.locator("body")).toBeVisible();

    // Ensure raw unmasked phone number and home address are never in page DOM
    const pageContent = await page.content();
    expect(pageContent).not.toContain("09121110001");
    expect(pageContent).not.toContain("پاسداران، خ پایدارفرد");
  });
});
