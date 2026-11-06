"use client";

import React, { useState, useEffect } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { PrecedentRecord } from "@/lib/types/legalSuite";
import {
  BookOpen,
  Search,
  Scale,
  ExternalLink,
  BookMarked,
  ShieldAlert,
  Sparkles,
  FileText,
} from "lucide-react";

export default function LegalResearchPage() {
  const [precedents, setPrecedents] = useState<PrecedentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPrecedents = async (q: string = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/research?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setPrecedents(json.data);
      }
    } catch (e) {
      console.error("Failed to load precedents", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrecedents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrecedents(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Statutes & Case Law Citation Library (মডিউল ৬)</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            বাংলাদেশ আইনি গবেষণা ও নজির লাইব্রেরি (Precedents)
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            বাংলাদেশ সুপ্রিম কোর্টের আপিল বিভাগ ও হাইকোর্ট বিভাগের যুগান্তকারী নজিরসমূহ (DLR, BLC, MLR, ADC) এবং সংশ্লিষ্ট সংবিধিবদ্ধ আইনের সার্চযোগ্য ডিজিটাল ডাটাবেজ।
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সাইটেশন (যেমন: 54 DLR বা 18 BLC), মামলার বিষয়বস্তু বা কীওয়ার্ড দিয়ে অনুসন্ধান করুন..."
                className="w-full pl-12 pr-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>অনুসন্ধান করুন</span>
            </button>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <span>জনপ্রিয় অনুসন্ধান:</span>
            {["Section 138", "Penal Code 452", "Injunction", "Section 307 vs 326", "Dower"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  fetchPrecedents(tag);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">অনুসন্ধান চলছে...</div>
        ) : precedents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <BookMarked className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
            <p className="text-xs font-bold text-slate-600">কোনো আইনি নজির পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {precedents.map((prec) => (
              <div
                key={prec.id}
                className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-400 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {prec.citation}
                    </span>
                    <span className="text-xs text-slate-400">সাল: {prec.year}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{prec.court}</span>
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    {prec.parties}
                  </h3>
                  <p className="text-xs text-indigo-600 font-medium mt-1">
                    বিষয়বস্তু: {prec.subject}
                  </p>

                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">
                      মূল আইনি সিদ্ধান্ত (Ratio Decidendi):
                    </span>
                    {prec.ratioDecidendiBn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
