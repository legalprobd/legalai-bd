/**
 * NI Act 2026 (Act 65 of 2026 / Section 141(c))
 * Cheque Dishonour Jurisdiction Router & Helpers
 */

export interface NiActJurisdiction {
  courtType: "Joint Sessions Judge" | "Magistrate";
  courtNameBn: string;
  actReferenceBn: string;
  amount: number;
}

/**
 * Constraint 3: NI Act 2026 Jurisdiction Logic (Section 141(c))
 * For Cheque Dishonour cases under NI Act 2026 (Act 65/2026):
 * - If amount > 500,000 (5 Lakhs), jurisdiction is Joint Sessions Judge (বিজ্ঞ যুগ্ম দায়রা জজ আদালত).
 * - If amount <= 500,000 (5 Lakhs), jurisdiction is Magistrate (বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত / মেট্রোপলিটন ম্যাজিস্ট্রেট আদালত).
 */
export function getNiActJurisdiction(
  amountInput: number | string | undefined | null,
  district: string = "ঢাকা"
): NiActJurisdiction {
  let amount = 0;

  if (typeof amountInput === "number") {
    amount = amountInput;
  } else if (typeof amountInput === "string") {
    // Parse Bengali digits and remove currency formatting
    const bnToEnMap: Record<string, string> = {
      "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
      "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
    };
    const normalized = amountInput.replace(/[০-৯]/g, (match) => bnToEnMap[match] || match);
    const cleaned = normalized.replace(/[^0-9.]/g, "");
    amount = parseFloat(cleaned) || 0;
  }

  if (amount > 500000) {
    return {
      courtType: "Joint Sessions Judge",
      courtNameBn: `বিজ্ঞ যুগ্ম দায়রা জজ আদালত, ${district}`,
      actReferenceBn: "এনআই অ্যাক্ট, ১৮৮১ (সংশোধিত ২০২৬ আইন নং ৬৫, ধারা ১৪১(গ))",
      amount,
    };
  }

  return {
    courtType: "Magistrate",
    courtNameBn: `বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত, ${district}`,
    actReferenceBn: "এনআই অ্যাক্ট, ১৮৮১ (সংশোধিত ২০২৬ আইন নং ৬৫, ধারা ১৪১(গ))",
    amount,
  };
}
