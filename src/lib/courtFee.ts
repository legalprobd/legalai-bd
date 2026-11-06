export interface CourtFeeCalculationRequest {
  suitType:
    | "MONEY_SUIT"
    | "TITLE_DECLARATION"
    | "TITLE_WITH_CONSEQUENTIAL"
    | "PARTITION"
    | "PERMANENT_INJUNCTION"
    | "EVICTION_TENANT";
  claimAmountOrValuation: number;
}

export function calculateBangladeshCourtFee(
  suitType: CourtFeeCalculationRequest["suitType"],
  valuation: number
) {
  let statutoryCourtFee = 0;
  let formulaExplanationBn = "";

  switch (suitType) {
    case "TITLE_DECLARATION":
      statutoryCourtFee = 300;
      formulaExplanationBn =
        "সুনির্দিষ্ট প্রতিকার আইন ৪২ ধারা মতে আনুষঙ্গিক প্রতিকারবিহীন সাধারণ স্বত্ব ঘোষণা মোকদ্দমায় ফিক্সড কোর্ট ফি ৩০০/- টাকা।";
      break;

    case "PARTITION":
      statutoryCourtFee = 300;
      formulaExplanationBn =
        "যৌথ সম্পত্তিতে অংশীদারিত্ব নির্ণয় ও বাটোয়ারা মোকদ্দমায় ফিক্সড কোর্ট ফি ৩০০/- টাকা।";
      break;

    case "PERMANENT_INJUNCTION":
      statutoryCourtFee = 300;
      formulaExplanationBn =
        "সুনির্দিষ্ট প্রতিকার আইন ৫৪ ধারায় স্বতন্ত্র চিরস্থায়ী নিষেধাজ্ঞার আরজিতে নির্ধারিত ফিক্সড কোর্ট ফি ৩০০/- টাকা।";
      break;

    case "MONEY_SUIT":
    case "TITLE_WITH_CONSEQUENTIAL":
    case "EVICTION_TENANT":
    default: {
      const val = Math.max(0, valuation || 0);
      if (val <= 50000) {
        statutoryCourtFee = 250;
        formulaExplanationBn =
          "অনধিক ৫০,০০০/- টাকা মূল্যায়ন পর্যন্ত সর্বনিম্ন কোর্ট ফি ২৫০/- টাকা।";
      } else if (val <= 100000) {
        statutoryCourtFee = 250 + (val - 50000) * 0.03;
        formulaExplanationBn =
          "৫০,০০০/- টাকার অতিরিক্ত অঙ্কের ওপর ৩% হারে অ্যাড-ভ্যালোরেম কোর্ট ফি।";
      } else if (val <= 500000) {
        statutoryCourtFee = 1750 + (val - 100000) * 0.025;
        formulaExplanationBn =
          "১,০০,০০০/- টাকার অতিরিক্ত অঙ্কের ওপর ২.৫% হারে অ্যাড-ভ্যালোরেম কোর্ট ফি।";
      } else {
        statutoryCourtFee = 11750 + (val - 500000) * 0.02;
        formulaExplanationBn =
          "৫,০০,০০০/- টাকার অতিরিক্ত অঙ্কের ওপর ২% হারে অ্যাড-ভ্যালোরেম কোর্ট ফি (সর্বোচ্চ সিলিং ৫০,০০০/- টাকা)।";
      }

      // Maximum statutory ceiling under Court Fees Act
      if (statutoryCourtFee > 50000) {
        statutoryCourtFee = 50000;
        formulaExplanationBn +=
          " (কোর্ট ফিস অ্যাক্ট ১৮৭০ এর সর্বোচ্চ সংবিধিবদ্ধ সিলিং ৫০,০০০/- টাকায় সীমাবদ্ধ)";
      }
      break;
    }
  }

  const processFee = 150;
  const welfareStamp = 100;
  const totalGovtDues = statutoryCourtFee + processFee + welfareStamp;
  const advocateVat = Math.round(totalGovtDues * 0.15);

  return {
    suitType,
    valuation,
    statutoryCourtFee: Math.round(statutoryCourtFee),
    processFee,
    welfareStamp,
    totalGovtDues: Math.round(totalGovtDues),
    advocateVat,
    formulaExplanationBn,
    legalBasisBn:
      "কোর্ট ফিস অ্যাক্ট ১৮৭০ (ধারা ৭ ও ২য় তফসিল) এবং স্যুটস ভ্যালুয়েশন অ্যাক্ট ১৮৮৭",
  };
}
