import { CaseAnalysisResponse, FollowUpQuestion, ApplicableLaw } from "./schemas";
import { applySectionUpgrades } from "@/lib/law/upgradeRules";
import { computeCompleteness } from "@/lib/law/completeness";

function cleanNameString(raw: string): string {
  let cleaned = raw;
  // Strip leading prefixes
  cleaned = cleaned.replace(/^(?:জনাব|বিবাদী|আসামী|আসামি|নামে|নামক|দিয়ে|করে|হয়ে|নিয়ে|সহ|এবং|বা|বিকেলে|সকালে|রাতে|গতরাতে|গত|আজ|পথে|তার\s+ভাই|তার\s+ছেলে|তার\s+সহযোগী)\s+/, "").trim();
  // Strip trailing suffixes
  cleaned = cleaned.replace(/\s+(?:আমাকে|দলবল|নিয়ে|দিয়ে|করে|হয়ে|সহ|এবং|ও|বা|টাকা|টাকার|ব্যাংক|শাখার|আমার|আমাদের|আমার\s+মাথায়|থেকে)$/, "").trim();
  return cleaned;
}

function extractAccusedNames(text: string): { namedAccused: string[]; unknownCountStr: string } {
  const named: string[] = [];

  const blacklist = [
    "আমার", "আমাদের", "আমার ভাই", "আমাকে", "আমাদেরকে", "পুলিশ", "থানা", "গতকাল", "আদালত",
    "বিকেলে", "সকালে", "রাতে", "গতরাতে", "পরশু", "গত", "আজ", "পথে", "ফেরার", "বাড়ি", "বাসা",
    "টাকা", "টাকার", "ব্যাংক", "চেক", "শাখার", "হাতে", "দিয়ে", "করে", "হয়ে", "নিয়ে", "সহ", "এবং", "বা", "বিবাদী",
    "দলবল", "আমাকে"
  ];

  // 1. Match names prefixed with জনাব, বিবাদী, আসামী, আসামি, তার ভাই, ইত্যাদি
  const prefixPatterns = [
    /(?:জনাব|বিবাদী|আসামী|আসামি|নামক|নামে)\s+([\u0980-\u09FF]+(?:\s+[\u0980-\u09FF]+){1,2})/g,
    /(?:তার\s+ভাই|তার\s+ছেলে|তার\s+সহযোগী)\s+([\u0980-\u09FF]+)/g,
    /(?:রফিক\s+ও\s+তার\s+ভাই)\s+([\u0980-\u09FF]+)/g,
  ];

  for (const pat of prefixPatterns) {
    let match;
    while ((match = pat.exec(text)) !== null) {
      let found = match[1]?.trim();
      if (found) {
        found = cleanNameString(found);
        if (found && !blacklist.includes(found) && !named.includes(found)) {
          named.push(found);
        }
      }
    }
  }

  // 2. Match common Bengali name patterns (মিয়া, ইসলাম, রহমান, খান, চৌধুরী, সরকার, আলী, তালুকদার, ইত্যাদি)
  const suffixPattern = /([\u0980-\u09FF]+(?:\s+[\u0980-\u09FF]+)?\s+(?:মিয়া|মিয়া|ইসলাম|রহমান|খান|চৌধুরী|সরকার|আলী|হক|তালুকদার|মোল্লা|উদ্দিন|আহমেদ|হোসেন|বেগম|শিকদার|ঘোষ|দাশ|পাল|রায়|সিংহ))/g;
  let match;
  while ((match = suffixPattern.exec(text)) !== null) {
    let found = match[1]?.trim();
    if (found) {
      found = cleanNameString(found);
      if (found && !blacklist.includes(found) && !named.includes(found)) {
        named.push(found);
      }
    }
  }

  // 3. Fallback for standalone popular first names
  const popularNames = [
    "রফিক", "শফিক", "করিম", "রহিম", "বশির", "কাদের", "মিজান", "সোহেল", "সাজ্জাদ", "জহির", "জহিরুল",
    "কামাল", "জামাল", "বাবুল", "মোতালেব", "কুদ্দুস", "রশীদ", "হারুন", "ফরহাদ", "মুন্না", "আলাউদ্দিন"
  ];
  for (const pName of popularNames) {
    const regex = new RegExp(`(?:^|[\\s,।])(${pName})(?=[\\s,।]|$)`, "i");
    if (regex.test(text)) {
      const alreadyCaptured = named.some((n) => n.includes(pName));
      if (!alreadyCaptured) {
        named.push(pName);
      }
    }
  }

  // Count / description of unknown accomplices
  let unknownCountStr = "৪/৫ জন";
  if (text.includes("২০ জন") || text.includes("২০জন")) {
    unknownCountStr = "প্রায় ১৯/২০ জন";
  } else if (text.includes("১০ জন") || text.includes("১০জন")) {
    unknownCountStr = "প্রায় ৯/১০ জন";
  } else if (
    text.includes("অনেক মানুষ") ||
    text.includes("অনেক লোক") ||
    text.includes("বহু মানুষ") ||
    text.includes("বহু লোক") ||
    text.includes("অসংখ্য")
  ) {
    unknownCountStr = "অসংখ্য অজ্ঞাতনামা ব্যক্তি";
  } else if (text.includes("দলবল") || text.includes("ভাড়াটে সন্ত্রাসী") || text.includes("লোকজন") || text.includes("লোক নিয়ে")) {
    unknownCountStr = "অজ্ঞাতনামা সহযোগী দলবল ও সন্ত্রাসী";
  }

  // Deduplicate and filter substrings
  const cleanNamed = named
    .map((n) => cleanNameString(n))
    .filter((n) => n.length > 1 && !blacklist.includes(n));

  const finalNamed: string[] = [];
  for (const n of cleanNamed) {
    if (!finalNamed.some((existing) => existing === n || (existing.includes(n) && existing.length > n.length))) {
      finalNamed.push(n);
    }
  }

  return { namedAccused: finalNamed, unknownCountStr };
}

function extractWeaponsFromStatement(text: string): string[] {
  const weapons: string[] = [];

  if (text.includes("রিভলবার") || text.includes("রিভলভার")) {
    weapons.push("রিভলবার (অবৈধ আগ্নেয়াস্ত্র)");
  }
  if (text.includes("পিস্তল")) {
    weapons.push("পিস্তল (অবৈধ আগ্নেয়াস্ত্র)");
  }
  if (text.includes("বন্দুক")) {
    weapons.push("বন্দুক (অবৈধ আগ্নেয়াস্ত্র)");
  }
  if (
    text.includes("শটগান") ||
    text.includes("পাইপগান") ||
    text.includes("রাইফেল") ||
    text.includes("আগ্নেয়াস্ত্র") ||
    text.includes("আগ্নেয়াস্ত্র")
  ) {
    weapons.push("আগ্নেয়াস্ত্র (শটগান/পাইপগান)");
  }

  if (text.includes("রামদা")) {
    weapons.push("ধারালো রামদা");
  }
  if (text.includes("চাপাতি")) {
    weapons.push("ধারালো চাপাতি");
  }
  if (text.includes("দা") && !text.includes("রামদা")) {
    weapons.push("ধারালো দা");
  }
  if (text.includes("ছোরা") || text.includes("চাকু") || text.includes("ছুরি")) {
    weapons.push("ধারালো ছুরি/চাকু");
  }
  if (text.includes("রড") || text.includes("লোহার রড") || text.includes("পাইপ")) {
    weapons.push("লোহার রড");
  }
  if (text.includes("লাঠি") || text.includes("লাঠিসোঁটা") || text.includes("বাঁশ")) {
    weapons.push("লাঠিসোঁটা");
  }

  return weapons;
}

