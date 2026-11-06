"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  AlertTriangle,
  Scale,
  CheckCircle2,
  FileText,
  UserX,
  Sparkles,
  Info,
} from "lucide-react";

export default function ConflictCheckPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{
    hasConflict: boolean;
    conflicts: Array<{
      type: string;
      caseId: string;
      caseTitle: string;
      matchedName: string;
      roleBn: string;
      ethicalAdviceBn: string;
    }>;
    ethicalStandardBn?: string;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;

    try {
      setIsSearching(true);
      const res = await fetch("/api/conflict-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameOrQuery: query }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setResult(json.data);
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>বাংলাদেশ বার কাউন্সিল এথিক্স ও ক্যাননস অফ প্রফেশনাল কন্ডাক্ট (মডিউল ১২)</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            স্বয়ংক্রিয় কনফ্লিক্ট অফ ইন্টারেস্ট চেকার
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            নতুন মক্কেল বা মোকদ্দমা গ্রহণের পূর্বে চেম্বারের সংরক্ষিত সকল মামলা, বাদী, বিবাদী, প্রতিপক্ষের আইনজীবী ও সাক্ষীদের ডাটাবেজ স্বয়ংক্রিয়ভাবে স্ক্যান করে পেশাগত স্বার্থের সংঘাত প্রতিরোধ করুন।
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="মক্কেল, বিবাদী বা প্রতিপক্ষের আইনজীবীর নাম বা ফোন নম্বর লিখুন..."
                className="w-full pl-12 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || query.trim().length < 2}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSearching ? "স্ক্যান করা হচ্ছে..." : "এথিক্স ও স্বার্থের সংঘাত স্ক্যান করুন"}</span>
            </button>
          </form>

          {/* Helper Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <span>দ্রুত যাচাইয়ের জন্য চেষ্টা করুন:</span>
            <button
              type="button"
              onClick={() => setQuery("করিম মিয়া")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition cursor-pointer"
            >
              &quot;করিম মিয়া&quot; (আসামি/বিবাদী)
            </button>
            <button
              type="button"
              onClick={() => setQuery("মো. রফিকুল ইসলাম")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition cursor-pointer"
            >
              &quot;মো. রফিকুল ইসলাম&quot; (প্রতিপক্ষের আইনজীবী)
            </button>
            <button
              type="button"
              onClick={() => setQuery("কুদ্দুস তালুকদার")}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition cursor-pointer"
            >
              &quot;কুদ্দুস তালুকদার&quot; (মক্কেল/বিবাদী)
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {result.hasConflict ? (
              <div className="p-6 bg-rose-50 rounded-3xl border border-rose-200 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                        স্বার্থের সংঘাত শনাক্ত (Conflict Detected)
                      </span>
                      <span className="text-xs text-rose-600 font-bold">
                        {result.conflicts.length}টি সম্ভাব্য বিরোধ পাওয়া গেছে
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      উক্ত পক্ষ বা ব্যক্তির সাথে চেম্বারের বর্তমান বা পূর্বের মামলার সরাসরি স্বার্থের সংঘাত রয়েছে!
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      পেশাগত দায়িত্ব ও বার কাউন্সিলের নৈতিকতা রক্ষার্থে এই মক্কেল গ্রহণ করা থেকে বিরত থাকা বা লিখিত ছাড়পত্র গ্রহণ আবশ্যক।
                    </p>

                    <div className="mt-5 space-y-3">
                      {result.conflicts.map((conf, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                              <UserX className="w-4 h-4 text-rose-500" />
                              <span>চিহ্নিত পক্ষ: <strong>{conf.matchedName}</strong></span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                              {conf.roleBn}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mb-2">
                            সংশ্লিষ্ট মামলা: <strong>{conf.caseTitle}</strong> (আইডি: {conf.caseId})
                          </p>
                          <div className="p-3 bg-rose-50/60 rounded-xl text-xs text-rose-800 border border-rose-100">
                            <strong>আইনি নির্দেশনা:</strong> {conf.ethicalAdviceBn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                      কোনো সংঘাত নেই (Conflict Clear)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    &quot;{query}&quot; এর বিরুদ্ধে কোনো স্বার্থের সংঘাত (Conflict of Interest) পাওয়া যায়নি।
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    আপনি নিশ্চিন্তে এই নতুন মক্কেলের ওকালতনামা ও মামলা গ্রহণ করতে পারেন।
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
