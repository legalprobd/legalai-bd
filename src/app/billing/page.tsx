"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Check, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"FREE" | "PRO" | "CHAMBER">("PRO");
  const [trxId, setTrxId] = useState("");
  const [method, setMethod] = useState("bKash");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) return;

    try {
      setIsProcessing(true);
      const res = await fetch("/api/billing/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trxId,
          method,
          amount: selectedPlan === "PRO" ? 2500 : 7500,
          plan: selectedPlan,
        }),
      });

      const json = await res.json();
      if (json.ok) {
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
              href="/"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900">
                সাবস্ক্রিপশন প্ল্যান ও রিচার্জ হাব
              </h1>
              <p className="text-[11px] text-slate-500">
                বিকাশ, নগদ ও রকেটের মাধ্যমে ইনস্ট্যান্ট ক্রেডিট একটিভেশন
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Current Plan Overview */}
        <div className="bg-indigo-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              বর্তমান সক্রিয় প্ল্যান
            </span>
            <h2 className="text-xl font-bold mt-1">
              PRO ADVOCATE PLAN — আনলিমিটেড লিগ্যাল ড্রাফটিং
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              ব্যবহৃত ক্রেডিট: ১২ / ১০০০ • মেয়াদ: ৩১ ডিসেম্বর, ২০২৬ পর্যন্ত
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-800 rounded-xl text-center">
            <span className="text-[10px] text-indigo-300 uppercase">স্ট্যাটাস</span>
            <p className="font-extrabold text-emerald-400 text-sm">সক্রিয় (Active)</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">FREE ট্রায়াল</h3>
                <p className="text-xs text-slate-500 mt-1">প্রাথমিক টেস্টের জন্য</p>
              </div>
              <div className="text-2xl font-black text-slate-900">৳ ০ <span className="text-xs font-normal text-slate-500">/জীবনকাল</span></div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> ৫০টি এআই ক্রেডিট</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> প্রাথমিক এজাহার ও সিআর আরজি</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> ইউনিকোড টেক্সট কপি</li>
              </ul>
            </div>
            <button
              disabled
              className="mt-6 w-full py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-lg cursor-not-allowed"
            >
              বর্তমান সক্রিয় ছিল
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl p-6 border-2 border-indigo-600 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
              জনপ্রিয় প্ল্যান
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">PRO ADVOCATE</h3>
                <p className="text-xs text-slate-500 mt-1">আইনজীবী ও একক প্র্যাকটিশনারদের জন্য</p>
              </div>
              <div className="text-2xl font-black text-indigo-950">৳ ২,৫০০ <span className="text-xs font-normal text-slate-500">/মাসিক</span></div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-emerald-600" /> ১,০০০টি প্রিমিয়াম এআই ক্রেডিট</li>
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-emerald-600" /> ৩৪টি কোর্ট ডকুমেন্ট টেমপ্লেট</li>
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-emerald-600" /> ইউনিকোড ⇄ বিজয় (SutonnyMJ) এক্সপোর্ট</li>
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-emerald-600" /> সরাসরি Word (.docx) ও PDF ডাউনলোড</li>
                <li className="flex items-center gap-2 font-medium"><Check className="w-4 h-4 text-emerald-600" /> বাংলা ভয়েস ইনপুট (Whisper bn-BD)</li>
              </ul>
            </div>
            <button
              onClick={() => setSelectedPlan("PRO")}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              PRO নির্বাচন করুন
            </button>
          </div>

          {/* Chamber */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">CHAMBER & FIRM</h3>
                <p className="text-xs text-slate-500 mt-1">পুরো চেম্বার ও জুনিয়র টিম সদস্যদের জন্য</p>
              </div>
              <div className="text-2xl font-black text-slate-900">৳ ৭,৫০০ <span className="text-xs font-normal text-slate-500">/মাসিক</span></div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> ১০,০০০টি শেয়ার্ড ক্রেডিট</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> ১০ জন জুনিয়র অ্যাডভোকেট সীট</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> চেম্বার লেটারহেড ও স্ট্যাম্প কাস্টমাইজেশন</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> অডিট লগ ও এভিডেন্স ভল্ট (OCR)</li>
              </ul>
            </div>
            <button
              onClick={() => setSelectedPlan("CHAMBER")}
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg"
            >
              CHAMBER নির্বাচন করুন
            </button>
          </div>
        </div>

        {/* bKash / Nagad Instant Recharge Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>বিকাশ / নগদ পেমেন্ট ভেরিফিকেশন (Instant Recharge)</span>
          </h3>

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRecharge} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">পেমেন্ট মাধ্যম:</label>
              <div className="grid grid-cols-3 gap-2">
                {["bKash", "Nagad", "Rocket"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-2 px-3 rounded-lg border font-bold text-center ${
                      method === m
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-slate-600 space-y-1">
              <p>১। আপনার {method} অ্যাপ থেকে <strong>01711000000</strong> নম্বরে মার্চেন্ট পে করুন।</p>
              <p>২। প্রেরিত পরিমাণের ট্রানজেকশন আইডি (TrxID) নিচের ঘরে লিখে সাবমিট করুন।</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {method} ট্রানজেকশন আইডি (TrxID):
              </label>
              <input
                type="text"
                placeholder="যেমন: BKH8291823"
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg uppercase tracking-wider font-mono text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !trxId.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-sm"
            >
              {isProcessing ? "যাচাই হচ্ছে..." : "পেমেন্ট ভেরিফাই ও ক্রেডিট রিচার্জ করুন"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
