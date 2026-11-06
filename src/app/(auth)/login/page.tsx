"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Scale,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  UserCheck,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("advocate@demo.bd");
  const [password, setPassword] = useState("legal123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("ইমেইল বা পাসওয়ার্ড সঠিক নয়। দয়া করে পুনরায় চেষ্টা করুন।");
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setErrorMsg("লগইন করতে সমস্যা হচ্ছে। ইন্টারনেট সংযোগ পরীক্ষা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail("advocate@demo.bd");
    setPassword("legal123");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-slate-800">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Brand & Prestige */}
        <div className="md:col-span-6 space-y-6 text-slate-900 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>বাংলাদেশ সুপ্রিম কোর্ট ও জেলা বার প্রমিতকরণ</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900">
            LegalAI BD <span className="text-indigo-600">v2.0</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
            বাংলাদেশের বিজ্ঞ অ্যাডভোকেটদের জন্য তৈরি আধুনিক ডিজিটাল চেম্বার প্ল্যাটফর্ম। ক্লায়েন্টের মৌখিক বক্তব্য থেকে সরাসরি আদালতের এজাহার, আরজি ও পিটিশন প্রস্তুত করুন নিমিষেই।
          </p>

          <div className="hidden sm:grid grid-cols-2 gap-3 pt-2 max-w-md">
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 text-left shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">৩৪টি কোর্ট ফরম্যাট</p>
                <p className="text-[11px] text-slate-500">এজাহার, সি.আর., দেওয়ানি আরজি ও বেল</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 text-left shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">স্বয়ংক্রিয় তামাদি গণক</p>
                <p className="text-[11px] text-slate-500">ছুটির দিন পর্যালোচনা ও আইনি ডেডলাইন</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card & Citizen Free Portal Banner */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-200 relative">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">আইনজীবী লগইন</h3>
                <p className="text-xs text-slate-500">আপনার চেম্বার ক্রেডেনশিয়াল দিন</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                SSL এনক্রিপ্টেড
              </span>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  নিবন্ধিত ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="advocate@demo.bd"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 bg-slate-50/50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  গোপন পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 bg-slate-50/50 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>যাচাই হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>চেম্বারে প্রবেশ করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Autofill */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">ডেমো টেস্ট করতে চান?</span>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
              >
                অ্যাডভোকেট ডেমো অ্যাকাউন্ট ফিল করুন
              </button>
            </div>
          </div>

          {/* Citizen Free Legal Aid Portal Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                সাধারণ নাগরিক ও মক্কেলদের ফ্রি সেবা
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                নিজের ঘটনা লিখে ফ্রিতে আইনি ধারা ও জিডি (GD) তৈরি করতে চান?
              </p>
              <p className="text-[11px] text-slate-600">
                কোনো লগইন ছাড়াই বিনামূল্যে আপনার ঘটনা বিশ্লেষণ ও থানার দরখাস্ত প্রিন্ট করুন।
              </p>
            </div>
            <Link
              href="/citizen"
              className="shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>ফ্রি সেবা নিন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
