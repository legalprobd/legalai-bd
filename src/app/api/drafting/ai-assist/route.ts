import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AiAssistRequest {
  action: "suggest_phrasing" | "insert_clause" | "check_weaknesses";
  selectedText?: string;
  fullDraft?: string;
  clauseType?: "prayer" | "jurisdiction" | "cause_of_action" | "verification" | "limitation";
  caseCategory?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: AiAssistRequest = await req.json();
    const { action, selectedText = "", fullDraft = "", clauseType = "prayer", caseCategory = "Civil" } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Suggest Legal Phrasing
    if (action === "suggest_phrasing") {
      const cleanInput = selectedText.trim();
      if (!cleanInput) {
        return NextResponse.json(
          { ok: false, error: "কোনো টেক্সট নির্বাচন করা হয়নি।" },
          { status: 400 }
        );
      }

      if (apiKey && apiKey.trim().length > 10) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { temperature: 0.2 },
          });

          const prompt = `
আপনি বাংলাদেশ সুপ্রিম কোর্ট ও জেলা দায়রা আদালতের একজন প্রথিতযশা সিনিয়র অ্যাডভোকেট।
আইনজীবী খসড়া তৈরির সময় নিচের অনানুষ্ঠানিক বা সাধারণ বাংলা বাক্যটি নির্বাচন করেছেন:
"${cleanInput}"

নির্দেশনা:
উক্ত বক্তব্যটিকে বাংলাদেশের আদালতের উপযোগী ওজনদার, প্রমিত এবং যথাযথ আইনি পরিভাষায় (Formal Judicial Language) রূপান্তর করুন।
- মামলা দেওয়ানি/ফৌজদারি আদালতের আরজি, লিখিত জবাব বা পিটিশনের বাক্যরীতির অনুরূপ হবে।
- শুধু পরিমার্জিত আইনি বাক্যটিই প্রদান করুন। কোনো ভূমিকা বা বাড়তি কথা লিখবেন না।
`;
          const result = await model.generateContent(prompt);
          const text = result.response.text()?.trim();
          if (text) {
            return NextResponse.json({
              ok: true,
              action,
              originalText: cleanInput,
              suggestion: text,
            });
          }
        } catch (llmErr) {
          console.warn("AI Phrasing LLM error, using legal fallback:", llmErr);
        }
      }

      // Legal rule-based fallback
      let fallbackText = `বাদী বিনীত নিবেদন এই যে, বিবাদীগণ বেআইনি যোগসাজশে অত্র মোকদ্দমার বিষয়বস্তুতে অনধিকার হস্তক্ষেপ করিয়া বাদীর আইনসঙ্গত অধিকারে ব্যাঘাত সৃষ্টি করিয়াছে।`;
      if (cleanInput.includes("জমি") || cleanInput.includes("দখল")) {
        fallbackText = `বিবাদীগণ সম্পূর্ণ বেআইনিভাবে ও বলপূর্বক বাদীর নিরঙ্কুশ স্বত্বদখলীয় নালিশি তফশিলভুক্ত ভূমিতে অনধিকার প্রবেশপূর্বক জবরদখলের অপচেষ্টা চালাইয়াছে।`;
      } else if (cleanInput.includes("মার") || cleanInput.includes("আঘাত") || cleanInput.includes("জখম")) {
        fallbackText = `আসামিগণ পরস্পর বেআইনি জনতাবদ্ধে মারাত্মক অস্ত্রে সজ্জিত হইয়া বাদীর পথরোধপূর্বক প্রাণনাশের উদ্দেশ্যে গুরুতর রক্তাত্ব জখম ও অস্থিভঙ্গ সাধন করিয়াছে।`;
      } else if (cleanInput.includes("টাকা") || cleanInput.includes("চেক")) {
        fallbackText = `বিবাদী বাদীর নিকট হইতে গৃহীত ঋণের দায় পরিশোধার্থে প্রদত্ত চেকটি ব্যাংকে যথাসময়ে উপস্থাপিত হইলে অপর্যাপ্ত তহবিলের কারণে ডিসঅনার হইয়াছে এবং লিগ্যাল নোটিশ সত্ত্বেও পরিশোধে ব্যর্থ হইয়াছে।`;
      } else {
        fallbackText = `উক্ত ঘটনার পরিপ্রেক্ষিতে বাদীপক্ষের আইনি প্রতিকার লাভের নিমিত্তে বিজ্ঞ আদালতের হস্তক্ষেপ অপরিহার্য হইয়া পড়িয়াছে।`;
      }

      return NextResponse.json({
        ok: true,
        action,
        originalText: cleanInput,
        suggestion: fallbackText,
      });
    }

    // 2. Insert Standard Clause
    if (action === "insert_clause") {
      const standardClauses: Record<string, { title: string; html: string }> = {
        prayer: {
          title: "প্রার্থনা বা প্রতিকারের দফা (Prayer Clause)",
          html: `<p><strong>অতএব, বিজ্ঞ আদালতের নিকট বিনীত প্রার্থনা এই যে—</strong></p>
<ol>
  <li>অত্র আরজির তপশিল বর্ণিত নালিশি ভূমিতে বাদীর নিরঙ্কুশ স্বত্ব ঘোষণা ও বিবাদীগণের বিরুদ্ধে চিরস্থায়ী নিষেধাজ্ঞার ডিক্রি প্রদান করিতে মর্জি হয়;</li>
  <li>মোকদ্দমার যাবতীয় খরচাদি বাদীর অনুকূলে বিবাদীগণের বিরুদ্ধে ডিক্রি দান করিতে মর্জি হয়; এবং</li>
  <li>সুবিচারার্থে আইন ও ইকুইটি মতে বাদী অন্য যে যে প্রতিকার পাইবার হকদার তাহারও আদেশ দানে সুবিচার করিতে মর্জি হয়।</li>
</ol>`,
        },
        jurisdiction: {
          title: "এখতিয়ার সংক্রান্ত দফা (Territorial & Pecuniary Jurisdiction)",
          html: `<p><strong>এখতিয়ার সংক্রান্ত নিবেদন:</strong> যেহেতু নালিশি তপশিলভুক্ত সম্পত্তির অবস্থান এবং ঘটনার উৎপত্তি অত্র বিজ্ঞ আদালতের সীমানাভুক্ত হওয়ায় এবং মোকদ্দমার আর্থিক মূল্যায়ন নির্ধারিত বিধিমোতাবেক বিজ্ঞ আদালতের এখতিয়ারসীমার মধ্যে অবস্থিত বিধায় বিষয়টি বিচারার্থে অত্র বিজ্ঞ আদালতের পূর্ণ আঞ্চলিক ও আর্থিক এখতিয়ার রহিয়াছে।</p>`,
        },
        cause_of_action: {
          title: "মোকদ্দমার কারণ (Cause of Action Clause)",
          html: `<p><strong>মোকদ্দমার কারণ:</strong> যেহেতু অত্র মোকদ্দমার কারণ সর্বপ্রথম বিগত [তারিখ] তারিখে বিবাদীগণ দ্বারা বাদীর স্বত্বদখলে অনধিকার হস্তক্ষেপ ও হুমকি প্রদানের মাধ্যমে উদ্ভব হইয়া পরবর্তীতে স্থানীয় গণ্যমান্য ব্যক্তিবর্গের উপস্থিতিতে সালিশি মীমাংসা করিতে অস্বীকৃতি জানানোয় অদ্যাবধি বলবৎ রহিয়াছে।</p>`,
        },
        verification: {
          title: "সত্যপাঠ ও হলফনামা (Verification & Affidavit)",
          html: `<p><strong>সত্যপাঠ ও হলফনামা:</strong></p>
<p>আমি, [বাদীর নাম], পিতা: [পিতার নাম], পেশা: [পেশা], সাং: [ঠিকানা], ধর্ম: [ধর্ম], জাতীয়তা: বাংলাদেশী—অত্র মোকদ্দমার বাদী হিসেবে সজ্ঞানে ও সুস্থ মস্তিষ্কে এই মর্মে ঘোষণা ও অঙ্গীকার করিতেছি যে, অত্র আরজিতে বর্ণিত ১ হইতে [সর্বশেষ অনুচ্ছেদ] অনুচ্ছেদের যাবতীয় বিবরণসমূহ আমার জ্ঞান ও বিশ্বাস মতে সত্য ও নির্ভুল। অত্র বয়ানে কোনো অসত্য তথ্য গোপন করা হয় নাই।</p>`,
        },
        limitation: {
          title: "তামাদি সংক্রান্ত বিধান (Limitation Period Clause)",
          html: `<p><strong>তামাদি সংক্রান্ত বিবৃতি:</strong> যেহেতু মোকদ্দমার কারণ উদ্ভব হওয়ার তারিখ হইতে তামাদি আইন, ১৯০৮-এর সংশ্লিষ্ট অনুচ্ছেদ অনুযায়ী নির্ধারিত আইনানুগ মেয়াদের মধ্যেই অত্র মোকদ্দমা দায়ের করা হইয়াছে, সেহেতু অত্র মোকদ্দমাটি কোনোভাবেই তামাদি দোষে বারিত নহে।</p>`,
        },
      };

      const selected = standardClauses[clauseType] || standardClauses.prayer;
      return NextResponse.json({
        ok: true,
        action,
        clauseType,
        title: selected.title,
        html: selected.html,
      });
    }

    // 3. Check Draft Weaknesses
    if (action === "check_weaknesses") {
      const draftContent = fullDraft || selectedText;
      const weaknesses: string[] = [];
      let qualityScore = 90;

      // Check dates
      if (!draftContent.includes("তারিখ") && !draftContent.includes("ইং")) {
        weaknesses.push("ঘটনার বা মোকদ্দমার কারণের সুনির্দিষ্ট তারিখ অনুপস্থিত বা অস্পষ্ট।");
        qualityScore -= 20;
      }

      // Check place/jurisdiction
      if (!draftContent.includes("এখতিয়ার") && !draftContent.includes("থানা") && !draftContent.includes("আদালত")) {
        weaknesses.push("আদালতের আঞ্চলিক ও আর্থিক এখতিয়ার (Jurisdiction) স্পষ্ট উল্লেখ করা হয়নি।");
        qualityScore -= 15;
      }

      // Check prayer/relief
      if (!draftContent.includes("প্রার্থনা") && !draftContent.includes("ডিক্রি") && !draftContent.includes("আদেশ")) {
        weaknesses.push("বিজ্ঞ আদালতের নিকট স্পষ্ট প্রতিকার বা প্রার্থনার দফা (Prayer Clause) অনুপস্থিত।");
        qualityScore -= 25;
      }

      // Check verification/affidavit
      if (!draftContent.includes("সত্যপাঠ") && !draftContent.includes("হলফনামা") && !draftContent.includes("বিশ্বাস মতে সত্য")) {
        weaknesses.push("আরজি বা পিটিশনের সমাপ্তিতে বাধ্যতামূলক 'সত্যপাঠ ও হলফনামা' (Verification) যোগ করা প্রয়োজন।");
        qualityScore -= 15;
      }

      // Check witness/evidence references
      if (!draftContent.includes("সাক্ষী") && !draftContent.includes("প্রমাণ") && !draftContent.includes("সনদ") && !draftContent.includes("খতিয়ান")) {
        weaknesses.push("ঘটনার সমর্থনে প্রত্যক্ষদর্শী সাক্ষী বা দালিলিক প্রমাণের সুনির্দিষ্ট রেফারেন্স দুর্বল।");
        qualityScore -= 15;
      }

      if (weaknesses.length === 0) {
        weaknesses.push("খসড়াটি সার্বিকভাবে স্বয়ংসম্পূর্ণ। আদালতের প্রমিত আইনি কাঠামোর সকল মৌলিক শর্ত উপস্থিত রহিয়াছে।");
      }

      return NextResponse.json({
        ok: true,
        action,
        score: Math.max(qualityScore, 30),
        weaknesses,
      });
    }

    return NextResponse.json(
      { ok: false, error: "অসমর্থিত অ্যাকশন।" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("AI Assist error:", error);
    return NextResponse.json(
      { ok: false, error: "এআই ড্রাফটিং অ্যাসিস্ট্যান্টে ত্রুটি ঘটেছে।" },
      { status: 500 }
    );
  }
}
