import { describe, it, expect } from "vitest";
import { generateMockCaseAnalysis } from "@/lib/ai/mock";

describe("Task 4: Zero-Shot Generalization & Safe Non-Violent Grievance Architecture", () => {
  it("Case 1: Loud music / Noise Nuisance (পাশের বাসার লোকেরা রাতে জোরে গান বাজিয়ে আমার ঘুম নষ্ট করছে।)", () => {
    const statement = "পাশের বাসার লোকেরা রাতে জোরে গান বাজিয়ে আমার ঘুম নষ্ট করছে।";
    const analysis = generateMockCaseAnalysis(statement);

    // 1. Weapons MUST be strictly empty
    expect(analysis.extractedFacts.weaponsUsed).toEqual([]);

    // 2. No fake physical injuries or robbery
    expect(analysis.extractedFacts.injuriesAndMedical).not.toContain("মারপিট");
    expect(analysis.extractedFacts.injuriesAndMedical).not.toContain("রক্তাক্ত");

    // 3. Category must be Criminal (Nuisance under PC 290)
    expect(analysis.caseCategory).toBe("Criminal");
    expect(analysis.caseTitleBn).toContain("গণউপদ্রব");

    // 4. Must NOT contain violent assault sections (323, 324, 326, 307, 448, 452)
    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("৩২৩") || s.includes("323"))).toBe(false);
    expect(sections.some((s) => s.includes("৩২৪") || s.includes("324"))).toBe(false);
    expect(sections.some((s) => s.includes("৩২৬") || s.includes("326"))).toBe(false);
    expect(sections.some((s) => s.includes("৩০৭") || s.includes("307"))).toBe(false);
    expect(sections.some((s) => s.includes("৪৫২") || s.includes("452"))).toBe(false);

    // 5. Questions must be relevant to noise and nuisance, not deadly weapons
    const questionsText = analysis.followUpQuestions.map((q) => q.questionBn).join(" ");
    expect(questionsText).not.toContain("লোহার রড");
    expect(questionsText).not.toContain("দা / চাপাতি");
  });

  it("Case 2: Tree Cut / Property Grievance (আমার গাছ কেটে ফেলা হয়েছে।)", () => {
    const statement = "আমার গাছ কেটে ফেলা হয়েছে।";
    const analysis = generateMockCaseAnalysis(statement);

    // 1. Weapons MUST be strictly empty (no weapons hallucinated)
    expect(analysis.extractedFacts.weaponsUsed).toEqual([]);

    // 2. Category must be Civil / Property
    expect(analysis.caseCategory).toBe("Civil");
    expect(analysis.caseTitleBn).toContain("গাছ কেটে");

    // 3. Must NOT contain violent assault sections (323, 324, 326, 307, 452)
    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("৩২৩") || s.includes("323"))).toBe(false);
    expect(sections.some((s) => s.includes("৩২৬") || s.includes("326"))).toBe(false);
    expect(sections.some((s) => s.includes("৩০৭") || s.includes("307"))).toBe(false);
    expect(sections.some((s) => s.includes("৪৫২") || s.includes("452"))).toBe(false);
  });

  it("Case 3: Unpaid Wages / Labour (আমার বেতন বকেয়া আছে।)", () => {
    const statement = "আমার বেতন বকেয়া আছে।";
    const analysis = generateMockCaseAnalysis(statement);

    // 1. Weapons MUST be strictly empty
    expect(analysis.extractedFacts.weaponsUsed).toEqual([]);

    // 2. No fake physical injuries
    expect(analysis.extractedFacts.injuriesAndMedical).toBeNull();

    // 3. Category must be Civil / Labour
    expect(analysis.caseCategory).toBe("Civil");
    expect(analysis.caseTitleBn).toContain("বকেয়া বেতন");

    // 4. Must NOT contain any assault sections
    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("৩২৩") || s.includes("323"))).toBe(false);
    expect(sections.some((s) => s.includes("৩২৬") || s.includes("326"))).toBe(false);
    expect(sections.some((s) => s.includes("৩০৭") || s.includes("307"))).toBe(false);
    expect(sections.some((s) => s.includes("৪৫২") || s.includes("452"))).toBe(false);

    // 5. Must contain Labour Act section
    expect(sections.some((s) => s.includes("৩৩") || s.includes("labour"))).toBe(true);
  });

  it("Case 4: Completely Unknown / Generic Statement", () => {
    const statement = "আমি একটি বিষয়ে সাধারণ আইনি পরামর্শ জানতে চাই।";
    const analysis = generateMockCaseAnalysis(statement);

    // Safe zero-shot fallback: zero weapons, zero laws, zero assault
    expect(analysis.extractedFacts.weaponsUsed).toEqual([]);
    expect(analysis.extractedFacts.injuriesAndMedical).toBeNull();
    expect(analysis.extractedFacts.totalFinancialLoss).toBeNull();
    expect(analysis.applicableLaws).toEqual([]);
    expect(analysis.caseTitleBn).toBe("আইনগত পরামর্শ ও তথ্যানুসন্ধান");
    expect(analysis.caseCategory).toBe("General");
  });
});
