import { test, expect } from "@playwright/test";

test.describe("Authentication & Middleware Protection", () => {
  test("1. Unauthenticated access to /dashboard redirects to /login with callbackUrl", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard/);
    await expect(page.locator("h2")).toContainText("LegalAI BD");
    await expect(page.locator("input[type='email']")).toBeVisible();
  });

  test("2. Successful login with demo credentials redirects to dashboard and displays advocate profile", async ({ page }) => {
    await page.goto("/login");

    // Fill credentials
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");

    // Click submit
    await page.locator("button[type='submit']").click();

    // Verify redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Verify user profile is visible in the navbar
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("header").locator("text=রহমান").first()).toBeVisible();
  });

  test("3. Clicking Logout redirects user back to login page", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Click logout
    const logoutBtn = page.locator("button[title='লগআউট করুন']");
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verify redirected back to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
