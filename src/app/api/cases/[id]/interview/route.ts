import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeCaseStatement } from "@/lib/ai/router";
import { detectContradictions, enforcePlaceholders } from "@/lib/ai/guards";
import { applySectionUpgrades } from "@/lib/law/upgradeRules";
import { computeCompleteness } from "@/lib/law/completeness";
import { generateDocumentByType } from "@/lib/templates/bdCourtTemplates";
import { DraftDocType, GeneratedDocItem } from "@/lib/ai/schemas";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingCase = await db.getCaseById(id);

    if (!existingCase) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            messageBn: "উক্ত মামলাটি খুঁজে পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { answers, rawStatement } = body as {
      answers: Record<string, string>; // { fieldKey: answerValue }
      rawStatement?: string;
    };

    const isNewStatement = Boolean(rawStatement && rawStatement.trim() !== existingCase.rawStatement.trim());
    const effectiveStatement = rawStatement || existingCase.rawStatement;

    // Detect contradictions
    const contradictions = detectContradictions(
      { rawStatement: effectiveStatement },
      answers || {}
    );

    // Merge answers into questions
    let baseQuestions = isNewStatement ? [] : existingCase.questions;
    
    const updatedQuestions = baseQuestions.map((q) => {
      if (answers && answers[q.fieldKey] !== undefined) {
        return {
          ...q,
          answerBn: answers[q.fieldKey],
          isAnswered: true,
        };
      }
      return q;
    });

    // Build comprehensive answers map
    const allAnswersMap: Record<string, string> = isNewStatement ? (answers || {}) : {};
    for (const q of updatedQuestions) {
      if (q.isAnswered && q.answerBn) {
        allAnswersMap[q.fieldKey] = q.answerBn;
      }
    }

    // Re-analyze using the AI Legal Engine
    const reAnalysis = await analyzeCaseStatement(
      effectiveStatement,
      allAnswersMap
    );

    // Extract applicable section numbers
    const currentSections = reAnalysis.applicableLaws.map((l) =>
      l.section.replace(/[^0-9a-zA-Z_]/g, "")
    );

    // Apply deterministic Section Upgrades
    const { upgradedSections, appliedReasons } = applySectionUpgrades(
      currentSections,
      allAnswersMap
    );

    // Generate questions
    let finalQuestions;
    if (isNewStatement) {
      finalQuestions = reAnalysis.followUpQuestions.map((q, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        fieldKey: q.fieldKey,
        questionBn: q.questionBn,
        inputType: q.inputType,
        optionsBn: q.optionsBn,
        legalImportanceBn: q.legalImportanceBn,
        answerBn: allAnswersMap[q.fieldKey] || null,
        isAnswered: Boolean(allAnswersMap[q.fieldKey]),
      }));
    } else {
      const existingFieldKeys = new Set(updatedQuestions.map((q) => q.fieldKey));
      const newQuestions = reAnalysis.followUpQuestions
        .filter((q) => !existingFieldKeys.has(q.fieldKey))
        .map((q, idx) => ({
          id: `q-follow-${Date.now()}-${idx}`,
          fieldKey: q.fieldKey,
          questionBn: q.questionBn,
          inputType: q.inputType,
          optionsBn: q.optionsBn,
          legalImportanceBn: q.legalImportanceBn,
          answerBn: null,
          isAnswered: false,
        }));
      finalQuestions = [...updatedQuestions, ...newQuestions];
    }

    const computedScore = reAnalysis.completenessScore;
    const status = computedScore >= 90 ? "READY_TO_DRAFT" : "INTERVIEWING";

    const effectiveCategory = reAnalysis.caseCategory || existingCase.category;
    const primaryDocType: DraftDocType =
      effectiveCategory === "Civil"
        ? "PLAINT"
        : effectiveCategory === "Special_Tribunal"
        ? "CR_PETITION"
        : "FIR";

    const effectiveFacts = isNewStatement
      ? reAnalysis.extractedFacts
      : {
          ...existingCase.extractedFacts,
          ...reAnalysis.extractedFacts,
          weaponsUsed: allAnswersMap["weapon_used"]
            ? [allAnswersMap["weapon_used"]]
            : reAnalysis.extractedFacts.weaponsUsed,
          injuriesAndMedical:
            allAnswersMap["injury_severity"] ||
            reAnalysis.extractedFacts.injuriesAndMedical ||
            null,
        };

    const templateData = {
      courtStation:
        existingCase.courtName ||
        (effectiveCategory === "Civil"
          ? "বিজ্ঞ সিনিয়র সহকারী জজ আদালত"
          : "বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত"),
      policeStation:
        effectiveFacts.policeStationAndDistrict || "কোতোয়ালি",
      district: "ঢাকা",
      complainantName:
        effectiveFacts.complainantName || "**[বাদীর নাম]**",
      complainantDetails:
        effectiveFacts.complainantDetails ||
        "পিতা: **[পিতার নাম]**, সাং: **[ঠিকানা]**",
      accusedList: effectiveFacts.accusedList,
      unknownAccusedCount:
        effectiveFacts.unknownAccusedCount || "৪/৫",
      incidentDate:
        effectiveFacts.incidentDate ||
        "গতকল্য রাত্রি আনুমানিক ১০:৩০ ঘটিকা",
      incidentTime:
        effectiveFacts.incidentTime || "রাত্রি ১০:৩০ ঘটিকা",
      incidentPlace:
        effectiveFacts.incidentPlace || "বাদীর নিজ বসতভিটায়",
      weaponsUsed: effectiveFacts.weaponsUsed,
      injuriesAndMedical: effectiveFacts.injuriesAndMedical || undefined,
      stolenOrDamagedItems: effectiveFacts.stolenOrDamagedItems || undefined,
      totalFinancialLoss:
        effectiveFacts.totalFinancialLoss || "১,৫০,০০০/- টাকা",
      motiveOrPreviousDispute:
        effectiveFacts.motiveOrPreviousDispute || undefined,
      witnesses: effectiveFacts.witnesses,
      applicableLaws: reAnalysis.applicableLaws,
      caseTitle: reAnalysis.caseTitleBn,
    };

    const generated = generateDocumentByType(primaryDocType, templateData);
    const newDoc: GeneratedDocItem = {
      id: `doc-${primaryDocType.toLowerCase()}-${Date.now()}`,
      docType: primaryDocType,
      titleBn: generated.titleBn,
      contentHtml: enforcePlaceholders(generated.contentHtml),
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const documentsToSave = [newDoc];

    const updatedCase = await db.updateCase(id, {
      title: reAnalysis.caseTitleBn || existingCase.title,
      category: effectiveCategory,
      rawStatement: effectiveStatement,
      extractedFacts: effectiveFacts,
      applicableLaws: reAnalysis.applicableLaws,
      completenessScore: computedScore,
      status,
      strategicAdvice: [
        ...reAnalysis.strategicAdviceForAdvocateBn,
        ...appliedReasons,
      ],
      contradictionsDetected: contradictions,
      questions: finalQuestions,
      documents: documentsToSave,
    });

    await db.logAudit(existingCase.userId, "CASE_INTERVIEW_UPDATED", {
      caseId: id,
      newScore: computedScore,
      status,
    });

    // Check if client requested SSE stream
    const acceptHeader = request.headers.get("accept");
    if (acceptHeader && acceptHeader.includes("text/event-stream")) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "progress", score: computedScore })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "complete", case: updatedCase })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: updatedCase,
    });
  } catch (error) {
    console.error("Error in POST /api/cases/[id]/interview:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "প্রশ্নোত্তর আপডেট এবং ধারা পুনর্মূল্যায়ন ব্যর্থ হয়েছে।",
        },
      },
      { status: 500 }
    );
  }
}
