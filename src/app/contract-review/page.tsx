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
  ArrowRight,
  ShieldCheck,
  FileText,
  Lock,
} from "lucide-react";

export default function ContractReviewPage() {
  const [contractText, setContractText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    riskScore: number;
    loopholes: Array<{
      clauseTitle: string;
      riskLevel: "HIGH" | "MEDIUM" | "LOW";
      explanationBn: string;
      recommendationBn: string;
    }>;
  } | null>(null);

  const handleScan = () => {
    if (!contractText.trim()) return;
    setIsScanning(true);

    setTimeout(() => {
      const text = contractText.toLowerCase();
      const loopholes: Array<{
        clauseTitle: string;
        riskLevel: "HIGH" | "MEDIUM" | "LOW";
        explanationBn: string;
        recommendationBn: string;
      }> = [];

      // Check indemnity clause
      if (!text.includes("ক্ষতিপূরণ") && !text.includes("indemnity")) {
        loopholes.push({
          clauseTitle: "ক্ষতিপূরণ ও দায়মুক্তি ধারা অনুপস্থিত (Missing Indemnity Clause)",
          riskLevel: "HIGH",
          explanationBn: "চুক্তিতে স্পষ্ট ক্ষতিপূরণ (Indemnity) ধারা না থাকায় তৃতীয় পক্ষের ক্ষতির দায় আপনার মক্কেলের ওপর বর্তানোর বড় ঝুঁকি রয়েছে।",
          recommendationBn: "সুনির্দিষ্ট ক্ষতিপূরণ ধারা সংযোজন করে পক্ষদ্বয়ের সর্বোচ্চ দায়ের সীমা নির্ধারণ করুন।",
        });
      }

      // Check dispute resolution
      if (!text.includes("সালিশ") && !text.includes("arbitration") && !text.includes("বিরোধ")) {
        loopholes.push({
          clauseTitle: "বিরোধ নিষ্পত্তি ও সালিশি ধারা অনুপস্থিত (Missing Dispute Resolution)",
          riskLevel: "HIGH",
          explanationBn: "সালিশ আইন ২০০১ অনুযায়ী সুস্পষ্ট আরবিট্রেশন বা মেডিয়েশন ধারা না থাকায় বিরোধ দেখা দিলে বছরব্যাপী মামলা ঝুলে থাকবে।",
          recommendationBn: "ঢাকায় অবস্থিত আরবিট্রেশন বা আদালতের সুনির্দিষ্ট এখতিয়ার উল্লেখ করুন।",
        });
      }

      // Check penalty clause
      if (text.includes("জরিমানা") || text.includes("দণ্ড") || text.includes("penalty")) {
        loopholes.push({
          clauseTitle: "অযৌক্তিক জরিমানা বা পেনাল্টি ধারা (Harsh Penalty Clause)",
          riskLevel: "MEDIUM",
          explanationBn: "চুক্তি আইন ১৮৭২ এর ৭৪ ধারা অনুযায়ী অসামঞ্জস্যপূর্ণ জরিমানা আইনগতভাবে বাতিল ও অকার্যকর গণ্য হতে পারে।",
          recommendationBn: "পেনাল্টির পরিবর্তে বাস্তবসম্মত লিকুইডেটেড ড্যামেজ (Liquidated Damages) ধারা ব্যবহার করুন।",
        });
      }

      // Check termination notice
      if (!text.includes("নোটিশ") && !text.includes("বাতিল")) {
        loopholes.push({
          clauseTitle: "চুক্তি অবসানের নোটিশ মেয়াদ অস্পষ্ট (Unclear Termination Notice)",
          riskLevel: "MEDIUM",
          explanationBn: "কত দিনের লিখিত নোটিশে চুক্তি বাতিল করা যাবে তা নির্ধারিত না থাকায় চুক্তিভঙ্গের বিরোধ সৃষ্টি হবে।",
          recommendationBn: "কমপক্ষে ৩০ দিনের রেজিস্ট্রি ডাকযোগে লিখিত নোটিশের শর্ত সন্নিবেশ করুন।",
        });
      }

      const highCount = loopholes.filter((l) => l.riskLevel === "HIGH").length;
      const riskScore = highCount > 1 ? 78 : highCount === 1 ? 52 : 25;

      setScanResult({
        riskScore,
        loopholes,
      });
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 mb-2">
            <FileSearch className="w-3.5 h-3.5" />
            <span>AI Contract Review & Risk Assessment (মডিউল ৯)</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            চুক্তিপত্র ও দলিল রিভিউ — রিস্ক ও লুপহোল ডিটেক্টর
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            চুক্তিনামা, বায়নাপত্র বা পার্টনারশিপ ডিড পেস্ট করুন। এআই কয়েক সেকেন্ডে স্বার্থবিরোধী ধারা, অনুপস্থিত সুরক্ষা শর্ত এবং আইনি ঝুঁকি চিহ্নিত করবে।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Panel */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>চুক্তিপত্রের টেক্সট পেস্ট করুন</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setContractText(
                    "১ম পক্ষ এবং ২য় পক্ষের মধ্যে এই মর্মে চুক্তি সম্পাদিত হইল যে, ২য় পক্ষ আগামী ১ মাসের মধ্যে সফটওয়্যার ডেলিভারি দিবে। কোনো কারণে ডেলিভারি দিতে ব্যর্থ হইলে প্রতিদিন ৫০,০০০ টাকা হারে জরিমানা দিতে হইবে।"
                  )
                }
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                নমুনা চুক্তি পেস্ট করুন
              </button>
            </div>

            <textarea
              rows={12}
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="চুক্তিপত্র, সমঝোতা স্মারক বা আইনি দলিলের শর্তাবলী এখানে লিখুন বা পেস্ট করুন..."
              className="w-full text-xs p-4 border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 leading-relaxed font-mono"
            />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {contractText.length} অক্ষর
              </span>
              <button
                type="button"
                disabled={isScanning || !contractText.trim()}
                onClick={handleScan}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isScanning ? "বিশ্লেষণ হচ্ছে..." : "এআই রিস্ক স্ক্যান শুরু করুন"}</span>
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-5 space-y-4">
            {scanResult ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900">
                    ঝুঁকি মূল্যায়ন সূচক (Risk Index)
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      scanResult.riskScore > 60
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}
                  >
                    স্কোর: {scanResult.riskScore}/১০০ ({scanResult.riskScore > 60 ? "উচ্চ ঝুঁকি" : "মধ্যম ঝুঁকি"})
                  </span>
                </div>

                <div className="space-y-3">
                  {scanResult.loopholes.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertTriangle
                          className={`w-4 h-4 ${
                            item.riskLevel === "HIGH" ? "text-rose-600" : "text-amber-500"
                          }`}
                        />
                        <h4 className="font-bold text-xs text-slate-900">
                          {item.clauseTitle}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                        {item.explanationBn}
                      </p>
                      <div className="p-2.5 bg-white rounded-xl text-[11px] text-indigo-700 border border-indigo-100">
                        <strong>আইনি পরামর্শ:</strong> {item.recommendationBn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-300 text-center text-slate-400">
                <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <h4 className="text-xs font-bold text-slate-600 mb-1">
                  কোনো চুক্তি বিশ্লেষণ করা হয়নি
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  বামে চুক্তিপত্রের বিবরণ লিখে &quot;এআই রিস্ক স্ক্যান শুরু করুন&quot; বোতাম চাপুন।
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
