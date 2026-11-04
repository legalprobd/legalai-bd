import { test, expect } from "@playwright/test";

test.describe("Compliance & Public Pages (Terms, Privacy, Pricing)", () => {
  test("1. Terms of Service (/terms) loads with mandatory legal disclaimer", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.locator("h1")).toContainText("ব্যবহারের শর্তাবলি");
    await expect(page.locator("text=বাধ্যতামূলক আইনি সতর্কতা ও ডিসক্লেইমার")).toBeVisible();
    await expect(page.locator("text=LegalAI BD কোনো নিবন্ধিত ল’ ফার্ম বা বিচারিক কর্তৃপক্ষ নয়")).toBeVisible();
  });

  test("2. Privacy Policy (/privacy) loads with advocate-client privilege statement", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.locator("h1")).toContainText("গোপনীয়তা নীতি");
    await expect(page.locator("text=অ্যাডভোকেট-ক্লায়েন্ট তথ্যের সর্বোচ্চ নিরাপত্তা গ্যারান্টি")).toBeVisible();
    await expect(page.locator("text=The Evidence Act 1872")).toBeVisible();
  });

  test("3. Pricing (/pricing) displays FREE, PRO, and CHAMBER plans with upgrade links", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator("h1")).toContainText("সঠিক প্ল্যান বেছে নিন");
    await expect(page.locator("text=স্টার্টার (Starter)")).toBeVisible();
    await expect(page.locator("text=অ্যাডভোকেট প্রো (Advocate PRO)")).toBeVisible();
    await expect(page.locator("text=চেম্বার পার্টনার (Chamber Enterprise)")).toBeVisible();

    // Verify upgrade link to /billing
    const proBtn = page.locator("a:has-text('প্রো-তে আপগ্রেড করুন')");
    await expect(proBtn).toBeVisible();
    expect(await proBtn.getAttribute("href")).toBe("/billing");
  });

  test("4. Global Footer renders on public pages with compliance links and disclaimer", async ({ page }) => {
    await page.goto("/pricing");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer.locator("text=আইনি দাবিত্যাগ:")).toBeVisible();
    await expect(footer.locator("text=LegalAI BD কোনো ল ফার্ম নয়")).toBeVisible();
    await expect(footer.locator("a[href='/terms']")).toBeVisible();
    await expect(footer.locator("a[href='/privacy']")).toBeVisible();
    await expect(footer.locator("a[href='/pricing']")).toBeVisible();
  });
});
