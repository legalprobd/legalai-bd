import { describe, it, expect } from "vitest";
import { extractEntitiesFromOcr } from "@/lib/ai/router";

describe("Evidence Vault Real OCR & AI Fact Mapping (Phase 3)", () => {
  it("1. Extracts medical injury report entities from Bengali OCR text", async () => {
    const ocrText =
      "ঢাকা মেডিকেল কলেজ হাসপাতাল। ইনজুরি সনদ। রোগীর নাম: মো. রফিকুল হাসান। জখমের ধরন: মাথায় ধারালো অস্ত্রের আঘাতে রক্তাক্ত জখম ও ৩টি সেলাই দেওয়া হইয়াছে। তারিখ: ০২/১১/২০২৬";
    const entities = await extractEntitiesFromOcr(ocrText);

    expect(entities.category).toBe("মেডিকেল ইনজুরি রিপোর্ট");
    expect(entities.injuries).toContain("মাথায় ধারালো/ভোঁতা অস্ত্রের রক্তাক্ত জখম ও সেলাই");
    expect(entities.date).toBe("০২/১১/২০২৬");
    expect(entities.identifiedName).toContain("মো. রফিকুল হাসান");
  });

  it("2. Extracts cheque dishonour entities from OCR text", async () => {
    const ocrText =
      "ব্যাংক এশিয়া লিমিটেড, শান্তিনগর শাখা। চেক ডিজঅনার মেমো। মোট টাকার পরিমাণ: ১০,০০,০০০/- টাকা। ডিজঅনারের কারণ: অপর্যাপ্ত তহবিল (Insufficient Funds)। তারিখ: ১৫/১০/২০২৬";
    const entities = await extractEntitiesFromOcr(ocrText);

    expect(entities.category).toBe("চেক ও ডিজঅনার মেমো");
    expect(entities.amount).toContain("১০,০০,০০০");
    expect(entities.date).toBe("১৫/১০/২০২৬");
  });

  it("3. Extracts land khatian entities from OCR text", async () => {
    const ocrText =
      "বাংলাদেশ ফরম নং ৫৪৬৩। খতিয়ান ও পর্চা। মৌজা: বাড্ডা, জে.এল নং ১২, দাগ নং ৪৫০, মালিক: আব্দুল করিম।";
    const entities = await extractEntitiesFromOcr(ocrText);

    expect(entities.category).toBe("নালিশি খতিয়ান ও পর্চা");
    expect(entities.identifiedName).toContain("আব্দুল করিম");
  });
});
