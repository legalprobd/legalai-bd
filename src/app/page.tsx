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
} from "lucide-react";

export default function HomePage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [upcomingHearings, setUpcomingHearings] = useState<Array<{ id: string; caseId: string; caseTitle: string; date: string; purpose: string; courtName?: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showNewModal, setShowNewModal] = useState(false);
  const [urgentLimitationCases, setUrgentLimitationCases] = useState<CaseRecord[]>([]);
  const [criticalOrExpiredLimitations, setCriticalOrExpiredLimitations] = useState<CaseRecord[]>([]);

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
      // If the user modified the statement and it doesn't match the old title's subject, allow AI to title it
      const shouldAutoTitle =
        !newTitle.trim() ||
        (newTitle.includes("করিম") && !newStatement.includes("করিম"));

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
    const matchesCategory =
      categoryFilter === "ALL" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalCases = cases.length;
  const interviewingCount = cases.filter((c) => c.status === "INTERVIEWING").length;
  const readyToDraftCount = cases.filter((c) => c.completenessScore >= 80).length;
  const totalDocumentsDrafted = cases.reduce(
    (acc, c) => acc + (c.documents?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-indigo-950 flex items-center gap-1.5">
                LegalAI BD <span className="text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">v2.0</span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                বাংলাদেশের অ্যাডভোকেটদের জন্য এআই-চালিত আইনি সহকারী
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Link href="/" className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                মামলা তালিকা
              </Link>
              <Link href="/calendar" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                আদালত ক্যালেন্ডার
              </Link>
              <Link href="/billing" className="px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                সাবস্ক্রিপশন ও রিচার্জ
              </Link>
            </nav>

            {/* Advocate Profile Badge */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                MR
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-bold text-slate-800">ব্যারিস্টার এম. এ. রহমান</p>
                <p className="text-[10px] text-slate-500">ঢাকা জজ কোর্ট • <span className="text-emerald-700 font-semibold">PRO</span></p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Welcome & Quick Action Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-2xl p-6 md:p-8 text-white shadow-md">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-800/80 px-3 py-1 rounded-full text-xs text-indigo-200 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>বাংলাদেশ আইন স্পেসিফিকেশন ও আদালতের ফর্ম্যাট অনুসৃত</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              অ্যাডভোকেট ড্যাশবোর্ড ও কেস ড্রাফটিং হাব
            </h1>
            <p className="text-sm text-indigo-200 leading-relaxed">
              ক্লায়েন্টের বক্তব্য ইনপুট করুন, এআই মিসিং ফ্যাক্ট ফাইন্ডারের মাধ্যমে ধারা পুনর্মূল্যায়ন করুন এবং ১-ক্লিকে থানার এজাহার, সি.আর. আরজি ও জামিনের আবেদন প্রস্তুত করুন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন মামলা শুরু করুন</span>
            </button>
          </div>
        </div>

        {/* 1-Click Quick Demo Presets */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>দ্রুত পরীক্ষার জন্য প্রি-লোডেড ডেমো কেস (Quick Demo Starters)</span>
            </h3>
            <span className="text-[11px] text-slate-500">এক ক্লিকে লোড করুন</span>
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
              className="text-left p-3.5 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/70 transition-all group"
            >
              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full uppercase">
                ফৌজদারি (Criminal)
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-2 group-hover:text-indigo-900">
                ১। বসতবাড়িতে হামলা ও মারপিট (করিম মিয়া)
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
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
              className="text-left p-3.5 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 transition-all group"
            >
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                এন.আই. অ্যাক্ট (NI Act 138)
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-2 group-hover:text-blue-900">
                ২। চেক ডিজঅনার ও টাকা আদায়
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
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
              className="text-left p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 transition-all group"
            >
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                দেওয়ানি আরজি (Civil Plaint)
              </span>
              <h4 className="font-bold text-xs text-slate-900 mt-2 group-hover:text-emerald-900">
                ৩। স্বত্ব ঘোষণা ও অন্তর্বর্তীকালীন নিষেধাজ্ঞা
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                সুনির্দিষ্ট প্রতিকার আইন ৪২/৫৪ ধারা ও দেওয়ানি কার্যবিধি অর্ডার ৩৯।
              </p>
            </button>
          </div>
        </div>

        {/* Urgent Limitations Alert Banner */}
        {criticalOrExpiredLimitations.length > 0 && (
          <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-900 shadow-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-950">
                  সতর্কতা: {criticalOrExpiredLimitations.length}টি মামলায় জরুরি তামাদি সময়সীমা বিদ্যমান!
                </h4>
                <p className="text-[11px] text-rose-800 mt-0.5">
                  তামাদি আইনের বিধানমতে নির্ধারিত মেয়াদের মধ্যে মামলা বা আরজি দাখিল না করলে প্রতিকার বঞ্চিত হতে পারেন।
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {criticalOrExpiredLimitations.map((c) => (
                    <Link
                      key={c.id}
                      href={`/case/${c.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-200/60 hover:bg-rose-200 text-rose-900 px-2.5 py-1 rounded-lg border border-rose-300"
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
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-xs font-medium">মোট নথিভুক্ত মামলা</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCases}টি</div>
            <span className="text-[10px] text-indigo-600 font-semibold mt-1 inline-block">চেম্বার ডাটাবেস</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-xs font-medium">খসড়া অপেক্ষমাণ (Pending Drafts)</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{interviewingCount}টি</div>
            <span className="text-[10px] text-amber-700 font-semibold mt-1 inline-block">ইন্টারোগেশন প্রক্রিয়াধীন</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-xs font-medium">আসন্ন শুনানি (৭ দিন)</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{upcomingHearings.length}টি</div>
            <Link href="/calendar" className="text-[10px] text-blue-700 hover:underline font-semibold mt-1 inline-block">
              ক্যালেন্ডার ও ডায়েরি দেখুন →
            </Link>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-xs font-medium">জরুরি তামাদি (৩০ দিন)</span>
            <div className={`text-2xl font-black mt-1 ${urgentLimitationCases.length > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {urgentLimitationCases.length}টি
            </div>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">The Limitation Act 1908</span>
          </div>
        </div>

        {/* Upcoming Hearings Quick Widget (7 Days) */}
        {upcomingHearings.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>আগামী ৭ দিনের নির্ধারিত শুনানি (Court Hearing Schedule)</span>
              </h3>
              <Link href="/calendar" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                সম্পূর্ণ কোর্ট ডায়েরি দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingHearings.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{h.caseTitle}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate">{h.purpose}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{h.courtName || "বিজ্ঞ আদালত"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="মামলার শিরোনাম, ধারা বা আসামির নামে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {["ALL", "Criminal", "Civil", "Special_Tribunal"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500 font-semibold">মামলার তালিকা লোড হচ্ছে...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">কোনো মামলা পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-1">
                নতুন মামলা শুরু করতে উপরের বোতামে ক্লিক করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/case/${c.id}`}
                  className="bg-white rounded-xl border border-slate-200 hover:border-indigo-400 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {c.category === "Criminal" ? "ফৌজদারি মোকদ্দমা" : c.category === "Civil" ? "দেওয়ানি মামলা" : "বিশেষ ট্রাইব্যুনাল"}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold ${
                          c.completenessScore >= 80
                            ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                            : "text-amber-700 bg-amber-50 border border-amber-200"
                        } px-2 py-0.5 rounded-full`}
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
                      <div className="flex flex-wrap gap-1 pt-1">
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
                    <span>
                      {c.documents?.length || 0}টি খসড়া দলিল
                    </span>
                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>ওয়ার্কস্পেস ওপেন করুন</span>
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span>নতুন মামলা শুরু করুন (Stage 1 Intake)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মামলার শিরোনাম (Title)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বসতবাড়িতে হামলা ও ভাঙচুর — করিম মিয়া"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মামলার ক্যাটাগরি
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Criminal">ফৌজদারি (Criminal - দণ্ডবিধি / সিআর / জিআর)</option>
                  <option value="Civil">দেওয়ানি (Civil - আরজি / স্বত্ব ঘোষণা / নিষেধাজ্ঞা)</option>
                  <option value="Special_Tribunal">বিশেষ ট্রাইব্যুনাল (NI Act / অর্থ ঋণ / সাইবার)</option>
                  <option value="Family">পারিবারিক (Family - দেনমোহর / খোরপোশ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ক্লায়েন্টের প্রাথমিক জবানবন্দি (বাংলা টেক্সট) *
                </label>
                <textarea
                  rows={5}
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="ভুক্তভোগী বা ক্লায়েন্টের কথা বাংলায় লিখুন। যেমন: গতকাল রাতে আমাদের বাসায় করিম মিয়া ও তার লোকজন ঢুকে ভাঙচুর ও ভাইকে মারপিট করেছে..."
                  required
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew || !newStatement.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
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
