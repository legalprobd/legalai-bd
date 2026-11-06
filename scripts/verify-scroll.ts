import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto("http://localhost:3010/login");
  await page.fill('input[type="email"]', "advocate@demo.bd");
  await page.fill('input[type="password"]', "legal123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");

  await page.goto("http://localhost:3010/case/case-1793850504590?step=1");
  await page.waitForTimeout(1000);
  
  // Scrolled screenshot of facts sheet
  const factsLocator = page.locator("text=শনাক্তকৃত ফ্যাক্টস শীট").first();
  await factsLocator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/step1_factsheet_scroll.png" });

  const sectionText = await page.locator("section").first().innerText();
  console.log("Section Text snippet:\n", sectionText);

  await browser.close();
}

run().catch(console.error);
