/**
 * LegalAI BD - Court Daily Essentials & TR-4 Challan Templates
 * Authentic Bangladesh Court & Treasury Formats
 */

// Bengali digit conversion
export const toBengaliDigits = (num: number | string): string => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
};

const bnUnits = [
  "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
  "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "উনিশ", "বিশ",
  "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আঠাশ", "ঊনত্রিশ", "ত্রিশ",
  "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ",
  "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ",
  "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট",
  "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর",
  "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি",
  "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "অষ্টআশি", "ঊননব্বই", "নব্বই",
  "একানব্বই", "বানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
];

export function numberToBengaliWords(amount: number): string {
  if (isNaN(amount) || amount === 0) return "শূন্য টাকা মাত্র";
  if (amount < 0) return "মাইনাস " + numberToBengaliWords(Math.abs(amount));

  const integerPart = Math.floor(amount);
  const paisaPart = Math.round((amount - integerPart) * 100);

  let n = integerPart;
  const parts: string[] = [];

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  const hundred = Math.floor(n / 100);
  const remainder = n % 100;

  if (crore > 0) {
    parts.push(numberToBengaliWords(crore).replace(" টাকা মাত্র", "") + " কোটি");
  }
  if (lakh > 0) {
    parts.push((bnUnits[lakh] || String(lakh)) + " লক্ষ");
  }
  if (thousand > 0) {
    parts.push((bnUnits[thousand] || String(thousand)) + " হাজার");
  }
  if (hundred > 0) {
    parts.push((bnUnits[hundred] || String(hundred)) + " শত");
  }
  if (remainder > 0) {
    parts.push(bnUnits[remainder] || String(remainder));
  }

  let result = parts.join(" ") + " টাকা মাত্র";
  if (paisaPart > 0) {
    result += ` এবং ${bnUnits[paisaPart] || paisaPart} পয়সা`;
  }

  return result.trim();
}

// -------------------------------------------------------------
// 1. HAZIRA SLIP (হাজিরা স্লিপ)
// -------------------------------------------------------------
export interface HaziraSlipData {
  courtName: string;
  caseNo: string;
  sections?: string;
  complainantName: string;
  accusedList: Array<{
    name: string;
    status: "HAZIR" | "IN_CUSTODY" | "TIME_PRAYED";
    remarks?: string;
  }>;
  hearingDate: string;
  advocateName: string;
  advocateBarReg: string;
  chamberName?: string;
}

