import { describe, it, expect } from "vitest";
import { computeCompleteness, getCompletenessReport } from "@/lib/law/completeness";

describe("Completeness Score Engine", () => {
  it("returns 0 when no fields are answered", () => {
    const score = computeCompleteness(["323", "448"], new Set());
    expect(score).toBe(0);
  });

  it("calculates proportional score as required fields are added", () => {
    const laws = ["323", "448"];
    const answered = new Set(["incident_date_time", "incident_place", "voluntary_hurt"]);
    const score = computeCompleteness(laws, answered);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns 100 when all required fields and base essentials are answered", () => {
    const laws = ["448"];
    const allRequired = new Set([
      "house_trespass",
      "incident_date_time",
      "incident_place",
      "accused_identity",
    ]);
    const score = computeCompleteness(laws, allRequired);
    expect(score).toBe(100);
  });

  it("provides detailed breakdown report per section", () => {
    const report = getCompletenessReport(["323", "448"], new Set(["voluntary_hurt"]));
    expect(report.totalRequiredIngredients).toBeGreaterThan(0);
    expect(report.perSectionBreakdown["323"]).toBeDefined();
  });
});
