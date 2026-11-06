import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto("http://localhost:3010/login");
  await page.fill('input[type="email"]', "advocate@demo.bd");
  await page.fill('input[type="password"]', "legal123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
  await page.waitForTimeout(1000);

  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/dashboard_with_smoking_demo.png" });
  console.log("Captured dashboard with smoking demo card!");

  // Click the 4th card (Smoking)
  await page.click('h4:has-text("৪। প্রকাশ্য ধূমপান ও গণউপদ্রব (শামীম)")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/smoking_modal_prefilled.png" });
  console.log("Captured smoking modal prefilled!");

  await browser.close();
}

run().catch(console.error);