export function generateHaziraSlipHtml(data: HaziraSlipData): string {
  const rows = data.accusedList.map((acc, idx) => {
    const statusBn =
      acc.status === "HAZIR"
        ? "হাজির"
        : acc.status === "IN_CUSTODY"
        ? "জেল হাজতে"
        : "সময় প্রার্থনা";
    return `
      <tr class="border-b border-slate-300">
        <td class="p-2 text-center text-xs font-semibold">${toBengaliDigits(idx + 1)}</td>
        <td class="p-2 text-xs font-medium">${acc.name}</td>
        <td class="p-2 text-center text-xs font-semibold ${
          acc.status === "HAZIR" ? "text-emerald-700" : "text-amber-700"
        }">${statusBn}</td>
        <td class="p-2 text-xs text-slate-600">${acc.remarks || "-"}</td>
      </tr>
    `;
  }).join("");

  return `
<div class="legal-doc hazira-slip-doc font-serif bg-white text-slate-900 p-8 max-w-2xl mx-auto border border-slate-300 shadow-sm print:m-0 print:border-none print:shadow-none print:w-full">
  <div class="text-center border-b-2 border-slate-900 pb-4 mb-4">
    <h2 class="text-lg font-bold">মোকাম: ${data.courtName}</h2>
    <h1 class="text-xl font-extrabold mt-1 tracking-wide underline decoration-double">আসামির হাজিরার স্লিপ</h1>
  </div>

  <div class="grid grid-cols-2 gap-2 text-xs mb-4">
    <div><span class="font-bold">মামলা নং:</span> ${data.caseNo}</div>
    <div class="text-right"><span class="font-bold">ধার্য তারিখ:</span> ${data.hearingDate}</div>
    <div><span class="font-bold">বাদী / রাষ্ট্র:</span> ${data.complainantName}</div>
    <div class="text-right"><span class="font-bold">ধারা:</span> ${data.sections || "দণ্ডবিধি আইন"}</div>
  </div>

  <table class="w-full border-collapse border border-slate-400 mb-6">
    <thead>
      <tr class="bg-slate-100 border-b border-slate-400 text-xs text-slate-800">
        <th class="p-2 border-r border-slate-300 w-12 text-center">ক্র. নং</th>
        <th class="p-2 border-r border-slate-300 text-left">হাজিরান আসামির নাম</th>
        <th class="p-2 border-r border-slate-300 w-28 text-center">বর্তমান অবস্থা</th>
        <th class="p-2 text-left">মন্তব্য</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="mt-8 flex justify-between items-end text-xs pt-6">
    <div class="text-left text-slate-600">
      <p>তারিখ: ${data.hearingDate}</p>
      <p class="text-[11px]">স্বাক্ষরিত হাজিরা স্লিপ সরাসরি বেঞ্চ সহকারীর নিকট দাখিলযোগ্য।</p>
    </div>
    <div class="text-center">
      <div class="w-48 border-t border-slate-800 pt-1.5 font-bold">
        ${data.advocateName}
      </div>
      <p class="text-[11px] text-slate-700">বিজ্ঞ অ্যাডভোকেট</p>
      <p class="text-[11px] text-slate-600">বাংলাদেশ বার কাউন্সিল সনদ নং: ${data.advocateBarReg || "তথ্য নাই"}</p>
      ${data.chamberName ? `<p class="text-[10px] text-slate-500">${data.chamberName}</p>` : ""}
    </div>
  </div>
</div>
  `.trim();
}

// -------------------------------------------------------------
// 2. TIME PETITION (সময় প্রার্থনার দরখাস্ত)
// -------------------------------------------------------------
export interface TimePetitionData {
  courtName: string;
  caseNo: string;
  caseType: "CRIMINAL" | "CIVIL";
  sectionOrOrder?: string;
  complainantName: string;
  accusedOrOppositeParty: string;
  previousHearingDate: string;
  nextHearingDateRequested?: string;
  reasonsBn: string;
  stageBn: string; // e.g. চার্জ গঠন / সাক্ষ্য গ্রহণ / যুক্তিতর্ক
  advocateName: string;
  advocateBarReg: string;
  petitionerSide: "বাদী পক্ষ" | "বিবাদী / আসামি পক্ষ";
  petitionDate?: string;
}

