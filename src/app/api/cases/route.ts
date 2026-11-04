import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeCaseStatement } from "@/lib/ai/router";
import { CaseRecord, DraftDocType, GeneratedDocItem } from "@/lib/ai/schemas";
import { generateDocumentByType } from "@/lib/templates/bdCourtTemplates";
import { enforcePlaceholders } from "@/lib/ai/guards";
import { requireAuth } from "@/lib/auth-check";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || authCheck.userId;
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
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

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

    const effectiveCategory = category || analysis.caseCategory || "Criminal";
    const primaryDocType: DraftDocType =
      effectiveCategory === "Civil"
        ? "PLAINT"
        : effectiveCategory === "Special_Tribunal"
        ? "CR_PETITION"
        : "FIR";

    const courtStation =
      effectiveCategory === "Civil"
        ? "বিজ্ঞ সিনিয়র সহকারী জজ আদালত"
        : "বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত";

    const initialTemplateData = {
      courtStation,
      policeStation: analysis.extractedFacts.policeStationAndDistrict || "কোতোয়ালি",
      district: "ঢাকা",
      complainantName: analysis.extractedFacts.complainantName || "**[বাদীর নাম]**",
      complainantDetails: analysis.extractedFacts.complainantDetails || "পিতা: **[পিতার নাম]**, সাং: **[ঠিকানা]**",
      accusedList: analysis.extractedFacts.accusedList,
      unknownAccusedCount: analysis.extractedFacts.unknownAccusedCount || "৪/৫",
      incidentDate: analysis.extractedFacts.incidentDate || "গতকল্য রাত্রি আনুমানিক ১০:৩০ ঘটিকা",
      incidentTime: analysis.extractedFacts.incidentTime || "রাত্রি ১০:৩০ ঘটিকা",
      incidentPlace: analysis.extractedFacts.incidentPlace || "বাদীর নিজ বসতভিটায়",
      weaponsUsed: analysis.extractedFacts.weaponsUsed,
      injuriesAndMedical: analysis.extractedFacts.injuriesAndMedical || undefined,
      stolenOrDamagedItems: analysis.extractedFacts.stolenOrDamagedItems || undefined,
      totalFinancialLoss: analysis.extractedFacts.totalFinancialLoss || undefined,
      motiveOrPreviousDispute: analysis.extractedFacts.motiveOrPreviousDispute || undefined,
      witnesses: analysis.extractedFacts.witnesses,
      applicableLaws: analysis.applicableLaws,
      caseTitle: analysis.caseTitleBn,
    };

    const initialGenerated = generateDocumentByType(primaryDocType, initialTemplateData);
    const initialDoc: GeneratedDocItem = {
      id: `doc-${primaryDocType.toLowerCase()}-${Date.now()}`,
      docType: primaryDocType,
      titleBn: initialGenerated.titleBn,
      contentHtml: enforcePlaceholders(initialGenerated.contentHtml),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newCase: CaseRecord = {
      id: newCaseId,
      userId: effectiveUserId,
      title: title || analysis.caseTitleBn || "নতুন মামলা",
      category: effectiveCategory,
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
      documents: [initialDoc],
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
