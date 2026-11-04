import { test, expect } from "@playwright/test";

test.describe("Global Command Palette (Ctrl+K)", () => {
  test("1. Opens with Ctrl+K shortcut, allows navigation, and closes on Escape", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Press Ctrl+K
    await page.keyboard.press("Control+k");
    const modal = page.locator("[data-testid='command-palette-modal']");
    await expect(modal).toBeVisible();

    const input = page.locator("[data-testid='command-palette-input']");
    await expect(input).toBeVisible();

    // Select settings command
    const settingsOption = page.locator("[data-testid='cmd-settings']");
    await expect(settingsOption).toBeVisible();
    await settingsOption.click();

    // Verify redirected to /settings
    await expect(page).toHaveURL(/\/settings/);

    // Press Ctrl+K again on settings page
    await page.keyboard.press("Control+k");
    await expect(page.locator("[data-testid='command-palette-modal']")).toBeVisible();

    // Press Escape to dismiss
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-testid='command-palette-modal']")).not.toBeVisible();
  });
});
