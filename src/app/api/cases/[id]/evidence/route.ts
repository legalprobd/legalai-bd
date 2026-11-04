import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EvidenceFileItem } from "@/lib/ai/schemas";
import { saveUploadedFile } from "@/lib/storage";
import { requireAuth } from "@/lib/auth-check";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { id } = await params;
    const caseRecord = await db.getCaseById(id);

    if (!caseRecord) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CASE_NOT_FOUND",
            messageBn: "মামলাটি পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    const evidenceList = await db.getEvidence(id);

    return NextResponse.json({
      ok: true,
      data: evidenceList,
    });
  } catch (error) {
    console.error("Error in GET /api/cases/[id]/evidence:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "প্রমাণপত্রের তালিকা লোড করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    let fileName = "Evidence_Document.pdf";
    let fileType = "application/pdf";
    let url = "/uploads/sample_doc.pdf";
    let sizeBytes = 102400;
    let ocrTextBn: string | null = null;
    let factMapping: Record<string, string> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const mappingRaw = formData.get("factMapping") as string | null;

      if (!file) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "VALIDATION_ERROR",
              messageBn: "কোনো ফাইল পাওয়া যায়নি।",
            },
          },
          { status: 400 }
        );
      }

      if (mappingRaw) {
        try {
          factMapping = JSON.parse(mappingRaw);
        } catch {
          // ignore invalid json
        }
      }

      const saved = await saveUploadedFile(id, file);
      fileName = saved.fileName;
      fileType = saved.fileType;
      url = saved.url;
      sizeBytes = saved.sizeBytes;
    } else {
      // JSON payload support
      const body = await request.json();
      fileName = body.fileName || fileName;
      fileType = body.fileType || fileType;
      url = body.url || url;
      sizeBytes = body.sizeBytes || sizeBytes;
      ocrTextBn = body.ocrTextBn || null;
      factMapping = body.factMapping || {};
    }

    const evidence: EvidenceFileItem = {
      id: "ev-" + Date.now(),
      caseId: id,
      fileName,
      fileType,
      url,
      sizeBytes,
      factMapping,
      ocrTextBn:
        ocrTextBn ||
        "ডকুমেন্ট আপলোড সম্পন্ন। স্টেজ ৫-এ বিস্তারিত OCR বিশ্লেষণ যুক্ত হবে।",
      uploadedAt: new Date().toISOString(),
    };

    await db.addEvidence(id, evidence);
    await db.logAudit("demo-user", "EVIDENCE_UPLOADED", {
      caseId: id,
      fileName: evidence.fileName,
      sizeBytes: evidence.sizeBytes,
    });

    return NextResponse.json({
      ok: true,
      data: evidence,
    });
  } catch (error: unknown) {
    console.error("Error in POST /api/cases/[id]/evidence:", error);
    const messageBn = error instanceof Error ? error.message : "প্রমাণপত্র আপলোড ব্যর্থ হয়েছে।";
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UPLOAD_ERROR",
          messageBn,
        },
      },
      { status: 400 }
    );
  }
}
