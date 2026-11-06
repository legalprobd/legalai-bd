import { describe, it, expect } from "vitest";
import { calculateDeterministicBail } from "@/app/api/bail-predictor/route";
import { detectMockTrialResponse } from "@/app/api/mock-trial/route";

describe("Tier 3 - AI Bail Predictor & Mock Trial Engine", () => {
  describe("1. Bail Outcome Predictor Unit Tests", () => {
    it("clamps probability strictly between 0 and 100", () => {
      // Extremely low chance case
      const lowResult = calculateDeterministicBail({
        offenceSections: "302, 396",
        daysInCustody: 3,
        isChargeSheetSubmitted: true,
        hasPreviousCriminalRecord: true,
        medicalCondition: "NONE",
        gender: "MALE",
        age: 30,
      });
      expect(lowResult.probability).toBeGreaterThanOrEqual(0);
      expect(lowResult.probability).toBeLessThanOrEqual(100);
      expect(lowResult.probabilityBand).toBe("LOW");

      // Extremely high chance case
      const highResult = calculateDeterministicBail({
        offenceSections: "420, 506, NI Act 138",
        daysInCustody: 200,
        isChargeSheetSubmitted: false,
        hasPreviousCriminalRecord: false,
        medicalCondition: "CRITICAL",
        gender: "FEMALE",
        age: 68,
      });
      expect(highResult.probability).toBeGreaterThanOrEqual(0);
      expect(highResult.probability).toBeLessThanOrEqual(100);
      expect(highResult.probabilityBand).toBe("HIGH");
    });

    it("evaluates Section 497 CrPC Proviso for women and sick/infirm accused", () => {
      const maleHealthy = calculateDeterministicBail({
        offenceSections: "307, 326",
        daysInCustody: 45,
        isChargeSheetSubmitted: false,
        hasPreviousCriminalRecord: false,
        medicalCondition: "NONE",
        gender: "MALE",
        age: 35,
      });

      const femaleSick = calculateDeterministicBail({
        offenceSections: "307, 326",
        daysInCustody: 45,
        isChargeSheetSubmitted: false,
        hasPreviousCriminalRecord: false,
        medicalCondition: "CRITICAL",
        gender: "FEMALE",
        age: 35,
      });

      expect(femaleSick.probability).toBeGreaterThan(maleHealthy.probability);
      expect(femaleSick.groundsBn.some((g) => g.includes("৪৯৭(১)") || g.includes("শর্তাংশ"))).toBe(true);
      expect(femaleSick.groundsBn.some((g) => g.includes("নারী") || g.includes("Women"))).toBe(true);
    });

    it("cites landmark Supreme Court precedents 51 DLR (AD) 1 and 52 DLR (AD) 82", () => {
      const result = calculateDeterministicBail({
        offenceSections: "326, 307",
        daysInCustody: 190,
        isChargeSheetSubmitted: false,
        hasPreviousCriminalRecord: false,
        medicalCondition: "NONE",
      });

      const citations = result.relevantPrecedents.map((p) => p.citation);
      expect(citations).toContain("51 DLR (AD) 1");
      expect(citations).toContain("52 DLR (AD) 82");
      expect(result.groundsBn.some((g) => g.includes("৫২ ডিএলআর (এডি) ৮২") || g.includes("দীর্ঘ"))).toBe(true);
    });

    it("recommends appropriate advocate strategy based on probability band", () => {
      const bailableResult = calculateDeterministicBail({
        offenceSections: "138 NI Act, 323",
        daysInCustody: 30,
        isChargeSheetSubmitted: false,
        hasPreviousCriminalRecord: false,
        medicalCondition: "NONE",
      });
      expect(bailableResult.advocateStrategyBn).toContain("নিয়মিত জামিন");
      expect(bailableResult.probability).toBeGreaterThanOrEqual(70);
    });
  });

  describe("2. Mock Trial & Objection Engine Unit Tests", () => {
    it("detects leading questions and raises Evidence Act 141-142 objection", () => {
      const res = detectMockTrialResponse({
        caseFact: "রাতের বেলায় চুরির ঘটনা ঘটেছিল। নাইট গার্ড উপস্থিত ছিলেন।",
        witnessPersona: "নাইট গার্ড রহিম মিয়া",
        newQuestion: "আপনি তো চোরকে পালাতে দেখেছিলেন, তাই না?",
      });

      expect(res.objection).not.toBeNull();
      expect(res.objection).toContain("Objection My Lord! Leading question");
      expect(res.objection).toContain("১৪১-১৪২ ধারা");
    });

    it("allows non-leading investigative questions without objection", () => {
      const res = detectMockTrialResponse({
        caseFact: "রাতের বেলায় চুরির ঘটনা ঘটেছিল। নাইট গার্ড উপস্থিত ছিলেন।",
        witnessPersona: "নাইট গার্ড রহিম মিয়া",
        newQuestion: "ঘটনার সময় আপনি নির্দিষ্ট কোন স্থানে অবস্থান করছিলেন?",
      });

      expect(res.objection).toBeNull();
      expect(res.witnessReplyBn.length).toBeGreaterThan(10);
      expect(res.coachingTipBn).toBeDefined();
    });

    it("detects factual contradiction when question contradicts core facts", () => {
      const res = detectMockTrialResponse({
        caseFact: "গত রাতে চুরির ঘটনা ঘটেছে।",
        witnessPersona: "নাইট গার্ড",
        newQuestion: "দুপুরের কড়া রোদে আপনি লোকটিকে কী করতে দেখেছেন?",
      });

      expect(res.contradictionDetected).toBe(true);
      expect(res.contradictionNoteBn).toContain("অসঙ্গতি");
    });
  });
});
