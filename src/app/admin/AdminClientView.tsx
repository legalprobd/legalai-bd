"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  FileCode,
  Activity,
  ArrowLeft,
  Scale,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ExternalLink,
  RefreshCw,
  Server,
  Terminal,
  ShieldCheck,
  UserCheck,
  Cpu,
  Sparkles,
} from "lucide-react";

export default function AdminClientView() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"users" | "prompts" | "audit">("users");
  const [loading, setLoading] = useState(true);
  const [savingPrompts, setSavingPrompts] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [interviewerPrompt, setInterviewerPrompt] = useState("");
  const [drafterPrompt, setDrafterPrompt] = useState("");
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user) {
          router.replace("/login?callbackUrl=/admin");
          return;
        }
        if (!data.user.isAdmin) {
          router.replace("/dashboard");
          return;
        }
        setSessionUser(data.user);
        setCheckingAuth(false);
        fetchData();
      })
      .catch(() => {
        router.replace("/dashboard");
      });
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.ok && json.data) {
        setUsers(json.data.users || []);
        setAuditLogs(json.data.auditLogs || []);
        setInterviewerPrompt(json.data.prompts?.interviewerPrompt || "");
        setDrafterPrompt(json.data.prompts?.drafterPrompt || "");
      } else if (res.status === 403) {
        router.replace("/dashboard");
      }
    } catch {
      setMessage({ type: "error", text: "অ্যাডমিন ডেটা লোড করতে ব্যর্থ হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3 text-slate-300 font-medium text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          <span>অ্যাডমিন নিরাপত্তা ও অনুমতি যাচাই করা হচ্ছে...</span>
        </div>
      </div>
    );
  }

  const handleSavePrompts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPrompts(true);
      setMessage(null);
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewerPrompt, drafterPrompt }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessage({ type: "success", text: "AI প্রম্পট সফলভাবে হালনাগাদ করা হয়েছে।" });
      } else {
        setMessage({ type: "error", text: json.error?.messageBn || "সংরক্ষণ ব্যর্থ হয়েছে।" });
      }
    } catch {
      setMessage({ type: "error", text: "সার্ভার এরর। আবার চেষ্টা করুন।" });
    } finally {
      setSavingPrompts(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchUser.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.barCouncilId?.toLowerCase().includes(term)
    );
  });

  const totalUserCases = users.reduce((acc, u) => acc + (u.caseCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ড</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">LegalAI BD অ্যাডমিন ও গভর্ন্যান্স প্যানেল</h1>
              <p className="text-[11px] text-slate-400">বাংলাদেশ আইন এআই মডেল, ব্যবহারকারী ও সিকিউরিটি কনসোল</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-full">
            <UserCheck className="w-3.5 h-3.5" />
            সুপার অ্যাডমিন: {sessionUser.name || sessionUser.email}
          </span>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 sm:p-8 space-y-6 flex-1 w-full">
        {/* Top 4 Executive Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>নিবন্ধিত চেম্বার</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1.5">{users.length} জন</div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-block">১০০% অ্যাক্টিভ</span>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>মোট ফাইলিং</span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1.5">{totalUserCases} টি</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">চেম্বার আরজি</span>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>এআই প্রম্পট স্ট্যাটাস</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 mt-1.5">v2.0 Active</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">জেমিনি + লাইভ আরএজি</span>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>অডিট লগ এন্ট্রি</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1.5">{auditLogs.length} টি</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">সিকিউরিটি ইভেন্ট</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>আইনজীবী ব্যবহারকারী ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === "prompts"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>AI সিস্টেম প্রম্পট</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === "audit"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>অডিট লগ</span>
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                : "bg-rose-950/60 border-rose-800 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="font-medium text-xs">{message.text}</span>
          </div>
        )}

        {/* TAB 1: USERS */}
        {activeTab === "users" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">নিবন্ধিত আইনজীবী ও চেম্বারসমূহ</h2>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="নাম, ইমেইল বা বার কাউন্সিল নং..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-800/80 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">আইনজীবী নাম ও ইমেইল</th>
                    <th className="px-5 py-3.5">বার কাউন্সিল সনদ নং</th>
                    <th className="px-5 py-3.5">কর্মস্থল আদালত / চেম্বার</th>
                    <th className="px-5 py-3.5">প্ল্যান</th>
                    <th className="px-5 py-3.5 text-center">তৈরিকৃত মামলা</th>
                    <th className="px-5 py-3.5 text-center">অ্যাডমিন স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {u.barCouncilId || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-white font-medium">{u.courtStation || "ঢাকা জজ কোর্ট"}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{u.chamberName || "ব্যক্তিগত চেম্বার"}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            u.plan === "PRO"
                              ? "bg-purple-950/60 text-purple-300 border-purple-800"
                              : u.plan === "CHAMBER"
                              ? "bg-indigo-950/60 text-indigo-300 border-indigo-800"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-block bg-indigo-950/60 text-indigo-300 font-bold px-2.5 py-1 rounded-lg border border-indigo-800">
                          {u.caseCount || 0} টি
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                            <Shield className="w-3 h-3" />
                            অ্যাডমিন
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">সাধারণ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                        কোনো আইনজীবী তথ্য পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PROMPTS */}
        {activeTab === "prompts" && (
          <form onSubmit={handleSavePrompts} className="space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white">
                    ইন্টারোগেশন প্রম্পট (INTERVIEWER_SYSTEM_PROMPT)
                  </h2>
                </div>
                <span className="text-xs text-slate-400">মামলার জবানবন্দি বিশ্লেষণ ও প্রশ্ন তৈরির সিস্টেম প্রম্পট</span>
              </div>
              <div className="p-6">
                <textarea
                  rows={10}
                  value={interviewerPrompt}
                  onChange={(e) => setInterviewerPrompt(e.target.value)}
                  className="w-full font-mono text-xs p-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-950 text-slate-200 leading-relaxed"
                />
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">
                    ড্রাফটিং প্রম্পট (DRAFTER_SYSTEM_PROMPT)
                  </h2>
                </div>
                <span className="text-xs text-slate-400">কোর্ট আরজি ও এজাহার ড্রাফট তৈরির সিস্টেম প্রম্পট</span>
              </div>
              <div className="p-6">
                <textarea
                  rows={10}
                  value={drafterPrompt}
                  onChange={(e) => setDrafterPrompt(e.target.value)}
                  className="w-full font-mono text-xs p-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-950 text-slate-200 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPrompts}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {savingPrompts ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>সিস্টেম প্রম্পট হালনাগাদ করুন</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">সিস্টেম সিকিউরিটি ও অডিট লগ</h2>
              </div>
              <span className="text-xs text-slate-400">সাম্প্রতিক কার্যক্রম ও স্পর্শকাতর ইভেন্ট ট্র্যাকিং</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">সময় (Date & Time)</th>
                    <th className="px-5 py-3.5">অ্যাকশন (Action)</th>
                    <th className="px-5 py-3.5">ব্যবহারকারী আইডি</th>
                    <th className="px-5 py-3.5">মেটাডেটা (Metadata)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800 font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                        {log.userId}
                      </td>
                      <td className="px-5 py-3.5">
                        <pre className="text-[11px] text-slate-400 font-mono truncate max-w-sm bg-slate-950 p-1.5 rounded border border-slate-800">
                          {JSON.stringify(log.metadata)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                        কোনো অডিট লগ রেকর্ড নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
