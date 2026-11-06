"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Swords,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileText,
  UserCheck,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Scale,
  BrainCircuit,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";

interface QuestionCategory {
  title: string;
  sectionRef: string;
  objective: string;
  questions: Array<{
    q: string;
    targetTrap: string;
    ifYes: string;
    ifNo: string;
  }>;
}

interface CrossExamResult {
  witnessType: string;
  caseCategory: string;
  strategySummary: string;
  keyVulnerability: string;
  categories: QuestionCategory[];
}

export default function CrossExamPage() {
  const [caseType, setCaseType] = useState("Criminal_Injuries");
  const [witnessType, setWitnessType] = useState("Doctor_Medical_Officer");
  const [chiefStatement, setChiefStatement] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CrossExamResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Quick Demo Presets
  const loadDoctorDemo = () => {
    setCaseType("Criminal_Injuries");
    setWitnessType("Doctor_Medical_Officer");
    setChiefStatement("সাক্ষী ডা. শফিকুল ইসলাম জবানবন্দিতে বলেছেন: ভিকটিম রহিম মিয়ার মাথায় ধারালো অস্ত্রের দ্বারা ৩ ইঞ্চি গভীর কাটা জখম পাওয়া গেছে এবং এটি গুরুতর (Grievous) প্রকৃতির আঘাত যা মৃত্যু ঘটাতে পারত। ইনজুরি সার্টিফিকেট নং-৭৮৯ আদালতে দাখিল ও প্রদর্শন করলেন।");
  };

  const loadIODemo = () => {
    setCaseType("Criminal_Theft_Assault");
    setWitnessType("Investigation_Officer_IO");
    setChiefStatement("তদন্তকারী কর্মকর্তা এসআই জহিরুল ইসলাম জবানবন্দিতে বলেন: এজাহার পাওয়ার পর ঘটনাস্থল পরিদর্শন করে খসড়া মানচিত্র ও সূচিপত্র প্রস্তুত করেন। জব্দ তালিকা মূলে ১টি লোহার রড উদ্ধার করেন এবং সাক্ষীদের ১৬১ ধারায় জবানবন্দি গ্রহণপূর্বক আসামিদের বিরুদ্ধে ৩২৩/৩২৬/৩০৭/৩৪ ধারায় চার্জশিট দাখিল করেন।");
  };

  const loadChequeComplainantDemo = () => {
    setCaseType("NI_Act_Cheque_Bounce");
    setWitnessType("Complainant_Party");
    setChiefStatement("বাদী জনাব রফিকুল ইসলাম জবানবন্দিতে বলেন: তিনি বিবাদীকে ব্যবসায়িক প্রয়োজনে ৫ লাখ টাকা ধার দেন এবং বিবাদী সেই ধারের বিপরীতে ৫ লাখ টাকার ডাচ-বাংলা ব্যাংক চেক প্রদান করেন যা পর্যাপ্ত ফান্ড না থাকায় প্রত্যাখ্যাত হয়।");
  };

  const handleGenerate = () => {
    if (!chiefStatement.trim()) {
      alert("সাক্ষীর মূল জবানবন্দি বা অভিযোগের সারসংক্ষেপ উল্লেখ করুন।");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      if (witnessType.includes("Doctor")) {
        setResult({
          witnessType: "মেডিকেল অফিসার (Doctor / Medical Witness)",
          caseCategory: "দণ্ডবিধি ৩২৬ / ৩০৭ ধারা (মারাত্মক জখম ও অঙ্গহানি)",
          strategySummary: "ডাক্তারের ইনজুরি রিপোর্টে আঘাতটি 'ধারালো অস্ত্রের' দাবি করা হলেও তা ভোঁতা অস্ত্রের ঘর্ষণে কিংবা পড়ে গিয়েও হতে পারে—এই সন্দেহ তৈরি করা এবং বয়ানকারী চিকিৎসকের উপস্থিতির সময়কালকে প্রশ্নবিদ্ধ করা।",
          keyVulnerability: "আঘাতের বয়স (Age of injury) এবং রোগী ভর্তির সময়ের মধ্যে ব্যবধান ছিল ৬ ঘণ্টা; অস্ত্র ঘটনাস্থলে রক্তমাখা অবস্থায় ডাক্তার দেখেননি।",
          categories: [
            {
              title: "১। আঘাতের প্রকৃতি ও অস্ত্র নিয়ে জেরা",
              sectionRef: "সাক্ষ্য আইন ১৮৭২ ধারা ১৪৬ (বিশ্বাসযোগ্যতা পরীক্ষা)",
              objective: "আঘাতটি ধারালো অস্ত্রের বদলে ভোঁতা ভারী বস্তুর আঘাতে বা অসাবধানতাবশত পড়ে গিয়ে ঘর্ষণে হওয়া সম্ভব তা প্রমাণ করা।",
              questions: [
                {
                  q: "আপনি কি জখমী রহিমকে যখন প্রথম পরীক্ষা করেন, তখন তার মাথার জখমের কিনারাগুলো ভোঁতা ও থেঁতলানো (Lacerated / Contused) ছিল কি না?",
                  targetTrap: "Lacerated wound কখনোই ধারালো তলোয়ার বা রামদার পরিষ্কার কাটিং ইনজুরি নয়।",
                  ifYes: "তাহলে স্বীকার করলেন যে আঘাতটি ধারালো অস্ত্রের ছিল না, বরং ভোঁতা বস্তুর ছিল।",
                  ifNo: "তাহলে ইনজুরি সার্টিফিকেটের মার্জিন বর্ণনার সাথে আপনার বর্তমান জবানবন্দির স্পষ্ট বৈপরীত্য রয়েছে।",
                },
                {
                  q: "কোনো ব্যক্তি শক্ত মেঝের ওপর অথবা ধারালো ইটের টুকরায় সজোরে মুখ থুবড়ে আছড়ে পড়লে এ ধরনের জখম হওয়া চিকিৎসাবিজ্ঞানে কি অসম্ভব?",
                  targetTrap: "ডাক্তার কখনোই 'অসম্ভব' বলতে পারেন না, কারণ মেডিকেল জুরিসপ্রুডেন্স অনুযায়ী এটা সম্ভব।",
                  ifYes: "তাহলে এই আঘাত মারধরের ছাড়াও নিজে পড়ে গিয়ে হওয়ার সমান সম্ভাবনা রয়েছে।",
                  ifNo: "মেডিকেল জুরিসপ্রুডেন্সের বই (যেমন মোদি বা পারেখ) অনুযায়ী আপনার এই মত সঠিক নয়।",
                },
              ],
            },
            {
              title: "২। ১৬১ জবানবন্দি ও ইনজুরি সার্টিফিকেটের অসঙ্গতি",
              sectionRef: "সাক্ষ্য আইন ১৮৭২ ধারা ১৪৫ (পূর্ববর্তী দলিলের বৈপরীত্য)",
              objective: "রোগী হাসপাতালে আসার সময় আনা ব্যক্তির নাম এবং আঘাতকারী হিসেবে আসামির নাম তাৎক্ষণিক রেকর্ড না থাকার সুযোগ গ্রহণ।",
              questions: [
                {
                  q: "জরুরি বিভাগের এন্ট্রি খাতায় ভিকটিম কার দ্বারা আঘাতপ্রাপ্ত হয়েছেন বলে চিকিৎসককে জানিয়েছিলেন, তা কি আপনি নিজ হাতে ইনজুরি রিপোর্টে লিপিবদ্ধ করেছেন?",
                  targetTrap: "জরুরি বিভাগে আসামির নাম তাৎক্ষণিকভাবে লেখা থাকে না, পরে এজাহারের সাথে মিলানোর চেষ্টা করা হয়।",
                  ifYes: "রিপোর্টটি দেখান, সেখানে শুধু 'শারীরিক মারধর' লেখা, কোনো আসামির নামোল্লেখ নেই।",
                  ifNo: "তাহলে কার আঘাতে আঘাতপ্রাপ্ত হয়েছে সে বিষয়ে আপনার প্রত্যক্ষ জ্ঞান বা রেকর্ড নেই।",
                },
                {
                  q: "আপনি কি জখমীর রক্তমাখা কোনো কাপড়-চোপড় বা এক্স-রে প্লেট নিজে ফরেনসিক কেমিক্যাল পরীক্ষার জন্য সিআইডিতে পাঠিয়েছিলেন?",
                  targetTrap: "ফরেনসিক রাসায়নিক বা রেডিওলজি রিপোর্ট ছাড়া কেবল চোখের দেখায় 'Grievous' বলা আইনগত ত্রুটিপূর্ণ।",
                  ifYes: "সেটির রিপোর্ট কোর্টে প্রদর্শিত হয়নি।",
                  ifNo: "তাহলে আপনার 'Grievous hurt' মতামতটি একটি অনুমানভিত্তিক মতামতমাত্র।",
                },
              ],
            },
          ],
        });
      } else if (witnessType.includes("IO")) {
        setResult({
          witnessType: "তদন্তকারী কর্মকর্তা (Investigation Officer - IO)",
          caseCategory: "ফৌজদারি মামলা (দণ্ডবিধি ৩২৩/৩২৬/৩০৭/৫০৬)",
          strategySummary: "তদন্তকারী কর্মকর্তা নিরপেক্ষভাবে তদন্ত না করে বাদীর সাজানো বয়ান অনুযায়ী কাজ করেছেন এবং গুরুত্বপূর্ণ স্বতন্ত্র প্রতিবেশীদের সাক্ষ্য নেননি তা প্রমাণের জেরা।",
          keyVulnerability: "ঘটনাস্থলের চারপাশের নিরপেক্ষ দোকানদার বা প্রতিবেশীদের ১৬১ ধারায় জবানবন্দি নেওয়া হয়নি; কেবল বাদীর ঘনিষ্ঠ স্বজনদের সাক্ষী করা হয়েছে।",
          categories: [
            {
              title: "১। তদন্তের নিরপেক্ষতা ও নিরপেক্ষ সাক্ষীর অনুপস্থিতি",
              sectionRef: "সাক্ষ্য আইন ধারা ১৪৬ ও সিআরপিসি ১৬১ ধারা",
              objective: "তদন্ত পক্ষপাতদুষ্ট ও একপেশে ছিল তা প্রতিষ্ঠা করা।",
              questions: [
                {
                  q: "আপনি কি ঘটনাস্থলের চতুর্সীমার প্রকৃত প্রতিবেশী ও আশপাশের নিরপেক্ষ দোকানদারদের নাম আপনার কেস ডায়েরিতে তালিকাভুক্ত করেছিলেন?",
                  targetTrap: "স্বতন্ত্র নিরপেক্ষ স্থানীয়দের সাক্ষ্য বাদ দেওয়ার কারণ ব্যাখ্যা করতে বাধ্য করা।",
                  ifYes: "তাদের কাউকে আপনি চার্জশিটে সাক্ষী বানাননি কেন?",
                  ifNo: "তাহলে নিরপেক্ষ অনুসন্ধান না করে শুধু বাদীর স্বজনদের কথায় চার্জশিট দিয়েছেন।",
                },
                {
                  q: "আপনি কি জব্দকৃত লোহার রডের ওপর আসামির কোনো আঙুলের ছাপ (Fingerprint) বা রক্তের নমুনা সংগ্রহ করে ফরেনসিক টেস্টে পাঠিয়েছেন?",
                  targetTrap: "মেটেরিয়াল এভিডেন্সের সাথে আসামির সরাসরি লিংকের ফরেনসিক প্রমাণের অভাব।",
                  ifYes: "সেই ফরেনসিক রিপোর্ট কেস ডকেটে দাখিল করা হয়নি।",
                  ifNo: "তাহলে এই রড যে আসামিরই ব্যবহৃত তা নিশ্চিত করার কোনো বৈজ্ঞানিক ভিত্তি আপনার নেই।",
                },
              ],
            },
          ],
        });
      } else {
        setResult({
          witnessType: "বাদী পক্ষ (Complainant / Private Party)",
          caseCategory: "এনআই অ্যাক্ট ১৩৮ ধারা (চেক ডিজঅনার)",
          strategySummary: "বাদী কর্তৃক ৫ লাখ টাকা দেওয়ার মতো কোনো ব্যাংক উইথড্রয়াল বা আয়কর নথিতে হিসাব না থাকা এবং চেকটি যে সিকিউরিটি পারপাসে নেওয়া হয়েছিল তা স্বীকার করানো।",
          keyVulnerability: "বাদীর আয়কর রিটার্নে ৫ লাখ টাকা ঋণ দেওয়ার কোনো ঘোষণা নেই; নগদ টাকার উৎস অপ্রমাণিত।",
          categories: [
            {
              title: "১। আর্থিক সামর্থ্য ও টাকার লেনদেনের বৈধতা জেরা",
              sectionRef: "সাক্ষ্য আইন ১৪৬ ও ইনকাম ট্যাক্স আইন",
              objective: "কন্সিডারেশন (Consideration / দেনা) ছাড়াই চেকটি নেওয়া হয়েছিল তা প্রমাণ করা।",
              questions: [
                {
                  q: "আপনি যে তারিখে ৫ লাখ টাকা নগদ দিয়েছেন বলে দাবি করছেন, সেই তারিখে বা তার পূর্ববর্তী ৩ দিনে আপনার কোনো ব্যাংক অ্যাকাউন্ট থেকে এই টাকা উত্তোলনের স্লিপ আছে কি?",
                  targetTrap: "ব্যাংকের প্রমাণ না থাকলে অপ্রদর্শিত কালো টাকা বা অসত্য দাবির ইঙ্গিত প্রতিষ্ঠিত হয়।",
                  ifYes: "সেই ব্যাংক স্টেটমেন্ট কি আদালতে দাখিল করেছেন? (না থাকলে মিথ্যা)।",
                  ifNo: "তাহলে এত বড় অঙ্কের টাকা আপনার হাতে কোথা থেকে এলো তার কোনো ব্যাংকিং প্রমাণ নেই।",
                },
                {
                  q: "আপনি কি আপনার সর্বশেষ আয়কর রিটার্নে এই ৫ লাখ টাকার ঋণ বা পাওনা দেখিয়েছেন?",
                  targetTrap: "আয়কর ফাইলে উল্লেখ না থাকলে এনআই অ্যাক্টে ঋণের বৈধ দায় প্রমাণে প্রতিবন্ধকতা সৃষ্টি হয়।",
                  ifYes: "রিটার্নের কপি তলব করা হোক।",
                  ifNo: "তাহলে এই টাকা আয়কর আইনে কোনো ঘোষিত বৈধ ঋণ হিসেবে স্বীকৃত নয়।",
                },
              ],
            },
          ],
        });
      }
      setIsGenerating(false);
    }, 800);
  };

  const copyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  এআই জেরা ও ট্রায়াল সিমুলেটর (AI Cross-Examination & Trial Drill)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  সাক্ষ্য আইন ১৮৭২ (Evidence Act Sec 137, 138, 145, 146) অনুযায়ী কোর্টরুম রেডি জেরা প্রশ্ন ও ফাঁদ তৈরি
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadDoctorDemo}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                🩺 ডাক্তার / ইনজুরি জেরা
              </button>
              <button
                type="button"
                onClick={loadIODemo}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                👮 তদন্তকারী কর্মকর্তা (IO) জেরা
              </button>
              <button
                type="button"
                onClick={loadChequeComplainantDemo}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                💳 চেক বাউন্স বাদী জেরা
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>সাক্ষী ও মামলার বিবরণ</span>
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  কোর্টরুম সিমুলেটর
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">মামলার আইনি বিষয়শ্রেণি</label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer font-medium"
                >
                  <option value="Criminal_Injuries">ফৌজদারি মারাত্মক আঘাত ও দণ্ডবিধি ৩২৬/৩০৭ ধারা</option>
                  <option value="Criminal_Theft_Assault">ফৌজদারি মারধর, চুরি ও ভাঙচুর (সিআর / জিআর)</option>
                  <option value="NI_Act_Cheque_Bounce">বিশেষ ট্রাইব্যুনাল — এনআই অ্যাক্ট ১৩৮ চেক ডিজঅনার</option>
                  <option value="Civil_Title_Deed">দেওয়ানি আরজি — দলিল বাতিল ও স্বত্ব ঘোষণা</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">জেরা 대상 সাক্ষীর প্রকৃতি (Witness Type)</label>
                <select
                  value={witnessType}
                  onChange={(e) => setWitnessType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer font-medium"
                >
                  <option value="Doctor_Medical_Officer">মেডিকেল অফিসার (Doctor / ইনজুরি বা পোস্টমর্টেম পরীক্ষক)</option>
                  <option value="Investigation_Officer_IO">তদন্তকারী পুলিশ কর্মকর্তা (IO / তদন্তের নিরপেক্ষতা)</option>
                  <option value="Complainant_Party">মূল বাদী বা নালিশকারী (Complainant / স্ববিরোধিতা)</option>
                  <option value="Seizure_Witness">জব্দ তালিকার সাক্ষী (Seizure List Witness / নিরপেক্ষতা)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  সাক্ষীর প্রধান জবানবন্দির মূল বক্তব্য (Examination-in-Chief Summary) *
                </label>
                <textarea
                  rows={6}
                  value={chiefStatement}
                  onChange={(e) => setChiefStatement(e.target.value)}
                  placeholder="সাক্ষী আদালতে প্রধান জবানবন্দিতে কী কী বলেছেন বা কী দাবি করছেন তা সংক্ষেপে লিখুন..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <BrainCircuit className="w-4 h-4 text-amber-300" />
                <span>{isGenerating ? "জেরা প্রশ্ন ও আইনি ফাঁদ তৈরি হচ্ছে..." : "এআই জেরা প্রশ্নমালা প্রস্তুত করুন"}</span>
              </button>
            </div>

            {/* Results Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {!result ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <Swords className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700">কোর্টরুম জেরা প্রশ্নমালা এখানে প্রদর্শিত হবে</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    বামের ফর্মটিতে সাক্ষীর জবানবন্দির বক্তব্য প্রদান করুন অথবা উপরের দ্রুত নমুনা বোতামগুলোতে ক্লিক করুন।
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Strategy Overview Card */}
                  <div className="p-6 bg-gradient-to-br from-indigo-50/90 to-slate-50 rounded-3xl border border-indigo-100 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                        জেরা কৌশল ও ট্রায়াল স্ট্র্যাটেজি
                      </span>
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                        {result.witnessType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-bold leading-relaxed">
                      {result.strategySummary}
                    </p>
                    <div className="p-3 bg-white/90 rounded-2xl border border-indigo-100 text-[11px] text-indigo-950 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>সাক্ষীর প্রধান দুর্বলতা (Key Vulnerability):</strong> {result.keyVulnerability}
                      </div>
                    </div>
                  </div>

                  {/* Question Categories */}
                  {result.categories.map((cat, catIdx) => (
                    <div key={catIdx} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                      <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{cat.title}</h4>
                          <span className="text-[10px] text-indigo-600 font-semibold">{cat.sectionRef}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          লক্ষ্য: {cat.objective}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {cat.questions.map((item, qIdx) => {
                          const globalIdx = catIdx * 10 + qIdx;
                          return (
                            <div key={qIdx} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-2.5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                    {qIdx + 1}
                                  </span>
                                  <p className="text-xs font-bold text-slate-900 leading-relaxed">
                                    &quot;{item.q}&quot;
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyQuestion(item.q, globalIdx)}
                                  className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer transition shrink-0"
                                  title="প্রশ্ন কপি করুন"
                                >
                                  {copiedIndex === globalIdx ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>

                              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                                <span className="font-bold text-slate-700 block">
                                  🎯 আইনি ট্র্যাপ ও ফলাফল:
                                </span>
                                <p className="text-slate-600">{item.targetTrap}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[10px]">
                                  <div className="text-emerald-700 bg-emerald-50/50 p-1.5 rounded-lg">
                                    <strong>যদি &apos;হ্যাঁ&apos; বলে:</strong> {item.ifYes}
                                  </div>
                                  <div className="text-rose-700 bg-rose-50/50 p-1.5 rounded-lg">
                                    <strong>যদি &apos;না&apos; বলে:</strong> {item.ifNo}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>জেরা শিট প্রিন্ট করুন</span>
                    </button>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      ড্যাশবোর্ডে ফিরুন →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
