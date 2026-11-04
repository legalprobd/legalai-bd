import { describe, it, expect } from "vitest";
import { validateAddressDisputedGate, checkDocumentReadiness } from "@/lib/ai/guards";
import { verifyPostalReceiptEvidence } from "@/lib/law/evidenceGate";
import { getNiActJurisdiction } from "@/lib/law/niAct";
import { calculateDeadline, isCourtHolidayOrWeekend } from "@/lib/law/limitation";
import { generateCrPetitionTemplate } from "@/lib/templates/bdCourtTemplates";

describe("System Architect Critical Business Logic Constraints", () => {
  // =========================================================================
  // CONSTRAINT 1: Strict Boolean Gate for addressDisputed
  // =========================================================================
  describe("Constraint 1: Strict Boolean Gate for addressDisputed", () => {
    it("fails the gate when addressDisputed is null", () => {
      const result = validateAddressDisputedGate({ addressDisputed: null });
      expect(result).toBe(false);

      const readiness = checkDocumentReadiness({ addressDisputed: null });
      expect(readiness.canProceed).toBe(false);
      expect(readiness.errorBn).toContain("addressDisputed must be strictly false");
    });

    it("fails the gate when addressDisputed is undefined", () => {
      const result = validateAddressDisputedGate({});
      expect(result).toBe(false);

      const readiness = checkDocumentReadiness({});
      expect(readiness.canProceed).toBe(false);
    });

    it("fails the gate when addressDisputed is true", () => {
      const result = validateAddressDisputedGate({ addressDisputed: true });
      expect(result).toBe(false);

      const readiness = checkDocumentReadiness({ addressDisputed: true });
      expect(readiness.canProceed).toBe(false);
    });

    it("fails the gate when addressDisputed is a truthy/falsy non-boolean string", () => {
      const resultStringFalse = validateAddressDisputedGate({ addressDisputed: "false" as any });
      expect(resultStringFalse).toBe(false);

      const resultZero = validateAddressDisputedGate({ addressDisputed: 0 as any });
      expect(resultZero).toBe(false);
    });

    it("strictly passes the gate ONLY when addressDisputed is boolean false", () => {
      const result = validateAddressDisputedGate({ addressDisputed: false });
      expect(result).toBe(true);

      const readiness = checkDocumentReadiness({ addressDisputed: false, completenessScore: 90 });
      expect(readiness.canProceed).toBe(true);
    });
  });

  // =========================================================================
  // CONSTRAINT 2: Real Database Relationship Check for Evidence
  // =========================================================================
  describe("Constraint 2: Real Database Relationship Check for Evidence", () => {
    it("fails the gate when relying solely on mock boolean flags without DB evidence", async () => {
      // Mock client that returns null from database
      const mockPrismaClient = {
        evidenceFile: {
          findFirst: async () => null,
        },
      };

      // Even if caller claims { has_ad_card: true, hasPostalReceipt: true }
      const mockFlags = { has_ad_card: true, hasPostalReceipt: true };
      expect(mockFlags.has_ad_card).toBe(true);

      // The real database relationship check MUST fail
      const result = await verifyPostalReceiptEvidence("case-no-evidence-001", mockPrismaClient);
      expect(result.passed).toBe(false);
      expect(result.receiptId).toBeUndefined();
      expect(result.errorBn).toContain("ডাক রসিদ বা একনলেজমেন্ট কার্ডের");
    });

    it("fails the gate when caseId is empty or invalid", async () => {
      const result = await verifyPostalReceiptEvidence("");
      expect(result.passed).toBe(false);
    });

    it("passes the gate when postal receipt evidence record actually exists in database", async () => {
      const mockPrismaClient = {
        evidenceFile: {
          findFirst: async ({ where }: any) => {
            if (where.caseId === "case-valid-evidence-001") {
              return {
                id: "ev-postal-rec-999",
                caseId: "case-valid-evidence-001",
                fileName: "postal_receipt_ad_card.jpg",
                fileType: "POSTAL_RECEIPT",
                factMapping: { type: "POSTAL_RECEIPT" },
              };
            }
            return null;
          },
        },
      };

      const result = await verifyPostalReceiptEvidence("case-valid-evidence-001", mockPrismaClient);
      expect(result.passed).toBe(true);
      expect(result.receiptId).toBe("ev-postal-rec-999");
    });
  });

  // =========================================================================
  // CONSTRAINT 3: NI Act 2026 Jurisdiction Logic (Section 141(c))
  // =========================================================================
  describe("Constraint 3: NI Act 2026 Jurisdiction Logic (Section 141(c))", () => {
    it("routes a 6 Lakh cheque (amount > 500000) to Joint Sessions Judge", () => {
      const jurisdiction = getNiActJurisdiction(600000, "ঢাকা");
      expect(jurisdiction.courtType).toBe("Joint Sessions Judge");
      expect(jurisdiction.courtNameBn).toContain("যুগ্ম দায়রা জজ আদালত");
      expect(jurisdiction.actReferenceBn).toContain("ধারা ১৪১(গ)");
    });

    it("routes a 10 Lakh cheque with Bengali string formatting to Joint Sessions Judge", () => {
      const jurisdiction = getNiActJurisdiction("১০,০০,০০০/- টাকা", "চট্টগ্রাম");
      expect(jurisdiction.courtType).toBe("Joint Sessions Judge");
      expect(jurisdiction.courtNameBn).toBe("বিজ্ঞ যুগ্ম দায়রা জজ আদালত, চট্টগ্রাম");
    });

    it("routes a 5 Lakh cheque (amount = 500000) to Magistrate", () => {
      const jurisdiction = getNiActJurisdiction(500000, "ঢাকা");
      expect(jurisdiction.courtType).toBe("Magistrate");
      expect(jurisdiction.courtNameBn).toContain("চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত");
    });

    it("routes a 1.5 Lakh cheque (amount < 500000) to Magistrate", () => {
      const jurisdiction = getNiActJurisdiction(150000, "সিলেট");
      expect(jurisdiction.courtType).toBe("Magistrate");
      expect(jurisdiction.courtNameBn).toBe("বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত, সিলেট");
    });

    it("dynamically injects Joint Sessions Judge into CR petition when cheque amount exceeds 5 Lakhs", () => {
      const plaintHtml = generateCrPetitionTemplate({
        isNiAct: true,
        chequeAmount: 750000,
        district: "ঢাকা",
        complainantName: "আব্দুল মজিদ",
        totalFinancialLoss: "৭,৫০,০০০/- টাকা",
        applicableLaws: [{
          actNameBn: "দ্য নেগোশিয়েবল ইন্সট্রুমেন্টস অ্যাক্ট",
          section: "138",
          titleBn: "চেক ডিজঅনার",
          bailableStatusBn: "জামিনযোগ্য",
          punishmentBn: "১ বছর কারাদণ্ড",
          reasoningBn: "",
          confidence: "HIGH"
        }],
      });

      expect(plaintHtml).toContain("বিজ্ঞ যুগ্ম দায়রা জজ আদালত");
      expect(plaintHtml).toContain("ধারা ১৪১(গ)");
      expect(plaintHtml).not.toContain("বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত");
    });

    it("dynamically injects Magistrate into CR petition when cheque amount is within 5 Lakhs", () => {
      const plaintHtml = generateCrPetitionTemplate({
        isNiAct: true,
        chequeAmount: 300000,
        district: "ঢাকা",
        complainantName: "আব্দুল মজিদ",
        totalFinancialLoss: "৩,০০,০০০/- টাকা",
        applicableLaws: [{
          actNameBn: "দ্য নেগোশিয়েবল ইন্সট্রুমেন্টস অ্যাক্ট",
          section: "138",
          titleBn: "চেক ডিজঅনার",
          bailableStatusBn: "জামিনযোগ্য",
          punishmentBn: "১ বছর কারাদণ্ড",
          reasoningBn: "",
          confidence: "HIGH"
        }],
      });

      expect(plaintHtml).toContain("বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত");
      expect(plaintHtml).not.toContain("বিজ্ঞ যুগ্ম দায়রা জজ আদালত");
    });
  });

  // =========================================================================
  // CONSTRAINT 4: Holiday Deadline Extension Flag
  // =========================================================================
  describe("Constraint 4: Holiday Deadline Extension Flag", () => {
    it("detects when a date falls on Friday or Saturday in Bangladesh", () => {
      // 2026-11-20 is a Friday
      const friday = new Date("2026-11-20T10:00:00Z");
      expect(isCourtHolidayOrWeekend(friday)).toBe(true);

      // 2026-11-21 is a Saturday
      const saturday = new Date("2026-11-21T10:00:00Z");
      expect(isCourtHolidayOrWeekend(saturday)).toBe(true);

      // 2026-11-18 is a Wednesday
      const wednesday = new Date("2026-11-18T10:00:00Z");
      expect(isCourtHolidayOrWeekend(wednesday)).toBe(false);
    });

    it("detects statutory court holidays (e.g., Dec 16 Victory Day)", () => {
      const victoryDay = new Date("2026-12-16T10:00:00Z");
      expect(isCourtHolidayOrWeekend(victoryDay)).toBe(true);
    });

    it("returns NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION: true when deadline falls on Friday", () => {
      // Set trigger date such that trigger + 30 days lands on Friday (2026-11-20)
      // 2026-11-20 minus 30 days = 2026-10-21
      const triggerDate = new Date("2026-10-21T10:00:00Z");
      const calculation = calculateDeadline("NI_ACT_138_NOTICE", triggerDate);

      const deadlineDate = new Date(calculation.deadline!);
      expect(deadlineDate.getDay()).toBe(5); // 5 = Friday
      expect(calculation.NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION).toBe(true);
    });

    it("returns NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION: false when deadline falls on a regular working day", () => {
      // Set trigger date such that trigger + 30 days lands on Wednesday (2026-11-18)
      // 2026-11-18 minus 30 days = 2026-10-19
      const triggerDate = new Date("2026-10-19T10:00:00Z");
      const calculation = calculateDeadline("NI_ACT_138_NOTICE", triggerDate);

      const deadlineDate = new Date(calculation.deadline!);
      expect(deadlineDate.getDay()).toBe(3); // 3 = Wednesday
      expect(calculation.NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION).toBe(false);
    });

    it("returns NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION: false when caseType has no deadline (periodDays = 0)", () => {
      const calculation = calculateDeadline("CRIMINAL_FIR", new Date());
      expect(calculation.deadline).toBeNull();
      expect(calculation.NEEDS_LAWYER_REVIEW_FOR_HOLIDAY_EXTENSION).toBe(false);
    });
  });
});
