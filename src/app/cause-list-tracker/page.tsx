"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ListOrdered,
  Sparkles,
  Search,
  Building2,
  Calendar,
  Clock,
  Bell,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";

interface CauseListItem {
  itemNo: number;
  caseNo: string;
  parties: string;
  matter: string;
  advocate: string;
  status: "HEARING_NOW" | "NEXT" | "WAITING" | "PASSED_OVER" | "DISPOSED";
  isMyCase?: boolean;
}

export default function CauseListTrackerPage() {
  const [selectedCourt, setSelectedCourt] = useState("CMM_DHAKA");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("দুপুর ২:৪৫ মিনিট");

  const causeListsByCourt: Record<string, { courtName: string; benchOfficer: string; items: CauseListItem[] }> = {
    CMM_DHAKA: {
      courtName: "বিজ্ঞ চিফ জুডিশিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা (কোর্ট নং ৩)",
      benchOfficer: "জনাব আবুল কাশেম (পেশকার)",
      items: [
        { itemNo: 1, caseNo: "সি.আর. ৭১২/২০২৬", parties: "রাষ্ট্র বনাম শওকত আলী", matter: "চার্জ গঠন শুনানি", advocate: "এডভোকেট জহিরুল", status: "DISPOSED" },
        { itemNo: 2, caseNo: "সি.আর. ৭৪৫/২০২৬", parties: "রফিকুল বনাম সুমন", matter: "সাক্ষ্য গ্রহণ (PW-1)", advocate: "ব্যারিস্টার এম রহমান", status: "DISPOSED" },
        { itemNo: 3, caseNo: "সি.আর. ৭৮০/২০২৬", parties: "নাজমা বেগম বনাম করিম", matter: "জামিন শুনানি", advocate: "এডভোকেট সালাহউদ্দিন", status: "DISPOSED" },
        { itemNo: 4, caseNo: "সি.আর. ৮৩২/২০২৬", parties: "আঃ করিম বনাম মো. শামীম ও অন্যান্য", matter: "প্রকাশ্য ধূমপান ও ভাঙচুর — আসামির জবাব", advocate: "ব্যারিস্টার এম. এ. রহমান (চেম্বার)", status: "HEARING_NOW", isMyCase: true },
        { itemNo: 5, caseNo: "সি.আর. ৮৪০/২০২৬", parties: "হাসান ট্রেডার্স বনাম রূপালী", matter: "এনআই অ্যাক্ট ১৩৮ চেক ডিজঅনার", advocate: "এডভোকেট তারেক", status: "NEXT" },
        { itemNo: 6, caseNo: "সি.আর. ৮৫২/২০২৬", parties: "বোরহান উদ্দিন বনাম জাহিদ", matter: "দণ্ডবিধি ৪২০ প্রতারণা", advocate: "এডভোকেট মোর্শেদ", status: "WAITING" },
        { itemNo: 7, caseNo: "সি.আর. ৮৬০/২০২৬", parties: "ফারুক আহমেদ বনাম সোহেল", matter: "দণ্ডবিধি ৩২৩/৫০৬ মারধর ও হুমকি", advocate: "এডভোকেট লিয়াকত", status: "WAITING" },
      ],
    },
    HIGH_COURT_12: {
      courtName: "বাংলাদেশ সুপ্রিম কোর্ট — হাইকোর্ট বিভাগ (কোম্পানি ও রিট বেঞ্চ নং ১২)",
      benchOfficer: "জনাব রেজাউল করিম (সহকারী রেজিস্ট্রার)",
      items: [
        { itemNo: 1, caseNo: "Writ Petition 4512/2026", parties: "Meghna Cement Ltd vs Bangladesh", matter: "ভ্যাট ও কাস্টমস অব্যাহতি সংক্রান্ত", advocate: "Senior Adv. Kamal", status: "DISPOSED" },
        { itemNo: 2, caseNo: "Company Matter 89/2026", parties: "In Re: Padma Textiles Limited", matter: "কোম্পানি আইন ২৩৩ ধারা সংখ্যালঘু শেয়ারহোল্ডার", advocate: "Barrister M. A. Rahman (চেম্বার)", status: "HEARING_NOW", isMyCase: true },
        { itemNo: 3, caseNo: "Writ Petition 5014/2026", parties: "Abdur Rahim vs Land Ministry", matter: "অধিগ্রহণকৃত জমির ক্ষতিপূরণ রুল নিশি", advocate: "Adv. Shah Alam", status: "NEXT" },
        { itemNo: 4, caseNo: "Company Matter 104/2026", parties: "Prime Logistics Ltd vs Apex", matter: "কোম্পানি অবসায়ন (Winding up)", advocate: "Barrister Mahmud", status: "WAITING" },
      ],
    },
    CIVIL_DHAKA_1: {
      courtName: "বিজ্ঞ ১ম সহকারী জজ আদালত, ঢাকা সদর",
      benchOfficer: "জনাব মতিউর রহমান (সেরেস্তাদার)",
      items: [
        { itemNo: 1, caseNo: "দেওয়ানি মোকদ্দমা ১২/২০২৬", parties: "রহিম বনাম করিম", matter: "বাটোয়ারা আরজি জবাব দাখিল", advocate: "এডভোকেট নাজমুল", status: "DISPOSED" },
        { itemNo: 2, caseNo: "দেওয়ানি মোকদ্দমা ৪৫/২০২৬", parties: "শফিকুর রহমান বনাম আনোয়ার হোসেন", matter: "সিপিসি অর্ডার ৩৯ রুল ১/২ অন্তর্বর্তীকালীন নিষেধাজ্ঞা শুনানি", advocate: "ব্যারিস্টার এম. এ. রহমান (চেম্বার)", status: "NEXT", isMyCase: true },
        { itemNo: 3, caseNo: "দেওয়ানি মোকদ্দমা ৫৬/২০২৬", parties: "কামাল উদ্দিন বনাম ভূমি মন্ত্রণালয়", matter: "স্বত্ব ঘোষণা আরজি", advocate: "এডভোকেট মহসিন", status: "WAITING" },
      ],
    },
  };

  const currentList = causeListsByCourt[selectedCourt] || causeListsByCourt.CMM_DHAKA;

  const filteredItems = currentList.items.filter(
    (item) =>
      item.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.parties.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.matter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.advocate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myActiveCase = currentList.items.find((item) => item.isMyCase);

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
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  বাংলাদেশ আদালত কজলিস্ট লাইভ ট্র্যাকার (Daily Cause List & Live Serial Tracker)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  সুপ্রিম কোর্ট ও জেলা আদালতের দৈনিক কার্যতালিকা, লাইভ আইটেম ট্র্যাকিং ও আইনজীবী অ্যালার্ট
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>হালনাগাদ: {lastUpdated}</span>
              </span>
              <button
                type="button"
                onClick={() => setLastUpdated("এইমাত্র")}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>রিফ্রেশ</span>
              </button>
            </div>
          </div>

          {/* Active Case Live Tracker Callout */}
          {myActiveCase && (
            <div className="p-6 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 rounded-3xl text-white shadow-lg space-y-3 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                    <span>আপনার চেম্বারের মামলা সরাসরি ট্র্যাকিং হচ্ছে</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight">
                    {myActiveCase.caseNo} — {myActiveCase.parties}
                  </h3>
                  <p className="text-xs text-white/90">
                    বিষয়: {myActiveCase.matter} | আদালত: {currentList.courtName}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-white/10 p-3.5 rounded-2xl border border-white/20 backdrop-blur-xs">
                  <span className="text-[11px] block uppercase tracking-wider text-emerald-100 font-bold">
                    কজলিস্ট ক্রমিক
                  </span>
                  <span className="text-2xl font-black">আইটেম নং {myActiveCase.itemNo}</span>
                  <div className="mt-1">
                    {myActiveCase.status === "HEARING_NOW" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-emerald-950">
                        🟢 এজলাসে ডাক পড়েছে (Now Hearing)
                      </span>
                    )}
                    {myActiveCase.status === "NEXT" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950">
                        🟡 প্রস্তুত থাকুন (Next in Line)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">আদালত নির্বাচন:</span>
              <button
                type="button"
                onClick={() => setSelectedCourt("CMM_DHAKA")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCourt === "CMM_DHAKA"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ঢাকা সিএমএম কোর্ট নং ৩
              </button>
              <button
                type="button"
                onClick={() => setSelectedCourt("HIGH_COURT_12")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCourt === "HIGH_COURT_12"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                সুপ্রিম কোর্ট হাইকোর্ট বেঞ্চ নং ১২
              </button>
              <button
                type="button"
                onClick={() => setSelectedCourt("CIVIL_DHAKA_1")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCourt === "CIVIL_DHAKA_1"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ১ম সহকারী জজ আদালত ঢাকা
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="মামলা নং, পক্ষ বা আইনজীবীর নাম..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
              />
            </div>
          </div>

          {/* Cause List Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{currentList.courtName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">পেশকার: {currentList.benchOfficer}</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                মোট মামলা: {filteredItems.length}টি
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 text-center w-16">ক্রমিক</th>
                    <th className="py-3.5 px-4">মামলা নং</th>
                    <th className="py-3.5 px-4">পক্ষগণের নাম</th>
                    <th className="py-3.5 px-4">কার্যক্রম ও উদ্দেশ্য</th>
                    <th className="py-3.5 px-4">আইনজীবী</th>
                    <th className="py-3.5 px-4 text-right">আদালত স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.itemNo}
                      className={`hover:bg-slate-50/80 transition ${
                        item.isMyCase ? "bg-indigo-50/40 font-semibold" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-center font-black">
                        <span
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center ${
                            item.isMyCase
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.itemNo}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.caseNo}</span>
                          {item.isMyCase && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700">
                              আমার চেম্বার
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-[200px] truncate">{item.parties}</td>
                      <td className="py-4 px-4 text-slate-600">{item.matter}</td>
                      <td className="py-4 px-4 text-slate-500">{item.advocate}</td>
                      <td className="py-4 px-4 text-right">
                        {item.status === "HEARING_NOW" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            শুনানি চলছে
                          </span>
                        )}
                        {item.status === "NEXT" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            পরবর্তী ডাক
                          </span>
                        )}
                        {item.status === "WAITING" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            অপেক্ষমান
                          </span>
                        )}
                        {item.status === "DISPOSED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 line-through">
                            সম্পন্ন
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
