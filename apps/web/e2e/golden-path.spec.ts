import { test, expect } from "@playwright/test";

test.describe("Bonyo Golden Path E2E Suite", () => {
  test("Golden Path: QA Customer Login -> Add to Cart -> Checkout -> Sandbox Payment -> Order Tracking", async ({
    page,
  }) => {
    // 1. Visit landing page
    await page.goto("/");
    await expect(page).toHaveTitle(/بونیو|Bonyo/);

    // 2. Open OTP Login Modal
    const loginTrigger = page.locator("button:has-text('ورود'), a:has-text('ورود')").first();
    await expect(loginTrigger).toBeVisible();
    await loginTrigger.click();

    // 3. Fill QA Customer Phone Number (09120000001)
    const phoneInput = page.locator("input[type='tel']").first();
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill("09120000001");

    // 4. Request OTP
    const requestOtpBtn = page.locator("button:has-text('دریافت کد تأیید پیامکی')").first();
    await requestOtpBtn.click();

    // 5. Fill Deterministic QA OTP (12345)
    const otpInputs = page.locator("input[inputmode='numeric']");
    await expect(otpInputs.first()).toBeVisible({ timeout: 10000 });
    const qaOtp = "12345";
    for (let i = 0; i < 5; i++) {
      await otpInputs.nth(i).fill(qaOtp[i]);
    }

    // 6. Submit OTP Verification
    const verifyBtn = page.locator("button:has-text('تأیید و ورود')").first();
    if (await verifyBtn.isVisible()) {
      await verifyBtn.click();
    }

    // Wait for auth modal to close / session to be established
    await page.waitForTimeout(1000);

    // 7. Navigate to Storefront (/shop)
    await page.goto("/shop");
    await expect(page.locator("h1:has-text('پت‌شاپ تخصصی بونیو')")).toBeVisible();

    // 8. Add Product to Cart
    // Click on the first product's CTA button (single variant add or view product)
    const productCta = page.locator("button:has-text('افزودن به سبد'), a:has-text('انتخاب وزن')").first();
    await expect(productCta).toBeVisible();

    const ctaText = await productCta.innerText();
    if (ctaText.includes("انتخاب وزن")) {
      await productCta.click();
      await page.waitForURL(/\/shop\/.+/);
      const detailAddBtn = page.locator("button:has-text('افزودن به سبد')").first();
      await detailAddBtn.click();
    } else {
      await productCta.click();
    }

    // 9. Navigate to Cart (/cart)
    await page.goto("/cart");
    await expect(page.locator("h1:has-text('سبد خرید')")).toBeVisible();

    // 10. Proceed to Checkout
    const checkoutLink = page.locator("a[href='/checkout']:has-text('ادامه فرایند تسویه‌حساب')").first();
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    // 11. Complete Checkout Form
    await page.waitForURL(/\/checkout/);
    await expect(page.locator("h1:has-text('تسویه‌حساب')")).toBeVisible();

    // Fill address details
    await page.locator("input[type='text']").first().fill("سارا محمدی");
    await page.locator("input[type='tel']").first().fill("09120000001");
    await page.locator("input[placeholder*='سعادت‌آباد']").fill("سعادت‌آباد");
    await page.locator("textarea").first().fill("بلوار دریا، خیابان موج، پلاک ۸، واحد ۴");

    // 12. Submit Order to Payment Gateway
    const submitOrderBtn = page.locator("button:has-text('پرداخت و ثبت نهایی سفارش')").first();
    await expect(submitOrderBtn).toBeVisible();
    await submitOrderBtn.click();

    // 13. Redirect to Sandbox Payment Gateway (/checkout/sandbox)
    await page.waitForURL(/\/checkout\/sandbox/, { timeout: 15000 });
    await expect(page.locator("text=درگاه پرداخت تستی بونیو (Sandbox)")).toBeVisible();

    // 14. Confirm Payment in Sandbox
    const approvePaymentBtn = page.locator("button:has-text('تایید پرداخت و بازگشت به بونیو')").first();
    await expect(approvePaymentBtn).toBeVisible();
    await approvePaymentBtn.click();

    // 15. Callback & Success Page (/checkout/success)
    await page.waitForURL(/\/checkout\/success/, { timeout: 15000 });
    await expect(page.locator("text=سفارش شما با موفقیت ثبت و پرداخت شد!")).toBeVisible();

    // 16. Navigate to Order Tracking
    const trackingLink = page.locator("a[href*='/dashboard/tracking']").first();
    if (await trackingLink.isVisible()) {
      await trackingLink.click();
      await page.waitForURL(/\/dashboard\/tracking/);
      await expect(page.locator("text=پیگیری مرسولات و وضعیت سفارش‌ها")).toBeVisible();
    }
  });

  test("Admin Authentication Flow: Login with Credentials -> View Admin Dashboard", async ({ page }) => {
    // 1. Visit admin login
    await page.goto("/admin/login");
    await expect(page.locator("h1:has-text('ورود به مدیریت بونیو')")).toBeVisible();

    // 2. Fill admin credentials
    await page.locator("input#user_login").fill("security_admin");
    await page.locator("input#user_pass").fill("SecurePassword2026!");

    // 3. Submit login
    const loginBtn = page.locator("button:has-text('ورود')").first();
    await loginBtn.click();

    // 4. Verify redirected to /admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await expect(page.locator("body")).toContainText(/پیشخوان|مدیریت/);
  });
});
