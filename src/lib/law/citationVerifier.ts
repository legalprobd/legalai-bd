export const APPROVED_CITATIONS: string[] = [
  "51 DLR (AD) 1", // Secretary, Ministry of Finance vs Masdar Hossain (Separation of Judiciary)
  "8 BLC (AD) 12", // Bangladesh vs Professor Golam Azam (Citizenship Case)
  "55 DLR 398",   // BLAST vs Bangladesh (Section 54 & 167 Guidelines)
  "44 DLR 273",   // Kudrat-E-Elahi Panir vs Bangladesh (Local Government elections)
  "52 DLR (AD) 82", // Dr. Mohiuddin Farooque vs Bangladesh (FAP 20 / Standing)
  "7 BLC (AD) 77",  // State vs Sukur Ali (Trial in camera / Rape prosecution)
  "18 BLD (AD) 116", // Anwar Hossain Chowdhury vs Bangladesh (8th Amendment Case)
  "29 DLR (SC) 1",   // Halima Khatun vs Bangladesh
  "49 DLR (AD) 154", // Bangladesh vs Ahmed Nazir (Contempt of Court)
  "38 DLR (AD) 292", // Government of Bangladesh vs Advocate Dilwar Hossain
  "48 DLR (AD) 21",  // Mujibur Rahman vs Bangladesh (Administrative Tribunals)
  "50 DLR 295",      // Shafiuddin vs State (Bail considerations in serious offences)
];

export interface CitationVerificationResult {
  verifiedHtml: string;
  unverifiedCitations: string[];
  hasWarning: boolean;
  warningBn?: string;
}

export function normalizeCitation(cit: string): string {
  return cit.replace(/\s+/g, " ").trim().toUpperCase();
}

export function verifyCitations(html: string): CitationVerificationResult {
  if (!html) {
    return { verifiedHtml: "", unverifiedCitations: [], hasWarning: false };
  }

  // Regex pattern matching DLR, BLC, BLD, ALR, BCR citations
  // e.g. 51 DLR (AD) 1, 8 BLC 12, 12 BLD 45
  const citationRegex = /\b(\d+\s+(?:DLR|BLC|BLD|ALR|BCR)(?:\s*\([A-Za-z]+\))?\s+\d+)\b/gi;

  const normalizedApproved = new Set(APPROVED_CITATIONS.map(normalizeCitation));
  const unverified: string[] = [];

  const replacedHtml = html.replace(citationRegex, (match) => {
    const norm = normalizeCitation(match);
    const isApproved = normalizedApproved.has(norm);

    if (isApproved) {
      return match;
    } else {
      if (!unverified.includes(match)) {
        unverified.push(match);
      }
      return `<span class="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-1 rounded inline-block" title="অযাচাইকৃত রেফারেন্স">**[⚠️ সাইটেশন যাচাই করুন: ${match}]**</span>`;
    }
  });

  const hasWarning = unverified.length > 0;
  let finalHtml = replacedHtml;

  if (hasWarning) {
    const warningHeader = `<div class="p-3 mb-4 bg-rose-50 border-2 border-rose-400 text-rose-900 rounded-lg text-xs font-semibold">
⚠️ সতর্কবার্তা: নথিতে ${unverified.length}টি অসত্যায়িত/অননুমোদিত আইনি নজির বা সাইটেশন সনাক্ত হয়েছে (${unverified.join(", ")})। বিজ্ঞ আইনজীবীকে বাংলাদেশ ল’ রিপোর্টস (DLR/BLC) ভলিউম হতে মূল রেফারেন্স যাচাই করার পরামর্শ দেওয়া হচ্ছে।
</div>`;
    finalHtml = warningHeader + replacedHtml;
  }

  return {
    verifiedHtml: finalHtml,
    unverifiedCitations: unverified,
    hasWarning,
    warningBn: hasWarning
      ? `${unverified.length}টি অসত্যায়িত আইনি নজির সনাক্ত হয়েছে।`
      : undefined,
  };
}