export function generateTimePetitionHtml(data: TimePetitionData): string {
  const legalSection =
    data.sectionOrOrder ||
    (data.caseType === "CRIMINAL"
      ? "ফৌজদারি কার্যবিধি আইনের ৩৪৪ ধারা"
      : "দেওয়ানি কার্যবিধির ১৭ আদেশ ১ নিয়ম");

  return `
<div class="legal-doc time-petition-doc font-serif bg-white text-slate-900 p-8 max-w-3xl mx-auto border border-slate-300 shadow-sm print:m-0 print:border-none print:shadow-none print:w-full leading-relaxed">
  <div class="text-center mb-6">
    <h2 class="text-base font-bold">মোকাম: বিজ্ঞ ${data.courtName}</h2>
    <div class="mt-1 font-bold text-sm">মামলা নং: ${data.caseNo}</div>
  </div>

  <div class="border border-slate-200 p-3 rounded-lg mb-4 text-xs bg-slate-50 space-y-1">
    <div class="flex justify-between">
      <span><strong>দরখাস্তকারী:</strong> ${data.petitionerSide} (${data.petitionerSide === "বাদী পক্ষ" ? data.complainantName : data.accusedOrOppositeParty})</span>
      <span class="font-bold text-slate-600">-- বনাম --</span>
      <span><strong>অপরপক্ষ:</strong> ${data.petitionerSide === "বাদী পক্ষ" ? data.accusedOrOppositeParty : data.complainantName}</span>
    </div>
  </div>

  <div class="text-center my-4 font-bold text-sm underline underline-offset-4">
    বিষয়: ${legalSection} মতে শুনানির জন্য যুক্তিসঙ্গত সময়ের প্রার্থনা।
  </div>

  <div class="text-xs space-y-3 text-justify leading-relaxed indent-6">
    <p>
      বিনীত নিবেদন এই যে, উপরিউক্ত মামলাটি অদ্য বিজ্ঞ আদালতে <strong>${data.stageBn || "শুনানি/পদক্ষেপ"}</strong> এর জন্য ধার্য রহিয়াছে। পূর্ববর্তী ধার্য তারিখ ছিল <strong>${data.previousHearingDate}</strong>।
    </p>

    <p>
      কিন্তু অত্যন্ত সঙ্গত কারণে অদ্য দরখাস্তকারী পক্ষের নিম্নবর্ণিত অপরিহার্য কারণে পরবর্তী ধার্য তারিখ গ্রহণ করা আবশ্যক হইয়া পড়িয়াছে:
    </p>

    <div class="p-3 bg-amber-50/50 border-l-4 border-amber-400 rounded text-slate-800 text-xs italic indent-0">
      "${data.reasonsBn}"
    </div>

    <p>
      এমতাবস্থায়, অদ্য মামলার কার্যক্রম পরিচালনা করা সম্ভব হইতেছে না। অত্র সময় প্রার্থনা দরখাস্তটি কোনো মামলা বিলম্বিত করার উদ্দেশ্যে দাখিল করা হয় নাই; বরং ন্যায়বিচারের স্বার্থে ও দরখাস্তকারীর আইনগত অধিকার অক্ষুণ্ণ রাখিবার স্বার্থে দাখিল করা হইল।
    </p>

    <p class="indent-0 font-bold mt-4">
      অতএব, বিনীত প্রার্থনা এই যে, উপরোক্ত সার্বিক অবস্থা বিবেচনাপূর্বক সুবিচারের স্বার্থে অদ্য মামলার শুনানি মুলতবি রাখিয়া পরবর্তী যেকোনো সুবিধাজনক তারিখে সময় মঞ্জুর করিতে বিজ্ঞ আদালতের সদয় মর্জি হয়।
    </p>
  </div>

  <div class="mt-10 flex justify-between items-end text-xs pt-4 border-t border-slate-200">
    <div>
      <p class="font-semibold">তারিখ: ${data.petitionDate || "আজকের তারিখ"}</p>
      <p class="text-slate-500 text-[11px]">আইনজীবী মারফত প্রস্তুতকৃত ও উপস্থাপিত</p>
    </div>
    <div class="text-center">
      <div class="w-48 border-t border-slate-800 pt-1 font-bold">
        ${data.advocateName}
      </div>
      <p class="text-[11px] text-slate-700">বিজ্ঞ অ্যাডভোকেট</p>
      <p class="text-[11px] text-slate-600">বার কাউন্সিল সনদ নং: ${data.advocateBarReg || "তথ্য নাই"}</p>
      <p class="text-[11px] text-slate-500">দরখাস্তকারী পক্ষে বিজ্ঞ কৌঁসুলি</p>
    </div>
  </div>
</div>
  `.trim();
}

// -------------------------------------------------------------
// 3. VAKALATNAMA (ওকালতনামা)
// -------------------------------------------------------------
export interface VakalatnamaData {
  courtName: string;
  caseNo: string;
  complainantName: string;
  accusedOrOppositeParty: string;
  appointingParty: string; // বাদী / বিবাদী
  advocateName: string;
  advocateBarReg: string;
  advocateChamber: string;
  advocateMobile?: string;
  dateStr?: string;
}

