import { ApplicableLaw, DraftDocType } from "@/lib/ai/schemas";
import { verifyCitations } from "@/lib/law/citationVerifier";
import { getNiActJurisdiction } from "@/lib/law/niAct";

export interface TemplateData {
  courtStation?: string;
  policeStation?: string;
  district?: string;
  complainantName?: string;
  complainantDetails?: string;
  accusedList?: string[];
  unknownAccusedCount?: string;
  incidentDate?: string;
  incidentTime?: string;
  incidentPlace?: string;
  weaponsUsed?: string[];
  injuriesAndMedical?: string;
  stolenOrDamagedItems?: string;
  totalFinancialLoss?: string;
  chequeAmount?: number | string;
  isNiAct?: boolean;
  motiveOrPreviousDispute?: string;
  witnesses?: string[];
  applicableLaws?: ApplicableLaw[];
  caseTitle?: string;
  evidenceOcrSnippets?: string;
  evidenceFiles?: any[];
}

export const MANDATORY_DISCLAIMER_HTML = `
<div class="disclaimer mt-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs rounded leading-relaxed">
  <strong>সতর্কীকরণ ও আইনি বিজ্ঞপ্তি:</strong> এই দলিলটি LegalAI BD এর AI-সহায়ক প্রযুক্তিতে প্রস্তুতকৃত প্রাথমিক খসড়া মাত্র। বিজ্ঞ অ্যাডভোকেট কর্তৃক সরেজমিনে পুনঃপরীক্ষা, তথ্য যাচাই ও স্বাক্ষর ব্যতিরেকে কোনো আদালতে দাখিল করা যাবে না। LegalAI BD কোনো সরাসরি আইনি পরামর্শ বা ওকালতি প্রতিনিধিত্ব প্রদান করে না।
</div>
`;

