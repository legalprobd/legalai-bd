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
  await page.goto("http://localhost:3010/case/case-1793850504590?step=1");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/user_url_step1.png", fullPage: true });

  // Step 2
  await page.goto("http://localhost:3010/case/case-1793850504590?step=2");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/user_url_step2.png", fullPage: true });

  console.log("Successfully saved Step 1 and Step 2 screenshots for user URL!");
  await browser.close();
}

run().catch(console.error);
