import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category") || "";

    // 1. Try Prisma DB first
    try {

      if (prisma && prisma.casePrecedent) {
        const whereClause: any = {};
        if (q) {
          whereClause.OR = [
            { citation: { contains: q, mode: "insensitive" } },
            { titleBn: { contains: q, mode: "insensitive" } },
            { summaryBn: { contains: q, mode: "insensitive" } },
            { keywords: { contains: q, mode: "insensitive" } },
          ];
        }
        const results = await prisma.casePrecedent.findMany({
          where: whereClause,
          orderBy: { year: "desc" },
        });

        if (results && results.length > 0) {
          return NextResponse.json({
            ok: true,
            data: results,
            total: results.length,
            source: "database",
          });
        }
      }
    } catch {
      // fallback to store
    }

    // 2. Fallback to file-backed DB store
    let results = await db.searchCasePrecedents(q);
    if (category && category !== "ALL") {
      results = results.filter((p) => p.category === category);
    }

    return NextResponse.json({
      ok: true,
      data: results,
      total: results.length,
      source: "store",
    });
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_") || error?.digest === "HANGING_PROMISE_REJECTION") throw error;
    console.error("Error searching precedents:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
