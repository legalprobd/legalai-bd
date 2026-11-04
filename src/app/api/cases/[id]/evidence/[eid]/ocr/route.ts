import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
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

    const stubText = "OCR will be added in Stage 5";

    await db.updateEvidence(id, eid, {
      ocrTextBn: stubText,
    });

    return NextResponse.json({
      ok: true,
      data: {
        evidenceId: eid,
        ocrTextBn: stubText,
        message: "OCR will be added in Stage 5",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/cases/[id]/evidence/[eid]/ocr:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "OCR প্রসেসিং সম্ভব হয়নি।",
        },
      },
      { status: 500 }
    );
  }
}
