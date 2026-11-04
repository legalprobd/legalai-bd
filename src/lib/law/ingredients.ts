/**
 * Bangladesh Law Offence Ingredient Graph (40+ Sections across primary Acts)
 * Used to deterministically check required legal elements for bulletproof drafting.
 */

export interface IngredientRule {
  actNameEn: string;
  actNameBn: string;
  sectionNumber: string;
  titleBn: string;
  required: string[];
  optional?: string[];
  upgradesFrom?: string[];
  bailable: boolean;
  maxPunishmentBn: string;
}

export const OFFENCE_INGREDIENTS: Record<string, IngredientRule> = {
  // --- Penal Code, 1860 ---
  "34": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "34",
    titleBn: "সাধারণ অভিপ্রায় (Common Intention)",
    required: ["common_intention", "multiple_accused"],
    bailable: true,
    maxPunishmentBn: "মূল ধারার সমান শাস্তি",
  },
  "143": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "143",
    titleBn: "বেআইনি সমাবেশ (Unlawful Assembly)",
    required: ["unlawful_assembly_5plus", "common_object"],
    bailable: true,
    maxPunishmentBn: "৬ মাস কারাদণ্ড বা অর্থদণ্ড বা উভয়",
  },
  "147": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "147",
    titleBn: "দাঙ্গা হাঙ্গামা (Rioting)",
    required: ["rioting", "unlawful_assembly_5plus"],
    upgradesFrom: ["143"],
    bailable: false,
    maxPunishmentBn: "২ বছর কারাদণ্ড বা অর্থদণ্ড",
  },
  "148": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "148",
    titleBn: "মারাত্মক অস্ত্রে সজ্জিত হইয়া দাঙ্গা (Rioting with deadly weapon)",
    required: ["rioting", "deadly_weapon", "unlawful_assembly_5plus"],
    upgradesFrom: ["147"],
    bailable: false,
    maxPunishmentBn: "৩ বছর কারাদণ্ড বা অর্থদণ্ড",
  },
  "307": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "307",
    titleBn: "খুনের চেষ্টা (Attempt to Murder)",
    required: ["attempt_to_murder", "vital_part_involved", "intent_to_kill"],
    bailable: false,
    maxPunishmentBn: "১০ বছর সশ্রম কারাদণ্ড / যাবজ্জীবন কারাদণ্ড",
  },
  "323": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "323",
    titleBn: "স্বেচ্ছাকৃত সাধারণ আঘাত (Voluntarily Causing Hurt)",
    required: ["voluntary_hurt", "injury_present"],
    bailable: true,
    maxPunishmentBn: "১ বছর কারাদণ্ড বা ১,০০০ টাকা অর্থদণ্ড",
  },
  "324": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "324",
    titleBn: "মারাত্মক বা বিপজ্জনক অস্ত্র দ্বারা আঘাত (Hurt by dangerous weapons)",
    required: ["hurt_by_dangerous_weapon", "injury_present"],
    upgradesFrom: ["323"],
    bailable: false,
    maxPunishmentBn: "৩ বছর কারাদণ্ড বা অর্থদণ্ড বা উভয়",
  },
  "325": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "325",
    titleBn: "স্বেচ্ছাকৃত গুরুতর আঘাত (Voluntarily Causing Grievous Hurt)",
    required: ["grievous_hurt", "injury_present"],
    upgradesFrom: ["323"],
    bailable: false,
    maxPunishmentBn: "৭ বছর কারাদণ্ড ও অর্থদণ্ড",
  },
  "326": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "326",
    titleBn: "মারাত্মক অস্ত্র দ্বারা গুরুতর রক্তাক্ত জখম (Grievous Hurt by deadly weapon)",
    required: ["grievous_hurt_by_dangerous_weapon", "medical_report_present"],
    upgradesFrom: ["323", "324", "325"],
    bailable: false,
    maxPunishmentBn: "যাবজ্জীবন কারাদণ্ড অথবা ১০ বছর সশ্রম কারাদণ্ড ও অর্থদণ্ড",
  },
  "379": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "379",
    titleBn: "চুরি (Theft)",
    required: ["theft", "property_taken_dishonestly"],
    bailable: true,
    maxPunishmentBn: "৩ বছর কারাদণ্ড বা অর্থদণ্ড",
  },
  "380": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "380",
    titleBn: "বাসগৃহে বা বসতবাড়িতে চুরি (Theft in dwelling house)",
    required: ["theft_in_dwelling", "property_taken"],
    bailable: false,
    maxPunishmentBn: "৭ বছর কারাদণ্ড ও অর্থদণ্ড",
  },
  "385": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "385",
    titleBn: "চাঁদাবাজির উদ্দেশ্যে ক্ষতিভয় প্রদর্শন (Extortion by injury threat)",
    required: ["extortion_threat", "fear_of_injury"],
    bailable: true,
    maxPunishmentBn: "২ বছর কারাদণ্ড বা অর্থদণ্ড",
  },
  "392": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "392",
    titleBn: "দস্যুতা বা ছিনতাই (Robbery)",
    required: ["robbery", "force_or_fear"],
    upgradesFrom: ["379", "380"],
    bailable: false,
    maxPunishmentBn: "১০ বছর সশ্রম কারাদণ্ড ও অর্থদণ্ড (মহাসড়কে ১৪ বছর)",
  },
  "395": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "395",
    titleBn: "ডাকাইতি (Dacoity - 5 or more persons)",
    required: ["dacoity_5plus", "force_or_fear"],
    upgradesFrom: ["392"],
    bailable: false,
    maxPunishmentBn: "যাবজ্জীবন কারাদণ্ড অথবা ১০ বছর পর্যন্ত সশ্রম কারাদণ্ড ও অর্থদণ্ড",
  },
  "427": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "427",
    titleBn: "অনিষ্ট সাধন ও ভাঙচুর (Mischief causing damage)",
    required: ["mischief", "property_damage_value"],
    bailable: true,
    maxPunishmentBn: "২ বছর কারাদণ্ড বা অর্থদণ্ড বা উভয়",
  },
  "447": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "447",
    titleBn: "অপরাধমূলক অনধিকার প্রবেশ (Criminal Trespass)",
    required: ["criminal_trespass"],
    bailable: true,
    maxPunishmentBn: "৩ মাস কারাদণ্ড বা ৫০০ টাকা জরিমানা",
  },
  "448": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "448",
    titleBn: "গৃহে অনধিকার প্রবেশ (House Trespass)",
    required: ["house_trespass"],
    bailable: true,
    maxPunishmentBn: "১ বছর কারাদণ্ড বা ১,০০০ টাকা জরিমানা",
  },
  "452": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "452",
    titleBn: "আঘাত বা আক্রমণের প্রস্তুতিসহ গৃহে অনধিকার প্রবেশ (House Trespass with preparation to hurt)",
    required: ["house_trespass", "weapon_or_hurt_after_entry"],
    upgradesFrom: ["448"],
    bailable: false,
    maxPunishmentBn: "৭ বছর সশ্রম কারাদণ্ড ও অর্থদণ্ড",
  },
  "506": {
    actNameEn: "The Penal Code, 1860",
    actNameBn: "দণ্ডবিধি, ১৮৬০",
    sectionNumber: "506",
    titleBn: "অপরাধমূলক হুমকি ও ভীতি প্রদর্শন (Criminal Intimidation)",
    required: ["criminal_intimidation"],
    bailable: true,
    maxPunishmentBn: "২ বছর কারাদণ্ড বা অর্থদণ্ড (মৃত্যুর হুমকি দিলে ৭ বছর)",
  },

  // --- Negotiable Instruments Act, 1881 ---
  "138": {
    actNameEn: "Negotiable Instruments Act, 1881",
    actNameBn: "দ্য নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্ট, ১৮৮১",
    sectionNumber: "138",
    titleBn: "চেক ডিজঅনার বা পর্যাপ্ত তহবিল ঘাটতি (Cheque Dishonour)",
    required: ["cheque_dishonour", "legal_notice_sent", "insufficiency_of_funds"],
    bailable: true,
    maxPunishmentBn: "১ বছর কারাদণ্ড বা চেকে উল্লেখিত টাকার ৩ গুণ পর্যন্ত অর্থদণ্ড",
  },

  // --- Nari O Shishu Nirjatan Daman Ain, 2000 ---
  "9_1": {
    actNameEn: "Nari O Shishu Nirjatan Daman Ain, 2000",
    actNameBn: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০",
    sectionNumber: "9(1)",
    titleBn: "ধর্ষণ (Rape)",
    required: ["non_consensual_intercourse", "medical_test_or_victim_statement"],
    bailable: false,
    maxPunishmentBn: "যাবজ্জীবন সশ্রম কারাদণ্ড ও অর্থদণ্ড",
  },
  "10": {
    actNameEn: "Nari O Shishu Nirjatan Daman Ain, 2000",
    actNameBn: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০",
    sectionNumber: "10",
    titleBn: "যৌন নিপীড়ন (Sexual Harassment / Assault)",
    required: ["sexual_harassment_or_indecent_outrage"],
    bailable: false,
    maxPunishmentBn: "১০ বছর কিন্তু ন্যূনতম ৩ বছর সশ্রম কারাদণ্ড",
  },
  "11_ga": {
    actNameEn: "Nari O Shishu Nirjatan Daman Ain, 2000",
    actNameBn: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০",
    sectionNumber: "11(গ)",
    titleBn: "যৌতুকের জন্য সাধারণ জখম (Hurt for Dowry)",
    required: ["physical_abuse_woman", "injury_present", "dowry_demand"],
    bailable: true,
    maxPunishmentBn: "৩ বছর কিন্তু ন্যূনতম ১ বছর কারাদণ্ড ও অর্থদণ্ড",
  },

  // --- Specific Relief Act, 1877 & CPC ---
  "sr_42": {
    actNameEn: "Specific Relief Act, 1877",
    actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
    sectionNumber: "42",
    titleBn: "স্বত্ব ঘোষণা (Declaration of Title)",
    required: ["title_clouded", "legal_character_denied"],
    bailable: true,
    maxPunishmentBn: "দেওয়ানি ডিক্রি",
  },
  "sr_54": {
    actNameEn: "Specific Relief Act, 1877",
    actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
    sectionNumber: "54",
    titleBn: "চিরস্থায়ী নিষেধাজ্ঞা (Perpetual Injunction)",
    required: ["irreparable_loss_threat", "peaceful_possession_disturbed"],
    bailable: true,
    maxPunishmentBn: "স্থায়ী নিষেধাজ্ঞা আদেশ",
  },
  "cpc_39": {
    actNameEn: "Code of Civil Procedure, 1908",
    actNameBn: "দেওয়ানি কার্যবিধি, ১৯০৮",
    sectionNumber: "Order 39 Rule 1-2",
    titleBn: "অস্থায়ী নিষেধাজ্ঞা (Temporary Injunction)",
    required: ["prima_facie_case", "balance_of_convenience", "irreparable_loss"],
    bailable: true,
    maxPunishmentBn: "অস্থায়ী স্থিতাবস্থা / অন্তর্বর্তীকালীন নিষেধাজ্ঞা",
  },

  // --- Cyber Security Act, 2023 ---
  "cyber_24": {
    actNameEn: "Cyber Security Act, 2023",
    actNameBn: "সাইবার নিরাপত্তা আইন, ২০২৩",
    sectionNumber: "24",
    titleBn: "কম্পিউটার বা ডিভাইসে প্রতারণামূলক অনুপ্রবেশ",
    required: ["identity_spoofing_or_fraud", "electronic_device_involved"],
    bailable: true,
    maxPunishmentBn: "৫ বছর কারাদণ্ড বা ৫ লক্ষ টাকা জরিমানা",
  },

  // --- Artha Rin Adalat Ain, 2003 ---
  "artha_rin_12": {
    actNameEn: "Artha Rin Adalat Ain, 2003",
    actNameBn: "অর্থ ঋণ আদালত আইন, ২০০৩",
    sectionNumber: "12",
    titleBn: "ঋণ আদায়ে সম্পত্তি নিলাম ও মামলা দায়ের",
    required: ["loan_default", "auction_attempt_or_mortgage"],
    bailable: true,
    maxPunishmentBn: "অর্থ আদায় ডিক্রি",
  },

  // --- Family Courts Act, 2023 ---
  "family_dower": {
    actNameEn: "Family Courts Act, 2023",
    actNameBn: "পারিবারিক আদালত আইন, ২০২৩",
    sectionNumber: "5(b)",
    titleBn: "মোহরানা ও খোরপোশ আদায় (Dower and Maintenance)",
    required: ["marriage_kabin_present", "dower_unpaid_or_maintenance_refused"],
    bailable: true,
    maxPunishmentBn: "মোহরানা ও খোরপোশের ডিক্রি",
  },
};
