"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  FileSearch,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Printer,
  Copy,
  Check,
  Scale,
  HelpCircle,
  ArrowRight,
  ListOrdered,
  Lightbulb,
} from "lucide-react";
import { ContractReviewResult } from "@/app/api/contract-review/route";

const SAMPLE_CONTRACTS = [
  {
    title: "১. জমি বিক্রয়ের বায়নানামা চুক্তি (অসম্পূর্ণ ও ঝুঁকিপূর্ণ)",
    text: `বায়নানামা চুক্তিপত্র
১ম পক্ষ (বিক্রেতা): জনাব রফিকুল ইসলাম, সাং- মিরপুর, ঢাকা।
২য় পক্ষ (ক্রেতা): জনাব কামাল হোসেন, সাং- ধানমন্ডি, ঢাকা।

অদ্য ১ম পক্ষ তাহার মালিকানাধীন মিরপুর থানাধীন মৌজা- সেনপাড়া পর্বতা, সিএস ও এসএ খতিয়ান নং ১২০, আরএস খতিয়ান নং ৩৪০ এর নালিশি ৫ কাঠা জমি মোট ১,৫০,০০,০০০/- (এক কোটি পঞ্চাশ লক্ষ) টাকায় বিক্রয়ের প্রস্তাব করিলে ২য় পক্ষ সম্মত হইয়া অদ্য অগ্রিম বায়ানাবাবদ নগদ ২০,০০,০০০/- (বিশ লক্ষ) টাকা প্রদান করিলেন।

শর্তাবলী:
১। আগামী ৬ মাসের মধ্যে ২য় পক্ষ বাকি ১,৩০,০০,০০০/- টাকা পরিশোধ করিয়া সাফ-কবলা দলিল সম্পাদন ও রেজিস্ট্রি করাইয়া লইবেন।
২। যদি ২য় পক্ষ নির্দিষ্ট মেয়াদে বাকি টাকা পরিশোধে ব্যর্থ হন, তবে বায়ানার ২০ লক্ষ টাকা সম্পূর্ণ বাজেয়াপ্ত ও জরিমানা বলিয়া গণ্য হইবে।
৩। ১ম পক্ষ উক্ত জমিতে কোনো মামলা-মোকদ্দমা নাই বলিয়া নিশ্চয়তা দিতেছেন।

স্বাক্ষীগণের স্বাক্ষর:
১। মোঃ জহির
২। মোঃ আলমগীর`,
  },
  {
    title: "২. বাণিজ্যিক দোকান ভাড়া চুক্তি (মধ্যম ঝুঁকি)",
    text: `বাণিজ্যিক দোকানঘর ভাড়া চুক্তিপত্র
মালিক: জনাব হাজী আব্দুল করিম।
ভাড়াটিয়া: স্মার্ট ফ্যাশন লিমিটেড পক্ষে এমডি।

উত্তরা সেক্টর ৩, প্লট ১২ এর নিচতলার ৫০০ বর্গফুটের দোকানঘরটি মাসিক ৫০,০০০/- (পঞ্চাশ হাজার) টাকা ভাড়ায় ৩ (তিন) বছরের জন্য ভাড়া প্রদান করা হইল। অগ্রিম জামানত বাবদ ৫,০০,০০০/- টাকা গ্রহণ করা হইল।

শর্তাবলী:
১। প্রতি মাসের ভাড়া পরবর্তী মাসের ৭ তারিখের মধ্যে প্রদেয় হইবে।
২। বিদ্যুৎ, পানি ও ইউটিলিটি বিল ভাড়াটিয়া নিজ দায়িত্বে পরিশোধ করিবেন।
৩। কোনো পক্ষ চুক্তি বাতিল করিতে চাহিলে উভয় পক্ষের সম্মতিতে সিদ্ধান্ত হইবে।
৪। মেয়াদান্তে জামানতের টাকা কোনো কর্তন ছাড়া ফেরত দেওয়া হইবে।`,
  },
];

