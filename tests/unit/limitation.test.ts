import { describe, it, expect } from "vitest";
import { calculateDeadline, LIMITATION_RULES } from "@/lib/law/limitation";

describe("Limitation Calculator Engine (The Limitation Act 1908 & Special Acts)", () => {
  it("1. Calculates CIVIL_POSSESSION_RECOVERY (Section 9 SR Act) 180 days correctly", () => {
    const fixedNow = new Date("2026-06-01T00:00:00.000Z");
    const triggerDate = new Date("2026-05-01T00:00:00.000Z"); // 31 days elapsed
    const result = calculateDeadline("CIVIL_POSSESSION_RECOVERY", triggerDate, fixedNow);

    expect(result.caseType).toBe("CIVIL_POSSESSION_RECOVERY");
    expect(result.lawBn).toContain("সুনির্দিষ্ট প্রতিকার আইন");
    expect(result.sectionBn).toBe("ধারা ৯");
    expect(result.isExpired).toBe(false);
    expect(result.daysRemaining).toBe(149); // 180 - 31
    expect(result.status).toBe("SAFE");
  });

  it("2. Calculates NI_ACT_138_NOTICE 30 days deadline and critical alert <= 7 days", () => {
    const fixedNow = new Date("2026-06-25T00:00:00.000Z");
    const triggerDate = new Date("2026-06-01T00:00:00.000Z"); // 24 days elapsed, 6 days remaining
    const result = calculateDeadline("NI_ACT_138_NOTICE", triggerDate, fixedNow);

    expect(result.caseType).toBe("NI_ACT_138_NOTICE");
    expect(result.lawBn).toContain("এনআই অ্যাক্ট");
    expect(result.isExpired).toBe(false);
    expect(result.daysRemaining).toBe(6);
    expect(result.status).toBe("CRITICAL");
    expect(result.statusBn).toContain("অত্যন্ত জরুরি");
  });

  it("3. Identifies EXPIRED / Time-Barred case when deadline is passed", () => {
    const fixedNow = new Date("2026-08-01T00:00:00.000Z");
    const triggerDate = new Date("2026-06-01T00:00:00.000Z"); // 61 days elapsed for 30 days limit
    const result = calculateDeadline("NI_ACT_138_FILING", triggerDate, fixedNow);

    expect(result.isExpired).toBe(true);
    expect(result.daysRemaining).toBeLessThan(0);
    expect(result.status).toBe("EXPIRED");
    expect(result.statusBn).toContain("তামাদি উত্তীর্ণ");
  });

  it("4. Handles CRIMINAL_FIR with no fixed deadline (periodDays = 0)", () => {
    const fixedNow = new Date("2026-11-01T00:00:00.000Z");
    const triggerDate = new Date("2026-01-01T00:00:00.000Z");
    const result = calculateDeadline("CRIMINAL_FIR", triggerDate, fixedNow);

    expect(result.caseType).toBe("CRIMINAL_FIR");
    expect(result.deadline).toBeNull();
    expect(result.daysRemaining).toBeNull();
    expect(result.isExpired).toBe(false);
    expect(result.status).toBe("NO_DEADLINE");
    expect(result.statusBn).toContain("কোনো নির্দিষ্ট তামাদি নেই");
  });

  it("5. Calculates CIVIL_DECLARATION_TITLE (3 years / 1095 days)", () => {
    const fixedNow = new Date("2026-06-01T00:00:00.000Z");
    const triggerDate = new Date("2024-06-01T00:00:00.000Z"); // 730 days elapsed
    const result = calculateDeadline("CIVIL_DECLARATION_TITLE", triggerDate, fixedNow);

    expect(result.caseType).toBe("CIVIL_DECLARATION_TITLE");
    expect(result.isExpired).toBe(false);
    expect(result.daysRemaining).toBe(365);
    expect(result.status).toBe("SAFE");
  });

  it("6. Calculates CIVIL_APPEAL (90 days) approaching warning <= 30 days", () => {
    const fixedNow = new Date("2026-06-01T00:00:00.000Z");
    const triggerDate = new Date("2026-03-23T00:00:00.000Z"); // 70 days elapsed, 20 days remaining
    const result = calculateDeadline("CIVIL_APPEAL", triggerDate, fixedNow);

    expect(result.caseType).toBe("CIVIL_APPEAL");
    expect(result.isExpired).toBe(false);
    expect(result.daysRemaining).toBe(20);
    expect(result.status).toBe("APPROACHING");
    expect(result.statusBn).toContain("সতর্কতা");
  });

  it("7. Fallbacks gracefully for unknown case types", () => {
    const result = calculateDeadline("UNKNOWN_SPECIAL_PETITION", new Date());
    expect(result.status).toBe("NO_DEADLINE");
    expect(result.deadline).toBeNull();
  });
});
