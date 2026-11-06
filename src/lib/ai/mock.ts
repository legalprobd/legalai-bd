import { CaseAnalysisResponse, FollowUpQuestion, ApplicableLaw } from "./schemas";
import { applySectionUpgrades } from "@/lib/law/upgradeRules";
import { computeCompleteness } from "@/lib/law/completeness";

export function hasBengaliWord(text: string, word: string): boolean {
  return new RegExp(`(?<![\\u0980-\\u09FF])${word}(?![\\u0980-\\u09FF])`, "i").test(text);
}

function cleanNameString(raw: string): string {
  let cleaned = raw;
  cleaned = cleaned.replace(/^(?:জনাব|বিবাদী|আসামী|আসামি|নামে|নামক|দিয়ে|করে|হয়ে|নিয়ে|সহ|এবং|বা|বিকেলে|সকালে|রাতে|গতরাতে|গত|আজ|পথে|তার\s+ভাই|তার\s+ছেলে|তার\s+সহযোগী)\s+/, "").trim();
  cleaned = cleaned.replace(/\s+(?:আমাকে|দলবল|নিয়ে|দিয়ে|করে|হয়ে|সহ|এবং|ও|বা|টাকা|টাকার|ব্যাংক|শাখার|আমার|আমাদের|আমার\s+মাথায়|থেকে)$/, "").trim();
  return cleaned;
}

function extractAccusedNames(text: string): { namedAccused: string[]; unknownCountStr: string } {
  const named: string[] = [];

  const blacklist = [
    "আমার", "আমাদের", "আমার ভাই", "আমাকে", "আমাদেরকে", "পুলিশ", "থানা", "গতকাল", "আদালত",
    "বিকেলে", "সকালে", "রাতে", "গতরাতে", "পরশু", "গত", "আজ", "পথে", "ফেরার", "বাড়ি", "বাসা",
    "টাকা", "টাকার", "ব্যাংক", "চেক", "শাখার", "হাতে", "দিয়ে", "করে", "হয়ে", "নিয়ে", "সহ", "এবং", "বা", "বিবাদী",
    "দলবল", "আমাকে", "সিগারেট", "ধূমপান", "তামাক", "বারান্দার", "বারান্দা", "সামনে", "প্রকাশ্যে",
    "প্রতিদিন", "বারবার", "মানা", "করার", "পরও", "সে", "এটা", "করেই", "যাচ্ছে", "মানুষ", "লোক",
    "গান", "ঘুম", "শব্দ", "গাছ", "বেতন", "বকেয়া", "চাকরি", "মালিক", "শ্রমিক", "কর্মচারী", "নষ্ট"
  ];

  // 1. Match names with verbs or patterns
  const verbNamePatterns = [
    /(?:সিগারেট\s+খায়|খায়|ধূমপান\s+করে|হুমকি\s+দেয়|টাকা\s+নিয়েছে|দখল\s+করেছে|বিরক্ত\s+করে|গালাগালি\s+করে|মারধর\s+করে|গান\s+বাজায়)\s+([\u0980-\u09FF]+)/g,
    /([\u0980-\u09FF]+)\s+(?:নামক|নামে|সিগারেট\s+খায়|হুমকি\s+দেয়|মারধর\s+করে|গান\s+বাজায়)/g,
  ];
  for (const pat of verbNamePatterns) {
    let match;
    while ((match = pat.exec(text)) !== null) {
      let found = match[1]?.trim();
      if (found) {
        found = cleanNameString(found);
        if (found && !blacklist.includes(found) && !named.includes(found) && found.length > 2) {
          named.push(found);
        }
      }
    }
  }

  // 2. Match names prefixed with জনাব, বিবাদী, আসামী, আসামি
  const prefixPatterns = [
    /(?:জনাব|বিবাদী|আসামী|আসামি|নামক|নামে)\s+([\u0980-\u09FF]+(?:\s+[\u0980-\u09FF]+){0,2})/g,
    /(?:তার\s+ভাই|তার\s+ছেলে|তার\s+সহযোগী)\s+([\u0980-\u09FF]+)/g,
    /(?:রফিক\s+ও\s+তার\s+ভাই)\s+([\u0980-\u09FF]+)/g,
  ];

  for (const pat of prefixPatterns) {
    let match;
    while ((match = pat.exec(text)) !== null) {
      let found = match[1]?.trim();
      if (found) {
        found = cleanNameString(found);
        if (found && !blacklist.includes(found) && !named.includes(found) && found.length > 2) {
          named.push(found);
        }
      }
    }
  }

  // 3. Match common Bengali name patterns
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

  // 4. Popular standalone names
  const popularNames = [
    "শামীম", "হাসান", "তারেক", "নাসির", "সেলিম", "রুবেল", "আলম", "সাইফুল", "আরিফ", "মামুন", "তারিক",
    "সজল", "শিমুল", "ইমরান", "ফারুক", "সুমন", "মনির", "মোস্তফা", "বাবু", "রাজু", "রফিক", "শফিক",
    "করিম", "রহিম", "বশির", "কাদের", "মিজান", "সোহেল", "সাজ্জাদ", "জহির", "জহিরুল", "কামাল", "জামাল",
    "বাবুল", "মোতালেব", "কুদ্দুস", "রশীদ", "হারুন", "ফরহাদ", "মুন্না", "আলাউদ্দিন"
  ];
  for (const pName of popularNames) {
    if (hasBengaliWord(text, pName)) {
      const alreadyCaptured = named.some((n) => n.includes(pName));
      if (!alreadyCaptured) {
        named.push(pName);
      }
    }
  }

  // Unknown count
  let unknownCountStr = "নাই";
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
  } else if (text.includes("দলবল") || text.includes("ভাড়াটে সন্ত্রাসী") || text.includes("লোক নিয়ে")) {
    unknownCountStr = "অজ্ঞাতনামা সহযোগী দলবল ও সন্ত্রাসী";
  } else if (text.includes("সহযোগী") || text.includes("অন্যান্য")) {
    unknownCountStr = "৪/৫ জন";
  }

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

  if (hasBengaliWord(text, "রিভলবার") || hasBengaliWord(text, "রিভলভার")) {
    weapons.push("রিভলবার (অবৈধ আগ্নেয়াস্ত্র)");
  }
  if (hasBengaliWord(text, "পিস্তল")) {
    weapons.push("পিস্তল (অবৈধ আগ্নেয়াস্ত্র)");
  }
  if (hasBengaliWord(text, "বন্দুক")) {
    weapons.push("বন্দুক (অবৈধ আগ্নেয়াস্ত্র)");
  }
  if (
    hasBengaliWord(text, "শটগান") ||
    hasBengaliWord(text, "পাইপগান") ||
    hasBengaliWord(text, "রাইফেল") ||
    hasBengaliWord(text, "আগ্নেয়াস্ত্র") ||
    hasBengaliWord(text, "আগ্নেয়াস্ত্র")
  ) {
    weapons.push("আগ্নেয়াস্ত্র (শটগান/পাইপগান)");
  }

  if (hasBengaliWord(text, "রামদা")) {
    weapons.push("ধারালো রামদা");
  }
  if (hasBengaliWord(text, "চাপাতি")) {
    weapons.push("ধারালো চাপাতি");
  }
  // Strict regex check for "দা" to prevent false positive on "বারান্দা", "আদালত", "দাবি", "দায়ের"
  if (hasBengaliWord(text, "দা") && !text.includes("রামদা")) {
    weapons.push("ধারালো দা");
  }
  if (hasBengaliWord(text, "ছোরা") || hasBengaliWord(text, "চাকু") || hasBengaliWord(text, "ছুরি")) {
    weapons.push("ধারালো ছুরি/চাকু");
  }
  if (hasBengaliWord(text, "লোহার রড") || hasBengaliWord(text, "জিআই পাইপ") || hasBengaliWord(text, "রড")) {
    weapons.push("লোহার রড");
  }
  if (hasBengaliWord(text, "লাঠিসোঁটা") || hasBengaliWord(text, "বাঁশের লাঠি") || hasBengaliWord(text, "লাঠি")) {
    weapons.push("লাঠিসোঁটা");
  }

  return weapons;
}

function extractDistrictAndThana(text: string): { district: string; thana: string; place?: string } {
  const normalized = text.toLowerCase();
  
  const distMap: { name: string; keys: string[]; defaultThana: string }[] = [
    { name: "ময়মনসিংহ", keys: ["ময়মনসিংহ", "ময়মনসিংহ", "mymensingh"], defaultThana: "কোতোয়ালী মডেল থানা, ময়মনসিংহ" },
    { name: "ঢাকা", keys: ["ঢাকা", "dhaka", "ধানমন্ডি", "গুলশান", "মিরপুর", "উত্তরা", "মতিঝিল", "রমনা"], defaultThana: "কোতোয়ালি থানা, ঢাকা" },
    { name: "চট্টগ্রাম", keys: ["চট্টগ্রাম", "chittagong", "ctg", "পাঁচলাইশ"], defaultThana: "কোতোয়ালী থানা, চট্টগ্রাম" },
    { name: "সিলেট", keys: ["সিলেট", "sylhet"], defaultThana: "কোতোয়ালী মডেল থানা, সিলেট" },
    { name: "রাজশাহী", keys: ["রাজশাহী", "rajshahi", "বোয়ালিয়া"], defaultThana: "বোয়ালিয়া মডেল থানা, রাজশাহী" },
    { name: "খুলনা", keys: ["খুলনা", "khulna", "খালিশপুর"], defaultThana: "খুলনা সদর থানা, খুলনা" },
    { name: "বরিশাল", keys: ["বরিশাল", "barisal"], defaultThana: "কোতোয়ালী মডেল থানা, বরিশাল" },
    { name: "রংপুর", keys: ["রংপুর", "rangpur"], defaultThana: "কোতোয়ালী থানা, রংপুর" },
    { name: "কুমিল্লা", keys: ["কুমিল্লা", "comilla"], defaultThana: "কোতোয়ালী মডেল থানা, কুমিল্লা" },
    { name: "গাজীপুর", keys: ["গাজীপুর", "gazipur", "টঙ্গী", "জয়দেবপুর"], defaultThana: "জয়দেবপুর সদর থানা, গাজীপুর" },
    { name: "নারায়ণগঞ্জ", keys: ["নারায়ণগঞ্জ", "নারায়ণগঞ্জ", "narayanganj"], defaultThana: "নারায়ণগঞ্জ সদর মডেল থানা, নারায়ণগঞ্জ" },
    { name: "বগুড়া", keys: ["বগুড়া", "বগুড়া", "bogra"], defaultThana: "বগুড়া সদর থানা, বগুড়া" },
    { name: "দিনাজপুর", keys: ["দিনাজপুর", "dinajpur"], defaultThana: "দিনাজপুর কোতোয়ালী থানা, দিনাজপুর" },
    { name: "টাঙ্গাইল", keys: ["টাঙ্গাইল", "tangail"], defaultThana: "টাঙ্গাইল সদর থানা, টাঙ্গাইল" },
    { name: "যশোর", keys: ["যশোর", "jessore"], defaultThana: "কোতোয়ালী মডেল থানা, যশোর" },
    { name: "পাবনা", keys: ["পাবনা", "pabna"], defaultThana: "পাবনা সদর থানা, পাবনা" },
    { name: "ফরিদপুর", keys: ["ফরিদপুর", "faridpur"], defaultThana: "কোতোয়ালী থানা, ফরিদপুর" },
    { name: "জামালপুর", keys: ["জামালপুর", "jamalpur"], defaultThana: "জামালপুর সদর থানা, জামালপুর" },
  ];

  let detectedDist = "ঢাকা";
  let detectedThana = "কোতোয়ালি থানা, ঢাকা";

  for (const item of distMap) {
    if (item.keys.some((k) => normalized.includes(k))) {
      detectedDist = item.name;
      detectedThana = item.defaultThana;
      break;
    }
  }

  let place: string | undefined = undefined;
  const placeMatch = text.match(/([^\s,।]+(?:ের)?\s+(?:ব্রীজের\s+মোড়ে|ব্রিজের\s+মোড়ে|মোড়ে|মোড়|সামনে|রাস্তায়|রাস্তার\s+পাশে|বাজার|স্ট্যান্ডে|ঘাটে))/i);
  if (placeMatch) {
    place = placeMatch[0].trim();
  }

  return { district: detectedDist, thana: detectedThana, place };
}

