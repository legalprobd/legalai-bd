import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    let days = 30;
    try {
      const daysParam = request.nextUrl.searchParams.get("days");
      if (daysParam) {
        const parsed = parseInt(daysParam, 10);
        if (!isNaN(parsed)) days = parsed;
      }
    } catch {
      // fallback to default
    }

    const hearings = await db.getUpcomingHearings(days);

    return NextResponse.json({
      ok: true,
      data: hearings,
    });
  } catch (error) {
    console.error("Error in GET /api/hearings/upcoming:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "আসন্ন শুনানির তালিকা লোড করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}
