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

  it("Scenario 6: Public Smoking & Public Nuisance (বারান্দার সামনে প্রকাশ্যে সিগারেট খায় শামীম)", () => {
    const statement = "প্রতিদিন আমার বাসার বারান্দার সামনে প্রকাশ্যে সিগারেট খায় শামীম। আমি বারবার তাকে মানা করার পরও সে এটা করেই যাচ্ছে।";
    const analysis = generateMockCaseAnalysis(statement);

    expect(analysis.caseCategory).toBe("Criminal");
    // Accused must accurately be Shamim, NOT unknown robbery attackers
    expect(analysis.extractedFacts.accusedList.some((a) => a.includes("শামীম"))).toBe(true);
    expect(analysis.extractedFacts.unknownAccusedCount).toBe("নাই");
    // Must NOT hallucinate weapons or robbery!
    expect(analysis.extractedFacts.weaponsUsed.length).toBe(0);
    expect(analysis.extractedFacts.totalFinancialLoss).toBe("কোনো আর্থিক ক্ষতি নেই");
    expect(analysis.extractedFacts.injuriesAndMedical).toContain("ধূমপান");

    // Laws must be Tobacco Control Act / Penal Code 290 (Public Nuisance)
    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("৪/৮") || s.includes("tobacco"))).toBe(true);
    expect(sections.some((s) => s.includes("২৯০") || s.includes("290"))).toBe(true);

    // Questions must be relevant to public nuisance, not hospital medical injury or gold loot!
    const questionsText = analysis.followUpQuestions.map((q) => q.questionBn).join(" ");
    expect(questionsText).not.toContain("লোহার রড");
    expect(questionsText).not.toContain("দা / চাপাতি");
  });

  it("Scenario 7: Group Smoking in front of Balcony (১০ জন মানুষ বারান্দার সামনে ধুমপান করেন)", () => {
    const statement = "১০ জন মানুষ প্রতিদিন ামার বাসার বারান্দার সামনে ধুমপান করেন। বারবার মানা ক্রয়া স্বত্ত্বেও তারা প্রতিদিন ই এসে ধুমপান করেন।";
    const analysis = generateMockCaseAnalysis(statement);

    expect(analysis.caseCategory).toBe("Criminal");
    // Accused must be smokers, NEVER armed land grabbers
    expect(analysis.extractedFacts.accusedList[0]).toContain("ধূমপায়ী");
    expect(analysis.extractedFacts.accusedList.join(" ")).not.toContain("সশস্ত্র দখলদার");

    // Zero weapons, zero injuries, zero robbery
    expect(analysis.extractedFacts.weaponsUsed.length).toBe(0);
    expect(analysis.extractedFacts.totalFinancialLoss).toBe("কোনো আর্থিক ক্ষতি নেই");
    expect(analysis.extractedFacts.injuriesAndMedical).toContain("ধূমপান");

    // Laws must include Tobacco control and 290 public nuisance + 143 unlawful assembly
    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("৪/৮") || s.includes("tobacco"))).toBe(true);
    expect(sections.some((s) => s.includes("২৯০") || s.includes("290"))).toBe(true);
    expect(sections.some((s) => s.includes("১৪৩") || s.includes("143"))).toBe(true);

    // Questions must NOT ask about weapons or robbery
    const questionsText = analysis.followUpQuestions.map((q) => q.questionBn).join(" ");
    expect(questionsText).not.toContain("লোহার রড");
    expect(questionsText).not.toContain("দা / চাপাতি");
  });

  it("Scenario 8: Humanitarian Emergency Rescue (ময়মনসিংহের ব্রীজের মোড়ে একজন বৃদ্ধ মানুষ অজ্ঞান অবস্থায় পড়ে আছে)", () => {
    const statement = "ময়মনসিংহের ব্রীজের মোড়ে একজন বৃদ্ধ মানুষ অজ্ঞান অবস্থায় পড়ে আছে দুই দিন যাবত। কেউ কোন পদক্ষেপ নিচ্ছে না। আমি আইনী পদক্ষেপ নিতে চাই।";
    const analysis = generateMockCaseAnalysis(statement);

    // Exact Title & Category
    expect(analysis.caseTitleBn).toBe("ময়মনসিংহে রাস্তায় পড়ে থাকা অজ্ঞাতনামা অসুস্থ বৃদ্ধের জীবন রক্ষা, উদ্ধার ও চিকিৎসা নিশ্চিতকরণ সংক্রান্ত আবেদন");
    expect(analysis.caseCategory).toBe("Public Interest & Human Rights / Miscellaneous");

    // Location detection
    expect(analysis.extractedFacts.incidentPlace).toContain("ময়মনসিংহের ব্রীজের মোড়ে");
    expect(analysis.extractedFacts.policeStationAndDistrict).toContain("ময়মনসিংহ");

    // Zero weapons, zero violence, zero robbery
    expect(analysis.extractedFacts.weaponsUsed.length).toBe(0);
    expect(analysis.extractedFacts.totalFinancialLoss).toBeNull();
    expect(analysis.extractedFacts.injuriesAndMedical).toContain("অচেতন");

    // Gold-standard statutory laws
    const sections = analysis.applicableLaws.map((l) => l.section);
    expect(sections.some((s) => s.includes("অনুচ্ছেদ ১৫ ও ৩২"))).toBe(true);
    expect(sections.some((s) => s.includes("ধারা ১০০ ও পুলিশ রেগুলেশনস বেঙ্গল (PRB) বিধি ২৪৬"))).toBe(true);
    expect(sections.some((s) => s.includes("ধারা ৩ ও ৫"))).toBe(true);
    expect(sections.some((s) => s.includes("ধারা ৯ ও ১১"))).toBe(true);

    // 4 Targeted Questions
    const questionsText = analysis.followUpQuestions.map((q) => q.questionBn).join(" ");
    expect(questionsText).toContain("৯৯৯");
    expect(questionsText).toContain("স্বজনের ফোন নম্বর");
    expect(questionsText).toContain("কোতোয়ালী মডেল থানা");
    expect(questionsText).toContain("ময়মনসিংহ মেডিকেল কলেজ হাসপাতালের সমাজসেবা ইউনিট");
    expect(questionsText).not.toContain("লোহার রড");
    expect(questionsText).not.toContain("দা / চাপাতি");
    expect(questionsText).not.toContain("জমিজমা");
  });
});
