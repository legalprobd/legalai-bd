export type LimitationRule = {
  caseType: string;
  lawBn: string;
  sectionBn: string;
  periodDays: number; // 0 = no fixed deadline
  triggerEventBn: string;
  notesBn: string;
};

export const LIMITATION_RULES: Record<string, LimitationRule> = {
  CIVIL_POSSESSION_RECOVERY: {
    caseType: "CIVIL_POSSESSION_RECOVERY",
    lawBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
    sectionBn: "ধারা ৯",
    periodDays: 180,
    triggerEventBn: "জোরপূর্বক দখলচ্যুতি হওয়ার তারিখ",
    notesBn: "দখলচ্যুতির ৬ মাসের মধ্যে মামলা করতে হবে। ৬ মাস অতিক্রান্ত হলে স্বত্ব প্রমাণের নিয়মিত মোকদ্দমা করতে হবে।",
  },
  CIVIL_DECLARATION_TITLE: {
    caseType: "CIVIL_DECLARATION_TITLE",
    lawBn: "তামাদি আইন, ১৯০৮",
    sectionBn: "Article 120 / 113",
    periodDays: 1095,
    triggerEventBn: "স্বত্ব অস্বীকার বা বিরোধ সৃষ্টির তারিখ",
    notesBn: "স্বত্ব অস্বীকারের কারণ উদ্ভবের ৩ (তিন) বছরের মধ্যে স্বত্ব ঘোষণার মামলা দায়ের আবশ্যক।",
  },
  CIVIL_MONEY_SUIT: {
    caseType: "CIVIL_MONEY_SUIT",
    lawBn: "তামাদি আইন, ১৯০৮",
    sectionBn: "Article 113 / 64",
    periodDays: 1095,
    triggerEventBn: "ঋণ বা অর্থ পরিশোধের নির্ধারিত তারিখ",
    notesBn: "চুক্তিভঙ্গ বা ঋণ পরিশোধের শেষ তারিখ হতে ৩ বছরের মধ্যে মানি সুট করতে হবে।",
  },
  CRIMINAL_FIR: {
    caseType: "CRIMINAL_FIR",
    lawBn: "ফৌজদারি কার্যবিধি, ১৮৯৮",
    sectionBn: "ধারা ১৫৪",
    periodDays: 0,
    triggerEventBn: "অপরাধ সংঘটনের তারিখ ও সময়",
    notesBn: "ফৌজদারি মামলায় কোনো নির্দিষ্ট তামাদি নেই; তবে অযথা বিলম্ব হলে এজাহারে যৌক্তিক কারণ দর্শাতে হবে।",
  },
  HUMANITARIAN_EMERGENCY_RESCUE: {
    caseType: "HUMANITARIAN_EMERGENCY_RESCUE",
    lawBn: "পুলিশ আইন, ১৮৬১ ও সংবিধান",
    sectionBn: "ধারা ৪৪ / অনুচ্ছেদ ৩২",
    periodDays: 0,
    triggerEventBn: "বিপন্ন ব্যক্তির সন্ধান বা উদ্ধারের প্রয়োজনীয়তা দেখা দেওয়ার সময়",
    notesBn: "জরুরি মানবিক উদ্ধার ও চিকিৎসাসেবা নিশ্চিতকরণে তামাদির কোনো বাধা নেই; জীবনের সুরক্ষায় তাৎক্ষণিক পদক্ষেপ গ্রহণ আইনত আবশ্যক।",
  },
  PUBLIC_NUISANCE_GD: {
    caseType: "PUBLIC_NUISANCE_GD",
    lawBn: "ফৌজদারি কার্যবিধি ও ধূমপান আইন",
    sectionBn: "ধারা ১৩৩ / ২৯০",
    periodDays: 0,
    triggerEventBn: "উপদ্রব বা শব্দদূষণের চলমান ঘটনা",
    notesBn: "গণউপদ্রব একটি চলমান অপরাধ (Continuing Offence); ঘটনা ঘটার সাথে সাথে সাধারণ ডায়েরি ও নির্বাহী ম্যাজিস্ট্রেট বরাবরে প্রতিকার চাওয়া যায়।",
  },
  NI_ACT_138_NOTICE: {
    caseType: "NI_ACT_138_NOTICE",
    lawBn: "এনআই অ্যাক্ট, ১৮৮১",
    sectionBn: "ধারা ১৩৮(খ)",
    periodDays: 30,
    triggerEventBn: "ব্যাংক থেকে চেক ডিজঅনার মেমো প্রাপ্তির তারিখ",
    notesBn: "ডিজঅনার মেমো প্রাপ্তির ৩০ (ত্রিশ) দিনের মধ্যে লিখিত লিগ্যাল নোটিশ প্রদান বাধ্যতামূলক।",
  },
  NI_ACT_138_FILING: {
    caseType: "NI_ACT_138_FILING",
    lawBn: "এনআই অ্যাক্ট, ১৮৮১",
    sectionBn: "ধারা ১৩৮(গ)",
    periodDays: 30,
    triggerEventBn: "লিগ্যাল নোটিশ জারির ৩০ দিন মেয়াদ শেষের তারিখ",
    notesBn: "নোটিশ গ্রহণের ৩০ দিন অতিবাহিত হওয়ার পর পরবর্তী ৩০ দিনের মধ্যে বিজ্ঞ আদালতে নালিশি মামলা দায়ের করতে হবে।",
  },
  NARI_SHISHU_COMPLAINT: {
    caseType: "NARI_SHISHU_COMPLAINT",
    lawBn: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০",
    sectionBn: "ধারা ১১/৩০",
    periodDays: 0,
    triggerEventBn: "সর্বশেষ নির্যাতন বা অপরাধের তারিখ",
    notesBn: "তামাদির নির্দিষ্ট বাধা নেই; তবে দ্রুত মেডিকেল সার্টিফিকেট সংগ্রহ ও থানায়/ট্রাইব্যুনালে দাখিল জরুরি।",
  },
  CIVIL_APPEAL: {
    caseType: "CIVIL_APPEAL",
    lawBn: "দেওয়ানি কার্যবিধি, ১৯০৮",
    sectionBn: "Order 41 Rule 1 / তামাদি আইন Art 152",
    periodDays: 90,
    triggerEventBn: "ডিক্রি বা আদেশের নকল প্রাপ্তির তারিখ",
    notesBn: "রায়ের ডিক্রি জারির ৯০ দিনের মধ্যে বিজ্ঞ জেলা জজ আদালতে আপিল দায়ের করতে হবে।",
  },
  CRIMINAL_APPEAL: {
    caseType: "CRIMINAL_APPEAL",
    lawBn: "ফৌজদারি কার্যবিধি, ১৮৯৮",
    sectionBn: "ধারা ৪০৮ / তামাদি আইন Art 154",
    periodDays: 60,
    triggerEventBn: "দণ্ডাদেশ বা রায়ের তারিখ",
    notesBn: "বিজ্ঞ ম্যাজিস্ট্রেট আদালতের দণ্ডাদেশের বিরুদ্ধে ৬০ দিনের মধ্যে সেশন জজ আদালতে আপিল করতে হবে।",
  },
};

