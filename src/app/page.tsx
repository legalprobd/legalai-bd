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
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Users,
  ChevronRight,
  Mic,
  ShieldAlert,
  FileBox,
  LogOut,
  Settings,
  Shield,
  Gavel,
  Briefcase,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { AnalyticsAndActivity } from "@/components/dashboard/AnalyticsAndActivity";

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
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    plan?: string;
    isAdmin?: boolean;
    chamberName?: string;
    courtStation?: string;
  }>({
    name: "ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)",
    email: "advocate@demo.bd",
    plan: "PRO",
    isAdmin: true,
    chamberName: "রহমান অ্যান্ড অ্যাসোসিয়েটস",
    courtStation: "ঢাকা জজ কোর্ট ও সুপ্রিম কোর্ট",
  });

  // New Case Modal State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Criminal");
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
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.name) {
          setCurrentUser({
            name: data.user.name,
            email: data.user.email || "",
            plan: data.user.plan || "PRO",
            isAdmin: Boolean(data.user.isAdmin),
            chamberName: data.user.chamberName || "রহমান অ্যান্ড অ্যাসোসিয়েটস",
            courtStation: data.user.courtStation || "ঢাকা জজ কোর্ট ও সুপ্রিম কোর্ট",
          });
        }
      })
      .catch(() => {});
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
          category: newCategory,
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

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rawStatement.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalCases = cases.length;
  const interviewingCount = cases.filter((c) => c.status === "INTERVIEWING").length;
  const totalDocumentsDrafted = cases.reduce((acc, c) => acc + (c.documents?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-950 to-indigo-900 text-amber-400 flex items-center justify-center shadow-sm border border-indigo-700/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5">
                  LegalAI BD <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">v2.0</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                ডিজিটাল চেম্বার ও লিগ্যাল ড্রাফটিং সিস্টেম
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Link href="/" className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold">
                মামলার ফাইল
              </Link>
              <Link href="/calendar" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                কজলিস্ট ও ক্যালেন্ডার
              </Link>
              <Link href="/billing" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                বিলিং ও সাবস্ক্রিপশন
              </Link>
              <Link href="/settings" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" />
                <span>চেম্বার সেটিংস</span>
              </Link>
              {currentUser.isAdmin && (
                <Link href="/admin" className="px-3 py-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>অ্যাডমিন</span>
                </Link>
              )}
            </nav>

            {/* Theme Toggle, Advocate Profile Badge & Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <ThemeToggle />
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                {currentUser.name.slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                  {currentUser.courtStation} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currentUser.plan || "PRO"}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="লগআউট করুন"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome Executive Chamber Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-900/60 border border-indigo-700/50 px-3 py-1 rounded-full text-xs text-indigo-300 font-medium backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>বাংলাদেশ বার কাউন্সিল প্রমিতকরণ ও বিচারিক ড্রাফটিং স্ট্যান্ডার্ড</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                চেম্বার ড্যাশবোর্ড ও কেস ড্রাফটিং হাব
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                মক্কেলের মৌখিক বক্তব্য বা ঘটনার সারসংক্ষেপ প্রদান করুন। এআই মিসিং ফ্যাক্ট ফাইন্ডারের মাধ্যমে ধারাসমূহ পুনর্মূল্যায়ন করে ১-ক্লিকে থানার এজাহার, সি.আর. আরজি ও জামিনের আবেদন প্রস্তুত করুন।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all hover:shadow-indigo-500/25 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন মামলা শুরু করুন</span>
              </button>
              <Link
                href="/calendar"
                className="flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>কোর্ট কজলিস্ট</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Demo Presets */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>দ্রুত পরীক্ষার জন্য প্রি-লোডেড ডেমো কেস (Quick Demo Starters)</span>
            </h3>
            <span className="text-[11px] text-slate-400 hidden sm:inline">১-ক্লিকে ইনটেক শুরু করুন</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() =>
                handleQuickLoad(
                  "গতকাল রাতে পাশের বাড়ির করিম মিয়া তার লোকজন নিয়ে আমাদের বাসায় ঢুকে ভাঙচুর করেছে এবং আমার ভাইকে মেরে মাথা ফাটিয়ে দিয়েছে।",
                  "বাসায় হামলা ও ভাঙচুর — করিম মিয়া",
                  "Criminal"
                )
              }
              className="text-left p-4 rounded-xl border border-red-100 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2.5 py-0.5 rounded-full uppercase border border-red-200 dark:border-red-900">
                ফৌজদারি (Criminal)
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                ১। বসতবাড়িতে হামলা ও মারপিট (করিম মিয়া)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                দণ্ডবিধি ১৪৩/৪৫২/৩২৬/৩০৭/৩৮০ ধারা ও থানার এজাহার/সি.আর. আরজি।
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
              className="text-left p-4 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full uppercase border border-blue-200 dark:border-blue-900">
                এন.আই. অ্যাক্ট (NI Act 138)
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ২। চেক ডিজঅনার ও টাকা আদায়
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                দ্য নেগোশিয়েবল ইনস্ট্রুমেন্টস অ্যাক্ট ১৮৮১ এর ১৩৮ ধারা ও আইনি নোটিশ।
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
              className="text-left p-4 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200 dark:border-emerald-900">
                দেওয়ানি আরজি (Civil Plaint)
              </span>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-2.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                ৩। স্বত্ব ঘোষণা ও অন্তর্বর্তীকালীন নিষেধাজ্ঞা
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                সুনির্দিষ্ট প্রতিকার আইন ৪২/৫৪ ধারা ও দেওয়ানি কার্যবিধি অর্ডার ৩৯।
              </p>
            </button>
          </div>
        </div>

        {/* Urgent Limitations Alert Banner */}
        {criticalOrExpiredLimitations.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900 rounded-2xl p-4 text-rose-950 dark:text-rose-200 shadow-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-950 dark:text-rose-100">
                  সতর্কতা: {criticalOrExpiredLimitations.length}টি মামলায় জরুরি তামাদি সময়সীমা বিদ্যমান!
                </h4>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">
                  তামাদি আইনের বিধানমতে নির্ধারিত মেয়াদের মধ্যে মোকদ্দমা বা আরজি দাখিল না করিলে প্রতিকার তামাদি বারিত হইতে পারে।
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {criticalOrExpiredLimitations.map((c) => (
                    <Link
                      key={c.id}
                      href={`/case/${c.id}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-rose-200/60 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-900 dark:text-rose-200 px-3 py-1 rounded-lg border border-rose-300 dark:border-rose-800 transition"
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
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>মোট নথিভুক্ত মামলা</span>
              <FolderOpen className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalCases}টি</div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 inline-block">চেম্বার ডাটাবেস</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>খসড়া অপেক্ষমাণ</span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{interviewingCount}টি</div>
            <span className="text-[10px] text-amber-700 dark:text-amber-500 font-semibold mt-1 inline-block">ইন্টারোগেশন প্রক্রিয়াধীন</span>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>আসন্ন শুনানি (৭ দিন)</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">{upcomingHearings.length}টি</div>
            <Link href="/calendar" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-1 inline-block">
              ক্যালেন্ডার ও ডায়েরি দেখুন →
            </Link>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
              <span>জরুরি তামাদি (৩০ দিন)</span>
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <div className={`text-2xl font-black mt-2 ${urgentLimitationCases.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {urgentLimitationCases.length}টি
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">The Limitation Act 1908</span>
          </div>
        </div>

        {/* 6-Month Filing Trends & Recent Activity Feed */}
        <AnalyticsAndActivity cases={cases} />

        {/* Upcoming Hearings Quick Widget (7 Days) */}
        {upcomingHearings.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>আগামী ৭ দিনের নির্ধারিত শুনানি (Court Hearing Schedule)</span>
              </h3>
              <Link href="/calendar" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                সম্পূর্ণ কোর্ট ডায়েরি দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingHearings.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{h.caseTitle}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">{h.purpose}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{h.courtName || "বিজ্ঞ আদালত"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      {new Date(h.date).toLocaleDateString("bn-BD")}
                    </span>
                    <Link
                      href={`/case/${h.caseId}/hearings`}
                      className="block text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="মামলার শিরোনাম, ধারা বা আসামির নামে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "Criminal", "Civil", "Special_Tribunal"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat === "ALL"
                    ? "সকল মামলা"
                    : cat === "Criminal"
                    ? "ফৌজদারি"
                    : cat === "Civil"
                    ? "দেওয়ানি"
                    : "বিশেষ ট্রাইব্যুনাল"}
                </button>
              ))}
            </div>
          </div>

          {/* Cases List */}
          {loading ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">মামলার তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো মামলা পাওয়া যায়নি</p>
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
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 p-5 shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {c.category === "Criminal"
                          ? "ফৌজদারি মোকদ্দমা"
                          : c.category === "Civil"
                          ? "দেওয়ানি মামলা"
                          : "বিশেষ ট্রাইব্যুনাল"}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold ${
                          c.completenessScore >= 80
                            ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        } px-2.5 py-0.5 rounded-full`}
                      >
                        {c.completenessScore}% প্রস্তুত
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {c.rawStatement}
                    </p>

                    {/* Matched Laws Badges */}
                    {c.applicableLaws && c.applicableLaws.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {c.applicableLaws.slice(0, 3).map((l, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-semibold"
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

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{c.documents?.length || 0}টি প্রস্তুত দলিল</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>ওয়ার্কস্পেস খুলুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Case Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>নতুন মামলা ও মক্কেল নথিভুক্তি (Intake Wizard)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  মামলার শিরোনাম বা মক্কেলের নাম (Title)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বসতবাড়িতে হামলা ও ভাঙচুর — করিম মিয়া"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  মামলার আইনি শ্রেণিবিভাগ (Category)
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Criminal">ফৌজদারি (Criminal - দণ্ডবিধি / সিআর / জিআর / এজাহার)</option>
                  <option value="Civil">দেওয়ানি (Civil - আরজি / স্বত্ব ঘোষণা / নিষেধাজ্ঞা / বন্টন)</option>
                  <option value="Special_Tribunal">বিশেষ ট্রাইব্যুনাল (NI Act ১৩৮ ধারা / সাইবার / অর্থ ঋণ)</option>
                  <option value="Family">পারিবারিক (Family - দেনমোহর / খোরপোশ / অভিভাবকত্ব)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  মক্কেলের ঘটনার বর্ণনা বা প্রাথমিক জবানবন্দি (বাংলা টেক্সট) *
                </label>
                <textarea
                  rows={5}
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="মক্কেলের মুখ থেকে শোনা বক্তব্য বাংলায় লিখুন বা পেস্ট করুন। যেমন: ঘটনার তারিখ, সময়, স্থান, বিবাদী বা আসামিদের নাম ও কী কী ক্ষয়ক্ষতি সংঘটিত হয়েছে..."
                  required
                  className="w-full text-xs p-3.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
