import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";

export async function GET() {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    if (authCheck.role === "JUNIOR") {
      return NextResponse.json(
        { ok: false, error: { messageBn: "জুনিয়র অ্যাডভোকেটদের জন্য বিলিং ও আর্থিক তথ্য সীমাবদ্ধ।" } },
        { status: 403 }
      );
    }

    const accounts = await db.getTrustAccounts();
    return NextResponse.json({ ok: true, data: accounts });
  } catch (error) {
    console.error("Error in GET /api/billing/trust:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "ট্রাস্ট অ্যাকাউন্ট তালিকা লোড ব্যর্থ হয়েছে।" } },
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
        { ok: false, error: { messageBn: "জুনিয়র অ্যাডভোকেটদের জন্য বিলিং ও আর্থিক তথ্য সীমাবদ্ধ।" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { trustAccountId, type, amount, purpose, voucherRef } = body;

    if (!trustAccountId || !type || !amount || !purpose) {
      return NextResponse.json(
        { ok: false, error: { messageBn: "ট্রানজেকশনের ধরন, টাকার পরিমাণ ও বিবরণ আবশ্যক।" } },
        { status: 400 }
      );
    }

    const updated = await db.addTrustTransaction(trustAccountId, {
      type,
      amount: Number(amount),
      purpose: purpose.trim(),
      voucherRef: voucherRef?.trim(),
    });

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: { messageBn: "উক্ত ট্রাস্ট অ্যাকাউন্টটি পাওয়া যায়নি।" } },
        { status: 404 }
      );
    }

    await db.logAudit(authCheck.userId!, "TRUST_TRANSACTION_RECORDED", {
      trustAccountId,
      type,
      amount,
      purpose,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("Error in POST /api/billing/trust:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "ট্রাস্ট লেনদেন সংরক্ষণ ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
