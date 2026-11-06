import { describe, it, expect, vi } from "vitest";
import {
  generateDeterministicVector,
  cosineSimilarity,
  getSemanticEmbedding,
} from "@/lib/ai/embeddings";
import { GET } from "@/app/api/precedent/search/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

describe("Task 1 & 5: Semantic Vector Search & pgvector (RAG 2.0)", () => {
  it("1. Generates 1536-dimensional dense embedding vectors", async () => {
    const vec = generateDeterministicVector("জমি দখল ও চিরস্থায়ী নিষেধাজ্ঞা");
    expect(Array.isArray(vec)).toBe(true);
    expect(vec.length).toBe(1536);

    // Verify L2 norm is approximately 1.0
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    expect(norm).toBeCloseTo(1.0, 2);
  });

  it("2. Computes cosine similarity correctly between legal vectors", () => {
    const vecA = generateDeterministicVector("জমি দখল ও বেদখল");
    const vecB = generateDeterministicVector("অবৈধ দখল ও উচ্ছেদ মোকদ্দমা");
    const vecUnrelated = generateDeterministicVector("পারিবারিক দেনমোহর ও বিবাহবিচ্ছেদ");

    const simRelated = cosineSimilarity(vecA, vecB);
    const simUnrelated = cosineSimilarity(vecA, vecUnrelated);

    // Related land-dispute concepts have strictly higher similarity than unrelated divorce concepts
    expect(simRelated).toBeGreaterThan(simUnrelated);
    expect(cosineSimilarity(vecA, vecA)).toBeCloseTo(1.0, 4);
  });

  it("3. Handles async getSemanticEmbedding with fallback", async () => {
    const embedding = await getSemanticEmbedding("দণ্ডবিধি ৩০৭ ধারা অনুযায়ী খুনের চেষ্টা");
    expect(embedding.length).toBe(1536);
    expect(typeof embedding[0]).toBe("number");
  });

  it("4. Precedent search API route performs vector similarity query and returns results", async () => {
    // Mock prisma $queryRawUnsafe to simulate pgvector cosine distance query
    const mockVectorResults = [
      {
        id: "prec-1",
        citation: "62 DLR (HCD) 450",
        court: "হাইকোর্ট বিভাগ",
        year: 2010,
        titleBn: "বেগম বনাম চৌধুরী (অস্থায়ী নিষেধাজ্ঞা ও দখল প্রমাণের শর্তাবলী)",
        summaryBn: "জমির বিরোধে দখল প্রমাণের ভিত্তিতে প্রতিকার মঞ্জুর সংক্রান্ত সিদ্ধান্ত।",
        keywords: "জমি, দখল, নিষেধাজ্ঞা, CPC Order 39",
        similarityPercent: 88.5,
      },
      {
        id: "prec-2",
        citation: "65 DLR (AD) 289",
        court: "আপিল বিভাগ",
        year: 2013,
        titleBn: "আব্দুল মান্নান বনাম মোসাম্মৎ সাফিয়া খাতুন",
        summaryBn: "হেবা-বিল-এওয়াজ ও স্বত্বদখল হস্তান্তর সংক্রান্ত প্রামাণ্য নজির।",
        keywords: "জমি, দখল, হেবা",
        similarityPercent: 82.1,
      },
    ];

    const rawQuerySpy = vi.spyOn(prisma, "$queryRawUnsafe").mockResolvedValueOnce(mockVectorResults as any);

    const req = new NextRequest("http://localhost:3010/api/precedent/search?q=%E0%A6%9C%E0%A6%AE%E0%A6%BF+%E0%A6%A6%E0%A6%96%E0%A6%B2");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.source).toBe("vector_semantic_search");
    expect(body.data.length).toBe(2);
    expect(body.data[0].citation).toBe("62 DLR (HCD) 450");
    expect(body.data[0].similarityPercent).toBe(88.5);

    rawQuerySpy.mockRestore();
  });
});