export function generateVakalatnamaFullHtml(data: VakalatnamaData): string {
  return `
<div class="legal-doc vakalatnama-doc font-serif bg-white text-slate-900 p-8 max-w-3xl mx-auto border border-slate-300 shadow-sm print:m-0 print:border-none print:shadow-none print:w-full leading-relaxed">
  <div class="text-center border-b pb-3 mb-4">
    <h1 class="text-xl font-bold tracking-wider">ওকালতনামা (VAKALATNAMA)</h1>
    <h2 class="text-sm font-semibold mt-1">মোকাম: বিজ্ঞ ${data.courtName}</h2>
    <div class="text-xs font-medium text-slate-700 mt-1">মামলা নং: ${data.caseNo}</div>
  </div>

  <div class="grid grid-cols-2 gap-2 text-xs border border-slate-200 p-3 rounded-lg mb-4 bg-slate-50">
    <div><strong>বাদী / দরখাস্তকারী:</strong> ${data.complainantName}</div>
    <div class="text-right"><strong>বিবাদী / আসামি:</strong> ${data.accusedOrOppositeParty}</div>
    <div class="col-span-2 text-center text-slate-600 text-[11px]">নিয়োগকারী পক্ষ: <strong>${data.appointingParty}</strong></div>
  </div>

  <div class="text-xs space-y-3 text-justify leading-relaxed">
    <p class="indent-6">
      আমি/আমরা নিম্নস্বাক্ষরকারী মোকদ্দমার <strong>${data.appointingParty}</strong> হইয়া অত্র মোকদ্দমার যাবতীয় কার্য সম্পাদন, আরজি বা জবাব দাখিল, এফিডেভিট স্বাক্ষর, দলিলপত্র দাখিল ও প্রত্যাহার, সাক্ষী উপস্থাপন, জেরা ও যুক্তিতর্ক পেশ, আপোষ-মীমাংসার সম্মতি জ্ঞাপন এবং আদালত হইতে অর্থ বা জামানত প্রত্যাহারের আইনানুগ ক্ষমতা প্রদানপূর্বক বিজ্ঞ অ্যাডভোকেট <strong>${data.advocateName}</strong> (বার কাউন্সিল সনদ নং: ${data.advocateBarReg}) মহোদয়কে আমার/আমাদের পক্ষে বিজ্ঞ আইনজীবী নিযুক্ত করিলাম।
    </p>
    <p class="indent-6">
      বিজ্ঞ আইনজীবীর কৃত যাবতীয় আইনসংগত কার্যক্রম আমার/আমাদের নিজ কৃত কার্যের ন্যায় সর্বতোভাবে গণ্য ও মান্য হইবে। ইহাতে আমি বা আমার ওয়ারিশগণ কোনোপ্রকার ওজর-আপত্তি করিতে পারিব না।
    </p>
  </div>

  <div class="grid grid-cols-2 gap-6 mt-12 pt-6 border-t border-slate-300 text-xs">
    <div class="border-r border-slate-200 pr-4">
      <p class="font-bold text-slate-900 mb-2">আমি ওকালতনামা গ্রহণ করিলাম:</p>
      <div class="h-10"></div>
      <p class="border-t border-slate-700 pt-1 font-bold">${data.advocateName}</p>
      <p class="text-[11px] text-slate-700">বিজ্ঞ অ্যাডভোকেট</p>
      <p class="text-[11px] text-slate-600">বার কাউন্সিল আইডি: ${data.advocateBarReg}</p>
      <p class="text-[11px] text-slate-500">${data.advocateChamber}</p>
      ${data.advocateMobile ? `<p class="text-[11px] text-slate-500">মোবাইল: ${data.advocateMobile}</p>` : ""}
    </div>

    <div class="text-right pl-4">
      <p class="font-bold text-slate-900 mb-2">মক্কেল / নিয়োগকারীর স্বাক্ষর বা টিপসহি:</p>
      <div class="h-10"></div>
      <p class="border-t border-slate-700 pt-1 font-bold">স্বাক্ষর: _________________________</p>
      <p class="text-[11px] text-slate-700">নাম: ${data.appointingParty === "বাদী" ? data.complainantName : data.accusedOrOppositeParty}</p>
      <p class="text-[11px] text-slate-500">তারিখ: ${data.dateStr || new Date().toLocaleDateString("bn-BD")}</p>
    </div>
  </div>
</div>
  `.trim();
}

