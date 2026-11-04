import { describe, it, expect } from "vitest";
import { applySectionUpgrades } from "@/lib/law/upgradeRules";

describe("Section Upgrade Rules Engine", () => {
  it("upgrades Section 448 to Section 452 if dangerous weapon was used during home entry", () => {
    const currentSections = ["448", "323"];
    const answers = { weapon_used: "লোহার রড ও রামদা" };
    const { upgradedSections, appliedReasons } = applySectionUpgrades(currentSections, answers);

    expect(upgradedSections).toContain("452");
    expect(upgradedSections).not.toContain("448");
    expect(appliedReasons.length).toBeGreaterThan(0);
  });

  it("upgrades Section 323 to 324 when sharp/dangerous weapon is identified", () => {
    const currentSections = ["323"];
    const answers = { weapon_used: "ধারালো দা" };
    const { upgradedSections } = applySectionUpgrades(currentSections, answers);

    expect(upgradedSections).toContain("324");
    expect(upgradedSections).not.toContain("323");
  });

  it("upgrades Section 323 to 307 when vital body part (head/chest) is targeted", () => {
    const currentSections = ["323"];
    const answers = { vital_part_involved: "মাথা লক্ষ্য করে আঘাত" };
    const { upgradedSections } = applySectionUpgrades(currentSections, answers);

    expect(upgradedSections).toContain("307");
  });

  it("upgrades Section 392 to 395 when 5 or more attackers are involved in looting", () => {
    const currentSections = ["392"];
    const answers = { attacker_count: "৫ জন বা বেশি" };
    const { upgradedSections } = applySectionUpgrades(currentSections, answers);

    expect(upgradedSections).toContain("395");
    expect(upgradedSections).not.toContain("392");
  });
});
