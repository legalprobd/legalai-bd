import fs from "fs";
import path from "path";
import { CaseRecord, GeneratedDocItem, HearingItem, EvidenceFileItem, CaseNoteItem } from "./ai/schemas";
import { generateMockCaseAnalysis } from "./ai/mock";
import { generateFirTemplate, generateCrPetitionTemplate, generateBailPetitionTemplate, generateCivilPlaintTemplate } from "./templates/bdCourtTemplates";

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  barCouncilId?: string;
  barAssociation?: string;
  courtStation: string;
  chamberName?: string;
  digitalSignatureUrl?: string;
  chamberLetterheadUrl?: string;
  isAdmin?: boolean;
  role: "PLATFORM_OWNER" | "CHAMBER_OWNER" | "OWNER" | "ADVOCATE" | "JUNIOR" | "ASSISTANT";
  chamberId?: string;
  plan: "FREE" | "PRO" | "CHAMBER";
  creditsUsed: number;
  createdAt: string;
}

export interface ChamberRecord {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  method: string;
  trxId: string;
  status: string;
  plan: "FREE" | "PRO" | "CHAMBER";
  createdAt: string;
}

export interface LawSectionItem {
  id: string;
  actNameEn: string;
  actNameBn: string;
  sectionNumber: string;
  titleBn: string;
  contentBn: string;
  isBailable: boolean;
  punishmentBn: string;
}

// In-Memory Global Store with file-backing
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

export interface ClientRecord {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  nidOrPassport?: string;
  address: string;
  cases: string[]; // caseIds
  retainerBalance: number;
  status: "ACTIVE" | "INACTIVE";
  notes?: string;
  createdAt: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  caseId?: string;
  caseTitle?: string;
  assignedTo: string; // user name or id
  assignedBy: string;
  dueDate: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  notes?: string;
  createdAt: string;
}

export interface TrustTransaction {
  id: string;
  date: string;
  type: "DEPOSIT" | "DISBURSEMENT";
  amount: number;
  purpose: string;
  voucherRef?: string;
}

export interface TrustAccountRecord {
  id: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  totalDeposited: number;
  totalDisbursed: number;
  balance: number;
  transactions: TrustTransaction[];
  createdAt: string;
}

export interface PrecedentRecord {
  id: string;
  citation: string;
  court: string;
  parties: string;
  subject: string;
  ratioDecidendiBn: string;
  year: number;
}

export interface NotificationLogRecord {
  id: string;
  caseId: string;
  hearingId?: string | null;
  recipientPhone: string;
  recipientName?: string | null;
  message: string;
  channel: "SMS" | "WHATSAPP";
  status: "SENT" | "FAILED";
  sentAt?: string;
  createdAt: string;
}

export interface DatabaseState {
  users: Record<string, UserRecord>;
  chambers: Record<string, ChamberRecord>;
  cases: Record<string, CaseRecord>;
  clients: Record<string, ClientRecord>;
  tasks: Record<string, TaskRecord>;
  trustAccounts: Record<string, TrustAccountRecord>;
  precedents: PrecedentRecord[];
  notifications: Record<string, NotificationLogRecord>;
  auditLogs: AuditLogRecord[];
  payments: PaymentRecord[];
  lawSections: LawSectionItem[];
  customPrompts?: {
    interviewerPrompt: string;
    drafterPrompt: string;
  };
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }
}

function loadState(): DatabaseState {
  ensureDataDir();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
      if (raw && raw.length > 2) {
        const parsed = JSON.parse(raw);
        parsed.clients = parsed.clients || {};
        parsed.tasks = parsed.tasks || {};
        parsed.trustAccounts = parsed.trustAccounts || {};
        parsed.precedents = parsed.precedents || [];
        parsed.notifications = parsed.notifications || {};
        parsed.users = parsed.users || {};
        if (!parsed.users["user-platform-owner-001"]) {
          parsed.users["user-platform-owner-001"] = {
            id: "user-platform-owner-001",
            fullName: "সুপার প্ল্যাটফর্ম অ্যাডমিন (Chief Architect)",
            email: "owner@legalai.bd",
            password: "owner123",
            phone: "01999000000",
            barCouncilId: "BC/SUPER/001",
            barAssociation: "বাংলাদেশ সুপ্রিম কোর্ট বার",
            courtStation: "বাংলাদেশ সুপ্রিম কোর্ট",
            chamberName: "LegalAI BD Platform HQ",
            isAdmin: true,
            role: "PLATFORM_OWNER",
            plan: "CHAMBER",
            creditsUsed: 0,
            createdAt: new Date().toISOString(),
          };
        }
        return parsed;
      }
    } catch {
      // ignore and reseed
    }
  }
  return initDefaultSeed();
}

function saveState(state: DatabaseState) {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving state to store.json", e);
  }
}

