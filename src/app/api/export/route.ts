import { NextResponse } from "next/server";
import { Document, Paragraph, TextRun, Packer, HeadingLevel, AlignmentType } from "docx";
import { convertUnicodeToBijoy } from "@/lib/utils/bijoyConverter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { html, titleBn, fontMode } = body as {
      html: string;
      titleBn?: string;
      fontMode?: "unicode" | "bijoy";
    };

    if (!html) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            messageBn: "ডকুমেন্টের কনটেন্ট খালি হতে পারে না।",
          },
        },
        { status: 400 }
      );
    }

    // Strip HTML tags to raw lines
    let plainText = html
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "");

    const isBijoy = fontMode === "bijoy";
    const targetFont = isBijoy ? "SutonnyMJ" : "Kalpurush";

    if (isBijoy) {
      plainText = convertUnicodeToBijoy(plainText);
    }

    const lines = plainText.split("\n");
    const paragraphs = lines.map((line) => {
      const trimmed = line.trim();
      const isHeader =
        trimmed.startsWith("মোকাম") ||
        trimmed.startsWith("বরাবর") ||
        trimmed.includes("এজাহার") ||
        trimmed.includes("দরখাস্ত");

      return new Paragraph({
        text: trimmed,
        spacing: { after: 120, line: 320 },
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: trimmed,
            font: targetFont,
            size: isHeader ? 28 : 24, // 14pt or 12pt
            bold: isHeader,
          }),
        ],
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Legal_Document_${Date.now()}.docx"`,
      },
    });
  } catch (error) {
    console.error("Error in /api/export:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "ডকুমেন্ট এক্সপোর্ট করতে ব্যর্থ হয়েছে।",
        },
      },
      { status: 500 }
    );
  }
}
