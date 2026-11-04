import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";
import { INTERVIEWER_SYSTEM_PROMPT, DRAFTER_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    if (!authCheck.isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", messageBn: "আপনার এই প্যানেলে প্রবেশাধিকার নেই।" } },
        { status: 403 }
      );
    }

    const users = await db.getAllUsers();
    const cases = await db.getCases();
    const auditLogs = await db.getAuditLogs();
    const customPrompts = await db.getCustomPrompts();

    // Calculate cases per user
    const userStats = users.map((u) => {
      const userCases = cases.filter((c) => c.userId === u.id);
      const { password, ...safe } = u;
      return {
        ...safe,
        caseCount: userCases.length,
      };
    });

    const activePrompts = {
      interviewerPrompt: customPrompts?.interviewerPrompt || INTERVIEWER_SYSTEM_PROMPT.trim(),
      drafterPrompt: customPrompts?.drafterPrompt || DRAFTER_SYSTEM_PROMPT.trim(),
    };

    return NextResponse.json({
      ok: true,
      data: {
        users: userStats,
        prompts: activePrompts,
        auditLogs: auditLogs.slice(0, 50),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", messageBn: "অ্যাডমিন তথ্য লোড করতে ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
