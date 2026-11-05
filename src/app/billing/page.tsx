"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<"FREE" | "PRO" | "CHAMBER">("FREE");
  const [selectedPlan, setSelectedPlan] = useState<"FREE" | "PRO" | "CHAMBER">("PRO");
  const [trxId, setTrxId] = useState("");
  const [method, setMethod] = useState("bKash");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<{ paymentId: string; amount: number; bKashURL: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.plan) {
          setCurrentPlan(data.user.plan);
        }
      })
      .catch(() => {});
  }, []);

  const handleSimulateBkashCheckout = async (plan: "PRO" | "CHAMBER") => {
    try {
      setIsProcessing(true);
      setSuccessMsg(null);

      // Step 1: Initiate bKash Checkout Session
      const checkoutRes = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const checkoutJson = await checkoutRes.json();

      if (!checkoutJson.ok) {
        alert(checkoutJson.error?.messageBn || "চেকআউট সেশন তৈরি ব্যর্থ হয়েছে।");
        return;
      }

      setCheckoutData(checkoutJson.data);

      // Step 2: Simulate Instant User Approval in bKash Sandbox
      const webhookRes = await fetch("/api/billing/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId: checkoutJson.data.trxId,
          method: "bKash",
          amount: checkoutJson.data.amount,
          plan: checkoutJson.data.plan,
        }),
      });

      const webhookJson = await webhookRes.json();
      if (webhookJson.ok) {
        setCurrentPlan(plan);
        setSuccessMsg(
          `পেমেন্ট সফল! TrxID: ${checkoutJson.data.trxId} এর মাধ্যমে আপনার অ্যাকাউন্ট ${plan} প্যাকেজে উন্নীত হয়েছে।`
        );
      }
    } catch {
      alert("বিকাশ গেটওয়ে সংযোগে ত্রুটি। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) return;

    try {
      setIsProcessing(true);
      const res = await fetch("/api/billing/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId: trxId.trim(),
          method,
          amount: selectedPlan === "PRO" ? 2500 : 7500,
          plan: selectedPlan,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setCurrentPlan(selectedPlan);
        setSuccessMsg(`ধন্যবাদ! আপনার ${method} পেমেন্ট (TrxID: ${trxId}) সফলভাবে গৃহীত হয়েছে।`);
        setTrxId("");
      } else {
        alert("পেমেন্ট সম্পন্ন হয়নি।");
      }
    } catch {
      alert("পেমেন্ট গেটওয়ে সমস্যা। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Global Unified Navbar */}
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Current Plan Overview Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              বর্তমান সক্রিয় প্যাকেজ
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {currentPlan === "PRO"
                ? "PRO ADVOCATE PLAN — আনলিমিটেড লিগ্যাল ড্রাফটিং ও কোর্ট ডায়েরি"
                : currentPlan === "CHAMBER"
                ? "CHAMBER MASTER PLAN — সিনিয়র ও জুনিয়রদের মাল্টি-ইউজার সুবিধা"
                : "FREE TRIAL PLAN — প্রাথমিক ড্রাফটিং ট্রায়াল"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ব্যবহৃত ক্রেডিট: ১২ / ১০০০ • মেয়াদ: ৩১ ডিসেম্বর, ২০২৬ পর্যন্ত
            </p>
          </div>
          <div className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-center shrink-0">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">স্ট্যাটাস</span>
            <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
              {currentPlan} ACTIVE
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">FREE ট্রায়াল</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">প্রাথমিক টেস্টের জন্য</p>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ৳ ০ <span className="text-xs font-normal text-slate-500">/জীবনকাল</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> ৫০টি এআই ক্রেডিট
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> এজাহার ও সিআর ড্রাফটিং
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> তামাদি ক্যালকুলেটর
                </li>
              </ul>
            </div>
            <button
              disabled
              className="mt-6 w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed"
            >
              {currentPlan === "FREE" ? "বর্তমান প্ল্যান" : "বেসিক ট্রায়াল"}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-indigo-600 shadow-lg flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase shadow-xs">
              জনপ্রিয় প্ল্যান
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">PRO ADVOCATE</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">একক প্র্যাকটিসিং আইনজীবীর জন্য</p>
              </div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                ৳ ২,৫০০ <span className="text-xs font-normal text-slate-500">/মাসিক</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> ১০০০টি এআই ড্রাফটিং ক্রেডিট
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> ৩৪টি কোর্ট ডকুমেন্ট টেমপ্লেট
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> DOCX ও Nikosh/Bijoy কনভার্টার
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> এভিডেন্স ভল্ট ও OCR ফ্যাক্ট ম্যাপিং
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> কোর্ট ডায়েরি ও অটো তামাদি ট্র্যাকার
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulateBkashCheckout("PRO")}
              className="mt-6 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>বিকাশ চেকআউট চলছে...</span>
                </>
              ) : (
                <span>বিকাশে PRO প্যাকেজে আপগ্রেড করুন (৳২,৫০০)</span>
              )}
            </button>
          </div>

          {/* Chamber */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">CHAMBER MASTER</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">আইনি চেম্বার ও একাধিক আইনজীবীর জন্য</p>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ৳ ৭,৫০০ <span className="text-xs font-normal text-slate-500">/মাসিক</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> ৫ জন আইনজীবী ও ক্লার্ক অ্যাকাউন্ট
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> আনলিমিটেড ড্রাফটিং ও ভল্ট স্টোরেজ
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> চেম্বার লেটারহেড ও ওয়াটারমার্ক
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulateBkashCheckout("CHAMBER")}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>CHAMBER প্ল্যানে আপগ্রেড (৳৭,৫০০)</span>
            </button>
          </div>
        </div>

        {/* Manual Payment Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>ম্যানুয়াল মার্চেন্ট পেমেন্ট ভেরিফিকেশন (bKash / Nagad / Rocket)</span>
          </h3>
          <form onSubmit={handleManualRecharge} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">প্ল্যান নির্বাচন</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as "PRO" | "CHAMBER")}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
              >
                <option value="PRO">PRO Advocate (৳২,৫০০)</option>
                <option value="CHAMBER">Chamber Master (৳৭,৫০০)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">পেমেন্ট মাধ্যম</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
              >
                <option value="bKash">bKash Merchant (01711-XXXXXX)</option>
                <option value="Nagad">Nagad Merchant</option>
                <option value="Rocket">Rocket Pay</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Transaction ID (TrxID)</label>
              <input
                type="text"
                required
                placeholder="যেমন: BKH9283741X"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                TrxID ভেরিফাই করুন
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
