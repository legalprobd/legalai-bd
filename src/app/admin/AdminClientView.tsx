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
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";

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
      <div className="min-h-screen bg-slate-50  flex flex-col font-sans">
        <AppNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600  font-medium text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 " />
            <span>অ্যাডমিন নিরাপত্তা ও অনুমতি যাচাই করা হচ্ছে...</span>
          </div>
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col">
      {/* Global Unified Navbar */}
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        {/* Main Container */}
        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Admin Header Card */}
        <div className="bg-white  rounded-3xl p-6 border border-slate-200/80  shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50  text-emerald-600  border border-emerald-200  flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 ">
                LegalAI BD অ্যাডমিন ও গভর্ন্যান্স প্যানেল
              </h1>
              <p className="text-xs text-slate-500  mt-0.5">
                বাংলাদেশ আইন এআই মডেল, ব্যবহারকারী ব্যবস্থাপনা ও সিকিউরিটি কনসোল
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700  bg-emerald-50  border border-emerald-200  px-3.5 py-1.5 rounded-full">
              <UserCheck className="w-3.5 h-3.5" />
              সুপার অ্যাডমিন: {sessionUser?.name || sessionUser?.email}
            </span>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl text-slate-500  hover:text-slate-900  bg-slate-100  hover:bg-slate-200  transition cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Top 4 Executive Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white  rounded-3xl border border-slate-200/80  shadow-2xs">
            <div className="flex items-center justify-between text-slate-500  text-xs font-medium">
              <span>নিবন্ধিত চেম্বার</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900  mt-1.5">{users.length} জন</div>
            <span className="text-[10px] text-emerald-600  font-semibold mt-1 inline-block">১০০% সক্রিয়</span>
          </div>

          <div className="p-5 bg-white  rounded-3xl border border-slate-200/80  shadow-2xs">
            <div className="flex items-center justify-between text-slate-500  text-xs font-medium">
              <span>মোট ফাইলিং</span>
              <Scale className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600  mt-1.5">{totalUserCases} টি</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">চেম্বার আরজি</span>
          </div>

          <div className="p-5 bg-white  rounded-3xl border border-slate-200/80  shadow-2xs">
            <div className="flex items-center justify-between text-slate-500  text-xs font-medium">
              <span>এআই প্রম্পট স্ট্যাটাস</span>
              <Cpu className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-600  mt-1.5">v2.0 Active</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">জেমিনি + লাইভ আরএজি</span>
          </div>

          <div className="p-5 bg-white  rounded-3xl border border-slate-200/80  shadow-2xs">
            <div className="flex items-center justify-between text-slate-500  text-xs font-medium">
              <span>অডিট লগ এন্ট্রি</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600  mt-1.5">{auditLogs.length} টি</div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">সিকিউরিটি ইভেন্ট</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-white  p-1.5 rounded-2xl border border-slate-200/80  shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600  hover:text-slate-900  hover:bg-slate-100 "
            }`}
          >
            <Users className="w-4 h-4" />
            <span>আইনজীবী ব্যবহারকারী ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === "prompts"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600  hover:text-slate-900  hover:bg-slate-100 "
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>AI সিস্টেম প্রম্পট</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === "audit"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600  hover:text-slate-900  hover:bg-slate-100 "
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
                ? "bg-emerald-50  border-emerald-300  text-emerald-900 "
                : "bg-rose-50  border-rose-300  text-rose-900 "
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600  shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600  shrink-0" />
            )}
            <span className="font-semibold text-xs">{message.text}</span>
          </div>
        )}

        {/* TAB 1: USERS */}
        {activeTab === "users" && (
          <div className="bg-white  rounded-3xl border border-slate-200/80  shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100  bg-slate-50/50  flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 " />
                <h2 className="text-sm font-bold text-slate-800 ">নিবন্ধিত আইনজীবী ও চেম্বারসমূহ</h2>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="নাম, ইমেইল বা বার কাউন্সিল নং..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300  rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white  text-slate-900  placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 ">
                <thead className="bg-slate-100/70  text-slate-700  font-semibold border-b border-slate-200 ">
                  <tr>
                    <th className="px-5 py-3.5">আইনজীবী নাম ও ইমেইল</th>
                    <th className="px-5 py-3.5">বার কাউন্সিল সনদ নং</th>
                    <th className="px-5 py-3.5">কর্মস্থল আদালত / চেম্বার</th>
                    <th className="px-5 py-3.5">প্ল্যান</th>
                    <th className="px-5 py-3.5 text-center">তৈরিকৃত মামলা</th>
                    <th className="px-5 py-3.5 text-center">অ্যাডমিন স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 ">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50  transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 ">{u.fullName}</div>
                        <div className="text-[11px] text-slate-500  font-mono mt-0.5">{u.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-slate-700  bg-slate-100  px-2 py-0.5 rounded border border-slate-200 ">
                          {u.barCouncilId || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-800  font-medium">{u.courtStation || "ঢাকা জজ কোর্ট"}</div>
                        <div className="text-[11px] text-slate-500  mt-0.5">{u.chamberName || "ব্যক্তিগত চেম্বার"}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            u.plan === "PRO"
                              ? "bg-purple-50  text-purple-700  border-purple-200 "
                              : u.plan === "CHAMBER"
                              ? "bg-indigo-50  text-indigo-700  border-indigo-200 "
                              : "bg-slate-100  text-slate-700  border-slate-200 "
                          }`}
                        >
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-block bg-indigo-50  text-indigo-700  font-bold px-2.5 py-1 rounded-lg border border-indigo-200 ">
                          {u.caseCount || 0} টি
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700  bg-emerald-50  border border-emerald-200  px-2.5 py-1 rounded-full">
                            <Shield className="w-3 h-3" />
                            অ্যাডমিন
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">সাধারণ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
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
            <div className="bg-white  rounded-3xl border border-slate-200/80  shadow-sm overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-100  bg-slate-50/50  flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-600 " />
                  <h2 className="text-sm font-bold text-slate-800 ">
                    ইন্টারোগেশন প্রম্পট (INTERVIEWER_SYSTEM_PROMPT)
                  </h2>
                </div>
                <span className="text-xs text-slate-500 ">মামলার জবানবন্দি বিশ্লেষণ ও প্রশ্ন তৈরির সিস্টেম প্রম্পট</span>
              </div>
              <div className="p-6">
                <textarea
                  rows={10}
                  value={interviewerPrompt}
                  onChange={(e) => setInterviewerPrompt(e.target.value)}
                  className="w-full font-mono text-xs p-4 border border-slate-300  rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50  text-slate-900  leading-relaxed"
                />
              </div>
            </div>

            <div className="bg-white  rounded-3xl border border-slate-200/80  shadow-sm overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-100  bg-slate-50/50  flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-800 ">
                    ড্রাফটিং প্রম্পট (DRAFTER_SYSTEM_PROMPT)
                  </h2>
                </div>
                <span className="text-xs text-slate-500 ">কোর্ট আরজি ও এজাহার ড্রাফট তৈরির সিস্টেম প্রম্পট</span>
              </div>
              <div className="p-6">
                <textarea
                  rows={10}
                  value={drafterPrompt}
                  onChange={(e) => setDrafterPrompt(e.target.value)}
                  className="w-full font-mono text-xs p-4 border border-slate-300  rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50  text-slate-900  leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPrompts}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95"
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
          <div className="bg-white  rounded-3xl border border-slate-200/80  shadow-sm overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100  bg-slate-50/50  flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 " />
                <h2 className="text-sm font-bold text-slate-800 ">সিস্টেম সিকিউরিটি ও অডিট লগ</h2>
              </div>
              <span className="text-xs text-slate-500 ">সাম্প্রতিক কার্যক্রম ও স্পর্শকাতর ইভেন্ট ট্র্যাকিং</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 ">
                <thead className="bg-slate-100/70  text-slate-700  font-semibold border-b border-slate-200 ">
                  <tr>
                    <th className="px-5 py-3.5">সময় (Date & Time)</th>
                    <th className="px-5 py-3.5">অ্যাকশন (Action)</th>
                    <th className="px-5 py-3.5">ব্যবহারকারী আইডি</th>
                    <th className="px-5 py-3.5">মেটাডেটা (Metadata)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 ">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50  transition">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500  font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString("bn-BD")}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-indigo-700  bg-indigo-50  px-2.5 py-1 rounded-lg border border-indigo-200  font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500 ">
                        {log.userId}
                      </td>
                      <td className="px-5 py-3.5">
                        <pre className="text-[11px] text-slate-600  font-mono truncate max-w-sm bg-slate-50  p-2 rounded-xl border border-slate-200 ">
                          {JSON.stringify(log.metadata)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-slate-400">
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
    </div>
  );
}
