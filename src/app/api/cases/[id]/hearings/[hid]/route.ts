import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; hid: string }> }
) {
  try {
    const { id, hid } = await params;
    const body = await request.json();

    const allowedUpdates = [
      "date",
      "purpose",
      "judgeName",
      "outcomeBn",
      "orderSheetBn",
      "nextDate",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        if (key === "date" || key === "nextDate") {
          updates[key] = body[key] ? new Date(body[key]).toISOString() : null;
        } else {
          updates[key] = body[key];
        }
      }
    }

    const updated = await db.updateHearing(id, hid, updates);
    if (!updated) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            messageBn: "শুনানি পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    await db.logAudit("demo-user", "HEARING_UPDATED", { caseId: id, hearingId: hid });

    return NextResponse.json({
      ok: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/cases/[id]/hearings/[hid]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "শুনানি আপডেট করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; hid: string }> }
) {
  try {
    const { id, hid } = await params;
    const success = await db.deleteHearing(id, hid);

    if (!success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            messageBn: "শুনানি পাওয়া যায়নি বা মুছে ফেলা সম্ভব হয়নি।",
          },
        },
        { status: 404 }
      );
    }

    await db.logAudit("demo-user", "HEARING_DELETED", { caseId: id, hearingId: hid });

    return NextResponse.json({
      ok: true,
      data: { deleted: true, hearingId: hid },
    });
  } catch (error) {
    console.error("Error in DELETE /api/cases/[id]/hearings/[hid]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "শুনানি মুছে ফেলা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}
