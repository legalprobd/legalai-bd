import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto("http://localhost:3010/login");
  await page.fill('input[type="email"]', "advocate@demo.bd");
  await page.fill('input[type="password"]', "legal123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");

  // Open modal
  await page.click('button:has-text("নতুন মামলা শুরু করুন")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/modal_light_live.png" });

  console.log("Modal screenshot saved successfully!");
  await browser.close();
}

run().catch(console.error);
