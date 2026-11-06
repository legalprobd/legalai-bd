"use client";

import React, { useState, useEffect } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  BookOpen,
  Search,
  Scale,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  Bookmark,
  Calendar,
  Building,
} from "lucide-react";
import { CasePrecedentItem } from "@/lib/precedents/seedPrecedents";

const CATEGORIES = [
  { id: "ALL", label: "সব নজির (All Precedents)" },
  { id: "BAIL", label: "জামিন ও রিমান্ড (Bail)" },
  { id: "CRIMINAL", label: "ফৌজদারি (Criminal)" },
  { id: "LAND", label: "দেওয়ানি ও জমি (Land)" },
  { id: "FAMILY", label: "পারিবারিক ও দেনমোহর (Family)" },
  { id: "NI_ACT", label: "চেক ডিজঅনার (NI Act)" },
  { id: "CONSTITUTIONAL", label: "সংবিধান ও রিট (Writ)" },
];

export default function PrecedentEnginePage() {
  const [precedents, setPrecedents] = useState<CasePrecedentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  const fetchPrecedents = async (q: string = "", cat: string = "ALL") => {
    try {
      setLoading(true);
      const categoryParam = cat !== "ALL" ? `&category=${cat}` : "";
      const res = await fetch(`/api/precedent/search?q=${encodeURIComponent(q)}${categoryParam}`);
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setPrecedents(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch precedents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrecedents(searchQuery, activeCategory);
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrecedents(searchQuery, activeCategory);
  };

  const handleCopyCitation = (citation: string, titleBn: string) => {
    const fullCitation = `${citation} (${titleBn})`;
    navigator.clipboard.writeText(fullCitation);
    setCopiedCitation(citation);
    setTimeout(() => setCopiedCitation(null), 2500);
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
              <span>Supreme Court Precedent Engine (DLR / BLC / ADC) • Tier 2 Advanced AI</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              সুপ্রিম কোর্ট নজির ও সাইটেশন সার্চ ইঞ্জিন
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              বাংলাদেশ সুপ্রিম কোর্টের আপিল বিভাগ ও হাইকোর্ট বিভাগের যুগান্তকারী ও সংবিধিবদ্ধ নজিরসমূহ (DLR, BLC, MLR) অনুসন্ধান করুন এবং সরাসরি মামলা ড্রাফটে যুক্ত করুন।
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কীওয়ার্ড (যেমন: জামিন, ৩০৭ ধারা, জমি, বায়নানামা, চেক ডিজঅনার, ৫৪ ধারা)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
              >
                অনুসন্ধান করুন
              </button>
            </form>

            {/* Category Filter Chips */}
            <div className="mt-3.5 flex gap-1.5 flex-wrap items-center pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
                <SlidersHorizontal className="w-3 h-3" /> ফিল্টার:
              </span>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  className={`text-[11px] px-3 py-1 rounded-full font-medium transition ${
                    activeCategory === c.id
                      ? "bg-indigo-700 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-slate-600">
              সর্বমোট প্রাপ্ত নজির: <strong className="text-slate-900 font-bold">{precedents.length}টি</strong>
            </div>
            {copiedCitation && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> সাইটেশন ক্লিপবোর্ডে কপি সম্পন্ন হয়েছে!
              </span>
            )}
          </div>

          {/* Results Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
              নজিরসমূহ লোড হচ্ছে...
            </div>
          ) : precedents.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">কোনো নজির খুঁজে পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 mt-1">অন্য কোনো কীওয়ার্ড বা সাইটেশন দিয়ে অনুসন্ধান করার চেষ্টা করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {precedents.map((p) => {
                const isCopied = copiedCitation === p.citation;
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Citation & Year */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-mono font-black">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{p.citation}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {p.year}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                        {p.titleBn}
                      </h3>

                      {/* Court */}
                      <div className="text-[11px] font-medium text-slate-500 mb-3 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{p.court}</span>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 text-justify">
                        {p.summaryBn}
                      </p>
                    </div>

                    {/* Footer: Keywords & Copy Button */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-500 truncate max-w-[65%]">
                        <span className="font-semibold text-slate-600">কীওয়ার্ড: </span>
                        {p.keywords}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCitation(p.citation, p.titleBn)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition shrink-0 ${
                          isCopied
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                        title="সাইটেশন কপি করুন"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>কপি সাইটেশন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
