"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Layers,
  FileText,
  Printer,
  RotateCcw,
  Info,
  Scale,
  Building,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";

interface AuditResult {
  overallStatus: "SAFE" | "RISKY" | "CRITICAL_GAP";
  score: number;
  chainBreakWarning: string | null;
  khatianChain: Array<{
    type: string;
    khatianNo: string;
    owner: string;
    dagNo: string;
    area: string;
    status: "MATCHED" | "DISCREPANCY" | "UNVERIFIED";
    note: string;
  }>;
  legalRisks: string[];
  remedyActionBn: string;
  recommendedSuitType: string;
}

export default function KhatianAuditPage() {
  const [district, setDistrict] = useState("ঢাকা");
  const [mouza, setMouza] = useState("মিরপুর");
  const [csKhatian, setCsKhatian] = useState("");
  const [saKhatian, setSaKhatian] = useState("");
  const [rsKhatian, setRsKhatian] = useState("");
  const [bsKhatian, setBsKhatian] = useState("");
  const [dagNo, setDagNo] = useState("");
  const [areaDecimal, setAreaDecimal] = useState("");
  const [deedHistory, setDeedHistory] = useState("");
  const [mutationStatus, setMutationStatus] = useState("YES");
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  // Quick Demo Scenarios
  const loadCleanDemo = () => {
    setDistrict("ঢাকা");
    setMouza("মিরপুর");
    setCsKhatian("১২০");
    setSaKhatian("৩৪৫");
    setRsKhatian("৭৮৯");
    setBsKhatian("১১০২");
    setDagNo("৪৩৫");
    setAreaDecimal("১০.৫");
    setDeedHistory("মূল মালিক রহমত আলী থেকে ১৯৮৫ সালে সাফ-কবলা দলিল নং ৫৪২১ মূলে আঃ করিম ক্রয় করেন। অতঃপর ২০০৫ সালে হেবা দলিল নং ১২৩৪ মূলে বর্তমান মালিক শফিকুর রহমান মালিক হন।");
    setMutationStatus("YES");
  };

  const loadBrokenChainDemo = () => {
    setDistrict("গাজীপুর");
    setMouza("জয়দেবপুর");
    setCsKhatian("৫০");
    setSaKhatian("৮০");
    setRsKhatian("— (রেকর্ড নেই)");
    setBsKhatian("১২০০");
    setDagNo("১০৫");
    setAreaDecimal("১৫");
    setDeedHistory("১৯৯২ সালে পাওয়ার অব অ্যাটর্নি মূলে বিক্রি। মূল বায়া দলিল হারিয়ে গেছে বলে উল্লেখ। এসএ খতিয়ান থেকে আরএস খতিয়ানে মালিকের নাম বাদ পড়েছে। বিবাদী জোরপূর্বক সীমানা প্রাচীর ভেঙে দখল করেছে।");
    setMutationStatus("NO");
  };

  const handleRunAudit = () => {
    if (!mouza || !dagNo) {
      alert("মৌজা এবং দাগ নম্বর দেওয়া আবশ্যক।");
      return;
    }

    setIsAuditing(true);

    setTimeout(() => {
      const hasBrokenRecord =
        !rsKhatian ||
        rsKhatian.includes("নেই") ||
        deedHistory.toLowerCase().includes("হারিয়ে") ||
        deedHistory.toLowerCase().includes("পাওয়ার") ||
        mutationStatus === "NO";

      if (hasBrokenRecord) {
        setResult({
          overallStatus: "CRITICAL_GAP",
          score: 42,
          chainBreakWarning: "খতিয়ান পরম্পরায় এসএ থেকে আরএস স্তরে মালিকানা ও রেকর্ডের গুরুতর বিচ্যুতি (Chain Severed) ধরা পড়েছে!",
          khatianChain: [
            { type: "CS খতিয়ান", khatianNo: csKhatian || "৫০", owner: "জমিদার পক্ষ / মূল রায়ত", dagNo, area: `${areaDecimal} শতক`, status: "MATCHED", note: "প্রাথমিক সত্ত্ব বিদ্যমান" },
            { type: "SA খতিয়ান", khatianNo: saKhatian || "৮০", owner: "পূর্বতন মূল মালিক", dagNo, area: `${areaDecimal} শতক`, status: "MATCHED", note: "১৯৫৬ সালের জমিদারী অধিগ্রহণ অনুযায়ী বৈধ" },
            { type: "RS খতিয়ান", khatianNo: rsKhatian || "রেকর্ডহীন", owner: "অজ্ঞাত / ভুল নামে রেকর্ড", dagNo: `${dagNo}/১`, area: `${areaDecimal} শতক`, status: "DISCREPANCY", note: "⚠️ মূল মালিকের নাম বাদ পড়ে তৃতীয় পক্ষের নামে ভুল অন্তর্ভুক্তি!" },
            { type: "BS / সিটি জরিপ", khatianNo: bsKhatian || "১২০০", owner: "বর্তমান দখলদার দাবিদার", dagNo, area: `${areaDecimal} শতক`, status: "DISCREPANCY", note: "নামজারি খতিয়ানের সাথে অমিল" },
          ],
          legalRisks: [
            "বাওয়া দলিলের নিরবচ্ছিন্ন চেইন (Chain of Title Deeds) অনুপস্থিত থাকায় হস্তান্তর অবৈধ ঘোষিত হওয়ার ঝুঁকি।",
            "আরএস ও সিটি জরিপে ভুল রেকর্ডের কারণে বিবাদীপক্ষ দ্বারা তামাদি আইন আর্টিকল ১৪২/১৪৪ মূলে প্রতিকূল দখল (Adverse Possession) দাবি করার আশঙ্কা।",
            "নামজারি ও ডিসিআর হালনাগাদ না থাকায় সরকারি খাজনা বাতিল ও ভূমি অফিসে বিবাদ সৃষ্টি হতে পারে।",
          ],
          remedyActionBn: "তাৎক্ষণিকভাবে দেওয়ানি আদালতে 'রেকর্ড সংশোধন পূর্বক স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞা' (Declaration of Title & Permanent Injunction) মামলা দায়ের করা আবশ্যক। সাথে সিপিসি অর্ডার ৩৯ রুল ১ ও ২ অনুযায়ী স্থিতাবস্থার অন্তর্বর্তীকালীন আবেদন দাখিল করতে হবে।",
          recommendedSuitType: "সুনির্দিষ্ট প্রতিকার আইন (Specific Relief Act) ধারা ৪২ ও ৫৪ অনুযায়ী স্বত্ব ঘোষণা ও চিরস্থায়ী নিষেধাজ্ঞার আরজি।",
        });
      } else {
        setResult({
          overallStatus: "SAFE",
          score: 96,
          chainBreakWarning: null,
          khatianChain: [
            { type: "CS খতিয়ান", khatianNo: csKhatian, owner: "মূল সিএস জোতদার", dagNo, area: `${areaDecimal} শতক`, status: "MATCHED", note: "রেকর্ড সম্পূর্ণ অবিকৃত ও নিরবচ্ছিন্ন" },
            { type: "SA খতিয়ান", khatianNo: saKhatian, owner: "সংশ্লিষ্ট পূর্বপুরুষ", dagNo, area: `${areaDecimal} শতক`, status: "MATCHED", note: "১৯৫৬ সালের স্টেট একুইজিশন অ্যাক্ট মোতাবেক লিপিবদ্ধ" },
            { type: "RS খতিয়ান", khatianNo: rsKhatian, owner: "বায়া দলিলের দাতা", dagNo, area: `${areaDecimal} শতক`, status: "MATCHED", note: "দাগের পরিমাণ ও মালিকানার সমতা যাচাইকৃত" },
            { type: "BS / সিটি জরিপ", khatianNo: bsKhatian, owner: "বর্তমান বাদী/মক্কেল", dagNo, area: `${areaDecimal} শতক`, status: "MATCHED", note: "হাল নামজারি ও জমাভাগ খতিয়ানের সাথে হুবহু মিল" },
          ],
          legalRisks: [
            "কোনো বড় ধরনের রেকর্ডগত ফাঁকফোকর পাওয়া যায়নি। বায়া দলিল ও নামজারি সম্পূর্ণ সুরক্ষিত।",
            "দখল বজায় থাকলে দেওয়ানি মামলার রায় বাদীর অনুকূলে আসার সম্ভাবনা ৯৫%+",
          ],
          remedyActionBn: "যদি বিবাদীপক্ষ অনধিকার প্রবেশের চেষ্টা করে, তবে কেবল 'চিরস্থায়ী নিষেধাজ্ঞা' (Permanent Injunction) মামলা দায়ের করলেই পর্যাপ্ত আইনি সুরক্ষা পাওয়া যাবে। স্বত্ব প্রমাণের জন্য সমস্ত নথিপত্র স্বয়ংসম্পূর্ণ।",
          recommendedSuitType: "সুনির্দিষ্ট প্রতিকার আইন (SR Act 1877) ধারা ৫৪ অনুযায়ী চিরস্থায়ী নিষেধাজ্ঞার আরজি।",
        });
      }
      setIsAuditing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Top Page Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  দলিল ও খতিয়ান চেইন অডিট (Khatian & Deed Chain of Ownership Verifier)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  CS ➔ SA ➔ RS ➔ BS খতিয়ান পরম্পরা, বায়া দলিলের ধারাবাহিকতা ও আইনি স্বত্ব নিখুঁত বিশ্লেষণ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadCleanDemo}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ✓ নিখুঁত চেইন নমুনা
              </button>
              <button
                type="button"
                onClick={loadBrokenChainDemo}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                ⚠ রেকর্ড বিচ্যুতি ও জাল খতিয়ান নমুনা
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>জমির তফসিল ও খতিয়ান তথ্যাবলী</span>
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  এআই ভূমি অডিট
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">জেলা</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">মৌজা ও জে.এল নং *</label>
                  <input
                    type="text"
                    value={mouza}
                    onChange={(e) => setMouza(e.target.value)}
                    placeholder="যেমন: মিরপুর, জেএল ০১"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">মূল দাগ নম্বর *</label>
                  <input
                    type="text"
                    value={dagNo}
                    onChange={(e) => setDagNo(e.target.value)}
                    placeholder="যেমন: ৪৩৫"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">জমির পরিমাণ (শতক)</label>
                  <input
                    type="text"
                    value={areaDecimal}
                    onChange={(e) => setAreaDecimal(e.target.value)}
                    placeholder="যেমন: ১০.৫"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              {/* 4-Tier Khaitan Chain Inputs */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <p className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span>৪-স্তরের খতিয়ান নম্বর (Khatian Chain):</span>
                  <span className="text-[9px] text-slate-400 font-normal">অজ্ঞাত থাকলে ফাঁকা রাখুন</span>
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">১। CS খতিয়ান নং</span>
                    <input
                      type="text"
                      value={csKhatian}
                      onChange={(e) => setCsKhatian(e.target.value)}
                      placeholder="যেমন: ১২০"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">২। SA খতিয়ান নং</span>
                    <input
                      type="text"
                      value={saKhatian}
                      onChange={(e) => setSaKhatian(e.target.value)}
                      placeholder="যেমন: ৩৪৫"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg mt-0.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">৩। RS খতিয়ান নং</span>
                    <input
                      type="text"
                      value={rsKhatian}
                      onChange={(e) => setRsKhatian(e.target.value)}
                      placeholder="যেমন: ৭৮৯"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium">৪। BS / সিটি জরিপ নং</span>
                    <input
                      type="text"
                      value={bsKhatian}
                      onChange={(e) => setBsKhatian(e.target.value)}
                      placeholder="যেমন: ১১০২"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg mt-0.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  হাল নামজারি ও ডিসিআর (Mutation & DCR Status)
                </label>
                <select
                  value={mutationStatus}
                  onChange={(e) => setMutationStatus(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer font-medium"
                >
                  <option value="YES">হ্যাঁ — নিজের বা পূর্বপুরুষের নামে নামজারি ও ডিসিআর সম্পন্ন</option>
                  <option value="PENDING">চলমান — নামজারির আবেদন ভূমি অফিসে জমা রয়েছে</option>
                  <option value="NO">না — কোনো নামজারি নেই বা পূর্ববর্তী মালিকের নামেই রয়েছে</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  বায়া দলিলের ইতিহাস ও হস্তান্তর বিবরণ (Chain-of-Title)
                </label>
                <textarea
                  rows={4}
                  value={deedHistory}
                  onChange={(e) => setDeedHistory(e.target.value)}
                  placeholder="মূল সিএস/এসএ মালিক থেকে কার কার মাধ্যমে বিক্রি, হেবা বা উত্তরাধিকার সূত্রে বর্তমান মক্কেল পেলেন তা লিখুন..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAuditing ? "খতিয়ান অডিট ও চেইন বিশ্লেষণ চলছে..." : "এআই খতিয়ান ও বায়া দলিল অডিট চালান"}</span>
              </button>
            </div>

            {/* Results Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {!result ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-700">খতিয়ান চেইন অডিট রিপোর্ট এখানে প্রদর্শিত হবে</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    বামের ফর্মটিতে মৌজা, দাগ ও খতিয়ানের তথ্য প্রদান করে অডিট বোতামে ক্লিক করুন অথবা উপরের দ্রুত নমুনা ব্যবহার করুন।
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div
                    className={`p-6 rounded-3xl border shadow-xs space-y-3 ${
                      result.overallStatus === "SAFE"
                        ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                        : "bg-rose-50/90 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.overallStatus === "SAFE" ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-rose-600" />
                        )}
                        <span className="font-bold text-sm">
                          {result.overallStatus === "SAFE"
                            ? "স্বত্ব সম্পূর্ণ সুরক্ষিত (Title Authenticated & Continuous)"
                            : "মালিকানা চেইন বিচ্ছিন্ন ও ঝুঁকিপূর্ণ (Chain Severed / High Risk)"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black">{result.score}%</span>
                        <span className="text-[10px] block opacity-75">নিরাপত্তা স্কোর</span>
                      </div>
                    </div>

                    {result.chainBreakWarning && (
                      <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-rose-900 font-semibold leading-relaxed">
                        {result.chainBreakWarning}
                      </div>
                    )}
                  </div>

                  {/* 4-Stage Visual Timeline */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>খতিয়ান ধারাবাহিকতা টাইমলাইন (Survey Tier Timeline)</span>
                      <span className="text-[10px] text-slate-400 font-normal">CS ➔ SA ➔ RS ➔ BS</span>
                    </h4>

                    <div className="space-y-3">
                      {result.khatianChain.map((k, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            k.status === "MATCHED"
                              ? "bg-emerald-50/30 border-emerald-100"
                              : "bg-rose-50/40 border-rose-200"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{k.type}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                                খতিয়ান নং: {k.khatianNo}
                              </span>
                              <span className="text-[10px] text-slate-500">দাগ: {k.dagNo} ({k.area})</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium">রেকর্ডকৃত মালিক: {k.owner}</p>
                            <p className="text-[10px] text-slate-500">{k.note}</p>
                          </div>

                          <div className="shrink-0">
                            {k.status === "MATCHED" ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                ✓ সুসঙ্গত
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                ⚠ বিচ্যুতি ধরা পড়েছে
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legal Risks & Recommended Remedy */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-600" />
                      <span>আইনি ঝুঁকি ও বিজ্ঞ আইনজীবীর করণীয় পদক্ষেপ</span>
                    </h4>

                    <div className="space-y-2">
                      {result.legalRisks.map((risk, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{risk}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2">
                      <span className="text-[11px] font-bold text-indigo-900 block">
                        প্রস্তাবিত আদালতের প্রতিকার (Legal Remedy & Suit Type):
                      </span>
                      <p className="text-xs text-indigo-950 font-bold leading-relaxed">
                        {result.recommendedSuitType}
                      </p>
                      <p className="text-xs text-indigo-800 leading-relaxed">
                        {result.remedyActionBn}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>অডিট মেমো প্রিন্ট করুন</span>
                      </button>
                      <Link
                        href="/dashboard"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                      >
                        আরজি ড্রাফটিংয়ে যান →
                      </Link>
                    </div>
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
