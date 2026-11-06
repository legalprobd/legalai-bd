import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const precedents = await db.searchPrecedents(query);

    return NextResponse.json({
      ok: true,
      data: precedents,
    });
  } catch (error) {
    console.error("Error in GET /api/research:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "আইনি নজির ও রেফারেন্স অনুসন্ধানে সমস্যা হয়েছে।" } },
      { status: 500 }
    );
  }
}
