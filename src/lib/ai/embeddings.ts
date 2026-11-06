/**
 * Bangladesh Legal Semantic Embedding & Vector Utility
 * Model: gemini-embedding-001 (1536 output dimensions) with fallback
 */

const VECTOR_DIM = 1536;

/**
 * Deterministic semantic vector generator fallback
 * Used when offline, API quota exceeded, or during automated test runs.
 * Produces unit-length 1536-dimensional dense vectors with semantic affinity for Bengali legal terms.
 */
export function generateDeterministicVector(text: string): number[] {
  const vec = new Float64Array(VECTOR_DIM);
  const clean = (text || "").toLowerCase().trim();

  // Legal semantic clusters for Bangladesh jurisprudence
  const clusters: Record<string, number> = {
    "জামিন": 11,
    "bail": 11,
    "arrest": 17,
    "গ্রেফতার": 17,
    "৫৪ ধারা": 23,
    "১৬৭ ধারা": 23,
    "জমি": 41,
    "দখল": 43,
    "অবৈধ দখল": 43,
    "খতিয়ান": 47,
    "বায়নানা": 53,
    "দলিল": 59,
    "নির্দিষ্ট প্রতিকার": 61,
    "৯ ধারা": 67,
    "স্বত্ব": 71,
    "চেক": 83,
    "১৩৮": 89,
    "dis-honour": 89,
    "অধিগ্রহণ": 97,
    "খুন": 103,
    "৩০২": 107,
    "৩০৭": 109,
    "খোরপোশ": 113,
    "মোহরানা": 127,
    "তালাক": 131,
  };

  // Seed baseline hash
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const idx = (code * 31 + i * 17) % VECTOR_DIM;
    vec[idx] += Math.sin(code + i);
    vec[(idx + 256) % VECTOR_DIM] += Math.cos(code * 1.5);
  }

  // Boost semantic cluster dimensions
  for (const [term, prime] of Object.entries(clusters)) {
    if (clean.includes(term)) {
      for (let k = 0; k < 64; k++) {
        const targetIdx = (prime * 13 + k * 23) % VECTOR_DIM;
        vec[targetIdx] += 2.5 * Math.sin(prime + k);
      }
    }
  }

  // Normalize to unit vector (L2 norm)
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm) || 1.0;

  const result: number[] = new Array(VECTOR_DIM);
  for (let i = 0; i < VECTOR_DIM; i++) {
    result[i] = parseFloat((vec[i] / norm).toFixed(6));
  }

  return result;
}

/**
 * Calculates cosine similarity between two float vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dotProduct / denom;
}

/**
 * Generates 1536-dim embedding using Gemini API if GEMINI_API_KEY is available,
 * otherwise falls back to deterministic Bengali legal semantic vector.
 */
export async function getSemanticEmbedding(text: string): Promise<number[]> {
  const cleanText = (text || "").trim();
  if (!cleanText) return generateDeterministicVector("empty");

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: cleanText }] },
          outputDimensionality: VECTOR_DIM,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const values = data.embedding?.values;
        if (Array.isArray(values) && values.length === VECTOR_DIM) {
          return values;
        }
      }
    } catch {
      // Fallback below
    }
  }

  return generateDeterministicVector(cleanText);
}
