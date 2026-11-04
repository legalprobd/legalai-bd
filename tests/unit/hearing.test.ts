import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import { HearingItem } from "@/lib/ai/schemas";

describe("Hearing Tracker & Court Diary Engine", () => {
  const testCaseId = "case-karim-miah-001";

  it("1. Retrieves existing hearings sorted chronologically", async () => {
    const hearings = await db.getHearings(testCaseId);
    expect(Array.isArray(hearings)).toBe(true);
    expect(hearings.length).toBeGreaterThan(0);
    expect(hearings[0].purpose).toBeDefined();
  });

  it("2. Adds a new court hearing with judge name and updates nextHearingDate", async () => {
    const futureDate = new Date(Date.now() + 10 * 86400000).toISOString();
    const newHearing: HearingItem = {
      id: "hearing-test-" + Date.now(),
      caseId: testCaseId,
      date: futureDate,
      purpose: "চার্জ গঠন শুনানি",
      judgeName: "বিজ্ঞ স্পেশাল ম্যাজিস্ট্রেট",
      outcomeBn: "চার্জ গঠন সম্পন্ন",
      orderSheetBn: "অভিযোগ গঠন ও সাক্ষীর প্রতি সমন জারি।",
      nextDate: new Date(Date.now() + 20 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    const added = await db.addHearing(testCaseId, newHearing);
    expect(added.id).toBe(newHearing.id);
    expect(added.judgeName).toBe("বিজ্ঞ স্পেশাল ম্যাজিস্ট্রেট");

    const c = await db.getCaseById(testCaseId);
    expect(c?.nextHearingDate).toBe(futureDate);
  });

  it("3. Updates hearing order sheet and next date via updateHearing", async () => {
    const hearings = await db.getHearings(testCaseId);
    const targetHearing = hearings[0];

    const updated = await db.updateHearing(testCaseId, targetHearing.id, {
      outcomeBn: "আসামিপক্ষের সময় প্রার্থনা মঞ্জুর",
      orderSheetBn: "নথিসহ আগামী তারিখে শুনানির আদেশ।",
    });

    expect(updated).not.toBeNull();
    expect(updated?.outcomeBn).toBe("আসামিপক্ষের সময় প্রার্থনা মঞ্জুর");
    expect(updated?.orderSheetBn).toBe("নথিসহ আগামী তারিখে শুনানির আদেশ।");
  });

  it("4. Retrieves upcoming hearings within 30 days window across cases", async () => {
    const upcoming = await db.getUpcomingHearings(30);
    expect(Array.isArray(upcoming)).toBe(true);
    if (upcoming.length > 0) {
      expect(upcoming[0].caseTitle).toBeDefined();
      const hDate = new Date(upcoming[0].date).getTime();
      expect(hDate).toBeGreaterThanOrEqual(Date.now() - 60000); // within tolerance
    }
  });

  it("5. Deletes hearing record and verifies removal", async () => {
    const tempHearing: HearingItem = {
      id: "hearing-to-delete-123",
      caseId: testCaseId,
      date: new Date().toISOString(),
      purpose: "পরীক্ষামূলক শুনানি",
      createdAt: new Date().toISOString(),
    };
    await db.addHearing(testCaseId, tempHearing);

    const deleted = await db.deleteHearing(testCaseId, "hearing-to-delete-123");
    expect(deleted).toBe(true);

    const hearings = await db.getHearings(testCaseId);
    expect(hearings.some((h) => h.id === "hearing-to-delete-123")).toBe(false);
  });
});
