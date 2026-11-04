import { describe, it, expect } from "vitest";
import { generateMockCaseAnalysis } from "@/lib/ai/mock";
import case1 from "./golden-cases/case1_home_invasion.json";
import case2 from "./golden-cases/case2_cheque_dishonour.json";
import case3 from "./golden-cases/case3_land_dispute.json";

describe("AI Golden Tests (Deterministic Consistency)", () => {
  it("evaluates Golden Case 1: Home Invasion & Assault correctly", () => {
    const analysis = generateMockCaseAnalysis(case1.statement);
    expect(analysis.caseCategory).toBe(case1.expectedCategory);
    expect(analysis.completenessScore).toBeGreaterThanOrEqual(case1.expectedMinCompleteness);
    
    const sections = analysis.applicableLaws.map(l => l.section);
    // Should have 143, 452 (upgraded for weapon/head injury), 307 (head crack), 427 (damage)
    expect(sections.some(s => s.includes("১৪৩") || s.includes("143"))).toBe(true);
    expect(sections.some(s => s.includes("৪৫২") || s.includes("452"))).toBe(true);
    expect(sections.some(s => s.includes("৩০৭") || s.includes("307"))).toBe(true);
  });

  it("evaluates Golden Case 2: Cheque Dishonour correctly", () => {
    const analysis = generateMockCaseAnalysis(case2.statement);
    const sections = analysis.applicableLaws.map(l => l.section);
    expect(sections.some(s => s.includes("১৩৮") || s.includes("138"))).toBe(true);
  });

  it("evaluates Golden Case 3: Land Dispute & Injunction correctly", () => {
    const analysis = generateMockCaseAnalysis(case3.statement);
    expect(analysis.caseCategory).toBe("Civil");
    const sections = analysis.applicableLaws.map(l => l.section);
    expect(sections.some(s => s.includes("৪২") || s.includes("42"))).toBe(true);
  });

  it("evaluates User Statement: Armed Home Takeover with Pistol & 20 attackers", () => {
    const statement = "আমার বাসা গতকাল রাতে ২০ জন লোক এসে দখল করে নিয়েছে। আমি এখন আমার বাসায় যেতে পারিনা। তাদের হাতে পিস্তল ছিল।";
    const analysis = generateMockCaseAnalysis(statement);
    expect(analysis.caseCategory).toBe("Criminal");
    const sections = analysis.applicableLaws.map(l => l.section);
    // Should contain 143 (unlawful assembly), 148 (rioting with deadly weapons), 452 (trespass armed), arms_19a (pistol/arms act)
    expect(sections.some(s => s.includes("১৪৩") || s.includes("143"))).toBe(true);
    expect(sections.some(s => s.includes("১৪৮") || s.includes("148"))).toBe(true);
    expect(sections.some(s => s.includes("৪৫২") || s.includes("452"))).toBe(true);
    expect(sections.some(s => s.includes("১৯(ক)") || s.includes("19(a)"))).toBe(true);
  });

  it("evaluates User Statement: Rahim Miah with Revolver & Home Dispossession", () => {
    const statement = "আমার বাড়িতে হামলা করে আমাকে বাড়ি থেকে বের করে দিয়ে রহিম মিয়া আমার বাড়ি দখল করেছে। রহিম মিয়ার সাথে অনেক মানুষ ছিল এবং তাদের হাতে ছিল একটা করে রিভলবার।";
    const analysis = generateMockCaseAnalysis(statement);
    expect(analysis.caseCategory).toBe("Criminal");
    expect(analysis.caseTitleBn).toContain("রহিম মিয়া");
    expect(analysis.extractedFacts.accusedList.some(a => a.includes("রহিম মিয়া"))).toBe(true);
    expect(analysis.extractedFacts.weaponsUsed.some(w => w.includes("রিভলবার"))).toBe(true);
    
    const sections = analysis.applicableLaws.map(l => l.section);
    expect(sections.some(s => s.includes("১৪৩") || s.includes("143"))).toBe(true);
    expect(sections.some(s => s.includes("১৪৮") || s.includes("148"))).toBe(true);
    expect(sections.some(s => s.includes("৪৫২") || s.includes("452"))).toBe(true);
    expect(sections.some(s => s.includes("১৯(ক)") || s.includes("19(a)"))).toBe(true);
    expect(sections.some(s => s.includes("৯") || s.includes("sr_9"))).toBe(true);
  });

  it("evaluates User Statement: Kudus Talukdar Civil Land Encroachment & Injunction", () => {
    const statement = "আমাদের পৈতৃক খরিদসূত্রে প্রাপ্ত নালিশি জমিতে আমরা দীর্ঘদিন ধরে শান্তিপূর্ণ ভোগদখলে আছি। কিন্তু বিবাদী কুদ্দুস তালুকদার দলবল নিয়ে সীমানা প্রাচীর ভেঙে অনুপ্রবেশ করে এবং সেখানে অবৈধ স্থাপনা নির্মাণের পাঁয়তারা করছে ও আমাদের জমি জবরদখলের হুমকি দিচ্ছে";
    const analysis = generateMockCaseAnalysis(statement);
    expect(analysis.caseCategory).toBe("Civil");
    expect(analysis.caseTitleBn).toContain("কুদ্দুস তালুকদার");
    expect(analysis.extractedFacts.accusedList.some(a => a.includes("কুদ্দুস তালুকদার"))).toBe(true);
    expect(analysis.extractedFacts.weaponsUsed).toHaveLength(0);
    expect(analysis.extractedFacts.complainantName).toBe("বাদী নিজে");
    expect(analysis.followUpQuestions.some(q => q.questionBn.includes("অস্ত্র"))).toBe(false);

    const sections = analysis.applicableLaws.map(l => l.section);
    expect(sections.some(s => s.includes("৪২") || s.includes("42"))).toBe(true);
    expect(sections.some(s => s.includes("৫৪") || s.includes("54"))).toBe(true);
  });
});
