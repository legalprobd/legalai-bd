"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Calculator,
  Coins,
  Scale,
  Receipt,
  FileCheck2,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { calculateBangladeshCourtFee } from "@/lib/courtFee";

export default function CourtFeePage() {
  const [suitType, setSuitType] = useState<
    "MONEY_SUIT" | "TITLE_DECLARATION" | "TITLE_WITH_CONSEQUENTIAL" | "PARTITION" | "PERMANENT_INJUNCTION" | "EVICTION_TENANT"
  >("MONEY_SUIT");
  const [valuation, setValuation] = useState<number>(500000);

  const result = calculateBangladeshCourtFee(suitType, valuation);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Court Fees Act 1870 & Suits Valuation Act 1887 (মডিউল ১০)</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            বাংলাদেশ কোর্ট ফি ও অ্যাড-ভ্যালোরেম ক্যালকুলেটর
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            মামলার ধরন এবং নালিশি সম্পত্তির দাবিকৃত মূল্যমানের (Valuation) ওপর ভিত্তি করে বাংলাদেশ দেওয়ানি আদালতের সংবিধিবদ্ধ কোর্ট ফি, প্রসেস ফি ও স্ট্যাম্প ডিউটি নির্ভুলভাবে হিসাব করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Controls */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>মোকদ্দমার প্যারামিটার নির্বাচন করুন</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                মামলার আইনি শ্রেণিবিভাগ (Suit Category)
              </label>
              <select
                value={suitType}
                onChange={(e) => setSuitType(e.target.value as unknown as typeof suitType)}
                className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="MONEY_SUIT">অর্থ ঋণ ও পাওনা আদায়ের মামলা (Money Suit / Contract Claim)</option>
                <option value="TITLE_WITH_CONSEQUENTIAL">স্বত্ব ঘোষণা ও দখল পুনরুদ্ধার / আনুসঙ্গিক প্রতিকার (Title + Possession)</option>
                <option value="TITLE_DECLARATION">শুধুমাত্র স্বত্ব ঘোষণা - আনুসঙ্গিক প্রতিকার ব্যতীত (Declaration of Title)</option>
                <option value="PARTITION">যৌথ সম্পত্তির বাটোয়ারা মোকদ্দমা (Suit for Partition)</option>
                <option value="PERMANENT_INJUNCTION">চিরস্থায়ী নিষেধাজ্ঞা মোকদ্দমা (Suit for Permanent Injunction)</option>
                <option value="EVICTION_TENANT">ভাড়াটিয়া উচ্ছেদ ও বকেয়া ভাড়া আদায় (Eviction with Arrears)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  দাবিকৃত অর্থের পরিমাণ বা সম্পত্তির মূল্যায়ন (টাকায়)
                </label>
                <span className="text-xs font-black text-indigo-600">
                  ৳ {valuation.toLocaleString("bn-BD")}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="10000"
                value={valuation}
                onChange={(e) => setValuation(Number(e.target.value) || 0)}
                className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 font-bold"
              />
              <input
                type="range"
                min="10000"
                max="5000000"
                step="50000"
                value={valuation}
                onChange={(e) => setValuation(Number(e.target.value))}
                className="w-full mt-3 accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>১০,০০০ টাকা</span>
                <span>১০ লাখ</span>
                <span>৫০ লাখ+</span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>আইনগত নোট:</strong> কোর্ট ফিস অ্যাক্ট ১৮৭০ অনুযায়ী দেওয়ানি মোকদ্দমায় সর্বোচ্চ অ্যাড-ভ্যালোরেম কোর্ট ফি ৫০,০০০/- (পঞ্চাশ হাজার) টাকায় সীমাবদ্ধ থাকে।
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  নির্ধারিত সরকারি রাজস্ব হিসাব
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  মোট প্রদেয় কোর্ট ফি বিবরণী
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ৳
              </div>
            </div>

            {/* Total Highlight */}
            <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md">
              <span className="text-xs text-indigo-200 font-medium block">
                সরকারি ট্রেজারি ও আদালতে দাখিলযোগ্য সর্বমোট ফি
              </span>
              <span className="text-3xl font-black tracking-tight text-amber-300 block mt-1">
                ৳ {result.totalGovtDues.toLocaleString("bn-BD")}
              </span>
              <span className="text-[11px] text-indigo-200 mt-2 block opacity-90">
                {result.formulaExplanationBn}
              </span>
            </div>

            {/* Itemized list */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">মূল সংবিধিবদ্ধ কোর্ট ফি (Court Fee):</span>
                <span className="font-bold text-slate-900">৳ {result.statutoryCourtFee.toLocaleString("bn-BD")}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">জারিকারক প্রসেস ফি (Process Server Fees):</span>
                <span className="font-bold text-slate-900">৳ {result.processFee.toLocaleString("bn-BD")}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">বার অ্যাসোসিয়েশন ওয়েলফেয়ার ও স্ট্যাম্প:</span>
                <span className="font-bold text-slate-900">৳ {result.welfareStamp.toLocaleString("bn-BD")}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-emerald-800">
                <span>আইনজীবী ভ্যাট ১৫% (ঐচ্ছিক ইনভয়েসযোগ্য):</span>
                <span className="font-bold">৳ {result.advocateVat.toLocaleString("bn-BD")}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 text-center">
              সূত্র: {result.legalBasisBn}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
