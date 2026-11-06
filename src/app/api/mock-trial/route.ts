import { NextRequest, NextResponse } from "next/server";
import { MOCK_TRIAL_PROMPT } from "@/lib/ai/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface MockTrialInput {
  caseFact: string;
  witnessPersona: string;
  history?: Array<{ role: "advocate" | "witness"; content: string }>;
  newQuestion: string;
}

export interface MockTrialResponse {
  witnessReplyBn: string;
  objection: string | null;
  contradictionDetected: boolean;
  contradictionNoteBn: string | null;
  coachingTipBn: string;
}

export function detectMockTrialResponse(input: MockTrialInput): MockTrialResponse {
  const q = (input.newQuestion || "").trim();
  const lowerQ = q.toLowerCase();
  const fact = (input.caseFact || "").toLowerCase();

  // 1. Detect Leading Questions (Evidence Act 1872 Section 141-142)
  // Indicators in Bengali: তাই না?, তাই তো?, ঠিক কিনা?, নিশ্চয়ই?, অবশ্যই?, দেখেননি কি?, করেনি কি?
  const isLeading =
    lowerQ.includes("তাই না") ||
    lowerQ.includes("তাই তো") ||
    lowerQ.includes("ঠিক কিনা") ||
    lowerQ.includes("ঠিক তো") ||
    lowerQ.includes("নিশ্চয়ই") ||
    lowerQ.includes("দেখেননি কি") ||
    lowerQ.includes("যাননি কি") ||
    lowerQ.includes("করেনি কি");

  let objection: string | null = null;
  if (isLeading) {
    objection =
      "Objection My Lord! Leading question (সাক্ষ্য আইন ১৮৭২ এর ১৪১-১৪২ ধারা অনুযায়ী জবানবন্দিকালে এটি ইঙ্গিতবাহী প্রশ্ন)।";
  }

  // 2. Character & Fact-based Response Generator
  let witnessReplyBn = "";
  let contradictionDetected = false;
  let contradictionNoteBn: string | null = null;
  let coachingTipBn = "";

  if (isLeading) {
    witnessReplyBn =
      "(সাক্ষী কিছুটা অপ্রস্তুত হইয়া তাকাইয়া আছেন) বিজ্ঞ আইনজীবী যা বলছেন তা আমি নিজের চোখে যতটুকু দেখেছি ঠিক সেভাবেই বলছি। জোর করে আমার মুখে কথা বসাবেন না।";
    coachingTipBn =
      "ইঙ্গিতবাহী প্রশ্ন পরিহার করুন। সাক্ষীকে সরাসরি জিজ্ঞেস করুন: 'সেই মুহূর্তে আপনি সেখানে কী প্রত্যক্ষ করেছিলেন?'";
  } else if (lowerQ.includes("কোথায় ছিলেন") || lowerQ.includes("অবস্থান") || lowerQ.includes("কোথায়")) {
    witnessReplyBn =
      "আমি তখন ঘটনাস্থলের পাশেই ডিউটিরত ছিলাম। আলো কিছুটা কম ছিল, কিন্তু আমি মানুষের চিৎকার ও দৌড়াদৌড়ির আওয়াজ স্পষ্টভাবে শুনেছিলাম।";
    coachingTipBn =
      "সাক্ষী রাতের আলোর স্বল্পতা স্বীকার করেছেন। পরবর্তী প্রশ্নে আলোর উৎস ও দেখার দূরত্ব সুনির্দিষ্ট করুন।";
  } else if (lowerQ.includes("চিনতে পেরেছেন") || lowerQ.includes("কে") || lowerQ.includes("নাম")) {
    witnessReplyBn =
      "হঠাৎ অন্ধকারে একজনকে পালিয়ে যেতে দেখেছি। মুখ স্পষ্ট দেখা যায়নি, তবে তার পরনে কালো জ্যাকেট ছিল।";
    coachingTipBn =
      "সাক্ষী মুখ স্পষ্ট দেখেননি—এটি আসামিপক্ষের জন্য বড় অনুকূল তথ্য। টিআই প্যারেড (T.I. Parade) হয়েছিল কিনা যাচাই করুন।";
  } else if (lowerQ.includes("অস্ত্র") || lowerQ.includes("ছুরি") || lowerQ.includes("রড")) {
    witnessReplyBn =
      "হাতে কিছু একটা ধাতব বস্তু চকচক করছিল, তবে সেটি ধারালো ছুরি নাকি লোহার রড তা দূর থেকে নিশ্চিত করে বলতে পারব না।";
    coachingTipBn =
      "অস্ত্রের সুনির্দিষ্ট পরিচয় নিশ্চিত না হওয়ায় দণ্ডবিধির মারাত্মক ধারার উপাদান প্রশ্নবিদ্ধ করা সম্ভব।";
  } else if (lowerQ.includes("পুলিশ") || lowerQ.includes("দারোগা") || lowerQ.includes("জবানবন্দি")) {
    witnessReplyBn =
      "ঘটনার পরদিন সকালে পুলিশ এসে আমার সাথে কথা বলেছিল এবং আমি থানায় গিয়ে স্বাক্ষর করেছিলাম।";
    coachingTipBn =
      "ফৌজদারি কার্যবিধির ১৬১ ধারার জবানবন্দির সাথে বর্তমান বক্তব্যের অমিল থাকলে তা নথিবদ্ধ করুন।";
  } else {
    witnessReplyBn =
      "ঘটনার সময় আমি সেখানে উপস্থিত ছিলাম। যা সত্য এবং যা আমি দেখেছি কেবল তাহাই বিজ্ঞ আদালতের নিকট ব্যক্ত করিতেছি।";
    coachingTipBn =
      "সাক্ষীকে ঘটনার সুনির্দিষ্ট সময়সীমা, পারিপার্শ্বিক অবস্থা ও তার ব্যক্তিগত স্বার্থ সম্পর্কে চাপ দিন।";
  }

  // Contradiction check: if question directly exposes fact inconsistency
  if (fact.includes("রাত") && (lowerQ.includes("দুপুর") || lowerQ.includes("সকাল"))) {
    contradictionDetected = true;
    contradictionNoteBn =
      "সাক্ষী এজাহারের সময় (রাত) ব্যতিরেকে দিনের বেলা দাবি করায় বক্তব্যে গুরুতর অসঙ্গতি সৃষ্টি হইয়াছে।";
  }

  return {
    witnessReplyBn,
    objection,
    contradictionDetected,
    contradictionNoteBn,
    coachingTipBn,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: MockTrialInput = await req.json();

    if (!body.newQuestion || !body.newQuestion.trim()) {
      return NextResponse.json(
        { ok: false, error: "অনুগ্রহ করে সাক্ষীর উদ্দেশ্যে একটি প্রশ্ন লিখুন।" },
        { status: 400 }
      );
    }

    let trialResponse: MockTrialResponse | null = null;

    // 1. Try Gemini LLM if configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `${MOCK_TRIAL_PROMPT}\n\nCase Facts:\n"""${body.caseFact}"""\n\nWitness Persona:\n"""${body.witnessPersona}"""\n\nAdvocate's Question:\n"""${body.newQuestion}"""\n`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          trialResponse = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn("Gemini mock trial call failed, using deterministic simulator:", err);
      }
    }

    // 2. Deterministic Fallback Simulator
    if (!trialResponse || !trialResponse.witnessReplyBn) {
      trialResponse = detectMockTrialResponse(body);
    }

    return NextResponse.json({
      ok: true,
      data: trialResponse,
    });
  } catch (error) {
    console.error("Error in mock trial API:", error);
    return NextResponse.json(
      { ok: false, error: "মক ট্রায়াল সিমুলেট করতে ব্যর্থ হয়েছে।" },
      { status: 500 }
    );
  }
}
