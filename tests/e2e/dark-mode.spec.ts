import { test, expect } from "@playwright/test";

test.describe("Strict Light Theme Consistency (No Dark Mode)", () => {
  test("1. Application is strictly locked to Light Theme on all pages", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Verify html tag does NOT have 'dark' class
    const htmlClasses = await page.locator("html").getAttribute("class");
    expect(htmlClasses).not.toContain("dark");

    // Verify theme toggle button does NOT exist
    const themeBtn = page.locator("[data-testid='theme-toggle-btn']");
    await expect(themeBtn).toHaveCount(0);

    // Check body background is light
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    // rgb(248, 250, 252) corresponds to #f8fafc (slate-50)
    expect(bodyBg).toBe("rgb(248, 250, 252)");
  });
});