export default function ContractReviewPage() {
  const [contractText, setContractText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ContractReviewResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleScan = async () => {
    if (!contractText.trim() || contractText.trim().length < 15) {
      setErrorMsg("অনুগ্রহ করে চুক্তিপত্র বা দলিলের পর্যাপ্ত পাঠ্য (কমপক্ষে ১৫ অক্ষর) লিখুন বা পেস্ট করুন।");
      return;
    }

    try {
      setErrorMsg(null);
      setIsScanning(true);
      const res = await fetch("/api/contract-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setScanResult(json.data);
      } else {
        setErrorMsg(json.error || "নিরীক্ষা সম্পন্ন করতে ব্যর্থ হয়েছে।");
      }
    } catch {
      setErrorMsg("সার্ভারে সংযোগে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsScanning(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!scanResult) return;
    const report = `=== LegalAI BD - Contract Review Audit Report ===\nঝুঁকির মাত্রা: ${scanResult.riskScore}\n\nমূল সারসংক্ষেপ:\n${scanResult.overallSummaryBn}\n\nঅনুপস্থিত বা বাদ পড়া ধারা:\n${scanResult.missingClausesBn.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nঅন্যায্য বা একতরফা শর্তাবলী:\n${scanResult.unfairTermsBn.map((u, i) => `${i + 1}. ${u}`).join("\n")}\n\nআইনজীবীর জন্য কৌশলগত পরামর্শ:\n${scanResult.legalAdviceBn.map((a, i) => `${i + 1}. ${a}`).join("\n")}`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskBadge = (score: "LOW" | "MEDIUM" | "HIGH") => {
    switch (score) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>উচ্চ ঝুঁকি (HIGH RISK)</span>
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>মাঝারি ঝুঁকি (MEDIUM RISK)</span>
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>নিম্ন ঝুঁকি (LOW RISK - নিরাপদ)</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Deed & Contract Reviewer • Advanced AI Engine (Tier 2)</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              চুক্তিপত্র ও দলিল এআই নিরীক্ষা (Contract & Deed Audit)
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              বাংলাদেশ চুক্তি আইন ১৮৭২, রেজিস্ট্রেশন আইন ১৯০৮ ও সালিশ আইন ২০০১ এর আলোকে যে কোনো চুক্তি, বায়ানানামা বা দলিলের আইনি ফাঁকফোকর, অনুপস্থিত ধারা ও অন্যায্য শর্ত এক ক্লিকে চিহ্নিত করুন।
            </p>
          </div>

          {/* Quick Presets */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">নমুনা চুক্তিপত্র লোড করুন:</span>
            {SAMPLE_CONTRACTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setContractText(sample.text);
                  setErrorMsg(null);
                }}
                className="text-xs bg-white hover:bg-slate-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 transition shadow-2xs"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Main Grid: Input Left, Analysis Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Column */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>চুক্তিপত্র বা দলিলের পাঠ্য (Text) পেস্ট করুন</span>
                </h2>
                <span className="text-[11px] text-slate-500 font-mono">
                  {contractText.length} অক্ষর
                </span>
              </div>

              <div>
                <textarea
                  rows={14}
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="এখানে বায়ানানামা, বিক্রয় চুক্তি, দোকান/বাসা ভাড়া চুক্তি, লিগ্যাল নোটিশ বা আমমোক্তারনামার পূর্ণাঙ্গ পাঠ্য পেস্ট করুন..."
                  className="w-full text-xs font-sans leading-relaxed p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setContractText("");
                    setScanResult(null);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  টেক্সট মুছুন
                </button>

                <button
                  type="button"
                  disabled={isScanning || !contractText.trim()}
                  onClick={handleScan}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 transition"
                >
                  {isScanning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>এআই নিরীক্ষা চলছে...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>চুক্তিপত্র এআই অডিট করুন (Analyze)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm min-h-[500px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-indigo-600" />
                    <span>আইনি নিরীক্ষা ফলাফল ও ঝুঁকি রিপোর্ট</span>
                  </h2>

                  {scanResult && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        title="রিপোর্ট কপি করুন"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "কপি হয়েছে" : "কপি"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        title="রিপোর্ট প্রিন্ট করুন"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>প্রিন্ট</span>
                      </button>
                    </div>
                  )}
                </div>

                {!scanResult ? (
                  <div className="p-12 text-center text-slate-400">
                    <HelpCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">কোনো নিরীক্ষা এখনও চালানো হয়নি</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      বাম পাশের বক্সে চুক্তিপত্রের ড্রাফট পেস্ট করে "চুক্তিপত্র এআই অডিট করুন" বাটনে ক্লিক করুন।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Overall Score Banner */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          সামগ্রিক আইনি ঝুঁকির মাত্রা
                        </span>
                        {getRiskBadge(scanResult.riskScore)}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-500">আইনগত অনুশাসন:</span>
                        <p className="text-xs font-bold text-slate-800">The Contract Act, 1872</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-100">
                      <strong className="text-indigo-950 font-bold block mb-1">সারসংক্ষেপ মূল্যায়ন:</strong>
                      <p>{scanResult.overallSummaryBn}</p>
                    </div>

                    {/* Missing Clauses */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 text-rose-700">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        <span>অত্যাবশ্যকীয় অনুপস্থিত ধারা (Missing Critical Clauses):</span>
                      </h3>
                      <ul className="space-y-1.5">
                        {scanResult.missingClausesBn.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2"
                          >
                            <span className="font-bold text-rose-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Unfair / Risky Terms */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 text-amber-700">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>অন্যায্য বা একতরফা শর্তাবলী (Unfair / Risky Terms):</span>
                      </h3>
                      <ul className="space-y-1.5">
                        {scanResult.unfairTermsBn.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2"
                          >
                            <span className="font-bold text-amber-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Strategic Legal Advice */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 text-indigo-700">
                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                        <span>আইনজীবীর জন্য কৌশলগত সুপারিশ (Strategic Advice):</span>
                      </h3>
                      <ul className="space-y-1.5">
                        {scanResult.legalAdviceBn.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs p-2 rounded-lg bg-indigo-50/60 border border-indigo-200 text-indigo-950 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {scanResult && (
                <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                  LegalAI BD v3.0 Contract Audit Engine • পেশাগত সতর্কতার সাথে পুনর্বিবেচনা আবশ্যক
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
