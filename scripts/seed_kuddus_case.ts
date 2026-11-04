import { db } from "../src/lib/db";
import { generateMockCaseAnalysis } from "../src/lib/ai/mock";
import { generateCivilPlaintTemplate } from "../src/lib/templates/bdCourtTemplates";
import { CaseRecord } from "../src/lib/ai/schemas";

async function main() {
  const statement =
    "আমাদের পৈতৃক খরিদাসূত্রে প্রাপ্ত নালিশি জমিতে আমরা দীর্ঘদিন ধরে শান্তিপূর্ণ ভোগদখলে আছি। কিন্তু বিবাদী কুদ্দুস তালুকদার দলবল নিয়ে সীমানা প্রাচীর ভেঙে অনুপ্রবেশ করে এবং সেখানে অবৈধ স্থাপনা নির্মাণের পাঁয়তারা করছে ও আমাদের জমি জবরদখলের হুমকি দিচ্ছে";

  const analysis = generateMockCaseAnalysis(statement);

  const plaintHtml = generateCivilPlaintTemplate({
    courtStation: "বিজ্ঞ সিনিয়র সহকারী জজ আদালত, ঢাকা",
    district: "ঢাকা",
    complainantName: "বাদী নিজে",
    complainantDetails: "পিতা: মৃত রমিজ উদ্দিন, সাং: ধানমন্ডি, থানা: ধানমন্ডি, জেলা: ঢাকা (বাদী)",
    accusedList: [
      "১। কুদ্দুস তালুকদার, পিতা- অজ্ঞাত, সাং- সংশ্লিষ্ট এলাকা (১নং বিবাদী)",
      "২। অজ্ঞাতনামা অন্যান্য সহযোগী বিবাদীগণ",
    ],
    incidentDate: "গতকল্য রাত্রি",
    incidentPlace: "নালিশি জমি ও সীমানা প্রাচীর",
    totalFinancialLoss: "নালিশি সম্পত্তির আনুমানিক মূল্য ১০,০০,০০০/- টাকা",
    applicableLaws: analysis.applicableLaws,
    caseTitle: analysis.caseTitleBn,
  });

  const kuddusCase: CaseRecord = {
    id: "case-1793702172465",
    userId: "demo-user-advocate-001",
    chamberId: "chamber-001",
    title: analysis.caseTitleBn,
    category: "Civil",
    caseNumber: "দেওয়ানি মোকদ্দমা নং ৪৫/২০২৬",
    courtName: "বিজ্ঞ সিনিয়র সহকারী জজ আদালত, ঢাকা",
    judgeName: "বিজ্ঞ সিনিয়র সহকারী জজ",
    filingDate: new Date().toISOString(),
    nextHearingDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    limitationTriggerDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    limitationDeadline: new Date(Date.now() + 1093 * 86400000).toISOString(),
    limitationCaseType: "CIVIL_DECLARATION_TITLE",
    courtFee: 1500,
    priority: "HIGH",
    clientPhone: "01711223344",
    clientNID: "19902691234567891",
    opposingCounsel: "অ্যাডভোকেট মো. কামরুল হাসান",
    rawStatement: statement,
    extractedFacts: analysis.extractedFacts,
    applicableLaws: analysis.applicableLaws,
    completenessScore: 100,
    status: "READY_TO_DRAFT",
    strategicAdvice: analysis.strategicAdviceForAdvocateBn,
    contradictionsDetected: [],
    questions: analysis.followUpQuestions.map((q, idx) => ({
      id: `q-${idx + 1}`,
      fieldKey: q.fieldKey,
      questionBn: q.questionBn,
      inputType: q.inputType,
      optionsBn: q.optionsBn,
      legalImportanceBn: q.legalImportanceBn,
      answerBn: "যথাযথ তথ্য সংরক্ষিত আছে",
      isAnswered: true,
    })),
    documents: [
      {
        id: "doc-plaint-1793702172465",
        docType: "PLAINT",
        titleBn: "দেওয়ানি আরজি (Plaint)",
        contentHtml: plaintHtml,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    hearings: [],
    evidenceFiles: [],
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.createCase(kuddusCase);
  console.log("Successfully seeded case-1793702172465 as Civil Plaint with Kuddus Talukdar!");
}

main().catch(console.error);
