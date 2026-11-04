import { test, expect } from "@playwright/test";

test.describe("Case Switching & State Isolation (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);
  });

  test("1. Criminal Case displays FIR draft with criminal accused details", async ({ page }) => {
    await page.goto("/case/case-karim-miah-001");

    // Wait for case workspace to load
    await expect(page.locator("h1")).toContainText("করিম");

    // Check Editor Panel header and content
    const editor = page.locator(".legal-doc");
    await expect(editor).toBeVisible();
    await expect(editor).toContainText("থানার এজাহার");
    await expect(editor).toContainText("করিম মিয়া");
  });

  test("2. Civil Land Dispute Case switches cleanly to Civil Plaint without ghost criminal state", async ({ page }) => {
    // Navigate to dashboard
    await page.goto("/");

    // Click "নতুন মামলা শুরু করুন" button to open modal
    const newCaseBtn = page.locator("button:has-text('নতুন মামলা শুরু করুন')");
    await expect(newCaseBtn).toBeVisible();
    await newCaseBtn.click();

    // Fill in modal details for Civil Land Dispute with Kudus Talukdar
    await page.locator("textarea").fill("আমাদের পৈতৃক খরিদসূত্রে প্রাপ্ত নালিশি জমিতে আমরা দীর্ঘদিন ধরে শান্তিপূর্ণ ভোগদখলে আছি। কিন্তু বিবাদী কুদ্দুস তালুকদার দলবল নিয়ে সীমানা প্রাচীর ভেঙে অনুপ্রবেশ করে এবং সেখানে অবৈধ স্থাপনা নির্মাণের পাঁয়তারা করছে ও আমাদের জমি জবরদখলের হুমকি দিচ্ছে");
    await page.locator("select").selectOption("Civil");

    // Submit modal
    const submitBtn = page.locator("button[type='submit']:has-text('মামলা তৈরি ও বিশ্লেষণ করুন')");
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify redirected to the new case workspace
    await expect(page).toHaveURL(/\/case\/case-/);
    await expect(page.locator("h1")).toContainText("কুদ্দুস তালুকদার");

    // Verify Document Editor now displays Civil Plaint and defendant Kudus Talukdar
    const editor = page.locator(".legal-doc");
    await expect(editor).toBeVisible();
    await expect(editor).toContainText("বিজ্ঞ সিনিয়র সহকারী জজ আদালত");
    await expect(editor).toContainText("কুদ্দুস তালুকদার");

    // CRITICAL ASSERTION: Ensure previous criminal case's accused and FIR header are NOT present
    await expect(editor).not.toContainText("করিম মিয়া");
    await expect(editor).not.toContainText("থানার এজাহার (FIR) দরখাস্ত");
  });

  test("3. Direct navigation to Kudus Talukdar case (case-1793702172465) loads cleanly", async ({ page }) => {
    await page.goto("/case/case-1793702172465");

    await expect(page.locator("h1")).toContainText("কুদ্দুস তালুকদার");

    const editor = page.locator(".legal-doc");
    await expect(editor).toBeVisible();
    await expect(editor).toContainText("বিজ্ঞ সিনিয়র সহকারী জজ আদালত");
    await expect(editor).toContainText("কুদ্দুস তালুকদার");

    // Must never show Karim Miah
    await expect(editor).not.toContainText("করিম মিয়া");
  });
});
