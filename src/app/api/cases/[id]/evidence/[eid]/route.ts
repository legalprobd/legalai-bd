import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteStoredFile } from "@/lib/storage";
import { requireAuth } from "@/lib/auth-check";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { id, eid } = await params;
    const body = await request.json();

    const allowedFields = ["factMapping", "ocrTextBn", "fileName"];
    const updates: Record<string, unknown> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updated = await db.updateEvidence(id, eid, updates);
    if (!updated) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            messageBn: "প্রমাণপত্রটি পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    await db.logAudit("demo-user", "EVIDENCE_UPDATED", { caseId: id, evidenceId: eid });

    return NextResponse.json({
      ok: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/cases/[id]/evidence/[eid]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "প্রমাণপত্রের তথ্য আপডেট করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { id, eid } = await params;
    const evidenceList = await db.getEvidence(id);
    const target = evidenceList.find((e) => e.id === eid);

    if (!target) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            messageBn: "প্রমাণপত্রটি পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    // Attempt to delete physical file if local
    deleteStoredFile(target.url);

    const deleted = await db.deleteEvidence(id, eid);
    if (!deleted) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "DELETE_FAILED",
            messageBn: "ডাটাবেজ থেকে মুছে ফেলা যায়নি।",
          },
        },
        { status: 500 }
      );
    }

    await db.logAudit("demo-user", "EVIDENCE_DELETED", { caseId: id, evidenceId: eid });

    return NextResponse.json({
      ok: true,
      data: { deleted: true, evidenceId: eid },
    });
  } catch (error) {
    console.error("Error in DELETE /api/cases/[id]/evidence/[eid]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "প্রমাণপত্র মুছে ফেলা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}
