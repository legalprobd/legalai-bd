import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { ok: false, error: { code: "WEAK_PASSWORD", messageBn: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" } },
        { status: 400 }
      );
    }

    const user = await db.getUser(authCheck.userId!);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", messageBn: "ব্যবহারকারী পাওয়া যায়নি।" } },
        { status: 404 }
      );
    }

    // Verify current password if user has one
    if (user.password && user.password !== currentPassword) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_CURRENT_PASSWORD", messageBn: "বর্তমান পাসওয়ার্ড সঠিক নয়।" } },
        { status: 400 }
      );
    }

    await db.updateUser(authCheck.userId!, { password: newPassword });
    await db.logAudit(authCheck.userId!, "PASSWORD_CHANGED", {});

    return NextResponse.json({
      ok: true,
      data: { messageBn: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।" },
    });
  } catch (error) {
    console.error("POST /api/user/change-password error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", messageBn: "পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