// -------------------------------------------------------------
// 4. TR-4 TREASURY CHALLAN (টি.আর. ৪ চালান ফরম)
// Bangladesh Treasury Rules Form No. TR-4 (See Rule 92)
// -------------------------------------------------------------
export interface TR4ChallanData {
  headOfAccount: string; // e.g. 1-40-801, 1-1101-0025-2681
  courtName: string;
  district: string;
  bankBranch: string; // সোনালী ব্যাংক লিমিটেড / বাংলাদেশ ব্যাংক শাখা
  depositorName: string;
  depositorAddress: string;
  onBehalfOfName: string;
  caseNo: string;
  purpose: string; // কোর্ট ফি / খোরপোশ / জরিমানা / প্রসেস ফি ইত্যাদি
  amount: number;
  dateStr?: string;
}

export function generateTR4ChallanHtml(data: TR4ChallanData): string {
  const amountInWords = numberToBengaliWords(data.amount);
  const amountBn = toBengaliDigits(data.amount.toFixed(2));

  // TR-4 consists of multiple identical copies (১ম খণ্ড - জমাকারীর কপি, ২য় খণ্ড - সংশ্লিষ্ট দপ্তরের কপি)
  // We render a standard official multi-column table format for TR-4.
  return `
<div class="tr4-challan-container font-serif bg-white text-slate-900 p-6 max-w-4xl mx-auto border border-slate-300 shadow-sm print:m-0 print:border-none print:shadow-none print:w-full">
  <!-- Header -->
  <div class="text-center border-b-2 border-slate-900 pb-3 mb-4">
    <div class="flex justify-between items-center text-xs font-semibold text-slate-700">
      <span>বাংলাদেশ ফরম নং টি. আর. ৪</span>
      <span class="text-sm font-bold text-slate-900">চালান ফরম (CHALLAN FORM)</span>
      <span>(বিধি ৯২ দ্রষ্টব্য)</span>
    </div>
    <div class="mt-2 text-xs">
      <strong>ব্যাংক / ট্রেজারির নাম:</strong> ${data.bankBranch || "সোনালী ব্যাংক লিমিটেড, জেলা শাখা"}
    </div>
    <div class="text-xs mt-1">
      <strong>মোকাম:</strong> ${data.courtName}, ${data.district}
    </div>
  </div>

  <!-- Economic / Account Head -->
  <div class="bg-slate-100 p-2.5 rounded border border-slate-300 mb-4 text-xs font-semibold flex items-center justify-between">
    <div>
      <span class="text-slate-600">হিসাব কোড / হেড অফ অ্যাকাউন্ট (Head of Account):</span>
      <span class="ml-2 font-mono text-sm tracking-widest font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
        ${data.headOfAccount || "১-৪০-৮০১ (কোর্ট ফি)"}
      </span>
    </div>
    <div class="text-slate-700">
      তারিখ: <strong>${data.dateStr || "আজকের তারিখ"}</strong>
    </div>
  </div>

  <!-- Main TR-4 5-Column Table -->
  <table class="w-full border-collapse border border-slate-500 text-xs mb-4">
    <thead>
      <tr class="bg-slate-100 border-b border-slate-500 text-slate-900 text-center font-bold">
        <th class="border-r border-slate-400 p-2 w-1/5">যাহার মারফত টাকা দেওয়া হইল (নাম ও ঠিকানা)</th>
        <th class="border-r border-slate-400 p-2 w-1/5">ব্যক্তি বা প্রতিষ্ঠানের নাম ও ঠিকানা যাহার বাবদ টাকা জমা দেওয়া হইল</th>
        <th class="border-r border-slate-400 p-2 w-2/5">জমার কারণ ও মামলা নম্বর (মামলার পক্ষগণ ও বিবরণ)</th>
        <th class="p-2 w-1/5" colspan="2">পরিমাণ</th>
      </tr>
      <tr class="bg-slate-50 border-b border-slate-400 text-center text-[11px] text-slate-700">
        <th class="border-r border-slate-400 p-1">১</th>
        <th class="border-r border-slate-400 p-1">২</th>
        <th class="border-r border-slate-400 p-1">৩</th>
        <th class="border-r border-slate-400 p-1 w-20">টাকা</th>
        <th class="p-1 w-12">পয়সা</th>
      </tr>
    </thead>
    <tbody>
      <tr class="align-top border-b border-slate-400 min-h-[140px]">
        <td class="border-r border-slate-400 p-2.5">
          <p class="font-semibold text-slate-900">${data.depositorName}</p>
          <p class="text-[11px] text-slate-600 mt-1">${data.depositorAddress}</p>
        </td>
        <td class="border-r border-slate-400 p-2.5">
          <p class="font-semibold text-slate-900">${data.onBehalfOfName || data.depositorName}</p>
          <p class="text-[11px] text-slate-600 mt-1">মোকাম: ${data.courtName}</p>
        </td>
        <td class="border-r border-slate-400 p-2.5 space-y-1">
          <p><span class="font-semibold">মামলা নং:</span> ${data.caseNo}</p>
          <p><span class="font-semibold">জমার বিবরণ:</span> ${data.purpose}</p>
          <p class="text-[11px] text-slate-500 pt-1">বিজ্ঞ আদালতের আদেশ মোতাবেক সরকারি ট্রেজারিতে জমাদান।</p>
        </td>
        <td class="border-r border-slate-400 p-2.5 text-right font-mono font-bold text-slate-900">
          ${amountBn}
        </td>
        <td class="p-2.5 text-right font-mono text-slate-900">
          ০০
        </td>
      </tr>
      <tr class="bg-slate-50 font-bold border-b border-slate-500">
        <td colspan="3" class="border-r border-slate-400 p-2 text-right">
          মোট টাকা (Total):
        </td>
        <td class="border-r border-slate-400 p-2 text-right font-mono font-extrabold text-slate-900">
          ${amountBn}
        </td>
        <td class="p-2 text-right font-mono text-slate-900">
          ০০
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Amount in words -->
  <div class="border border-slate-300 p-2.5 rounded bg-slate-50 mb-6 text-xs flex items-center gap-2">
    <span class="font-bold text-slate-800">কথায় (In words):</span>
    <span class="font-semibold text-indigo-950">${amountInWords}</span>
  </div>

  <!-- Signatures -->
  <div class="grid grid-cols-3 gap-4 pt-10 text-center text-xs">
    <div>
      <div class="border-t border-slate-700 pt-1 font-semibold">টাকা জমাকারীর স্বাক্ষর</div>
      <p class="text-[10px] text-slate-500 mt-0.5">তারিখ: ${data.dateStr || "আজকের তারিখ"}</p>
    </div>
    <div>
      <div class="border-t border-slate-700 pt-1 font-semibold">বিভাগীয় কর্মকর্তা / আদালতের সেরেস্তাদার</div>
      <p class="text-[10px] text-slate-500 mt-0.5">(যাচাইপূর্বক সিল ও স্বাক্ষর)</p>
    </div>
    <div>
      <div class="border-t border-slate-700 pt-1 font-semibold">ব্যাংক ক্যাশিয়ার / ট্রেজারি অফিসার</div>
      <p class="text-[10px] text-slate-500 mt-0.5">(টাকা গ্রহণকারীর সিল ও স্বাক্ষর)</p>
    </div>
  </div>

  <div class="mt-8 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-400 text-center">
    LegalAI BD v3.0 Daily Utilities Engine • বাংলাদেশ ট্রেজারি বিধিমালা অনুযায়ী অনুমোদিত ফরম্যাট
  </div>
</div>
  `.trim();
}
