import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DraftRequestSchema, DraftDocType, GeneratedDocItem } from "@/lib/ai/schemas";
import { generateDocumentByType } from "@/lib/templates/bdCourtTemplates";
import { enforcePlaceholders } from "@/lib/ai/guards";
import { convertUnicodeToBijoy } from "@/lib/utils/bijoyConverter";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseRecord = await db.getCaseById(id);

    if (!caseRecord) {
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
    const validatedReq = DraftRequestSchema.safeParse(body);

    if (!validatedReq.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            messageBn: "ডকুমেন্ট রিকোয়েস্টের তথ্য সঠিক নয়।",
            details: validatedReq.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { docType, courtNameBn, fontMode } = validatedReq.data;

    // Build template data from extracted facts
    const templateData = {
      courtStation: courtNameBn || caseRecord.courtName || "বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত",
      policeStation: caseRecord.extractedFacts.policeStationAndDistrict || "কোতোয়ালি",
      district: "ঢাকা",
      complainantName: caseRecord.extractedFacts.complainantName || "**[বাদীর নাম]**",
      complainantDetails: caseRecord.extractedFacts.complainantDetails || "পিতা: **[পিতার নাম]**, সাং: **[ঠিকানা]**",
      accusedList: caseRecord.extractedFacts.accusedList,
      unknownAccusedCount: caseRecord.extractedFacts.unknownAccusedCount || "৪/৫",
      incidentDate: caseRecord.extractedFacts.incidentDate || "গতকল্য রাত্রি আনুমানিক ১০:৩০ ঘটিকা",
      incidentTime: caseRecord.extractedFacts.incidentTime || "রাত্রি ১০:৩০ ঘটিকা",
      incidentPlace: caseRecord.extractedFacts.incidentPlace || "বাদীর নিজ বসতভিটায়",
      weaponsUsed: caseRecord.extractedFacts.weaponsUsed,
      injuriesAndMedical: caseRecord.extractedFacts.injuriesAndMedical || "মাথায় গুরুতর রক্তাক্ত জখম, হাসপাতালে চিকিৎসাধীন",
      stolenOrDamagedItems: caseRecord.extractedFacts.stolenOrDamagedItems || "নগদ টাকা ও আসবাবপত্র ভাঙচুর",
      totalFinancialLoss: caseRecord.extractedFacts.totalFinancialLoss || "১,৫০,০০০/- টাকা",
      motiveOrPreviousDispute: caseRecord.extractedFacts.motiveOrPreviousDispute || "পূর্বশত্রুতা ও পারিবারিক বিরোধ",
      witnesses: caseRecord.extractedFacts.witnesses,
      applicableLaws: caseRecord.applicableLaws,
      caseTitle: caseRecord.title,
    };

    const generated = generateDocumentByType(docType as DraftDocType, templateData);
    let finalHtml = enforcePlaceholders(generated.contentHtml);

    // If Bijoy font mode requested, convert Unicode text in HTML to Bijoy SutonnyMJ
    if (fontMode === "bijoy") {
      finalHtml = convertUnicodeToBijoy(finalHtml);
    }

    const docId = `doc-${docType.toLowerCase()}-${Date.now()}`;
    const newDoc: GeneratedDocItem = {
      id: docId,
      docType: docType as DraftDocType,
      titleBn: generated.titleBn,
      contentHtml: finalHtml,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveDocument(id, newDoc);
    await db.updateUserCredits(caseRecord.userId, 1);
    await db.logAudit(caseRecord.userId, "DOCUMENT_GENERATED", {
      caseId: id,
      docType,
      docId,
    });

    return NextResponse.json({
      ok: true,
      data: newDoc,
    });
  } catch (error) {
    console.error("Error in POST /api/cases/[id]/generate:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "আইনি দলিল প্রস্তুত করতে ব্যর্থ হয়েছে।",
        },
      },
      { status: 500 }
    );
  }
}
