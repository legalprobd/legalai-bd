import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const body = await request.json();
    const { nameOrQuery } = body;

    if (!nameOrQuery || nameOrQuery.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: { messageBn: "অনুসন্ধানের জন্য কমপক্ষে ২ অক্ষরের নাম বা নম্বর প্রদান করুন।" } },
        { status: 400 }
      );
    }

    const result = await db.checkConflict(nameOrQuery);

    await db.logAudit(authCheck.userId!, "CONFLICT_OF_INTEREST_CHECKED", {
      query: nameOrQuery,
      hasConflict: result.hasConflict,
      conflictCount: result.conflicts.length,
    });

    return NextResponse.json({
      ok: true,
      data: {
        query: nameOrQuery,
        hasConflict: result.hasConflict,
        conflicts: result.conflicts,
        checkedAt: new Date().toISOString(),
        ethicalStandardBn: "বাংলাদেশ বার কাউন্সিল ক্যাননস অফ প্রফেশনাল কন্ডাক্ট (অধ্যায় ২, বিধি ১-৪)",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/conflict-check:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "কনফ্লিক্ট অফ ইন্টারেস্ট যাচাইকরণে ত্রুটি হয়েছে।" } },
      { status: 500 }
    );
  }
}
