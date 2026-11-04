import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateDeadline, LIMITATION_RULES } from "@/lib/law/limitation";
import { requireAuth } from "@/lib/auth-check";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { id } = await params;
    const caseRecord = await db.getCaseById(id);

    if (!caseRecord) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CASE_NOT_FOUND",
            messageBn: "মামলাটি পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    const defaultCaseType =
      caseRecord.limitationCaseType ||
      (caseRecord.category === "Civil" ? "CIVIL_POSSESSION_RECOVERY" : "CRIMINAL_FIR");

    const defaultTriggerDate =
      caseRecord.limitationTriggerDate ||
      caseRecord.filingDate ||
      caseRecord.createdAt ||
      new Date().toISOString();

    const calculation = calculateDeadline(defaultCaseType, defaultTriggerDate);

    return NextResponse.json({
      ok: true,
      data: {
        calculation,
        availableRules: Object.values(LIMITATION_RULES),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/cases/[id]/limitation:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "তামাদি হিসাব তথ্য লোড করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { id } = await params;
    const body = await request.json();
    const { caseType, triggerDate } = body;

    if (!caseType || !triggerDate) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            messageBn: "মামলার ধরন ও ঘটনার/ট্রিগারের তারিখ প্রদান আবশ্যক।",
          },
        },
        { status: 400 }
      );
    }

    const calculation = calculateDeadline(caseType, triggerDate);

    const updatedCase = await db.updateCase(id, {
      limitationCaseType: caseType,
      limitationTriggerDate: calculation.triggerDate,
      limitationDeadline: calculation.deadline,
    });

    if (!updatedCase) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CASE_NOT_FOUND",
            messageBn: "মামলাটি পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    await db.logAudit("demo-user", "LIMITATION_CALCULATED", {
      caseId: id,
      caseType,
      triggerDate: calculation.triggerDate,
      deadline: calculation.deadline,
      status: calculation.status,
    });

    return NextResponse.json({
      ok: true,
      data: {
        calculation,
        case: updatedCase,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/cases/[id]/limitation:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "তামাদি হিসাব সংরক্ষণ করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}
