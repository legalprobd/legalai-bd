import { describe, it, expect } from "vitest";
import {
  generateHaziraSlipHtml,
  generateTimePetitionHtml,
  generateVakalatnamaFullHtml,
  generateTR4ChallanHtml,
  numberToBengaliWords,
  toBengaliDigits,
} from "@/lib/templates/courtEssentialsTemplates";
import { db } from "@/lib/db";

describe("Tier 1 Daily Essentials - Court Templates & Utilities", () => {
  describe("1. Bengali Digit & Currency Words Conversion", () => {
    it("converts numbers to Bengali digits correctly", () => {
      expect(toBengaliDigits(12345)).toBe("১২৩৪৫");
      expect(toBengaliDigits("7890")).toBe("৭৮৯০");
    });

    it("converts amounts to authentic Bengali words", () => {
      expect(numberToBengaliWords(500)).toBe("পাঁচ শত টাকা মাত্র");
      expect(numberToBengaliWords(1500)).toBe("এক হাজার পাঁচ শত টাকা মাত্র");
      expect(numberToBengaliWords(25000)).toBe("পঁচিশ হাজার টাকা মাত্র");
      expect(numberToBengaliWords(100000)).toBe("এক লক্ষ টাকা মাত্র");
    });
  });

  describe("2. Hazira Slip Generator (হাজিরা স্লিপ)", () => {
    it("generates authentic Hazira slip containing court name, accused list and advocate details", () => {
      const html = generateHaziraSlipHtml({
        courtName: "বিজ্ঞ মেট্রোপলিটন ম্যাজিস্ট্রেট আদালত নং ০৪, ঢাকা",
        caseNo: "সি.আর. মামলা নং ১২৩/২০২৪",
        sections: "দণ্ডবিধি আইনের ৩২৩/৫০৬ ধারা",
        complainantName: "রাষ্ট্র (বাদী: জনাব কামাল)",
        accusedList: [
          { name: "১। মোঃ রফিকুল ইসলাম", status: "HAZIR", remarks: "জামিনে হাজির" },
          { name: "২। মোঃ জহিরুল হক", status: "IN_CUSTODY", remarks: "হাজতে" },
        ],
        hearingDate: "১৫ নভেম্বর, ২০২৪",
        advocateName: "ব্যারিস্টার তানভীর আহমেদ",
        advocateBarReg: "BC/DH/2018/4892",
      });

      expect(html).toContain("আসামির হাজিরার স্লিপ");
      expect(html).toContain("সি.আর. মামলা নং ১২৩/২০২৪");
      expect(html).toContain("১। মোঃ রফিকুল ইসলাম");
      expect(html).toContain("হাজির");
      expect(html).toContain("জেল হাজতে");
      expect(html).toContain("BC/DH/2018/4892");
    });
  });

  describe("3. Time Petition Generator (সময় প্রার্থনার দরখাস্ত)", () => {
    it("generates criminal time petition citing Section 344 CrPC", () => {
      const html = generateTimePetitionHtml({
        courtName: "বিজ্ঞ মহানগর দায়রা জজ আদালত, ঢাকা",
        caseNo: "মেট্রো দায়রা নং ৪৫/২০২৪",
        caseType: "CRIMINAL",
        complainantName: "রাষ্ট্র",
        accusedOrOppositeParty: "মোঃ করিম",
        previousHearingDate: "১ নভেম্বর, ২০২৪",
        reasonsBn: "বিজ্ঞ সিনিয়র আইনজীবী অসুস্থ থাকায় অদ্য শুনানি মুলতবি রাখা আবশ্যক।",
        stageBn: "সাক্ষ্য গ্রহণ",
        advocateName: "অ্যাডভোকেট এম. এ. রহমান",
        advocateBarReg: "BC/DH/1998/1234",
        petitionerSide: "বিবাদী / আসামি পক্ষ",
      });

      expect(html).toContain("ফৌজদারি কার্যবিধি আইনের ৩৪৪ ধারা");
      expect(html).toContain("মেট্রো দায়রা নং ৪৫/২০২৪");
      expect(html).toContain("সাক্ষ্য গ্রহণ");
      expect(html).toContain("অসুস্থ থাকায়");
      expect(html).toContain("BC/DH/1998/1234");
    });

    it("generates civil time petition citing Order 17 Rule 1 CPC", () => {
      const html = generateTimePetitionHtml({
        courtName: "বিজ্ঞ যুগ্ম জেলা জজ ১ম আদালত",
        caseNo: "দেওয়ানি মোকদ্দমা নং ৯৯/২০২৪",
        caseType: "CIVIL",
        complainantName: "আব্দুল মজিদ",
        accusedOrOppositeParty: "রহিম বকশ",
        previousHearingDate: "১০ অক্টোবর, ২০২৪",
        reasonsBn: "মূল নথি অন্য ট্রাইব্যুনালে থাকায় দাখিলের জন্য সময় প্রার্থনা।",
        stageBn: "চূড়ান্ত শুনানি",
        advocateName: "ব্যারিস্টার তানভীর আহমেদ",
        advocateBarReg: "BC/DH/2018/4892",
        petitionerSide: "বাদী পক্ষ",
      });

      expect(html).toContain("দেওয়ানি কার্যবিধির ১৭ আদেশ ১ নিয়ম");
      expect(html).toContain("দেওয়ানি মোকদ্দমা নং ৯৯/২০২৪");
      expect(html).toContain("চূড়ান্ত শুনানি");
    });
  });

  describe("4. Vakalatnama Generator (ওকালতনামা)", () => {
    it("generates full Vakalatnama pulling advocate bar council registration", () => {
      const html = generateVakalatnamaFullHtml({
        courtName: "বিজ্ঞ ১ম সহকারী জজ আদালত, ঢাকা",
        caseNo: "দেওয়ানি মোকদ্দমা নং ৫৫/২০২৪",
        complainantName: "মোঃ কামাল হোসেন",
        accusedOrOppositeParty: "আমেনা বেগম",
        appointingParty: "বাদী / আবেদনকারী",
        advocateName: "ব্যারিস্টার তানভীর আহমেদ",
        advocateBarReg: "BC/DH/2018/4892",
        advocateChamber: "চেম্বার ৩০৪, সুপ্রিম কোর্ট বার অ্যানেক্স, ঢাকা",
        advocateMobile: "01711-234567",
      });

      expect(html).toContain("ওকালতনামা (VAKALATNAMA)");
      expect(html).toContain("BC/DH/2018/4892");
      expect(html).toContain("ব্যারিস্টার তানভীর আহমেদ");
      expect(html).toContain("আমি ওকালতনামা গ্রহণ করিলাম");
      expect(html).toContain("মক্কেল / নিয়োগকারীর স্বাক্ষর");
    });
  });

  describe("5. TR-4 Treasury Challan Generator (টি.আর. ৪ চালান)", () => {
    it("generates valid TR-4 challan table with head of account and amount in words", () => {
      const html = generateTR4ChallanHtml({
        headOfAccount: "1-40-801",
        courtName: "বিজ্ঞ জেলা জজ আদালত",
        district: "ঢাকা",
        bankBranch: "সোনালী ব্যাংক লিমিটেড, জজ কোর্ট শাখা",
        depositorName: "ব্যারিস্টার তানভীর আহমেদ",
        depositorAddress: "ঢাকা",
        onBehalfOfName: "মোঃ করিম (বাদী)",
        caseNo: "মামলা নং ১২/২০২৪",
        purpose: "অ্যাড-ভ্যালোরেম কোর্ট ফি",
        amount: 2500,
      });

      expect(html).toContain("বাংলাদেশ ফরম নং টি. আর. ৪");
      expect(html).toContain("1-40-801");
      expect(html).toContain("সোনালী ব্যাংক লিমিটেড");
      expect(html).toContain("দুই হাজার পাঁচ শত টাকা মাত্র");
      expect(html).toContain("টাকা জমাকারীর স্বাক্ষর");
      expect(html).toContain("ট্রেজারি অফিসার");
    });
  });

  describe("6. Notification Log Database & Reminder Dispatch", () => {
    it("logs reminder message in database and retrieves history", async () => {
      const log = await db.createNotificationLog({
        caseId: "case-karim-miah-001",
        recipientPhone: "01711998877",
        message: "বিজ্ঞ আদালত: আগামী শুনানির তারিখ ধার্য করা হয়েছে।",
        channel: "SMS",
        status: "SENT",
      });

      expect(log.id).toBeDefined();
      expect(log.recipientPhone).toBe("01711998877");
      expect(log.status).toBe("SENT");

      const logs = await db.getNotifications("case-karim-miah-001");
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some((l) => l.recipientPhone === "01711998877")).toBe(true);
    });
  });
});
