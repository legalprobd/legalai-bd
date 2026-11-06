"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Calendar,
  FileCheck2,
  FileText,
  Calculator,
  BookOpen,
  FileSearch,
  Scale,
  Swords,
  CreditCard,
  Settings,
  Shield,
  PlusCircle,
  Clock,
  Printer,
  ChevronDown,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isCurrent = (path: string) => {
    if (path === "/dashboard" && (pathname === "/" || pathname === "/dashboard")) return true;
    return pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 hidden lg:flex flex-col justify-between min-h-[calc(100vh-65px)] select-none border-r border-slate-800 shadow-xl">
      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Action Button: New Case */}
        <div>
          <Link
            href="/dashboard?action=new"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>নতুন মামলা নথিভুক্ত করুন</span>
          </Link>
        </div>

        {/* Pillar 1: মেইন চেম্বার (Core Chamber) */}
        <div className="space-y-1.5">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>মেইন চেম্বার ও ডকেট</span>
          </div>
          <nav className="space-y-0.5">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/dashboard")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-amber-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>চেম্বার ড্যাশবোর্ড ও বোর্ড</span>
            </Link>

            <Link
              href="/calendar"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/calendar")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-amber-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>কোর্ট ক্যালেন্ডার ও কজলিস্ট</span>
            </Link>

            <Link
              href="/clients"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/clients")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-amber-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>মক্কেল ডিরেক্টরি ও যোগাযোগ</span>
            </Link>
          </nav>
        </div>

        {/* Pillar 2: দৈনিক আদালত ইউটিলিটি (Daily Court Essentials) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>দৈনিক আদালত ফাইলিং</span>
          </div>
          <nav className="space-y-0.5">
            <Link
              href="/court-essentials"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/court-essentials")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-blue-400" />
              <span>হাজিরা, সময় ও ওকালতনামা</span>
            </Link>

            <Link
              href="/court-fee/tr4"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/court-fee/tr4")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>টিআর-৪ ট্রেজারি চালান</span>
            </Link>

            <Link
              href="/court-fee"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/court-fee")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Calculator className="w-4 h-4 text-slate-400" />
              <span>কোর্ট ফি ক্যালকুলেটর</span>
            </Link>
          </nav>
        </div>

        {/* Pillar 3: লিগ্যাল এআই ও নজির গবেষণা (AI Intelligence & Research) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>এআই লিগ্যাল স্টুডিও</span>
          </div>
          <nav className="space-y-0.5">
            <Link
              href="/precedent"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/precedent") || isCurrent("/research")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>সুপ্রিম কোর্ট নজির (DLR/BLC)</span>
            </Link>

            <Link
              href="/contract-review"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/contract-review")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <FileSearch className="w-4 h-4 text-slate-400" />
              <span>চুক্তিপত্র ও দলিল অডিট</span>
            </Link>

            <Link
              href="/bail-predictor"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/bail-predictor")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Scale className="w-4 h-4 text-slate-400" />
              <span>জামিন ফলাফল পূর্বাভাস (BLAST)</span>
            </Link>

            <Link
              href="/mock-trial"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/mock-trial") || isCurrent("/cross-exam")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Swords className="w-4 h-4 text-slate-400" />
              <span>সাক্ষী জেরা ড্রিল (Mock Trial)</span>
            </Link>
          </nav>
        </div>

        {/* Pillar 4: চেম্বার ও সেটিংস (Administration) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>প্রশাসন ও হিসাব</span>
          </div>
          <nav className="space-y-0.5">
            <Link
              href="/billing"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/billing")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-purple-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>চেম্বার হিসাব ও লেজার</span>
            </Link>

            <Link
              href="/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/settings")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-purple-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>আইনজীবী সনদ ও প্রোফাইল</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isCurrent("/admin")
                  ? "bg-slate-800 text-white font-semibold border-l-3 border-purple-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Shield className="w-4 h-4 text-slate-400" />
              <span>অ্যাডমিন গভর্ন্যান্স</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Chamber Status Bar */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
            রপ
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">রহমান অ্যান্ড পার্টনার্স</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PRO চেম্বার সক্রিয়</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
