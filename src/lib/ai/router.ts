import { CaseAnalysisResponse, CaseAnalysisResponseSchema, DraftDocType } from "./schemas";
import { generateMockCaseAnalysis } from "./mock";
import { INTERVIEWER_SYSTEM_PROMPT, DRAFTER_SYSTEM_PROMPT } from "./prompts";
import { searchTrustedLaws, extractLegalKeywords } from "./rag";
import { generateDocumentByType } from "@/lib/templates/bdCourtTemplates";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

/**
 * Returns the active AI provider based on environment variables.
 */
export function getActiveAIProvider(): "gemini" | "openai" | "mock" {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey.trim().length > 5) return "gemini";
  if (openaiKey && openaiKey.trim().length > 5) return "openai";
  return "mock";
}

/**
 * Analyzes client statement and follow-up Q&A using RAG + LLM (Gemini 1.5 Pro / GPT-4o)
 * with deterministic offline fallback.
 */
export async function analyzeCaseStatement(
  statement: string,
  answeredQuestions: Record<string, string> = {}
): Promise<CaseAnalysisResponse> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Task 1: RAG retrieval from trusted Bangladesh legal databases
  const keywords = extractLegalKeywords(statement);
  const ragResult = await searchTrustedLaws(keywords);

  const enrichedInterviewerPrompt = `
${INTERVIEWER_SYSTEM_PROMPT}

${ragResult.formattedContext}
`;

  // 1. Try Gemini (gemini-2.0-flash / gemini-1.5-flash / gemini-1.5-pro) if configured
  if (geminiKey && geminiKey.trim().length > 5) {
    const modelsToTry = [
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];
    for (const modelName of modelsToTry) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const prompt = `
${enrichedInterviewerPrompt}

USER RAW STATEMENT:
"${statement}"

ALREADY ANSWERED QUESTIONS:
${JSON.stringify(answeredQuestions, null, 2)}

Return a strict JSON matching CaseAnalysisResponseSchema:
{
  "caseTitleBn": "string",
  "caseCategory": "Criminal" | "Civil" | "Family" | "Special_Tribunal",
  "completenessScore": number (0-100),
  "extractedFacts": { ... },
  "applicableLaws": [ ... ],
  "followUpQuestions": [ ... ],
  "strategicAdviceForAdvocateBn": [ ... ],
  "contradictionsDetectedBn": [ ... ]
}
`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);
        const validated = CaseAnalysisResponseSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      } catch (err) {
        console.warn(`Gemini API call (${modelName}) failed, trying fallback:`, err);
      }
    }
  }

  // 2. Try OpenAI (gpt-4o) if configured
  if (openaiKey && openaiKey.trim().length > 5) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: enrichedInterviewerPrompt },
          {
            role: "user",
            content: `Statement: "${statement}"\n\nAnswers: ${JSON.stringify(answeredQuestions)}`,
          },
        ],
      });
      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        const validated = CaseAnalysisResponseSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      }
    } catch (err) {
      console.warn("OpenAI API call (gpt-4o) failed, falling back to mock engine:", err);
    }
  }

  // 3. Deterministic Mock Engine fallback
  return generateMockCaseAnalysis(statement, answeredQuestions);
}

/**
 * Generates ready-to-print court documents using LLM (Gemini 1.5 Pro / GPT-4o)
 * with RAG injection, or falls back to template engine.
 */
