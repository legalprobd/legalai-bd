import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function GET(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const user = await db.getUser(authCheck.userId!);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", messageBn: "ব্যবহারকারী খুঁজে পাওয়া যায়নি।" } },
        { status: 404 }
      );
    }

    const { password, ...safeUser } = user;
    return NextResponse.json({ ok: true, data: safeUser });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", messageBn: "প্রোফাইল লোড করতে সমস্যা হয়েছে।" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const body = await request.json();
    const { fullName, phone, barCouncilId, chamberName, courtStation } = body;

    const updates: Record<string, string> = {};
    if (typeof fullName === "string" && fullName.trim()) updates.fullName = fullName.trim();
    if (typeof phone === "string") updates.phone = phone.trim();
    if (typeof barCouncilId === "string") updates.barCouncilId = barCouncilId.trim();
    if (typeof chamberName === "string") updates.chamberName = chamberName.trim();
    if (typeof courtStation === "string") updates.courtStation = courtStation.trim();

    const updatedUser = await db.updateUser(authCheck.userId!, updates);
    if (!updatedUser) {
      return NextResponse.json(
        { ok: false, error: { code: "UPDATE_FAILED", messageBn: "প্রোফাইল আপডেট ব্যর্থ হয়েছে।" } },
        { status: 400 }
      );
    }

    await db.logAudit(authCheck.userId!, "PROFILE_UPDATED", updates);

    const { password, ...safeUser } = updatedUser;
    return NextResponse.json({ ok: true, data: safeUser });
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", messageBn: "প্রোফাইল সংরক্ষণ করতে সমস্যা হয়েছে।" } },
      { status: 500 }
    );
  }
}
