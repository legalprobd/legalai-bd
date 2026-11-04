/**
 * Section Upgrade Rules (Deterministic Upgrades under Bangladesh Law)
 */

export interface UpgradeRule {
  base: string;
  field: string;
  values: string[];
  upgraded: string;
  reasonBn: string;
}

export const SECTION_UPGRADE_RULES: UpgradeRule[] = [
  {
    base: "448",
    field: "weapon_used",
    values: ["দা", "রামদা", "ছুরি", "রড", "লাঠি", "অস্ত্র", "লোহার রড", "চাপাতি", "হাঁসুয়া"],
    upgraded: "452",
    reasonBn: "আঘাতের প্রস্তুতি/মারাত্মক অস্ত্রসহ গৃহে প্রবেশ — জামিন-অযোগ্য ধারা ৪৫২ প্রযোজ্য",
  },
  {
    base: "323",
    field: "weapon_used",
    values: ["দা", "রামদা", "ছুরি", "ছেনি", "ধারালো অস্ত্র", "চাপাতি", "হাঁসুয়া", "কিরিচ"],
    upgraded: "324",
    reasonBn: "বিপজ্জনক ও ধারালো অস্ত্র দ্বারা আঘাত করায় ধারা ৩২৪ প্রযোজ্য",
  },
  {
    base: "324",
    field: "injury_severity",
    values: ["গুরুতর", "মাথায় ফাটল", "হাড় ভাঙা", "স্থায়ী ক্ষতি", "রক্তাক্ত জখম", "সেলাই লেগেছে", "অঙ্গহানি"],
    upgraded: "326",
    reasonBn: "মারাত্মক অস্ত্র দ্বারা গুরুতর রক্তাক্ত জখম সৃষ্টি করায় জামিন-অযোগ্য ধারা ৩২৬ প্রযোজ্য",
  },
  {
    base: "323",
    field: "vital_part_involved",
    values: ["মাথা", "বুক", "গলা", "পেট", "মাথায় আঘাত", "বুকে আঘাত"],
    upgraded: "307",
    reasonBn: "শরীরের সংবেদনশীল অঙ্গ (মাথা/বুক) লক্ষ্য করিয়া প্রাণনাশের উদ্দেশ্যে আঘাত করায় হত্যাচেষ্টার ধারা ৩০৭ প্রযোজ্য",
  },
  {
    base: "380",
    field: "force_or_fear",
    values: ["হ্যাঁ", "বলপ্রয়োগ", "ভয় দেখিয়ে", "অস্ত্রের মুখে", "জিম্মি করে"],
    upgraded: "392",
    reasonBn: "অস্ত্র প্রদর্শন ও বলপ্রয়োগে লুণ্ঠন করায় চুরির পরিবর্তে দস্যুতা/ছিনতাইয়ের ধারা ৩৯২ প্রযোজ্য",
  },
  {
    base: "392",
    field: "attacker_count",
    values: ["৫", "৫+", "৫ এর বেশি", "৬", "৭", "৮", "১০", "১২", "১০/১২"],
    upgraded: "395",
    reasonBn: "আক্রমণকারী বা লুণ্ঠনকারীর সংখ্যা ৫ বা ততোধিক হওয়ায় সরাসরি ডাকাইতির ধারা ৩৯৫ প্রযোজ্য",
  },
  {
    base: "143",
    field: "attacker_count",
    values: ["৫", "৫+", "৫ জন বা বেশি", "৬", "৭", "৮", "১০", "১২", "১০/১২"],
    upgraded: "147",
    reasonBn: "৫ বা ততোধিক ব্যক্তি একত্র হইয়া বলপ্রয়োগ ও তাণ্ডব সৃষ্টি করায় দাঙ্গার ধারা ১৪৭ প্রযোজ্য",
  },
  {
    base: "147",
    field: "weapon_used",
    values: ["মারাত্মক অস্ত্র", "দা", "রামদা", "ছুরি", "রড", "অস্ত্রশস্ত্রে সজ্জিত"],
    upgraded: "148",
    reasonBn: "মারাত্মক অস্ত্রে সজ্জিত হইয়া দাঙ্গা করায় জামিন-অযোগ্য ধারা ১৪৮ প্রযোজ্য",
  },
];

/**
 * Apply deterministic section upgrades based on collected facts and answers
 */
export function applySectionUpgrades(currentSections: string[], answersMap: Record<string, string>): {
  upgradedSections: string[];
  appliedReasons: string[];
} {
  const sectionsSet = new Set(currentSections);
  const appliedReasons: string[] = [];

  for (const rule of SECTION_UPGRADE_RULES) {
    if (sectionsSet.has(rule.base)) {
      // Check if any answered field matches the trigger
      const rawVal = (answersMap[rule.field] || "").toLowerCase();
      const matched = rule.values.some(v => rawVal.includes(v.toLowerCase()));
      if (matched) {
        sectionsSet.delete(rule.base);
        sectionsSet.add(rule.upgraded);
        appliedReasons.push(rule.reasonBn);
      }
    }
  }

  return {
    upgradedSections: Array.from(sectionsSet),
    appliedReasons,
  };
}
