import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { html, titleBn } = body as { html: string; titleBn?: string };

    if (!html || html.trim().length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            messageBn: "পিডিএফ তৈরির জন্য প্রয়োজনীয় কনটেন্ট প্রদান করা হয়নি।",
          },
        },
        { status: 400 }
      );
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${titleBn || "Court Document"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;600;700&display=swap');
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: 'Noto Serif Bengali', 'Nikosh', 'Kalpurush', 'SolaimanLipi', serif;
      line-height: 1.6;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 13pt;
    }
    .legal-doc {
      width: 100%;
      margin: 0 auto;
    }
    .disclaimer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #d1d5db;
      font-size: 9pt;
      color: #6b7280;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          bottom: "20mm",
          left: "15mm",
          right: "15mm",
        },
      });

      const safeTitle = (titleBn || "Court_Document").replace(/[^\u0980-\u09FFA-Za-z0-9_-]/g, "_");

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(safeTitle)}.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Error in POST /api/export/pdf:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          messageBn: "সার্ভার-সাইড পিডিএফ তৈরিতে সমস্যা হয়েছে।",
        },
      },
      { status: 500 }
    );
  }
}
