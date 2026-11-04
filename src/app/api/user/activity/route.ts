import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const allLogs = await db.getAuditLogs();
    // Get user-specific logs or fallback to all chamber logs
    const userLogs = allLogs.filter(
      (l) => l.userId === authCheck.userId || l.userId === "demo-user-advocate-001"
    );

    const recentLogs = (userLogs.length > 0 ? userLogs : allLogs).slice(0, 5);

    return NextResponse.json({
      ok: true,
      data: recentLogs,
    });
  } catch (error) {
    console.error("GET /api/user/activity error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", messageBn: "অ্যাক্টিভিটি লোড করা যায়নি।" } },
      { status: 500 }
    );
  }
}
