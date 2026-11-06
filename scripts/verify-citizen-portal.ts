import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function run() {
  const auditDir = path.join(process.cwd(), "final_verification");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light"
  });
  const page = await context.newPage();

  console.log("1. Visiting /login (unauthenticated)...");
  await page.goto("http://localhost:3010/login");
  await page.waitForLoadState("networkidle");

  const loginShot = path.join(auditDir, "citizen_01_login_with_banner.png");
  await page.screenshot({ path: loginShot });
  console.log("Saved citizen_01_login_with_banner.png");

  // Click the citizen portal link
  console.log("2. Navigating to /citizen (Citizen Legal Aid Portal)...");
  await page.click('a:has-text("ফ্রি সেবা নিন")');
  await page.waitForURL("**/citizen");
  await page.waitForLoadState("networkidle");

  const citizenShot = path.join(auditDir, "citizen_02_portal_landing.png");
  await page.screenshot({ path: citizenShot });
  console.log("Saved citizen_02_portal_landing.png");

  // Click preset "বারান্দার সামনে প্রকাশ্যে ধূমপান"
  console.log("3. Testing Smoking Nuisance Preset...");
  await page.click('button:has-text("বারান্দার সামনে প্রকাশ্যে ধূমপান")');
  await page.waitForTimeout(400);

  // Click Analyze
  await page.click('button[type="submit"]:has-text("বিনামূল্যে তাৎক্ষণিক বিশ্লেষণ ও জিডি তৈরি করুন")');
  await page.waitForTimeout(2500);

  const resultTitle = await page.locator("#results-section h3").first().innerText();
  console.log("Analyzed Result Title:", resultTitle);

  const resultsShot = path.join(auditDir, "citizen_03_free_analysis_and_gd.png");
  await page.screenshot({ path: resultsShot, fullPage: true });
  console.log("Saved citizen_03_free_analysis_and_gd.png");

  // Copy to Antigravity brain artifact dir
  const artifactDir = "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/final_verification";
  fs.copyFileSync(loginShot, path.join(artifactDir, "citizen_01_login_with_banner.png"));
  fs.copyFileSync(citizenShot, path.join(artifactDir, "citizen_02_portal_landing.png"));
  fs.copyFileSync(resultsShot, path.join(artifactDir, "citizen_03_free_analysis_and_gd.png"));

  await browser.close();
  console.log("All citizen portal live checks completed successfully!");
}

run().catch(console.error);
