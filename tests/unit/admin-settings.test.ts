import { describe, it, expect } from "vitest";
import { db } from "@/lib/db";

describe("Advocate Profile, Settings & Admin RBAC Data Layer", () => {
  const adminEmail = "advocate@demo.bd";
  const juniorEmail = "junior@demo.bd";

  it("1. Verifies admin user exists and has isAdmin = true", async () => {
    const adminUser = await db.getUserByEmail(adminEmail);
    expect(adminUser).not.toBeNull();
    expect(adminUser?.email).toBe(adminEmail);
    expect(adminUser?.isAdmin).toBe(true);
  });

  it("2. Verifies junior non-admin user exists and has isAdmin = false", async () => {
    const juniorUser = await db.getUserByEmail(juniorEmail);
    expect(juniorUser).not.toBeNull();
    expect(juniorUser?.email).toBe(juniorEmail);
    expect(juniorUser?.isAdmin).toBe(false);
  });

  it("3. Updates advocate profile fields (chamberName, courtStation, phone)", async () => {
    const adminUser = await db.getUserByEmail(adminEmail);
    expect(adminUser).not.toBeNull();

    const updated = await db.updateUser(adminUser!.id, {
      chamberName: "রহমান অ্যান্ড অ্যাসোসিয়েটস চেম্বার",
      courtStation: "বাংলাদেশ সুপ্রিম কোর্ট",
      phone: "01711999999",
      digitalSignatureUrl: "/uploads/profiles/signature-test.png",
      chamberLetterheadUrl: "/uploads/profiles/letterhead-test.png",
    });

    expect(updated).not.toBeNull();
    expect(updated?.chamberName).toBe("রহমান অ্যান্ড অ্যাসোসিয়েটস চেম্বার");
    expect(updated?.courtStation).toBe("বাংলাদেশ সুপ্রিম কোর্ট");
    expect(updated?.phone).toBe("01711999999");
    expect(updated?.digitalSignatureUrl).toBe("/uploads/profiles/signature-test.png");
  });

  it("4. Retrieves all registered advocates via getAllUsers", async () => {
    const allUsers = await db.getAllUsers();
    expect(Array.isArray(allUsers)).toBe(true);
    expect(allUsers.length).toBeGreaterThanOrEqual(2);
    expect(allUsers.some((u) => u.email === adminEmail)).toBe(true);
    expect(allUsers.some((u) => u.email === juniorEmail)).toBe(true);
  });

  it("5. Saves and retrieves custom AI prompts via saveCustomPrompts", async () => {
    const testPrompts = {
      interviewerPrompt: "Custom Interviewer Prompt Test",
      drafterPrompt: "Custom Drafter Prompt Test",
    };

    await db.saveCustomPrompts(testPrompts);
    const retrieved = await db.getCustomPrompts();

    expect(retrieved).not.toBeNull();
    expect(retrieved?.interviewerPrompt).toBe("Custom Interviewer Prompt Test");
    expect(retrieved?.drafterPrompt).toBe("Custom Drafter Prompt Test");
  });

  it("6. Logs and retrieves audit logs for settings changes", async () => {
    const adminUser = await db.getUserByEmail(adminEmail);
    expect(adminUser).not.toBeNull();

    await db.logAudit(adminUser!.id, "TEST_SETTINGS_ACTION", {
      field: "chamberName",
      newValue: "New Chamber",
    });

    const logs = await db.getAuditLogs();
    const actionFound = logs.find((l) => l.action === "TEST_SETTINGS_ACTION");
    expect(actionFound).toBeDefined();
    expect(actionFound?.userId).toBe(adminUser!.id);
  });
});
