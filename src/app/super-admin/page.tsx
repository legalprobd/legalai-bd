"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  ShieldAlert,
  Building2,
  Users,
  Briefcase,
  DollarSign,
  Cpu,
  FileCheck2,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Server,
  Lock,
} from "lucide-react";

interface PlatformStats {
  totalChambers: number;
  totalUsers: number;
  totalCases: number;
  totalRevenue: number;
  totalDocuments: number;
  totalAiTokensUsed: number;
  chambers: Array<{
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    totalUsers: number;
    totalCases: number;
  }>;
  recentPayments: Array<{
    id: string;
    userId: string;
    amount: number;
    method: string;
    trxId: string;
    status: string;
    plan: string;
    createdAt: string;
  }>;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/super-admin/stats");
        if (res.status === 401 || res.status === 403) {
          router.replace("/dashboard");
          return;
        }
        const json = await res.json();
        if (json.ok && json.data) {
          setStats(json.data);
        } else {
          setError(json.error?.messageBn || "তথ্য লোড ব্যর্থ হয়েছে।");
        }
      } catch {
        setError("নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4 text-indigo-700" />
                <span>Platform Owner Super Admin Console</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                প্ল্যাটফর্ম ওনার ড্যাশবোর্ড ও টেন্যান্টস অডিট
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                LegalAI BD প্ল্যাটফর্মের সকল চেম্বার, সাবস্ক্রিপশন রেভিনিউ এবং সিস্টেম হেলথ সেন্ট্রাল কন্ট্রোল প্যানেল।
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>সিস্টেম লাইভ ও সুরক্ষিত</span>
            </div>
          </div>

          {error && (
            <div className="my-4 p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400">
              প্ল্যাটফর্ম তথ্য লোড হচ্ছে...
            </div>
          ) : stats ? (
            <div className="space-y-8 my-6">
              {/* Top KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Chambers */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">নিবন্ধিত চেম্বার (Tenants)</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalChambers} টি</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">সক্রিয় আইন ফার্ম ও চেম্বার</span>
                </div>

                {/* Total Users */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">মোট ব্যবহারকারী</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalUsers} জন</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">অ্যাডভোকেট, জুনিয়র ও ক্লার্ক</span>
                </div>

                {/* Total Revenue */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">প্ল্যাটফর্ম রেভিনিউ (bKash)</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-700">৳ {stats.totalRevenue.toLocaleString("bn-BD")}</div>
                  <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">+ ১০০% ভেরিফায়েড পেমেন্ট</span>
                </div>

                {/* Total Cases */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">মোট মামলা ও ড্রাফট</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalCases} টি</div>
                  <span className="text-[11px] text-slate-400 mt-1 block">{stats.totalDocuments} টি ড্রাফট জেনারেট সম্পন্ন</span>
                </div>
              </div>

              {/* System Health Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs">
                    <Cpu className="w-4 h-4" />
                    <span>এআই টোকেন ব্যবহার (AI Health)</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.totalAiTokensUsed.toLocaleString("bn-BD")} টোকেন</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gemini 2.5 Flash ও দেশীয় লিগ্যাল রুলস ইঞ্জিন
                  </p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs">
                    <Server className="w-4 h-4" />
                    <span>ডাটাবেজ ও ক্লাউড স্টোরেজ</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">PostgreSQL (Healthy)</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Prisma ORM, রিটেইনার ও এনক্রিপ্টেড ব্যাকআপ
                  </p>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold text-xs">
                    <Lock className="w-4 h-4" />
                    <span>সিকিউরিটি ও প্রাইভেসি স্ট্যান্ডার্ড</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">Canons Chapter 2 Compliant</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    বার কাউন্সিল নীতিমালা ও প্রিভিলেজ নিশ্চিত
                  </p>
                </div>
              </div>

              {/* Tenants / Chambers List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-700" />
                    <span>নিবন্ধিত চেম্বার ও আইন ফার্ম তালিকা (Tenants Directory)</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">মোট {stats.chambers.length} টি ফার্ম</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">চেম্বারের নাম</th>
                        <th className="py-3 px-4">চেম্বার আইডি</th>
                        <th className="py-3 px-4">সদস্য সংখ্যা</th>
                        <th className="py-3 px-4">মামলা সংখ্যা</th>
                        <th className="py-3 px-4">নিবন্ধন তারিখ</th>
                        <th className="py-3 px-4 text-right">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.chambers.map((ch) => (
                        <tr key={ch.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{ch.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{ch.id}</td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{ch.totalUsers} জন আইনজীবী</td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{ch.totalCases} টি মামলা</td>
                          <td className="py-3 px-4 text-slate-500">{new Date(ch.createdAt).toLocaleDateString("bn-BD")}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Platform bKash Payments */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <span>সাম্প্রতিক bKash সাবস্ক্রিপশন পেমেন্ট হিস্ট্রি</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-medium">সর্বশেষ লেনদেন</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">TrxID</th>
                        <th className="py-3 px-4">পেমেন্ট মেথড</th>
                        <th className="py-3 px-4">প্ল্যান</th>
                        <th className="py-3 px-4">পরিমাণ (BDT)</th>
                        <th className="py-3 px-4">তারিখ</th>
                        <th className="py-3 px-4 text-right">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stats.recentPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-700">{p.trxId}</td>
                          <td className="py-3 px-4 text-slate-700">{p.method}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {p.plan}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900">৳ {p.amount.toLocaleString("bn-BD")}</td>
                          <td className="py-3 px-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString("bn-BD")}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
