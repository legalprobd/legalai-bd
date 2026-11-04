import { prisma } from "@/lib/prisma";

export interface EvidenceGateResult {
  passed: boolean;
  receiptId?: string;
  errorBn?: string;
}

/**
 * Constraint 2: Real Database Relationship Check for Evidence
 * Does NOT rely on any mock boolean flag (e.g. has_ad_card = true).
 * Executes a strict Prisma query to verify the postal receipt actually exists in the database.
 */
export async function verifyPostalReceiptEvidence(
  caseId: string,
  client: any = prisma
): Promise<EvidenceGateResult> {
  if (!caseId) {
    return { passed: false, errorBn: "মামলা আইডি প্রদান করা হয়নি।" };
  }

  const receiptExists = await client.evidenceFile.findFirst({
    where: {
      caseId: caseId,
      OR: [
        { factMapping: { path: ["type"], equals: "POSTAL_RECEIPT" } },
        { fileType: "POSTAL_RECEIPT" },
        { fileType: "POSTAL_AD_CARD" },
      ],
    },
  });

  if (!receiptExists) {
    return {
      passed: false,
      errorBn: "ডাক রসিদ বা একনলেজমেন্ট কার্ডের (Postal Receipt / AD Card) কোনো প্রমাণ ডেটাবেসে পাওয়া যায়নি। গেট ব্যর্থ হয়েছে।",
    };
  }

  return {
    passed: true,
    receiptId: receiptExists.id,
  };
}
