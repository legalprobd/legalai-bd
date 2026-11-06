import fs from "fs";
import path from "path";
import { generateMockCaseAnalysis } from "../src/lib/ai/mock";
import {
  generateCivilPlaintTemplate,
  generateCrPetitionTemplate,
} from "../src/lib/templates/bdCourtTemplates";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

async function seedFreshData() {
  console.log("🌱 Seeding fresh comprehensive live data for LegalAI BD v2.0...");

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // 1. Users & Roles
  const users: Record<string, any> = {
    "demo-user-owner-001": {
      id: "demo-user-owner-001",
      fullName: "ইঞ্জিনিয়ার এস. আলম",
      email: "owner@legalai.bd",
      password: "owner123",
      phone: "01800000000",
      role: "PLATFORM_OWNER",
      isAdmin: true,
      courtStation: "ঢাকা",
      plan: "CHAMBER",
      creditsUsed: 12,
      createdAt: new Date().toISOString(),
    },
    "demo-user-advocate-001": {
      id: "demo-user-advocate-001",
      fullName: "ব্যারিস্টার এম. এ. রহমান",
      email: "advocate@demo.bd",
      password: "legal123",
      phone: "01711000000",
      barCouncilId: "BC-2015-9988",
      barAssociation: "সুপ্রিম কোর্ট বার অ্যাসোসিয়েশন",
      courtStation: "বাংলাদেশ সুপ্রিম কোর্ট ও ঢাকা জজ কোর্ট",
      chamberName: "রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার",
      role: "CHAMBER_OWNER",
      chamberId: "chamber-001",
      plan: "CHAMBER",
      creditsUsed: 45,
      createdAt: new Date().toISOString(),
    },
    "demo-user-junior-001": {
      id: "demo-user-junior-001",
      fullName: "অ্যাডভোকেট তানভীর আহমেদ",
      email: "junior@demo.bd",
      password: "legal123",
      phone: "01722000000",
      barCouncilId: "BC-2022-4411",
      barAssociation: "ঢাকা আইনজীবী সমিতি",
      courtStation: "ঢাকা জেলা ও দায়রা জজ আদালত",
      chamberName: "রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার",
      role: "JUNIOR",
      chamberId: "chamber-001",
      plan: "CHAMBER",
      creditsUsed: 18,
      createdAt: new Date().toISOString(),
    },
  };

  // 2. Chambers
  const chambers: Record<string, any> = {
    "chamber-001": {
      id: "chamber-001",
      name: "রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার",
      ownerId: "demo-user-advocate-001",
      createdAt: new Date().toISOString(),
    },
  };

  // 3. Clients
  const clients: Record<string, any> = {
    "client-001": {
      id: "client-001",
      fullName: "মো. আব্দুল করিম",
      phone: "01712345678",
      email: "karim@gmail.com",
      nidOrPassport: "19852691234567891",
      address: "বাসা-১২, রোড-০৫, ধানমন্ডি, ঢাকা",
      cases: ["case-001"],
      retainerBalance: 35000,
      status: "ACTIVE",
      notes: "ফৌজদারি ভাঙচুর মামলার মূল বাদী। নিয়মিত যোগাযোগ রাখেন।",
      createdAt: new Date().toISOString(),
    },
    "client-002": {
      id: "client-002",
      fullName: "শফিকুর রহমান",
      phone: "01811223344",
      email: "shafiq@outlook.com",
      nidOrPassport: "19782695556667778",
      address: "মৌজা-মিরপুর, প্লট-৪৩৫, ঢাকা",
      cases: ["case-002"],
      retainerBalance: 17500,
      status: "ACTIVE",
      notes: "মিরপুর ভূমির স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞা মামলার বাদী।",
      createdAt: new Date().toISOString(),
    },
    "client-003": {
      id: "client-003",
      fullName: "মো. রফিকুল ইসলাম",
      phone: "01911998877",
      email: "rafiq.trade@gmail.com",
      nidOrPassport: "19802690011223344",
      address: "মতিঝিল বা/এ, ঢাকা",
      cases: ["case-003"],
      retainerBalance: 25000,
      status: "ACTIVE",
      notes: "এনআই অ্যাক্ট ১৩৮ ধারায় চেক ডিজঅনার মামলার নালিশকারী।",
      createdAt: new Date().toISOString(),
    },
  };

  // 4. Cases
  const statementCriminal =
    "গতকল্য রাত আনুমানিক ৮ ঘটিকায় আসামীরা পূর্বপরিকল্পিতভাবে দেশীয় লাঠিসোটা ও লোহার রড নিয়ে আমাদের বসতবাড়িতে অনধিকার প্রবেশ করে। তারা আমাকে এবং আমার পরিবারের সদস্যদের অকথ্য ভাষায় গালিগালাজ করে। আমি প্রতিবাদ করলে ১নং আসামী লোহার রড দিয়ে আমার মাথায় সজোরে আঘাত করে রক্তাক্ত জখম করে। অন্যান্য আসামীরা ঘরের আসবাবপত্র ভাঙচুর করে আনুমানিক ৫০,০০০ টাকার ক্ষতিসাধন করে।";
  const analysisCriminal = generateMockCaseAnalysis(statementCriminal);

  const statementCivil =
    "আমাদের পৈতৃক খরিদাসূত্রে প্রাপ্ত নালিশি জমিতে আমরা দীর্ঘদিন ধরে শান্তিপূর্ণ ভোগদখলে আছি। কিন্তু বিবাদী কুদ্দুস তালুকদার দলবল নিয়ে সীমানা প্রাচীর ভেঙে অনুপ্রবেশ করে এবং সেখানে অবৈধ স্থাপনা নির্মাণের পাঁয়তারা করছে ও আমাদের জমি জবরদখলের হুমকি দিচ্ছে।";
  const analysisCivil = generateMockCaseAnalysis(statementCivil);

  const statementSmoking =
    "আমাদের এলাকার একটি দোকানে প্রতিদিন প্রকাশ্যে ধূমপান করা হয়। নিষেধ করলে হুমকি দেয়।";
  const analysisSmoking = generateMockCaseAnalysis(statementSmoking);

  const cases: Record<string, any> = {
    "case-001": {
      id: "case-001",
      userId: "demo-user-advocate-001",
      chamberId: "chamber-001",
      title: "বাসায় হামলা ও ভাঙচুর — করিম মিয়া",
      category: "Criminal",
      caseNumber: "সি.আর. ৮৩২/২০২৬",
      courtName: "বিজ্ঞ চিফ জুডিশিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা",
      judgeName: "বিজ্ঞ চিফ জুডিশিয়াল ম্যাজিস্ট্রেট",
      filingDate: "2026-11-01T10:00:00Z",
      nextHearingDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      limitationTriggerDate: "2026-10-31T20:00:00Z",
      limitationDeadline: new Date(Date.now() + 1090 * 86400000).toISOString(),
      limitationCaseType: "CRIMINAL_POLICE_REPORT",
      courtFee: 200,
      priority: "HIGH",
      clientPhone: "01712345678",
      clientNID: "19852691234567891",
      opposingCounsel: "অ্যাডভোকেট মো. কামরুল হাসান",
      rawStatement: statementCriminal,
      extractedFacts: analysisCriminal.extractedFacts,
      applicableLaws: analysisCriminal.applicableLaws,
      completenessScore: 100,
      hearings: [
        {
          id: "hear-001",
          date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          purpose: "আসামিদের জামিন শুনানি ও নালিশি আরজি পর্যালোচনা",
          courtName: "বিজ্ঞ চিফ জুডিশিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা",
          notes: "কেস ডায়েরি তলব এবং মূল ইনজুরি সার্টিফিকেটের সত্যয়িত নকল দাখিল।",
        },
      ],
      documents: [
        {
          id: "doc-001",
          type: "CR_PETITION",
          titleBn: "নালিশি দরখাস্ত (সি.আর. কেস)",
          contentHtml: generateCrPetitionTemplate({
            courtStation: "বিজ্ঞ চিফ জুডিশিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা",
            district: "ঢাকা",
            complainantName: "মো. আব্দুল করিম",
            complainantDetails: "পিতা: মৃত রমিজ উদ্দিন, সাং: ধানমন্ডি, থানা: ধানমন্ডি, জেলা: ঢাকা",
            accusedList: [
              "১। মো. শামীম (৩২), পিতা- অজ্ঞাত, সাং- সংশ্লিষ্ট এলাকা",
              "২। অজ্ঞাতনামা আরও ২/৩ জন সহযোগী",
            ],
            incidentDate: "৩০ অক্টোবর, ২০২৬",
            incidentPlace: "নালিশি বসতবাড়ি প্রাঙ্গণ",
            totalFinancialLoss: "৫০,০০০/- টাকা",
            applicableLaws: analysisCriminal.applicableLaws,
            caseTitle: "বাসায় হামলা ও ভাঙচুর — করিম মিয়া",
          }),
          createdAt: new Date().toISOString(),
        },
      ],
      evidence: [],
      notes: [],
      interrogationAnswers: {
        incident_time: "রাত আনুমানিক ৮:০০ ঘটিকা",
        weapon_used: "লোহার রড ও বাঁশের লাঠি",
        witnesses: "১। মো. রফিক (প্রতিবেশী), ২। ডা. শফিকুল ইসলাম",
      },
      createdAt: "2026-11-01T10:00:00Z",
      updatedAt: new Date().toISOString(),
    },

    "case-002": {
      id: "case-002",
      userId: "demo-user-advocate-001",
      chamberId: "chamber-001",
      title: "পৈতৃক ভূমিতে সীমানা প্রাচীর ভেঙে জবরদখল ও অনুপ্রবেশ — কুদ্দুস তালুকদার",
      category: "Civil",
      caseNumber: "দেওয়ানি মোকদ্দমা নং ৪৫/২০২৬",
      courtName: "বিজ্ঞ ১ম সহকারী জজ আদালত, ঢাকা",
      judgeName: "বিজ্ঞ সহকারী জজ",
      filingDate: "2026-11-02T11:00:00Z",
      nextHearingDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      limitationTriggerDate: "2026-10-25T10:00:00Z",
      limitationDeadline: new Date(Date.now() + 1090 * 86400000).toISOString(),
      limitationCaseType: "CIVIL_DECLARATION_TITLE",
      courtFee: 1500,
      priority: "HIGH",
      clientPhone: "01811223344",
      clientNID: "19782695556667778",
      opposingCounsel: "অ্যাডভোকেট এম এ কাইয়ুম",
      rawStatement: statementCivil,
      extractedFacts: analysisCivil.extractedFacts,
      applicableLaws: analysisCivil.applicableLaws,
      completenessScore: 100,
      hearings: [
        {
          id: "hear-002",
          date: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
          purpose: "সিপিসি অর্ডার ৩৯ রুল ১/২ অন্তর্বর্তীকালীন নিষেধাজ্ঞা শুনানি",
          courtName: "বিজ্ঞ ১ম সহকারী জজ আদালত, ঢাকা",
          notes: "বিবাদীর প্রতি কারণ দর্শানোর নোটিশ ও অন্তর্বর্তীকালীন স্থিতাবস্থা প্রার্থনা।",
        },
      ],
      documents: [
        {
          id: "doc-002",
          type: "CIVIL_PLAINT",
          titleBn: "দেওয়ানি মূল আরজি (Plaint)",
          contentHtml: generateCivilPlaintTemplate({
            courtStation: "বিজ্ঞ ১ম সহকারী জজ আদালত, ঢাকা",
            district: "ঢাকা",
            complainantName: "শফিকুর রহমান",
            complainantDetails: "পিতা: মৃত হাজী মোসলেম উদ্দিন, সাং: মিরপুর, থানা: মিরপুর, জেলা: ঢাকা",
            accusedList: [
              "১। কুদ্দুস তালুকদার, পিতা- অজ্ঞাত, সাং- মিরপুর, ঢাকা (১নং বিবাদী)",
            ],
            incidentDate: "২৫ অক্টোবর, ২০২৬",
            incidentPlace: "মিরপুর মৌজার দাগ নং ৪৩৫ এর নালিশি ভূমি",
            totalFinancialLoss: "সম্পত্তির মূল্য বাবদ ১৫,০০,০০০/- টাকা",
            applicableLaws: analysisCivil.applicableLaws,
            caseTitle: "পৈতৃক ভূমিতে সীমানা প্রাচীর ভেঙে জবরদখল ও অনুপ্রবেশ — কুদ্দুস তালুকদার",
          }),
          createdAt: new Date().toISOString(),
        },
      ],
      evidence: [],
      notes: [],
      interrogationAnswers: {},
      createdAt: "2026-11-02T11:00:00Z",
      updatedAt: new Date().toISOString(),
    },

    "case-003": {
      id: "case-003",
      userId: "demo-user-advocate-001",
      chamberId: "chamber-001",
      title: "প্রকাশ্য ধূমপান ও গণউপদ্রব — শামীম ও সহযোগী",
      category: "Criminal",
      caseNumber: "জিডি নং ১২৪৫/২০২৬",
      courtName: "ধানমন্ডি মডেল থানা ও বিজ্ঞ সিএমএম আদালত",
      filingDate: "2026-11-04T12:00:00Z",
      nextHearingDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      limitationTriggerDate: "2026-11-03T18:00:00Z",
      limitationDeadline: new Date(Date.now() + 180 * 86400000).toISOString(),
      limitationCaseType: "CRIMINAL_POLICE_REPORT",
      courtFee: 0,
      priority: "MEDIUM",
      clientPhone: "01911998877",
      rawStatement: statementSmoking,
      extractedFacts: analysisSmoking.extractedFacts,
      applicableLaws: analysisSmoking.applicableLaws,
      completenessScore: 100,
      hearings: [],
      documents: [],
      evidence: [],
      notes: [],
      interrogationAnswers: {},
      createdAt: "2026-11-04T12:00:00Z",
      updatedAt: new Date().toISOString(),
    },
  };

  // 5. Tasks
  const tasks: Record<string, any> = {
    "task-001": {
      id: "task-001",
      title: "সি.আর. ৮৩২ মামলার কেস ডায়েরির জাবেদা নকল উত্তোলন",
      caseId: "case-001",
      caseTitle: "বাসায় হামলা ও ভাঙচুর — করিম মিয়া",
      assignedTo: "অ্যাডভোকেট তানভীর আহমেদ",
      assignedBy: "ব্যারিস্টার এম. এ. রহমান",
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      priority: "HIGH",
      status: "IN_PROGRESS",
      notes: "সিএমএম কোর্টের নকলখানা থেকে সত্যায়িত কপি সংগ্রহ করতে হবে।",
      createdAt: new Date().toISOString(),
    },
    "task-002": {
      id: "task-002",
      title: "মিরপুর সাব-রেজিস্ট্রি অফিস থেকে ১৯৮৫ সালের বায়া দলিলের সার্টিফাইড কপি সংগ্রহ",
      caseId: "case-002",
      caseTitle: "পৈতৃক ভূমিতে সীমানা প্রাচীর ভেঙে জবরদখল ও অনুপ্রবেশ",
      assignedTo: "অ্যাডভোকেট তানভীর আহমেদ",
      assignedBy: "ব্যারিস্টার এম. এ. রহমান",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      priority: "MEDIUM",
      status: "TODO",
      notes: "বালাম বই নং ১২, পৃষ্ঠা নং ৩৪-৩৮ তল্লাশি দিতে হবে।",
      createdAt: new Date().toISOString(),
    },
  };

  // 6. Trust Accounts (IOLTA)
  const trustAccounts: Record<string, any> = {
    "trust-001": {
      id: "trust-001",
      clientId: "client-001",
      clientName: "মো. আব্দুল করিম",
      caseId: "case-001",
      totalDeposited: 50000,
      totalDisbursed: 15000,
      balance: 35000,
      transactions: [
        {
          id: "trx-001",
          date: "2026-11-01",
          type: "DEPOSIT",
          amount: 50000,
          purpose: "মামলা পরিচালনা ও কোর্ট ফি বাবদ অগ্রিম ট্রাস্ট জমা",
          voucherRef: "DEP-2026-001",
        },
        {
          id: "trx-002",
          date: "2026-11-02",
          type: "DISBURSEMENT",
          amount: 15000,
          purpose: "বিজ্ঞ আদালতে নালিশি আরজির কোর্ট ফি ও অ্যাডভোকেট ক্লার্ক প্রসেস ফি পরিশোধ",
          voucherRef: "EXP-2026-089",
        },
      ],
      createdAt: new Date().toISOString(),
    },
    "trust-002": {
      id: "trust-002",
      clientId: "client-002",
      clientName: "শফিকুর রহমান",
      caseId: "case-002",
      totalDeposited: 40000,
      totalDisbursed: 22500,
      balance: 17500,
      transactions: [
        {
          id: "trx-003",
          date: "2026-11-02",
          type: "DEPOSIT",
          amount: 40000,
          purpose: "দেওয়ানি মোকদ্দমার আরজি ও ইনজাংশন প্রসেস ফি ট্রাস্ট আমানত",
          voucherRef: "DEP-2026-002",
        },
        {
          id: "trx-004",
          date: "2026-11-03",
          type: "DISBURSEMENT",
          amount: 22500,
          purpose: "বিজ্ঞ সিনিয়র সহকারী জজ আদালতে অ্যাড ভ্যালোরেম কোর্ট ফি পরিশোধ",
          voucherRef: "EXP-2026-092",
        },
      ],
      createdAt: new Date().toISOString(),
    },
  };

  // 7. Payments for Super Admin MRR Audit
  const payments = [
    {
      id: "pay-001",
      userId: "demo-user-advocate-001",
      amount: 7500,
      method: "bKash",
      trxId: "BKASH_998877",
      status: "COMPLETED",
      plan: "CHAMBER",
      createdAt: new Date().toISOString(),
    },
    {
      id: "pay-002",
      userId: "demo-user-junior-001",
      amount: 5000,
      method: "Nagad",
      trxId: "NAGAD_443322",
      status: "COMPLETED",
      plan: "PRO",
      createdAt: new Date().toISOString(),
    },
    {
      id: "pay-003",
      userId: "demo-user-owner-001",
      amount: 5000,
      method: "City Bank",
      trxId: "BANK_112233",
      status: "COMPLETED",
      plan: "PRO",
      createdAt: new Date().toISOString(),
    },
  ];

  const fullState = {
    users,
    chambers,
    cases,
    clients,
    tasks,
    trustAccounts,
    precedents: [],
    auditLogs: [],
    payments,
    lawSections: [],
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(fullState, null, 2), "utf8");
  console.log("✔ Successfully seeded fresh live database!");
  console.log(`  - Users: ${Object.keys(users).length}`);
  console.log(`  - Chambers: ${Object.keys(chambers).length}`);
  console.log(`  - Cases: ${Object.keys(cases).length}`);
  console.log(`  - Clients: ${Object.keys(clients).length}`);
  console.log(`  - Tasks: ${Object.keys(tasks).length}`);
  console.log(`  - Trust Accounts: ${Object.keys(trustAccounts).length}`);
  console.log(`  - Payments: ${payments.length}`);
}

seedFreshData().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
