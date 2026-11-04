import { describe, it, expect } from "vitest";
import { generateMockCaseAnalysis } from "@/lib/ai/mock";

describe("Stage 4 End-to-End Legal Scenarios Verification", () => {
  it("Scenario 1: Criminal FIR with knife/robbery (ছুরি দিয়ে পেটে আঘাত ও ছিনতাই)", () => {
    const statement = "গতকাল রাতে রহিম ও করিম ধারালো ছুরি দিয়ে আমার পেটে আঘাত করে ৫০ হাজার টাকা ছিনিয়ে নিয়ে যায়";
    const analysis = generateMockCaseAnalysis(statement);

    expect(analysis.caseCategory).toBe("Criminal");
    expect(analysis.extractedFacts.weaponsUsed.some((w) => w.includes("ছুরি"))).toBe(true);
    expect(analysis.extractedFacts.totalFinancialLoss).toBe("৫০,০০০/- টাকা");
    expect(analysis.extractedFacts.accusedList.some((a) => a.includes("রহিম"))).toBe(true);
    expect(analysis.extractedFacts.accusedList.some((a) => a.includes("করিম"))).toBe(true);

    const sections = analysis.applicableLaws.map((l) => l.section);
    // Should have 326 (deadly weapon grievous hurt), 307 (attempt to murder / stomach stab), 392 (robbery), 34
    expect(sections.some((s) => s.includes("৩২৬") || s.includes("326"))).toBe(true);
    expect(sections.some((s) => s.includes("৩০৭") || s.includes("307"))).toBe(true);
    expect(sections.some((s) => s.includes("৩৯২") || s.includes("392"))).toBe(true);
    expect(sections.some((s) => s.includes("৩৪") || s.includes("34"))).toBe(true);
  });

  it("Scenario 2: NI Act 138 (চেক ডিজঅনার)", () => {
    const statement = "জহিরুল ১০ লক্ষ টাকার চেক দিয়েছে, অপর্যাপ্ত তহবিলে ডিজঅনার হয়েছে, লিগ্যাল নোটিশ পাঠিয়েছি";
    const analysis = generateMockCaseAnalysis(statement);

    expect(analysis.extractedFacts.accusedList.some((a) => a.includes("জহিরুল"))).toBe(true);
    expect(analysis.extractedFacts.totalFinancialLoss).toBe("১০,০০,০০০/- টাকা");

    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("১৩৮") || s.includes("138"))).toBe(true);
  });

  it("Scenario 3: Civil title Plaint (জমির স্বত্ব ও নিষেধাজ্ঞা)", () => {
    const statement = "কুদ্দুস তালুকদার আমার পৈতৃক জমি দখল করে অবৈধ স্থাপনা বানাচ্ছে";
    const analysis = generateMockCaseAnalysis(statement);

    expect(analysis.caseCategory).toBe("Civil");
    expect(analysis.extractedFacts.accusedList.some((a) => a.includes("কুদ্দুস"))).toBe(true);

    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("৪২") || s.includes("42"))).toBe(true); // SR 42
    expect(sections.some((s) => s.includes("৫৪") || s.includes("54"))).toBe(true); // SR 54
    expect(sections.some((s) => s.includes("৩৯") || s.includes("39"))).toBe(true); // CPC 39
  });

  it("Scenario 4: Nari o Shishu 11/30 (যৌতুক নির্যাতন ও মারপিট)", () => {
    const statement = "স্বামী যৌতুকের জন্য মারধর করে, ৫০ হাজার টাকা দাবি করে";
    const analysis = generateMockCaseAnalysis(statement);

    expect(analysis.caseCategory).toBe("Special_Tribunal");
    expect(analysis.caseTitleBn).toContain("যৌতুক নির্যাতন");
    expect(analysis.extractedFacts.totalFinancialLoss).toBe("৫০,০০০/- টাকা");

    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("১১(গ)") || s.includes("11(c)"))).toBe(true);
    expect(sections.some((s) => s.includes("৩০") || s.includes("30"))).toBe(true);
  });

  it("Scenario 5: Arms Act 19a/148/452 (পিস্তল উঁচিয়ে বাড়ি দখল)", () => {
    const statement = "মোতালেব পিস্তল উঁচিয়ে আমার বাড়ি দখল করেছে";
    const analysis = generateMockCaseAnalysis(statement);

    expect(analysis.caseCategory).toBe("Criminal");
    expect(analysis.extractedFacts.accusedList.some((a) => a.includes("মোতালেব"))).toBe(true);
    expect(analysis.extractedFacts.weaponsUsed.some((w) => w.includes("পিস্তল"))).toBe(true);

    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("১৯(ক)") || s.includes("19(a)"))).toBe(true);
    expect(sections.some((s) => s.includes("১৪৮") || s.includes("148"))).toBe(true);
    expect(sections.some((s) => s.includes("৪৫২") || s.includes("452"))).toBe(true);
  });
});
