import { NextRequest, NextResponse } from "next/server";
import { BAIL_PREDICTOR_PROMPT } from "@/lib/ai/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

export interface BailPredictionInput {
  offenceSections: string;
  daysInCustody: number;
  isChargeSheetSubmitted: boolean;
  hasPreviousCriminalRecord: boolean;
  medicalCondition: "NONE" | "MODERATE" | "CRITICAL";
  gender?: "MALE" | "FEMALE";
  age?: number;
}

export interface BailPredictionResult {
  probability: number; // 0 - 100
  probabilityBand: "LOW" | "MEDIUM" | "HIGH";
  groundsBn: string[];
  relevantPrecedents: Array<{
    citation: string;
    titleBn: string;
    ratioBn: string;
  }>;
  advocateStrategyBn: string;
  riskFactorsBn: string[];
}

export function calculateDeterministicBail(input: BailPredictionInput): BailPredictionResult {
  const sections = (input.offenceSections || "").toLowerCase();
  const days = Number(input.daysInCustody) || 0;
  const isCS = Boolean(input.isChargeSheetSubmitted);
  const hasRecord = Boolean(input.hasPreviousCriminalRecord);
  const med = input.medicalCondition || "NONE";
  const isFemale = input.gender === "FEMALE";
  const age = Number(input.age) || 30;

  let score = 50;
  const grounds: string[] = [];
  const riskFactors: string[] = [];

  // 1. Offence Severity Analysis
  const isHeinous = sections.includes("302") || sections.includes("395") || sections.includes("396") || sections.includes("ধর্ষণ");
  const isSevere = sections.includes("307") || sections.includes("326") || sections.includes("392") || sections.includes("অস্ত্র");
  const isBailable = sections.includes("138") || sections.includes("323") || sections.includes("420") || sections.includes("506") || sections.includes("143");

  if (isHeinous) {
    score -= 30;
    riskFactors.push("অভিযোগটি মৃত্যুদণ্ড বা যাবজ্জীবন কারাদণ্ডে দণ্ডনীয় মারাত্মক অপরাধ (ধারা ৩০২/৩৯৫) হওয়ায় ম্যাজিস্ট্রেট আদালতের জামিনের এখতিয়ার বারিত।");
  } else if (isSevere) {
    score -= 15;
    riskFactors.push("মারাত্মক আঘাত বা খুনের চেষ্টার অভিযোগ (ধারা ৩০৭/৩২৬) বিদ্যমান থাকায় নিয়মিত শুনানিতে সতর্কতার সাথে জেরা করতে হবে।");
  } else if (isBailable) {
    score += 25;
    grounds.push("আইনের তফসিল অনুযায়ী অভিযোগের ধারা জামিনযোগ্য হওয়ায় ফৌজদারি কার্যবিধির ৪৯৬ ধারায় জামিন আবেদনকারীর সংবিধিবদ্ধ অধিকার।");
  }

  // 2. Days in Custody Analysis (52 DLR AD 82 & 51 DLR AD 1)
  if (days >= 180) {
    score += 25;
    grounds.push(`আসামি বিগত ${days} দিন (প্রায় ৬ মাস) যাবৎ কারাগারে আটক রহিয়াছেন। সুপ্রিম কোর্টের ঐতিহাসিক নজির ৫২ ডিএলআর (এডি) ৮২ মতে দীর্ঘ বিচারহীন কারাবাস জামিনের অন্যতম প্রধান ভিত্তি।`);
  } else if (days >= 90) {
    score += 15;
    grounds.push(`আসামি একটানা ${days} দিন হাজতবাস করিয়াছেন এবং তদন্তকারী কর্মকর্তার নিকট সহযোগিতায় প্রস্তুত রহিয়াছেন।`);
  } else if (days <= 7) {
    score -= 8;
    riskFactors.push("আসামির হাজতবাস মাত্র কয়েকদিন হওয়ায় তদন্তের প্রাথমিক পর্যায়ে জামিন নামঞ্জুর হওয়ার ঝুঁকি থাকে।");
  }

  // 3. Charge Sheet Status (CrPC 167(5))
  if (!isCS) {
    if (days >= 60) {
      score += 15;
      grounds.push("ফৌজদারি কার্যবিধির ১৬৭(৫) ও ৩৪৪ ধারা অনুযায়ী নির্ধারিত মেয়াদে পুলিশ তদন্ত প্রতিবেদন (চার্জশিট) দাখিলে ব্যর্থ হওয়ায় জামিনের আইনগত ন্যায্যতা সৃষ্টি হইয়াছে।");
    } else {
      grounds.push("তদন্ত এখনও প্রাথমিক পর্যায়ে রহিয়াছে এবং আসামি কোনো আলামত বা সাক্ষ্য নষ্ট করার সুযোগ রাখিবেন না মর্মে জামিনযোগ্য।");
    }
  } else {
    score -= 5;
    riskFactors.push("পুলিশ চার্জশিট দাখিল করায় আদালতের প্রাথমিক সন্তুষ্টি আসামির বিরুদ্ধে বিদ্যমান।");
  }

  // 4. Criminal Record
  if (hasRecord) {
    score -= 20;
    riskFactors.push("আসামির পূর্ব অপরাধের রেকর্ড থাকায় আদালত অভ্যাসগত অপরাধী হিসেবে গণ্য করতে পারে।");
  } else {
    score += 10;
    grounds.push("আসামি সমাজের একজন নিরীহ ও ভদ্র নাগরিক এবং ইতিপূর্বে তাহার বিরুদ্ধে কোনো ফৌজদারি মামলার নজির নাই (First Time Offender)।");
  }

  // 5. Medical Condition & Section 497(1) Proviso
  if (med === "CRITICAL") {
    score += 25;
    grounds.push("আসামি গুরুতর ও ঝুঁকিপূর্ণ শারীরিক অসুস্থতায় আক্রান্ত হওয়ায় ফৌজদারি কার্যবিধির ৪৯৭(১) ধারার প্রথম শর্তাংশ (Proviso) মতে বিশেষ মানবিক জামিনের অধিকারী।");
  } else if (med === "MODERATE") {
    score += 10;
    grounds.push("কারাগারের প্রতিকূল পরিবেশে আসামির স্বাস্থ্য অবনতির আশঙ্কায় সুচিকিৎসার প্রয়োজনে জামিন প্রার্থনা সমীচীন।");
  }

  // 6. Proviso Demographics (Woman / Child / Senior)
  if (isFemale) {
    score += 15;
    grounds.push("আসামি একজন নারী হওয়ায় ফৌজদারি কার্যবিধির ৪৯৭(১) ধারার বিশেষ শর্তাংশ (Special Proviso for Women) মোতাবেক জামিনের বিশেষ অগ্রাধিকার প্রাপ্য।");
  }
  if (age < 18 || age >= 65) {
    score += 12;
    grounds.push(`আসামির বয়স (${age} বছর) বিবেচনায় শিশু ও কিশোর বা বয়োবৃদ্ধ নাগরিক হিসেবে মানবিক অনুকম্পা প্রযোজ্য।`);
  }

  // Blast vs Bangladesh 51 DLR (AD) 1 Ground
  grounds.push("মহামান্য সুপ্রিম কোর্টের আপিল বিভাগের ল্যান্ডমার্ক রায় ৫১ ডিএলআর (এডি) ১ (ব্লাস্ট বনাম বাংলাদেশ) অনুযায়ী বিনা বিচারে অপ্রয়োজনীয় আটক ব্যক্তিস্বাধীনতার লঙ্ঘন।");

  // Clamp strictly between 5 and 95
  const clampedProbability = Math.min(95, Math.max(5, Math.round(score)));

  let probabilityBand: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  let advocateStrategyBn = "";

  if (clampedProbability >= 70) {
    probabilityBand = "HIGH";
    advocateStrategyBn = "ম্যাজিস্ট্রেট বা সংশ্লিষ্ট দায়রা আদালতে অবিলম্বে নিয়মিত জামিন (Section 497 CrPC) দরখাস্ত দাখিল করুন। দীর্ঘ কারাবাস ও চিকিৎসা সনদ উপস্থাপন করলে প্রথম শুনানিতেই জামিন পাওয়ার জোরালো সম্ভাবনা রহিয়াছে।";
  } else if (clampedProbability >= 40) {
    probabilityBand = "MEDIUM";
    advocateStrategyBn = "বিজ্ঞ দায়রা জজ আদালতে চিকিৎসা কাগজপত্র এবং তদন্তে বিলম্বের গ্রাউন্ড দিয়ে জামিন শুনানি করুন। দায়রা আদালতে নামঞ্জুর হইলে হাইকোর্ট বিভাগে ৪৯৮ ধারায় ফৌজদারি বিবিধ মোশন দায়ের করুন।";
  } else {
    probabilityBand = "LOW";
    advocateStrategyBn = "ম্যাজিস্ট্রেট আদালতে সরাসরি জামিনের সম্ভাবনা কম। চার্জশিট দাখিল পর্যন্ত অপেক্ষা করা অথবা মহামান্য হাইকোর্ট বিভাগে চিকিৎসা সনদ বা দীর্ঘ বিচারহীনতার বিশেষ গ্রাউন্ডে ৪৯৮ ধারায় আগাম বা নিয়মিত জামিনের আবেদন করাই কৌশলগতভাবে সঠিক হইবে।";
  }

  const relevantPrecedents = [
    {
      citation: "51 DLR (AD) 1",
      titleBn: "ব্লাস্ট বনাম বাংলাদেশ (Blast vs Bangladesh)",
      ratioBn: "বিনা বিচারে দীর্ঘ কারাবাস নাগরিকের ব্যক্তিস্বাধীনতার পরিপন্থী এবং জামিন মঞ্জুরের ক্ষেত্রে আদালতের নমনীয় নীতি অবলম্বন করা উচিত।",
    },
    {
      citation: "52 DLR (AD) 82",
      titleBn: "আবুল হোসেন বনাম রাষ্ট্র (Abul Hossain vs State)",
      ratioBn: "অজামিনযোগ্য গুরুতর মামলায়ও দীর্ঘদিন বিচার শুরু না হইলে কারাবাসের মেয়াদকে জামিন মঞ্জুরের প্রধান ভিত্তি গণ্য করা যাইবে।",
    },
    {
      citation: "49 DLR (AD) 140",
      titleBn: "সিরাজুল ইসলাম বনাম রাষ্ট্র (Serajul Islam vs State)",
      ratioBn: "উদ্দেশ্যপ্রণোদিত হয়রানি বা মিথ্যা মামলায় হাইকোর্ট বিভাগ কর্তৃক ৪৯৮ ধারায় সুরক্ষামূলক জামিন প্রদান সমীচীন।",
    },
  ];

  return {
    probability: clampedProbability,
    probabilityBand,
    groundsBn: grounds,
    relevantPrecedents,
    advocateStrategyBn,
    riskFactorsBn: riskFactors.length > 0 ? riskFactors : ["কোনো গুরুতর প্রতিকূল ঝুঁকি চিহ্নিত হয়নি।"],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: BailPredictionInput = await req.json();

    if (!body.offenceSections || !body.offenceSections.trim()) {
      return NextResponse.json(
        { ok: false, error: "অনুগ্রহ করে মামলার ধারা বা অভিযোগের বিবরণ প্রদান করুন।" },
        { status: 400 }
      );
    }

    let prediction: BailPredictionResult | null = null;

    // 1. Try Gemini LLM if configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${BAIL_PREDICTOR_PROMPT}\n\nAccused Bail Parameters:\n${JSON.stringify(body, null, 2)}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed.probability === "number") {
            prediction = {
              ...parsed,
              probability: Math.min(100, Math.max(0, Math.round(parsed.probability))),
            };
          }
        }
      } catch (err) {
        console.warn("Gemini bail prediction failed, using deterministic engine:", err);
      }
    }

    // 2. Deterministic Bangladesh Statute & Precedent Engine Fallback
    if (!prediction) {
      prediction = calculateDeterministicBail(body);
    }

    return NextResponse.json({
      ok: true,
      data: prediction,
    });
  } catch (error) {
    console.error("Error in bail predictor API:", error);
    return NextResponse.json(
      { ok: false, error: "জামিনের সম্ভাবনা বিশ্লেষণ করতে ব্যর্থ হয়েছে।" },
      { status: 500 }
    );
  }
}
