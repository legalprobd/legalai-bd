import { CaseAnalysisResponse, CaseAnalysisResponseSchema } from "./schemas";
import { generateMockCaseAnalysis } from "./mock";
import { INTERVIEWER_SYSTEM_PROMPT } from "./prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function analyzeCaseStatement(
  statement: string,
  answeredQuestions: Record<string, string> = {}
): Promise<CaseAnalysisResponse> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. Try Gemini if configured
  if (geminiKey && geminiKey.trim().length > 5) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const prompt = `
${INTERVIEWER_SYSTEM_PROMPT}

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
      console.warn("Gemini API call failed, falling back to mock engine:", err);
    }
  }

  // 2. Try OpenAI if configured
  if (openaiKey && openaiKey.trim().length > 5) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
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
      console.warn("OpenAI API call failed, falling back to mock engine:", err);
    }
  }

  // 3. Deterministic Mock Engine fallback
  return generateMockCaseAnalysis(statement, answeredQuestions);
}
