import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

describe("Billing & Payment Gateway Engine (Phase 4)", () => {
  const testUserId = "demo-user-advocate-001";

  it("1. Upgrades user plan to PRO via updateUserPlan", async () => {
    // Set to FREE first
    await db.updateUserPlan(testUserId, "FREE");
    const freeUser = await db.getUser(testUserId);
    expect(freeUser?.plan).toBe("FREE");

    // Upgrade to PRO
    const upgraded = await db.updateUserPlan(testUserId, "PRO");
    expect(upgraded?.plan).toBe("PRO");

    const fetched = await db.getUser(testUserId);
    expect(fetched?.plan).toBe("PRO");
  });

  it("2. Records bKash sandbox payment transaction with trxId", async () => {
    const mockTrxId = "BKH_TEST_" + Date.now();
    const payment = await db.addPayment({
      id: "pay-test-" + Date.now(),
      userId: testUserId,
      amount: 2500,
      method: "bKash",
      trxId: mockTrxId,
      status: "COMPLETED",
      plan: "PRO",
      createdAt: new Date().toISOString(),
    });

    expect(payment.trxId).toBe(mockTrxId);
    expect(payment.amount).toBe(2500);
    expect(payment.plan).toBe("PRO");

    const payments = await db.getPayments();
    expect(payments.some((p) => p.trxId === mockTrxId)).toBe(true);
  });
});
