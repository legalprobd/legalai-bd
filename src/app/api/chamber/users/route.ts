import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function GET() {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const user = await db.getUser(authCheck.userId!);
    const chamberId = user?.chamberId || "chamber-rahman-associates";
    const users = await db.getChamberUsers(chamberId);

    return NextResponse.json({
      ok: true,
      data: users,
    });
  } catch (error) {
    console.error("Error in GET /api/chamber/users:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "চেম্বার সদস্যদের তালিকা লোড করা যায়নি।" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    if (authCheck.role === "JUNIOR") {
      return NextResponse.json(
        { ok: false, error: { messageBn: "শুধুমাত্র চেম্বার প্রধান নতুন সদস্য বা জুনিয়র ইনভাইট করতে পারেন।" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, fullName } = body;

    if (!email || !fullName) {
      return NextResponse.json(
        { ok: false, error: { messageBn: "নাম এবং ইমেইল ঠিকানা প্রদান আবশ্যক।" } },
        { status: 400 }
      );
    }

    const user = await db.getUser(authCheck.userId!);
    const chamberId = user?.chamberId || "chamber-rahman-associates";

    const invitedJunior = await db.inviteJuniorToChamber(chamberId, email, fullName);

    return NextResponse.json({
      ok: true,
      data: invitedJunior,
      messageBn: "জুনিয়র অ্যাডভোকেটকে চেম্বারে সফলভাবে যুক্ত করা হয়েছে।",
    });
  } catch (error) {
    console.error("Error in POST /api/chamber/users:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "সদস্য ইনভাইটেশন ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
