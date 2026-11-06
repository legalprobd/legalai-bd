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
  Mic,
  ShieldAlert,
  FolderOpen,
  CheckCircle2,
  HelpCircle,
  FileCheck,
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

  const handleQuickLoad = async (presetStatement: string, presetTitle: string, presetCategory: string) => {
    setNewStatement(presetStatement);
    setNewTitle(presetTitle);
    setNewCategory(presetCategory);
    setShowNewModal(true);
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      {/* Global Unified Navbar */}
      <AppNavbar />

      <div className="flex-1 flex w-full">
        {/* Persistent Unified Sidebar */}
        <Sidebar />

        {/* Main Content Area - Full Wide Screen */}
        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-8">
        {/* Welcome & 3-Step Guided Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                <Scale className="w-3.5 h-3.5 text-amber-500" />
                <span>বিজ্ঞ আইনজীবীদের স্মার্ট আইনি সহকারী</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                চেম্বার ড্যাশবোর্ড ও কেস ড্রাফটিং হাব
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                মক্কেলের মুখ থেকে সাধারণ ভাষায় ঘটনা শুনুন। এআই স্বয়ংক্রিয়ভাবে আইনের উপাদান বিশ্লেষণ করে প্রশ্ন করবে এবং আদালতের জন্য সঠিক ধারার আরজি বা এজাহার তৈরি করে দেবে।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন মামলা শুরু করুন</span>
              </button>
              <Link
                href="/calendar"
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-semibold transition border border-slate-200"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>কোর্ট কজলিস্ট</span>
              </Link>
            </div>
          </div>

          {/* Simple 3-Step Visual Process Guide */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>৩টি সহজ ধাপে কীভাবে কাজ করবেন:</span>
              </span>
              <span className="text-[11px] text-slate-400">সহজ ও পরিষ্কার পদ্ধতি</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ১
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    ঘটনার বিবরণ দিন (Intake)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    মক্কেলের মুখ থেকে শোনা বক্তব্য বাংলায় লিখুন বা মুখে বলুন।
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ২
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    আইনি প্রশ্নোত্তর ও জেরা (Questions)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    কোন তথ্যের ঘাটতি আছে তা এআই খুঁজে বের করবে। অপশন বেছে উত্তর দিন।
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ৩
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    আরজি ড্রাফট ও প্রিন্ট (Draft)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    ১-ক্লিকে আদালতের এজাহার বা আরজি তৈরি হবে। ওয়ার্ড বা পিডিএফে প্রিন্ট করুন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Demo Presets */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>সহজে পরখ করার জন্য তৈরি করা ডেমো কেস (Quick Demo Starters)</span>
            </h3>
            <span className="text-[11px] text-slate-400 hidden sm:inline">১-ক্লিকে পরীক্ষা করুন</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <button
              type="button"
              onClick={() =>
                handleQuickLoad(
                  "গতকাল রাতে পাশের বাড়ির করিম মিয়া তার লোকজন নিয়ে আমাদের বাসায় ঢুকে ভাঙচুর করেছে এবং আমার ভাইকে মেরে মাথা ফাটিয়ে দিয়েছে।",
                  "বাসায় হামলা ও ভাঙচুর — করিম মিয়া",
                  "Criminal"
                )
              }
              className="text-left p-4 rounded-2xl border border-slate-200 hover:border-red-300 bg-slate-50/50 hover:bg-red-50/40 transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full uppercase border border-red-200">
                ফৌজদারি মোকদ্দমা
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-2.5 group-hover:text-red-700 transition-colors">
                ১। বসতবাড়িতে হামলা ও মারপিট (করিম মিয়া)
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                দণ্ডবিধি ১৪৩/৪৫২/৩২৬/৩০৭/৩৮০ ধারা ও এজাহার/সি.আর.
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickLoad(
                  "বিবাদী আমার ব্যবসায়িক পাওনা বাবদ ৫০ লক্ষ টাকার একটি ব্যাংক চেক প্রদান করিয়াছিল। চেকটি ব্যাংকে জমা দিলে পর্যাপ্ত তহবিল না থাকায় ডিজঅনার মেমো সহ প্রত্যাখ্যাত হয়। পরবর্তীতে লিগ্যাল নোটিশ পাঠালেও সে টাকা পরিশোধ করেনি।",
                  "চেক ডিজঅনার মোকদ্দমা — ৫০ লক্ষ টাকা",
                  "Special_Tribunal"
                )
              }
              className="text-left p-4 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/40 transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase border border-blue-200">
                এন.আই. অ্যাক্ট ১৩৮ ধারা
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-2.5 group-hover:text-blue-700 transition-colors">
                ২। চেক ডিজঅনার ও টাকা আদায়
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                এন.আই. অ্যাক্ট ১৮৮১ এর ১৩৮ ধারা ও আইনি নোটিশ।
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickLoad(
                  "আমাদের পৈতৃক খরিদসূত্রে প্রাপ্ত নালিশি জমিতে বিবাদী দলবল নিয়ে জোরপূর্বক সীমানা প্রাচীর ভেঙে অনুপ্রবেশ করে এবং সেখানে অবৈধ স্থাপনা নির্মাণের পাঁয়তারা করছে। যেকোনো সময় দখলচ্যুত হওয়ার আশঙ্কা রয়েছে।",
                  "জমি দখল ও অবৈধ অনুপ্রবেশ — চিরস্থায়ী নিষেধাজ্ঞা",
                  "Civil"
                )
              }
              className="text-left p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/40 transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200">
                দেওয়ানি আরজি
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-2.5 group-hover:text-emerald-700 transition-colors">
                ৩। স্বত্ব ঘোষণা ও অন্তর্বর্তীকালীন নিষেধাজ্ঞা
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                সুনির্দিষ্ট প্রতিকার আইন ৪২/৫৪ ধারা ও দেওয়ানি আরজি।
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickLoad(
                  "প্রতিদিন আমার বাসার বারান্দার সামনে প্রকাশ্যে সিগারেট খায় শামীম। আমি বারবার তাকে মানা করার পরও সে এটা করেই যাচ্ছে। এতে পরিবারের শিশুদের স্বাস্থ্যহানি ঘটছে এবং আবাসিক শান্তি বিনষ্ট হচ্ছে।",
                  "বাসার সামনে প্রকাশ্য ধূমপান ও গণউপদ্রব — শামীম",
                  "Criminal"
                )
              }
              className="text-left p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/40 transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase border border-amber-200">
                পাবলিক নুইসেন্স ও জিডি (GD)
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-2.5 group-hover:text-amber-800 transition-colors">
                ৪। প্রকাশ্য ধূমপান ও গণউপদ্রব (শামীম)
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                ধূমপান নিয়ন্ত্রণ আইন ৪/৮ ধারা, দণ্ডবিধি ২৯০ ও থানায় সাধারণ ডায়েরি।
              </p>
            </button>
          </div>
        </div>

        {/* Urgent Limitations Alert Banner */}
        {criticalOrExpiredLimitations.length > 0 && (
          <div className="bg-rose-50 border border-rose-300 rounded-3xl p-5 text-rose-950 shadow-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
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
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-rose-200/60 hover:bg-rose-200 text-rose-900 px-3 py-1 rounded-xl border border-rose-300 transition"
                    >
                      <span>{c.title}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4 Core Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>মোট নথিভুক্ত মামলা</span>
              <FolderOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{totalCases}টি</div>
            <span className="text-[10px] text-indigo-600 font-semibold mt-1 inline-block">চেম্বার ডাটাবেস</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>খসড়া অপেক্ষমাণ</span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{interviewingCount}টি</div>
            <span className="text-[10px] text-amber-700 font-semibold mt-1 inline-block">ইন্টারোগেশন প্রক্রিয়াধীন</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>আসন্ন শুনানি (৭ দিন)</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600 mt-2">{upcomingHearings.length}টি</div>
            <Link href="/calendar" className="text-[10px] text-blue-600 hover:underline font-semibold mt-1 inline-block">
              ক্যালেন্ডার ও ডায়েরি দেখুন →
            </Link>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>জরুরি তামাদি (৩০ দিন)</span>
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <div className={`text-2xl font-black mt-2 ${urgentLimitationCases.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {urgentLimitationCases.length}টি
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">The Limitation Act 1908</span>
          </div>
        </div>

        {/* 6-Month Filing Trends & Recent Activity Feed */}
        <AnalyticsAndActivity cases={cases} />

        {/* Upcoming Hearings Quick Widget (7 Days) */}
        {upcomingHearings.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>আগামী ৭ দিনের নির্ধারিত শুনানি (Court Hearing Schedule)</span>
              </h3>
              <Link href="/calendar" className="text-xs font-bold text-indigo-600 hover:underline">
                সম্পূর্ণ কোর্ট ডায়েরি দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingHearings.map((h) => (
                <div
                  key={h.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{h.caseTitle}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate">{h.purpose}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{h.courtName || "বিজ্ঞ আদালত"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                      {new Date(h.date).toLocaleDateString("bn-BD")}
                    </span>
                    <Link
                      href={`/case/${h.caseId}/hearings`}
                      className="block text-[11px] font-semibold text-indigo-600 hover:underline mt-1"
                    >
                      শুনানি বিবরণ →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search, Filter & Cases Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="মামলার শিরোনাম, ধারা বা আসামির নামে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "Criminal", "Civil", "Special_Tribunal", "General"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white shadow-xs"
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
                    ? "সাধারণ / তথ্যানুসন্ধান"
                    : "বিশেষ ট্রাইব্যুনাল"}
                </button>
              ))}
            </div>
          </div>

          {/* Cases List */}
          {loading ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-semibold">মামলার তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
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
                  className="bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-400 p-6 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          c.category === "General"
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : c.category === "Civil"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : c.category === "Criminal"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : c.category === "Public Interest & Human Rights" || c.category?.includes("Public Interest")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {c.category === "General"
                          ? "সাধারণ পরামর্শ"
                          : c.category === "Criminal"
                          ? "ফৌজদারি মোকদ্দমা"
                          : c.category === "Civil"
                          ? "দেওয়ানি মামলা"
                          : c.category === "Public Interest & Human Rights" || c.category?.includes("Public Interest")
                          ? "জনস্বার্থ ও মানবাধিকার"
                          : "বিশেষ ট্রাইব্যুনাল"}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold ${
                          c.completenessScore >= 80
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            : "text-amber-700 bg-amber-50 border border-amber-200"
                        } px-2.5 py-0.5 rounded-full`}
                      >
                        {c.completenessScore}% প্রস্তুত
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
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
                        {c.applicableLaws.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{c.applicableLaws.length - 3} আরো
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{c.documents?.length || 0}টি প্রস্তুত আরজি</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>মামলার ফাইল খুলুন</span>
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
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span>নতুন মামলা ও মক্কেল নথিভুক্তি (ধাপ ১)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <p className="leading-relaxed">
                <strong>AI স্বয়ংক্রিয় প্রসেসিং:</strong> মক্কেলের জবানবন্দি সাবমিট করার সাথে সাথে AI তাৎক্ষণিকভাবে ঘটনার ধারা, ফ্যাক্টস শিট ও আদালতের খসড়া প্রস্তুত করে দেবে।
              </p>
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
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>মামলার আইনি শ্রেণিবিভাগ (Category)</span>
                  <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    না জানলে এআই স্বয়ংক্রিয়ভাবে নির্ধারণ করবে
                  </span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 text-slate-900 font-medium cursor-pointer"
                >
                  <option value="AUTO">✨ স্বয়ংক্রিয় এআই শনাক্তকরণ (AI Auto-Detect — ঘটনা পড়ে AI নিজেই শ্রেণি ঠিক করবে)</option>
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
                  className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 text-slate-900 leading-relaxed"
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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
