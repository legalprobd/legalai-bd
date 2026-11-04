import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trxId, amount, method, userId, plan } = body;

    const targetUserId = userId || "demo-user-advocate-001";
    const upgradedPlan: "FREE" | "PRO" | "CHAMBER" = (plan as "FREE" | "PRO" | "CHAMBER") || "PRO";

    const payment = await db.addPayment({
      id: "pay-" + Date.now(),
      userId: targetUserId,
      amount: Number(amount) || 2500,
      method: method || "bKash",
      trxId: trxId || "BKH" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      status: "COMPLETED",
      plan: upgradedPlan,
      createdAt: new Date().toISOString(),
    });

    // Upgrade user plan in the database
    const updatedUser = await db.updateUserPlan(targetUserId, upgradedPlan);

    await db.logAudit(targetUserId, "PAYMENT_RECEIVED_AND_UPGRADED", {
      trxId: payment.trxId,
      amount: payment.amount,
      plan: payment.plan,
    });

    return NextResponse.json({
      ok: true,
      data: {
        payment,
        user: updatedUser,
        messageBn: `পেমেন্ট সফলভাবে সম্পন্ন হয়েছে এবং আপনার অ্যাকাউন্ট ${upgradedPlan} প্যাকেজে উন্নীত হয়েছে।`,
      },
    });
  } catch (error) {
    console.error("Error in /api/billing/webhook:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "পেমেন্ট প্রসেসিং ব্যর্থ হয়েছে।",
        },
      },
      { status: 500 }
    );
  }
}
