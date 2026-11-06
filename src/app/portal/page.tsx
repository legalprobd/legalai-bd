"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  Phone,
  Clock,
  Download,
  AlertCircle,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";

function ClientPortalContent() {
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "01812345678";
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/portal`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Top Page Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  মক্কেল সেবা পোর্টাল ভিউ (Client Portal Live Preview)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  মক্কেল তার মামলার অগ্রগতি, ধার্য তারিখ ও ফি লেনদেন যেভাবে দেখতে পান
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedLink ? "লিংক কপি হয়েছে!" : "মক্কেল পোর্টাল লিংক কপি"}</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                মক্কেল মো. আব্দুল করিম
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs text-indigo-600 font-bold mb-2">
                <Calendar className="w-4 h-4" />
                <span>পরবর্তী ধার্য তারিখ</span>
              </div>
              <div className="text-base font-black text-slate-900">
                ১২ নভেম্বর, ২০২৬
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                আদালত: বিজ্ঞ চিফ জুডিশিয়াল ম্যাজিস্ট্রেট আদালত
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs text-emerald-600 font-bold mb-2">
                <Clock className="w-4 h-4" />
                <span>মামলার বর্তমান অবস্থা</span>
              </div>
              <div className="text-base font-black text-slate-900">
                চলমান (Ongoing)
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                বিজ্ঞ ম্যাজিস্ট্রেট আদালত কর্তৃক কেস ডায়েরি তলব
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs text-purple-600 font-bold mb-2">
                <Building2 className="w-4 h-4" />
                <span>দায়িত্বপ্রাপ্ত বিজ্ঞ আইনজীবী</span>
              </div>
              <div className="text-base font-black text-slate-900">
                ব্যারিস্টার এম. এ. রহমান
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                চেম্বার যোগাযোগ: 01711000000
              </div>
            </div>
          </div>

          {/* Documents Shared with Client */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>আইনজীবী কর্তৃক শেয়ারকৃত নথিপত্র (Shared Case Documents)</span>
              <span className="text-xs text-slate-400 font-normal">৩টি নথি পাওয়া গেছে</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { title: "আদালতে দাখিলকৃত মূল নালিশি দরখাস্ত (সি.আর. ৮৩২/২০২৬)", date: "০১ নভেম্বর, ২০২৬", size: "২.৪ মেগাবাইট" },
                { title: "জবানবন্দি ও সাক্ষীদের তালিকা সারসংক্ষেপ", date: "০২ নভেম্বর, ২০২৬", size: "১.১ মেগাবাইট" },
                { title: "বিজ্ঞ আদালতের প্রসিডিংস ও পরবর্তী আদেশের কপি", date: "০৪ নভেম্বর, ২০২৬", size: "৮৫০ কিলোবাইট" },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900">{doc.title}</h4>
                      <span className="text-[10px] text-slate-400">{doc.date} • {doc.size}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert("নথির সুরক্ষিত কপি ডাউনলোড হচ্ছে...")}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-[11px] hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Account & Fee Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>আইনি ফি ও ট্রাস্ট অ্যাকাউন্ট বিবরণী (Billing Transparency)</span>
              <span className="text-xs text-emerald-600 font-bold">পরিশোধিত ও হালনাগাদ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500">মোট ধার্যকৃত লিগ্যাল ফি</span>
                <p className="text-xl font-black text-slate-900 mt-1">৳ ৩৫,০০০</p>
                <span className="text-[10px] text-emerald-600 font-semibold">সম্পূর্ণ পরিশোধিত (রশিদ নং: INV-2026-089)</span>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <span className="text-[11px] text-indigo-700">মক্কেল ট্রাস্ট লেজার (কোর্ট ফি ও খরচ জমা)</span>
                <p className="text-xl font-black text-indigo-950 mt-1">৳ ১৫,০০০</p>
                <span className="text-[10px] text-indigo-600 font-semibold">ব্যয়িত: ৳ ১২,৪৫০ | অবশিষ্ট উদ্বৃত্ত: ৳ ২,৫৫০</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PublicPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">পোর্টাল লোড হচ্ছে...</div>}>
      <ClientPortalContent />
    </Suspense>
  );
}