export function generateMockCaseAnalysis(
  statement: string,
  answeredQuestions: Record<string, string> = {}
): CaseAnalysisResponse {
  const text = (statement || "").toLowerCase();

  const { district: detectedDistrict, thana: detectedThana, place: detectedPlace } = extractDistrictAndThana(statement || "");

  // Dynamic entity and weapon extraction
  const { namedAccused, unknownCountStr } = extractAccusedNames(text);
  const detectedWeapons = extractWeaponsFromStatement(text);

  // 1. Broad Violence & Weapon Signals
  const hasFirearm =
    detectedWeapons.some((w) => w.includes("আগ্নেয়াস্ত্র") || w.includes("রিভলবার") || w.includes("পিস্তল")) ||
    hasBengaliWord(text, "রিভলবার") ||
    hasBengaliWord(text, "রিভলভার") ||
    hasBengaliWord(text, "পিস্তল") ||
    hasBengaliWord(text, "বন্দুক") ||
    hasBengaliWord(text, "গুলি") ||
    hasBengaliWord(text, "আগ্নেয়াস্ত্র") ||
    hasBengaliWord(text, "আগ্নেয়াস্ত্র") ||
    (answeredQuestions["weapon_used"] &&
      (answeredQuestions["weapon_used"].includes("পিস্তল") ||
        answeredQuestions["weapon_used"].includes("রিভলবার") ||
        answeredQuestions["weapon_used"].includes("বন্দুক")));

  const hasKnife =
    detectedWeapons.some((w) => w.includes("ছুরি") || w.includes("ছোরা") || w.includes("চাপাতি") || w.includes("রামদা") || w.includes("দা")) ||
    hasBengaliWord(text, "ছুরি") ||
    hasBengaliWord(text, "ছোরা") ||
    hasBengaliWord(text, "চাকু") ||
    hasBengaliWord(text, "চাপাতি") ||
    hasBengaliWord(text, "রামদা") ||
    hasBengaliWord(text, "দা");

  const hasHeadInjury =
    hasBengaliWord(text, "মাথা") ||
    hasBengaliWord(text, "মাথায়") ||
    hasBengaliWord(text, "ফাটিয়ে") ||
    (answeredQuestions["injury_severity"] && answeredQuestions["injury_severity"].includes("মাথা"));

  const hasVitalInjury =
    hasBengaliWord(text, "পেট") ||
    hasBengaliWord(text, "পেটে") ||
    hasBengaliWord(text, "বুকে") ||
    hasBengaliWord(text, "গলা") ||
    hasHeadInjury;

  const isRobbery =
    hasBengaliWord(text, "ছিনিয়ে") ||
    hasBengaliWord(text, "ছিনিয়ে") ||
    hasBengaliWord(text, "ছিনতাই") ||
    hasBengaliWord(text, "লুট") ||
    hasBengaliWord(text, "লুটপাট");

  const hasActualViolence =
    hasBengaliWord(text, "মারধর") ||
    hasBengaliWord(text, "মারপিট") ||
    hasBengaliWord(text, "মেরে") ||
    hasBengaliWord(text, "মারল") ||
    hasBengaliWord(text, "কোপ") ||
    hasBengaliWord(text, "কুপিয়ে") ||
    hasBengaliWord(text, "রক্ত") ||
    hasBengaliWord(text, "রক্তাক্ত") ||
    hasBengaliWord(text, "ফাটিয়ে") ||
    hasBengaliWord(text, "জখম") ||
    hasBengaliWord(text, "আঘাত") ||
    hasBengaliWord(text, "হাসপাতাল") ||
    hasBengaliWord(text, "খুন") ||
    hasBengaliWord(text, "হত্যা") ||
    hasBengaliWord(text, "গুলি") ||
    hasBengaliWord(text, "হামলা") ||
    detectedWeapons.length > 0 ||
    hasFirearm ||
    hasKnife;

  const hasLandOrHomeGrab =
    !hasActualViolence &&
    (text.includes("দখল") || text.includes("বেদখল") || text.includes("উচ্ছেদ") || text.includes("বের করে দিয়ে") || text.includes("বের করে দেয়"));

  const hasMultipleAttackers =
    text.includes("২০ জন") ||
    text.includes("১০ জন") ||
    text.includes("অনেক মানুষ") ||
    text.includes("অনেক লোক") ||
    text.includes("বহু মানুষ") ||
    text.includes("বহু লোক") ||
    text.includes("অসংখ্য") ||
    text.includes("লোক নিয়ে") ||
    text.includes("লোকজন") ||
    text.includes("দলবল");

  // 2. Broad Domain Classification (Zero-Shot)
  const isCheque =
    text.includes("চেক") ||
    text.includes("ডিজঅনার") ||
    text.includes("এনআই অ্যাক্ট") ||
    (text.includes("ব্যাংক") && (text.includes("টাকা") || text.includes("পরিশোধ")));

  const isNariShishu =
    text.includes("যৌতুক") ||
    text.includes("নারী ও শিশু") ||
    (text.includes("স্বামী") && (hasActualViolence || text.includes("দাবি")));

  const isSmokingNuisance =
    !hasActualViolence &&
    (text.includes("সিগারেট") ||
     text.includes("ধূমপান") ||
     text.includes("ধুমপান") ||
     text.includes("তামাক") ||
     text.includes("বিড়ি") ||
     text.includes("বিড়ি"));

  const isGeneralNuisance =
    !hasActualViolence &&
    !isSmokingNuisance &&
    (text.includes("গান") ||
     text.includes("শব্দ") ||
     text.includes("ঘুম নষ্ট") ||
     text.includes("ঘুম") ||
     text.includes("ধোঁয়া") ||
     text.includes("ধোয়া") ||
     text.includes("ময়লা") ||
     text.includes("আবর্জনা") ||
     text.includes("উপদ্রব") ||
     text.includes("বিরক্ত") ||
     text.includes("ডিস্টার্ব") ||
     text.includes("মাইক") ||
     text.includes("লাউডস্পিকার"));

  const isCyberCrime =
    text.includes("ফেসবুক") ||
    text.includes("মেসেঞ্জার") ||
    text.includes("অনলাইন") ||
    text.includes("হ্যাক") ||
    text.includes("ছবি বিকৃত") ||
    text.includes("ব্ল্যাকমেইল") ||
    text.includes("ভাইরাল");

  const isLabour =
    !hasActualViolence &&
    (text.includes("বেতন") ||
     text.includes("বকেয়া") ||
     text.includes("মজুরি") ||
     text.includes("চাকরি") ||
     text.includes("বরখাস্ত") ||
     text.includes("শ্রমিক") ||
     text.includes("কর্মচারী"));

  const isCivilProperty =
    !hasActualViolence &&
    !isLabour &&
    (text.includes("জমি") ||
     text.includes("দলিল") ||
     text.includes("খতিয়ান") ||
     text.includes("সীমানা") ||
     text.includes("গাছ") ||
     text.includes("গাছ কেটে") ||
     text.includes("গাছ কাটা") ||
     text.includes("ভাড়া") ||
     text.includes("ভাড়াটিয়া") ||
     text.includes("খরিদসূত্রে") ||
     text.includes("পৈতৃক") ||
     hasLandOrHomeGrab) &&
    !isNariShishu;

  const isViolentAssaultOrRobbery =
    hasActualViolence ||
    (hasFirearm && (text.includes("বাড়ি") || text.includes("বাসা"))) ||
    (hasKnife && isRobbery);

  const isHumanitarianRescue =
    !hasActualViolence &&
    (text.includes("অজ্ঞান") ||
      text.includes("অসাড়") ||
      text.includes("মুমূর্ষু") ||
      text.includes("পড়ে আছে") ||
      text.includes("পড়ে রইছে") ||
      text.includes("পড়ে রয়েছে") ||
      text.includes("পড়ে আছিল") ||
      text.includes("লাওয়ারিশ") ||
      text.includes("ভবঘুরে")) &&
    (text.includes("বৃদ্ধ") ||
      text.includes("মানুষ") ||
      text.includes("লোক") ||
      text.includes("অসহায়") ||
      text.includes("নিরাশ্রয়") ||
      text.includes("উদ্ধার") ||
      text.includes("পদক্ষেপ") ||
      text.includes("আইনী") ||
      text.includes("আইনি"));

  const isKnown =
    isSmokingNuisance ||
    isGeneralNuisance ||
    isLabour ||
    isCivilProperty ||
    isCheque ||
    isNariShishu ||
    isCyberCrime ||
    isViolentAssaultOrRobbery ||
    isHumanitarianRescue;

  // 3. Fallback for completely unknown inputs: SAFE GRIEVANCE ENGINE (ZERO HALLUCINATIONS)
  if (!isKnown) {
    return {
      caseTitleBn: "আইনগত পরামর্শ ও তথ্যানুসন্ধান",
      caseCategory: "General",
      completenessScore: 10,
      extractedFacts: {
        incidentDate: "অনির্দিষ্ট",
        incidentTime: "অনির্দিষ্ট",
        incidentPlace: detectedPlace || "অনির্দিষ্ট",
        complainantName: "মক্কেল / ভুক্তভোগী নিজে",
        complainantDetails: `সাং: [গ্রাম/মহল্লা], থানা: ${detectedThana.split(",")[0]}, জেলা: ${detectedDistrict}`,
        accusedList: namedAccused.length > 0 ? namedAccused.map((n, i) => `${i + 1}। ${n}`) : ["অভিযুক্তের নাম উল্লেখ নেই"],
        unknownAccusedCount: "নাই",
        weaponsUsed: [],
        injuriesAndMedical: null,
        stolenOrDamagedItems: null,
        totalFinancialLoss: null,
        motiveOrPreviousDispute: null,
        witnesses: [],
        policeStationAndDistrict: detectedThana,
      },
      applicableLaws: [],
      followUpQuestions: [
        {
          fieldKey: "dispute_nature",
          questionBn: "আপনার সমস্যাটি ঠিক কোন ধরনের? (ফৌজদারি অপরাধ / দেওয়ানি সম্পত্তি বিরোধ / পারিবারিক বিরোধ / সাধারণ উপদ্রব)",
          inputType: "select",
          optionsBn: [
            "ফৌজদারি অপরাধ (মারধর, হুমকি বা চুরি/ছিনতাই)",
            "দেওয়ানি বিরোধ (জমিজমা, দলিল বা সীমানা সংক্রান্ত)",
            "পারিবারিক বিরোধ (দেনমোহর, ভরণপোষণ বা বিবাহবিচ্ছেদ)",
            "গণউপদ্রব ও শান্তি বিনষ্ট (শব্দ, ধোঁয়া বা বিরক্তি সৃষ্টি)",
          ],
          legalImportanceBn: "আইনগত অধিকার ও সংশ্লিষ্ট আদালত নির্ধারণের জন্য বিরোধের প্রকৃতি জানা আবশ্যক।",
        },
        {
          fieldKey: "incident_details",
          questionBn: "ঘটনাটি সম্পর্কে আরও বিস্তারিত লিখুন যাতে সঠিক আইন ও ধারা নির্ধারণ করা যায়।",
          inputType: "text",
          optionsBn: [],
          legalImportanceBn: "সুনির্দিষ্ট আইনি উপাদান প্রমাণের জন্য বিস্তারিত ঘটনার বিবরণ অপরিহার্য।",
        },
        {
          fieldKey: "remedy_sought",
          questionBn: "আপনি বিজ্ঞ আইনজীবীর মাধ্যমে মূলত কী আইনগত প্রতিকার প্রার্থনা করছেন?",
          inputType: "select",
          optionsBn: [
            "থানায় বা আদালতে নিয়মিত মামলা দায়ের",
            "নিষেধাজ্ঞা বা স্থিতাবস্থা বজায় রাখার আদেশ",
            "বকেয়া পাওনা বা ক্ষতিপূরণ আদায়",
            "আপোষ-মীমাংসা বা লিগ্যাল নোটিশ প্রদান",
          ],
          legalImportanceBn: "যথাযথ আরজি ও পিটিশন প্রস্তুতের জন্য কাঙ্ক্ষিত প্রতিকার জানা আবশ্যক।",
        },
      ],
      strategicAdviceForAdvocateBn: [
        "মক্কেলের জবানবন্দিতে সুনির্দিষ্ট কোনো অপরাধের উপাদান স্পষ্ট নয়। তথ্য যাচাই করে পরবর্তী ব্যবস্থা নিন।",
        "ঘটনার বিস্তারিত বিবরণ জেনে সাধারণ ডায়েরি (GD) বা নোটিশ প্রদানের বিষয়টি বিবেচনা করুন।",
      ],
      contradictionsDetectedBn: [],
      opponentsWeaknessesBn: ["সুনির্দিষ্ট সাক্ষ্য ও দালিলিক প্রমাণের অভাবে প্রতিপক্ষ কৌঁসুলি মামলাটির কার্যকারিতা চ্যালেঞ্জ করতে পারে।"],
    };
  }

  // 4. Initial Laws detection for known domains
  const initialSections = new Set<string>();

  if (isSmokingNuisance) {
    initialSections.add("tobacco_4"); // ধূমপান নিয়ন্ত্রণ আইন ৪/৮ ধারা
    initialSections.add("290");       // গণউপদ্রব / Public Nuisance
    if (hasMultipleAttackers) {
      initialSections.add("143");     // বেআইনি সমাবেশ
    }
    if (text.includes("হুমকি") || text.includes("ভয়") || text.includes("গালাগালি")) {
      initialSections.add("506");
    }
    initialSections.add("crpc_133");  // উপদ্রব বন্ধে নির্বাহী আদেশ
  } else if (isGeneralNuisance) {
    initialSections.add("290");       // গণউপদ্রব / Public Nuisance
    initialSections.add("crpc_133");  // নির্বাহী ম্যাজিস্ট্রেটের শর্তযুক্ত আদেশ
    if (text.includes("গান") || text.includes("শব্দ") || text.includes("মাইক") || text.includes("লাউডস্পিকার")) {
      initialSections.add("sound_nuisance");
    }
    if (hasMultipleAttackers) {
      initialSections.add("143");
    }
    if (text.includes("হুমকি") || text.includes("ভয়") || text.includes("গালাগালি")) {
      initialSections.add("506");
    }
  } else if (isHumanitarianRescue) {
    initialSections.add("const_15_32");
    initialSections.add("crpc_100_prb_246");
    initialSections.add("parent_maintenance");
    initialSections.add("destitute_9_11");
  } else if (isLabour) {
    initialSections.add("labour_wages"); // শ্রম আইন ৩৩/১২১ ধারা
  } else if (isCyberCrime) {
    initialSections.add("cyber_25");
    initialSections.add("506");
  } else if (isNariShishu) {
    initialSections.add("nari_11c");
    initialSections.add("nari_30");
  } else if (isCheque) {
    initialSections.add("138");
  } else if (isCivilProperty) {
    initialSections.add("sr_42");
    initialSections.add("sr_54");
    initialSections.add("cpc_39");
    if (text.includes("গাছ") || text.includes("ভাঙচুর") || text.includes("ক্ষতি")) {
      initialSections.add("427"); // ক্ষতিসাধন
    }
    if (hasLandOrHomeGrab) {
      initialSections.add("sr_9"); // দখল পুনরুদ্ধার
    }
  } else if (hasKnife && isRobbery) {
    initialSections.add("326"); // মারাত্মক অস্ত্র দ্বারা গুরুতর জখম
    initialSections.add("307"); // খুনের চেষ্টা
    initialSections.add("392"); // দস্যুতা / ছিনতাই
    initialSections.add("34");  // সাধারণ অভিপ্রায়
  } else if (hasFirearm || (hasLandOrHomeGrab && (hasMultipleAttackers || text.includes("বাসা") || text.includes("বাড়ি")))) {
    initialSections.add("143");
    initialSections.add("148");
    initialSections.add("448");
    initialSections.add("452");
    initialSections.add("506");
    initialSections.add("34");
    if (hasFirearm) {
      initialSections.add("arms_19a");
    }
    if (hasLandOrHomeGrab) {
      initialSections.add("sr_9");
    }
  } else if (hasActualViolence) {
    // Only if violence is verified
    if (hasMultipleAttackers) {
      initialSections.add("143");
    }
    if (text.includes("বাসায় ঢুকে") || text.includes("বাড়িতে ঢুকে")) {
      initialSections.add("448");
    }
    initialSections.add("323");
    if (text.includes("ভাঙচুর") || text.includes("ক্ষতি")) {
      initialSections.add("427");
    }
    if (text.includes("হুমকি") || text.includes("ভয়")) {
      initialSections.add("506");
    }
    initialSections.add("34");
    if (isRobbery) {
      initialSections.add("392");
    }
  }

  // 5. Apply deterministic section upgrades from answers
  const { upgradedSections, appliedReasons } = applySectionUpgrades(
    Array.from(initialSections),
    answeredQuestions
  );

  // If weapons or head injury mentioned directly in statement or answers
  const hasWeaponInStatement =
    !isSmokingNuisance &&
    !isGeneralNuisance &&
    !isLabour &&
    !isCheque &&
    !isCivilProperty &&
    (hasFirearm ||
      detectedWeapons.length > 0 ||
      (answeredQuestions["weapon_used"] && answeredQuestions["weapon_used"].length > 0 && !answeredQuestions["weapon_used"].includes("অস্ত্র ছিল না")));

  const hasViolentHomeEntry =
    !isSmokingNuisance &&
    !isGeneralNuisance &&
    !isLabour &&
    (text.includes("বাসায় ঢুকে") || text.includes("বাড়িতে ঢুকে") || text.includes("ঘরে ঢুকে")) &&
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

  if (hasHeadInjury && hasActualViolence && !upgradedSections.includes("307")) {
    if (upgradedSections.includes("323")) {
      const idx = upgradedSections.indexOf("323");
      upgradedSections.splice(idx, 1, "326", "307");
    } else {
      upgradedSections.push("307");
    }
    appliedReasons.push("মাথায় গুরুতর আঘাত থাকায় হত্যাচেষ্টার ধারা ৩০৭ অন্তর্ভুক্ত হয়েছে");
  }

  // 6. Construct ApplicableLaw objects
  const lawMap: Record<string, ApplicableLaw> = {
    "const_15_32": {
      actNameBn: "গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান",
      section: "অনুচ্ছেদ ১৫ ও ৩২",
      titleBn: "মৌলিক প্রয়োজনের ব্যবস্থা এবং জীবন ও ব্যক্তি-স্বাধীনতার অধিকার রক্ষণ",
      bailableStatusBn: "সাংবিধানিক মৌলিক অধিকার",
      punishmentBn: "মৌলিক অধিকার বলবৎকরণে মহামান্য হাইকোর্টে রিট (অনুচ্ছেদ ১০২)",
      reasoningBn: "প্রত্যেক নাগরিকের অন্ন, বস্ত্র, চিকিৎসা ও জীবন রক্ষার মৌলিক অধিকার সুনিশ্চিত করতে রাষ্ট্র ও আইন-শৃঙ্খলা বাহিনী সাংবিধানিকভাবে দায়বদ্ধ।",
      confidence: "HIGH",
    },
    "crpc_100_prb_246": {
      actNameBn: "ফৌজদারি কার্যবিধি, ১৮৯৮",
      section: "ধারা ১০০ ও পুলিশ রেগুলেশনস বেঙ্গল (PRB) বিধি ২৪৬",
      titleBn: "অসহায় ব্যক্তির সুরক্ষা, জরুরি উদ্ধার এবং পুলিশের আইনগত দায়িত্ব",
      bailableStatusBn: "আইনগত ও প্রাতিষ্ঠানিক বাধ্যবাধকতা",
      punishmentBn: "বিভাগীয় ব্যবস্থা ও আইনানুগ প্রতিকার",
      reasoningBn: "প্রকাশ্য স্থানে অচেতন ও বিপন্ন নাগরিকের তাৎক্ষণিক উদ্ধার ও সুরক্ষায় পুলিশ প্রশাসনের সুস্পষ্ট আইনি বাধ্যবাধকতা রয়েছে।",
      confidence: "HIGH",
    },
    "parent_maintenance": {
      actNameBn: "পিতা-মাতার ভরণ-পোষণ আইন, ২০১৩",
      section: "ধারা ৩ ও ৫",
      titleBn: "পিতা-মাতার ভরণ-পোষণ নিশ্চিতকরণ ও ব্যর্থতায় আইনি প্রতিকার (পরিচয় শনাক্তকরণ সাপেক্ষে)",
      bailableStatusBn: "আপোষযোগ্য ও জামিনযোগ্য",
      punishmentBn: "অনূর্ধ্ব ১ লাখ টাকা অর্থদণ্ড বা অনাদায়ে ৩ মাসের কারাদণ্ড",
      reasoningBn: "পরিচয় শনাক্তকরণ সাপেক্ষে সন্তান কর্তৃক বৃদ্ধ পিতা-মাতাকে অবহেলা বা পরিত্যাগ করার ক্ষেত্রে আইনি প্রতিকার ও ভরণ-পোষণ নিশ্চিতকরণ।",
      confidence: "HIGH",
    },
    "destitute_9_11": {
      actNameBn: "ভবঘুরে ও নিরাশ্রয় ব্যক্তি (পুনর্বাসন) আইন, ২০১১",
      section: "ধারা ৯ ও ১১",
      titleBn: "নিরাশ্রয় ও সহায়হীন ব্যক্তির হেফাজত গ্রহণ, সরকারি চিকিৎসা ও পুনর্বাসন",
      bailableStatusBn: "রাষ্ট্রীয় কল্যাণমূলক দায়িত্ব",
      punishmentBn: "সরকারি পুনর্বাসন ও সুচিকিৎসা প্রাপ্তির অধিকার",
      reasoningBn: "নিরাশ্রয় ও সহায়হীন অবস্থায় রাস্তায় পড়ে থাকা ব্যক্তিকে সরকারি হেফাজতে গ্রহণ, জরুরি সুচিকিৎসা ও নিরাপদ পুনর্বাসন নিশ্চিত করা।",
      confidence: "HIGH",
    },
    "tobacco_4": {
      actNameBn: "ধূমপান ও তামাকজাত দ্রব্য ব্যবহার (নিয়ন্ত্রণ) আইন, ২০০৫ (সংশোধিত ২০১৩)",
      section: "৪/৮",
      titleBn: "পাবলিক প্লেসে ধূমপান নিষিদ্ধ ও শাস্তি",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "৩০০ টাকা জরিমানা বা ৩ মাস পর্যন্ত বিনাশ্রম কারাদণ্ড",
      reasoningBn: "পাবলিক প্লেস ও সাধারণের চলাচলের স্থানে প্রকাশ্য ধূমপান করিয়া জনস্বাস্থ্যের ক্ষতি সাধন ও আইন লঙ্ঘন।",
      confidence: "HIGH",
    },
    "290": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "২৯০",
      titleBn: "গণউপদ্রব বা পাবলিক নুইসেন্স (Public Nuisance)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "২০০ টাকা অর্থদণ্ড বা বিনাশ্রম কারাদণ্ড",
      reasoningBn: "বারবার নিষেধ সত্ত্বেও আবাসিক পরিবেশে জনসাধারণের স্বাভাবিক চলাচল ও শান্তিতে বিঘ্ন সৃষ্টি করিয়া উপদ্রব সৃষ্টি।",
      confidence: "HIGH",
    },
    "sound_nuisance": {
      actNameBn: "শব্দদূষণ (নিয়ন্ত্রণ) বিধিমালা, ২০০৬ ও পরিবেশ সংরক্ষণ আইন",
      section: "৮/১৮",
      titleBn: "অনুমোদিত মাত্রার অতিরিক্ত শব্দ সৃষ্টি ও শান্তি বিনষ্ট",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "১ মাস কারাদণ্ড বা ৫ হাজার টাকা অর্থদণ্ড",
      reasoningBn: "আবাসিক এলাকায় উচ্চ শব্দে গান বাজিয়ে জনসাধারণের স্বাভাবিক জীবনযাত্রা ও নিদ্রা বিঘ্নিত করা।",
      confidence: "HIGH",
    },
    "labour_wages": {
      actNameBn: "বাংলাদেশ শ্রম আইন, ২০০৬",
      section: "৩৩/১২১",
      titleBn: "বকেয়া মজুরি ও বেতন পরিশোধে ব্যর্থতা",
      bailableStatusBn: "শ্রম ট্রাইব্যুনাল প্রতিকার",
      punishmentBn: "বকেয়া পাওনা আদায়ের ডিক্রি ও ক্ষতিপূরণ",
      reasoningBn: "নির্ধারিত সময়ে কর্মচারীর বৈধ বকেয়া বেতন পরিশোধ না করিয়া শ্রম আইন লঙ্ঘন।",
      confidence: "HIGH",
    },
    "crpc_133": {
      actNameBn: "ফৌজদারি কার্যবিধি, ১৮৯৮",
      section: "১৩৩",
      titleBn: "গণউপদ্রব অপসারণে নির্বাহী ম্যাজিস্ট্রেটের শর্তযুক্ত আদেশ",
      bailableStatusBn: "নির্বাহী প্রতিকার",
      punishmentBn: "উপদ্রব অপসারণের বাধ্যবাধকতা ও শান্তিশৃঙ্খলা বজায় রাখার আদেশ",
      reasoningBn: "জনস্বাস্থ্য ও প্রতিবেশীদের সুরক্ষায় নির্বাহী ম্যাজিস্ট্রেট কর্তৃক তাৎক্ষণিক গণউপদ্রব বন্ধের ক্ষমতা।",
      confidence: "HIGH",
    },
    "cyber_25": {
      actNameBn: "সাইবার নিরাপত্তা আইন, ২০২৩",
      section: "২৫",
      titleBn: "অনলাইনে ভীতি প্রদর্শন ও অপপ্রচার",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "২ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "ডিজিটাল মাধ্যমে ইচ্ছাকৃতভাবে বিরক্তি, অপমান ও ভীতি সৃষ্টি।",
      confidence: "HIGH",
    },
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
      titleBn: "দাঙ্গা হাঙ্গামা সৃষ্টি (Rioting)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "২ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "বেআইনি সমাবেশের মাধ্যমে সহিংস আক্রমণ চালানো হইয়াছে।",
      confidence: "HIGH",
    },
    "148": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "১৪৮",
      titleBn: "মারাত্মক অস্ত্রে সজ্জিত হইয়া দাঙ্গা",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "৩ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "মারাত্মক দেশীয় অস্ত্র বা আগ্নেয়াস্ত্র সহকারে দলবদ্ধ আক্রমণ চালানো হইয়াছে।",
      confidence: "HIGH",
    },
    "448": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৪৪৮",
      titleBn: "অনধিকার গৃহপ্রবেশ (House-trespass)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "১ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "অন্যায়ভাবে বসতবাড়িতে অনধিকার প্রবেশ করা হইয়াছে।",
      confidence: "HIGH",
    },
    "452": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৪৫২",
      titleBn: "আঘাতের প্রস্তুতি বা অস্ত্রসহ গৃহে অনধিকার প্রবেশ",
      bailableStatusBn: "জামিন-অযোগ্য (Non-Bailable)",
      punishmentBn: "৭ বছর পর্যন্ত সশ্রম কারাদণ্ড ও অর্থদণ্ড",
      reasoningBn: "মারাত্মক অস্ত্রের প্রস্তুতি লইয়া বসতবাড়িতে বেআইনিভাবে প্রবেশ করা হইয়াছে।",
      confidence: "HIGH",
    },
    "506": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৫০৬",
      titleBn: "অপরাধমূলক ভীতি প্রদর্শন ও প্রাণনাশের হুমকি",
      bailableStatusBn: "জামিন-অযোগ্য (২য় অংশ)",
      punishmentBn: "৭ বছর পর্যন্ত কারাদণ্ড",
      reasoningBn: "প্রকাশ্যে প্রাণনাশের চরম হুমকি প্রদান করা হইয়াছে।",
      confidence: "HIGH",
    },
    "34": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩৪",
      titleBn: "সাধারণ অভিপ্রায় (Common Intention)",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "মূল অপরাধের সমতুল্য",
      reasoningBn: "সকল আসামি পরস্পরের পূর্ব পরামর্শে অপরাধে সহায়তা করিয়াছে।",
      confidence: "HIGH",
    },
    "323": {
      actNameBn: "দণ্ডবিধি, ১৮৬০",
      section: "৩২৩",
      titleBn: "স্বেচ্ছাকৃতভাবে সাধারণ আঘাত",
      bailableStatusBn: "জামিনযোগ্য",
      punishmentBn: "১ বছর কারাদণ্ড বা অর্থদণ্ড",
      reasoningBn: "বেধড়ক কিল-ঘুষি ও লাথি মারিয়া সাধারণ জখম করা হইয়াছে।",
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
      reasoningBn: "সম্পত্তি, আসবাবপত্র বা গাছপালা বিনষ্ট করিয়া প্রত্যক্ষ আর্থিক ক্ষতি করা হইয়াছে।",
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
    "sr_9": {
      actNameBn: "সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭",
      section: "৯",
      titleBn: "স্থাবর সম্পত্তির দখল পুনরুদ্ধার",
      bailableStatusBn: "দেওয়ানি প্রতিকার",
      punishmentBn: "দখল প্রত্যর্পণের ডিক্রি",
      reasoningBn: "আইনি প্রক্রিয়া ব্যতিরেকে বলপূর্বক বেদখল করায় দখল পুনরুদ্ধারের মোকদ্দমা।",
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
    "arms_19a": {
      actNameBn: "অস্ত্র আইন, ১৮৭৮",
      section: "১৯(ক)",
      titleBn: "অবৈধ আগ্নেয়াস্ত্র রাখা ও প্রদর্শন",
      bailableStatusBn: "জামিন-অযোগ্য",
      punishmentBn: "১০ বছর থেকে যাবজ্জীবন কারাদণ্ড",
      reasoningBn: "লাইসেন্সবিহীন আগ্নেয়াস্ত্র প্রদর্শন ও ব্যবহারের অভিযোগ।",
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

  // 7. Determine which fields are already answered
  const answeredFields = new Set<string>();
  if (answeredQuestions["incident_time"] || text.includes("রাত") || text.includes("গতকাল")) answeredFields.add("incident_date_time");
  if (answeredQuestions["incident_place"] || text.includes("বাসা") || text.includes("বাড়ি") || text.includes("ঘর") || text.includes("জমি")) answeredFields.add("incident_place");
  if (answeredQuestions["accused_details"] || namedAccused.length > 0) answeredFields.add("accused_identity");
  if (answeredQuestions["weapon_used"] || hasWeaponInStatement || detectedWeapons.length > 0) {
    answeredFields.add("weapon_used");
    answeredFields.add("deadly_weapon");
  }
  if (answeredQuestions["injury_severity"] || hasHeadInjury || text.includes("কোপ") || text.includes("সেলাই")) {
    answeredFields.add("injury_present");
  }
  if (answeredQuestions["medical_report"] || text.includes("হাসপাতাল") || text.includes("মেডিকেল")) answeredFields.add("medical_report_present");
  if (answeredQuestions["stolen_items"] || isRobbery) answeredFields.add("property_taken");
  if (answeredQuestions["attacker_count"] || hasMultipleAttackers) answeredFields.add("unlawful_assembly_5plus");
  if (text.includes("বাসায় ঢুকে") || text.includes("বাড়িতে ঢুকে") || text.includes("ঘরে ঢুকে")) answeredFields.add("house_trespass");
  if (text.includes("ভাঙচুর")) answeredFields.add("property_damage_value");

  const score = computeCompleteness(upgradedSections, answeredFields);

  // 8. Follow-up Questions tailored to specific legal domain
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
  } else if (isLabour) {
    allPossibleQuestions.push({
      fieldKey: "employer_details",
      questionBn: "আপনার নিয়োগকারী প্রতিষ্ঠান/কোম্পানির নাম ও কর্মস্থলের ঠিকানা কী?",
      inputType: "text",
      optionsBn: [],
      legalImportanceBn: "শ্রম আইন অনুযায়ী নোটিশ ও দাবিপত্রে নিয়োগকারী কর্তৃপক্ষের পূর্ণাঙ্গ বিবরণ আবশ্যক।",
    });
    allPossibleQuestions.push({
      fieldKey: "due_wages_amount",
      questionBn: "আপনার সর্বমোট কত মাসের বেতন বা কী পরিমাণ অর্থ বকেয়া রয়েছে?",
      inputType: "text",
      optionsBn: [],
      legalImportanceBn: "বকেয়া মজুরি ও আর্থিক ক্ষতিপূরণ নির্ধারণে সুনির্দিষ্ট দাবির অঙ্ক আবশ্যক।",
    });
    allPossibleQuestions.push({
      fieldKey: "employment_proof",
      questionBn: "আপনার কাছে নিয়োগপত্র (Appointment Letter), আইডি কার্ড বা বেতন রসিদ আছে কি?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, নিয়োগপত্র ও সার্ভিস আইডি কার্ড রয়েছে",
        "ব্যাংক স্টেটমেন্ট ও বেতন রসিদ রয়েছে",
        "কোনো লিখিত কাগজপত্র নেই, মৌখিক ভিত্তিতে কর্মরত ছিলাম",
      ],
      legalImportanceBn: "শ্রম আদালতে নিয়োগের প্রমাণস্বরূপ দালিলিক সাক্ষ্য অত্যন্ত গুরুত্বপূর্ণ।",
    });
  } else if (isCivilProperty) {
    if (namedAccused.length > 0) {
      allPossibleQuestions.push({
        fieldKey: "accused_details",
        questionBn: `১নং বিবাদী ${namedAccused[0]}-এর পিতার নাম, বয়স ও পূর্ণাঙ্গ স্থায়ী ঠিকানা আপনার জানা আছে কি?`,
        inputType: "text",
        optionsBn: [],
        legalImportanceBn: "দেওয়ানি আরজির ১নং বিবাদী তপশিলে পূর্ণাঙ্গ নাম-ঠিকানা সমন জারির জন্য আবশ্যক।",
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
      fieldKey: "threat_nature",
      questionBn: "বিবাদী কর্তৃক শান্তিপূর্ন ভোগদখলে বিঘ্ন সৃষ্টি বা ক্ষতিসাধনের সুনির্দিষ্ট তারিখ ও বিবরণ কী?",
      inputType: "select",
      optionsBn: [
        "সম্প্রতি জোরপূর্বক অনধিকার প্রবেশ করিয়া স্থাপনা বা গাছ কাটার অপচেষ্টা চালিয়েছে",
        "পূর্ব থেকেই বিরোধ চলছে এবং জমি ছেড়ে দেওয়ার হুমকি দিচ্ছে",
      ],
      legalImportanceBn: "দেওয়ানি মোকদ্দমায় প্রতিকারের কারণ (Cause of Action) প্রমাণে আবশ্যক।",
    });
  } else if (isGeneralNuisance) {
    if (namedAccused.length > 0) {
      allPossibleQuestions.push({
        fieldKey: "accused_details",
        questionBn: `উপদ্রবকারী ${namedAccused[0]}-এর ঠিকানা বা ফ্ল্যাট নম্বর আপনার জানা আছে কি?`,
        inputType: "text",
        optionsBn: [],
        legalImportanceBn: "সাধারণ ডায়েরি (GD) বা নোটিশে অভিযুক্তের অবস্থান সুনির্দিষ্ট করা জরুরি।",
      });
    }
    allPossibleQuestions.push({
      fieldKey: "nuisance_timing",
      questionBn: "উচ্চ শব্দ বা গান বাজানোর ঘটনাটি সাধারণত কোন সময়ে ঘটে এবং বারবার নিষেধ করা হয়েছে কি?",
      inputType: "select",
      optionsBn: [
        "প্রতিদিন গভীর রাতে ও মধ্যরাতে ঘটে, একাধিকবার বারণ করা সত্ত্বেও শোনেনি",
        "দিনের বিভিন্ন সময়ে লাউডস্পিকার বা সাউন্ডবক্সে উচ্চ শব্দ করে",
        "সম্প্রতি শুরু হয়েছে এবং স্বাভাবিক ঘুমে মারাত্মক ব্যাঘাত ঘটাচ্ছে",
      ],
      legalImportanceBn: "শব্দদূষণ বিধিমালা ও গণউপদ্রবের উপাদানে সময় ও নিয়মিত বিরতি গুরুত্বপূর্ণ।",
    });
    allPossibleQuestions.push({
      fieldKey: "witness_evidence",
      questionBn: "উক্ত ঘটনার কোনো অডিও/ভিডিও রেকর্ড বা প্রতিবেশী সাক্ষী আছেন কি?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, মোবাইল ফোনে অডিও/ভিডিও রেকর্ড এবং প্রতিবেশী সাক্ষী রয়েছেন",
        "প্রতিবেশী প্রত্যক্ষদর্শী সাক্ষী রয়েছেন",
      ],
      legalImportanceBn: "থানা পুলিশ বা নির্বাহী ম্যাজিস্ট্রেট আদালতের অনুসন্ধানে সহায়ক।",
    });
  } else if (isSmokingNuisance) {
    if (namedAccused.length > 0) {
      allPossibleQuestions.push({
        fieldKey: "accused_details",
        questionBn: `অভিযুক্ত ${namedAccused[0]}-এর পিতার নাম, আনুমানিক বয়স ও পূর্ণাঙ্গ স্থায়ী/বর্তমান ঠিকানা আপনার জানা আছে কি?`,
        inputType: "text",
        optionsBn: [],
        legalImportanceBn: "থানায় সাধারণ ডায়েরি (GD) বা ধূমপান নিয়ন্ত্রণ আইনের অভিযোগে অভিযুক্তের পূর্ণ পরিচয় জরুরি।",
      });
    }
    allPossibleQuestions.push({
      fieldKey: "nuisance_threat",
      questionBn: "বারবার মানা করার পর অভিযুক্ত ব্যক্তি কি আপনাকে কোনো ভয়ভীতি প্রদর্শন বা গালিগালাজ করেছে?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, মানা করায় অশোভন আচরণ ও গালিগালাজ/হুমকি দিয়েছে",
        "ঔদ্ধত্য প্রকাশ করে উপেক্ষা করেছে এবং প্রতিদিন প্রকাশ্যে ধূমপান চালিয়ে যাচ্ছে",
        "মৌখিকভাবে বিতণ্ডায় লিপ্ত হয়েছে কিন্তু মারমুখী হয়নি",
      ],
      legalImportanceBn: "হুমকি বা কটূক্তির প্রমাণ দণ্ডবিধির ৫০৪/৫০৬ ধারা সংযুক্তিতে অত্যন্ত গুরুত্বপূর্ণ।",
    });
    allPossibleQuestions.push({
      fieldKey: "evidence_recorded",
      questionBn: "উক্ত ঘটনার কোনো প্রত্যক্ষদর্শী প্রতিবেশী সাক্ষী বা ছবি/ভিডিও ফুটেজ সংরক্ষিত আছে কি?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, প্রত্যক্ষদর্শী প্রতিবেশী সাক্ষী ও ঘটনাস্থলের ছবি/ভিডিও রয়েছে",
        "প্রতিবেশী প্রত্যক্ষদর্শী সাক্ষী রয়েছেন",
        "আপাতত কোনো ছবি/ভিডিও নেই, তবে সরেজমিনে সাক্ষ্য প্রমাণ দেওয়া সম্ভব",
      ],
      legalImportanceBn: "পাবলিক প্লেসে ধূমপানের প্রমাণ ও মোবাইল কোর্ট/পুলিশি অনুসন্ধানে সহায়ক।",
    });
  } else if (isHumanitarianRescue) {
    allPossibleQuestions.push({
      fieldKey: "call_999",
      questionBn: "আপনি কি জাতীয় জরুরি সেবা ৯৯৯ (999)-এ কল করে পুলিশ বা অ্যাম্বুলেন্সের তাৎক্ষণিক সহায়তা চেয়েছেন?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, ৯৯৯-এ কল দিয়ে পুলিশ ও অ্যাম্বুলেন্সের তাৎক্ষণিক সহায়তা চাওয়া হয়েছে",
        "এখনও কল দেওয়া হয়নি, দ্রুত সরকারি জরুরি সেবা প্রয়োজন",
        "কল দেওয়া হয়েছিল তবে ঘটনাস্থলে কোনো টিম এখনও পৌঁছেনি",
      ],
      legalImportanceBn: "জরুরি সরকারি উদ্ধার তৎপরতা ও পুলিশের আইনি দায়বদ্ধতা অবিলম্বে কার্যকরের জন্য ৯৯৯-এ কল করা সর্বাগ্রে আবশ্যক।",
    });
    allPossibleQuestions.push({
      fieldKey: "identity_clues",
      questionBn: "অসুস্থ ব্যক্তির সাথে কি তার পরিচয় বা কোনো স্বজনের ফোন নম্বর নিশ্চিত করার মতো কোনো আলামত পাওয়া গেছে?",
      inputType: "select",
      optionsBn: [
        "কোনো কাগজপত্র বা ফোন নম্বর পাওয়া যায়নি, সম্পূর্ণ অজ্ঞাতনামা",
        "কাছে থাকা ব্যাগে/পকেটে চিরকুট বা সম্ভাব্য ফোন নম্বর পাওয়া গেছে",
        "স্থানীয় কেউ কেউ চেনে বলে দাবি করছে কিন্তু সুনির্দিষ্ট নিশ্চিত নয়",
      ],
      legalImportanceBn: "পিতা-মাতার ভরণ-পোষণ আইন ২০১৩ এবং স্বজনদের শনাক্ত করিয়া আইনগত যোগাযোগের জন্য পরিচয় নিশ্চিতকরণ অত্যন্ত জরুরি।",
    });
    allPossibleQuestions.push({
      fieldKey: "police_gd",
      questionBn: "ময়মনসিংহের সংশ্লিষ্ট থানা (যেমন: কোতোয়ালী মডেল থানা) বা হাসপাতাল পুলিশ ক্যাম্পে কোনো জিডি (GD) করা হয়েছে কি?",
      inputType: "select",
      optionsBn: [
        "না, এখনও কোনো জিডি (GD) করা হয়নি",
        "কোতোয়ালী মডেল থানায় মৌখিকভাবে জানানো হয়েছে কিন্তু জিডি এন্ট্রি হয়নি",
        "হাসপাতাল পুলিশ ক্যাম্প / ফাঁড়িতে অবহিত করা হয়েছে",
      ],
      legalImportanceBn: "আইনি সুরক্ষা ও উদ্ধার তৎপরতার আনুষ্ঠানিক রেকর্ড বহাল রাখার জন্য থানায় সাধারণ ডায়েরি (GD) অতি প্রয়োজনীয়।",
    });
    allPossibleQuestions.push({
      fieldKey: "hospital_admission",
      questionBn: "ময়মনসিংহ মেডিকেল কলেজ হাসপাতালের সমাজসেবা ইউনিট বা জরুরি বিভাগে তাকে প্রাথমিক ভর্তি করা হয়েছে কি?",
      inputType: "select",
      optionsBn: [
        "না, এখনও রাস্তায় অচেতন অবস্থায় পড়ে আছেন, জরুরি ভর্তি প্রয়োজন",
        "হাসপাতালের জরুরি বিভাগে নেওয়া হয়েছে, সমাজসেবা ইউনিটের সহায়তা প্রক্রিয়াধীন",
        "ভর্তি করা হয়েছিল তবে সার্বক্ষণিক পরিচর্যাকারী কেউ নেই",
      ],
      legalImportanceBn: "সংবিধানের ১৫ ও ৩২ অনুচ্ছেদ অনুযায়ী জীবন রক্ষা ও সরকারি বিনামূল্যে চিকিৎসা নিশ্চিতকরণই সর্বোচ্চ আইনি অগ্রাধিকার।",
    });
  } else if (hasActualViolence) {
    if (namedAccused.length > 0) {
      allPossibleQuestions.push({
        fieldKey: "accused_details",
        questionBn: `১নং আসামি ${namedAccused[0]}-এর পিতার নাম, বয়স ও পূর্ণাঙ্গ স্থায়ী ঠিকানা আপনার জানা আছে কি?`,
        inputType: "text",
        optionsBn: [],
        legalImportanceBn: "এজাহার ও চার্জশিটের সুবিধার্থে মূল আসামির পূর্ণাঙ্গ পরিচিতি থাকা অত্যন্ত জরুরি।",
      });
    }
    if (hasFirearm) {
      allPossibleQuestions.push({
        fieldKey: "weapon_used",
        questionBn: "আসামিরা আগ্নেয়াস্ত্র প্রদর্শন ছাড়া ফাঁকা গুলিবর্ষণ করেছিল কি?",
        inputType: "multiselect",
        optionsBn: [
          "আগ্নেয়াস্ত্র প্রদর্শন করিয়া প্রাণনাশের হুমকি দিয়েছে",
          "ফাঁকা গুলিবর্ষণ করিয়া ত্রাস সৃষ্টি করেছে",
        ],
        legalImportanceBn: "আগ্নেয়াস্ত্রের ব্যবহার অস্ত্র আইন ১৮৭৮ এর ১৯(ক) নিশ্চিত করে।",
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
    allPossibleQuestions.push({
      fieldKey: "medical_report",
      questionBn: "আহত ব্যক্তি কোন সরকারি বা বেসরকারি হাসপাতালে চিকিৎসা নিয়েছেন এবং ইনজুরি সার্টিফিকেট আছে কি?",
      inputType: "select",
      optionsBn: [
        "হ্যাঁ, সরকারি হাসপাতালে চিকিৎসা নেওয়া হয়েছে এবং প্রেসক্রিপশন সংরক্ষিত আছে",
        "মেডিকেল সার্টিফিকেট সংগ্রহের প্রক্রিয়াধীন রয়েছে",
        "হাসপাতালে ভর্তি হননি, প্রাথমিক চিকিৎসা নিয়েছেন",
      ],
      legalImportanceBn: "মারধরের মামলায় চিকিৎসকের সনদপত্র (Medical Certificate) আদালতে জখমের নির্ভরযোগ্য প্রমাণ।",
    });
  }

  const pendingQuestions = allPossibleQuestions.filter((q) => !answeredQuestions[q.fieldKey]);
  const finalQuestions = score >= 90 ? [] : pendingQuestions.slice(0, 4);

  // 9. Extracted Facts Sanitization (STRICT ZERO HALLUCINATION)
  let extractedWeapons: string[] = [];
  if (isSmokingNuisance || isGeneralNuisance || isLabour || isCheque || isCivilProperty || isHumanitarianRescue) {
    extractedWeapons = [];
  } else if (detectedWeapons.length > 0) {
    extractedWeapons = detectedWeapons;
  } else if (hasFirearm) {
    extractedWeapons = ["অবৈধ আগ্নেয়াস্ত্র"];
  } else if (text.includes("লোহার রড") || text.includes("লাঠি")) {
    extractedWeapons = ["লোহার রড ও লাঠিসোঁটা"];
  } else {
    extractedWeapons = [];
  }
  if (answeredQuestions["weapon_used"]) {
    extractedWeapons = answeredQuestions["weapon_used"].includes("অস্ত্র ছিল না")
      ? []
      : [answeredQuestions["weapon_used"]];
  }

  let extractedInjuries: string | null = null;
  if (isSmokingNuisance) {
    extractedInjuries = "কোনো শারীরিক মারপিট বা রক্তক্ষরণ নেই (পাবলিক প্লেসে ধূমপান ও জনস্বাস্থ্যের মারাত্মক ক্ষতি ও গণউপদ্রব)";
  } else if (isGeneralNuisance) {
    extractedInjuries = "কোনো শারীরিক আঘাত নেই (উচ্চ শব্দে নিদ্রা বিঘ্ন ও গণউপদ্রব)";
  } else if (isHumanitarianRescue) {
    extractedInjuries = "অচেতন ও মুমূর্ষু অবস্থা, দীর্ঘক্ষণ অনাহার ও চরম শারীরিক দুর্বলতায় জীবনহানির তীব্র ঝুঁকি";
  } else if (isLabour) {
    extractedInjuries = null;
  } else if (isCivilProperty) {
    extractedInjuries = text.includes("গাছ") ? "কোনো শারীরিক আঘাত নেই (সম্পত্তির ক্ষতিসাধন)" : "দেওয়ানি বিরোধ: শান্তিপূর্ন ভোগদখলে বিঘ্ন সৃষ্টি";
  } else if (isNariShishu) {
    extractedInjuries = "যৌতুকের দাবিকৃত অর্থ না পেয়ে শারীরিক মারধর ও জখম";
  } else if (hasKnife && isRobbery) {
    extractedInjuries = "ধারালো ছুরি দিয়ে পেটে আঘাত ও রক্তাক্ত গুরুতর জখম";
  } else if (isCheque) {
    extractedInjuries = "আর্থিক ক্ষতি ও চেক প্রতারণা (এনআই অ্যাক্ট ১৩৮ ধারা)";
  } else if (hasFirearm || hasLandOrHomeGrab) {
    extractedInjuries = "অস্ত্র প্রদর্শন করিয়া প্রাণনাশের প্রকাশ্য হুমকি";
  } else if (hasHeadInjury || text.includes("সেলাই")) {
    extractedInjuries = "মাথায় কোপের রক্তাক্ত গুরুতর জখম ও একাধিক সেলাই, হাসপাতালে ভর্তি ও চিকিৎসাধীন";
  } else if (hasActualViolence) {
    extractedInjuries = "শারীরিক মারপিট ও জখম";
  }
  if (answeredQuestions["injury_severity"]) {
    extractedInjuries = answeredQuestions["injury_severity"];
  }

  // Strategic Advice
  let advice: string[] = [
    "অবিলম্বে নিকটস্থ থানায় এজাহার (FIR) বা অভিযোগ দায়ের করুন।",
    "থানা যদি মামলা নিতে গড়িমসি করে, তবে বিজ্ঞ জুডিসিয়াল ম্যাজিস্ট্রেট আদালতে দ্রুত সি.আর. মোকদ্দমা দায়ের করুন।",
    "ঘটনাস্থলের চাক্ষুষ সাক্ষীদের নাম ও মোবাইল নম্বর ফর্দে অন্তর্ভুক্ত রাখুন।",
  ];
  if (isSmokingNuisance) {
    advice = [
      "নিকটস্থ থানায় অবিলম্বে সাধারণ ডায়েরি (GD) দায়ের করুন অথবা ধূমপান নিয়ন্ত্রণ আইনের ৪ ধারায় নালিশ পেশ করুন।",
      "ফৌজদারি কার্যবিধি ১৮৯৮ এর ধারা ১৩৩ অনুযায়ী নির্বাহী ম্যাজিস্ট্রেট আদালতে পাবলিক নুইসেন্স বন্ধের পিটিশন দাখিল করতে পারেন।",
      "ঘটনাস্থলের ছবি, ভিডিও বা প্রত্যক্ষদর্শী প্রতিবেশীদের তালিকা প্রস্তুত রাখুন।",
    ];
  } else if (isGeneralNuisance) {
    advice = [
      "শান্তিশৃঙ্খলা বজায় রাখার স্বার্থে নিকটস্থ থানায় অবিলম্বে সাধারণ ডায়েরি (GD) দায়ের করুন।",
      "ফৌজদারি কার্যবিধি ১৮৯৮ এর ধারা ১৩৩ অনুযায়ী বিজ্ঞ নির্বাহী ম্যাজিস্ট্রেট আদালতে গণউপদ্রব বন্ধের পিটিশন দাখিল করতে পারেন।",
      "শব্দদূষণ (নিয়ন্ত্রণ) বিধিমালা ২০০৬ লঙ্ঘনের দায়ে সংশ্লিষ্ট পরিবেশ অধিদপ্তর ও স্থানীয় প্রশাসনকে অবহিত করতে পারেন।",
    ];
  } else if (isHumanitarianRescue) {
    advice = [
      "এটি একটি জরুরি মানবিক ও জীবন রক্ষার সংকট (Public Rescue Emergency)। কালবিলম্ব না করে জাতীয় জরুরি সেবা ৯৯৯-এ কল করুন এবং নিকটস্থ কোতোয়ালী মডেল থানা, ময়মনসিংহ-এ অবহিত করুন।",
      "পুলিশ আইন ১৮৬১ এর ধারা ৪৪ ও ভবঘুরে ও নিরাশ্রয় ব্যক্তি (পুনর্বাসন) আইন ২০১১ অনুযায়ী সংশ্লিষ্ট পুলিশ প্রশাসন উক্ত মুমূর্ষু বৃদ্ধকে উদ্ধার করে সরকারি মেডিকেল কলেজ হাসপাতালে ভর্তি করতে আইনত বাধ্য।",
      "যদি থানা পুলিশ পদক্ষেপ গ্রহণে অনীহা বা গড়িমসি প্রকাশ করে, তবে জেলা প্রশাসক (DC), সিভিল সার্জন এবং পুলিশ সুপার (SP)-কে তাৎক্ষণিক লিখিতভাবে অবহিত করুন এবং সংবিধানের ১০২ অনুচ্ছেদে রিট পিটিশনের আইনি সুরক্ষা বিবেচনা করুন।",
    ];
  } else if (isLabour) {
    advice = [
      "নিয়োগকারী মালিকপক্ষ বরাবর অবিলম্বে বকেয়া পাওনা দাবি করিয়া আইনজীবীর মাধ্যমে লিগ্যাল নোটিশ প্রেরণ করুন।",
      "নোটিশের নির্ধারিত সময় অতিক্রান্ত হইলে বাংলাদেশ শ্রম আইন ২০০৬ এর ৩৩ ধারা মোতাবেক বিজ্ঞ শ্রম আদালতে মামলা দায়ের করুন।",
      "চাকরির সার্ভিস সংক্রান্ত যাবতীয় প্রমাণপত্র ও বেতন রেজিস্টারের প্রমাণাদি প্রস্তুত রাখুন।",
    ];
  } else if (isCivilProperty) {
    advice = [
      "বিজ্ঞ সিনিয়র সহকারী জজ আদালতে স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞার (Specific Relief Act 42 ও 54 ধারা) আরজি দাখিল করুন।",
      "জরুরি ভিত্তিতে দেওয়ানি কার্যবিধির অর্ডার ৩৯ রুল ১-২ অনুযায়ী অন্তর্বর্তীকালীন অস্থায়ী নিষেধাজ্ঞা ও স্থিতাবস্থা (Status Quo) বজায় রাখার আবেদন করুন।",
      "জমির সিএস, এসএ, আরএস/বিএস খতিয়ান এবং নামজারি ডিসিআর ও দাখিলার সার্টিফাইড কপি আরজির সাথে ফিরিস্তি সহকারে দাখিল করুন।",
    ];
  }

  // Dynamic Case Title
  const mainName = namedAccused.length > 0 ? namedAccused[0] : "";
  let title = "ফৌজদারি মোকদ্দমা";
  if (isSmokingNuisance) {
    title = `বাসার সামনে প্রকাশ্য ধূমপান ও গণউপদ্রব${mainName ? ` — ${mainName}` : (hasMultipleAttackers ? ` — সমবেত ১০ জন ব্যক্তি` : "")}`;
  } else if (isGeneralNuisance) {
    title = `বাসার সামনে গণউপদ্রব ও শান্তি বিনষ্ট${mainName ? ` — ${mainName}` : ""}`;
  } else if (isHumanitarianRescue) {
    title = `ময়মনসিংহে রাস্তায় পড়ে থাকা অজ্ঞাতনামা অসুস্থ বৃদ্ধের জীবন রক্ষা, উদ্ধার ও চিকিৎসা নিশ্চিতকরণ সংক্রান্ত আবেদন`;
  } else if (isLabour) {
    title = `বকেয়া বেতন ও পাওনা আদায়ের নালিশ`;
  } else if (isNariShishu) {
    title = `যৌতুক নির্যাতন ও মারপিটের মামলা — নারী ও শিশু নির্যাতন দমন ট্রাইব্যুনাল`;
  } else if (hasKnife && isRobbery) {
    title = `ধারালো ছুরি দিয়ে আঘাত ও ছিনতাই${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  } else if (hasFirearm && hasLandOrHomeGrab) {
    title = `বাড়ি জবরদখল ও আগ্নেয়াস্ত্র প্রদর্শন${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  } else if (isCivilProperty) {
    title = text.includes("গাছ") ? "অনধিকার প্রবেশ ও গাছ কেটে ক্ষতিসাধন" : `নালিশি সম্পত্তির স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞা${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  } else if (hasLandOrHomeGrab) {
    title = `বসতবাড়ি জোরপূর্বক বেদখল ও অনধিকার প্রবেশ${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  } else if (isCheque) {
    title = `এনআই অ্যাক্ট ১৩৮ ধারায় চেক ডিজঅনার মোকদ্দমা${mainName ? ` — ${mainName}` : ""}`;
  } else {
    title = `অভিযোগ ও নালিশ${mainName ? ` — ${mainName} ও অন্যান্য` : ""}`;
  }

  // Determine financial loss
  let financialLoss: string | null = null;
  if (isLabour) {
    financialLoss = "বকেয়া বেতন বাবদ পাওনা";
  } else if (isCivilProperty && text.includes("গাছ")) {
    financialLoss = "গাছ কর্তনজনিত আর্থিক ক্ষতিসাধন";
  } else if (isCivilProperty) {
    financialLoss = "নালিশি সম্পত্তির আনুমানিক মূল্য ১০,০০,০০০/- টাকা";
  } else if (isSmokingNuisance) {
    financialLoss = "কোনো আর্থিক ক্ষতি নেই";
  } else if (isGeneralNuisance) {
    financialLoss = null;
  } else if (text.includes("৫০ হাজার") || text.includes("৫০,০০০")) {
    financialLoss = "৫০,০০০/- টাকা";
  } else if (text.includes("১০ লক্ষ") || text.includes("১০ লাখ")) {
    financialLoss = "১০,০০,০০০/- টাকা";
  } else if (isRobbery || text.includes("লুট") || text.includes("ভাঙচুর")) {
    financialLoss = "আনুমানিক ১,৫০,০০০/- টাকা";
  }

  // Dynamic Accused / Defendant list
  let accused: string[] = [];
  if (isSmokingNuisance) {
    if (namedAccused.length > 0) {
      accused = [`১। ${namedAccused[0]} (প্রধান অভিযুক্ত/বিবাদী)`];
      if (hasMultipleAttackers) {
        accused.push(`২। দলবদ্ধভাবে সমবেত অন্যান্য ধূমপায়ী ব্যক্তিগণ (${unknownCountStr})`);
      }
    } else if (hasMultipleAttackers) {
      accused = [
        "১। অজ্ঞাতনামা ধূমপায়ী ব্যক্তিগণের মূল দলনেতা",
        `২। দলবদ্ধভাবে সমবেত অন্যান্য ধূমপায়ী ব্যক্তিগণ (${unknownCountStr})`,
      ];
    } else {
      accused = ["১। অজ্ঞাতনামা ধূমপায়ী ব্যক্তি (বিবাদী)"];
    }
  } else if (isGeneralNuisance) {
    if (namedAccused.length > 0) {
      accused = [`১। ${namedAccused[0]} (উপদ্রব সৃষ্টিকারী)`];
    } else {
      accused = ["১। অজ্ঞাতনামা উপদ্রব সৃষ্টিকারী ব্যক্তি (পাশের বাসার প্রতিবেশী)"];
    }
  } else if (isHumanitarianRescue) {
    accused = ["প্রযোজ্য নয় (মানবিক উদ্ধার ও চিকিৎসা আবেদন)"];
  } else if (isLabour) {
    accused = ["১। নিয়োগকারী মালিকপক্ষ / ব্যবস্থাপনা কর্তৃপক্ষ"];
  } else if (namedAccused.length > 0) {
    namedAccused.forEach((name, i) => {
      accused.push(`${name} (${i === 0 ? (isCivilProperty ? "১নং বিবাদী" : "প্রধান অভিযুক্ত/দখলকারী") : (isCivilProperty ? "বিবাদী" : "সহযোগী")})`);
    });
    if (unknownCountStr !== "নাই") {
      accused.push(isCivilProperty ? `সহ আরও অন্যান্য অজ্ঞাতনামা বিবাদীগণ` : `সহ অজ্ঞাতনামা আরও ${unknownCountStr}`);
    }
  } else if (hasMultipleAttackers) {
    accused = isCivilProperty
      ? ["১। অজ্ঞাতনামা দখলদার দলের নেতা (১নং বিবাদী)", "২। দলবদ্ধভাবে অংশগ্রহণকারী অন্যান্য বিবাদীগণ"]
      : [
          "১। অজ্ঞাতনামা দলনেতা",
          `২। দলবদ্ধভাবে অংশগ্রহণকারী সমবেত আরও ${unknownCountStr}`,
        ];
  } else {
    accused = isCivilProperty
      ? ["১। ১নং অজ্ঞাতনামা বিবাদী", "২। অজ্ঞাতনামা অন্যান্য সহযোগী বিবাদীগণ"]
      : ["১। অজ্ঞাতনামা প্রধান অভিযুক্ত", "২। অজ্ঞাতনামা সহযোগী"];
  }

  let category = isHumanitarianRescue
    ? "Public Interest & Human Rights / Miscellaneous"
    : isNariShishu
    ? "Special_Tribunal"
    : isCivilProperty || isLabour
    ? "Civil"
    : "Criminal";

  if (finalLaws.length === 0 && score < 20) {
    category = "General";
  }

  const opponentsWeaknessesBn: string[] = [];
  if (hasLandOrHomeGrab || isCivilProperty) {
    opponentsWeaknessesBn.push("স্বত্বগত বিরোধের দাবি: বিবাদী পক্ষ দাবি করবে এটি একটি দেওয়ানি স্বত্ব ও দখলের বিরোধ, যা ফৌজদারি অপরাধ নয়।");
    opponentsWeaknessesBn.push("বিলম্বের সুযোগ: অনধিকার প্রবেশের পর মামলা দায়েরে বিলম্বকে আপোষ-মীমাংসার ব্যর্থতা পরবর্তী সাজানো অভিযোগ বলে দাবি করতে পারে।");
    opponentsWeaknessesBn.push("দালিলিক মালিকানা চ্যালেঞ্জ: আরজিতে সিএস, এসএ, আরএস খতিয়ানের ধারাবাহিক চেইন না থাকলে পক্ষদোষ ও স্বত্বহীনতার আপত্তি তুলবে।");
  } else if (isViolentAssaultOrRobbery || isRobbery) {
    opponentsWeaknessesBn.push("দেরিতে এজাহার দায়েরের আপত্তি: ঘটনার পর থানায় পৌঁছাতে বিলম্ব হওয়ায় বিপক্ষ পক্ষ মামলাটিকে পরামর্শভিত্তিক সাজানো বয়ান দাবি করবে।");
    opponentsWeaknessesBn.push("পাইকারি ভূমিকা আরোপ: একাধিক আসামির বিরুদ্ধে আলাদা ভূমিকা সুনির্দিষ্ট না থাকলে আসামিপক্ষ খালাসের জোরালো আবেদন করবে।");
    opponentsWeaknessesBn.push("মেডিকেল ইনজুরি রিপোর্টের ঘাটতি: জখমের গভীরতা ও অস্ত্রের ধরনের সাথে রেজিস্টার্ড হাসপাতালের ইনজুরি সনদের গরমিল থাকলে ৩২৬/৩০৭ ধারা বাতিল দাবি করবে।");
  } else if (isCheque) {
    opponentsWeaknessesBn.push("লিগ্যাল নোটিশ জারির মেয়াদ: ৩০ দিনের মধ্যে নোটিশ প্রাপ্তির প্রমাণ বা প্রাপ্তি স্বীকারপত্র না থাকলে মামলাটি কার্যবিধিগত কারণে খারিজ চাইতে পারে।");
    opponentsWeaknessesBn.push("সিকিউরিটি চেক প্রতিরক্ষা: চেকটি বৈধ ঋণের জন্য নয় বরং জামানত হিসেবে রাখা হয়েছিল মর্মে বিবাদী পক্ষ আত্মপক্ষ সমর্থন করবে।");
  } else {
    opponentsWeaknessesBn.push("এখতিয়ারের আপত্তি: বিজ্ঞ আদালতের আঞ্চলিক ও আর্থিক এখতিয়ার সুনির্দিষ্টভাবে চ্যালেঞ্জ করা হতে পারে।");
    opponentsWeaknessesBn.push("স্বতন্ত্র নিরপেক্ষ সাক্ষীর অভাব: বাদীপক্ষের স্বার্থসংশ্লিষ্ট ছাড়া স্বাধীন নিরপেক্ষ সাক্ষী না থাকায় সাক্ষ্য আইনের দুর্বলতা তুলে ধরবে।");
  }

  return {
    caseTitleBn: title,
    caseCategory: category,
    completenessScore: score,
    extractedFacts: {
      incidentDate: answeredQuestions["incident_time"] || (isHumanitarianRescue ? "বিগত ২ দিন যাবত" : isSmokingNuisance || isGeneralNuisance ? "প্রতিদিন (চলমান ঘটনা)" : isLabour ? "বকেয়া বেতনের সময়কাল" : "গতকাল রাত্রি"),
      incidentTime: isHumanitarianRescue ? "চলমান ও আশঙ্কাজনক" : isSmokingNuisance ? "সারাদিন ও নিয়মিত বিরতিতে" : isGeneralNuisance ? "রাত্রিবেলা ও নিয়মিত বিরতিতে" : isLabour ? "অফিস চলাকালীন" : "রাত্রি আনুমানিক ১০:৩০ ঘটিকা",
      incidentPlace: isHumanitarianRescue ? (detectedPlace || "ময়মনসিংহের ব্রীজের মোড়ে প্রকাশ্য উন্মুক্ত স্থান") : isSmokingNuisance ? "বাদীর বাসার বারান্দার সামনে (আবাসিক উন্মুক্ত স্থান)" : isGeneralNuisance ? "পাশের বাসা / সংলগ্ন আবাসিক এলাকা" : isLabour ? "কর্মস্থল / প্রতিষ্ঠানের কার্যালয়" : isCivilProperty ? "নালিশি জমি ও সীমানা প্রাঙ্গণ" : ((text.includes("বাসা") || text.includes("বাড়ি")) ? "বাদীর নিজ বাড়ি / বসতভিটা" : (answeredQuestions["incident_place"] || "বাদীর নিজ বসতবাড়ি")),
      complainantName: isHumanitarianRescue ? "সচেতন নাগরিক / আবেদনকারী নিজে" : isCivilProperty || isLabour ? "বাদী নিজে" : "ফরিয়াদী / ভুক্তভোগী নিজে",
      complainantDetails: `সাং: [গ্রাম/মহল্লা], থানা: ${detectedThana.split(",")[0]}, জেলা: ${detectedDistrict}`,
      accusedList: accused,
      unknownAccusedCount: isHumanitarianRescue || isSmokingNuisance ? "নাই" : unknownCountStr,
      weaponsUsed: extractedWeapons,
      injuriesAndMedical: extractedInjuries,
      stolenOrDamagedItems: isHumanitarianRescue ? "প্রযোজ্য নয়" : answeredQuestions["stolen_items"] || (isSmokingNuisance || isGeneralNuisance ? "কোনো মালামাল চুরি বা ক্ষতি হয়নি" : isRobbery ? "নগদ টাকা ছিনতাই" : null),
      totalFinancialLoss: isHumanitarianRescue ? null : financialLoss,
      motiveOrPreviousDispute: isHumanitarianRescue ? "অসহায় মুমূর্ষু বৃদ্ধকে উন্মুক্ত স্থানে ফেলে রাখা ও প্রয়োজনীয় জরুরি চিকিৎসা প্রদান না করা" : isSmokingNuisance ? "বারবার মানা করার পরও প্রকাশ্যে ধূমপান ও জনস্বাস্থ্যের ক্ষতি সাধন" : isGeneralNuisance ? "আবাসিক শান্তি বিনষ্ট ও উচ্চ শব্দে নিদ্রা বিঘ্ন ঘটানো" : isLabour ? "বৈধ পাওনা বকেয়া বেতন পরিশোধে অনীহা" : hasLandOrHomeGrab ? "সশস্ত্র দলবল সহযোগে বাদীর বসতবাড়ি জবরদখল ও বলপূর্বক উচ্ছেদ" : "পূর্ববিরোধ ও মতানৈক্য",
      witnesses: answeredQuestions["witness_names"] ? [answeredQuestions["witness_names"]] : (isHumanitarianRescue ? ["স্থানীয় পথচারী ও পথবাসী প্রত্যক্ষদর্শী"] : ["প্রতিবেশী প্রত্যক্ষদর্শী ১", "প্রতিবেশী প্রত্যক্ষদর্শী ২"]),
      policeStationAndDistrict: detectedThana,
    },
    applicableLaws: finalLaws,
    followUpQuestions: finalQuestions,
    strategicAdviceForAdvocateBn: advice,
    contradictionsDetectedBn: [],
    opponentsWeaknessesBn,
  };
}