export async function generateLegalDraftWithLLM(
  docType: DraftDocType,
  caseTitle: string,
  rawStatement: string,
  templateData: Record<string, any>
): Promise<{ titleBn: string; contentHtml: string }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Retrieve trusted law snippets for drafting
  const keywords = extractLegalKeywords(rawStatement);
  const ragResult = await searchTrustedLaws(keywords);

  const enrichedDrafterPrompt = `
${DRAFTER_SYSTEM_PROMPT}

${ragResult.formattedContext}
`;

  // Try Gemini if available
  if (geminiKey && geminiKey.trim().length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const prompt = `
${enrichedDrafterPrompt}

DOCUMENT TYPE TO DRAFT: ${docType}
CASE TITLE: ${caseTitle}
CASE STATEMENT & FACTS:
${JSON.stringify(templateData, null, 2)}

Output clean, print-ready HTML inside <div class="legal-doc"> with formal Bangladeshi court layout.
`;
      const result = await model.generateContent(prompt);
      const html = result.response.text().trim();
      if (html.includes("<div") || html.includes("<p>")) {
        return {
          titleBn: `${docType} খসড়া`,
          contentHtml: html,
        };
      }
    } catch (err) {
      console.warn("Gemini drafting failed, using template engine:", err);
    }
  }

  // Try OpenAI if available
  if (openaiKey && openaiKey.trim().length > 5) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: enrichedDrafterPrompt },
          {
            role: "user",
            content: `Draft Document: ${docType}\nCase: ${caseTitle}\nFacts:\n${JSON.stringify(templateData, null, 2)}`,
          },
        ],
      });
      const html = completion.choices[0]?.message?.content?.trim();
      if (html && (html.includes("<div") || html.includes("<p>"))) {
        return {
          titleBn: `${docType} খসড়া`,
          contentHtml: html,
        };
      }
    } catch (err) {
      console.warn("OpenAI drafting failed, using template engine:", err);
    }
  }

  // Deterministic court template engine fallback
  return generateDocumentByType(docType, templateData as any);
}

/**
 * Extracts entities from Bengali OCR text using LLM or deterministic rules.
 */
export async function extractEntitiesFromOcr(
  ocrText: string
): Promise<Record<string, string>> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: { responseMimeType: "application/json" },
      });
      const prompt = `Extract legal entities from the following Bengali document OCR text into a key-value JSON (e.g., "category", "date", "identifiedName", "injuries", "amount"):
OCR TEXT:
"""${ocrText}"""`;
      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      return parsed;
    } catch {
      // fallback to deterministic extractor
    }
  }

  // Deterministic legal entity extractor
  const mapping: Record<string, string> = {};
  const text = ocrText;

  // Category
  if (
    text.includes("মেডিকেল") ||
    text.includes("ইনজুরি") ||
    text.includes("জখম") ||
    text.includes("হাসপাতাল") ||
    text.includes("সেলাই")
  ) {
    mapping["category"] = "মেডিকেল ইনজুরি রিপোর্ট";
  } else if (text.includes("চেক") || text.includes("ডিজঅনার") || text.includes("ব্যাংক")) {
    mapping["category"] = "চেক ও ডিজঅনার মেমো";
  } else if (
    text.includes("খতিয়ান") ||
    text.includes("পর্চা") ||
    text.includes("দাগ") ||
    text.includes("মৌজা")
  ) {
    mapping["category"] = "নালিশি খতিয়ান ও পর্চা";
  } else if (text.includes("দলিল") || text.includes("রেজিস্ট্রি") || text.includes("বায়না")) {
    mapping["category"] = "রেজিস্ট্রি বা মূল দলিল";
  } else {
    mapping["category"] = "দালিলিক প্রমাণ";
  }

  // Injuries
  if (
    text.includes("সেলাই") ||
    text.includes("জখম") ||
    text.includes("রক্তক্ষরণ") ||
    text.includes("আঘাত") ||
    text.includes("কোপ")
  ) {
    mapping["injuries"] = "মাথায় ধারালো/ভোঁতা অস্ত্রের রক্তাক্ত জখম ও সেলাই";
  }

  // Amounts
  const amountMatch = text.match(/(?:টাকা|টাকার পরিমাণ|মোট)[\s:]*([০-৯0-9,/-]+(?:\s*টাকা)?)/i);
  if (amountMatch) {
    mapping["amount"] = amountMatch[1];
  }

  // Dates
  const dateMatch = text.match(/(?:তারিখ|Date)[\s:]*([০-৯0-9/.-]+)/i);
  if (dateMatch) {
    mapping["date"] = dateMatch[1];
  }

  // Names
  const nameMatch = text.match(/(?:নাম|মালিক|রোগী|আসামি)[\s:]*([^\n,।]+)/i);
  if (nameMatch) {
    mapping["identifiedName"] = nameMatch[1].trim();
  }

  mapping["extractedAt"] = new Date().toISOString();
  return mapping;
}