export function formatBangladeshDate(d: Date = new Date()): string {
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

export function generateFirTemplate(data: TemplateData): string {
  const th = data.policeStation || "**[থানার নাম]**";
  const dist = data.district || "ঢাকা";
  const comp = data.complainantName || "**[বাদীর নাম]**";
  const compDetails = data.complainantDetails || "পিতা/স্বামী: **[পিতার নাম]**, বয়স: **[বয়স]** বছর, সাং: **[ঠিকানা]**, থানা: " + th + ", জেলা: " + dist;

  // Clean numbering from accused names to avoid duplicate 1। ১।
  const accusedListStr = (data.accusedList && data.accusedList.length > 0)
    ? data.accusedList.map((a, i) => {
        const cleanName = a.replace(/^[০-৯0-9]+[।\.\-\s]+/, "").trim();
        return `${i + 1}। ${cleanName}`;
      }).join("<br/>")
    : "১। **[১ নং আসামির নাম, পিতা ও পূর্ণাঙ্গ ঠিকানা]**<br/>২। **[২ নং আসামির নাম, পিতা ও ঠিকানা]**";

  const hasUnknownInList = data.accusedList?.some(a => a.includes("অজ্ঞাতনামা"));
  const unknown = (!hasUnknownInList && data.unknownAccusedCount && data.unknownAccusedCount !== "নাই")
    ? `সহ অজ্ঞাতনামা আরও ${data.unknownAccusedCount} জন।`
    : "";
  
  const penalSections: string[] = [];
  let hasTobaccoAct = false;
  let hasArmsAct = false;
  let hasSrAct = false;

  (data.applicableLaws || []).forEach((l) => {
    const s = l.section;
    if (s.includes("tobacco") || s.includes("৪/৮") || l.actNameBn.includes("তামাক")) {
      hasTobaccoAct = true;
    } else if (s.includes("19") || s.includes("১৯") || s.includes("arms")) {
      hasArmsAct = true;
    } else if (s.includes("sr") || s.includes("৯")) {
      hasSrAct = true;
    } else {
      penalSections.push(s);
    }
  });

  let sectionsDisplay = penalSections.length > 0 ? `দণ্ডবিধি আইনের ${penalSections.join("/")} ধারা` : "দণ্ডবিধি আইনের ১৪৩/৪৪৮/৩২৩/৫০৬ ধারা";
  if (hasTobaccoAct) {
    sectionsDisplay = "ধূমপান ও তামাকজাত দ্রব্য ব্যবহার (নিয়ন্ত্রণ) আইন, ২০০৫ এর ৪/৮ ধারা এবং " + sectionsDisplay;
  }
  if (hasArmsAct) {
    sectionsDisplay += " এবং অস্ত্র আইন, ১৮৭৮ এর ১৯(ক) ধারা";
  }
  if (hasSrAct) {
    sectionsDisplay += " এবং সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭ এর ৯ ধারা";
  }

  const weapons = data.weaponsUsed && data.weaponsUsed.length > 0
    ? data.weaponsUsed.join(", ")
    : "কোনো অস্ত্র ব্যবহার হয়নি";

  const witnessStr = data.witnesses && data.witnesses.length > 0
    ? data.witnesses.map((w, idx) => {
        const cleanWitness = w.replace(/^[০-৯0-9]+[।\.\-\s]+/, "").trim();
        return `${idx + 1}। ${cleanWitness}`;
      }).join("<br/>")
    : "১। ফরিয়াদী নিজে<br/>২। **[সাক্ষী ১-এর নাম, পিতা ও ঠিকানা]**<br/>৩। **[সাক্ষী ২-এর নাম ও ঠিকানা]**";

  const isSmokingNuisance =
    hasTobaccoAct ||
    (data.caseTitle && (data.caseTitle.includes("ধূমপান") || data.caseTitle.includes("ধুমপান") || data.caseTitle.includes("সিগারেট") || data.caseTitle.includes("উপদ্রব"))) ||
    (data.injuriesAndMedical && (data.injuriesAndMedical.includes("ধূমপান") || data.injuriesAndMedical.includes("ধুমপান"))) ||
    (data.motiveOrPreviousDispute && (data.motiveOrPreviousDispute.includes("ধূমপান") || data.motiveOrPreviousDispute.includes("ধুমপান")));

  const hasPhysicalHarm =
    !isSmokingNuisance &&
    data.injuriesAndMedical &&
    !data.injuriesAndMedical.includes("নেই") &&
    !data.injuriesAndMedical.includes("না") &&
    (data.injuriesAndMedical.includes("জখম") ||
      data.injuriesAndMedical.includes("রক্তাক্ত") ||
      data.injuriesAndMedical.includes("মারপিট"));

  const isArmedTakeover =
    !isSmokingNuisance &&
    (weapons.includes("পিস্তল") ||
      weapons.includes("রিভলবার") ||
      weapons.includes("আগ্নেয়াস্ত্র") ||
      (data.motiveOrPreviousDispute && data.motiveOrPreviousDispute.includes("দখল")));

  return `
<div class="legal-doc fir-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto shadow-sm">
  <div class="text-center font-bold text-lg mb-6 underline">থানার এজাহার (FIR) দরখাস্ত</div>

  <div class="mb-4">
    <p>বরাবর,</p>
    <p class="font-semibold">অফিসার ইনচার্জ (OC),</p>
    <p>${th} থানা, ${dist}।</p>
  </div>

  <div class="mb-4">
    <p class="font-semibold">বিষয়: এজাহার দায়ের পূর্বক নিয়মিত মামলা রুজু ও আইনানুগ ব্যবস্থা গ্রহণের আবেদন।</p>
  </div>

  <div class="mb-4">
    <p>মহোদয়,</p>
    <p class="indent-8 text-justify">
      বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী <strong>${comp}</strong>, ${compDetails} এই মর্মে আপনার থানায় হাজির হইয়া লিখিতভাবে এজাহার দায়ের করিতেছি যে:
    </p>
  </div>

  <div class="bg-gray-50 border p-4 rounded mb-5">
    <p class="font-bold mb-2">আসামি / অভিযুক্তের নাম ও পূর্ণ পরিচিতি:</p>
    <div class="pl-4">${accusedListStr}</div>
    ${unknown ? `<p class="mt-2 text-sm text-gray-700 italic">${unknown}</p>` : ""}
  </div>

  <div class="bg-blue-50/70 p-3 rounded mb-5 text-sm border border-blue-200">
    <p><strong>ঘটনার তারিখ ও সময়:</strong> ${data.incidentDate || "ইং **[তারিখ]** তারিখ।"}</p>
    <p><strong>ঘটনাস্থল:</strong> ${data.incidentPlace || "বাদীর নিজ বসতবাড়ির প্রাঙ্গণে।"}</p>
    <p><strong>আইনগত ধারা:</strong> ${sectionsDisplay}।</p>
  </div>

  <div class="mb-5 space-y-3 text-justify">
    <p class="font-bold underline">ঘটনার বিস্তারিত বিবরণ:</p>
    ${
      isSmokingNuisance
        ? `
    <p class="indent-8">
      ১। ঘটনার প্রেক্ষাপট এই যে, অভিযুক্ত আসামি বাদীর বাসার সীমানার সামনে আসিয়া নিয়মিত বিরতিতে ও প্রকাশ্য দিবালোকে সিগারেট/তামাকজাত দ্রব্য ধূমপান করিয়া আসিতেছে।
    </p>
    <p class="indent-8">
      ২। উন্মুক্ত স্থানে প্রকাশ্যে ধূমপান করার ফলে বিষাক্ত ধোঁয়া ও দুর্গন্ধ বাদীর বাসাবাড়ির অভ্যন্তরে প্রবেশ করে, যাহার ফলে পরিবারের বয়োবৃদ্ধ, শিশু এবং সাধারণ নাগরিকদের স্বাস্থ্য মারাত্মক হুমকির মুখে পতিত হইতেছে এবং পরিবেশের শান্তি বিঘ্নিত হইয়া গণউপদ্রবের সৃষ্টি হইতেছে।
    </p>
    <p class="indent-8">
      ৩। বাদী ও পরিবারের সদস্যগণ একাধিকবার অভিযুক্ত আসামিকে উক্তরূপ ক্ষতিকর ধূমপান করিতে নিষেধ ও বারণ করা সত্ত্বেও আসামি কোনো কর্ণপাত না করিয়া ধৃষ্টতাপূর্ণ আচরণ প্রদর্শন করিয়া ধূমপান অব্যাহত রাখিয়াছে।
    </p>
    <p class="indent-8">
      ৪। আসামির এহেন আচরণ ধূমপান ও তামাকজাত দ্রব্য ব্যবহার (নিয়ন্ত্রণ) আইন, ২০০৫ এর ধারা ৪ অনুযায়ী সম্পূর্ণ বেআইনি এবং দণ্ডবিধির ধারা ২৯০ মোতাবেক জনশান্তি বিনষ্টকারী গণউপদ্রব (Public Nuisance) অপরাধের শামিল বটে।
    </p>
    <p class="indent-8">
      ৫। <strong>বিলম্বের কারণ:</strong> প্রতিবেশীদের মাধ্যমে আসামিকে বুঝাইয়া শুভবুদ্ধির উদয় করানোর চেষ্টা করায় থানায় আসিয়া লিখিত এজাহার দাখিল করিতে সামান্য বিলম্ব হইল।
    </p>
        `
        : isArmedTakeover
        ? `
    <p class="indent-8">
      ১। ঘটনার প্রেক্ষাপট এই যে, ${data.motiveOrPreviousDispute || "বিবাদীগণের সহিত বাদীর বিরোধের জের ধরিয়া বিবাদীগণ বাদীর বসতবাড়ি দখল ও ক্ষতির ষড়যন্ত্র করিয়া আসিতেছিল।"}
    </p>
    <p class="indent-8">
      ২। উল্লিখিত তারিখ ও সময়ে আসামিরা অস্ত্রশস্ত্রে সজ্জিত হইয়া যেমন- <strong>${weapons}</strong> সহযোগে বাদীর বসতবাড়ির সীমানায় অনধিকার প্রবেশ করে।
    </p>
    <p class="indent-8">
      ৩। আসামিরা হাতে থাকা অস্ত্র প্রদর্শন করিয়া বাদী ও পরিবারের সদস্যদের লক্ষ্য করিয়া প্রাণনাশের হুমকি দেয় এবং বলপ্রয়োগে বসতবাড়ি হইতে বেদখল করার অপচেষ্টা চালায়।
    </p>
    <p class="indent-8">
      ৪। আসামিদের তাণ্ডবে বাদী ও পরিবারের সদস্যগণ চরম নিরাপত্তাহীনতায় পতিত হন এবং আশপাশের সাক্ষীগণ আগাইয়া আসিলে আসামিরা দ্রুত স্থান ত্যাগ করে।
    </p>
    <p class="indent-8">
      ৫। <strong>বিলম্বের কারণ:</strong> চরম নিরাপত্তাহীনতায় ভোগায় ও আত্মীয়-স্বজনের সহিত পরামর্শ করায় এজাহার দায়ের করিতে সামান্য বিলম্ব হইল।
    </p>
        `
        : hasPhysicalHarm
        ? `
    <p class="indent-8">
      ১। ঘটনার প্রেক্ষাপট এই যে, ${data.motiveOrPreviousDispute || "বিবাদীদের সহিত বাদীর পূর্বশত্রুতা বিদ্যমান ছিল।"}
    </p>
    <p class="indent-8">
      ২। উল্লিখিত তারিখ ও সময়ে চিহ্নিত আসামিরা বাদীর পথরোধ করিয়া মারমুখী হইয়া আক্রমণ করে এবং ${weapons !== "কোনো অস্ত্র ব্যবহার হয়নি" ? `<strong>${weapons}</strong> সহযোগে` : ""} বেধড়ক মারপিট চালায়।
    </p>
    <p class="indent-8">
      ৩। মারধরের ফলে ${data.injuriesAndMedical || "শারীরিক রক্তাক্ত জখম প্রাপ্ত হইয়া মাটিতে লুটিয়ে পড়েন"} এবং উপস্থিত সাক্ষীদের সহায়তায় দ্রুত হাসপাতালে প্রাথমিক চিকিৎসা গ্রহণ করেন।
    </p>
    <p class="indent-8">
      ৪। আসামিরা যাওয়ার সময় বাদীকে পুনরায় মারধর ও প্রাণনাশের চরম হুমকি প্রদান করিয়া ত্রাস সৃষ্টি করে স্থান ত্যাগ করে।
    </p>
    <p class="indent-8">
      ৫। <strong>বিলম্বের কারণ:</strong> হাসপাতালে প্রাথমিক চিকিৎসা গ্রহণ ও মানসিক ধাক্কা সামলাইয়া থানায় আসিতে সামান্য বিলম্ব হইল।
    </p>
        `
        : `
    <p class="indent-8">
      ১। ঘটনার প্রেক্ষাপট এই যে, ${data.motiveOrPreviousDispute || "বিবাদী অন্যায়ভাবে বাদীর স্বাভাবিক জীবনযাপন ও চলাচলে বিঘ্ন সৃষ্টি করিয়া আসিতেছে।"}
    </p>
    <p class="indent-8">
      ২। উল্লিখিত তারিখ ও সময়ে চিহ্নিত আসামি বেআইনি উদ্দেশ্যে বাদীর প্রাঙ্গণে অনধিকার অনুপ্রবেশ করিয়া অশোভন আচরণ ও বিরক্তির সৃষ্টি করে।
    </p>
    <p class="indent-8">
      ৩। বাদী প্রতিবাদ করিলে আসামি ঔদ্ধত্যপূর্ণ আচরণ করিয়া হুমকি প্রদান করে এবং পরিবেশের স্বাভাবিক শান্তি বিনষ্ট করে।
    </p>
    <p class="indent-8">
      ৪। <strong>বিলম্বের কারণ:</strong> স্থানীয়ভাবে বিষয়টি মীমাংসার চেষ্টা করিয়া ব্যর্থ হওয়ায় থানায় এজাহার দায়ের করিতে সামান্য বিলম্ব হইল।
    </p>
        `
    }
  </div>


  ${data.evidenceOcrSnippets ? `
  <div class="mb-5 p-3.5 bg-slate-50 border-l-4 border-indigo-600 rounded text-sm text-slate-800">
    <p class="font-bold text-indigo-950 mb-1">দালিলিক প্রমাণ ও চিকিৎসা সনদ (Documentary & Medical Evidence Reference):</p>
    <p class="leading-relaxed whitespace-pre-wrap">${data.evidenceOcrSnippets}</p>
  </div>
  ` : ""}
  <div class="mb-6 text-justify">
    <p class="font-bold">অতএব প্রার্থনা:</p>
    <p class="indent-8">
      অতএব, মহোদয় সমীপে আমার বিনীত প্রার্থনা এই যে, উপরোক্ত ঘটনা সরেজমিনে তদন্তপূর্বক <strong>${sectionsDisplay}</strong> মোতাবেক এজাহার হিসেবে গ্রহণ করিয়া নিয়মিত মামলা রুজু করত আসামির বিরুদ্ধে আইনানুগ শাস্তিমূলক ব্যবস্থা গ্রহণে আপনার সদয় মর্জি হয়।
    </p>
  </div>

  <div class="border-t pt-4 grid grid-cols-2 gap-4 text-sm mt-8">
    <div>
      <p class="font-bold underline mb-2">সাক্ষীদের নাম ও ঠিকানা:</p>
      <div>${witnessStr}</div>
    </div>
    <div class="text-right flex flex-col justify-end">
      <p>ইতি</p>
      <p>তারিখ: ${formatBangladeshDate()} ইং</p>
      <div class="h-10"></div>
      <p class="font-bold">বিনীত নিবেদক,</p>
      <p>(${comp})</p>
      <p>মোবাইল: **[মোবাইল নম্বর]**</p>
    </div>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
}

export function generateCrPetitionTemplate(data: TemplateData): string {
  const dist = data.district || "ঢাকা";
  const comp = data.complainantName || "**[ফরিয়াদীর নাম]**";
  const compDetails = data.complainantDetails || "পিতা: **[পিতার নাম]**, সাং: **[গ্রাম/মহল্লা]**, থানা: **[থানা]**, জেলা: " + dist;

  const isNiActCase =
    data.isNiAct ||
    (data.applicableLaws && data.applicableLaws.some(l => l.section.includes("138") || l.titleBn?.includes("চেক") || l.titleBn?.includes("এনআই"))) ||
    data.caseTitle?.includes("চেক") ||
    data.caseTitle?.includes("এনআই");

  let court = data.courtStation || "বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত";
  let lawReference = "দণ্ডবিধি আইনের ১৪৩/১৪৮/৪৪৮/৪৫২/৫০৬/৩৪ ধারা";
  let sections = data.applicableLaws && data.applicableLaws.length > 0
    ? data.applicableLaws.map(l => l.section).join("/")
    : "১৪৩/১৪৮/৪৪৮/৪৫২/৫০৬/৩৪";

  if (isNiActCase) {
    const niJurisdiction = getNiActJurisdiction(data.chequeAmount || data.totalFinancialLoss, dist);
    court = niJurisdiction.courtNameBn;
    lawReference = `${niJurisdiction.actReferenceBn}`;
    sections = "১৩৮";
  } else if (data.applicableLaws && data.applicableLaws.length > 0) {
    lawReference = `দণ্ডবিধি আইনের ${sections} ধারা`;
  }

  const accusedListStr = (data.accusedList && data.accusedList.length > 0)
    ? data.accusedList.map((a, i) => {
        const cleanName = a.replace(/^[০-৯0-9]+[।\.\-\s]+/, "").trim();
        return `${i + 1}। ${cleanName}`;
      }).join("<br/>")
    : "১। **[১ নং আসামির নাম, পিতা ও ঠিকানা]**<br/>২। **[২ নং আসামির নাম, পিতা ও ঠিকানা]**";

  const lossFormatted = (data.totalFinancialLoss || "১,৫০,০০০/- টাকা")
    .replace(/টাকা.*$/, "")
    .trim() + " টাকা";

  return `
<div class="legal-doc cr-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto">
  <div class="text-center mb-6">
    <h2 class="text-lg font-bold">মোকাম ${court.includes("মোকাম") ? court : `বিজ্ঞ ${court}`}</h2>
    <p class="text-sm font-semibold">সি. আর. (CR) মামলা নং: ............ / ২০২৬ ইং</p>
    <p class="text-sm">ধারা: ${lawReference}।</p>
  </div>

  <div class="border p-4 rounded mb-6 text-sm bg-gray-50">
    <div class="flex justify-between items-start mb-4">
      <div class="w-2/3">
        <strong>${comp}</strong>, ${compDetails}
      </div>
      <div class="w-1/3 text-right font-bold text-blue-900">
        ................ ফরিয়াদী / বাদী।
      </div>
    </div>
    <div class="text-center font-bold text-gray-500 my-2">- বনাম -</div>
    <div class="flex justify-between items-start">
      <div class="w-2/3">
        ${accusedListStr}
        <p class="italic text-xs text-gray-600 mt-1">${data.unknownAccusedCount ? `সহ অজ্ঞাতনামা আরও ${data.unknownAccusedCount} জন` : "সহ অজ্ঞাতনামা আরও ৪/৫ জন"}</p>
      </div>
      <div class="w-1/3 text-right font-bold text-red-900">
        ................ আসামিগণ।
      </div>
    </div>
  </div>

  <div class="mb-4 text-sm bg-amber-50 p-3 rounded border border-amber-200">
    <p><strong>ঘটনার তারিখ ও সময়:</strong> ${data.incidentDate || "ইং **[তারিখ]**, সময় রাত আনুমানিক **[সময়]** ঘটিকা।"}</p>
    <p><strong>ঘটনাস্থল:</strong> ${data.incidentPlace || "ফরিয়াদীর নিজ বসতভিটায়।"}</p>
  </div>

  <div class="space-y-3 text-justify leading-relaxed">
    <p class="font-bold underline">ফরিয়াদীর পক্ষ হইতে বিনীত নিবেদন এই যে:</p>
    <p class="indent-8">
      ১। ফরিয়াদী একজন সহজ-সরল, শান্তিপ্রিয় ও আইন মান্যকারী নাগরিক বটে। অপরদিকে আসামিগণ অত্যন্ত উচ্ছৃঙ্খল, দাঙ্গাবাজ, পরধনলোভী এবং আইন অমান্যকারী প্রকৃতির লোক বটে।
    </p>
    <p class="indent-8">
      ২। ${data.motiveOrPreviousDispute || "বিবাদীগণের সহিত ফরিয়াদীর পূর্বশত্রুতা বিদ্যমান ছিল এবং বিবাদীগণ দীর্ঘদিন যাবৎ ফরিয়াদী ও তাহার পরিবারের ক্ষতি সাধনের ষড়যন্ত্র করিয়া আসিতেছিল।"}
    </p>
    <p class="indent-8">
      ৩। মূল ঘটনায় উল্লেখিত তারিখে আসামিগণ বেআইনি জনতাবদ্ধে মারাত্মক অস্ত্রে সজ্জিত হইয়া অনধিকার গৃহপ্রবেশপূর্বক প্রাণনাশের উদ্দেশ্যে আক্রমণ চালায় এবং ${data.injuriesAndMedical || "শরীরে মারাত্মক জখম সৃষ্টি ও বেদখল করে।"}
    </p>
    <p class="indent-8">
      ৪। আসামিগণ তাণ্ডব চালাইয়া নগদ অর্থ ও মালামাল লুটপাট করিয়া প্রায় ${lossFormatted} ক্ষতিসাধন করে।
    </p>
    <p class="indent-8">
      ৫। ঘটনার পর স্থানীয় থানায় এজাহার দায়েরের চেষ্টা করা হইলে থানা কর্তৃপক্ষ সরাসরি বিজ্ঞ আদালতে সি.আর. মোকদ্দমা দায়েরের পরামর্শ দেওয়ায় ফরিয়াদী অত্র বিজ্ঞ আদালতে আরজি পেশ করিতে বাধ্য হইলেন। নালিশি ঘটনা বিজ্ঞ আদালতের স্থানীয় এখতিয়ারাধীন বটে।
    </p>
  </div>

  <div class="my-6">
    <p class="font-bold underline mb-1">অতএব বিনীত প্রার্থনা:</p>
    <p class="indent-8 text-justify">
      অতএব, বিজ্ঞ আদালত সমীপে ফরিয়াদীর বিনীত প্রার্থনা এই যে, ন্যায়বিচারের স্বার্থে অত্র ফরিয়াদখানা আমলে গ্রহণ করিয়া আসামিগণের বিরুদ্ধে ${isNiActCase ? "দ্য নেগোশিয়েবল ইন্সট্রুমেন্টস অ্যাক্টের" : "দণ্ডবিধির"} <strong>${sections}</strong> ধারায় গ্রেপ্তারি পরোয়ানা (W/A) জারি করতঃ তাহাদেরকে জেল হাজতে আটক রাখিয়া বিচারান্তে উপযুক্ত শাস্তির আদেশ দানে বিজ্ঞ আদালতের সদয় মর্জি হয়।
    </p>
  </div>

  <div class="border-t pt-4 text-sm mt-8 flex justify-between">
    <div>
      <p class="font-bold">সাক্ষীদের নামের ফর্দ:</p>
      <p>১। ফরিয়াদী নিজে</p>
      <p>২। **[সাক্ষী ১-এর নাম ও ঠিকানা]**</p>
      <p>৩। সংশ্লিষ্ট সরকারি হাসপাতালের কর্তব্যরত ডাক্তার</p>
    </div>
    <div class="text-right">
      <p>ইতি, তারিখ: ${formatBangladeshDate()} ইং</p>
      <div class="h-10"></div>
      <p class="font-bold">ফরিয়াদীর স্বাক্ষর: ________________</p>
    </div>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
}

export function generateBailPetitionTemplate(data: TemplateData): string {
  const court = data.courtStation || "বিজ্ঞ দায়রা জজ আদালত / চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত";
  const dist = data.district || "ঢাকা";
  const comp = data.complainantName || "রাষ্ট্র / বাদী";
  const accused = (data.accusedList && data.accusedList[0]) || "**[আসামির নাম]**";
  const sections = data.applicableLaws && data.applicableLaws.length > 0
    ? data.applicableLaws.map(l => l.section).join("/")
    : "১৪৩/৪৪৮/৩২৩/৩২৫/৫০৬";

  return `
<div class="legal-doc bail-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto">
  <div class="text-center mb-6">
    <h2 class="text-lg font-bold">মোকাম বিজ্ঞ ${court}, ${dist}।</h2>
    <p class="text-sm font-semibold">ফৌজদারি মিস / জি.আর. / সি.আর. মামলা নং: ............ / ২০২৬ ইং</p>
    <p class="text-xs">ধারা: দণ্ডবিধি আইনের ${sections}</p>
  </div>

  <div class="border p-3 rounded mb-4 text-sm bg-gray-50">
    <p><strong>বাদী পক্ষ:</strong> ${comp} ...................................................... বাদী পক্ষ।</p>
    <p class="text-center font-bold text-gray-500 my-1">- বনাম -</p>
    <p><strong>আসামি পক্ষ:</strong> ${accused} (জেলহাজতে) ................................. আসামি পক্ষ।</p>
  </div>

  <div class="text-center font-bold underline mb-4">
    ফৌজদারি কার্যবিধি আইনের ৪৯৭/৪৯৮ ধারামতে আসামির জামিনের বিনীত প্রার্থনা।
  </div>

  <div class="space-y-3 text-justify text-sm">
    <p class="indent-8">
      বিনীত নিবেদন এই যে, অত্র মামলার আসামি সম্পূর্ণ নির্দোষ এবং ঘটনার সহিত কোনোভাবেই জড়িত নহেন। বাদীর সহিত পূর্বশত্রুতা ও ভুল বোঝাবুঝির বশবর্তী হইয়া অত্র মামলায় আসামিকে অন্যায়ভাবে জড়ানো হইয়াছে।
    </p>
    <p class="indent-8">
      ১। আসামি সমাজের একজন স্থায়ী ও সম্ভ্রান্ত নাগরিক। তাহার বিরুদ্ধে ইতিপূর্বে কোনো ফৌজদারি মামলা বা অপরাধের রেকর্ড নাই।
    </p>
    <p class="indent-8">
      ২। মামলার মূল ধারাগুলির অধিকাংশই জামিনযোগ্য এবং কোনো ধারা জামিন-অযোগ্য হইলেও এজাহারে আসামির বিরুদ্ধে সুনির্দিষ্ট কোনো গুরুতর প্রাণঘাতী আঘাতের ভূমিকা (Specific Overt Act) নাই।
    </p>
    <p class="indent-8">
      ৩। আসামি বিজ্ঞ আদালতের যে-কোনো শর্তে জামিন পাইলে জামিনের অপব্যবহার করিবেন না এবং নিয়মিত আদালতে হাজিরা প্রদান করিবেন। বিজ্ঞ আদালতের স্থানীয় যে-কোনো সম্মানিত নাগরিকের জামানতনামা দিতেও প্রস্তুত আছেন।
    </p>
  </div>

  <div class="my-6 text-sm">
    <p class="font-bold underline mb-1">অতএব প্রার্থনা:</p>
    <p class="indent-8 text-justify">
      অতএব, বিজ্ঞ আদালত সমীপে আসামিপক্ষের আকুল প্রার্থনা এই যে, উপরোক্ত সার্বিক দিক ও ন্যায়বিচারের স্বার্থ বিবেচনা করিয়া বিচার নিষ্পত্তি না হওয়া পর্যন্ত আসামিকে জামিনে মুক্তিদানে বিজ্ঞ আদালতের সদয় মর্জি হয়।
    </p>
  </div>

  <div class="text-right text-sm mt-8">
    <p>নিবেদক আসামিপক্ষে-</p>
    <div class="h-10"></div>
    <p class="font-bold">**[বিজ্ঞ আইনজীবী / অ্যাডভোকেট]**</p>
    <p>জেলা আইনজীবী সমিতি, ${dist}।</p>
    <p>তারিখ: ${formatBangladeshDate()}</p>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
}

export function generateCivilPlaintTemplate(data: TemplateData): string {
  const court = data.courtStation || "বিজ্ঞ সিনিয়র সহকারী জজ আদালত";
  const dist = data.district || "ঢাকা";
  const comp = data.complainantName || "**[বাদীর নাম]**";
  const accused = (data.accusedList && data.accusedList[0]) || "**[বিবাদীর নাম]**";

  return `
<div class="legal-doc plaint-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto">
  <div class="text-center mb-6">
    <h2 class="text-lg font-bold">মোকাম বিজ্ঞ ${court}, ${dist}।</h2>
    <p class="text-sm font-semibold">দেওয়ানি মোকদ্দমা নং: ............ / ২০২৬ ইং</p>
    <p class="text-xs">সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭ এর ধারা ৯/৪২ ও ৫৪ অনুযায়ী দখল পুনরুদ্ধার, স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞার আরজি।</p>
  </div>

  <div class="border p-4 rounded mb-6 text-sm bg-gray-50">
    <p><strong>বাদী:</strong> ${comp}, পিতা: **[পিতার নাম]**, সাং: **[ঠিকানা]** ... বাদী।</p>
    <p class="text-center font-bold text-gray-500 my-1">- বনাম -</p>
    <p><strong>বিবাদী:</strong> ${accused}, পিতা: **[পিতার নাম]**, সাং: **[ঠিকানা]** ... বিবাদী।</p>
  </div>

  <div class="space-y-3 text-justify text-sm">
    <p class="font-bold underline">বাদীর পক্ষে বিনীত আরজি এই যে:</p>
    <p class="indent-8">
      ১। নিম্ন তফসিল বর্ণিত নালিশি বসতবাড়ি বাদী বৈধ খরিদ ও উত্তরাধিকারসূত্রে মালিক হইয়া নিরবচ্ছিন্নভাবে ভোগদখল করিয়া আসিতেছিলেন।
    </p>
    <p class="indent-8">
      ২। বিবাদীগণ অন্যায় ও বেআইনিভাবে দলবল ও অবৈধ অস্ত্র সহযোগে প্রবেশ করিয়া বাদীকে বলপ্রয়োগে বেদখল করিয়াছে, যাহা সুনির্দিষ্ট প্রতিকার আইন ১৮৭৭ এর ধারা ৯ অনুযায়ী সম্পূর্ণ বেআইনি ও দণ্ডনীয়।
    </p>
    <p class="indent-8">
      ৩। মোকদ্দমার কারণের উদ্ভব: গত ${data.incidentDate || "**[তারিখ]**"} তারিখে বিবাদীগণ বেআইনিভাবে বাদীর জমিতে ও বসতঘরে অনুপ্রবেশ ও জবরদখল করায় অত্র মোকদ্দমার কারণের উদ্ভব হইয়াছে।
    </p>
  </div>

  <div class="my-6 text-sm">
    <p class="font-bold underline mb-1">অতএব প্রার্থনা:</p>
    <p class="indent-8 text-justify">
      অতএব, বিজ্ঞ আদালত সমীপে বাদীর বিনীত প্রার্থনা এই যে, তফসিল বর্ণিত নালিশি বসতবাড়িতে বাদীর বৈধ দখল পুনঃঅর্পণ করিবার আদেশ ও স্থায়ী নিষেধাজ্ঞার ডিক্রি দানে বিজ্ঞ আদালতের সদয় মর্জি হয়।
    </p>
  </div>

  <div class="border p-3 rounded text-sm bg-blue-50/50 mb-6">
    <p class="font-bold mb-1">নালিশি সম্পত্তির তফসিল:</p>
    <p>জেলা: ${dist}, থানা: **[থানার নাম]**, মৌজা: **[মৌজার নাম]**, খতিয়ান নং: **[খতিয়ান]**, দাগ নং: **[দাগ নম্বর]**, পরিমাণ: **[জমির পরিমাণ]** শতাংশ বসতভিটা।</p>
  </div>

  <div class="text-right text-sm">
    <p>বাদীর স্বাক্ষর: ____________________</p>
    <p>তারিখ: ${formatBangladeshDate()}</p>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
}

export function generateGdTemplate(data: TemplateData): string {
  const th = data.policeStation || "**[থানার নাম]**";
  const dist = data.district || "ঢাকা";
  const comp = data.complainantName || "**[আবেদনকারীর নাম]**";
  const compDetails = data.complainantDetails || "পিতা: **[পিতার নাম]**, সাং: **[ঠিকানা]**, থানা: " + th + ", জেলা: " + dist;

  const accused = (data.accusedList && data.accusedList[0]) || "**[বিবাদীর নাম ও পরিচিতি]**";
  const cleanAccused = accused.replace(/^[০-৯0-9]+[।\.\-\s]+/, "").trim();

  const isSmoking =
    (data.caseTitle && (data.caseTitle.includes("ধূমপান") || data.caseTitle.includes("সিগারেট") || data.caseTitle.includes("উপদ্রব"))) ||
    (data.injuriesAndMedical && data.injuriesAndMedical.includes("ধূমপান"));

  const isHumanitarian =
    (data.caseTitle && (data.caseTitle.includes("উদ্ধার") || data.caseTitle.includes("অজ্ঞান") || data.caseTitle.includes("বৃদ্ধ") || data.caseTitle.includes("মানবিক") || data.caseTitle.includes("মুমূর্ষু") || data.caseTitle.includes("জীবন রক্ষা"))) ||
    (data.motiveOrPreviousDispute && (data.motiveOrPreviousDispute.includes("উদ্ধার") || data.motiveOrPreviousDispute.includes("অজ্ঞান") || data.motiveOrPreviousDispute.includes("মানবিক") || data.motiveOrPreviousDispute.includes("অবহেলা"))) ||
    (data.injuriesAndMedical && (data.injuriesAndMedical.includes("অচেতন") || data.injuriesAndMedical.includes("অজ্ঞান") || data.injuriesAndMedical.includes("মুমূর্ষু")));

  if (isHumanitarian) {
    return `
<div class="legal-doc gd-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto shadow-sm">
  <div class="text-center font-bold text-lg mb-6 underline text-red-900">জরুরি উদ্ধার ও চিকিৎসা নিশ্চিতকরণে সাধারণ ডায়েরি (GD) আবেদন</div>

  <div class="mb-4">
    <p>বরাবর,</p>
    <p class="font-semibold">অফিসার ইনচার্জ (OC),</p>
    <p>${th} থানা, ${dist}।</p>
  </div>

  <div class="mb-4">
    <p class="font-semibold">বিষয়: ${data.incidentPlace || "রাস্তায়"} অচেতন ও মুমূর্ষু অবস্থায় পড়ে থাকা অজ্ঞাতনামা অসুস্থ বৃদ্ধের জীবন রক্ষা, উদ্ধার ও সরকারি হাসপাতালে চিকিৎসা নিশ্চিতকরণ সংক্রান্ত সাধারণ ডায়েরি (GD) আবেদন।</p>
  </div>

  <div class="mb-4">
    <p>জনাব,</p>
    <p class="indent-8 text-justify">
      বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী <strong>${comp}</strong>, ${compDetails} একজন সচেতন নাগরিক ও মানবতাবাদী হিসেবে জনস্বার্থে আপনার থানায় হাজির হইয়া এই মর্মে জরুরি সাধারণ ডায়েরি (GD) ভুক্তির জন্য লিখিত আবেদন দাখিল করিতেছি যে:
    </p>
  </div>

  <div class="bg-gray-50 border p-3 rounded mb-4 text-sm">
    <p><strong>বিপন্ন ব্যক্তির পরিচয়:</strong> পরিচয়হীন অজ্ঞাতনামা অসুস্থ বয়োবৃদ্ধ পুরুষ (আনুমানিক বয়স ৬৫-৭০ বছর)</p>
    <p><strong>ঘটনাস্থল:</strong> ${data.incidentPlace || "ময়মনসিংহের ব্রীজের মোড়ে প্রকাশ্য উন্মুক্ত স্থান"}</p>
    <p><strong>বিপন্ন থাকার সময়কাল:</strong> ${data.incidentDate || "বিগত দুই দিন যাবত চলমান"}</p>
  </div>

  <div class="space-y-3 text-justify mb-5">
    <p class="font-bold underline">বিবরণ:</p>
    <p class="indent-8">
      ১। ঘটনার প্রেক্ষাপট এই যে, উল্লেখিত ঘটনাস্থলে একজন বয়োবৃদ্ধ মানুষ বিগত দুই দিন যাবত মারাত্মক অসুস্থ ও অচেতন (অজ্ঞান) অবস্থায় প্রকাশ্য উন্মুক্ত স্থানে সহায়হীনভাবে পড়িয়া রহিয়াছেন।
    </p>
    <p class="indent-8">
      ২। উক্ত ব্যক্তির কোনো আত্মীয়-স্বজন বা অভিভাবক ঘটনাস্থলে উপস্থিত নাই এবং তিনি মুমূর্ষু অবস্থায় জীবন-মৃত্যুর সন্ধিক্ষণে দিনাতিপাত করিতেছেন। এ পর্যন্ত স্থানীয় কেউ বা কোনো দায়িত্বশীল কর্তৃপক্ষ কার্যকর উদ্ধার পদক্ষেপ গ্রহণ করে নাই।
    </p>
    <p class="indent-8">
      ৩। আইনগত ভিত্তি:
      (ক) গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের অনুচ্ছেদ ১৫ ও ৩২ অনুযায়ী অন্ন, বস্ত্র, চিকিৎসা ও জীবন রক্ষার অধিকার নাগরিকের অলঙ্ঘনীয় মৌলিক অধিকার।
      (খ) ফৌজদারি কার্যবিধি ১৮৯৮ এর ধারা ১০০ এবং পুলিশ রেগুলেশনস বেঙ্গল (PRB) বিধি ২৪৬ অনুযায়ী রাস্তায় বা উন্মুক্ত স্থানে বিপন্ন ও সহায়হীন ব্যক্তিকে উদ্ধার করিয়া হাসপাতালে প্রেরণ পুলিশের সুনির্দিষ্ট আইনগত দায়িত্ব।
      (গ) ভবঘুরে ও নিরাশ্রয় ব্যক্তি (পুনর্বাসন) আইন ২০১১ এর ধারা ৯ ও ১১ মোতাবেক সহায়হীন নিরাশ্রয় ব্যক্তিকে সরকারি হেফাজতে গ্রহণ, বিনামূল্যে সুচিকিৎসা ও নিরাপদ পুনর্বাসন নিশ্চিতকরণের সুস্পষ্ট বিধান রহিয়াছে।
      (ঘ) পরিচয় শনাক্তকরণ সাপেক্ষে পিতা-মাতার ভরণ-পোষণ আইন ২০১৩ এর ধারা ৩ ও ৫ অনুযায়ী কোনো স্বজন বা সন্তান কর্তৃক অবহেলা বা পরিত্যক্ত করার প্রমাণ পাওয়া গেলে আইনগত প্রতিকার গ্রহণ আবশ্যক।
    </p>
    <p class="indent-8">
      ৪। কালবিলম্ব হইলে উক্ত বয়োবৃদ্ধ ব্যক্তির প্রাণহানির মারাত্মক ঝুঁকি রহিয়াছে বিধায় মানবিক কারণে বিষয়টি সাধারণ ডায়েরিভুক্ত করিয়া জরুরি পুলিশি উদ্ধার দল প্রেরণ করা আবশ্যক।
    </p>
  </div>

  <div class="mb-6 text-justify">
    <p class="font-bold">অতএব প্রার্থনা:</p>
    <p class="indent-8">
      অতএব, মহোদয় সমীপে আকুল প্রার্থনা এই যে, উপরোক্ত মানবিক বিবরণটি আপনার থানার সাধারণ ডায়েরি (GD) বহিতে তাৎক্ষণিক লিপিবদ্ধ করতঃ জরুরি পুলিশ টিম ঘটনাস্থলে প্রেরণ করিয়া উক্ত বয়োবৃদ্ধ ব্যক্তিকে উদ্ধার এবং নিকটস্থ সরকারি মেডিকেল কলেজ হাসপাতালের সমাজসেবা ইউনিট বা জরুরি বিভাগে ভর্তিপূর্বক সুচিকিৎসার ত্বরিত ব্যবস্থা গ্রহণে আপনার সদয় মর্জি হয়।
    </p>
  </div>

  <div class="border-t pt-4 flex justify-between text-sm mt-8">
    <div>
      <p>সংযুক্ত: প্রত্যক্ষদর্শী সাক্ষীদের তালিকা ও জাতীয় জরুরি সেবা ৯৯৯ ট্র্যাকিং তথ্য</p>
    </div>
    <div class="text-right">
      <p>তারিখ: ${formatBangladeshDate()} ইং</p>
      <div class="h-10"></div>
      <p class="font-bold">নিবেদক (মানবিক আবেদনকারী),</p>
      <p>(${comp})</p>
      <p>মোবাইল: **[মোবাইল নম্বর]**</p>
    </div>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
  }

  return `
<div class="legal-doc gd-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto shadow-sm">
  <div class="text-center font-bold text-lg mb-6 underline">সাধারণ ডায়েরি (GD) করার আবেদন</div>

  <div class="mb-4">
    <p>বরাবর,</p>
    <p class="font-semibold">অফিসার ইনচার্জ (OC),</p>
    <p>${th} থানা, ${dist}।</p>
  </div>

  <div class="mb-4">
    <p class="font-semibold">বিষয়: সাধারণ ডায়েরি (GD) ভুক্তির আবেদন।</p>
  </div>

  <div class="mb-4">
    <p>জনাব,</p>
    <p class="indent-8 text-justify">
      বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী <strong>${comp}</strong>, ${compDetails} এই মর্মে আপনার থানায় হাজির হইয়া সাধারণ ডায়েরি (GD) ভুক্তির জন্য লিখিত বিবরণ দাখিল করিতেছি যে:
    </p>
  </div>

  <div class="bg-gray-50 border p-3 rounded mb-4 text-sm">
    <p><strong>বিবাদী / অভিযুক্ত ব্যক্তি:</strong> ${cleanAccused}</p>
    <p><strong>ঘটনার স্থান ও সময়:</strong> ${data.incidentPlace || "বাদীর বাসার বারান্দার সামনে"}, ${data.incidentDate || "প্রতিদিন চলমান"}</p>
  </div>

  <div class="space-y-3 text-justify mb-5">
    <p class="font-bold underline">বিবরণ:</p>
    ${
      isSmoking
        ? `
    <p class="indent-8">
      ১। বিবাদী ${cleanAccused} নিয়মিত বিরতিতে বাদীর বাসার বারান্দার সামনে আসিয়া প্রকাশ্যে ধূমপান করিয়া বিষাক্ত ধোঁয়া ও দুর্গন্ধ ছড়ায়।
    </p>
    <p class="indent-8">
      ২। এতে বাদীর পরিবারের অসুস্থ সদস্য, বয়োবৃদ্ধ ও শিশুদের স্বাস্থ্য মারাত্মক হুমকির সম্মুখীন হইতেছে এবং জনস্বাস্থ্যের ক্ষতি সাধন ও গণউপদ্রব সৃষ্টি হইতেছে।
    </p>
    <p class="indent-8">
      ৩। বাদী বারবার বিবাদীকে শান্তভাবে অনুরোধ ও নিষেধ করা সত্ত্বেও বিবাদী উক্ত বারণ উপেক্ষা করিয়া ঔদ্ধত্যপূর্ণ আচরণ ও শান্তি বিনষ্ট করিয়া চলিতেছে।
    </p>
    <p class="indent-8">
      ৪। বিষয়টি ভবিষ্যতে বড় ধরনের আইন-শৃঙ্খলা অবনতির আশঙ্কা সৃষ্টি করায় আইনগত ভবিষ্যৎ পদক্ষেপ ও রেকর্ড সংরক্ষণের স্বার্থে থানায় সাধারণ ডায়েরি (GD) করা আবশ্যক হইল।
    </p>
        `
        : `
    <p class="indent-8">
      ১। ঘটনার প্রেক্ষাপট এই যে, ${data.motiveOrPreviousDispute || (data.caseTitle ? `আবেদনকারীর অভিযোগের বিবরণ: ${data.caseTitle}` : "বিবাদী বা সংশ্লিষ্ট পক্ষ বেআইনিভাবে এলাকার শান্তিশৃঙ্খলা বিঘ্নিত করিয়া আসিতেছে।")}
    </p>
    <p class="indent-8">
      ২। ${data.injuriesAndMedical ? `অভিযোগের পরিণতি ও ক্ষতি: ${data.injuriesAndMedical}।` : "উল্লেখিত ঘটনার ফলে বাদী চরম নিরাপত্তাহীনতা ও ক্ষয়ক্ষতির সম্মুখীন হইতেছেন।"}
    </p>
    <p class="indent-8">
      ৩। ভবিষ্যতে কোনো রূপ অপ্রীতিকর ঘটনা ঘটিলে তার আইনগত দায়দায়িত্ব সংশ্লিষ্ট দায়ী ব্যক্তিদের উপর বর্তাইবে বিধায় ঘটনাটি সাধারণ ডায়েরিভুক্ত রাখা প্রয়োজন।
    </p>
        `
    }
  </div>

  <div class="mb-6 text-justify">
    <p class="font-bold">অতএব প্রার্থনা:</p>
    <p class="indent-8">
      অতএব, মহোদয় সমীপে বিনীত প্রার্থনা এই যে, উপরোক্ত বিবরণটি আপনার থানার সাধারণ ডায়েরি (GD) বহিতে লিপিবদ্ধ করতঃ প্রয়োজনীয় আইনানুগ অনুসন্ধান ও বিবাদীকে সতর্কীকরণের ব্যবস্থা গ্রহণে আপনার সদয় মর্জি হয়।
    </p>
  </div>

  <div class="border-t pt-4 flex justify-between text-sm mt-8">
    <div>
      <p>সংযুক্ত: প্রত্যক্ষদর্শী সাক্ষীদের তালিকা</p>
    </div>
    <div class="text-right">
      <p>তারিখ: ${formatBangladeshDate()} ইং</p>
      <div class="h-10"></div>
      <p class="font-bold">নিবেদক,</p>
      <p>(${comp})</p>
      <p>মোবাইল: **[মোবাইল নম্বর]**</p>
    </div>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
}

export function generateLegalNoticeTemplate(data: TemplateData): string {
  const dist = data.district || "ঢাকা";
  const comp = data.complainantName || "**[মক্কেলের নাম]**";
  const accused = (data.accusedList && data.accusedList[0]) || "**[প্রাপকের নাম]**";

  return `
<div class="legal-doc notice-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto shadow-sm">
  <div class="text-center mb-6">
    <h2 class="text-base font-bold text-red-900">রেজিস্ট্রি এডি ডাকযোগে প্রেরিত</h2>
    <h1 class="text-xl font-bold underline mt-1">আইনি নোটিশ (LEGAL NOTICE)</h1>
  </div>

  <div class="border p-3 rounded mb-4 text-sm bg-gray-50">
    <p><strong>প্রেরক (বিজ্ঞ আইনজীবী মারফত):</strong> ${comp}, সাং: **[ঠিকানা]**, জেলা: ${dist}।</p>
    <p class="my-1 font-semibold text-center text-slate-500">বনাম</p>
    <p><strong>প্রাপক:</strong> ${accused}, সাং: **[ঠিকানা]**, জেলা: ${dist}।</p>
  </div>

  <div class="space-y-3 text-justify text-sm">
    <p>জনাব,</p>
    <p class="indent-8">
      আমার উল্লেখিত মক্কেলের প্রদত্ত সুনির্দিষ্ট নির্দেশনা ও ক্ষমতাবলে আমি আপনাকে এই মর্মে আইনি নোটিশ প্রদান করিতেছি যে:
    </p>
    <p class="indent-8">
      ১। আপনি প্রাপক আমার মক্কেলের নিকট হইতে অর্থ গ্রহণ করিয়া অথবা নালিশি বিরোধে অন্যায় সুযোগ গ্রহণ করিয়া আইন অমান্য করিয়া আসিতেছেন।
    </p>
    <p class="indent-8">
      ২। আপনার এহেন কার্য দেশের প্রচলিত আইনের পরিপন্থী ও দণ্ডনীয় অপরাধ বটে, যাহার ফলে আমার মক্কেল অপূরণীয় আর্থিক ও মানসিক ক্ষতির সম্মুখীন হইয়াছেন।
    </p>
    <p class="indent-8">
      ৩। অতএব, অত্র লিগ্যাল নোটিশ প্রাপ্তির ৩০ (ত্রিশ) দিনের মধ্যে নালিশি দাবি ও দেনা পরিশোধ করিয়া বিষয়টির শান্তিপূর্ণ নিষ্পত্তি করিবেন। অন্যথায় আপনার বিরুদ্ধে বিজ্ঞ উপযুক্ত আদালতে দেওয়ানি ও ফৌজদারি মোকদ্দমা দায়ের করা হইবে।
    </p>
  </div>

  <div class="text-right text-sm mt-8">
    <p>আমার মক্কেলের পক্ষে ও নির্দেশে-</p>
    <div class="h-10"></div>
    <p class="font-bold">**[বিজ্ঞ অ্যাডভোকেট]**</p>
    <p>বাংলাদেশ সুপ্রিম কোর্ট / জেলা আইনজীবী সমিতি, ${dist}।</p>
    <p>তারিখ: ${formatBangladeshDate()}</p>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
}

export function generateAffidavitTemplate(data: TemplateData): string {
  const dist = data.district || "ঢাকা";
  const comp = data.complainantName || "**[হলফকারীর নাম]**";

  return `
<div class="legal-doc affidavit-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto shadow-sm">
  <div class="text-center mb-6">
    <h2 class="text-lg font-bold underline">হলফনামা (AFFIDAVIT)</h2>
    <p class="text-xs">প্রথম শ্রেণীর বিজ্ঞ ম্যাজিস্ট্রেট / নোটারি পাবলিক, বাংলাদেশ এর সম্মুখে</p>
  </div>

  <div class="space-y-3 text-justify text-sm">
    <p class="indent-8">
      আমি <strong>${comp}</strong>, পিতা: **[পিতার নাম]**, বয়স: **[বয়স]** বছর, জাতীয়তা: বাংলাদেশী (জন্মসূত্রে), ধর্ম: **[ধর্ম]**, পেশা: **[পেশা]**, সাং: **[ঠিকানা]**, জেলা: ${dist}—এই মর্মে শপথপূর্বক ঘোষণা করিতেছি যে:
    </p>
    <p class="indent-8">
      ১। আমি অত্র মোকদ্দমার বাদী/দরখাস্তকারী বটে এবং ঘটনার সার্বিক তথ্যাদি সম্পর্কে সম্যক অবগত রহিয়াছি।
    </p>
    <p class="indent-8">
      ২। অত্র দরখাস্তে উল্লেখিত যাবতীয় বিবরণ আমার জ্ঞান ও বিশ্বাসমতে সত্য এবং সঠিক। ইহাতে কোনো প্রকার অসত্য বা তথ্য গোপন করা হয় নাই।
    </p>
  </div>

  <div class="border-t pt-4 flex justify-between text-sm mt-8">
    <div>
      <p>অ্যাডভোকেট কর্তৃক সনাক্তকৃত</p>
      <div class="h-8"></div>
      <p class="font-bold">সনাক্তকারী অ্যাডভোকেট</p>
    </div>
    <div class="text-right">
      <p>হলফকারীর স্বাক্ষর: ____________________</p>
      <p>তারিখ: ${formatBangladeshDate()}</p>
    </div>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
}

export function generateVakalatnamaTemplate(data: TemplateData): string {
  const dist = data.district || "ঢাকা";
  const comp = data.complainantName || "**[মক্কেলের নাম]**";
  const accused = (data.accusedList && data.accusedList[0]) || "**[বিপক্ষ]**";

  return `
<div class="legal-doc vakalatnama-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto shadow-sm border">
  <div class="text-center mb-6">
    <h1 class="text-2xl font-bold tracking-wider">ওকালতনামা (VAKALATNAMA)</h1>
    <p class="text-sm font-semibold">মোকাম বিজ্ঞ আদালত, ${dist}।</p>
  </div>

  <div class="border p-3 rounded mb-4 text-xs bg-gray-50 flex justify-between">
    <div><strong>বাদী / আবেদনকারী:</strong> ${comp}</div>
    <div><strong>- বনাম -</strong></div>
    <div><strong>বিবাদী / আসামি:</strong> ${accused}</div>
  </div>

  <div class="space-y-2 text-xs text-justify leading-relaxed">
    <p class="indent-6">
      উক্ত মোকদ্দমায় আমার/আমাদের পক্ষে আইনানুগ কার্যক্রম পরিচালনা, আরজি দাখিল, জবাব পেশ, সাক্ষ্য প্রদান, আপোষনামা স্বাক্ষর এবং আদালত হইতে নকল ও অর্থ উত্তোলনের ক্ষমতা প্রদানপূর্বক বিজ্ঞ অ্যাডভোকেট মহোদয়কে নিযুক্ত করিলাম।
    </p>
    <p class="indent-6">
      আইনজীবীর কৃত সকল আইনানুগ কার্য আমার/আমাদের নিজ কৃত কার্যের ন্যায় গণ্য হইবে।
    </p>
  </div>

  <div class="grid grid-cols-2 gap-4 border-t pt-6 mt-8 text-xs">
    <div>
      <p class="font-bold">আমি নিয়োগ গ্রহণ করিলাম:</p>
      <div class="h-10"></div>
      <p>স্বাক্ষর: _________________________</p>
      <p class="font-semibold">বিজ্ঞ অ্যাডভোকেট</p>
      <p>সদস্য, জেলা আইনজীবী সমিতি, ${dist}।</p>
    </div>
    <div class="text-right">
      <p class="font-bold">মক্কেল / নির্বাহকের স্বাক্ষর বা টিপসহি:</p>
      <div class="h-10"></div>
      <p>স্বাক্ষর: _________________________</p>
      <p>নাম: ${comp}</p>
    </div>
  </div>

  ${MANDATORY_DISCLAIMER_HTML}
</div>
`;
}

export function generateDocumentByType(docType: DraftDocType, data: TemplateData): { titleBn: string; contentHtml: string } {
  let res: { titleBn: string; contentHtml: string };
  switch (docType) {
    case "FIR":
      res = { titleBn: "থানার এজাহার (FIR) খসড়া", contentHtml: generateFirTemplate(data) };
      break;
    case "GD": {
      const isHumanitarian =
        (data.caseTitle && (data.caseTitle.includes("উদ্ধার") || data.caseTitle.includes("অজ্ঞান") || data.caseTitle.includes("বৃদ্ধ") || data.caseTitle.includes("মানবিক") || data.caseTitle.includes("মুমূর্ষু"))) ||
        (data.motiveOrPreviousDispute && (data.motiveOrPreviousDispute.includes("উদ্ধার") || data.motiveOrPreviousDispute.includes("অজ্ঞান") || data.motiveOrPreviousDispute.includes("মানবিক") || data.motiveOrPreviousDispute.includes("অবহেলা")));
      res = {
        titleBn: isHumanitarian ? "জরুরি উদ্ধার ও চিকিৎসার ব্যবস্থা গ্রহণের জন্য থানায় মানবিক আবেদন (GD)" : "থানায় সাধারণ ডায়েরি (GD) আবেদন",
        contentHtml: generateGdTemplate(data),
      };
      break;
    }
    case "CR_PETITION":
      res = { titleBn: "বিজ্ঞ ম্যাজিস্ট্রেট আদালতে সি.আর. মামলার আরজি", contentHtml: generateCrPetitionTemplate(data) };
      break;
    case "BAIL_PETITION":
    case "ANTICIPATORY_BAIL":
      res = { titleBn: "জামিনের আবেদন (CrPC ৪৯৭/৪৯৮)", contentHtml: generateBailPetitionTemplate(data) };
      break;
    case "PLAINT":
    case "INJUNCTION_PERMANENT":
      res = { titleBn: "দেওয়ানি আরজি (Plaint)", contentHtml: generateCivilPlaintTemplate(data) };
      break;
    case "INJUNCTION_TEMP":
      res = {
        titleBn: "অস্থায়ী নিষেধাজ্ঞার আবেদন (Order 39 Rule 1-2 CPC)",
        contentHtml: generateCivilPlaintTemplate(data),
      };
      break;
    case "LEGAL_NOTICE":
      res = { titleBn: "রেজিস্ট্রি এডি ডাকযোগে আইনি নোটিশ", contentHtml: generateLegalNoticeTemplate(data) };
      break;
    case "AFFIDAVIT":
      res = { titleBn: "বিজ্ঞ আদালতে হলফনামা (Affidavit)", contentHtml: generateAffidavitTemplate(data) };
      break;
    case "VAKALATNAMA":
      res = { titleBn: "আইনজীবীর ওকালতনামা ফরম", contentHtml: generateVakalatnamaTemplate(data) };
      break;
    case "TIME_PETITION":
      res = { titleBn: "সময়ের আবেদন (Time Petition)", contentHtml: generateBailPetitionTemplate(data) };
      break;
    case "NARAJI":
      res = { titleBn: "নারাজি পিটিশন (Naraji Petition)", contentHtml: generateCrPetitionTemplate(data) };
      break;
    default:
      res = { titleBn: `${docType} খসড়া`, contentHtml: generateFirTemplate(data) };
      break;
  }
  const checked = verifyCitations(res.contentHtml);
  return {
    titleBn: res.titleBn,
    contentHtml: checked.verifiedHtml,
  };
}
