import { test, expect } from "@playwright/test";

test.describe("Dark Mode & Theme Switching", () => {
  test("1. Advocate can toggle between Light and Dark mode from Navbar", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Locate theme toggle button
    const themeBtn = page.locator("[data-testid='theme-toggle-btn']");
    await expect(themeBtn).toBeVisible();

    // Initial state (default is light or system)
    const initialHtmlClass = await page.locator("html").getAttribute("class");

    // Click to toggle
    await themeBtn.click();
    await page.waitForTimeout(400);

    // Verify html class changed
    const updatedHtmlClass = await page.locator("html").getAttribute("class");
    expect(updatedHtmlClass).not.toBe(initialHtmlClass);

    // Click again to toggle back
    await themeBtn.click();
    await page.waitForTimeout(400);

    const revertedHtmlClass = await page.locator("html").getAttribute("class");
    expect(revertedHtmlClass).toBe(initialHtmlClass);
  });
});
