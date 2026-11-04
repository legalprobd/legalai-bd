import { describe, it, expect } from "vitest";
import { searchTrustedLaws, extractLegalKeywords } from "@/lib/ai/rag";
import { analyzeCaseStatement, getActiveAIProvider } from "@/lib/ai/router";

describe("Trusted Live Law Search (RAG) & AI Legal Engine", () => {
  it("1. Extracts accurate legal keywords for civil land and injunction queries", () => {
    const statement = "আমাদের পৈতৃক জমিতে অবৈধ দখল হয়েছে, আমি জরুরি নিষেধাজ্ঞা চাই।";
    const keywords = extractLegalKeywords(statement);
    expect(keywords).toContain("জমি দখল ও স্বত্ব");
    expect(keywords).toContain("অস্থায়ী ও চিরস্থায়ী নিষেধাজ্ঞা");
  });

  it("2. Extracts accurate legal keywords for criminal and cheque dishonour cases", () => {
    const criminalStmt = "আসামিরা দেশীয় ধারালো অস্ত্র নিয়ে ঘরে ঢুকে মাথায় মেরে রক্তাক্ত জখম করেছে।";
    const criminalKeywords = extractLegalKeywords(criminalStmt);
    expect(criminalKeywords).toContain("মারাত্মক অস্ত্র দ্বারা জখম");
    expect(criminalKeywords).toContain("দণ্ডবিধি ৩০৭ ধারা খুনের চেষ্টা");

    const chequeStmt = "ব্যাংক কর্তৃক ১ লাখ টাকার চেক ডিজঅনার হয়েছে।";
    const chequeKeywords = extractLegalKeywords(chequeStmt);
    expect(chequeKeywords).toContain("এনআই অ্যাক্ট ১৩৮ ধারা চেক ডিজঅনার");
  });

  it("3. Searches trusted Bangladesh laws and returns official domain snippets", async () => {
    const query = "জমি দখল ও নিষেধাজ্ঞা সুনির্দিষ্ট প্রতিকার আইন";
    const result = await searchTrustedLaws(query);

    expect(result.snippets.length).toBeGreaterThan(0);
    expect(result.formattedContext).toContain("LIVE OFFICIAL LAW CONTEXT");
    expect(result.formattedContext).toContain("bdlaws.minlaw.gov.bd");

    const hasSpecificRelief = result.snippets.some(
      (s) =>
        s.title.includes("সুনির্দিষ্ট প্রতিকার") ||
        s.snippet.includes("ধারা ৯") ||
        s.snippet.includes("ধারা ৪২") ||
        s.snippet.includes("ধারা ৫৪")
    );
    expect(hasSpecificRelief).toBe(true);

    // Ensure all returned sources belong to trusted repositories
    for (const snippet of result.snippets) {
      expect(["bdlaws.minlaw.gov.bd", "supremecourt.gov.bd", "mock"]).toContain(snippet.source);
    }
  });

  it("4. Accurately determines active AI provider", () => {
    const provider = getActiveAIProvider();
    expect(["gemini", "openai", "mock"]).toContain(provider);
  });

  it("5. Test Statement: 'আমার জমিতে একটি অবৈধ দখল হয়েছে, আমি নিষেধাজ্ঞা চাই।' generates Civil category & questions", async () => {
    const testInput = "আমার জমিতে একটি অবৈধ দখল হয়েছে, আমি নিষেধাজ্ঞা চাই।";
    const analysis = await analyzeCaseStatement(testInput);

    // Must be classified strictly as Civil
    expect(analysis.caseCategory).toBe("Civil");

    // Title should reflect land dispute and injunction
    expect(analysis.caseTitleBn).toContain("নিষেধাজ্ঞা");

    // Applicable laws must include Specific Relief Act 42 / 54 and Order 39 CPC
    const lawSections = analysis.applicableLaws.map((l) => l.section);
    expect(lawSections.some((s) => s.includes("৪২") || s.includes("৫৪") || s.includes("৩৯"))).toBe(true);

    // Follow-up questions must focus strictly on land ownership/deeds/khatiyans and NOT weapons or injuries
    expect(analysis.followUpQuestions.length).toBeGreaterThan(0);
    const questionsText = analysis.followUpQuestions.map((q) => q.questionBn).join(" ");
    expect(questionsText).toMatch(/দলিল|খতিয়ান|পর্চা|মালিকানা|চৌহদ্দি|সীমানা|নালিশি/);

    // Must NOT contain criminal weapons or hospital medical questions
    expect(questionsText).not.toContain("মারাত্মক কোনো অস্ত্র");
    expect(questionsText).not.toContain("হাসপাতালে ভর্তি");

    // Extracted facts should have no weapons
    expect(analysis.extractedFacts.weaponsUsed.length).toBe(0);
  });
});
