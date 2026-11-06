import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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
            code: "NOT_FOUND",
            messageBn: "উক্ত মামলাটি খুঁজে পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: caseRecord,
    });
  } catch (error) {
    console.error("Error in GET /api/cases/[id]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "মামলার তথ্য লোড করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { id } = await params;
    const body = await request.json();
    const updated = await db.updateCase(id, body);

    if (!updated) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            messageBn: "মামলাটি আপডেট করা যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error in PATCH /api/cases/[id]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "মামলা আপডেট ব্যর্থ হয়েছে।",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    if (authCheck.role === "JUNIOR") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            messageBn: "জুনিয়র অ্যাডভোকেটদের মামলা মুছে ফেলার অনুমতি নেই। চেম্বার প্রধানের অনুমতি প্রয়োজন।",
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const success = await db.deleteCase(id);
    return NextResponse.json({
      ok: success,
      data: { id, deleted: success },
    });
  } catch (error) {
    console.error("Error in DELETE /api/cases/[id]:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "মামলা মুছে ফেলা সম্ভব হয়নি।",
        },
      },
      { status: 500 }
    );
  }
}
