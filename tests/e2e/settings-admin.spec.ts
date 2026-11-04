import { test, expect } from "@playwright/test";

test.describe("Advocate Profile Settings & Admin RBAC (E2E)", () => {
  test("1. Logged-in advocate updates profile in /settings and sees success feedback", async ({ page }) => {
    // Login as advocate
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Navigate to /settings
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("অ্যাডভোকেট প্রোফাইল ও চেম্বার সেটিংস");

    // Fill in updated profile information
    const chamberInput = page.locator("input[placeholder*='রহমান অ্যান্ড পার্টনার্স']");
    await expect(chamberInput).toBeVisible();
    await chamberInput.fill("রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার (E2E Verified)");

    // Save profile
    const saveBtn = page.locator("button:has-text('তথ্য সংরক্ষণ করুন')");
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify success feedback message
    await expect(page.locator("text=প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে।")).toBeVisible({ timeout: 7000 });
  });

  test("2. Non-admin user (junior@demo.bd) is restricted from /admin and redirected to /dashboard", async ({ page }) => {
    // Login as non-admin junior advocate
    await page.goto("/login");
    await page.locator("input[type='email']").fill("junior@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Attempt direct navigation to /admin
    await page.goto("/admin");

    // Expect immediate redirection to /dashboard
    await expect(page).toHaveURL(/\/dashboard|\/$/);
  });

  test("3. Admin user (advocate@demo.bd) accesses /admin and views users, prompts, and audit logs", async ({ page }) => {
    // Login as admin advocate
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Navigate to /admin
    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText("LegalAI BD অ্যাডমিন ও গভর্ন্যান্স প্যানেল");

    // Tab 1: Users table is visible and shows advocate
    await expect(page.locator("text=নিবন্ধিত আইনজীবী ও চেম্বারসমূহ")).toBeVisible();
    await expect(page.locator("text=advocate@demo.bd").first()).toBeVisible();

    // Tab 2: Switch to Prompts tab
    const promptsTab = page.locator("button:has-text('AI সিস্টেম প্রম্পট')");
    await expect(promptsTab).toBeVisible();
    await promptsTab.click();
    await expect(page.locator("text=ইন্টারোগেশন প্রম্পট")).toBeVisible();

    // Tab 3: Switch to Audit Logs tab
    const auditTab = page.locator("button:has-text('অডিট লগ')");
    await expect(auditTab).toBeVisible();
    await auditTab.click();
    await expect(page.locator("text=সিস্টেম সিকিউরিটি ও অডিট লগ")).toBeVisible();
  });
});
