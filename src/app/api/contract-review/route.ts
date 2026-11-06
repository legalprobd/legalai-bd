import { NextRequest, NextResponse } from "next/server";
import { CONTRACT_REVIEWER_PROMPT } from "@/lib/ai/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ContractReviewResult {
  riskScore: "LOW" | "MEDIUM" | "HIGH";
  overallSummaryBn: string;
  missingClausesBn: string[];
  unfairTermsBn: string[];
  legalAdviceBn: string[];
  clauseAnalysis: Array<{
    clauseTitle: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    analysisBn: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contractText: string = body.contractText || "";

    if (!contractText.trim() || contractText.trim().length < 15) {
      return NextResponse.json(
        {
          ok: false,
          error: "অনুগ্রহ করে চুক্তিপত্র বা দলিলের পর্যাপ্ত পাঠ্য (কমপক্ষে ১৫ অক্ষর) প্রদান করুন।",
        },
        { status: 400 }
      );
    }

    let reviewData: ContractReviewResult | null = null;

    // 1. Try Gemini / LLM if API Key is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${CONTRACT_REVIEWER_PROMPT}\n\nHere is the contract text to audit:\n"""\n${contractText}\n"""`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reviewData = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn("Gemini call failed or timed out, falling back to local audit engine:", err);
      }
    }

    // 2. Fallback / Deterministic Bangladesh Legal Audit Engine
    if (!reviewData || !reviewData.riskScore) {
      reviewData = performLocalContractAudit(contractText);
    }

    return NextResponse.json({
      ok: true,
      data: reviewData,
    });
  } catch (error) {
    console.error("Error in contract-review API:", error);
    return NextResponse.json(
      { ok: false, error: "চুক্তিপত্র নিরীক্ষা করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

function performLocalContractAudit(text: string): ContractReviewResult {
  const lower = text.toLowerCase();
  const missingClauses: string[] = [];
  const unfairTerms: string[] = [];
  const legalAdvice: string[] = [];
  const clauseAnalysis: ContractReviewResult["clauseAnalysis"] = [];

  let riskWeight = 0;

  // 1. Indemnity check
  if (!lower.includes("ক্ষতিপূরণ") && !lower.includes("indemnity") && !lower.includes("দায়মুক্তি")) {
    missingClauses.push("ক্ষতিপূরণ ও দায়মুক্তি ধারা অনুপস্থিত (Missing Indemnity Clause)");
    legalAdvice.push("চুক্তি আইন ১৮৭২ এর ১২৪-১২৫ ধারা অনুযায়ী তৃতীয় পক্ষের ক্ষতির দায় থেকে মক্কেলকে রক্ষা করতে স্পষ্ট ক্ষতিপূরণ ধারা সংযোজন করুন।");
    riskWeight += 2;
  } else {
    clauseAnalysis.push({
      clauseTitle: "ক্ষতিপূরণ ও দায় সংক্রান্ত ধারা",
      riskLevel: "LOW",
      analysisBn: "চুক্তিতে ক্ষতিপূরণের শর্ত অন্তর্ভুক্ত রহিয়াছে, তবে সর্বোচ্চ দায়ের সীমা (Cap on Liability) সুনির্দিষ্ট করা সমীচীন।",
    });
  }

  // 2. Dispute Resolution & Arbitration
  if (!lower.includes("সালিশ") && !lower.includes("arbitration") && !lower.includes("বিরোধ নিষ্পত্তি") && !lower.includes("মেডিয়েশন")) {
    missingClauses.push("সালিশি বা বিকল্প বিরোধ নিষ্পত্তি ধারা অনুপস্থিত (Missing Arbitration Clause)");
    legalAdvice.push("সালিশ আইন ২০০১ (Arbitration Act 2001) অনুযায়ী ঢাকায় অবস্থিত একক বা যৌথ সালিশি ট্রাইব্যুনালের মাধ্যমে দ্রুত বিরোধ নিষ্পত্তির বিধান সন্নিবেশ করুন।");
    riskWeight += 2;
  } else {
    clauseAnalysis.push({
      clauseTitle: "বিরোধ নিষ্পত্তি ও সালিশি ধারা",
      riskLevel: "LOW",
      analysisBn: "বিরোধ নিষ্পত্তির আইনি ভিত্তি রহিয়াছে।",
    });
  }

  // 3. Termination Notice
  if (!lower.includes("নোটিশ") && !lower.includes("বাতিল") && !lower.includes("termination") && !lower.includes("অবসান")) {
    missingClauses.push("চুক্তি অবসান ও লিখিত নোটিশের সুনির্দিষ্ট মেয়াদ অনুপস্থিত (Missing Termination Notice Period)");
    legalAdvice.push("কমপক্ষে ৩০ দিনের রেজিস্ট্রি ডাকযোগে লিখিত নোটিশের মাধ্যমে চুক্তি অবসানের শর্ত সন্নিবেশ করুন।");
    riskWeight += 1;
  }

  // 4. Registration requirement (for land / baynanama / lease > 1 year)
  if (lower.includes("জমি") || lower.includes("বায়নানামা") || lower.includes("বায়না") || lower.includes("বিক্রয়") || lower.includes("কবলা")) {
    if (!lower.includes("রেজিস্ট্রি") && !lower.includes("রেজিস্ট্রেশন")) {
      missingClauses.push("রেজিস্ট্রেশন আইনের ১৭ ধারা অনুযায়ী বাধ্যতামূলক সাব-রেজিস্ট্রি বিধান অনুপস্থিত");
      unfairTerms.push("অনিবন্ধিত বায়ানানামা দলিলের মাধ্যমে জমি বিক্রয় আইনিভাবে অত্যন্ত ঝুঁকিপূর্ণ ও দেওয়ানি আদালতে অপ্রমাণিত হওয়ার সম্ভাবনা প্রবল।");
      legalAdvice.push("রেজিস্ট্রেশন আইনের ১৭-ক ধারা অনুযায়ী স্থাবর সম্পত্তির বায়ানানামা দলিল সর্বোচ্চ ৩০ দিনের মধ্যে রেজিস্ট্রি করা বাধ্যতামূলক।");
      riskWeight += 3;
    }
  }

  // 5. Unfair Penalties
  if (lower.includes("জরিমানা") || lower.includes("পেনাল্টি") || lower.includes("penalty") || lower.includes("জব্দ")) {
    unfairTerms.push("একতরফা অগ্রিম টাকা বা জামানত বাজেয়াপ্তকরণ ও অতিরিক্ত জরিমানার শর্ত বিদ্যমান");
    legalAdvice.push("চুক্তি আইন ১৮৭২ এর ৭৪ ধারা অনুযায়ী অযৌক্তিক বা অসম জরিমানা বাতিলযোগ্য; বাস্তবসম্মত লিকুইডেটেড ড্যামেজ (Liquidated Damages) ধারা ব্যবহার করুন।");
    riskWeight += 2;
  }

  // 6. Force Majeure
  if (!lower.includes("অনিবার্য কারণ") && !lower.includes("force majeure") && !lower.includes("দৈব দুর্বিপাক")) {
    missingClauses.push("দৈব দুর্বিপাক বা নিয়ন্ত্রণবহির্ভূত ঘটনার ধারা অনুপস্থিত (Force Majeure Clause)");
    legalAdvice.push("বন্যা, মহামারী বা সরকারি নিষেধাজ্ঞা সংক্রান্ত সময়ে দায়িত্ব স্থগিত রাখার শর্ত যোগ করুন।");
    riskWeight += 1;
  }

  // Determine overall risk
  let riskScore: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let overallSummaryBn = "চুক্তিপত্রটিতে মৌলিক আইনি শর্তাবলী সন্তোষজনকভাবে বিদ্যমান। সামান্য কিছু সতর্কতামূলক ধারা সংযোজন করলে ঝুঁকি সর্বনিম্ন থাকবে।";

  if (riskWeight >= 4) {
    riskScore = "HIGH";
    overallSummaryBn = "উক্ত খসড়া চুক্তি বা দলিলে অত্যন্ত ঝুঁকিপূর্ণ আইনি ফাঁকফোকর পরিলক্ষিত হইয়াছে। বিশেষ করে ক্ষতিপূরণ, সালিশ ও রেজিস্ট্রেশন সংক্রান্ত মারাত্মক ঘাটতি থাকায় মক্কেলকে দীর্ঘমেয়াদি দেওয়ানি বা ফৌজদারি মামলার সম্মুখীন হইতে হইতে পারে।";
  } else if (riskWeight >= 2) {
    riskScore = "MEDIUM";
    overallSummaryBn = "চুক্তিপত্রটিতে মধ্যম মাত্রার আইনি ঝুঁকি রয়েছে। নোটিশের সময়সীমা এবং বিরোধ নিষ্পত্তির সুস্পষ্ট এখতিয়ার নির্ধারণের পর স্বাক্ষর করা সমীচীন হইবে।";
  }

  return {
    riskScore,
    overallSummaryBn,
    missingClausesBn: missingClauses.length > 0 ? missingClauses : ["কোনো অত্যাবশ্যকীয় ধারা বাদ পড়েনি।"],
    unfairTermsBn: unfairTerms.length > 0 ? unfairTerms : ["কোনো অন্যায্য বা একতরফা ধারা পরিলক্ষিত হয়নি।"],
    legalAdviceBn: legalAdvice.length > 0 ? legalAdvice : ["খসড়াটি উভয় পক্ষের সম্মতি নিয়ে চূড়ান্ত স্বাক্ষর করা যেতে পারে।"],
    clauseAnalysis: clauseAnalysis.length > 0 ? clauseAnalysis : [
      {
        clauseTitle: "পক্ষগণের প্রাথমিক অঙ্গীকার",
        riskLevel: riskScore,
        analysisBn: "চুক্তিপত্রে উভয় পক্ষের প্রাথমিক প্রতিশ্রুতি ও প্রতিদান (Consideration) বিধিবদ্ধ রয়েছে।",
      },
    ],
  };
}
