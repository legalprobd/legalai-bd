import { ApplicableLaw } from "./schemas";
import { OFFENCE_INGREDIENTS } from "@/lib/law/ingredients";

export interface GuardValidationResult {
  valid: boolean;
  warnings: string[];
}

/**
 * 1. Citations guard: Verify every cited law section exists in the official Bangladesh penal/civil acts.
 * If unrecognized, downgrade confidence to LOW and add [যাচাই করুন] marker.
 */
export function verifyCitations(laws: ApplicableLaw[]): ApplicableLaw[] {
  return laws.map((l) => {
    const cleanSection = l.section.replace(/[^0-9a-zA-Z_]/g, "");
    const exists = !!OFFENCE_INGREDIENTS[cleanSection] || !!OFFENCE_INGREDIENTS[l.section];

    if (!exists && !["149", "302", "379", "406", "420", "467", "468", "471"].includes(cleanSection)) {
      return {
        ...l,
        confidence: "LOW" as const,
        titleBn: `${l.titleBn} [যাচাই করুন]`,
        reasoningBn: `${l.reasoningBn} (সতর্কতা: ধারাটি ডেটাবেসে যাচাই করা প্রয়োজন)`,
      };
    }
    return l;
  });
}

/**
 * 2. Bangla character enforcement guard: Check that output strings contain authentic Bengali Unicode.
 */
export function enforceBangla(text: string): boolean {
  if (!text) return false;
  return /[\u0980-\u09FF]/.test(text);
}

/**
 * 3. Placeholder enforcement: Any missing or placeholder text must have bold bracket formatting **[...]**
 */
export function enforcePlaceholders(html: string): string {
  // If already bold formatted like **[...]**, do not double-wrap
  return html.replace(/(?:\*\*)?\[([^\]]+)\](?:\*\*)?/g, (_match, p1) => {
    return `**[${p1.trim()}]**`;
  });
}

/**
 * 4. Contradiction detector: Compares previous answers and statements with newly entered answers.
 */
export function detectContradictions(
  facts: Record<string, unknown>,
  newAnswers: Record<string, string>
): string[] {
  const contradictions: string[] = [];

  const statementText = (facts.rawStatement as string || "").toLowerCase();
  const attackerAnswer = (newAnswers["attacker_count"] || "").toLowerCase();
  if (attackerAnswer.includes("১") || attackerAnswer.includes("এক")) {
    if (statementText.includes("লোকজন নিয়ে") || statementText.includes("দলবল") || statementText.includes("সবাই মিলে")) {
      contradictions.push("বক্তব্যে 'লোকজন নিয়ে/দলবল' উল্লেখ আছে, কিন্তু উত্তরে মাত্র ১ জন হামলাকারীর কথা বলা হয়েছে।");
    }
  }

  const weaponAns = (newAnswers["weapon_used"] || "").toLowerCase();
  if (weaponAns.includes("কোনো অস্ত্র ছিল না") || weaponAns.includes("খালি হাতে")) {
    if (statementText.includes("মাথা ফাটিয়ে") || statementText.includes("রক্তাক্ত") || statementText.includes("কুপিয়ে")) {
      contradictions.push("মাথা ফাটার বা রক্তাক্ত জখমের দাবি থাকলেও 'কোনো অস্ত্র ছিল না' উত্তর আসায় বৈপরীত্য রয়েছে। আঘাতের মাধ্যম স্পষ্ট করুন।");
    }
  }

  const timeAns = (newAnswers["incident_time"] || "").toLowerCase();
  if ((timeAns.includes("সকাল") || timeAns.includes("দুপুর")) && statementText.includes("রাতে")) {
    contradictions.push("প্রাথমিক জবানবন্দিতে 'রাতে' বলা হলেও পরবর্তীতে সময় 'সকাল/দুপুর' উল্লেখ করা হয়েছে।");
  }

  return contradictions;
}

/**
 * 5. Token and credit usage guard
 */
export function checkUserCredits(creditsUsed: number, plan: "FREE" | "PRO" | "CHAMBER"): {
  canProceed: boolean;
  warning?: string;
} {
  const limits = {
    FREE: 50,
    PRO: 1000,
    CHAMBER: 10000,
  };
  const limit = limits[plan] || 50;
  const ratio = creditsUsed / limit;

  if (creditsUsed >= limit) {
    return {
      canProceed: false,
      warning: `আপনার অ্যাকাউন্টের লিমিট (${limit} ক্রেডিট) পূর্ণ হয়ে গেছে। অনুগ্রহ করে বিলিং পেইজ থেকে রিচার্জ করুন।`,
    };
  }

  if (ratio >= 0.8) {
    return {
      canProceed: true,
      warning: `সতর্কতা: আপনার প্ল্যানের ৮০% এর বেশি ক্রেডিট ব্যবহৃত হয়েছে (${creditsUsed}/${limit})।`,
    };
  }

  return { canProceed: true };
}

/**
 * 6. Constraint 1: Strict Boolean Gate for addressDisputed
 * Evaluates document readiness or AI gating.
 * Strictly requires the value to be false. If null, undefined, true, or anything else, the gate fails.
 */
export function validateAddressDisputedGate(data: {
  addressDisputed?: boolean | null | unknown;
}): boolean {
  if (data.addressDisputed !== false) {
    return false; // Gate fails
  }
  return true;
}

/**
 * Comprehensive Document Readiness Gate integrating address dispute validation
 */
export function checkDocumentReadiness(data: {
  addressDisputed?: boolean | null | unknown;
  completenessScore?: number;
}): { canProceed: boolean; errorBn?: string } {
  if (data.addressDisputed !== false) {
    return {
      canProceed: false,
      errorBn: "বিবাদীর ঠিকানা সম্পর্কিত বিরোধ নিষ্পত্তিহীন অবস্থায় রয়েছে (addressDisputed must be strictly false)। খসড়া প্রস্তুতের গেট স্থগিত করা হয়েছে।",
    };
  }

  if (data.completenessScore !== undefined && data.completenessScore < 80) {
    return {
      canProceed: false,
      errorBn: "মামলার সম্পূর্ণতা স্কোর পর্যাপ্ত নয়। প্রয়োজনীয় তথ্য সংগ্রহ করুন।",
    };
  }

  return { canProceed: true };
}
