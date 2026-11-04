import { describe, it, expect } from "vitest";
import { enforceBangla, enforcePlaceholders, detectContradictions, checkUserCredits } from "@/lib/ai/guards";

describe("Hallucination & Legal Guards", () => {
  it("enforces authentic Bengali text", () => {
    expect(enforceBangla("এটি একটি বাংলা বাক্য")).toBe(true);
    expect(enforceBangla("This is pure english without bangla")).toBe(false);
  });

  it("enforces placeholder brackets formatting", () => {
    const rawHtml = "পিতা: [পিতার নাম], বয়স: [বয়স]";
    const formatted = enforcePlaceholders(rawHtml);
    expect(formatted).toContain("**[পিতার নাম]**");
    expect(formatted).toContain("**[বয়স]**");
  });

  it("detects contradiction between attacker count and statement", () => {
    const statement = "করিম মিয়া লোকজন নিয়ে আমাদের বাসায় ঢুকেছিল";
    const answers = { attacker_count: "১ জন" };
    const contradictions = detectContradictions({ rawStatement: statement }, answers);
    expect(contradictions.length).toBeGreaterThan(0);
  });

  it("correctly monitors credits used based on plan limits", () => {
    const freeUser = checkUserCredits(55, "FREE");
    expect(freeUser.canProceed).toBe(false);

    const proUser = checkUserCredits(200, "PRO");
    expect(proUser.canProceed).toBe(true);

    const proUserNearLimit = checkUserCredits(850, "PRO");
    expect(proUserNearLimit.canProceed).toBe(true);
    expect(proUserNearLimit.warning).toBeDefined();
  });
});
