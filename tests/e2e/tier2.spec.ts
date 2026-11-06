import { test, expect } from "@playwright/test";

test.describe("Tier 2 Advanced AI - Precedent Engine & Contract Reviewer", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate with demo credentials
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);
  });

  test("1. Precedent Search Engine - User can search and view landmark Supreme Court rulings", async ({ page }) => {
    await page.goto("/precedent");
    await expect(page.locator("h1")).toContainText("সুপ্রিম কোর্ট নজির ও সাইটেশন সার্চ ইঞ্জিন");

    // Search for "জামিন" (Bail)
    const searchInput = page.locator("input[placeholder*='কীওয়ার্ড']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("জামিন");
    await page.locator("button:has-text('অনুসন্ধান করুন')").click();

    // Verify search results display 51 DLR (AD) 1
    const citationBadge = page.locator("text=51 DLR (AD) 1").first();
    await expect(citationBadge).toBeVisible();
    await expect(page.locator("text=ব্লাস্ট বনাম বাংলাদেশ").first()).toBeVisible();

    // Verify Copy Citation button
    const copyBtn = page.locator("button[title='সাইটেশন কপি করুন']").first();
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.locator("text=সাইটেশন ক্লিপবোর্ডে কপি সম্পন্ন হয়েছে!").first()).toBeVisible();
  });

  test("2. Contract Reviewer - User can paste deed, analyze with AI, and view risk audit", async ({ page }) => {
    await page.goto("/contract-review");
    await expect(page.locator("h1")).toContainText("চুক্তিপত্র ও দলিল এআই নিরীক্ষা");

    // Paste deed text into textarea
    const sampleDeed = `বায়নানামা চুক্তিপত্র
১ম পক্ষ (বিক্রেতা): জনাব রফিকুল ইসলাম।
২য় পক্ষ (ক্রেতা): জনাব কামাল হোসেন।
মিরপুর মৌজার ৫ কাঠা জমি মোট ১,৫০,০০,০০০/- টাকায় বিক্রয় করার প্রস্তাব করিলে ২য় পক্ষ অদ্য অগ্রিম ২০,০০,০০০/- টাকা প্রদান করিলেন।
শর্তাবলী:
১। আগামী ৬ মাসের মধ্যে বাকি টাকা পরিশোধ না করিলে ২০ লক্ষ টাকা সম্পূর্ণ বাজেয়াপ্ত ও জরিমানা বলিয়া গণ্য হইবে।
২। ১ম পক্ষ উক্ত জমিতে কোনো মামলা নাই বলিয়া নিশ্চয়তা দিতেছেন।`;

    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    await textarea.fill(sampleDeed);

    // Click "চুক্তিপত্র এআই অডিট করুন"
    const analyzeBtn = page.locator("button:has-text('চুক্তিপত্র এআই অডিট করুন')");
    await expect(analyzeBtn).toBeVisible();
    await analyzeBtn.click();

    // Wait for audit result: Risk score badge and missing clauses
    await expect(page.locator("text=উচ্চ ঝুঁকি (HIGH RISK)").or(page.locator("text=মাঝারি ঝুঁকি (MEDIUM RISK)")).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=অত্যাবশ্যকীয় অনুপস্থিত ধারা").first()).toBeVisible();
    await expect(page.locator("text=আইনজীবীর জন্য কৌশলগত সুপারিশ").first()).toBeVisible();
  });
});
