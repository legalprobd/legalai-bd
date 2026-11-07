import { DraftDocType } from "@/lib/ai/schemas";

export interface DocOptionItem {
  id: DraftDocType;
  label: string;
  group: string;
}

export type NormalizedCategory = "CIVIL" | "CRIMINAL" | "NUISANCE" | "FAMILY" | "SPECIAL_TRIBUNAL" | "GENERAL";

/**
 * Normalizes any category string or case content into a strict category enum.
 */
export function normalizeCategory(
  category: string = "",
  title: string = "",
  rawStatement: string = ""
): NormalizedCategory {
  const cat = (category || "").toUpperCase().trim();
  const combined = `${title} ${rawStatement}`.toLowerCase();

  // 1. Check for Nuisance (Smoking, noise, public nuisance)
  if (
    cat === "NUISANCE" ||
    cat === "PUBLIC_NUISANCE" ||
    combined.includes("ধূমপান") ||
    combined.includes("ধুমপান") ||
    combined.includes("সিগারেট") ||
    combined.includes("তামাক") ||
    combined.includes("উপদ্রব") ||
    combined.includes("জোরে গান") ||
    combined.includes("শব্দ দূষণ")
  ) {
    return "NUISANCE";
  }

  // 2. Check for Family
  if (
    cat === "FAMILY" ||
    cat.includes("GUARDIANSHIP") ||
    combined.includes("তালাক") ||
    combined.includes("দেনমোহর") ||
    combined.includes("খোরপোশ") ||
    combined.includes("ভরণপোষণ") ||
    combined.includes("অভিভাবকত্ব")
  ) {
    return "FAMILY";
  }

  // 3. Check for Civil / Land Dispute
  if (
    cat === "CIVIL" ||
    cat.includes("LAND") ||
    cat.includes("PROPERTY") ||
    combined.includes("নালিশি জমি") ||
    combined.includes("খতিয়ান") ||
    combined.includes("স্বত্ব ঘোষণা") ||
    combined.includes("চিরস্থায়ী নিষেধাজ্ঞা") ||
    combined.includes("বায়নানামা") ||
    combined.includes("জমির সীমানা")
  ) {
    return "CIVIL";
  }

  // 4. Check for Special Tribunal (Nari o Shishu, Cyber, Artha Rin)
  if (
    cat === "SPECIAL_TRIBUNAL" ||
    cat.includes("TRIBUNAL") ||
    combined.includes("নারী ও শিশু") ||
    combined.includes("যৌতুক") ||
    combined.includes("সাইবার") ||
    combined.includes("অর্থ ঋণ")
  ) {
    return "SPECIAL_TRIBUNAL";
  }

  // 5. Check for Criminal
  if (
    cat === "CRIMINAL" ||
    combined.includes("ছুরি") ||
    combined.includes("আঘাত") ||
    combined.includes("মারধর") ||
    combined.includes("রক্তাক্ত") ||
    combined.includes("খুন") ||
    combined.includes("ছিনতাই") ||
    combined.includes("অস্ত্র") ||
    combined.includes("ডাকাতি") ||
    combined.includes("হুমকি") ||
    combined.includes("চেক ডিজঅনার")
  ) {
    return "CRIMINAL";
  }

  return cat === "CIVIL" ? "CIVIL" : "CRIMINAL";
}

/**
 * Returns strictly allowed document types for a given case category.
 * - CIVIL: strictly PLAINT, INJUNCTION, WRITTEN_STATEMENT, AFFIDAVIT, VAKALATNAMA, LEGAL_NOTICE. (NO FIR)
 * - NUISANCE: strictly GD, LEGAL_NOTICE, AFFIDAVIT. (NO FIR, NO PLAINT)
 * - CRIMINAL: strictly FIR, GD, CR_PETITION, BAIL_PETITION, etc.
 * - FAMILY: strictly DIVORCE_PLAINT, DOWER_RECOVERY, MAINTENANCE, CUSTODY, etc.
 */
