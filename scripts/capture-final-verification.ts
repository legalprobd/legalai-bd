import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function run() {
  const finalDir = path.join(process.cwd(), "final_verification");
  const artifactDir = "C:/Users/HP/.gemini/antigravity/brain/8c7223a3-66da-4b76-9c38-5e298b3fa555/final_verification";
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light"
  });
  const page = await context.newPage();

  console.log("1. Logging in as Advocate...");
  await page.goto("http://localhost:3010/login");
  await page.fill('input[type="email"]', "advocate@demo.bd");
  await page.fill('input[type="password"]', "legal123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
  await page.waitForTimeout(1000);

  // 1. Dashboard with Sidebar
  const dashPath = path.join(finalDir, "01_dashboard_with_sidebar.png");
  await page.screenshot({ path: dashPath });
  fs.copyFileSync(dashPath, path.join(artifactDir, "01_dashboard_with_sidebar.png"));
  console.log("Captured 01_dashboard_with_sidebar.png");

  // 2. New Case Modal
  await page.click('button:has-text("নতুন মামলা শুরু করুন")');
  await page.waitForTimeout(600);
  const modalPath = path.join(finalDir, "02_new_case_modal.png");
  await page.screenshot({ path: modalPath });
  fs.copyFileSync(modalPath, path.join(artifactDir, "02_new_case_modal.png"));
  console.log("Captured 02_new_case_modal.png");

  // Close modal
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // 3. Step 2 Interrogation Progress Bar
  console.log("2. Navigating to Step 2 Interrogation Workspace...");
  await page.goto("http://localhost:3010/case/case-1793854109852?step=2");
  await page.waitForTimeout(1000);
  const interPath = path.join(finalDir, "03_step2_interrogation_progressbar.png");
  await page.screenshot({ path: interPath });
  fs.copyFileSync(interPath, path.join(artifactDir, "03_step2_interrogation_progressbar.png"));
  console.log("Captured 03_step2_interrogation_progressbar.png");

  // 4. Logout and Login as Super Admin (Platform Owner)
  console.log("3. Logging in as Platform Super Admin...");
  await page.goto("http://localhost:3010/login");
  await page.fill('input[type="email"]', "owner@legalai.bd");
  await page.fill('input[type="password"]', "owner123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  await page.goto("http://localhost:3010/super-admin");
  await page.waitForTimeout(1000);
  const superAdminPath = path.join(finalDir, "04_super_admin_dashboard.png");
  await page.screenshot({ path: superAdminPath });
  fs.copyFileSync(superAdminPath, path.join(artifactDir, "04_super_admin_dashboard.png"));
  console.log("Captured 04_super_admin_dashboard.png");

  await browser.close();
  console.log("All 4 verification screenshots saved successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
