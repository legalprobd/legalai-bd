import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { HearingItem } from "@/lib/ai/schemas";
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

    const hearings = await db.getHearings(id);

    return NextResponse.json({
      ok: true,
      data: hearings,
    });
  } catch (error) {
    console.error("Error in GET /api/cases/[id]/hearings:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "শুনানির তালিকা লোড করা যায়নি।",
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
    const { date, purpose, judgeName, outcomeBn, orderSheetBn, nextDate } = body;

    if (!date || !purpose) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            messageBn: "শুনানির তারিখ ও উদ্দেশ্য উল্লেখ করা আবশ্যক।",
          },
        },
        { status: 400 }
      );
    }

    const hearing: HearingItem = {
      id: "hearing-" + Date.now(),
      caseId: id,
      date: new Date(date).toISOString(),
      purpose,
      judgeName: judgeName || null,
      outcomeBn: outcomeBn || null,
      orderSheetBn: orderSheetBn || null,
      nextDate: nextDate ? new Date(nextDate).toISOString() : null,
      createdAt: new Date().toISOString(),
    };

    await db.addHearing(id, hearing);
    await db.logAudit("demo-user", "HEARING_ADDED", { caseId: id, hearingId: hearing.id });

    return NextResponse.json({
      ok: true,
      data: hearing,
    });
  } catch (error) {
    console.error("Error in POST /api/cases/[id]/hearings:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "শুনানির তথ্য সংরক্ষণ করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}
