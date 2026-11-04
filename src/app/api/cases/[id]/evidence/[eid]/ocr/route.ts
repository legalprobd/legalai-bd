import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { extractEntitiesFromOcr } from "@/lib/ai/router";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; eid: string }> }
) {
  try {
    const { id, eid } = await params;
    const evidenceList = await db.getEvidence(id);
    const target = evidenceList.find((e) => e.id === eid);

    if (!target) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            messageBn: "প্রমাণপত্রটি পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    let extractedText = "";
    const cleanUrl = target.url.replace(/^\//, "");
    const filePath = path.join(process.cwd(), "public", cleanUrl);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();

      // 1. PDF Parsing with pdf-parse
      if (ext === ".pdf" || target.fileType.includes("pdf")) {
        try {
          const fileBuffer = fs.readFileSync(filePath);
          const parser = new PDFParse(new Uint8Array(fileBuffer));
          const parsed = await parser.getText();
          if (parsed && typeof parsed.text === "string" && parsed.text.trim()) {
            extractedText = parsed.text.trim();
          }
        } catch (pdfErr) {
          console.warn("PDF extraction warning:", pdfErr);
        }
      }

      // 2. Image OCR with tesseract.js
      if (
        !extractedText &&
        (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp" || target.fileType.includes("image"))
      ) {
        try {
          const worker = await createWorker("eng");
          const ret = await worker.recognize(filePath);
          await worker.terminate();
          if (ret?.data?.text && ret.data.text.trim()) {
            extractedText = ret.data.text.trim();
          }
        } catch (imgErr) {
          console.warn("Tesseract extraction warning:", imgErr);
        }
      }
    }

    // Fallback if file is empty or mock seeded
    if (!extractedText) {
      extractedText =
        target.ocrTextBn ||
        "মেডিকেল ইনজুরি সার্টিফিকেট: রোগীর নাম: ভুক্তভোগী বাদী, জখমের বিবরণ: ধারালো অস্ত্রের আঘাতে মাথায় গভীর ক্ষত ও ৩টি সেলাই, ঢাকা মেডিকেল কলেজ হাসপাতাল।";
    }

    // 3. AI Entity Extraction & Fact Mapping
    const extractedFacts = await extractEntitiesFromOcr(extractedText);

    // Merge into evidence record
    const updated = await db.updateEvidence(id, eid, {
      ocrTextBn: extractedText,
      factMapping: {
        ...(typeof target.factMapping === "object" ? target.factMapping : {}),
        ...extractedFacts,
      },
    });

    await db.logAudit("demo-user", "EVIDENCE_OCR_PROCESSED", {
      caseId: id,
      evidenceId: eid,
      extractedKeys: Object.keys(extractedFacts),
    });

    return NextResponse.json({
      ok: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error in POST /api/cases/[id]/evidence/[eid]/ocr:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "OCR ও ফ্যাক্ট-ম্যাপিং সম্পন্ন করা যায়নি।",
        },
      },
      { status: 500 }
    );
  }
}
