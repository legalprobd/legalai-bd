"use client";

import React, { useState, useEffect } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Briefcase,
  Award,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  PieChart,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Chamber Analytics & Financial Forecasting (মডিউল ১৫)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              চেম্বার পারফরম্যান্স ও আর্থিক পূর্বাভাস
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ল ফার্মের মামলা নিষ্পত্তির হার (Win Rate), আইনজীবীদের বিলিং ঘণ্টা এবং আগামী মাসগুলোর সম্ভাব্য আয়ের রিয়েল-টাইম ড্যাশবোর্ড।
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>আইনজীবী-মক্কেল গোপনীয়তা সুরক্ষিত</span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মাসিক মোট আয় (Revenue)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                ৳
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">৳ ৩,৪৫,০০০</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+ ১৮.৪% পূর্ববর্তী মাসের তুলনায়</span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">বকেয়া বিলিং (Outstanding)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">৳ ১,২০,০০০</div>
            <div className="text-xs text-amber-600 font-medium mt-2">
              ৩ জন মক্কেলের ইনভয়েস পেন্ডিং
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">মামলা নিষ্পত্তির সাফল্য (Win Rate)</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">৮৭.৫%</div>
            <div className="text-xs text-indigo-600 font-bold mt-2">
              বিগত ১২ মাসের রেকর্ড
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">বিলিং ট্র্যাকিং (Time Billed)</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">১৪২ ঘণ্টা</div>
            <div className="text-xs text-slate-400 font-medium mt-2">
              গড় রেট: ৳ ২,৫০০ / ঘণ্টা
            </div>
          </div>
        </div>

        {/* Charts & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Revenue Forecast Chart */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  মাসভিত্তিক চেম্বার আয় ও আগামী ৩ মাসের সম্ভাব্য পূর্বাভাস (Financial Projection)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  নির্ধারিত শুনানির সংখ্যা ও রিটেইনার চুক্তির ভিত্তিতে ডেটা চালিত পূর্বাভাস।
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                ২০২৬ অর্থবছর
              </span>
            </div>

            {/* Simulated Bar Graph */}
            <div className="space-y-4 text-xs">
              {[
                { month: "জানুয়ারি", actual: "৳ ২,৮০,০০০", pct: 70, type: "বাস্তব" },
                { month: "ফেব্রুয়ারি", actual: "৳ ৩,১০,০০০", pct: 78, type: "বাস্তব" },
                { month: "মার্চ", actual: "৳ ৩,৪৫,০০০", pct: 86, type: "বাস্তব" },
                { month: "এপ্রিল (পূর্বাভাস)", actual: "৳ ৩,৯০,০০০", pct: 95, type: "পূর্বাভাস" },
                { month: "মে (পূর্বাভাস)", actual: "৳ ৪,২০,০০০", pct: 100, type: "পূর্বাভাস" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold text-[11px]">
                    <span className="text-slate-700">
                      {item.month} {item.type === "পূর্বাভাস" && <span className="text-indigo-500 font-bold">(Projected)</span>}
                    </span>
                    <span className="text-slate-900 font-bold">{item.actual}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.type === "পূর্বাভাস"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lawyer Performance Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>আইনজীবীদের পারফরম্যান্স রেশিও</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      ব্যারিস্টার এম. এ. রহমান
                    </h4>
                    <span className="text-[10px] text-slate-400">সিনিয়র অ্যাডভোকেট / পার্টনার</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">৯৫% উইন রেট</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
                  <span>বিলিং আওয়ার: ৯২ ঘণ্টা</span>
                  <span className="font-bold text-slate-700">৳ ২,৩০,০০০</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      তানভীর আহমেদ
                    </h4>
                    <span className="text-[10px] text-slate-400">জুনিয়র অ্যাসোসিয়েট</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600">৮২% উইন রেট</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
                  <span>বিলিং আওয়ার: ৫০ ঘণ্টা</span>
                  <span className="font-bold text-slate-700">৳ ১,১৫,০০০</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
