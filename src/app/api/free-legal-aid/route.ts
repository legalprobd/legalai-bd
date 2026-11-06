import { NextResponse } from "next/server";
import { analyzeCaseStatement } from "@/lib/ai/router";
import { generateDocumentByType } from "@/lib/templates/bdCourtTemplates";
import { DraftDocType } from "@/lib/ai/schemas";
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed, resetInSec } = checkRateLimit(`free-aid:${ip}`, 30, 60 * 1000);
    if (!allowed) {
      return rateLimitExceededResponse(resetInSec);
    }

    const body = await request.json();
    const { statement, clientName, clientPhone, clientAddress } = body as {
      statement: string;
      clientName?: string;
      clientPhone?: string;
      clientAddress?: string;
    };

    if (!statement || statement.trim().length < 5) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            messageBn: "অনুগ্রহ করে আপনার ঘটনার বিবরণ অন্তত ৫ অক্ষরে বাংলায় লিখুন।",
          },
        },
        { status: 400 }
      );
    }

    // Run AI Analysis
    const analysis = await analyzeCaseStatement(statement.trim());

    // Determine if GD is suitable
    const isNuisance =
      analysis.caseTitleBn.includes("ধূমপান") ||
      analysis.caseTitleBn.includes("সিগারেট") ||
      analysis.caseTitleBn.includes("উপদ্রব") ||
      analysis.caseTitleBn.includes("শব্দ") ||
      analysis.caseTitleBn.includes("গান") ||
      analysis.caseTitleBn.includes("হারানো");

    const docType: DraftDocType = isNuisance ? "GD" : "GD"; // Citizen portal provides free GD format

    const effectiveComplainantName = clientName?.trim() || analysis.extractedFacts.complainantName || "ফরিয়াদী / ভুক্তভোগী নিজে";
    const effectivePhone = clientPhone?.trim() || "**[মোবাইল নম্বর]**";
    const effectiveAddress = clientAddress?.trim() || "সাং: [গ্রাম/মহল্লা], থানা: কোতোয়ালি, জেলা: ঢাকা";

    const templateData = {
      courtStation: "বিজ্ঞ আদালত",
      policeStation: analysis.extractedFacts.policeStationAndDistrict || "কোতোয়ালি",
      district: "ঢাকা",
      complainantName: effectiveComplainantName,
      complainantDetails: `পিতা: **[পিতার নাম]**, সাং: ${effectiveAddress}`,
      accusedList: analysis.extractedFacts.accusedList,
      unknownAccusedCount: analysis.extractedFacts.unknownAccusedCount || "",
      incidentDate: analysis.extractedFacts.incidentDate || "চলমান ঘটনা",
      incidentPlace: analysis.extractedFacts.incidentPlace || "ঘটনাস্থল",
      weaponsUsed: analysis.extractedFacts.weaponsUsed,
      injuriesAndMedical: analysis.extractedFacts.injuriesAndMedical || undefined,
      totalFinancialLoss: analysis.extractedFacts.totalFinancialLoss || undefined,
      motiveOrPreviousDispute: analysis.extractedFacts.motiveOrPreviousDispute || undefined,
      witnesses: analysis.extractedFacts.witnesses,
      applicableLaws: analysis.applicableLaws,
      caseTitle: analysis.caseTitleBn,
    };

    const generatedDoc = generateDocumentByType(docType, templateData);

    return NextResponse.json({
      ok: true,
      data: {
        caseTitleBn: analysis.caseTitleBn,
        category: analysis.caseCategory,
        completenessScore: analysis.completenessScore,
        extractedFacts: analysis.extractedFacts,
        applicableLaws: analysis.applicableLaws,
        strategicAdvice: analysis.strategicAdviceForAdvocateBn,
        generatedGdHtml: generatedDoc.contentHtml,
        generatedGdTitle: generatedDoc.titleBn,
        suggestedDocType: isNuisance ? "GD" : "COURT_CASE",
        isCourtCaseRequired: !isNuisance && analysis.applicableLaws.some(l => !l.titleBn.includes("পাবলিক")),
      },
    });
  } catch (error) {
    console.error("Error in free-legal-aid API:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          messageBn: "বিশ্লেষণ সম্পন্ন করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        },
      },
      { status: 500 }
    );
  }
}
