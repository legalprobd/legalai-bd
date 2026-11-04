"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900">
                সাবস্ক্রিপশন প্ল্যান ও পেমেন্ট গেটওয়ে (bKash)
              </h1>
              <p className="text-[11px] text-slate-500">
                বিকাশ স্যান্ডবক্স ও ইনস্ট্যান্ট অ্যাকাউন্ট আপগ্রেড হাব
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ড্যাশবোর্ডে ফিরুন
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Current Plan Overview Banner */}
        <div className="bg-indigo-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              বর্তমান সক্রিয় প্যাকেজ
            </span>
            <h2 className="text-xl font-bold mt-1">
              {currentPlan === "PRO"
                ? "PRO ADVOCATE PLAN — আনলিমিটেড লিগ্যাল ড্রাফটিং ও কোর্ট ডায়েরি"
                : currentPlan === "CHAMBER"
                ? "CHAMBER MASTER PLAN — সিনিয়র ও জুনিয়রদের মাল্টি-ইউজার সুবিধা"
                : "FREE TRIAL PLAN — প্রাথমিক ড্রাফটিং ট্রায়াল"}
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              ব্যবহৃত ক্রেডিট: ১২ / ১০০০ • মেয়াদ: ৩১ ডিসেম্বর, ২০২৬ পর্যন্ত
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-800 rounded-xl text-center">
            <span className="text-[10px] text-indigo-300 uppercase">স্ট্যাটাস</span>
            <p className="font-extrabold text-emerald-400 text-sm">
              {currentPlan} ACTIVE
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">FREE ট্রায়াল</h3>
                <p className="text-xs text-slate-500 mt-1">প্রাথমিক টেস্টের জন্য</p>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ৳ ০ <span className="text-xs font-normal text-slate-500">/জীবনকাল</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
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
              className="mt-6 w-full py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-lg cursor-not-allowed"
            >
              {currentPlan === "FREE" ? "বর্তমান প্ল্যান" : "বেসিক ট্রায়াল"}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl p-6 border-2 border-indigo-600 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
              জনপ্রিয় প্ল্যান
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">PRO ADVOCATE</h3>
                <p className="text-xs text-slate-500 mt-1">একক প্র্যাকটিসিং আইনজীবীর জন্য</p>
              </div>
              <div className="text-2xl font-black text-indigo-600">
                ৳ ২,৫০০ <span className="text-xs font-normal text-slate-500">/মাসিক</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
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
              className="mt-6 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>বিকাশ চেকআউট চলছে...</span>
                </>
              ) : (
                <>
                  <span>বিকাশে PRO প্যাকেজে আপগ্রেড করুন (৳২,৫০০)</span>
                </>
              )}
            </button>
          </div>

          {/* Chamber */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">CHAMBER MASTER</h3>
                <p className="text-xs text-slate-500 mt-1">আইনি চেম্বার ও একাধিক আইনজীবীর জন্য</p>
              </div>
              <div className="text-2xl font-black text-slate-900">
                ৳ ৭,৫০০ <span className="text-xs font-normal text-slate-500">/মাসিক</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
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
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>CHAMBER প্ল্যানে আপগ্রেড (৳৭,৫০০)</span>
            </button>
          </div>
        </div>

        {/* Manual Payment Section */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>ম্যানুয়াল মার্চেন্ট পেমেন্ট ভেরিফিকেশন (bKash / Nagad / Rocket)</span>
          </h3>
          <form onSubmit={handleManualRecharge} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">প্ল্যান নির্বাচন</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as "PRO" | "CHAMBER")}
                className="w-full text-xs rounded-lg border border-slate-300 p-2"
              >
                <option value="PRO">PRO Advocate (৳২,৫০০)</option>
                <option value="CHAMBER">Chamber Master (৳৭,৫০০)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">পেমেন্ট মাধ্যম</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2"
              >
                <option value="bKash">bKash Merchant (01711-XXXXXX)</option>
                <option value="Nagad">Nagad Merchant</option>
                <option value="Rocket">Rocket Pay</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction ID (TrxID)</label>
              <input
                type="text"
                required
                placeholder="যেমন: BKH9283741X"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2"
              >
              </input>
            </div>
            <div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50"
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
