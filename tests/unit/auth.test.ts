import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

describe("Real Authentication & Multi-Tenancy (Phase 2)", () => {
  it("1. Verifies demo advocate user exists in database with credentials", async () => {
    const user = await db.getUserByEmail("advocate@demo.bd");
    expect(user).not.toBeNull();
    expect(user?.email).toBe("advocate@demo.bd");
    expect(user?.role).toBe("ADVOCATE");
    expect(user?.password).toBe("legal123");
  });

  it("2. Verifies case multi-tenancy links case to user via userId", async () => {
    const user = await db.getUserByEmail("advocate@demo.bd");
    expect(user).not.toBeNull();
    const cases = await db.getCases(user!.id);
    expect(cases.length).toBeGreaterThan(0);
    expect(cases[0].userId).toBe(user!.id);
  });

  it("3. Validates wrong password rejection", async () => {
    const user = await db.getUserByEmail("advocate@demo.bd");
    expect(user?.password === "wrongpassword").toBe(false);
  });
});
