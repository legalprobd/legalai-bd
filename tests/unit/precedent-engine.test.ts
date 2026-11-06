import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";
import { FAMOUS_BANGLADESH_PRECEDENTS } from "@/lib/precedents/seedPrecedents";

describe("Tier 2 Advanced AI - Supreme Court Precedent Engine", () => {
  it("1. Contains at least 15 verified Supreme Court precedent cases", async () => {
    const list = await db.getCasePrecedents();
    expect(list.length).toBeGreaterThanOrEqual(15);
    expect(FAMOUS_BANGLADESH_PRECEDENTS.length).toBeGreaterThanOrEqual(16);
  });

  it("2. Searches precedents by keyword 'জামিন' (Bail) and finds landmark arrest/bail rulings", async () => {
    const results = await db.searchCasePrecedents("জামিন");
    expect(results.length).toBeGreaterThan(0);
    const blast = results.find((p) => p.citation === "51 DLR (AD) 1");
    expect(blast).toBeDefined();
    expect(blast?.titleBn).toContain("ব্লাস্ট");
    expect(blast?.summaryBn).toContain("৫৪ ও ১৬৭ ধারা");
  });

  it("3. Searches precedents by section '৩০৭' (Attempt to murder) and matches 21 BLC (AD) 89", async () => {
    const results = await db.searchCasePrecedents("৩০৭");
    expect(results.length).toBeGreaterThan(0);
    const joynal = results.find((p) => p.citation === "21 BLC (AD) 89");
    expect(joynal).toBeDefined();
    expect(joynal?.titleBn).toContain("জয়নাল আবেদীন");
  });

  it("4. Searches land law precedents by keyword 'জমি' or 'বায়নানামা'", async () => {
    const results = await db.searchCasePrecedents("জমি");
    expect(results.length).toBeGreaterThanOrEqual(3);
    const citations = results.map((r) => r.citation);
    expect(citations.some((c) => c.includes("62 DLR") || c.includes("65 DLR") || c.includes("60 DLR"))).toBe(true);
  });

  it("5. Searches Cheque Dishonour / NI Act 138 precedents", async () => {
    const results = await db.searchCasePrecedents("চেক");
    expect(results.length).toBeGreaterThan(0);
    const ni = results.find((p) => p.citation.includes("18 BLC"));
    expect(ni).toBeDefined();
    expect(ni?.summaryBn).toContain("১৩৮ ধারায়");
  });

  it("6. Searches by exact citation '51 DLR (AD) 1'", async () => {
    const results = await db.searchCasePrecedents("51 DLR (AD) 1");
    expect(results.length).toBe(1);
    expect(results[0].citation).toBe("51 DLR (AD) 1");
  });

  it("7. Filters precedents by category", async () => {
    const all = await db.getCasePrecedents();
    const bailCases = all.filter((p) => p.category === "BAIL");
    const landCases = all.filter((p) => p.category === "LAND");
    const familyCases = all.filter((p) => p.category === "FAMILY");

    expect(bailCases.length).toBeGreaterThanOrEqual(2);
    expect(landCases.length).toBeGreaterThanOrEqual(3);
    expect(familyCases.length).toBeGreaterThanOrEqual(2);
  });
});