export type LimitationCalculation = {
  caseType: string;
  lawBn: string;
  sectionBn: string;
  triggerDate: string; // ISO string
  deadline: string | null; // ISO string or null
  daysRemaining: number | null;
  isExpired: boolean;
  status: "SAFE" | "APPROACHING" | "CRITICAL" | "EXPIRED" | "NO_DEADLINE";
  statusBn: string;
  notesBn: string;
  NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION: boolean;
};

/**
 * Checks if a date falls on a weekend (Friday or Saturday in Bangladesh)
 * or a recognized statutory court holiday.
 */
export function isCourtHolidayOrWeekend(date: Date): boolean {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  if (day === 5 || day === 6) {
    return true;
  }

  // Known statutory Bangladesh court / public holidays (month is 0-indexed)
  const month = date.getMonth();
  const dayOfMonth = date.getDate();
  const fixedHolidays = [
    { m: 1, d: 21 }, // Feb 21 - Martyrs' Day
    { m: 2, d: 17 }, // Mar 17 - Bangabandhu Birthday
    { m: 2, d: 26 }, // Mar 26 - Independence Day
    { m: 3, d: 14 }, // Apr 14 - Pahela Baishakh
    { m: 4, d: 1 },  // May 1 - May Day
    { m: 7, d: 15 }, // Aug 15 - National Mourning Day
    { m: 11, d: 16 },// Dec 16 - Victory Day
    { m: 11, d: 25 },// Dec 25 - Christmas
  ];

  return fixedHolidays.some((h) => h.m === month && h.d === dayOfMonth);
}

