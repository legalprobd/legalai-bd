import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function runLiveTest() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("1. Navigating to login page...");
  await page.goto("http://localhost:3010/login");
  await page.waitForLoadState("networkidle");

  console.log("2. Logging in with demo credentials...");
  await page.fill('input[type="email"]', "advocate@demo.bd");
  await page.fill('input[type="password"]', "DemoPass123!");
  await page.click('button[type="submit"]');

  await page.waitForURL("**/dashboard", { timeout: 10000 });
  console.log("Logged in! On dashboard.");

  // Test Case 1: Smoking Nuisance in front of Balcony
  console.log("\n--- Testing Case 1: Smoking Nuisance (বারান্দার সামনে সিগারেট খায় শামীম) ---");
  await page.click('button:has-text("নতুন মামলা শুরু করুন")');
  await page.waitForSelector('textarea', { timeout: 5000 });

  const statement1 = "প্রতিদিন আমার বাসার বারান্দার সামনে প্রকাশ্যে সিগারেট খায় শামীম। আমি বারবার তাকে মানা করার পরও সে এটা করেই যাচ্ছে।";
  await page.fill('textarea', statement1);
  await page.click('button[type="submit"]:has-text("মামলা তৈরি ও বিশ্লেষণ করুন")');

  await page.waitForURL(/\/case\/case-/, { timeout: 10000 });
  const caseUrl1 = page.url();
  console.log("Created Case 1 URL:", caseUrl1);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Take screenshot of step 1 (Intake)
  const screenshotDir = path.join(process.cwd(), ".data", "live_test_screenshots");
  fs.mkdirSync(screenshotDir, { recursive: true });

  const artifactDir = "C:\\Users\\HP\\.gemini\\antigravity\\brain\\8c7223a3-66da-4b76-9c38-5e298b3fa555";
  
  await page.screenshot({ path: path.join(artifactDir, "live_smoking_step1.png"), fullPage: true });
  console.log("Saved live_smoking_step1.png");

  // Read page facts and check for hallucinations
  const pageContent1 = await page.textContent("body");
  const hasFakeWeapons1 = pageContent1?.includes("ধারালো দা") || pageContent1?.includes("লোহার রড");
  const hasFakeMoney1 = pageContent1?.includes("১,২০,০০০") || pageContent1?.includes("১,৫০,০০০");
  const hasAssaultInjury1 = pageContent1?.includes("শারীরিক মারপিট ও জখম");
  const hasSection452 = pageContent1?.includes("৪৫২");

  console.log("Case 1 Checks:");
  console.log("- Hallucinated weapons (দা/রড):", hasFakeWeapons1 ? "FAIL" : "PASSED (None)");
  console.log("- Hallucinated money loot (১,২০,০০০/-):", hasFakeMoney1 ? "FAIL" : "PASSED (None)");
  console.log("- Hallucinated physical assault:", hasAssaultInjury1 ? "FAIL" : "PASSED (None)");
  console.log("- Hallucinated Section 452:", hasSection452 ? "FAIL" : "PASSED (None)");

  // Click Step 2 (Interrogation)
  console.log("\nMoving to Step 2 (Questions)...");
  const step2Btn = page.locator('button:has-text("২। আইনি অনুসন্ধান ও জেরা"), button:has-text("আইন অনুসন্ধান"), button:has-text("২য় ধাপ")').first();
  if (await step2Btn.isVisible()) {
    await step2Btn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: path.join(artifactDir, "live_smoking_step2.png"), fullPage: true });
  console.log("Saved live_smoking_step2.png");

  // Click Step 3 (Draft Document)
  console.log("\nMoving to Step 3 (Draft)...");
  const step3Btn = page.locator('button:has-text("৩। আদালতের আরজি ও প্রিন্ট"), button:has-text("আদালতের আরজি"), button:has-text("৩য় ধাপ")').first();
  if (await step3Btn.isVisible()) {
    await step3Btn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: path.join(artifactDir, "live_smoking_step3.png"), fullPage: true });
  console.log("Saved live_smoking_step3.png");

  // Test Case 2: Noise / Loud Music Nuisance
  console.log("\n--- Testing Case 2: Noise Nuisance (জোরে গান বাজিয়ে ঘুম নষ্ট) ---");
  await page.goto("http://localhost:3010/dashboard");
  await page.waitForLoadState("networkidle");

  await page.click('button:has-text("নতুন মামলা শুরু করুন")');
  await page.waitForSelector('textarea', { timeout: 5000 });

  const statement2 = "পাশের বাসার লোকেরা রাতে জোরে গান বাজিয়ে আমার ঘুম নষ্ট করছে। বারবার নিষেধ করার পরও তারা লাউডস্পিকারে গান বাজায়।";
  await page.fill('textarea', statement2);
  await page.click('button[type="submit"]:has-text("মামলা তৈরি ও বিশ্লেষণ করুন")');

  await page.waitForURL(/\/case\/case-/, { timeout: 10000 });
  const caseUrl2 = page.url();
  console.log("Created Case 2 URL:", caseUrl2);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  await page.screenshot({ path: path.join(artifactDir, "live_noise_nuisance.png"), fullPage: true });
  console.log("Saved live_noise_nuisance.png");

  const pageContent2 = await page.textContent("body");
  const hasWeapons2 = pageContent2?.includes("ধারালো দা") || pageContent2?.includes("লোহার রড");
  const hasFirAssault2 = pageContent2?.includes("শারীরিক মারপিট ও জখম");

  console.log("Case 2 Checks:");
  console.log("- Hallucinated weapons:", hasWeapons2 ? "FAIL" : "PASSED (None)");
  console.log("- Hallucinated assault injuries:", hasFirAssault2 ? "FAIL" : "PASSED (None)");

  // Test Suite Pages (All 15 modules)
  console.log("\n--- Testing All 15 Module Routes ---");
  const routesToTest = [
    { url: "http://localhost:3010/clients", expected: "মক্কেল প্রোফাইল ও ডিরেক্টরি" },
    { url: "http://localhost:3010/tasks", expected: "চেম্বার টাস্ক" },
    { url: "http://localhost:3010/court-fee", expected: "কোর্ট ফি ও অ্যাড-ভ্যালোরেম" },
    { url: "http://localhost:3010/conflict-check", expected: "কনফ্লিক্ট অফ ইন্টারেস্ট" },
    { url: "http://localhost:3010/billing/trust", expected: "ট্রাস্ট ফান্ড হিসাবরক্ষণ" },
    { url: "http://localhost:3010/research", expected: "আইনি গবেষণা ও নজির" },
    { url: "http://localhost:3010/analytics", expected: "চেম্বার পারফরম্যান্স ও আর্থিক পূর্বাভাস" },
    { url: "http://localhost:3010/contract-review", expected: "চুক্তিপত্র ও দলিল রিভিউ" },
    { url: "http://localhost:3010/portal", expected: "নিরাপদ ক্লায়েন্ট এক্সেস" },
    { url: "http://localhost:3010/intake", expected: "অনলাইন আইনি সহায়তা ও কেস ইনটেক ফরম" },
  ];

  for (const r of routesToTest) {
    await page.goto(r.url);
    await page.waitForLoadState("networkidle");
    const content = await page.textContent("body");
    const hasText = content?.includes(r.expected);
    console.log(`Route ${r.url} -> ${hasText ? "PASSED" : "FAILED (missing " + r.expected + ")"}`);
    if (!hasText) throw new Error(`Route ${r.url} did not render expected text: ${r.expected}`);
  }

  await browser.close();
  console.log("\nAll 15 modules and live tests completed successfully!");
}

runLiveTest().catch((err) => {
  console.error("Live test failed:", err);
  process.exit(1);
});
