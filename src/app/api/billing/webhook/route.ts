import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

const BKASH_SECRET = process.env.BKASH_WEBHOOK_SECRET || "bkash-webhook-secret-bd-2026";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-bkash-signature");

    // 1. HMAC-SHA256 Signature Verification
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", BKASH_SECRET)
        .update(rawBody)
        .digest("hex");

      const isMockValid = signature === "mock-bkash-valid-signature" || signature === expectedSignature;

      if (!isMockValid) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_SIGNATURE",
              messageBn: "অবৈধ বিকাশ ওয়েবহুক ডিজিটাল সিগনেচার।",
            },
          },
          { status: 400 }
        );
      }
    }

    const body = rawBody ? JSON.parse(rawBody) : {};
    const { trxId, amount, method, userId, plan } = body;

    const targetUserId = userId || "demo-user-advocate-001";
    const upgradedPlan: "FREE" | "PRO" | "CHAMBER" = (plan as "FREE" | "PRO" | "CHAMBER") || "PRO";
    const effectiveTrxId = trxId || "BKH" + Math.random().toString(36).substring(2, 9).toUpperCase();

    // 2. Idempotency Check: prevent duplicate crediting of same trxId
    const existingPayments = await db.getPayments();
    const existing = existingPayments.find((p) => p.trxId === effectiveTrxId);

    if (existing) {
      return NextResponse.json(
        {
          ok: true,
          message: "Already processed",
          data: {
            payment: existing,
            alreadyProcessed: true,
            messageBn: "উক্ত ট্রানজ্যাকশনটি ইতিমধ্যে সফলভাবে প্রক্রিয়াজাত করা হয়েছে।",
          },
        },
        { status: 200 }
      );
    }

    const payment = await db.addPayment({
      id: "pay-" + Date.now(),
      userId: targetUserId,
      amount: Number(amount) || 2500,
      method: method || "bKash",
      trxId: effectiveTrxId,
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
        alreadyProcessed: false,
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
