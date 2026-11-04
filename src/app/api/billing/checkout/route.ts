import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, userId } = body;

    const targetUser = await db.getUser(userId || "demo-user-advocate-001");
    const targetUserId = targetUser?.id || "demo-user-advocate-001";

    const planType = (plan as "FREE" | "PRO" | "CHAMBER") || "PRO";
    const amount = planType === "CHAMBER" ? 7500 : 2500;

    const paymentId = "BKASH_PAY_" + Date.now();
    const mockTrxId = "BKH" + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Simulated bKash checkout gateway URL
    const bKashCallbackUrl = `/api/billing/webhook`;

    return NextResponse.json({
      ok: true,
      data: {
        paymentId,
        trxId: mockTrxId,
        amount,
        currency: "BDT",
        plan: planType,
        userId: targetUserId,
        merchantInvoiceNumber: "INV-" + Date.now(),
        bKashURL: `https://sandbox.bKash.com/checkout?paymentId=${paymentId}`,
        callbackUrl: bKashCallbackUrl,
        messageBn: "বিকাশ পেমেন্ট গেটওয়ে প্রস্তুত।",
      },
    });
  } catch (error) {
    console.error("Error in /api/billing/checkout:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "বিকাশ চেকআউট সেশন তৈরি করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}
