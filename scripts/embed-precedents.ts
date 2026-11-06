import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { FAMOUS_BANGLADESH_PRECEDENTS } from "../src/lib/precedents/seedPrecedents";
import { getSemanticEmbedding } from "../src/lib/ai/embeddings";

// Read database URL from vercel.env or .env
function resolveDatabaseUrl(): string {
  try {
    if (fs.existsSync("vercel.env")) {
      const venv = fs.readFileSync("vercel.env", "utf8");
      const match = venv.match(/DATABASE_URL="?([^"\r\n]+)"?/);
      if (match && match[1]) return match[1];
    }
    if (fs.existsSync(".env")) {
      const env = fs.readFileSync(".env", "utf8");
      const match = env.match(/DATABASE_URL="?([^"\r\n]+)"?/);
      if (match && match[1]) return match[1];
    }
  } catch {}
  return process.env.DATABASE_URL || "";
}

const dbUrl = resolveDatabaseUrl();
const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

async function main() {
  console.log("=== Supreme Court Precedent Semantic Embedding (pgvector 1536) ===");
  console.log("Database target:", dbUrl.split("@")[1] || "local/default");

  // 1. Ensure pgvector extension exists
  try {
    await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("✓ pgvector extension verified in database.");
  } catch (err: any) {
    console.warn("Notice on vector extension:", err.message);
  }

  // 2. Ensure precedents are seeded
  let existing = await prisma.casePrecedent.findMany();
  if (existing.length < FAMOUS_BANGLADESH_PRECEDENTS.length) {
    console.log(`Seeding ${FAMOUS_BANGLADESH_PRECEDENTS.length} Supreme Court precedents...`);
    for (const p of FAMOUS_BANGLADESH_PRECEDENTS) {
      await prisma.casePrecedent.upsert({
        where: { citation: p.citation },
        update: {
          court: p.court,
          year: p.year,
          titleBn: p.titleBn,
          summaryBn: p.summaryBn,
          keywords: p.keywords,
        },
        create: {
          citation: p.citation,
          court: p.court,
          year: p.year,
          titleBn: p.titleBn,
          summaryBn: p.summaryBn,
          keywords: p.keywords,
        },
      });
    }
    existing = await prisma.casePrecedent.findMany();
  }
  console.log(`Found ${existing.length} precedents to embed.`);

  // 3. Generate and store embeddings
  let count = 0;
  for (const p of existing) {
    const semanticText = `${p.titleBn}. সাইটেশন: ${p.citation}. আদালত: ${p.court} (${p.year}). সারাংশ: ${p.summaryBn}. কি-ওয়ার্ড: ${p.keywords}`;
    const embedding = await getSemanticEmbedding(semanticText);

    const vectorString = `[${embedding.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `UPDATE "CasePrecedent" SET "embedding" = $1::vector WHERE "id" = $2`,
      vectorString,
      p.id
    );
    count++;
    process.stdout.write(`\rEmbedded: ${count}/${existing.length} - ${p.citation}`);
  }
  console.log("\n✓ All precedents successfully embedded with 1536-dim vectors in PostgreSQL!");

  // 4. Test Cosine Similarity Query
  console.log("\nTesting semantic search for: 'জমি দখল' (Adverse possession / Land grab)...");
  const testQuery = "জমি দখল";
  const queryVec = await getSemanticEmbedding(testQuery);
  const queryVecString = `[${queryVec.join(",")}]`;

  const topMatches: any[] = await prisma.$queryRawUnsafe(
    `SELECT citation, "titleBn", "summaryBn", 1 - ("embedding" <=> $1::vector) as similarity
     FROM "CasePrecedent"
     WHERE "embedding" IS NOT NULL
     ORDER BY "embedding" <=> $1::vector ASC
     LIMIT 3;`,
    queryVecString
  );

  console.log("Top semantic matches:");
  topMatches.forEach((m, idx) => {
    console.log(` ${idx + 1}. [${m.citation}] ${m.titleBn} (Similarity: ${(m.similarity * 100).toFixed(1)}%)`);
  });
}

main()
  .catch((e) => {
    console.error("Embedding script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
