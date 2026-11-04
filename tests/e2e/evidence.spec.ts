import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Evidence Vault Upload & Management (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Login before test
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);
  });

  test("1. Uploads documentary evidence file and verifies presence in Evidence Vault", async ({ page }) => {
    const caseId = "case-karim-miah-001";
    await page.goto(`/case/${caseId}/evidence`);

    // Verify Evidence Vault header
    await expect(page.locator("h3")).toContainText("প্রমাণপত্র ও এভিডেন্স ভল্ট");

    // Locate the hidden file input
    const fileInput = page.locator("input[type='file']");
    await expect(fileInput).toBeAttached();

    // Set file using Playwright's setInputFiles
    const fixturePath = path.resolve(process.cwd(), "tests/fixtures/sample_evidence.pdf");
    await fileInput.setInputFiles(fixturePath);

    // Wait for the uploaded file card to appear in the evidence list
    const uploadedCard = page.locator("h5:has-text('sample_evidence.pdf')").first();
    await expect(uploadedCard).toBeVisible({ timeout: 10000 });

    // Verify file size is displayed
    const parentContainer = uploadedCard.locator("../..");
    await expect(parentContainer).toBeVisible();
    await expect(parentContainer.locator("text=KB").or(parentContainer.locator("text=B")).first()).toBeVisible();
  });
});
