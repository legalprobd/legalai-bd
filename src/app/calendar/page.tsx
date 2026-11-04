"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Scale, AlertCircle, RefreshCw, User } from "lucide-react";
import { HearingItem } from "@/lib/ai/schemas";

interface EnrichedHearing extends HearingItem {
  caseTitle: string;
  caseNumber?: string | null;
  courtName?: string | null;
}

export default function CalendarPage() {
  const [hearings, setHearings] = useState<EnrichedHearing[]>([]);
  const [loading, setLoading] = useState(true);

  // Bangladesh Court Holidays list
  const bdCourtHolidays = [
    { date: "৭ নভেম্বর, ২০২৬", reason: "জাতীয় বিপ্লব ও সংহতি দিবস (কোর্ট অবকাশ)" },
    { date: "১৬ ডিসেম্বর, ২০২৬", reason: "মহান বিজয় দিবস (সরকারি ছুটি)" },
    { date: "২৫ ডিসেম্বর, ২০২৬", reason: "যিশুখ্রিষ্টের জন্মদিন (বড়দিন)" },
    { date: "২১ ফেব্রুয়ারি, ২০২৭", reason: "শহিদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস" },
    { date: "২৬ মার্চ, ২০২৭", reason: "স্বাধীনতা ও জাতীয় দিবস" },
  ];

  useEffect(() => {
    fetchHearings();
  }, []);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hearings/upcoming?days=60");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setHearings(json.data);
      }
    } catch (err) {
      console.error("Failed to load hearings:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900">
                বাংলাদেশ কোর্ট ক্যালেন্ডার ও দৈনিক কার্যতালিকা (Cause List)
              </h1>
              <p className="text-[11px] text-slate-500">
                আদালতের অবকাশ ও পরবর্তী ধার্য তারিখ ট্র্যাকার
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Cause List / Hearings (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>আসন্ন শুনানির তালিকা ও কার্যতালিকা (Cause List)</span>
              </h2>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded font-bold border border-indigo-200">
                {hearings.length}টি শুনানি ধার্য
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                <p className="text-xs">শুনানির তথ্য লোড হচ্ছে...</p>
              </div>
            ) : hearings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">কোনো আসন্ন শুনানি পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hearings.map((h) => {
                  const hDate = new Date(h.date);
                  return (
                    <div
                      key={h.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {h.caseNumber || "নম্বরবিহীন মামলা"}
                        </span>
                        <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {hDate.toLocaleDateString("bn-BD", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900">
                        {h.caseTitle}
                      </h3>

                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-700">আদালত:</strong> {h.courtName || "বিজ্ঞ আদালত"}
                        {h.judgeName && ` • ${h.judgeName}`}
                      </p>

                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                        <strong className="text-slate-800">কার্যক্রম / উদ্দেশ্য:</strong> {h.purpose}
                      </p>

                      {h.orderSheetBn && (
                        <p className="text-xs text-slate-600 italic">
                          পূর্ববর্তী আদেশ: {h.orderSheetBn}
                        </p>
                      )}

                      <div className="pt-2 flex justify-end">
                        <Link
                          href={`/case/${h.caseId}/hearings`}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          মামলার কোর্ট ডায়েরি দেখুন →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Bangladesh Court Holidays (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>বাংলাদেশ আদালত অবকাশ ও সরকারি ছুটি</span>
            </h3>

            <div className="space-y-2.5">
              {bdCourtHolidays.map((hol, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs"
                >
                  <p className="font-bold text-amber-900">{hol.date}</p>
                  <p className="text-slate-600 mt-0.5">{hol.reason}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t text-[11px] text-slate-500">
              * শুক্র ও শনিবার সাপ্তাহিক আদালত ছুটি। সুপ্রিম কোর্ট ও জেলা জজ আদালতের বার্ষিক অবকাশ তালিকা সংরক্ষিত।
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
