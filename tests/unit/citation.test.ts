import { describe, it, expect } from "vitest";
import { verifyCitations, APPROVED_CITATIONS } from "@/lib/law/citationVerifier";

describe("Legal Citation Verification Guard", () => {
  it("allows approved Supreme Court citations without warnings", () => {
    const text = "<p>মামলার ক্ষেত্রে 51 DLR (AD) 1 অনুযায়ী বিচার বিভাগের স্বাধীনতা নিশ্চিত করা হয়েছে এবং 55 DLR 398 অনুসরণযোগ্য।</p>";
    const result = verifyCitations(text);
    expect(result.hasWarning).toBe(false);
    expect(result.unverifiedCitations).toHaveLength(0);
    expect(result.verifiedHtml).toContain("51 DLR (AD) 1");
    expect(result.verifiedHtml).not.toContain("⚠️ সাইটেশন যাচাই করুন");
  });

  it("flags hallucinated or unverified legal citations with prominent warning", () => {
    const text = "<p>উক্ত বিষয়ে 99 DLR 999 এবং 77 BLC 123 অনুসারে প্রতিকার প্রাপ্য।</p>";
    const result = verifyCitations(text);
    expect(result.hasWarning).toBe(true);
    expect(result.unverifiedCitations).toContain("99 DLR 999");
    expect(result.unverifiedCitations).toContain("77 BLC 123");
    expect(result.verifiedHtml).toContain("⚠️ সাইটেশন যাচাই করুন: 99 DLR 999");
    expect(result.verifiedHtml).toContain("⚠️ সতর্কবার্তা: নথিতে 2টি অসত্যায়িত/অননুমোদিত আইনি নজির");
  });

  it("contains at least 10 authoritative BD Supreme Court citations", () => {
    expect(APPROVED_CITATIONS.length).toBeGreaterThanOrEqual(10);
  });
});
