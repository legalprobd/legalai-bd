import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function GET() {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const clients = await db.getClients();
    return NextResponse.json({ ok: true, data: clients });
  } catch (error) {
    console.error("Error in GET /api/clients:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "মক্কেলদের তালিকা লোড করতে সমস্যা হয়েছে।" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const body = await request.json();
    const { fullName, phone, email, nidOrPassport, address, notes, initialRetainer } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { ok: false, error: { messageBn: "মক্কেলের পূর্ণ নাম ও মোবাইল নম্বর আবশ্যক।" } },
        { status: 400 }
      );
    }

    const newClient = await db.createClient({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      nidOrPassport: nidOrPassport?.trim(),
      address: address?.trim() || "ঠিকানা উল্লেখ নেই",
      cases: [],
      retainerBalance: Number(initialRetainer) || 0,
      status: "ACTIVE",
      notes: notes?.trim(),
    });

    await db.logAudit(authCheck.userId!, "CLIENT_ONBOARDED", {
      clientId: newClient.id,
      name: newClient.fullName,
    });

    return NextResponse.json({ ok: true, data: newClient });
  } catch (error) {
    console.error("Error in POST /api/clients:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "মক্কেল সংরক্ষণ ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
