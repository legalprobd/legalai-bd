"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CaseRecord } from "@/lib/ai/schemas";
import {
  Scale,
  Plus,
  Search,
  FileText,
  Calendar,
  CreditCard,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Users,
  ChevronRight,
  ShieldAlert,
  FolderOpen,
  CheckCircle2,
  FileCheck2,
  Printer,
  BookOpen,
  FileSearch,
  ExternalLink,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnalyticsAndActivity } from "@/components/dashboard/AnalyticsAndActivity";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

export default function HomePage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<
    Array<{ id: string; caseId: string; caseTitle: string; date: string; purpose: string; courtName?: string | null }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showNewModal, setShowNewModal] = useState(false);
  const [urgentLimitationCases, setUrgentLimitationCases] = useState<CaseRecord[]>([]);
  const [criticalOrExpiredLimitations, setCriticalOrExpiredLimitations] = useState<CaseRecord[]>([]);

  // New Case Modal State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("AUTO");
  const [newStatement, setNewStatement] = useState("");
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cases");
      const json = await res.json();
      if (json.ok) {
        setCases(json.data);
      }
    } catch (e) {
      console.error("Failed to load cases", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingHearings = async () => {
    try {
      const res = await fetch("/api/hearings/upcoming?days=7");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setUpcomingHearings(json.data);
      }
    } catch (e) {
      console.error("Failed to load upcoming hearings", e);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchUpcomingHearings();
  }, []);

  useEffect(() => {
    if (cases.length === 0) return;
    const now = Date.now();
    const urgent = cases.filter((c) => {
      if (!c.limitationDeadline) return false;
      const diffDays = (new Date(c.limitationDeadline).getTime() - now) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });
    const critical = cases.filter((c) => {
      if (!c.limitationDeadline) return false;
      const diffDays = (new Date(c.limitationDeadline).getTime() - now) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
    setUrgentLimitationCases(urgent);
    setCriticalOrExpiredLimitations(critical);
  }, [cases]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatement.trim()) return;

    try {
      setIsSubmittingNew(true);
      const shouldAutoTitle =
        !newTitle.trim() || (newTitle.includes("করিম") && !newStatement.includes("করিম"));

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: shouldAutoTitle ? undefined : newTitle,
          category: newCategory === "AUTO" ? undefined : newCategory,
          rawStatement: newStatement,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setShowNewModal(false);
        setNewTitle("");
        setNewStatement("");
        window.location.href = `/case/${json.data.id}`;
      } else {
        alert(json.error?.messageBn || "মামলা তৈরি ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rawStatement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalCases = cases.length;
  const interviewingCount = cases.filter((c) => c.status === "INTERVIEWING").length;

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col antialiased">
      {/* Global Unified Navbar */}
      <AppNavbar />

      <div className="flex-1 flex w-full">
        {/* Persistent Unified Sidebar */}
        <Sidebar />

        {/* Main Content Area - Full Wide Screen */}
        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Executive Judicial Header */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>বাংলাদেশ বার কাউন্সিল ও সুপ্রিম কোর্ট প্র্যাকটিস</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    সনদ: BC/DH/2018/4892 • রহমান অ্যান্ড পার্টনার্স
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  চেম্বার কমান্ড সেন্টার ও কোর্ট ডায়েরি
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  দৈনিক আদালতের হাজিরা স্লিপ, সময় প্রার্থনার পিটিশন, আরজি ড্রাফটিং, তামাদি অ্যালার্ট ও সুপ্রিম কোর্ট নজির গবেষণা সমন্বিত ডিজিটাল চেম্বার।
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>নতুন মামলা শুরু করুন</span>
                </button>
                <Link
                  href="/court-essentials"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-700"
                >
                  <FileCheck2 className="w-4 h-4 text-blue-400" />
                  <span>আজকের কোর্ট ফাইল</span>
                </Link>
                <Link
                  href="/calendar"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-700"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>কোর্ট কজলিস্ট</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Today's Court Board & Hearing Docket */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    আজকের আদালত কার্যতালিকা ও শুনানি বোর্ড (Today&apos;s Court Board)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    আজকের ধার্য তারিখে নির্ধারিত মামলার তালিকা ও তাৎক্ষণিক ফাইলিং স্লিপ
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/court-essentials"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>আজকের সব হাজিরা একসাথে প্রিন্ট করুন</span>
                </Link>
              </div>
            </div>

            {upcomingHearings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-xs text-slate-500">আজকের তারিখে কোনো আদালত শুনানি ধার্য নেই।</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">বিজ্ঞ আদালত</th>
                      <th className="py-2.5 px-3">মামলা ও মক্কেল</th>
                      <th className="py-2.5 px-3">ধার্য তারিখ ও কার্যক্রম</th>
                      <th className="py-2.5 px-3 text-right">আদালতের জরুরি ফাইলিং</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {upcomingHearings.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {h.courtName || "বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত"}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{h.caseTitle}</div>
                          <div className="text-[11px] text-slate-500">নথি আইডি: {h.caseId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {new Date(h.date).toLocaleDateString("bn-BD")}
                          </span>
                          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                            {h.purpose || "চার্জ শুনানি / হাজিরা"}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <Link
                            href={`/court-essentials?caseNo=${encodeURIComponent(h.caseTitle)}&court=${encodeURIComponent(h.courtName || "বিজ্ঞ আদালত")}&type=hazira`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            <span>হাজিরা স্লিপ</span>
                          </Link>
                          <Link
                            href={`/court-essentials?caseNo=${encodeURIComponent(h.caseTitle)}&court=${encodeURIComponent(h.courtName || "বিজ্ঞ আদালত")}&type=time_petition`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition"
                          >
                            <Clock className="w-3 h-3" />
                            <span>সময় দরখাস্ত</span>
                          </Link>
                          <Link
                            href={`/case/${h.caseId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition"
                          >
                            <span>নথি খুলুন</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Urgent Limitations Alert Banner */}
          {criticalOrExpiredLimitations.length > 0 && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-rose-950 shadow-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-950">
                  সতর্কতা: {criticalOrExpiredLimitations.length}টি মামলায় জরুরি তামাদি সময়সীমা বিদ্যমান!
                </h4>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  তামাদি আইনের বিধানমতে নির্ধারিত মেয়াদের মধ্যে মামলা বা আরজি দাখিল না করলে প্রতিকার তামাদি বারিত হতে পারে।
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {criticalOrExpiredLimitations.map((c) => (
                    <Link
                      key={c.id}
                      href={`/case/${c.id}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-rose-200/60 hover:bg-rose-200 text-rose-900 px-3 py-1 rounded-lg border border-rose-300 transition"
                    >
                      <span>{c.title}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4 Core Executive Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>মোট নথিভুক্ত মামলা</span>
                <FolderOpen className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalCases}টি</div>
              <span className="text-[10px] text-slate-500 font-medium">চেম্বার ডাটাবেস সক্রিয়</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>খসড়া অপেক্ষমাণ</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700 mt-1">{interviewingCount}টি</div>
              <span className="text-[10px] text-amber-800 font-medium">আইনি বিশ্লেষণ চলমান</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>আসন্ন শুনানি (৭ দিন)</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700 mt-1">{upcomingHearings.length}টি</div>
              <Link href="/calendar" className="text-[10px] text-blue-700 hover:underline font-semibold">
                সম্পূর্ণ কজলিস্ট →
              </Link>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>জরুরি তামাদি (৩০ দিন)</span>
                <Clock className="w-4 h-4 text-rose-600" />
              </div>
              <div className={`text-2xl font-black mt-1 ${urgentLimitationCases.length > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                {urgentLimitationCases.length}টি
              </div>
              <span className="text-[10px] text-slate-500 font-medium">The Limitation Act 1908</span>
            </div>
          </div>

          {/* Quick AI & Legal Utilities Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/court-essentials"
              className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all group shadow-2xs"
            >
              <FileCheck2 className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">হাজিরা ও সময় প্রার্থনা</div>
              <div className="text-[10px] text-slate-500 mt-0.5">১-ক্লিকে আদালতের স্লিপ ও দরখাস্ত</div>
            </Link>

            <Link
              href="/court-fee/tr4"
              className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all group shadow-2xs"
            >
              <Printer className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">টিআর-৪ ট্রেজারি চালান</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ব্যাংক চালানের প্রিন্ট ফরম্যাট</div>
            </Link>

            <Link
              href="/precedent"
              className="p-4 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all group shadow-2xs"
            >
              <BookOpen className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">সুপ্রিম কোর্ট নজির (DLR)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ল্যান্ডমার্ক সিদ্ধান্তের ডেটাবেস</div>
            </Link>

            <Link
              href="/contract-review"
              className="p-4 bg-white hover:bg-purple-50/50 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all group shadow-2xs"
            >
              <FileSearch className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-900 group-hover:text-purple-700">চুক্তিপত্র ও দলিল অডিট</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ঝুঁকি ও অপ্রতুল শর্ত চিহ্নিতকরণ</div>
            </Link>
          </div>

          {/* 6-Month Filing Trends & Recent Activity Feed */}
          <AnalyticsAndActivity cases={cases} />

          {/* Active Case Dockets Master Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="মামলার শিরোনাম, ধারা বা আসামির নামে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-600 text-slate-800 placeholder:text-slate-400 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "Criminal", "Civil", "Special_Tribunal", "General"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat === "ALL"
                      ? "সকল মামলা"
                      : cat === "Criminal"
                      ? "ফৌজদারি"
                      : cat === "Civil"
                      ? "দেওয়ানি"
                      : cat === "General"
                      ? "সাধারণ পরামর্শ"
                      : "বিশেষ ট্রাইব্যুনাল"}
                  </button>
                ))}
              </div>
            </div>

            {/* Cases List */}
            {loading ? (
              <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500 font-semibold">মামলার তালিকা লোড হচ্ছে...</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">কোনো মামলা পাওয়া যায়নি</p>
                <p className="text-xs text-slate-400 mt-1">
                  নতুন মামলা শুরু করতে উপরের &quot;নতুন মামলা শুরু করুন&quot; বোতামে ক্লিক করুন।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/case/${c.id}`}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            c.category === "General"
                              ? "bg-slate-100 text-slate-700 border-slate-300"
                              : c.category === "Civil"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : c.category === "Criminal"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {c.category === "General"
                            ? "সাধারণ পরামর্শ"
                            : c.category === "Criminal"
                            ? "ফৌজদারি মোকদ্দমা"
                            : c.category === "Civil"
                            ? "দেওয়ানি মামলা"
                            : "বিশেষ ট্রাইব্যুনাল"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {c.completenessScore}% প্রস্তুত
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {c.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {c.rawStatement}
                      </p>

                      {/* Matched Laws Badges */}
                      {c.applicableLaws && c.applicableLaws.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {c.applicableLaws.slice(0, 3).map((l, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold"
                            >
                              ধারা {l.section}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{c.documents?.length || 0}টি প্রস্তুত আরজি</span>
                      <span className="text-slate-900 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>নথি খুলুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* New Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                <span>নতুন মামলা ও মক্কেল নথিভুক্তি</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  মামলার শিরোনাম বা মক্কেলের নাম (Title)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বসতবাড়িতে হামলা ও ভাঙচুর — করিম মিয়া"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-600 bg-slate-50/50 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>মামলার আইনি শ্রেণিবিভাগ (Category)</span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-600 bg-slate-50/50 text-slate-900 font-medium cursor-pointer"
                >
                  <option value="AUTO">স্বয়ংক্রিয় এআই শনাক্তকরণ (AI Auto-Detect)</option>
                  <option value="Criminal">ফৌজদারি (Criminal - মারধর / ভাঙচুর / দণ্ডবিধি / সিআর / এজাহার)</option>
                  <option value="Civil">দেওয়ানি (Civil - জমিজমা / আরজি / স্বত্ব ঘোষণা / নিষেধাজ্ঞা / বন্টন)</option>
                  <option value="Special_Tribunal">বিশেষ ট্রাইব্যুনাল (NI Act ১৩৮ চেক বাউন্স / সাইবার / অর্থ ঋণ)</option>
                  <option value="Family">পারিবারিক (Family - দেনমোহর / খোরপোশ / অভিভাবকত্ব)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    মক্কেলের ঘটনার বর্ণনা বা প্রাথমিক জবানবন্দি (বাংলা টেক্সট) *
                  </label>
                  <VoiceInputButton
                    onTranscript={(txt) => setNewStatement((prev) => (prev ? `${prev} ${txt}` : txt))}
                  />
                </div>
                <textarea
                  rows={5}
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="মক্কেলের মুখ থেকে শোনা বক্তব্য বাংলায় লিখুন বা পেস্ট করুন। যেমন: ঘটনার তারিখ, সময়, স্থান, বিবাদী বা আসামিদের নাম ও কী কী ক্ষয়ক্ষতি সংঘটিত হয়েছে..."
                  required
                  className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-400 focus:border-slate-600 bg-slate-50/50 text-slate-900 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew || !newStatement.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSubmittingNew ? "বিশ্লেষণ হচ্ছে..." : "মামলা তৈরি ও বিশ্লেষণ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
