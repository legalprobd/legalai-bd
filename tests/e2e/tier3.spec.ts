import { test, expect } from "@playwright/test";

test.describe("Tier 3 Advanced AI - Bail Predictor & Mock Trial Simulator", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate with demo credentials
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);
  });

  test("1. Bail Outcome Predictor - Form submits parameters and displays visual probability and grounds", async ({ page }) => {
    await page.goto("/bail-predictor");
    await expect(page.locator("h1")).toContainText("আদালতের জামিন সম্ভাবনা ও ফলাফল প্রিডিক্টর");

    // Click quick preset button
    const presetBtn = page.locator("button:has-text('১. দীর্ঘ কারাবাস ও অসুস্থতা')");
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    // Verify input populated
    const sectionsInput = page.locator("input[placeholder*='৩২৩']");
    await expect(sectionsInput).toBeVisible();

    // Click "জামিনের সম্ভাবনা গণনা করুন"
    const predictBtn = page.locator("button:has-text('জামিনের সম্ভাবনা গণনা করুন')");
    await expect(predictBtn).toBeVisible();
    await predictBtn.click();

    // Verify Prediction results appear
    await expect(page.locator("text=জামিনের সামগ্রিক সম্ভাবনা")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=আদালতে উপস্থাপনের জন্য জোরালো আইনি গ্রাউন্ডসমূহ")).toBeVisible();
    await expect(page.locator("text=আইনজীবীর জন্য কৌশলগত সুপারিশ")).toBeVisible();
    await expect(page.locator("text=51 DLR (AD) 1").first()).toBeVisible();
  });

  test("2. Mock Trial Simulator - Advocate cross-examines witness and receives objection on leading question", async ({ page }) => {
    await page.goto("/mock-trial");
    await expect(page.locator("h1")).toContainText("মক ট্রায়াল ও সাক্ষী জেরা সিমুলেটর");

    // Verify initial courtroom witness stand message
    await expect(page.locator("text=সাক্ষীর কাঠগড়া")).toBeVisible();
    await expect(page.locator("text=আমি শপথপূর্বক বলতেছি")).toBeVisible();

    // Ask a leading question using quick helper button or input
    const chatInput = page.locator("input[placeholder*='সাক্ষীকে উদ্দেশ্য করে প্রশ্ন করুন']");
    await expect(chatInput).toBeVisible();
    await chatInput.fill("আপনি কি চোরকে পালাতে দেখেছিলেন, তাই না?");

    // Click submit
    const submitBtn = page.locator("button:has-text('প্রশ্ন করুন')");
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify objection is raised under Evidence Act 141-142
    await expect(page.locator("text=Objection My Lord! Leading question").first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator(".animate-bounce-short").first()).toContainText("১৪১-১৪২ ধারা");

    // Test Reset Trial button
    const resetBtn = page.locator("button:has-text('ট্রায়াল রিসেট করুন')");
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await expect(page.locator("text=আমি শপথপূর্বক বলতেছি").first()).toBeVisible();
  });
});
