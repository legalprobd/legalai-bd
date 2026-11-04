import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeCaseStatement } from "@/lib/ai/router";
import { CaseRecord } from "@/lib/ai/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const cases = await db.getCases(userId);

    return NextResponse.json({
      ok: true,
      data: cases,
    });
  } catch (error) {
    console.error("Error in GET /api/cases:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "মামলার তালিকা লোড করতে সমস্যা হয়েছে।",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawStatement, title, category, userId, clientPhone } = body;

    if (!rawStatement || rawStatement.trim().length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            messageBn: "ক্লায়েন্টের প্রাথমিক জবানবন্দি প্রদান করা আবশ্যক।",
          },
        },
        { status: 400 }
      );
    }

    // Run AI / Legal Engine analysis
    const analysis = await analyzeCaseStatement(rawStatement);

    const newCaseId = "case-" + Date.now();
    const effectiveUserId = userId || "demo-user-advocate-001";

    const newCase: CaseRecord = {
      id: newCaseId,
      userId: effectiveUserId,
      title: title || analysis.caseTitleBn || "নতুন মামলা",
      category: category || analysis.caseCategory || "Criminal",
      priority: "NORMAL",
      clientPhone: clientPhone || null,
      rawStatement,
      extractedFacts: analysis.extractedFacts,
      applicableLaws: analysis.applicableLaws,
      completenessScore: analysis.completenessScore,
      status: "INTERVIEWING",
      strategicAdvice: analysis.strategicAdviceForAdvocateBn,
      contradictionsDetected: analysis.contradictionsDetectedBn || [],
      questions: analysis.followUpQuestions.map((q, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        fieldKey: q.fieldKey,
        questionBn: q.questionBn,
        inputType: q.inputType,
        optionsBn: q.optionsBn,
        legalImportanceBn: q.legalImportanceBn,
        answerBn: null,
        isAnswered: false,
      })),
      documents: [],
      hearings: [],
      evidenceFiles: [],
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.createCase(newCase);
    await db.logAudit(effectiveUserId, "CASE_CREATED", { caseId: newCaseId, title: newCase.title });

    return NextResponse.json({
      ok: true,
      data: newCase,
    });
  } catch (error) {
    console.error("Error in POST /api/cases:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "নতুন মামলা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
        },
      },
      { status: 500 }
    );
  }
}
