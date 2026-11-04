import { describe, it, expect } from "vitest";
import { convertUnicodeToBijoy } from "@/lib/utils/bijoyConverter";

describe("BijoyConverter Utility", () => {
  it("converts basic Bengali digits to Bijoy ASCII keys", () => {
    expect(convertUnicodeToBijoy("০১২৩৪৫৬৭৮৯")).toBe("0123456789");
  });

  it("handles basic consonants and words", () => {
    const result = convertUnicodeToBijoy("বাংলাদেশ");
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles empty or null string gracefully", () => {
    expect(convertUnicodeToBijoy("")).toBe("");
  });

  it("strips html tags before conversion", () => {
    const res = convertUnicodeToBijoy("<p>আমার নাম <strong>করিম</strong></p>");
    expect(res).not.toContain("<p>");
    expect(res).not.toContain("<strong>");
  });
});
