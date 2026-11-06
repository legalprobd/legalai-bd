import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformOwner } from "@/lib/auth-check";

export async function GET() {
  try {
    const authCheck = await requirePlatformOwner();
    if (!authCheck.ok) return authCheck.response!;

    const stats = await db.getPlatformStats();
    return NextResponse.json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in GET /api/super-admin/stats:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "প্ল্যাটফর্ম পরিসংখ্যান লোড ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