export function getAllowedDocumentOptions(
  category: string = "",
  title: string = "",
  rawStatement: string = ""
): DocOptionItem[] {
  const norm = normalizeCategory(category, title, rawStatement);

  if (norm === "CIVIL") {
    return [
      { id: "PLAINT", label: "দেওয়ানি আরজি (Plaint)", group: "দেওয়ানি আদালত (Civil Court)" },
      { id: "INJUNCTION_TEMP", label: "অস্থায়ী নিষেধাজ্ঞা দরখাস্ত (Order 39 CPC)", group: "দেওয়ানি আদালত (Civil Court)" },
      { id: "INJUNCTION_PERMANENT", label: "চিরস্থায়ী নিষেধাজ্ঞা (Perpetual Injunction)", group: "দেওয়ানি আদালত (Civil Court)" },
      { id: "WRITTEN_STATEMENT", label: "লিখিত জবাব (Written Statement)", group: "দেওয়ানি আদালত (Civil Court)" },
      { id: "AFFIDAVIT", label: "হলফনামা (Affidavit)", group: "আইনি ফরম (Legal Form)" },
      { id: "VAKALATNAMA", label: "ওকালতনামা (Vakalatnama)", group: "আইনি ফরম (Legal Form)" },
      { id: "LEGAL_NOTICE", label: "লিগ্যাল নোটিশ (Legal Notice)", group: "সহায়ক আইনি নথি (Supporting)" },
      { id: "DAMAGE_INVENTORY", label: "দখল ও মালামালের তফসিল", group: "সহায়ক আইনি নথি (Supporting)" },
    ];
  }

  if (norm === "NUISANCE") {
    return [
      { id: "GD", label: "সাধারণ ডায়েরি (GD - জনউপদ্রব)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Police/Magistrate)" },
      { id: "LEGAL_NOTICE", label: "সতর্কীকরণ লিগ্যাল নোটিশ (Legal Notice)", group: "সহায়ক আইনি নথি (Supporting)" },
      { id: "AFFIDAVIT", label: "হলফনামা (Affidavit)", group: "আইনি ফরম (Legal Form)" },
      { id: "WITNESS_LIST", label: "প্রতিবেশী সাক্ষীদের তালিকা", group: "সহায়ক আইনি নথি (Supporting)" },
    ];
  }

  if (norm === "FAMILY") {
    return [
      { id: "DIVORCE_PLAINT", label: "তালাক / বিবাহবিচ্ছেদ মোকদ্দমা", group: "পারিবারিক আদালত (Family Court)" },
      { id: "DOWER_RECOVERY", label: "দেনমোহর আদায়ের আরজি", group: "পারিবারিক আদালত (Family Court)" },
      { id: "MAINTENANCE", label: "খোরপোশ ও ভরণপোষণ দাবি", group: "পারিবারিক আদালত (Family Court)" },
      { id: "CUSTODY", label: "সন্তানের হেফাজত ও অভিভাবকত্ব দাবি", group: "পারিবারিক আদালত (Family Court)" },
      { id: "AFFIDAVIT", label: "হলফনামা (Affidavit)", group: "আইনি ফরম (Legal Form)" },
      { id: "VAKALATNAMA", label: "ওকালতনামা (Vakalatnama)", group: "আইনি ফরম (Legal Form)" },
      { id: "LEGAL_NOTICE", label: "লিগ্যাল নোটিশ (Legal Notice)", group: "সহায়ক আইনি নথি (Supporting)" },
    ];
  }

  if (norm === "SPECIAL_TRIBUNAL") {
    return [
      { id: "CR_PETITION", label: "বিশেষ ট্রাইব্যুনাল নালিশি দরখাস্ত", group: "বিশেষ ট্রাইব্যুনাল (Special Tribunal)" },
      { id: "BAIL_PETITION", label: "জামিনের আবেদন (Bail Petition)", group: "বিশেষ ট্রাইব্যুনাল (Special Tribunal)" },
      { id: "CYBER_COMPLAINT", label: "সাইবার ট্রাইব্যুনাল নালিশ", group: "বিশেষ ট্রাইব্যুনাল (Special Tribunal)" },
      { id: "ARTHA_RIN_PLAINT", label: "অর্থ ঋণ মোকদ্দমার আরজি", group: "বিশেষ ট্রাইব্যুনাল (Special Tribunal)" },
      { id: "AFFIDAVIT", label: "হলফনামা (Affidavit)", group: "আইনি ফরম (Legal Form)" },
      { id: "VAKALATNAMA", label: "ওকালতনামা (Vakalatnama)", group: "আইনি ফরম (Legal Form)" },
    ];
  }

  // Default CRIMINAL
  return [
    { id: "FIR", label: "থানার এজাহার (FIR)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)" },
    { id: "GD", label: "সাধারণ ডায়েরি (GD)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)" },
    { id: "CR_PETITION", label: "সি.আর. নালিশি মামলা (CR Petition)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)" },
    { id: "BAIL_PETITION", label: "জামিনের আবেদন (Bail Petition)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)" },
    { id: "ANTICIPATORY_BAIL", label: "আগাম জামিনের আবেদন (Anticipatory Bail)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)" },
    { id: "NARAJI", label: "নারাজি পিটিশন (Naraji Petition)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)" },
    { id: "TIME_PETITION", label: "সময়ের আবেদন (Time Petition)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)" },
    { id: "CROSS_EXAM_QUESTIONS", label: "জেরার প্রশ্নাবলি (Cross-Exam Guide)", group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)" },
    { id: "AFFIDAVIT", label: "হলফনামা (Affidavit)", group: "আইনি ফরম (Legal Form)" },
    { id: "VAKALATNAMA", label: "ওকালতনামা (Vakalatnama)", group: "আইনি ফরম (Legal Form)" },
    { id: "LEGAL_NOTICE", label: "লিগ্যাল নোটিশ (Legal Notice)", group: "সহায়ক আইনি নথি (Supporting)" },
  ];
}

/**
 * Returns the default primary document type for a given category.
 */
export function getDefaultDocTypeForCategory(
  category: string = "",
  title: string = "",
  rawStatement: string = ""
): DraftDocType {
  const norm = normalizeCategory(category, title, rawStatement);
  switch (norm) {
    case "CIVIL":
      return "PLAINT";
    case "NUISANCE":
      return "GD";
    case "FAMILY":
      return "DOWER_RECOVERY";
    case "SPECIAL_TRIBUNAL":
      return "CR_PETITION";
    case "CRIMINAL":
    default:
      return "FIR";
  }
}
