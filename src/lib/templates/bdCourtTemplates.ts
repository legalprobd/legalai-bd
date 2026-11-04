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
  const unknown = (!hasUnknownInList && data.unknownAccusedCount)
    ? `সহ অজ্ঞাতনামা আরও ${data.unknownAccusedCount} জন।`
    : (!hasUnknownInList ? "সহ অজ্ঞাতনামা আরও ৪/৫ জন।" : "");
  
  const penalSections: string[] = [];
  let hasArmsAct = false;
  let hasSrAct = false;

  (data.applicableLaws || []).forEach((l) => {
    const s = l.section;
    if (s.includes("19") || s.includes("১৯") || s.includes("arms")) {
      hasArmsAct = true;
    } else if (s.includes("sr") || s.includes("৯")) {
      hasSrAct = true;
    } else {
      penalSections.push(s);
    }
  });

  let sectionsDisplay = penalSections.length > 0 ? `দণ্ডবিধি আইনের ${penalSections.join("/")} ধারা` : "দণ্ডবিধি আইনের ১৪৩/১৪৮/৪৪৮/৪৫২/৫০৬/৩৪ ধারা";
  if (hasArmsAct) {
    sectionsDisplay += " এবং অস্ত্র আইন, ১৮৭৮ এর ১৯(ক) ধারা";
  }
  if (hasSrAct) {
    sectionsDisplay += " এবং সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭ এর ৯ ধারা";
  }

  const weapons = data.weaponsUsed && data.weaponsUsed.length > 0
    ? data.weaponsUsed.join(", ")
    : "অবৈধ আগ্নেয়াস্ত্র ও মারাত্মক দেশীয় অস্ত্র";

  const witnessStr = data.witnesses && data.witnesses.length > 0
    ? data.witnesses.map((w, idx) => {
        const cleanWitness = w.replace(/^[০-৯0-9]+[।\.\-\s]+/, "").trim();
        return `${idx + 1}। ${cleanWitness}`;
      }).join("<br/>")
    : "১। ফরিয়াদী নিজে<br/>২। **[সাক্ষী ১-এর নাম, পিতা ও ঠিকানা]**<br/>৩। **[সাক্ষী ২-এর নাম ও ঠিকানা]**";

  const lossFormatted = (data.totalFinancialLoss || "১,৫০,০০০/- টাকা")
    .replace(/টাকা.*$/, "")
    .trim() + " টাকা";

  // Check if case is about armed land grab / home takeover
  const isArmedTakeover =
    weapons.includes("পিস্তল") ||
    weapons.includes("রিভলবার") ||
    weapons.includes("রিভলভার") ||
    weapons.includes("আগ্নেয়াস্ত্র") ||
    weapons.includes("আগ্নেয়াস্ত্র") ||
    (data.motiveOrPreviousDispute && data.motiveOrPreviousDispute.includes("দখল")) ||
    (data.injuriesAndMedical && (data.injuriesAndMedical.includes("বের করিয়া") || data.injuriesAndMedical.includes("প্রবেশ করিতে অপারগ")));

  return `
<div class="legal-doc fir-doc font-serif leading-relaxed text-gray-900 p-8 bg-white max-w-4xl mx-auto">
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
    <p class="font-bold mb-2">আসামিগণের নাম ও ঠিকানা:</p>
    <div class="pl-4">${accusedListStr}</div>
    ${unknown ? `<p class="mt-2 text-sm text-gray-700 italic">${unknown}</p>` : ""}
  </div>

  <div class="bg-blue-50/70 p-3 rounded mb-5 text-sm border border-blue-200">
    <p><strong>ঘটনার তারিখ ও সময়:</strong> ${data.incidentDate || "ইং **[তারিখ]** তারিখ, সময় রাত্রি আনুমানিক **[সময়]** ঘটিকা।"}</p>
    <p><strong>ঘটনাস্থল:</strong> ${data.incidentPlace || "বাদীর নিজ বসতবাড়ির প্রাঙ্গণে ও ঘরের ভিতরে।"}</p>
    <p><strong>ধারা:</strong> ${sectionsDisplay}।</p>
  </div>

  <div class="mb-5 space-y-3 text-justify">
    <p class="font-bold underline">ঘটনার বিস্তারিত বিবরণ:</p>
    <p class="indent-8">
      ১। ঘটনার প্রেক্ষাপট এই যে, ${data.motiveOrPreviousDispute || "বিবাদীগণের সহিত বাদীর বিরোধের জের ধরিয়া বিবাদীগণ দীর্ঘদিন যাবৎ বাদীর বসতবাড়ি দখল ও ক্ষতির ষড়যন্ত্র করিয়া আসিতেছিল।"}
    </p>
    <p class="indent-8">
      ২। উল্লিখিত তারিখ ও সময়ে চিহ্নিত ও অজ্ঞাতনামা আসামিগণ বেআইনি জনতাবদ্ধে পূর্বপরিকল্পিতভাবে মারাত্মক অস্ত্রে সজ্জিত হইয়া যেমন- <strong>${weapons}</strong> সহযোগে অনধিকার বাদীর বসতবাড়ির সীমানায় ও ঘরের মধ্যে অনুপ্রবেশ করে।
    </p>
    ${
      isArmedTakeover
        ? `<p class="indent-8">
      ৩। আসামিরা হাতে থাকা <strong>${weapons}</strong> প্রদর্শন করিয়া বাদী ও পরিবারের সদস্যদের লক্ষ্য করিয়া প্রাণনাশের প্রকাশ্য হুমকি দেয় এবং ভীতি প্রদর্শন করিয়া বসতবাড়ি হইতে জোরপূর্বক বেদখল করে। আসামিরা ঘরে থাকা মূল্যবান মালামাল নিয়ন্ত্রণে লইয়া বাদীকে নিজ বসতবাড়িতে প্রবেশের পথ স্থায়ীভাবে রুদ্ধ করিয়া দেয়।
    </p>`
        : `<p class="indent-8">
      ৩। বাদীর ভাই/পরিবারের সদস্য ঘর হইতে বাহির হইয়া প্রতিবাদ করিলে আসামিরা তাহাকে ঘিরিয়া ফেলে এবং হত্যার উদ্দেশ্যে শরীরের স্পর্শকাতর অঙ্গ লক্ষ্য করিয়া আঘাত করে। ফলে ${data.injuriesAndMedical || "আহত ব্যক্তি মাথায় গুরুতর রক্তাক্ত জখম প্রাপ্ত হইয়া মাটিতে লুটিয়ে পড়েন।"}
    </p>`
    }
    <p class="indent-8">
      ৪। এই তাণ্ডবের সুযোগে আসামিগণ ঘরের আসবাবপত্র ভাঙচুর ও মূল্যবান জিনিসপত্র লুণ্ঠন করে (${data.stolenOrDamagedItems || "নগদ টাকা ও আসবাবপত্র"}) এবং প্রায় <strong>${lossFormatted}</strong> অপূরণীয় ক্ষতিসাধন করে।
    </p>
    <p class="indent-8">
      ৫। বাদী ও পরিবারের চিৎকারে আশপাশের প্রত্যক্ষদর্শী সাক্ষীগণ আগাইয়া আসিলে আসামিরা ফাঁকা গুলি ও প্রাণনাশের চরম হুমকি প্রদর্শন করিয়া ত্রাস সৃষ্টি করে স্থান ত্যাগ করে।
    </p>
    <p class="indent-8">
      ৬। <strong>বিলম্বের কারণ:</strong> ঘটনার আকস্মিকতায় চরম নিরাপত্তাহীনতায় ভোগায়, আত্মীয়-স্বজন ও গণ্যমান্য ব্যক্তিবর্গের সহিত পরামর্শক্রমে থানায় আসিয়া লিখিত এজাহার দায়ের করিতে সামান্য বিলম্ব হইল।
    </p>
  </div>

  <div class="mb-6 text-justify">
    <p class="font-bold">অতএব প্রার্থনা:</p>
    <p class="indent-8">
      অতএব, মহোদয় সমীপে আমার আকুল প্রার্থনা এই যে, উপরোক্ত ঘটনা সরেজমিনে তদন্তপূর্বক <strong>${sectionsDisplay}</strong> মোতাবেক এজাহার হিসেবে গ্রহণ করিয়া নিয়মিত মামলা রুজু করত আসামিদের দ্রুত গ্রেপ্তার, অবৈধ অস্ত্র উদ্ধার এবং দখল পুনরুদ্ধারে আপনার সদয় মর্জি হয়।
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

export function generateDocumentByType(docType: DraftDocType, data: TemplateData): { titleBn: string; contentHtml: string } {
  let res: { titleBn: string; contentHtml: string };
  switch (docType) {
    case "FIR":
      res = { titleBn: "থানার এজাহার (FIR) খসড়া", contentHtml: generateFirTemplate(data) };
      break;
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
