"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Scale, AlertCircle, RefreshCw, User, ShieldAlert } from "lucide-react";
import { HearingItem } from "@/lib/ai/schemas";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";

interface EnrichedHearing extends HearingItem {
  caseTitle: string;
  caseNumber?: string | null;
  courtName?: string | null;
  notes?: string | null;
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      {/* Global Unified Navbar */}
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                বাংলাদেশ কোর্ট ক্যালেন্ডার ও দৈনিক কজলিস্ট (Cause List)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                আদালতের অবকাশ, ছুটির তালিকা ও পরবর্তী ধার্য তারিখ ট্র্যাকার
              </p>
            </div>
          </div>

          <button
            onClick={fetchHearings}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>রিফ্রেশ করুন</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Cause List / Hearings (8 cols) */}
          <section className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>আসন্ন শুনানির তালিকা ও কার্যতালিকা (Cause List)</span>
                </h2>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
                  {hearings.length}টি শুনানি ধার্য
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-slate-500">শুনানি লোড হচ্ছে...</p>
                </div>
              ) : hearings.length === 0 ? (
                <div className="p-12 text-center">
                  <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700">কোনো আসন্ন শুনানি নির্ধারিত নেই</p>
                  <p className="text-xs text-slate-400 mt-1">
                    মামলার ভেতরে শুনানি কার্ড থেকে পরবর্তী ধার্য তারিখ যোগ করতে পারেন।
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hearings.map((h) => (
                    <div
                      key={h.id}
                      className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 w-fit">
                          {h.caseNumber || "মামলা নথিভুক্ত"}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(h.date).toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900">{h.caseTitle}</h3>
                      <p className="text-xs text-slate-500 mt-1">{h.courtName || "বিজ্ঞ আদালত"}</p>

                      <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 text-xs">
                        <span className="font-bold text-slate-700">কার্যক্রম / উদ্দেশ্য: </span>
                        <span className="text-slate-600">{h.purpose}</span>
                        {h.notes && <p className="text-[11px] text-slate-400 mt-1 italic">{h.notes}</p>}
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/case/${h.caseId}/hearings`}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          মামলার কোর্ট ডায়েরি দেখুন →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Right: Bangladesh Court Holidays (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>বাংলাদেশ আদালত অবকাশ ও সরকারি ছুটি</span>
              </h2>

              <div className="space-y-3">
                {bdCourtHolidays.map((holiday, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-xs"
                  >
                    <p className="font-bold text-amber-900">{holiday.date}</p>
                    <p className="text-amber-800 mt-0.5">{holiday.reason}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
                * শুক্র ও শনিবার সাপ্তাহিক আদালত ছুটি। সুপ্রিম কোর্ট ও জেলা জজ আদালতের বার্ষিক অবকাশ তালিকা সংরক্ষিত।
              </div>
            </div>
          </aside>
        </div>
      </main>
      </div>
    </div>
  );
}