export function generateMockCaseAnalysis(
  statement: string,
  answeredQuestions: Record<string, string> = {}
): CaseAnalysisResponse {
  const text = (statement || "").toLowerCase();

  // Dynamic entity and weapon extraction
  const { namedAccused, unknownCountStr } = extractAccusedNames(text);
  const detectedWeapons = extractWeaponsFromStatement(text);

  // Keyword flags
  const hasFirearm =
    detectedWeapons.some((w) => w.includes("আগ্নেয়াস্ত্র") || w.includes("রিভলবার") || w.includes("পিস্তল")) ||
    text.includes("রিভলবার") ||
    text.includes("রিভলভার") ||
    text.includes("পিস্তল") ||
    text.includes("বন্দুক") ||
    text.includes("গুলি") ||
    text.includes("আগ্নেয়াস্ত্র") ||
    text.includes("আগ্নেয়াস্ত্র") ||
    (answeredQuestions["weapon_used"] &&
      (answeredQuestions["weapon_used"].includes("পিস্তল") ||
        answeredQuestions["weapon_used"].includes("রিভলবার") ||
        answeredQuestions["weapon_used"].includes("বন্দুক")));

  const hasLandOrHomeGrab =
    text.includes("দখল") ||
    text.includes("বেদখল") ||
    text.includes("বের করে দিয়ে") ||
    text.includes("বের করে দেয়");

  const hasMultipleAttackers =
    text.includes("২০ জন") ||
    text.includes("১০ জন") ||
    text.includes("অনেক মানুষ") ||
    text.includes("অনেক লোক") ||
    text.includes("বহু মানুষ") ||
    text.includes("বহু লোক") ||
    text.includes("অসংখ্য") ||
    text.includes("লোক এসে") ||
    text.includes("লোকজন") ||
    text.includes("দলবল");

  const hasPhysicalViolence =
    text.includes("হামলা") ||
    text.includes("মেরে") ||
    text.includes("ভাঙচুর") ||
    text.includes("মাথা ফাটিয়ে") ||
    text.includes("বাসায় ঢুকে") ||
    text.includes("বাড়িতে ঢুকে") ||
    text.includes("বের করে দিয়ে") ||
    text.includes("চুরি") ||
    text.includes("খুন") ||
    text.includes("হুমকি");

  const isCheque = text.includes("চেক") || text.includes("টাকা পরিশোধ") || text.includes("ব্যাংক");
  const isNariShishu =
    text.includes("যৌতুক") ||
    text.includes("নারী ও শিশু") ||
    (text.includes("স্বামী") && (text.includes("মারধর") || text.includes("দাবি")));

  const isLandTitleDispute =
    (text.includes("জমি") || text.includes("দলিল") || text.includes("খতিয়ান") || text.includes("সীমানা") || text.includes("খরিদসূত্রে")) &&
    !hasFirearm &&
    !text.includes("মেরে") &&
    !text.includes("ফাটিয়ে") &&
    !text.includes("বের করে দিয়ে") &&
    !isNariShishu;

  const hasKnife =
    text.includes("ছুরি") ||
    text.includes("ছোরা") ||
    text.includes("চাকু") ||
    detectedWeapons.some((w) => w.includes("ছুরি") || w.includes("ছোরা"));

  const hasVitalInjury =
    text.includes("পেট") ||
    text.includes("পেটে") ||
    text.includes("বুকে") ||
    text.includes("গলা") ||
    text.includes("মাথা");

  const isRobbery =
    text.includes("ছিনিয়ে") ||
    text.includes("ছিনিয়ে") ||
    text.includes("ছিনতাই") ||
    text.includes("লুট");

  // 1. Initial Laws detection
  const initialSections = new Set<string>();

  if (isNariShishu) {
    initialSections.add("nari_11c");
    initialSections.add("nari_30");
  } else if (isCheque) {
    initialSections.add("138");
  } else if (isLandTitleDispute) {
    initialSections.add("sr_42");
    initialSections.add("sr_54");
    initialSections.add("cpc_39");
  } else if (hasKnife && isRobbery) {
    // Armed violent robbery with deadly weapon / stabbing
    initialSections.add("326"); // মারাত্মক অস্ত্র দ্বারা গুরুতর জখম
    initialSections.add("307"); // খুনের চেষ্টা
    initialSections.add("392"); // দস্যুতা / ছিনতাই
    initialSections.add("34");  // সাধারণ অভিপ্রায়
  } else if (hasFirearm || (hasLandOrHomeGrab && (hasMultipleAttackers || text.includes("বাসা") || text.includes("বাড়ি")))) {
    // Armed violent home invasion / land dispossession
    initialSections.add("143"); // বেআইনি সমাবেশ
    initialSections.add("148"); // মারাত্মক অস্ত্রে সজ্জিত হইয়া দাঙ্গা
    initialSections.add("448"); // গৃহে অনধিকার প্রবেশ
    initialSections.add("452"); // অস্ত্রসহ গৃহে অনধিকার প্রবেশ
    initialSections.add("506"); // প্রাণনাশের হুমকি
    initialSections.add("34");  // সাধারণ অভিপ্রায়
    if (hasFirearm) {
      initialSections.add("arms_19a"); // অস্ত্র আইন ১৯(ক) ধারা
    }
    if (hasLandOrHomeGrab) {
      initialSections.add("sr_9"); // সুনির্দিষ্ট প্রতিকার আইন ৯ ধারা
    }
  } else {
    // Default criminal assault & home invasion scenario
    initialSections.add("143");
    initialSections.add("448");
    initialSections.add("323");
    initialSections.add("427");
    initialSections.add("506");
    initialSections.add("34");
    if (isRobbery) {
      initialSections.add("392");
    }
  }

  // 2. Apply deterministic section upgrades from answers
  const { upgradedSections, appliedReasons } = applySectionUpgrades(
    Array.from(initialSections),
    answeredQuestions
  );

  // If weapons or head injury mentioned directly in statement or answers
  const hasWeaponInStatement =
    hasFirearm ||
    detectedWeapons.length > 0 ||
    text.includes("অস্ত্র") ||
    text.includes("রড") ||
    text.includes("দা") ||
    text.includes("রামদা") ||
    (answeredQuestions["weapon_used"] && answeredQuestions["weapon_used"].length > 0);

  const hasHeadInjury =
    text.includes("মাথা") ||
    text.includes("ফাটিয়ে") ||
    (answeredQuestions["injury_severity"] && answeredQuestions["injury_severity"].includes("মাথা"));

  const hasViolentHomeEntry =
    (text.includes("বাসায় ঢুকে") || text.includes("বাড়িতে ঢুকে") || text.includes("ঘরে ঢুকে") || text.includes("বাসা") || text.includes("বাড়ি") || text.includes("দখল") || text.includes("বের করে দিয়ে")) &&
    (text.includes("মেরে") || text.includes("ফাটিয়ে") || text.includes("ভাঙচুর") || text.includes("হামলা") || hasWeaponInStatement);

  if ((hasWeaponInStatement || hasViolentHomeEntry) && upgradedSections.includes("448")) {
    const idx = upgradedSections.indexOf("448");
    if (upgradedSections.includes("452")) {
      upgradedSections.splice(idx, 1);
    } else {
      upgradedSections.splice(idx, 1, "452");
    }
    appliedReasons.push("মারাত্মক অস্ত্রের প্রস্তুতি ও জবরদখলসহ অনধিকার গৃহপ্রবেশ করায় ধারা ৪৫২ জামিন-অযোগ্য");
  }

  if (hasHeadInjury && !upgradedSections.includes("307")) {
    if (upgradedSections.includes("323")) {
      const idx = upgradedSections.indexOf("323");
      upgradedSections.splice(idx, 1, "326", "307");
    } else {
      upgradedSections.push("307");
    }
    appliedReasons.push("মাথায় গুরুতর আঘাত থাকায় হত্যাচেষ্টার ধারা ৩০৭ অন্তর্ভুক্ত হয়েছে");
  }

  // 3. Construct ApplicableLaw objects
  const lawMap: Record<string, ApplicableLaw> = {
    "143": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "১৪৩",
      titleBn: "বেআইনি সমাবেশ (Unlawful Assembly)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "৬ মাস পর্যন্ত কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "বহিরাগত দলবল (৫ বা ততোধিক ব্যক্তি) একত্র হইয়া অনধিকার ও বলপ্রয়োগের উদ্দেশ্যে সমবেত হইয়াছে।",
      confidence: "HIGH",
    },
    "147": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "১৪৭",
      titleBn: "দাঙ্গা হাঙ্গামা (Rioting)",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "২ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "৫ বা ততোধিক ব্যক্তি একত্র হইয়া বলপ্রয়োগ ও তাণ্ডব সৃষ্টি করায় দাঙ্গার ধারা প্রযোজ্য।",
      confidence: "HIGH",
    },
    "148": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "১৪৮",
      titleBn: "মারাত্মক অস্ত্রে সজ্জিত হইয়া দাঙ্গা (Rioting with deadly weapons)",
      bailableStatusBn: "জামিন-অযোগ্য (Non-Bailable)",
      punishmentBn: "৩ বছর সশ্রম কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "পিস্তল/আগ্নেয়াস্ত্র ও দেশীয় মারাত্মক অস্ত্রে সজ্জিত হইয়া দাঙ্গা ও দখলযজ্ঞ চালানো হইয়াছে।",
      confidence: "HIGH",
    },
    "448": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৪৪৮",
      titleBn: "গৃহে অনধিকার প্রবেশ (House Trespass)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "১ বছর কারাদণ্ড বা ১,০০০ টাকা জরিমানা",
      reasoningBn: "বাদীর সম্মতি ব্যতিরেকে জোরপূর্বক বসতবাড়ির ভেতর প্রবেশ করিয়াছে।",
      confidence: "HIGH",
    },
    "452": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৪৫২",
      titleBn: "আঘাতের প্রস্তুতি বা অস্ত্রসহ গৃহে অনধিকার প্রবেশ",
      bailableStatusBn: "জামিন-অযোগ্য (Non-Bailable)",
      punishmentBn: "৭ বছর পর্যন্ত সশ্রম কারাদণ্ড ও অর্থদণ্ড",
      reasoningBn: "মারাত্মক আগ্নেয়াস্ত্র/অস্ত্রশস্ত্রে সজ্জিত হইয়া বাদীর বসতঘরে অবৈধ অনুপ্রবেশ ও জবরদখল করা হইয়াছে।",
      confidence: "HIGH",
    },
    "506": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৫০৬",
      titleBn: "অপরাধমূলক ভীতি প্রদর্শন ও প্রাণনাশের হুমকি",
      bailableStatusBn: "জামিন-অযোগ্য (২য় অংশ)",
      punishmentBn: "৭ বছর পর্যন্ত সশ্রম কারাদণ্ড",
      reasoningBn: "পিস্তল প্রদর্শন করিয়া প্রাণনাশের প্রকাশ্য হুমকি দেওয়ায় বাদী নিজ বাসায় প্রবেশ করিতে অপারগ।",
      confidence: "HIGH",
    },
    "34": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩৪",
      titleBn: "সাধারণ অভিপ্রায় (Common Intention)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "মূল ধারার সমান",
      reasoningBn: "সকল আসামি পরস্পরের পূর্বপরিকল্পিত সাধারণ অভিপ্রায়ে অংশ গ্রহণ করিয়াছে।",
      confidence: "HIGH",
    },
    "arms_19a": {
      actNameBn: "অস্ত্র আইন, ১৮৭৮ (The Arms Act, 1878)",
      section: "১৯(ক)",
      titleBn: "বেআইনি আগ্নেয়াস্ত্র বহন, প্রদর্শন ও ব্যবহার",
      bailableStatusBn: "জামিন-অযোগ্য (Non-Bailable)",
      punishmentBn: "যাবজ্জীবন কারাদণ্ড অথবা অনধিক ১০ বছর সশ্রম কারাদণ্ড",
      reasoningBn: "আসামিরা অবৈধ পিস্তল/আগ্নেয়াস্ত্র সহযোগে সাধারণ নাগরিককে জিম্মি করিয়া বাড়ি দখল করিয়াছে।",
      confidence: "HIGH",
    },
    "sr_9": {
      actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
      section: "৯",
      titleBn: "আইনবহির্ভূতভাবে দখলচ্যুত ব্যক্তির দখল পুনরুদ্ধার মামলা",
      bailableStatusBn: "দেওয়ানি প্রতিকার",
      punishmentBn: "আইনানুগ দখল অর্পণের ডিক্রি",
      reasoningBn: "আইনি প্রক্রিয়া ব্যতিরেকে বলপ্রয়োগে বসতবাড়ি হইতে বেদখল করায় ৬ মাসের মধ্যে দখল পুনরুদ্ধারের মামলা দায়েরযোগ্য।",
      confidence: "HIGH",
    },
    "323": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩২৩",
      titleBn: "স্বেচ্ছাকৃত সাধারণ আঘাত (Voluntarily Causing Hurt)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "১ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "ভুক্তভোগীকে মারপিট করিয়া শারীরিক জখম করা হইয়াছে।",
      confidence: "HIGH",
    },
    "324": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩২৪",
      titleBn: "বিপজ্জনক অস্ত্র দ্বারা আঘাত",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "৩ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "লোহার রড বা ধারালো অস্ত্রের আঘাতে রক্তাক্ত জখম সৃষ্টি করা হইয়াছে।",
      confidence: "HIGH",
    },
    "326": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩২৬",
      titleBn: "মারাত্মক অস্ত্র দ্বারা গুরুতর রক্তাক্ত জখম",
      bailableStatusBn: "জামিন-অযোগ্য (Non-Bailable)",
      punishmentBn: "যাবজ্জীবন কারাদণ্ড অথবা ১০ বছর সশ্রম কারাদণ্ড ও অর্থদণ্ড",
      reasoningBn: "মাথা ফাটিয়ে হাড়ের ক্ষতি ও স্থায়ী ক্ষতের আশঙ্কা সৃষ্টি করায় জামিন-অযোগ্য ধারা ৩২৬ প্রযোজ্য।",
      confidence: "HIGH",
    },
    "307": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩০৭",
      titleBn: "খুনের চেষ্টা (Attempt to Murder)",
      bailableStatusBn: "জামিন-অযোগ্য (Non-Bailable)",
      punishmentBn: "১০ বছর কারাদণ্ড / যাবজ্জীবন",
      reasoningBn: "শরীরের অত্যন্ত সংবেদনশীল অঙ্গ মাথায় মারাত্মক আঘাত করিয়া প্রাণনাশের স্পষ্ট অপচেষ্টা চালানো হইয়াছে।",
      confidence: "HIGH",
    },
    "380": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩৮০",
      titleBn: "বাসগৃহে বা বসতবাড়িতে চুরি",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "৭ বছর সশ্রম কারাদণ্ড ও অর্থদণ্ড",
      reasoningBn: "আলমারি ভেঙে স্বর্ণালংকার ও নগদ টাকা আত্মসাৎ করা হইয়াছে।",
      confidence: "HIGH",
    },
    "392": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩৯২",
      titleBn: "দস্যুতা বা ছিনতাই (Robbery)",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "১০ বছর সশ্রম কারাদণ্ড ও অর্থদণ্ড",
      reasoningBn: "মারধরের ভয় দেখাইয়া বলপ্রয়োগে মালামাল ছিনাইয়া লওয়া হইয়াছে।",
      confidence: "HIGH",
    },
    "427": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৪২৭",
      titleBn: "অনিষ্ট সাধন ও ক্ষতিসাধন (Mischief)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "২ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "বাদীর বসতবাড়ির আসবাবপত্র ও জানালার কাঁচ ভাঙচুর করিয়া প্রত্যক্ষ আর্থিক ক্ষতি করা হইয়াছে।",
      confidence: "HIGH",
    },
    "138": {
      actNameBn: "দ্য নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্ট, ১৮৮১",
      section: "১৩৮",
      titleBn: "চেক ডিজঅনার বা তহবিল অপ্রতুলতা",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "১ বছর কারাদণ্ড অথবা চেকে উল্লেখিত টাকার ৩ গুণ পর্যন্ত অর্থদণ্ড",
      reasoningBn: "ব্যাংক কর্তৃক অপর্যাপ্ত তহবিলের কারণে চেক প্রত্যাখ্যাত হইয়াছে।",
      confidence: "HIGH",
    },
    "sr_42": {
      actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
      section: "৪২",
      titleBn: "স্বত্ব ঘোষণা (Declaration of Title)",
      bailableStatusBn: "দেওয়ানি প্রতিকার",
      punishmentBn: "স্বত্বের ডিক্রি",
      reasoningBn: "নালিশি সম্পত্তিতে বাদীর বৈধ মালিকানা অস্বীকার করায় প্রতিকার প্রার্থনা।",
      confidence: "HIGH",
    },
    "sr_54": {
      actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
      section: "৫৪",
      titleBn: "চিরস্থায়ী নিষেধাজ্ঞা (Perpetual Injunction)",
      bailableStatusBn: "দেওয়ানি প্রতিকার",
      punishmentBn: "স্থায়ী নিষেধাজ্ঞা",
      reasoningBn: "শান্তিপূর্ণ ভোগদখলে বিঘ্ন ঘটানোর আশঙ্কায় নিষেধাজ্ঞা প্রয়োজন।",
      confidence: "HIGH",
    },
    "cpc_39": {
      actNameBn: "দেওয়ানি কার্যবিধি, ১৯০৮",
      section: "অর্ডার ৩৯, রুল ১-২",
      titleBn: "অস্থায়ী নিষেধাজ্ঞা ও স্থিতাবস্থা (Temporary Injunction)",
      bailableStatusBn: "দেওয়ানি অন্তর্বর্তীকালীন আদেশ",
      punishmentBn: "স্থিতাবস্থা বজায় রাখার আদেশ",
      reasoningBn: "মামলা নিষ্পত্তির পূর্ব পর্যন্ত জমিতে কোনো রূপ স্থাপনা বা বেদখল রোধের জরুরি প্রয়োজন।",
      confidence: "HIGH",
    },
    "nari_11c": {
      actNameBn: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০ (সংশোধিত ২০০৩)",
      section: "১১(গ)",
      titleBn: "যৌতুকের জন্য সাধারণ জখম করা",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "অনধিক ৩ বছর কিন্তু অন্যূন ১ বছর সশ্রম কারাদণ্ড এবং অর্থদণ্ড",
      reasoningBn: "যৌতুকের দাবিকৃত অর্থ না পেয়ে মারধর ও শারীরিক নির্যাতন করা হয়েছে।",
      confidence: "HIGH",
    },
    "nari_30": {
      actNameBn: "নারী ও শিশু নির্যাতন দমন আইন, ২০০০ (সংশোধিত ২০০৩)",
      section: "৩০",
      titleBn: "অপরাধ সংঘটনে সহায়তা বা প্ররোচনা",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "মূল অপরাধের সমপরিমাণ শাস্তি",
      reasoningBn: "যৌতুক নির্যাতন ও মারপিটে প্রত্যক্ষ বা পরোক্ষভাবে সহায়তা করা হয়েছে।",
      confidence: "HIGH",
    },
  };

  const distinctSections = Array.from(new Set(upgradedSections));
  const finalLaws = distinctSections.map((sec) => {
    return (
      lawMap[sec] || {
        actNameBn: "দণ্ডবিধি, ১৮৬০",
        section: sec,
        titleBn: "আইনগত ধারা " + sec,
        bailableStatusBn: "যাচাইযোগ্য",
        punishmentBn: "আইনানুযায়ী",
        reasoningBn: "ঘটনার পারিপার্শ্বিকতার ভিত্তিতে ধারাটি প্রাথমিকভাবে সংশ্লিষ্ট।",
        confidence: "MEDIUM" as const,
      }
    );
  });

  // 4. Determine which fields are already answered
  const answeredFields = new Set<string>();
  if (answeredQuestions["incident_time"] || text.includes("রাত") || text.includes("গতকাল")) answeredFields.add("incident_date_time");
  if (answeredQuestions["incident_place"] || text.includes("বাসা") || text.includes("বাড়ি") || text.includes("ঘর") || text.includes("জমি")) answeredFields.add("incident_place");
  if (answeredQuestions["accused_details"] || namedAccused.length > 0 || text.includes("২০ জন") || text.includes("লোক")) answeredFields.add("accused_identity");
  if (answeredQuestions["weapon_used"] || hasWeaponInStatement || detectedWeapons.length > 0) {
    answeredFields.add("weapon_used");
    answeredFields.add("deadly_weapon");
  }
  if (answeredQuestions["injury_severity"] || hasHeadInjury || text.includes("যেতে পারিনা") || text.includes("বের করে দিয়ে") || text.includes("কোপ") || text.includes("সেলাই")) {
    answeredFields.add("injury_present");
  }
  if (answeredQuestions["medical_report"] || text.includes("হাসপাতাল") || text.includes("মেডিকেল")) answeredFields.add("medical_report_present");
  if (answeredQuestions["stolen_items"] || text.includes("ছিনিয়ে") || text.includes("ছিনতাই") || text.includes("লুট")) answeredFields.add("property_taken");
  if (answeredQuestions["attacker_count"] || hasMultipleAttackers) answeredFields.add("unlawful_assembly_5plus");
  if (answeredQuestions["delay_reason"]) answeredFields.add("delay_reason");
  if (answeredQuestions["witness_names"]) answeredFields.add("witness_present");

  if (text.includes("বাসায় ঢুকে") || text.includes("বাড়িতে ঢুকে") || text.includes("দখল") || text.includes("বের করে দিয়ে")) answeredFields.add("house_trespass");
  if (text.includes("ভাঙচুর")) answeredFields.add("property_damage_value");

  if (isCheque) {
    if (text.includes("চেক")) answeredFields.add("cheque_number_bank");
    if (text.includes("ডিজঅনার") || text.includes("অপর্যাপ্ত")) answeredFields.add("dishonour_date");
    if (text.includes("নোটিশ")) answeredFields.add("legal_notice_date");
    if (text.includes("টাকা") || text.includes("লাখ")) answeredFields.add("cheque_amount");
  }

  if (isLandTitleDispute || text.includes("জমি") || text.includes("নালিশি")) {
    if (text.includes("পৈতৃক") || text.includes("খরিদ") || text.includes("মালিক") || text.includes("ভোগদখলে") || answeredQuestions["property_document"]) {
      answeredFields.add("prima_facie_case");
      answeredFields.add("title_clouded");
      answeredFields.add("legal_character_denied");
    }
    if (text.includes("হুমকি") || text.includes("অনুপ্রবেশ") || text.includes("ভেঙে") || text.includes("স্থাপনা") || text.includes("দখল") || text.includes("বেদখল")) {
      answeredFields.add("peaceful_possession_disturbed");
      answeredFields.add("irreparable_loss_threat");
      answeredFields.add("irreparable_loss");
      answeredFields.add("balance_of_convenience");
    }
  }

  // 5. Compute deterministic Completeness Score
  const score = computeCompleteness(upgradedSections, answeredFields);

  // 6. Generate targeted follow-up questions for remaining missing elements
  const allPossibleQuestions: FollowUpQuestion[] = [];

  if (isCheque) {
    allPossibleQuestions.push({
      fieldKey: "cheque_number_bank",
      questionBn: "প্রত্যাখ্যাত চেকের নম্বর, ব্যাংক ও শাখার নাম এবং চেকে উল্লিখিত টাকার সঠিক পরিমাণ কত?",
      inputType: "text",
      optionsBn: [],
      legalImportanceBn: "এনআই অ্যাক্ট ১৩৮ ধারায় মামলার আরজি ও অভিযোগ ফর্দে চেকের বিবরণ বাধ্যতামূলক।",
    });
    allPossibleQuestions.push({
      fieldKey: "dishonour_date",
      questionBn: "ব্যাংক কর্তৃক চেকটি কোন তারিখে ডিজঅনার (Dishonour) হয়েছে এবং মেমো স্লিপ সংরক্ষিত আছে কি?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, ব্যাংক থেকে প্রদত্ত ডিজঅনার মেমো স্লিপ রয়েছে",
        "মেমো স্লিপ হারিয়ে গেছে / ব্যাংকে যোগাযোগ করা হচ্ছে",
      ],
      legalImportanceBn: "চেক ডিজঅনারের তারিখ হইতে ৩০ দিনের মধ্যে লিগ্যাল নোটিশ পাঠানোর বাধ্যবাধকতা রয়েছে।",
    });
    allPossibleQuestions.push({
      fieldKey: "legal_notice_date",
      questionBn: "বিজ্ঞ আইনজীবীর মাধ্যমে রেজিস্ট্রি এডি ডাকে বিবাদীকে লিগ্যাল নোটিশ পাঠানো হয়েছে কি?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, রেজিস্ট্রি এডি ডাকে লিগ্যাল নোটিশ পাঠানো হয়েছে এবং রসিদ রয়েছে",
        "লিগ্যাল নোটিশ পাঠানো হয়নি, সরাসরি মামলা করার প্রস্তুতি",
      ],
      legalImportanceBn: "লিগ্যাল নোটিশ ব্যতিরেকে এনআই অ্যাক্ট ১৩৮ ধারায় মামলা গ্রহণীয় নয়।",
    });
    allPossibleQuestions.push({
      fieldKey: "notice_30days_passed",
      questionBn: "লিগ্যাল নোটিশ প্রাপ্তির পর প্রদত্ত ৩০ দিন সময়সীমা কি অতিক্রান্ত হয়েছে?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, নোটিশ পাওয়ার ৩০ দিন পার হয়েছে কিন্তু টাকা পরিশোধ করেনি",
        "এখনো ৩০ দিন সময়সীমা পার হয়নি",
      ],
      legalImportanceBn: "নোটিশের ৩০ দিন মেয়াদ পূর্ণ হওয়ার পরেই পরবর্তী ৩০ দিনের মধ্যে মামলা দায়েরের কারণ উৎপন্ন হয়।",
    });
  } else if (isLandTitleDispute) {
    if (namedAccused.length > 0) {
      allPossibleQuestions.push({
        fieldKey: "accused_details",
        questionBn: `১নং বিবাদী ${namedAccused[0]}-এর পিতার নাম, বয়স ও পূর্ণাঙ্গ স্থায়ী ঠিকানা আপনার জানা আছে কি?`,
        inputType: "text",
        optionsBn: [],
        legalImportanceBn: "দেওয়ানি আরজির ১নং বিবাদী তপশিলে পূর্ণাঙ্গ নাম-ঠিকানা সমন জারির জন্য আবশ্যক।",
      });
    } else {
      allPossibleQuestions.push({
        fieldKey: "accused_details",
        questionBn: "নালিশি জমিতে অনুপ্রবেশকারী মূল বিবাদীদের নাম বা পরিচয় জানা আছে কি?",
        inputType: "text",
        optionsBn: [],
        legalImportanceBn: "দেওয়ানি স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞার আরজিতে বিবাদীদের সুনির্দিষ্ট নাম-ঠিকানা প্রয়োজন।",
      });
    }

    allPossibleQuestions.push({
      fieldKey: "property_document",
      questionBn: "নালিশি সম্পত্তির মালিকানার সপক্ষে আপনার হেফাজতে কী কী দলিল বা পরচা (CS/SA/RS/BS খতিয়ান) রয়েছে?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, পৈতৃক ওয়ারিশান সূত্রে প্রাপ্ত বৈধ খতিয়ান ও দাখিলা রয়েছে",
        "বৈধ রেজিস্ট্রি কবলা দলিল ও নামজারি খতিয়ান রয়েছে",
        "কাগজপত্র ও পর্চা সংগ্রহের প্রক্রিয়াধীন",
      ],
      legalImportanceBn: "দেওয়ানি স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞার মোকদ্দমায় মালিকানার প্রমাণস্বরূপ দালিলিক সাক্ষ্য অপরিহার্য।",
    });

    allPossibleQuestions.push({
      fieldKey: "property_schedule",
      questionBn: "নালিশি জমির সঠিক পরিমাণ, দাগ নম্বর, খতিয়ান ও চৌহদ্দির (উত্তর-দক্ষিণ-পূর্ব-পশ্চিমের সীমানা) বিবরণ জানা আছে কি?",
      inputType: "text",
      optionsBn: [],
      legalImportanceBn: "দেওয়ানি কার্যবিধির অর্ডার ৭ রুল ৩ অনুযায়ী স্থাবর সম্পত্তির সুনির্দিষ্ট তফসিল ও চৌহদ্দি উল্লেখ করা বাধ্যতামূলক।",
    });

    allPossibleQuestions.push({
      fieldKey: "threat_nature",
      questionBn: "বিবাদী কর্তৃক শান্তিপূর্ন ভোগদখলে বিঘ্ন সৃষ্টি বা সীমানা প্রাচীর ভাঙার সুনির্দিষ্ট তারিখ ও সময় কখন?",
      inputType: "select",
      optionsBn: [
        "গতকাল বা বিগত কয়েক দিনের মধ্যে জোরপূর্বক সীমানা প্রাচীর ভেঙে অনুপ্রবেশ করেছে",
        "পূর্ব থেকেই বিরোধ চলছে এবং সম্প্রতি স্থাপনা নির্মাণের অপচেষ্টা চালাচ্ছে",
        "মৌখিকভাবে জমি ছেড়ে দেওয়ার ও জবরদখলের হুমকি দিয়েছে",
      ],
      legalImportanceBn: "দেওয়ানি প্রতিকারের কারণ (Cause of Action) উদ্ভব ও অন্তর্বর্তীকালীন অস্থায়ী নিষেধাজ্ঞা (CPC Order 39) প্রার্থনায় আবশ্যক।",
    });
  } else {
    // Q: Accused details
    if (namedAccused.length > 0) {
      allPossibleQuestions.push({
        fieldKey: "accused_details",
        questionBn: `১নং আসামি ${namedAccused[0]}-এর পিতার নাম, বয়স ও পূর্ণাঙ্গ স্থায়ী ঠিকানা আপনার জানা আছে কি?`,
        inputType: "text",
        optionsBn: [],
        legalImportanceBn: "এজাহার ও চার্জশিটের সুবিধার্থে মূল আসামির পূর্ণাঙ্গ পরিচিতি থাকা অত্যন্ত জরুরি।",
      });
    } else {
      allPossibleQuestions.push({
        fieldKey: "accused_details",
        questionBn: "হামলাকারী ও দখলদার ব্যক্তিদের মধ্যে কারও নাম বা পরিচয় জানা গেছে কি?",
        inputType: "text",
        optionsBn: [],
        legalImportanceBn: "কমপক্ষে ১ বা ২ জন মূল দখলদারের নাম-ঠিকানা এজাহারে উল্লেখ থাকলে আসামিদের শনাক্তকরণ সহজ হয়।",
      });
    }

    // Q: Weapons
    if (hasFirearm) {
      allPossibleQuestions.push({
        fieldKey: "weapon_used",
        questionBn: "আসামিরা আগ্নেয়াস্ত্র প্রদর্শন ছাড়া ফাঁকা গুলিবর্ষণ করেছিল কি, নাকি সাথে অন্য দেশীয় অস্ত্রও ছিল?",
        inputType: "multiselect",
        optionsBn: [
          "আগ্নেয়াস্ত্র প্রদর্শন করিয়া প্রাণনাশের হুমকি দিয়েছে",
          "ফাঁকা গুলিবর্ষণ করিয়া ত্রাস সৃষ্টি করেছে",
          "আগ্নেয়াস্ত্রের সাথে অন্যান্য মারাত্মক দেশীয় অস্ত্র ছিল",
          "শুধুমাত্র আগ্নেয়াস্ত্র উঁচিয়ে জিম্মি করেছিল",
        ],
        legalImportanceBn: "আগ্নেয়াস্ত্রের ব্যবহার অস্ত্র আইন ১৮৭৮ এর ১৯(ক) এবং দণ্ডবিধির ১৪৮/৪৫২ জামিন-অযোগ্য ধারা নিশ্চিত করে।",
      });
    } else {
      allPossibleQuestions.push({
        fieldKey: "weapon_used",
        questionBn: "আসামিদের কাছে কী কী অস্ত্র ছিল? লোহার রড, লাঠি বা ধারালো কোনো অস্ত্র ছিল কি?",
        inputType: "multiselect",
        optionsBn: ["লোহার রড", "ধারালো দা / চাপাতি", "লাঠিসোঁটা", "অস্ত্র ছিল না"],
        legalImportanceBn: "মারাত্মক অস্ত্রের উপস্থিতি দণ্ডবিধির ৩২৪/৩২৬/৪৫২ জামিন-অযোগ্য ধারা নিশ্চিত করে।",
      });
    }

    // Q: Land/Home Grab specifics
    if (hasLandOrHomeGrab) {
      allPossibleQuestions.push({
        fieldKey: "stolen_items",
        questionBn: "বাড়ি থেকে জোরপূর্বক বের করে দেওয়ার পর ভেতরে থাকা আসবাবপত্র, নগদ টাকা বা মালামাল আটকে পড়েছে কি?",
        inputType: "multiselect",
        optionsBn: [
          "নগদ টাকা ও আসবাবপত্র জবরদখলকারী আসামিদের দখলে রয়েছে",
          "জরুরি দলিলপত্র, পরচা ও ব্যাংকিং চেকবই ভেতরে আটকা পড়েছে",
          "স্বর্ণালংকার বা ইলেকট্রনিক্স লুটপাট করেছে",
          "শুধুমাত্র বাড়ি দখল করেছে, ভেতরে থাকা মালামাল এখনো ক্ষতিগ্রস্ত হয়নি",
        ],
        legalImportanceBn: "লুণ্ঠন বা মালামাল আটকে রাখলে জামিন-অযোগ্য ধারা ৩৮০ (বাসা থেকে চুরি) বা ৩৯২ (দস্যুতা) যুক্ত হবে।",
      });

      allPossibleQuestions.push({
        fieldKey: "property_document",
        questionBn: "উক্ত বাড়ি বা ভিটার মালিকানা সংক্রান্ত কোনো রেজিস্ট্রি কবলা দলিল বা খতিয়ান আপনার হেফাজতে আছে কি?",
        inputType: "select",
        optionsBn: [
          "হ্যাঁ, বৈধ রেজিস্ট্রি কবলা দলিল ও নামজারি খতিয়ান রয়েছে",
          "বৈধ ভাড়াচুক্তি ও বাড়িভাড়ার রসিদ রয়েছে",
          "কাগজপত্র বাসার ভেতরে আটকা পড়েছে",
          "পৈতৃক সূত্রে প্রাপ্ত সম্পত্তি",
        ],
        legalImportanceBn: "সুনির্দিষ্ট প্রতিকার আইনের ৯ ধারায় দ্রুত দখল পুনরুদ্ধারের মামলার আরজি পেশের জন্য এই তথ্য অপরিহার্য।",
      });
    }

    // Q: Police Complaint
    allPossibleQuestions.push({
      fieldKey: "police_complaint",
      questionBn: "ঘটনার পর থানায় কোনো মৌখিক অভিযোগ বা ৯৯৯-এ জরুরি পুলিশ সহায়তা চাওয়া হয়েছিল কি?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, ৯৯৯-এ কল করা হয়েছিল এবং পুলিশ ঘটনাস্থল পরিদর্শন করেছে",
        "থানায় মৌখিকভাবে জানানো হয়েছিল, কিন্তু লিখিত এজাহার নেয়নি",
        "কোনো পুলিশ যোগাযোগ হয়নি, সরাসরি এজাহারের প্রস্তুতি",
      ],
      legalImportanceBn: "থানায় বিলম্বের যৌক্তিক কারণ ব্যাখ্যা করতে ও পুলিশি রেফারেন্স এজাহারে উল্লেখ করতে সহায়ক।",
    });
  }

  const pendingQuestions = allPossibleQuestions.filter(
    (q) => !answeredQuestions[q.fieldKey]
  );
  const finalQuestions = score >= 90 ? [] : pendingQuestions.slice(0, 4);

  // 7. Dynamic extracted facts
  let extractedWeapons: string[] = [];
  if (isCheque || isLandTitleDispute) {
    extractedWeapons = [];
  } else if (detectedWeapons.length > 0) {
    extractedWeapons = detectedWeapons;
  } else if (hasFirearm) {
    extractedWeapons = ["অবৈধ আগ্নেয়াস্ত্র"];
  } else if (text.includes("রড") || text.includes("লাঠি")) {
    extractedWeapons = ["লোহার রড ও লাঠিসোঁটা"];
  } else {
    extractedWeapons = ["মারাত্মক দেশীয় অস্ত্র"];
  }
  if (answeredQuestions["weapon_used"]) {
    extractedWeapons = [answeredQuestions["weapon_used"]];
  }

  let extractedInjuries = "শারীরিক মারপিট ও জখম";
  if (isLandTitleDispute) {
    extractedInjuries = "দেওয়ানি বিরোধ: শান্তিপূর্ন ভোগদখলে বিঘ্ন সৃষ্টি ও সীমানা প্রাচীর ভেঙে জমি জবরদখল ও অবৈধ স্থাপনা নির্মাণের অপচেষ্টা";
  } else if (isNariShishu) {
    extractedInjuries = "যৌতুকের দাবিকৃত অর্থ না পেয়ে শারীরিক মারধর ও জখম";
  } else if (hasKnife && isRobbery) {
    extractedInjuries = "ধারালো ছুরি দিয়ে পেটে আঘাত ও রক্তাক্ত গুরুতর জখম";
  } else if (isCheque) {
    extractedInjuries = "আর্থিক ক্ষতি ও চেক প্রতারণা (এনআই অ্যাক্ট ১৩৮ ধারা)";
  } else if (hasFirearm || hasLandOrHomeGrab) {
    extractedInjuries = "অস্ত্র প্রদর্শন করিয়া প্রাণনাশের প্রকাশ্য হুমকি ও বলপ্রয়োগে বাড়ি হইতে বের করিয়া দেওয়া হইয়াছে";
  } else if (hasHeadInjury || text.includes("সেলাই")) {
    extractedInjuries = "মাথায় কোপের রক্তাক্ত গুরুতর জখম ও একাধিক সেলাই, হাসপাতালে ভর্তি ও চিকিৎসাধীন";
  }
  if (answeredQuestions["injury_severity"]) {
    extractedInjuries = answeredQuestions["injury_severity"];
  }

  let advice: string[] = [
    "অবিলম্বে নিকটস্থ থানায় এজাহার (FIR) দায়ের করুন এবং অস্ত্র আইনের ১৯(ক) ধারা অন্তর্ভুক্তির জন্য আবেদন করুন।",
    "থানা যদি মামলা নিতে গড়িমসি করে, তবে বিজ্ঞ জুডিসিয়াল ম্যাজিস্ট্রেট আদালতে দ্রুত সি.আর. মোকদ্দমা দায়ের করুন।",
    "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭ এর ধারা ৯ অনুযায়ী ৬ মাসের মধ্যে দেওয়ানি দখল পুনরুদ্ধারের মামলা প্রস্তুত রাখুন।",
    "ঘটনাস্থলে আসামিদের সশস্ত্র অবস্থান ও বলপ্রয়োগের চাক্ষুষ সাক্ষীদের নাম ফর্দে অন্তর্ভুক্ত করুন।",
  ];
  if (isLandTitleDispute) {
    advice = [
      "বিজ্ঞ সিনিয়র সহকারী জজ আদালতে স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞার (Specific Relief Act 42 ও 54 ধারা) আরজি দাখিল করুন।",
      "জরুরি ভিত্তিতে দেওয়ানি কার্যবিধির অর্ডার ৩৯ রুল ১-২ অনুযায়ী অন্তর্বর্তীকালীন অস্থায়ী নিষেধাজ্ঞা ও স্থিতাবস্থা (Status Quo) বজায় রাখার আবেদন করুন।",
      "জমির সিএস, এসএ, আরএস/বিএস খতিয়ান এবং নামজারি ডিসিআর ও দাখিলার সার্টিফাইড কপি আরজির সাথে ফিরিস্তি সহকারে দাখিল করুন।",
      "ঘটনাস্থলের তফসিলভুক্ত নালিশি জমির চৌহদ্দি নির্ধারণে স্থানীয় মৌজা ম্যাপ ও অ্যাডভোকেট কমিশনার নিয়োগের প্রস্তুতি রাখুন।",
    ];
  }

  // Dynamic Case Title
  const mainName = namedAccused.length > 0 ? namedAccused[0] : "";
  let title = "ফৌজদারি মোকদ্দমা";
  if (isNariShishu) {
    title = `যৌতুক নির্যাতন ও মারপিটের মামলা — নারী ও শিশু নির্যাতন দমন ট্রাইব্যুনাল`;
  } else if (hasKnife && isRobbery) {
    title = `ধারালো ছুরি দিয়ে আঘাত ও ছিনতাই${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  } else if (hasFirearm && hasLandOrHomeGrab) {
    title = `বাড়ি জবরদখল ও আগ্নেয়াস্ত্র প্রদর্শন${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  } else if (isLandTitleDispute) {
    title = `নালিশি জমির স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞা${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  } else if (hasLandOrHomeGrab) {
    title = `বসতবাড়ি জোরপূর্বক বেদখল ও অনধিকার প্রবেশ${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  } else if (isCheque) {
    title = `এনআই অ্যাক্ট ১৩৮ ধারায় চেক ডিজঅনার মোকদ্দমা${mainName ? ` — ${mainName}` : ""}`;
  } else {
    title = `হামলা ও মারপিটের নালিশ${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  }

  // Determine financial loss
  let financialLoss = isLandTitleDispute ? "নালিশি সম্পত্তির আনুমানিক মূল্য ১০,০০,০০০/- টাকা" : "আনুমানিক ১,৫০,০০০/- টাকা";
  if (text.includes("৫০ হাজার") || text.includes("৫০,০০০")) {
    financialLoss = "৫০,০০০/- টাকা";
  } else if (text.includes("১০ লক্ষ") || text.includes("১০ লাখ")) {
    financialLoss = "১০,০০,০০০/- টাকা";
  }

  // Dynamic Accused / Defendant list
  let accused: string[] = [];
  if (namedAccused.length > 0) {
    namedAccused.forEach((name, i) => {
      accused.push(`${name} (${i === 0 ? (isLandTitleDispute ? "১নং বিবাদী" : "প্রধান অভিযুক্ত/দখলকারী") : (isLandTitleDispute ? "বিবাদী" : "সহযোগী")})`);
    });
    accused.push(isLandTitleDispute ? `সহ আরও অন্যান্য অজ্ঞাতনামা বিবাদীগণ` : `সহ অজ্ঞাতনামা আরও ${unknownCountStr}`);
  } else if (hasMultipleAttackers) {
    accused = isLandTitleDispute
      ? ["১। অজ্ঞাতনামা দখলদার দলের নেতা (১নং বিবাদী)", "২। দলবদ্ধভাবে অংশগ্রহণকারী অন্যান্য বিবাদীগণ"]
      : [
          "১। অজ্ঞাতনামা সশস্ত্র দখলদার দলের নেতা",
          `২। দলবদ্ধভাবে অংশগ্রহণকারী আরও ${unknownCountStr}`,
        ];
  } else {
    accused = isLandTitleDispute
      ? ["১। ১নং অজ্ঞাতনামা বিবাদী", "২। অজ্ঞাতনামা অন্যান্য সহযোগী বিবাদীগণ"]
      : ["১। অজ্ঞাতনামা প্রধান হামলাকারী", "২। অজ্ঞাতনামা ৪/৫ জন সহযোগী"];
  }

  const category = isNariShishu
    ? "Special_Tribunal"
    : isLandTitleDispute
    ? "Civil"
    : "Criminal";

  return {
    caseTitleBn: title,
    caseCategory: category,
    completenessScore: score,
    extractedFacts: {
      incidentDate: answeredQuestions["incident_time"] || "গতকাল রাত্রি",
      incidentTime: "রাত্রি আনুমানিক ১০:৩০ ঘটিকা",
      incidentPlace: isLandTitleDispute ? "নালিশি জমি ও সীমানা প্রাচীর" : ((text.includes("বাসা") || text.includes("বাড়ি")) ? "বাদীর নিজ বাড়ি / বসতভিটা" : (answeredQuestions["incident_place"] || "বাদীর নিজ বসতবাড়ি")),
      complainantName: isLandTitleDispute ? "বাদী নিজে" : "ফরিয়াদী / ভুক্তভোগী নিজে",
      complainantDetails: isLandTitleDispute ? "সাং: [গ্রাম/মহল্লা], থানা: কোতোয়ালি, জেলা: ঢাকা (বাদীপক্ষ)" : "সাং: [গ্রাম/মহল্লা], থানা: কোতোয়ালি, জেলা: ঢাকা",
      accusedList: accused,
      unknownAccusedCount: unknownCountStr,
      weaponsUsed: extractedWeapons,
      injuriesAndMedical: extractedInjuries,
      stolenOrDamagedItems: answeredQuestions["stolen_items"] || (isRobbery ? "নগদ টাকা ছিনতাই" : "বসতঘরের আসবাবপত্র ও মালামাল জবরদখল"),
      totalFinancialLoss: financialLoss,
      motiveOrPreviousDispute: hasLandOrHomeGrab ? "সশস্ত্র দলবল সহযোগে বাদীর বসতবাড়ি জবরদখল ও বলপূর্বক উচ্ছেদ" : "পূর্বশত্রুতা ও পারিবারিক বিরোধের জের",
      witnesses: answeredQuestions["witness_names"] ? [answeredQuestions["witness_names"]] : ["প্রতিবেশী প্রত্যক্ষদর্শী ১", "প্রতিবেশী প্রত্যক্ষদর্শী ২"],
      policeStationAndDistrict: "কোতোয়ালি থানা, ঢাকা",
    },
    applicableLaws: finalLaws,
    followUpQuestions: finalQuestions,
    strategicAdviceForAdvocateBn: advice,
    contradictionsDetectedBn: [],
  };
}
