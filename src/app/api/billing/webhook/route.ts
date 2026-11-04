import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trxId, amount, method, userId, plan } = body;

    const payment = await db.addPayment({
      id: "pay-" + Date.now(),
      userId: userId || "demo-user-advocate-001",
      amount: Number(amount) || 2500,
      method: method || "bKash",
      trxId: trxId || "TRX" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      status: "COMPLETED",
      plan: plan || "PRO",
      createdAt: new Date().toISOString(),
    });

    await db.logAudit(payment.userId, "PAYMENT_RECEIVED", {
      trxId: payment.trxId,
      amount: payment.amount,
      plan: payment.plan,
    });

    return NextResponse.json({
      ok: true,
      data: payment,
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
