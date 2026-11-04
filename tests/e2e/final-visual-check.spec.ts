import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Final Visual & Functional QA Verification (LegalAI BD v2.0)", () => {
  const screenshotsDir = path.join(process.cwd(), "tests", "e2e", "screenshots");

  test("Task 1: Authentication & Session Persistence", async ({ page }) => {
    // 1. Navigate to root
    await page.goto("/");
    // Expect redirect to login if unauthenticated
    await expect(page).toHaveURL(/\/login/);

    // 2. Fill credentials and submit
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();

    // 3. Verify redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/$/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("text=রহমান")).toBeVisible();

    // 4. Reload page and verify session persistence
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard|\/$/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("text=রহমান")).toBeVisible();
  });

  test("Task 2: UI/UX - Dark Mode & Command Palette", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // --- Sub-task 2A: Dark Mode Toggle & Persistence ---
    const themeBtn = page.locator("[data-testid='theme-toggle-btn']");
    await expect(themeBtn).toBeVisible();

    // Toggle theme to dark
    await themeBtn.click();
    await page.waitForTimeout(500);
    const isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDark).toBe(true);

    // Reload and verify dark mode persists
    await page.reload();
    await page.waitForTimeout(500);
    const persistsDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(persistsDark).toBe(true);

    // Revert back to light mode for subsequent tests
    await themeBtn.click();
    await page.waitForTimeout(500);

    // --- Sub-task 2B: Command Palette Filter & Navigation ---
    await page.keyboard.press("Control+k");
    const modal = page.locator("[data-testid='command-palette-modal']");
    await expect(modal).toBeVisible();

    const input = page.locator("[data-testid='command-palette-input']");
    await expect(input).toBeVisible();

    // Type case name e.g. "করিম"
    await input.fill("করিম");
    await page.waitForTimeout(400);

    // Find filtered case item in list and click
    const caseItem = page.locator("[data-testid='cmd-case-case-karim-miah-001']");
    await expect(caseItem).toBeVisible();
    await caseItem.click();

    // Verify navigates to that case page
    await expect(page).toHaveURL(/\/case\/case-karim-miah-001/);
    await expect(page.locator("h1").first()).toContainText("করিম");
  });

  test("Task 3: Case Switching & State Isolation (Ghost Data Check)", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // 1. Navigate to Karim Miah's Criminal Case
    await page.goto("/case/case-karim-miah-001");
    await expect(page.locator("h1").first()).toContainText("করিম");

    const criminalEditor = page.locator(".legal-doc");
    await expect(criminalEditor).toBeVisible();
    await expect(criminalEditor).toContainText("থানার এজাহার");
    await expect(criminalEditor).toContainText("করিম মিয়া");

    // 2. Navigate to Kuddus Talukdar's Civil Case
    await page.goto("/case/case-1793702172465");
    await expect(page.locator("h1").first()).toContainText("কুদ্দুস তালুকদার");

    const civilEditor = page.locator(".legal-doc");
    await expect(civilEditor).toBeVisible();
    await expect(civilEditor).toContainText("বিজ্ঞ সিনিয়র সহকারী জজ আদালত");
    await expect(civilEditor).toContainText("কুদ্দুস তালুকদার");

    // 3. CRITICAL ASSERTION: Ensure "করিম মিয়া" or "থানার এজাহার" does NOT exist anywhere in DOM
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("করিম মিয়া");
    expect(bodyText).not.toContain("থানার এজাহার (FIR) দরখাস্ত");
  });

  test("Task 4: PDF Export (Server-Side)", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Navigate to Civil Case
    await page.goto("/case/case-1793702172465");
    await expect(page.locator(".legal-doc")).toBeVisible();

    // Setup network response promise for /api/export/pdf
    const pdfResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/export/pdf") &&
        response.request().method() === "POST"
    );

    // Setup download event promise
    const downloadPromise = page.waitForEvent("download");

    // Locate and click "Download PDF" button
    const pdfButton = page.locator("[data-testid='download-pdf-btn']");
    await expect(pdfButton).toBeVisible();
    await pdfButton.click();

    // Await responses
    const [pdfResponse, download] = await Promise.all([
      pdfResponsePromise,
      downloadPromise,
    ]);

    // Assertions
    expect(pdfResponse.status()).toBe(200);
    const contentType = pdfResponse.headers()["content-type"];
    expect(contentType).toContain("application/pdf");
    expect(download.suggestedFilename()).toContain(".pdf");
  });

  test("Task 5: Admin Panel & RBAC", async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Navigate to /admin
    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText("অ্যাডমিন ও গভর্ন্যান্স প্যানেল");

    // 1. Users Tab
    await expect(page.locator("text=নিবন্ধিত আইনজীবী ও চেম্বারসমূহ")).toBeVisible();
    await expect(page.locator("text=advocate@demo.bd").first()).toBeVisible();

    // 2. Prompts Tab
    const promptsTab = page.locator("button:has-text('AI সিস্টেম প্রম্পট')");
    await expect(promptsTab).toBeVisible();
    await promptsTab.click();
    await expect(page.locator("text=ইন্টারোগেশন প্রম্পট")).toBeVisible();
    await expect(page.locator("text=ড্রাফটিং প্রম্পট")).toBeVisible();

    // 3. Audit Logs Tab
    const auditTab = page.locator("button:has-text('অডিট লগ')");
    await expect(auditTab).toBeVisible();
    await auditTab.click();
    await expect(page.locator("text=সিস্টেম সিকিউরিটি ও অডিট লগ")).toBeVisible();
  });

  test("Task 6: Visual Regression & Screenshots (Responsive Checks)", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Set viewport: 1280x800
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);

    // 1. Dashboard Light Mode Screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, "dashboard-light.png"),
      fullPage: false,
    });

    // 2. Dashboard Dark Mode Screenshot
    const themeBtn = page.locator("[data-testid='theme-toggle-btn']");
    await themeBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(screenshotsDir, "dashboard-dark.png"),
      fullPage: false,
    });

    // 3. Command Palette Open Screenshot
    await page.keyboard.press("Control+k");
    await expect(page.locator("[data-testid='command-palette-modal']")).toBeVisible();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: path.join(screenshotsDir, "command-palette.png"),
      fullPage: false,
    });

    // Close command palette
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // 4. Responsive Desktop (1280x800) Screenshot
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({
      path: path.join(screenshotsDir, "responsive-desktop-1280.png"),
      fullPage: false,
    });

    // 5. Responsive Tablet (768x1024) Screenshot
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "responsive-tablet-768.png"),
      fullPage: false,
    });
  });
});
