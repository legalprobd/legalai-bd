import { NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetAt <= now) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Checks if a request identified by key exceeds the rate limit.
 * @param key Identifier (e.g., client IP or token)
 * @param limit Max allowed requests within windowMs (default 10)
 * @param windowMs Time window in milliseconds (default 60,000 ms = 1 min)
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Helper to extract client identifier (IP) from request headers.
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  return "127.0.0.1";
}

/**
 * Returns a 429 Too Many Requests response enveloped properly in standard format.
 */
export function rateLimitExceededResponse(resetInSec: number) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        messageBn: `অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে ${resetInSec} সেকেন্ড পর আবার চেষ্টা করুন।`,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": resetInSec.toString(),
      },
    }
  );
}
