import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { getSemanticEmbedding } from "@/lib/ai/embeddings";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category") || "";

    // 1. Try Vector Semantic Similarity Search (RAG 2.0 with pgvector)
    if (q && prisma) {
      try {
        const queryEmbedding = await getSemanticEmbedding(q);
        const vectorParam = `[${queryEmbedding.join(",")}]`;

        // Cosine distance operator (<=> in pgvector)
        // Cosine similarity = 1 - cosine distance
        const semanticResults: any[] = await prisma.$queryRawUnsafe(
          `SELECT id, citation, court, year, "titleBn", "summaryBn", keywords,
                  ROUND(((1 - ("embedding" <=> $1::vector)) * 100)::numeric, 1) as "similarityPercent"
           FROM "CasePrecedent"
           WHERE "embedding" IS NOT NULL
           ORDER BY "embedding" <=> $1::vector ASC
           LIMIT 15;`,
          vectorParam
        );

        if (semanticResults && semanticResults.length > 0) {
          // If category filter is active, filter matches
          let filtered = semanticResults;
          if (category && category !== "ALL") {
            const categoryKeywords: Record<string, string[]> = {
              BAIL: ["জামিন", "৫৪", "১৬৭", "আটক", "bail"],
              LAND: ["জমি", "দখল", "বায়না", "খতিয়ান", "অধিগ্রহণ", "স্বত্ব"],
              CRIMINAL: ["দণ্ডবিধি", "খুন", "৩০২", "৩০৭", "ডাকাতি", "মারধর"],
              NI_ACT: ["চেক", "১৩৮", "নিগোশিয়েবল", "dis-honour"],
              FAMILY: ["তালাক", "মোহরানা", "খোরপোশ", "অভিভাবকত্ব"],
            };
            const matchTokens = categoryKeywords[category] || [];
            if (matchTokens.length > 0) {
              const matched = semanticResults.filter((p) =>
                matchTokens.some((t) => (p.keywords + " " + p.summaryBn).includes(t))
              );
              if (matched.length > 0) filtered = matched;
            }
          }

          return NextResponse.json({
            ok: true,
            data: filtered,
            total: filtered.length,
            source: "vector_semantic_search",
          });
        }
      } catch (vectorErr) {
        console.warn("Vector semantic search fallback to standard query:", vectorErr);
      }
    }

    // 2. Fallback to Prisma Keyword / Text Search if query has no embeddings yet
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

    // 3. Fallback to file-backed DB store
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
