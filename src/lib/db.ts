import fs from "fs";
import path from "path";
import { CaseRecord, GeneratedDocItem, HearingItem, EvidenceFileItem, CaseNoteItem } from "./ai/schemas";
import { generateMockCaseAnalysis } from "./ai/mock";
import { generateFirTemplate, generateCrPetitionTemplate, generateBailPetitionTemplate } from "./templates/bdCourtTemplates";

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  barCouncilId?: string;
  barAssociation?: string;
  courtStation: string;
  role: "OWNER" | "ADVOCATE" | "JUNIOR" | "ASSISTANT";
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

interface DatabaseState {
  users: Record<string, UserRecord>;
  chambers: Record<string, ChamberRecord>;
  cases: Record<string, CaseRecord>;
  auditLogs: AuditLogRecord[];
  payments: PaymentRecord[];
  lawSections: LawSectionItem[];
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
        return JSON.parse(raw);
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

  const demoUser: UserRecord = {
    id: demoUserId,
    fullName: "ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)",
    email: "advocate@demo.bd",
    password: "legal123",
    phone: "01711000000",
    barCouncilId: "BC/DH/2014/8942",
    barAssociation: "ঢাকা আইনজীবী সমিতি ও সুপ্রিম কোর্ট বার",
    courtStation: "ঢাকা জজ কোর্ট ও সুপ্রিম কোর্ট",
    role: "ADVOCATE",
    chamberId: demoChamberId,
    plan: "PRO",
    creditsUsed: 12,
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

  const seedState: DatabaseState = {
    users: { [demoUserId]: demoUser },
    chambers: { [demoChamberId]: demoChamber },
    cases: { [demoCaseId]: demoCase },
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
    const idx = c.hearings.findIndex((h) => h.id === hearingId);
    if (idx < 0) return false;
    c.hearings.splice(idx, 1);
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
};