export function calculateDeadline(
  caseType: string,
  triggerDateInput: Date | string,
  nowInput?: Date
): LimitationCalculation {
  const rule = LIMITATION_RULES[caseType] || {
    caseType,
    lawBn: "আইন নির্ধারিত তামাদি",
    sectionBn: "সাধারণ বিধান",
    periodDays: 0,
    triggerEventBn: "ঘটনার তারিখ",
    notesBn: "কোনো নির্দিষ্ট তামাদি নেই অথবা বিশেষ আইনের বিধান প্রযোজ্য।",
  };

  const triggerDate = typeof triggerDateInput === "string" ? new Date(triggerDateInput) : triggerDateInput;
  const now = nowInput || new Date();

  if (rule.periodDays === 0) {
    const statusText =
      rule.caseType === "HUMANITARIAN_EMERGENCY_RESCUE"
        ? "জরুরি মানবিক পদক্ষেপ (কোনো তামাদি নেই - তাৎক্ষণিক উদ্ধার আবশ্যক)"
        : rule.caseType === "PUBLIC_NUISANCE_GD"
        ? "চলমান গণউপদ্রব (কোনো তামাদি নেই - তাৎক্ষণিক প্রতিকার আবশ্যক)"
        : "কোনো নির্দিষ্ট তামাদি নেই (বিলম্বের কারণ দর্শাতে হবে)";

    return {
      caseType: rule.caseType,
      lawBn: rule.lawBn,
      sectionBn: rule.sectionBn,
      triggerDate: triggerDate.toISOString(),
      deadline: null,
      daysRemaining: null,
      isExpired: false,
      status: "NO_DEADLINE",
      statusBn: statusText,
      notesBn: rule.notesBn,
      NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION: false,
    };
  }

  const deadline = new Date(triggerDate.getTime() + rule.periodDays * 24 * 60 * 60 * 1000);
  const diffMs = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining < 0;

  // Constraint 4: If calculated deadline falls on Friday/Saturday or court holiday,
  // DO NOT auto-extend it. Flag for lawyer review instead.
  const isHolidayOrWeekend = isCourtHolidayOrWeekend(deadline);
  const needsHolidayExtensionReview = isHolidayOrWeekend;

  let status: LimitationCalculation["status"] = "SAFE";
  let statusBn = `নিরাপদ (${daysRemaining} দিন বাকি)`;

  if (isExpired) {
    status = "EXPIRED";
    statusBn = `তামাদি উত্তীর্ণ (Time-Barred - ${Math.abs(daysRemaining)} দিন পূর্বে)`;
  } else if (daysRemaining <= 7) {
    status = "CRITICAL";
    statusBn = `অত্যন্ত জরুরি (${daysRemaining} দিন বাকি - দ্রুত দাখিল করুন)`;
  } else if (daysRemaining <= 30) {
    status = "APPROACHING";
    statusBn = `সতর্কতা (${daysRemaining} দিন বাকি)`;
  }

  return {
    caseType: rule.caseType,
    lawBn: rule.lawBn,
    sectionBn: rule.sectionBn,
    triggerDate: triggerDate.toISOString(),
    deadline: deadline.toISOString(),
    daysRemaining,
    isExpired,
    status,
    statusBn,
    notesBn: rule.notesBn,
    NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION: needsHolidayExtensionReview,
  };
}
