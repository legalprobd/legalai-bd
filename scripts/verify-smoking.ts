import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto("http://localhost:3010/login");
  await page.fill('input[type="email"]', "advocate@demo.bd");
  await page.fill('input[type="password"]', "legal123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");

  // Step 1
  await page.goto("http://localhost:3010/case/case-1793854109852?step=1");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/step1-live.png", fullPage: true });

  // Step 2
  await page.goto("http://localhost:3010/case/case-1793854109852?step=2");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/step2-live.png", fullPage: true });

  console.log("Successfully saved step 1 and step 2 screenshots!");
  await browser.close();
}

run().catch(console.error);
