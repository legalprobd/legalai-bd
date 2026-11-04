import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("Rate Limiting Engine", () => {
  it("allows requests under the limit", () => {
    const key = `test-client-${Date.now()}`;
    const result1 = checkRateLimit(key, 5, 10000);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(4);

    const result2 = checkRateLimit(key, 5, 10000);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(3);
  });

  it("blocks requests that exceed the limit", () => {
    const key = `test-blocked-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 10000);
    }
    const blocked = checkRateLimit(key, 3, 10000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSec).toBeGreaterThan(0);
  });
});
