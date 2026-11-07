import { describe, it, expect } from "vitest";
import {
  normalizeCategory,
  getAllowedDocumentOptions,
  getDefaultDocTypeForCategory,
} from "@/lib/law/documentSelection";

describe("Strict Document Selection Engine", () => {
  it("strictly maps Civil cases ('জমি দখল') to Plaint and NEVER includes FIR", () => {
    const category = "CIVIL";
    const title = "জমি দখল ও সীমানা প্রাচীর ভাঙচুর সংক্রান্ত বিরোধ";
    const statement = "বিবাদীগণ জোরপূর্বক আমাদের পৈতৃক নালিশি জমি দখল করে সীমানা প্রাচীর ভেঙে ফেলিয়াছে।";

    const normalized = normalizeCategory(category, title, statement);
    expect(normalized).toBe("CIVIL");

    const options = getAllowedDocumentOptions(category, title, statement);
    const docIds = options.map((opt) => opt.id);

    // Assert includes Plaint and Injunction
    expect(docIds).toContain("PLAINT");
    expect(docIds).toContain("INJUNCTION_TEMP");
    expect(docIds).toContain("INJUNCTION_PERMANENT");
    expect(docIds).toContain("LEGAL_NOTICE");

    // STRICT ASSERTION: DOES NOT include FIR
    expect(docIds).not.toContain("FIR");
    expect(docIds).not.toContain("BAIL_PETITION");

    // Default document type is PLAINT
    const defaultDoc = getDefaultDocTypeForCategory(category, title, statement);
    expect(defaultDoc).toBe("PLAINT");
  });

  it("strictly maps Criminal cases ('ছুরি দিয়ে আঘাত') to FIR, GD, and CR Petition", () => {
    const category = "CRIMINAL";
    const title = "ছুরি দিয়ে মারাত্মক আঘাত ও রক্তাক্ত জখম";
    const statement = "আসামি ধারালো ছুরি দিয়ে মাথায় ও পেটে গভীর আঘাত করে রক্তাক্ত জখম করিয়াছে।";

    const normalized = normalizeCategory(category, title, statement);
    expect(normalized).toBe("CRIMINAL");

    const options = getAllowedDocumentOptions(category, title, statement);
    const docIds = options.map((opt) => opt.id);

    // Assert includes FIR, Bail, etc.
    expect(docIds).toContain("FIR");
    expect(docIds).toContain("CR_PETITION");
    expect(docIds).toContain("BAIL_PETITION");

    // Default document type is FIR
    const defaultDoc = getDefaultDocTypeForCategory(category, title, statement);
    expect(defaultDoc).toBe("FIR");
  });

  it("strictly maps Nuisance cases (smoking/noise) to GD and Legal Notice, and excludes FIR/Plaint", () => {
    const category = "NUISANCE";
    const title = "সিঁড়িতে প্রকাশ্যে ধূমপানের উপদ্রব";
    const statement = "প্রতিবেশী ব্যক্তি প্রতিদিন ফ্ল্যাটের সামনে প্রকাশ্যে ধূমপান করিয়া ধোঁয়া ছড়ায়।";

    const normalized = normalizeCategory(category, title, statement);
    expect(normalized).toBe("NUISANCE");

    const options = getAllowedDocumentOptions(category, title, statement);
    const docIds = options.map((opt) => opt.id);

    // Assert includes GD and Legal Notice
    expect(docIds).toContain("GD");
    expect(docIds).toContain("LEGAL_NOTICE");

    // Strictly does not include FIR or Plaint
    expect(docIds).not.toContain("FIR");
    expect(docIds).not.toContain("PLAINT");

    // Default document is GD
    const defaultDoc = getDefaultDocTypeForCategory(category, title, statement);
    expect(defaultDoc).toBe("GD");
  });

  it("strictly maps Family disputes (তালাক / দেনমোহর) to Family Court Plaints and excludes FIR", () => {
    const category = "FAMILY";
    const title = "দেনমোহর ও ভরণপোষণ আদায়ের নালিশ";
    const statement = "স্বামী দেনমোহরের টাকা ও বিগত ৬ মাসের ভরণপোষণ পরিশোধ না করে বাড়ি থেকে বের করে দিয়েছে।";

    const normalized = normalizeCategory(category, title, statement);
    expect(normalized).toBe("FAMILY");

    const options = getAllowedDocumentOptions(category, title, statement);
    const docIds = options.map((opt) => opt.id);

    expect(docIds).toContain("DOWER_RECOVERY");
    expect(docIds).toContain("MAINTENANCE");
    expect(docIds).not.toContain("FIR");
  });
});
