import { z } from "zod";

export const ApplicableLawSchema = z.object({
  actNameBn: z.string().describe("আইনের নাম, যেমন: দণ্ডবিধি, ১৮৬০"),
  section: z.string().describe("ধারা নম্বর, যেমন: ১৪৩/৪৪৮/৩২৩/৩২৫/৩০৭/৩৮০"),
  titleBn: z.string().describe("ধারার মূল অপরাধের নাম"),
  bailableStatusBn: z.string().describe("জামিনযোগ্য বা জামিন-অযোগ্য"),
  punishmentBn: z.string().describe("সর্বোচ্চ শাস্তির বিধান"),
  reasoningBn: z.string().describe("কেন এই ঘটনায় এই ধারাটি প্রযোজ্য এবং কোন তথ্যের ওপর এটি নির্ভরশীল"),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]).default("HIGH"),
});

export const FollowUpQuestionSchema = z.object({
  fieldKey: z.string().describe("Unique identifier like 'incident_time', 'weapon_type', 'medical_report'"),
  questionBn: z.string().describe("ক্লায়েন্টকে করার জন্য স্পষ্ট বাংলা প্রশ্ন"),
  inputType: z.enum(["text", "select", "multiselect"]),
  optionsBn: z.array(z.string()).describe("Quick choice options in Bengali if inputType is select or multiselect"),
  legalImportanceBn: z.string().describe("এই প্রশ্নের উত্তর কেন জরুরি এবং এর ফলে কোন ধারা যুক্ত বা পরিবর্তন হতে পারে"),
});

export const ExtractedFactsSchema = z.object({
  incidentDate: z.string().nullable().default(null),
  incidentTime: z.string().nullable().default(null),
  incidentPlace: z.string().nullable().default(null),
  complainantName: z.string().nullable().default(null),
  complainantDetails: z.string().nullable().default(null),
  accusedList: z.array(z.string()).describe("আসামিদের নাম ও পরিচয়ের তালিকা").default([]),
  unknownAccusedCount: z.string().nullable().default(null),
  weaponsUsed: z.array(z.string()).default([]),
  injuriesAndMedical: z.string().nullable().default(null),
  stolenOrDamagedItems: z.string().nullable().default(null),
  totalFinancialLoss: z.string().nullable().default(null),
  motiveOrPreviousDispute: z.string().nullable().default(null),
  witnesses: z.array(z.string()).default([]),
  policeStationAndDistrict: z.string().nullable().default(null),
});

export const CaseAnalysisResponseSchema = z.object({
  caseTitleBn: z.string().describe("মামলার একটি সংক্ষিপ্ত শিরোনাম"),
  caseCategory: z.enum(["Criminal", "Civil", "Family", "Special_Tribunal"]),
  completenessScore: z.number().min(0).max(100),
  extractedFacts: ExtractedFactsSchema,
  applicableLaws: z.array(ApplicableLawSchema),
  followUpQuestions: z.array(FollowUpQuestionSchema),
  strategicAdviceForAdvocateBn: z.array(z.string()).describe("অ্যাডভোকেটের জন্য গুরুত্বপূর্ণ কৌশলগত পরামর্শ ও প্রমাণ সংগ্রহের চেকলিস্ট"),
  contradictionsDetectedBn: z.array(z.string()).default([]),
});

export const DraftDocTypeEnum = z.enum([
  "FIR",
  "GD",
  "CR_PETITION",
  "BAIL_PETITION",
  "ANTICIPATORY_BAIL",
  "NARAJI",
  "QUASHMENT_561A",
  "REVISION",
  "CRIMINAL_APPEAL",
  "COMPLAINT_DISMISSAL",
  "TIME_PETITION",
  "CROSS_EXAM_QUESTIONS",
  "PLAINT",
  "WRITTEN_STATEMENT",
  "INJUNCTION_TEMP",
  "INJUNCTION_PERMANENT",
  "EXECUTION_PETITION",
  "AFFIDAVIT",
  "POWER_OF_ATTORNEY",
  "VAKALATNAMA",
  "AMENDMENT_PETITION",
  "DIVORCE_PLAINT",
  "DOWER_RECOVERY",
  "MAINTENANCE",
  "CUSTODY",
  "RESTITUTION_CONJUGAL",
  "ARTHA_RIN_PLAINT",
  "ARTHA_RIN_WRITTEN",
  "LABOUR_COMPLAINT",
  "CYBER_COMPLAINT",
  "LEGAL_NOTICE",
  "DAMAGE_INVENTORY",
  "WITNESS_LIST",
  "NAME_CORRECTION_AFFIDAVIT"
]);

export const DraftRequestSchema = z.object({
  docType: DraftDocTypeEnum,
  courtNameBn: z.string().optional(),
  chamberLetterheadUrl: z.string().url().optional(),
  fontMode: z.enum(["unicode", "bijoy"]).default("unicode"),
});

export type ApplicableLaw = z.infer<typeof ApplicableLawSchema>;
export type FollowUpQuestion = z.infer<typeof FollowUpQuestionSchema>;
export type ExtractedFacts = z.infer<typeof ExtractedFactsSchema>;
export type CaseAnalysisResponse = z.infer<typeof CaseAnalysisResponseSchema>;
export type DraftDocType = z.infer<typeof DraftDocTypeEnum>;
export type DraftRequest = z.infer<typeof DraftRequestSchema>;

export interface GeneratedDocItem {
  id: string;
  docType: DraftDocType;
  titleBn: string;
  contentHtml: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface HearingItem {
  id: string;
  caseId: string;
  date: string;
  purpose: string;
  judgeName?: string | null;
  outcomeBn?: string | null;
  orderSheetBn?: string | null;
  nextDate?: string | null;
  createdAt: string;
}

export interface EvidenceFileItem {
  id: string;
  caseId: string;
  fileName: string;
  fileType: string;
  url: string;
  sizeBytes: number;
  factMapping?: Record<string, string> | null;
  ocrTextBn?: string | null;
  uploadedAt: string;
}

export interface CaseNoteItem {
  id: string;
  caseId: string;
  contentBn: string;
  createdAt: string;
}

export interface CaseRecord {
  id: string;
  userId: string;
  chamberId?: string | null;
  title: string;
  category: "Criminal" | "Civil" | "Family" | "Special_Tribunal";
  caseNumber?: string | null;
  courtName?: string | null;
  judgeName?: string | null;
  filingDate?: string | null;
  nextHearingDate?: string | null;
  limitationTriggerDate?: string | null;
  limitationDeadline?: string | null;
  limitationCaseType?: string | null;
  courtFee?: number | null;
  priority: "NORMAL" | "HIGH" | "URGENT";
  clientPhone?: string | null;
  clientNID?: string | null;
  opposingCounsel?: string | null;
  rawStatement: string;
  extractedFacts: ExtractedFacts;
  applicableLaws: ApplicableLaw[];
  completenessScore: number;
  status: "INTERVIEWING" | "READY_TO_DRAFT" | "COMPLETED";
  strategicAdvice: string[];
  contradictionsDetected: string[];
  questions: Array<{
    id: string;
    fieldKey: string;
    questionBn: string;
    inputType: "text" | "select" | "multiselect";
    optionsBn: string[];
    legalImportanceBn: string;
    answerBn: string | null;
    isAnswered: boolean;
  }>;
  documents: GeneratedDocItem[];
  hearings: HearingItem[];
  evidenceFiles: EvidenceFileItem[];
  notes: CaseNoteItem[];
  createdAt: string;
  updatedAt: string;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; messageBn: string; details?: unknown } };
