import { test, expect } from "@playwright/test";

test.describe("Platform Owner (Super Admin) Access Control & Dashboard (E2E)", () => {
  test("1. Non-Platform Owner (Regular Advocate) is restricted from /super-admin and redirected to /dashboard", async ({
    page,
  }) => {
    // Login as normal advocate
    await page.goto("/login");
    await page.fill('input[type="email"]', "advocate@demo.bd");
    await page.fill('input[type="password"]', "legal123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Attempt direct access to /super-admin
    await page.goto("/super-admin");
    // Should be redirected away from /super-admin to /dashboard
    await expect(page).toHaveURL(/\/dashboard|\/$/);
  });

  test("2. Platform Owner (owner@legalai.bd) can access /super-admin and view tenants & revenue", async ({
    page,
  }) => {
    // Logout first if any session
    await page.goto("/login");
    await page.fill('input[type="email"]', "owner@legalai.bd");
    await page.fill('input[type="password"]', "owner123");
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/$/);

    // Navigate to /super-admin
    await page.goto("/super-admin");
    await expect(page).toHaveURL(/.*\/super-admin/);

    // Check header and widgets
    await expect(page.locator("h1")).toContainText("প্ল্যাটফর্ম ওনার ড্যাশবোর্ড ও টেন্যান্টস অডিট");
    await expect(page.locator("body")).toContainText("নিবন্ধিত চেম্বার (Tenants)");
    await expect(page.locator("body")).toContainText("প্ল্যাটফর্ম রেভিনিউ (bKash)");
    await expect(page.locator("body")).toContainText("রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার");
  });
});
