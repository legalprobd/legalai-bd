import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";
import { saveUploadedFile, deleteStoredFile } from "@/lib/storage";
import { EvidenceFileItem } from "@/lib/ai/schemas";

describe("Evidence Vault & Document Storage Engine", () => {
  const testCaseId = "case-karim-miah-001";

  it("1. Retrieves existing evidence files for a case", async () => {
    const evidenceList = await db.getEvidence(testCaseId);
    expect(Array.isArray(evidenceList)).toBe(true);
    expect(evidenceList.length).toBeGreaterThan(0);
    expect(evidenceList[0].fileName).toBeDefined();
    expect(evidenceList[0].sizeBytes).toBeGreaterThan(0);
  });

  it("2. Adds evidence file with factMapping and sizeBytes", async () => {
    const newEvidence: EvidenceFileItem = {
      id: "ev-test-" + Date.now(),
      caseId: testCaseId,
      fileName: "Khatian_Parcha_1294.pdf",
      fileType: "application/pdf",
      url: "/uploads/case_test/Khatian_Parcha_1294.pdf",
      sizeBytes: 524288, // 512 KB
      factMapping: { category: "নালিশি খতিয়ান ও পর্চা", landPlot: "দাগ নং ১২৩৪" },
      ocrTextBn: "মৌজা: তেজগাঁও, সি.এস. খতিয়ান নং ১২৯৪, মালিক: আব্দুল করিম",
      uploadedAt: new Date().toISOString(),
    };

    const added = await db.addEvidence(testCaseId, newEvidence);
    expect(added.id).toBe(newEvidence.id);
    expect(added.sizeBytes).toBe(524288);
    expect(added.factMapping?.category).toBe("নালিশি খতিয়ান ও পর্চা");

    const fetched = await db.getEvidence(testCaseId);
    expect(fetched.some((e) => e.id === newEvidence.id)).toBe(true);
  });

  it("3. Updates evidence metadata and fact mapping", async () => {
    const evidenceList = await db.getEvidence(testCaseId);
    const target = evidenceList[0];

    const updated = await db.updateEvidence(testCaseId, target.id, {
      ocrTextBn: "OCR সম্পাদন সফল: ধারালো অস্ত্রের আঘাত সনাক্ত।",
      factMapping: { verified: "true", priority: "urgent" },
    });

    expect(updated).not.toBeNull();
    expect(updated?.ocrTextBn).toBe("OCR সম্পাদন সফল: ধারালো অস্ত্রের আঘাত সনাক্ত।");
    expect(updated?.factMapping?.verified).toBe("true");
  });

  it("4. Rejects file exceeding 10MB in saveUploadedFile", async () => {
    const mockBigFile = {
      name: "giant_video.mp4",
      type: "video/mp4",
      size: 15 * 1024 * 1024, // 15MB
      arrayBuffer: async () => new ArrayBuffer(10),
    };

    await expect(saveUploadedFile(testCaseId, mockBigFile as unknown as File)).rejects.toThrow(
      "ফাইলের আকার সর্বোচ্চ ১০ মেগাবাইট"
    );
  });

  it("5. Rejects unsupported executable mime types", async () => {
    const mockExeFile = {
      name: "virus.exe",
      type: "application/x-msdownload",
      size: 1024,
      arrayBuffer: async () => new ArrayBuffer(10),
    };

    await expect(saveUploadedFile(testCaseId, mockExeFile as unknown as File)).rejects.toThrow(
      "শুধুমাত্র PDF, ছবি (PNG, JPG) এবং Word (DOCX) ফাইল গ্রহণযোগ্য"
    );
  });

  it("6. Deletes evidence file from database", async () => {
    const tempEvidence: EvidenceFileItem = {
      id: "ev-to-delete-999",
      caseId: testCaseId,
      fileName: "temp.png",
      fileType: "image/png",
      url: "/uploads/temp.png",
      sizeBytes: 1024,
      uploadedAt: new Date().toISOString(),
    };
    await db.addEvidence(testCaseId, tempEvidence);

    const deleted = await db.deleteEvidence(testCaseId, "ev-to-delete-999");
    expect(deleted).toBe(true);

    const list = await db.getEvidence(testCaseId);
    expect(list.some((e) => e.id === "ev-to-delete-999")).toBe(false);
  });
});