function initDefaultSeed(): DatabaseState {
  const demoUserId = "demo-user-advocate-001";
  const demoChamberId = "chamber-rahman-associates";
  const demoCaseId = "case-karim-miah-001";

  const demoOwnerId = "user-platform-owner-001";
  const demoOwnerUser: UserRecord = {
    id: demoOwnerId,
    fullName: "সুপার প্ল্যাটফর্ম অ্যাডমিন (Chief Architect)",
    email: "owner@legalai.bd",
    password: "owner123",
    phone: "01999000000",
    barCouncilId: "BC/SUPER/001",
    barAssociation: "বাংলাদেশ সুপ্রিম কোর্ট বার",
    courtStation: "বাংলাদেশ সুপ্রিম কোর্ট",
    chamberName: "LegalAI BD Platform HQ",
    isAdmin: true,
    role: "PLATFORM_OWNER",
    plan: "CHAMBER",
    creditsUsed: 0,
    createdAt: new Date().toISOString(),
  };

  const demoUser: UserRecord = {
    id: demoUserId,
    fullName: "ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)",
    email: "advocate@demo.bd",
    password: "legal123",
    phone: "01711000000",
    barCouncilId: "BC/DH/2014/8942",
    barAssociation: "ঢাকা আইনজীবী সমিতি ও সুপ্রিম কোর্ট বার",
    courtStation: "ঢাকা জজ কোর্ট ও সুপ্রিম কোর্ট",
    chamberName: "রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার",
    isAdmin: true,
    role: "ADVOCATE",
    chamberId: demoChamberId,
    plan: "PRO",
    creditsUsed: 12,
    createdAt: new Date().toISOString(),
  };

  const demoJuniorUser: UserRecord = {
    id: "user-junior-002",
    fullName: "জুনিয়র অ্যাডভোকেট তানভীর আহমেদ",
    email: "junior@demo.bd",
    password: "legal123",
    phone: "01822000000",
    barCouncilId: "BC/DH/2022/1054",
    barAssociation: "ঢাকা আইনজীবী সমিতি",
    courtStation: "ঢাকা জজ কোর্ট",
    chamberName: "রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার",
    isAdmin: false,
    role: "JUNIOR",
    chamberId: demoChamberId,
    plan: "FREE",
    creditsUsed: 2,
    createdAt: new Date().toISOString(),
  };

  const demoChamber: ChamberRecord = {
    id: demoChamberId,
    name: "রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার",
    ownerId: demoUserId,
    createdAt: new Date().toISOString(),
  };

  const initialStatement = "গতকাল রাতে পাশের বাড়ির করিম মিয়া তার লোকজন নিয়ে আমাদের বাসায় ঢুকে ভাঙচুর করেছে এবং আমার ভাইকে মেরে মাথা ফাটিয়ে দিয়েছে।";
  const initialAnalysis = generateMockCaseAnalysis(initialStatement);

  const hearingDate = new Date();
  hearingDate.setDate(hearingDate.getDate() + 7);

  const demoHearing: HearingItem = {
    id: "hearing-001",
    caseId: demoCaseId,
    date: hearingDate.toISOString(),
    purpose: "আসামিদের জামিন শুনানি ও নালিশি আরজি পর্যালোচনা",
    judgeName: "বিজ্ঞ জুডিসিয়াল ম্যাজিস্ট্রেট, ঢাকা",
    outcomeBn: "বিজ্ঞ আদালত কেস ডায়েরি (CD) তলবপূর্বক পরবর্তী শুনানির দিন ধার্য করিয়াছেন।",
    orderSheetBn: "আসামিপক্ষে জামিনের আবেদন দাখিল। আগামী তারিখে নথিসহ শুনানির আদেশ।",
    nextDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  const demoFirHtml = generateFirTemplate({
    policeStation: "কোতোয়ালি",
    district: "ঢাকা",
    complainantName: "আব্দুল করিম ও ভুক্তভোগীর ভাই",
    accusedList: ["১। করিম মিয়া, পিতা- মৃত সামসুল হক", "২। অজ্ঞাতনামা ৪/৫ জন সহযোগী"],
    incidentDate: "গতকাল রাত্রি আনুমানিক ১০:৩০ ঘটিকা",
    incidentPlace: "বাদীর নিজ বসতবাড়ি",
    weaponsUsed: ["লোহার রড", "ধারালো দা", "লাঠিসোঁটা"],
    injuriesAndMedical: "মাথায় গুরুতর রক্তাক্ত জখম, হাসপাতালে ৩টি সেলাই লেগেছে",
    totalFinancialLoss: "১,৫০,০০০/- টাকা",
    applicableLaws: initialAnalysis.applicableLaws,
  });

  const demoCase: CaseRecord = {
    id: demoCaseId,
    userId: demoUserId,
    chamberId: demoChamberId,
    title: "বাসায় হামলা ও ভাঙচুর — করিম মিয়া",
    category: "Criminal",
    caseNumber: "সি.আর. ৮৪২/২০২৬",
    courtName: "বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা",
    judgeName: "বিজ্ঞ ম্যাজিস্ট্রেট, আমলি আদালত নং ৩",
    filingDate: new Date().toISOString(),
    nextHearingDate: hearingDate.toISOString(),
    limitationTriggerDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    limitationDeadline: new Date(Date.now() + 25 * 86400000).toISOString(),
    limitationCaseType: "CRIMINAL_FIR",
    courtFee: 200,
    priority: "HIGH",
    clientPhone: "01812345678",
    clientNID: "19882691234567890",
    opposingCounsel: "অ্যাডভোকেট মো. রফিকুল ইসলাম",
    rawStatement: initialStatement,
    extractedFacts: initialAnalysis.extractedFacts,
    applicableLaws: initialAnalysis.applicableLaws,
    completenessScore: initialAnalysis.completenessScore,
    status: "INTERVIEWING",
    strategicAdvice: initialAnalysis.strategicAdviceForAdvocateBn,
    contradictionsDetected: [],
    questions: initialAnalysis.followUpQuestions.map((q, idx) => ({
      id: `q-${idx + 1}`,
      fieldKey: q.fieldKey,
      questionBn: q.questionBn,
      inputType: q.inputType,
      optionsBn: q.optionsBn,
      legalImportanceBn: q.legalImportanceBn,
      answerBn: null,
      isAnswered: false,
    })),
    documents: [
      {
        id: "doc-fir-001",
        docType: "FIR",
        titleBn: "থানার এজাহার (FIR) খসড়া",
        contentHtml: demoFirHtml,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    hearings: [demoHearing],
    evidenceFiles: [
      {
        id: "ev-001",
        caseId: demoCaseId,
        fileName: "Medical_Injury_Report_DHMC.pdf",
        fileType: "application/pdf",
        url: "/uploads/medical_report.pdf",
        sizeBytes: 245800,
        factMapping: { "injuriesAndMedical": "মাথায় ধারালো অস্ত্রের আঘাত ও ৩টি সেলাই" },
        ocrTextBn: "রোগীর নাম: মো. রফিকুল হাসান, জখম: মাথায় ধারালো/ভোঁতা অস্ত্রের আঘাতজনিত সেলাই ও রক্তক্ষরণ।",
        uploadedAt: new Date().toISOString(),
      },
    ],
    notes: [
      {
        id: "note-001",
        caseId: demoCaseId,
        contentBn: "ক্লায়েন্ট জানিয়েছেন স্থানীয় চেয়ারম্যান সালিশ করার প্রস্তাব দিয়েছিলেন, কিন্তু বাদী কোনো আপোষে সম্মত হননি। সিডি প্রস্তুত হলে তদন্ত কর্মকর্তার সাথে যোগাযোগ করতে হবে।",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const civilStatement = "আমাদের পৈতৃক খরিদাসূত্রে প্রাপ্ত নালিশি জমিতে আমরা দীর্ঘদিন ধরে শান্তিপূর্ণ ভোগদখলে আছি। কিন্তু বিবাদী কুদ্দুস তালুকদার দলবল নিয়ে সীমানা প্রাচীর ভেঙে অনুপ্রবেশ করে এবং সেখানে অবৈধ স্থাপনা নির্মাণের পাঁয়তারা করছে ও আমাদের জমি জবরদখলের হুমকি দিচ্ছে";
  const civilAnalysis = generateMockCaseAnalysis(civilStatement);
  const civilPlaintHtml = generateCivilPlaintTemplate({
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
    applicableLaws: civilAnalysis.applicableLaws,
    caseTitle: civilAnalysis.caseTitleBn,
  });

  const demoCivilCase: CaseRecord = {
    id: "case-1793702172465",
    userId: demoUserId,
    chamberId: demoChamberId,
    title: civilAnalysis.caseTitleBn,
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
    rawStatement: civilStatement,
    extractedFacts: civilAnalysis.extractedFacts,
    applicableLaws: civilAnalysis.applicableLaws,
    completenessScore: 100,
    status: "READY_TO_DRAFT",
    strategicAdvice: civilAnalysis.strategicAdviceForAdvocateBn,
    contradictionsDetected: [],
    questions: civilAnalysis.followUpQuestions.map((q, idx) => ({
      id: `q-civil-${idx + 1}`,
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
        id: "doc-plaint-001",
        docType: "PLAINT",
        titleBn: "দেওয়ানি আরজি (Plaint)",
        contentHtml: civilPlaintHtml,
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

  const demoClientId = "client-001";
  const demoClient: ClientRecord = {
    id: demoClientId,
    fullName: "মো. আব্দুল করিম",
    phone: "01812345678",
    email: "karim.client@gmail.com",
    nidOrPassport: "19882691234567890",
    address: "বাড়ি নং ৪২, রোড ৭, ধানমন্ডি, ঢাকা",
    cases: [demoCaseId],
    retainerBalance: 35000,
    status: "ACTIVE",
    notes: "নিয়মিত মামলার ফি প্রদান করেন, বিশ্বস্ত মক্কেল।",
    createdAt: new Date().toISOString(),
  };

  const demoClient2: ClientRecord = {
    id: "client-002",
    fullName: "মো. কুদ্দুস তালুকদার",
    phone: "01711223344",
    email: "kuddus.talukdar@gmail.com",
    nidOrPassport: "19902691234567891",
    address: "গ্রাম: রূপনগর, থানা: মিরপুর, ঢাকা",
    cases: ["case-1793702172465"],
    retainerBalance: 15000,
    status: "ACTIVE",
    notes: "জমির স্বত্ব ঘোষণা মোকদ্দমা চলমান।",
    createdAt: new Date().toISOString(),
  };

  const demoTask1: TaskRecord = {
    id: "task-001",
    title: "করিম মিয়ার সি.আর. মামলার নারাজি ও নালিশি আরজি রিভিশন ড্রাফটিং",
    caseId: demoCaseId,
    caseTitle: "বাসায় হামলা ও ভাঙচুর — করিম মিয়া",
    assignedTo: "জুনিয়র অ্যাডভোকেট তানভীর আহমেদ",
    assignedBy: "ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    priority: "HIGH",
    status: "IN_PROGRESS",
    notes: "দণ্ডবিধির ৩২৬ ও ৩০৭ ধারার উপাদান অন্তর্ভুক্ত করবেন।",
    createdAt: new Date().toISOString(),
  };

  const demoTask2: TaskRecord = {
    id: "task-002",
    title: "ডিএইচএমসি ইনজুরি সার্টিফিকেট ও কোর্ট ডায়েরি (CD) নকল উত্তোলন",
    caseId: demoCaseId,
    caseTitle: "বাসায় হামলা ও ভাঙচুর — করিম মিয়া",
    assignedTo: "মো. খোরশেদ আলম (প্রধান ক্লার্ক / মুহুরি)",
    assignedBy: "ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)",
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    priority: "HIGH",
    status: "TODO",
    notes: "আদালতের নকলখানা থেকে ৩ কপি সার্টিফাইড নকল তুলবেন।",
    createdAt: new Date().toISOString(),
  };

  const demoTrustAccount: TrustAccountRecord = {
    id: "trust-001",
    clientId: demoClientId,
    clientName: "মো. আব্দুল করিম",
    caseId: demoCaseId,
    totalDeposited: 50000,
    totalDisbursed: 15000,
    balance: 35000,
    transactions: [
      {
        id: "tx-001",
        date: new Date(Date.now() - 5 * 86400000).toISOString(),
        type: "DEPOSIT",
        amount: 50000,
        purpose: "মামলা পরিচালনা ও কোর্ট ফি বাবদ অগ্রিম রিটেইনার ফি জমা",
        voucherRef: "VR-2026-081",
      },
      {
        id: "tx-002",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        type: "DISBURSEMENT",
        amount: 15000,
        purpose: "আদালত ফি, প্রসেস সার্ভার খরচ ও ওকালতনামা স্ট্যাম্প ক্রয়",
        voucherRef: "VR-2026-094",
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const demoPrecedents: PrecedentRecord[] = [
    {
      id: "prec-001",
      citation: "54 DLR (AD) 124",
      court: "Supreme Court (Appellate Division)",
      parties: "Abdul Latif vs. The State",
      subject: "Criminal Trespass with deadly weapon & ingredients of Section 452 Penal Code",
      ratioDecidendiBn: "অনধিকার গৃহপ্রবেশকালে মারাত্মক অস্ত্রের উপস্থিতি ও ভীতি প্রদর্শনের প্রস্তুতি প্রমাণিত হইলে জামিন-অযোগ্য ধারা ৪৫২ পূর্ণাঙ্গভাবে প্রযোজ্য হইবে।",
      year: 2002,
    },
    {
      id: "prec-002",
      citation: "18 BLC 240",
      court: "Supreme Court (High Court Division)",
      parties: "Standard Bank Ltd. vs. Rahim Textile Mills",
      subject: "Cheque Dishonour under Section 138 of NI Act & 30-Day Mandatory Statutory Notice",
      ratioDecidendiBn: "ব্যাংক মেমো স্লিপ প্রাপ্তির ৩০ দিনের মধ্যে রেজিস্ট্রি ডাকযোগে নোটিশ প্রেরণের আইনি প্রমাণ ছাড়া এনআই অ্যাক্টের ১৩৮ ধারায় মামলা অগ্রহণযোগ্য।",
      year: 2013,
    },
    {
      id: "prec-003",
      citation: "62 DLR 450",
      court: "Supreme Court (High Court Division)",
      parties: "Begum vs. Chowdhury",
      subject: "Specific Relief Act Section 42 & 54: Title Declaration and Mandatory Injunction",
      ratioDecidendiBn: "শান্তিপূর্ণ ভোগদখলে বিঘ্ন সৃষ্টি ও সীমানা প্রাচীর ভাঙার স্পষ্ট হুমকি থাকিলে দেওয়ানি কার্যবিধির অর্ডার ৩৯ রুল ১-২ অনুযায়ী তাৎক্ষণিক স্থিতাবস্থা মঞ্জুরযোগ্য।",
      year: 2010,
    },
    {
      id: "prec-004",
      citation: "21 BLC (AD) 89",
      court: "Supreme Court (Appellate Division)",
      parties: "State vs. Joynal Abedin & Others",
      subject: "Distinction between Penal Code Section 307 (Attempt to Murder) and Section 326 (Grievous Hurt)",
      ratioDecidendiBn: "সংবেদনশীল অঙ্গ যেমন মাথায় ধারালো অস্ত্র দ্বারা আঘাত ও হাড়ের জখম সৃষ্টি করিলে আসামির প্রাণনাশের স্পষ্ট অভিপ্রায় অনুমান করা যায় এবং ধারা ৩০৭ প্রযুক্ত হইবে।",
      year: 2016,
    },
  ];

  const seedState: DatabaseState = {
    users: {
      [demoUserId]: demoUser,
      [demoJuniorUser.id]: demoJuniorUser,
      [demoOwnerId]: demoOwnerUser,
    },
    chambers: { [demoChamberId]: demoChamber },
    cases: {
      [demoCaseId]: demoCase,
      "case-1793702172465": demoCivilCase,
    },
    clients: {
      [demoClientId]: demoClient,
      "client-002": demoClient2,
    },
    tasks: {
      "task-001": demoTask1,
      "task-002": demoTask2,
    },
    trustAccounts: {
      "trust-001": demoTrustAccount,
    },
    precedents: demoPrecedents,
    auditLogs: [
      {
        id: "audit-001",
        userId: demoUserId,
        action: "CASE_CREATED",
        metadata: { caseId: demoCaseId, title: demoCase.title },
        createdAt: new Date().toISOString(),
      },
    ],
    payments: [
      {
        id: "pay-001",
        userId: demoUserId,
        amount: 2500,
        method: "bKash",
        trxId: "BKH9283741X",
        status: "COMPLETED",
        plan: "PRO",
        createdAt: new Date().toISOString(),
      },
    ],
    notifications: {},
    lawSections: [],
  };

  saveState(seedState);
  return seedState;
}

// Global cached state in Node memory
let globalState: DatabaseState | null = null;

function getState(): DatabaseState {
  if (!globalState) {
    globalState = loadState();
  }
  return globalState;
}

export function reloadDatabaseState(): DatabaseState {
  globalState = loadState();
  return globalState;
}

export const db = {
  // Case operations
  getCases: async (userId?: string): Promise<CaseRecord[]> => {
    const s = getState();
    const cases = Object.values(s.cases);
    if (!userId) return cases;
    return cases.filter((c) => c.userId === userId || !c.userId);
  },

  getCaseById: async (id: string): Promise<CaseRecord | null> => {
    const s = getState();
    return s.cases[id] || null;
  },

  createCase: async (c: CaseRecord): Promise<CaseRecord> => {
    const s = getState();
    s.cases[c.id] = c;
    saveState(s);
    return c;
  },

  updateCase: async (id: string, updates: Partial<CaseRecord>): Promise<CaseRecord | null> => {
    const s = getState();
    const existing = s.cases[id];
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    s.cases[id] = updated;
    saveState(s);
    return updated;
  },

  deleteCase: async (id: string): Promise<boolean> => {
    const s = getState();
    if (s.cases[id]) {
      delete s.cases[id];
      saveState(s);
      return true;
    }
    return false;
  },

  // Document operations
  saveDocument: async (caseId: string, doc: GeneratedDocItem): Promise<GeneratedDocItem> => {
    const s = getState();
    const c = s.cases[caseId];
    if (c) {
      const idx = c.documents.findIndex((d) => d.id === doc.id || d.docType === doc.docType);
      if (idx >= 0) {
        c.documents[idx] = { ...doc, updatedAt: new Date().toISOString() };
      } else {
        c.documents.push(doc);
      }
      c.updatedAt = new Date().toISOString();
      saveState(s);
    }
    return doc;
  },

  // Hearing operations
  getHearings: async (caseId: string): Promise<HearingItem[]> => {
    const s = getState();
    const c = s.cases[caseId];
    if (!c || !c.hearings) return [];
    return [...c.hearings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  addHearing: async (caseId: string, hearing: HearingItem): Promise<HearingItem> => {
    const s = getState();
    const c = s.cases[caseId];
    if (c) {
      if (!c.hearings) c.hearings = [];
      c.hearings.push(hearing);
      // If hearing date is in future or later than current nextHearingDate, update case
      const hearingTime = new Date(hearing.date).getTime();
      const now = Date.now();
      if (hearingTime >= now) {
        c.nextHearingDate = hearing.date;
      }
      c.updatedAt = new Date().toISOString();
      saveState(s);
    }
    return hearing;
  },

  updateHearing: async (
    caseId: string,
    hearingId: string,
    updates: Partial<HearingItem>
  ): Promise<HearingItem | null> => {
    const s = getState();
    const c = s.cases[caseId];
    if (!c || !c.hearings) return null;
    const idx = c.hearings.findIndex((h) => h.id === hearingId);
    if (idx < 0) return null;
    c.hearings[idx] = { ...c.hearings[idx], ...updates };
    c.updatedAt = new Date().toISOString();
    saveState(s);
    return c.hearings[idx];
  },

  deleteHearing: async (caseId: string, hearingId: string): Promise<boolean> => {
    const s = getState();
    const c = s.cases[caseId];
    if (!c || !c.hearings) return false;
    const initialLen = c.hearings.length;
    c.hearings = c.hearings.filter((h) => h.id !== hearingId);
    if (c.hearings.length === initialLen) return false;
    c.updatedAt = new Date().toISOString();
    saveState(s);
    return true;
  },

  getUpcomingHearings: async (
    days = 30
  ): Promise<Array<HearingItem & { caseTitle: string; caseNumber?: string | null; courtName?: string | null }>> => {
    const s = getState();
    const now = Date.now();
    const threshold = now + days * 24 * 60 * 60 * 1000;
    const result: Array<HearingItem & { caseTitle: string; caseNumber?: string | null; courtName?: string | null }> = [];

    for (const c of Object.values(s.cases)) {
      if (!c.hearings) continue;
      for (const h of c.hearings) {
        const hTime = new Date(h.date).getTime();
        if (hTime >= now && hTime <= threshold) {
          result.push({
            ...h,
            caseTitle: c.title,
            caseNumber: c.caseNumber,
            courtName: c.courtName,
          });
        }
      }
    }
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  // Evidence file operations
  getEvidence: async (caseId: string): Promise<EvidenceFileItem[]> => {
    const s = getState();
    const c = s.cases[caseId];
    if (!c || !c.evidenceFiles) return [];
    return [...c.evidenceFiles]
      .map((ev) => ({
        ...ev,
        sizeBytes: typeof ev.sizeBytes === "number" ? ev.sizeBytes : 245800,
        factMapping: ev.factMapping || {},
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  addEvidence: async (caseId: string, ev: EvidenceFileItem): Promise<EvidenceFileItem> => {
    const s = getState();
    const c = s.cases[caseId];
    if (c) {
      if (!c.evidenceFiles) c.evidenceFiles = [];
      c.evidenceFiles.push(ev);
      c.updatedAt = new Date().toISOString();
      saveState(s);
    }
    return ev;
  },

  updateEvidence: async (
    caseId: string,
    evidenceId: string,
    updates: Partial<EvidenceFileItem>
  ): Promise<EvidenceFileItem | null> => {
    const s = getState();
    const c = s.cases[caseId];
    if (!c || !c.evidenceFiles) return null;
    const idx = c.evidenceFiles.findIndex((e) => e.id === evidenceId);
    if (idx < 0) return null;
    c.evidenceFiles[idx] = { ...c.evidenceFiles[idx], ...updates };
    c.updatedAt = new Date().toISOString();
    saveState(s);
    return c.evidenceFiles[idx];
  },

  deleteEvidence: async (caseId: string, evidenceId: string): Promise<boolean> => {
    const s = getState();
    const c = s.cases[caseId];
    if (!c || !c.evidenceFiles) return false;
    const idx = c.evidenceFiles.findIndex((e) => e.id === evidenceId);
    if (idx < 0) return false;
    c.evidenceFiles.splice(idx, 1);
    c.updatedAt = new Date().toISOString();
    saveState(s);
    return true;
  },

  // Note operations
  addNote: async (caseId: string, note: CaseNoteItem): Promise<CaseNoteItem> => {
    const s = getState();
    const c = s.cases[caseId];
    if (c) {
      if (!c.notes) c.notes = [];
      c.notes.push(note);
      c.updatedAt = new Date().toISOString();
      saveState(s);
    }
    return note;
  },

  // User operations
  getUser: async (id: string): Promise<UserRecord | null> => {
    const s = getState();
    return s.users[id] || Object.values(s.users)[0] || null;
  },

  getUserByEmail: async (email: string): Promise<UserRecord | null> => {
    const s = getState();
    const cleanEmail = email.toLowerCase().trim();
    return Object.values(s.users).find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  getAllUsers: async (): Promise<UserRecord[]> => {
    const s = getState();
    return Object.values(s.users);
  },

  updateUser: async (userId: string, updates: Partial<UserRecord>): Promise<UserRecord | null> => {
    const s = getState();
    const u = s.users[userId] || Object.values(s.users).find(x => x.id === userId);
    if (u) {
      const updated = { ...u, ...updates };
      s.users[u.id] = updated;
      saveState(s);
      return updated;
    }
    return null;
  },

  getCustomPrompts: async (): Promise<{ interviewerPrompt: string; drafterPrompt: string } | null> => {
    const s = getState();
    return s.customPrompts || null;
  },

  saveCustomPrompts: async (prompts: { interviewerPrompt: string; drafterPrompt: string }): Promise<void> => {
    const s = getState();
    s.customPrompts = prompts;
    saveState(s);
  },

  updateUserPlan: async (userId: string, plan: "FREE" | "PRO" | "CHAMBER"): Promise<UserRecord | null> => {
    const s = getState();
    const u = s.users[userId] || Object.values(s.users)[0];
    if (u) {
      u.plan = plan;
      saveState(s);
      return u;
    }
    return null;
  },

  updateUserCredits: async (id: string, delta: number): Promise<UserRecord | null> => {
    const s = getState();
    const u = s.users[id] || Object.values(s.users)[0];
    if (u) {
      u.creditsUsed += delta;
      saveState(s);
      return u;
    }
    return null;
  },

  // Audit Logs
  logAudit: async (userId: string, action: string, metadata: Record<string, unknown> = {}) => {
    const s = getState();
    const entry: AuditLogRecord = {
      id: "audit-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      userId,
      action,
      metadata,
      createdAt: new Date().toISOString(),
    };
    s.auditLogs.unshift(entry);
    saveState(s);
    return entry;
  },

  getAuditLogs: async (): Promise<AuditLogRecord[]> => {
    const s = getState();
    return s.auditLogs;
  },

  // Chamber Operations
  getChambers: async (): Promise<ChamberRecord[]> => {
    const s = getState();
    return Object.values(s.chambers);
  },

  getChamber: async (chamberId: string): Promise<ChamberRecord | null> => {
    const s = getState();
    return s.chambers[chamberId] || null;
  },

  getChamberUsers: async (chamberId: string): Promise<UserRecord[]> => {
    const s = getState();
    return Object.values(s.users).filter((u) => u.chamberId === chamberId);
  },

  updateChamber: async (chamberId: string, updates: Partial<ChamberRecord>): Promise<ChamberRecord | null> => {
    const s = getState();
    const existing = s.chambers[chamberId];
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    s.chambers[chamberId] = updated;
    saveState(s);
    return updated;
  },

  inviteJuniorToChamber: async (
    chamberId: string,
    email: string,
    fullName: string
  ): Promise<UserRecord> => {
    const s = getState();
    const existingUser = Object.values(s.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      existingUser.chamberId = chamberId;
      existingUser.role = "JUNIOR";
      saveState(s);
      return existingUser;
    }
    const newJunior: UserRecord = {
      id: `user-junior-${Date.now()}`,
      fullName,
      email: email.toLowerCase().trim(),
      password: "legal123",
      phone: "01700000000",
      courtStation: "ঢাকা জজ কোর্ট",
      chamberName: s.chambers[chamberId]?.name || "চেম্বার",
      isAdmin: false,
      role: "JUNIOR",
      chamberId,
      plan: "FREE",
      creditsUsed: 0,
      createdAt: new Date().toISOString(),
    };
    s.users[newJunior.id] = newJunior;
    saveState(s);
    return newJunior;
  },

  // Platform Super Admin Operations
  getPlatformStats: async () => {
    const s = getState();
    const chambersList = Object.values(s.chambers);
    const usersList = Object.values(s.users);
    const casesList = Object.values(s.cases);
    const paymentsList = s.payments || [];

    const totalRevenue = paymentsList
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    let totalDocuments = 0;
    for (const c of casesList) {
      if (c.documents && Array.isArray(c.documents)) {
        totalDocuments += c.documents.length;
      }
    }

    const totalCredits = usersList.reduce((sum, u) => sum + (u.creditsUsed || 0), 0);
    const totalAiTokensUsed = totalCredits * 1250;

    const chambersWithMeta = chambersList.map((ch) => {
      const chamberUsers = usersList.filter((u) => u.chamberId === ch.id);
      const chamberCases = casesList.filter((c) => c.chamberId === ch.id || c.userId === ch.ownerId);
      return {
        ...ch,
        totalUsers: chamberUsers.length,
        totalCases: chamberCases.length,
      };
    });

    return {
      totalChambers: chambersList.length,
      totalUsers: usersList.length,
      totalCases: casesList.length,
      totalRevenue,
      totalDocuments,
      totalAiTokensUsed,
      chambers: chambersWithMeta,
      recentPayments: paymentsList.slice(0, 10),
      recentAuditLogs: s.auditLogs.slice(0, 10),
    };
  },

  // Payments
  addPayment: async (payment: PaymentRecord): Promise<PaymentRecord> => {
    const s = getState();
    s.payments.unshift(payment);
    saveState(s);
    return payment;
  },

  getPayments: async (): Promise<PaymentRecord[]> => {
    const s = getState();
    return s.payments;
  },

  // Client Management
  getClients: async (): Promise<ClientRecord[]> => {
    const s = getState();
    return Object.values(s.clients || {});
  },

  getClientById: async (id: string): Promise<ClientRecord | null> => {
    const s = getState();
    return s.clients?.[id] || null;
  },

  createClient: async (client: Omit<ClientRecord, "id" | "createdAt">): Promise<ClientRecord> => {
    const s = getState();
    s.clients = s.clients || {};
    const newId = "client-" + Date.now();
    const newClient: ClientRecord = {
      ...client,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    s.clients[newId] = newClient;
    saveState(s);
    return newClient;
  },

  // Task Delegation
  getTasks: async (): Promise<TaskRecord[]> => {
    const s = getState();
    return Object.values(s.tasks || {});
  },

  createTask: async (task: Omit<TaskRecord, "id" | "createdAt">): Promise<TaskRecord> => {
    const s = getState();
    s.tasks = s.tasks || {};
    const newId = "task-" + Date.now();
    const newTask: TaskRecord = {
      ...task,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    s.tasks[newId] = newTask;
    saveState(s);
    return newTask;
  },

  updateTaskStatus: async (taskId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED"): Promise<TaskRecord | null> => {
    const s = getState();
    if (s.tasks && s.tasks[taskId]) {
      s.tasks[taskId].status = status;
      saveState(s);
      return s.tasks[taskId];
    }
    return null;
  },

  // Trust Accounts (IOLTA)
  getTrustAccounts: async (): Promise<TrustAccountRecord[]> => {
    const s = getState();
    return Object.values(s.trustAccounts || {});
  },

  addTrustTransaction: async (
    trustAccountId: string,
    tx: { type: "DEPOSIT" | "DISBURSEMENT"; amount: number; purpose: string; voucherRef?: string }
  ): Promise<TrustAccountRecord | null> => {
    const s = getState();
    const acc = s.trustAccounts?.[trustAccountId];
    if (!acc) return null;
    const newTx: TrustTransaction = {
      id: "tx-" + Date.now(),
      date: new Date().toISOString(),
      ...tx,
    };
    acc.transactions.unshift(newTx);
    if (tx.type === "DEPOSIT") {
      acc.totalDeposited += tx.amount;
      acc.balance += tx.amount;
    } else {
      acc.totalDisbursed += tx.amount;
      acc.balance -= tx.amount;
    }
    saveState(s);
    return acc;
  },

  // Precedents & Legal Research
  getPrecedents: async (): Promise<PrecedentRecord[]> => {
    const s = getState();
    return s.precedents || [];
  },

  searchPrecedents: async (query: string): Promise<PrecedentRecord[]> => {
    const s = getState();
    const q = (query || "").toLowerCase().trim();
    if (!q) return s.precedents || [];
    return (s.precedents || []).filter(
      (p) =>
        p.citation.toLowerCase().includes(q) ||
        p.parties.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.ratioDecidendiBn.toLowerCase().includes(q)
    );
  },

  // Conflict of Interest Ethics Checker
  checkConflict: async (searchQuery: string): Promise<{
    hasConflict: boolean;
    conflicts: Array<{
      type: "CURRENT_CLIENT" | "OPPOSING_PARTY" | "OPPOSING_COUNSEL" | "ACCUSED" | "WITNESS";
      caseId: string;
      caseTitle: string;
      matchedName: string;
      roleBn: string;
      ethicalAdviceBn: string;
    }>;
  }> => {
    const s = getState();
    const q = (searchQuery || "").toLowerCase().trim();
    if (!q || q.length < 2) return { hasConflict: false, conflicts: [] };

    const conflicts: Array<{
      type: "CURRENT_CLIENT" | "OPPOSING_PARTY" | "OPPOSING_COUNSEL" | "ACCUSED" | "WITNESS";
      caseId: string;
      caseTitle: string;
      matchedName: string;
      roleBn: string;
      ethicalAdviceBn: string;
    }> = [];

    // Check existing clients
    for (const client of Object.values(s.clients || {})) {
      if (client.fullName.toLowerCase().includes(q) || (client.phone && client.phone.includes(q))) {
        conflicts.push({
          type: "CURRENT_CLIENT",
          caseId: client.cases[0] || "general",
          caseTitle: "চেম্বারের সংরক্ষিত বর্তমান ক্লায়েন্ট ফাইল",
          matchedName: client.fullName,
          roleBn: "বর্তমান নথিবদ্ধ মক্কেল",
          ethicalAdviceBn: "বাংলাদেশ বার কাউন্সিল ক্যাননস অফ প্রফেশনাল কন্ডাক্ট অনুযায়ী একই পক্ষের বিপক্ষে কোনো নতুন মোকদ্দমায় প্রতিনিধিত্ব করা গুরুতর পেশাগত অসদাচরণ।",
        });
      }
    }

    // Check existing cases (opposing counsel, accused, complainants)
    for (const c of Object.values(s.cases || {})) {
      if (c.opposingCounsel && c.opposingCounsel.toLowerCase().includes(q)) {
        conflicts.push({
          type: "OPPOSING_COUNSEL",
          caseId: c.id,
          caseTitle: c.title,
          matchedName: c.opposingCounsel,
          roleBn: "প্রতিপক্ষের নিযুক্তীয় আইনজীবী",
          ethicalAdviceBn: "উক্ত ব্যক্তি অন্য মামলায় আপনার প্রতিপক্ষের বিজ্ঞ আইনজীবী। নৈতিক কারণে ও পেশাগত নিরপেক্ষতা বজায় রাখতে বিষয়টি পর্যালোচনা আবশ্যক।",
        });
      }

      if (c.extractedFacts?.accusedList) {
        for (const accused of c.extractedFacts.accusedList) {
          if (accused.toLowerCase().includes(q)) {
            conflicts.push({
              type: "ACCUSED",
              caseId: c.id,
              caseTitle: c.title,
              matchedName: accused,
              roleBn: "চলমান মামলার চিহ্নিত আসামি/বিবাদী",
              ethicalAdviceBn: "চলমান মামলার আসামিপক্ষে বা বাদীর বিপক্ষে নতুনভাবে নিয়োগগ্রহণ এথিক্যাল স্বার্থের সংঘাত (Conflict of Interest) তৈরি করবে।",
            });
          }
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  },

  // Notification operations
  getNotifications: async (caseId?: string): Promise<NotificationLogRecord[]> => {
    const s = getState();
    const list = Object.values(s.notifications || {});
    if (!caseId) return list;
    return list.filter((n) => n.caseId === caseId);
  },

  createNotificationLog: async (
    log: Omit<NotificationLogRecord, "id" | "createdAt" | "sentAt"> & {
      id?: string;
      createdAt?: string;
      sentAt?: string;
    }
  ): Promise<NotificationLogRecord> => {
    const s = getState();
    if (!s.notifications) s.notifications = {};
    const now = new Date().toISOString();
    const record: NotificationLogRecord = {
      ...log,
      id: log.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sentAt: log.sentAt || now,
      createdAt: log.createdAt || now,
    };
    s.notifications[record.id] = record;
    saveState(s);
    return record;
  },
};
