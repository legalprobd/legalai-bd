import { test, expect } from "@playwright/test";

test.describe("Server-Side PDF Export (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Login before test
    await page.goto("/login");
    await page.locator("input[type='email']").fill("advocate@demo.bd");
    await page.locator("input[type='password']").fill("legal123");
    await page.locator("button[type='submit']").click();
    await expect(page).toHaveURL(/\/dashboard|\/$/);
  });

  test("1. Triggers server-side PDF generation and verifies 200 OK with application/pdf", async ({ page }) => {
    await page.goto("/case/case-karim-miah-001");

    // Wait for document editor canvas to be populated
    const editor = page.locator(".legal-doc");
    await expect(editor).toBeVisible();

    // Setup network response listener for /api/export/pdf
    const pdfResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/export/pdf") &&
        response.request().method() === "POST"
    );

    // Setup browser download listener
    const downloadPromise = page.waitForEvent("download");

    // Click the "প্রিন্ট / PDF" button
    const pdfBtn = page.locator("button:has-text('প্রিন্ট / PDF')");
    await expect(pdfBtn).toBeVisible();
    await pdfBtn.click();

    // Await intercepted network response and download event
    const [pdfResponse, download] = await Promise.all([
      pdfResponsePromise,
      downloadPromise,
    ]);

    // Assertions on HTTP status & headers
    expect(pdfResponse.status()).toBe(200);
    const contentType = pdfResponse.headers()["content-type"];
    expect(contentType).toContain("application/pdf");

    // Assertions on downloaded file
    expect(download.suggestedFilename()).toContain(".pdf");
  });
});
