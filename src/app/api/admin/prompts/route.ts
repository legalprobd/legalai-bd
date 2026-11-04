import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", messageBn: "আপনার এই প্যানেলে প্রবেশাধিকার নেই।" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { interviewerPrompt, drafterPrompt } = body;

    if (!interviewerPrompt || !drafterPrompt) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", messageBn: "উভয় প্রম্পট পূরণ করা আবশ্যক।" } },
        { status: 400 }
      );
    }

    await db.saveCustomPrompts({
      interviewerPrompt,
      drafterPrompt,
    });

    await db.logAudit(authCheck.userId!, "PROMPT_UPDATED", {
      updatedBy: authCheck.userEmail,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      data: { messageBn: "AI প্রম্পট সফলভাবে হালনাগাদ করা হয়েছে।" },
    });
  } catch (error) {
    console.error("POST /api/admin/prompts error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", messageBn: "প্রম্পট সংরক্ষণ ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
