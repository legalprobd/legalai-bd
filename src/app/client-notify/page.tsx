"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Sparkles,
  Phone,
  Calendar,
  Copy,
  Check,
  CheckCircle2,
  Share2,
  Clock,
  CreditCard,
  UserCheck,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function ClientNotifyPage() {
  const [clientName, setClientName] = useState("মো. আব্দুল করিম");
  const [clientPhone, setClientPhone] = useState("01712345678");
  const [caseTitle, setCaseTitle] = useState("বসতবাড়িতে হামলা ও ভাঙচুর — সি.আর. ৮৩২/২০২৬");
  const [notifyType, setNotifyType] = useState("HEARING_ALERT");
  const [hearingDate, setHearingDate] = useState("১২ নভেম্বর, ২০২৬");
  const [courtName, setCourtName] = useState("বিজ্ঞ চিফ জুডিশিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা");
  const [dueAmount, setDueAmount] = useState("১৫,০০০");
  const [customNotes, setCustomNotes] = useState("মূল দলিলের ২টি ফটোকপি ও জাতীয় পরিচয়পত্র সঙ্গে রাখবেন।");
  const [copied, setCopied] = useState(false);

  // Generate Message
  const getGeneratedMessage = () => {
    switch (notifyType) {
      case "HEARING_ALERT":
        return `শ্রদ্ধেয় ${clientName} সাহেব,\n\nরহমান অ্যান্ড পার্টনার্স চেম্বার থেকে জানাচ্ছি যে, আপনার মামলা "${caseTitle}"-এর পরবর্তী শুনানির তারিখ ধার্য করা হয়েছে:\n\n📅 তারিখ: ${hearingDate}\n🏛️ আদালত: ${courtName}\n\n📌 বিজ্ঞ আইনজীবীর নির্দেশনা:\n${customNotes}\n\nধার্য তারিখে সকাল ৯:৩০ ঘটিকার মধ্যে আদালতে উপস্থিত থাকার অনুরোধ করা হচ্ছে।\n\nধন্যবাদান্তে,\nব্যারিস্টার এম. এ. রহমান ও অ্যাসোসিয়েটস\nচেম্বার হটলাইন: 01711000000`;

      case "ORDER_SUMMARY":
        return `সম্মানিত ${clientName} সাহেব,\n\nআপনার মামলা "${caseTitle}"-এ আজ বিজ্ঞ আদালত সন্তুষ্ট হয়ে আসামিদের হাজিরার নির্দেশ দিয়েছেন এবং কেস ডায়েরি তলব করেছেন।\n\nমামলার পরবর্তী কার্যক্রম সুচারুরূপে এগিয়ে চলেছে। যেকোনো তথ্যের জন্য চেম্বারের সাথে যোগাযোগ করুন।\n\nধন্যবাদান্তে,\nরহমান অ্যান্ড পার্টনার্স লিগ্যাল টিম`;

      case "FEE_REMINDER":
        return `শ্রদ্ধেয় ${clientName} সাহেব,\n\nআপনার মামলা "${caseTitle}"-এর আদালতের কোর্ট ফি ও প্রসেস খরচের জন্য মক্কেল ট্রাস্ট লেজারে ৳ ${dueAmount} টাকা জমা করার অনুরোধ করা হচ্ছে।\n\nটাকা জমা দেওয়ার পর স্বয়ংক্রিয় মানি রিসিট আপনার ক্লায়েন্ট পোর্টালে সংরক্ষিত হবে।\n\nবিকাশ/নগদ/ব্যাংক হিসাবের জন্য চেম্বারে যোগাযোগ করুন: 01711000000।\n\nধন্যবাদান্তে,\nঅ্যাকাউন্টস বিভাগ, রহমান অ্যান্ড পার্টনার্স`;

      case "WITNESS_SUMMONS":
        return `জরুরি নোটিশ:\n\nশ্রদ্ধেয় ${clientName} সাহেব,\n\nআপনার মামলার গুরুত্বপূর্ণ সাক্ষীদের আগামী ${hearingDate} তারিখে ${courtName}-এ উপস্থিত থাকতে হবে।\n\nশুনানির পূর্বেই সাক্ষীদের জেরা প্রস্তুতি সম্পন্ন করতে আগামীকল বিকাল ৪:০০ টায় চেম্বারে উপস্থিত হতে অনুরোধ করা হলো।\n\nধন্যবাদান্তে,\nলিগ্যাল টিম, রহমান অ্যান্ড পার্টনার্স`;

      default:
        return "";
    }
  };

  const currentMessage = getGeneratedMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = clientPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`;
    const encodedText = encodeURIComponent(currentMessage);
    const url = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  মক্কেল অটোমেটেড নোটিফিকেশন হাব (Client Smart Notification & WhatsApp Hub)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  শুনানির তারিখ, আদালতের আদেশ, ও ফি সংক্রান্ত স্বয়ংক্রিয় বাংলা নোটিফিকেশন ও ১-ক্লিক হোয়াটসঅ্যাপ সেন্ডার
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/calendar"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                📅 কজ লিস্ট ও ক্যালেন্ডার
              </Link>
              <Link
                href="/portal"
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition"
              >
                মক্কেল পোর্টাল ভিউ →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>মক্কেল ও বার্তার প্যারামিটার</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ১-ক্লিক হোয়াটসঅ্যাপ
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">নোটিফিকেশনের ধরণ নির্বাচন করুন</label>
                <select
                  value={notifyType}
                  onChange={(e) => setNotifyType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer font-medium"
                >
                  <option value="HEARING_ALERT">📅 শুনানির তারিখ ও উপস্থিতি অ্যালার্ট (Hearing Alert)</option>
                  <option value="ORDER_SUMMARY">⚖️ আদালতের আদেশের সারসংক্ষেপ (Court Order Summary)</option>
                  <option value="FEE_REMINDER">💳 কোর্ট ফি ও ট্রাস্ট লেজার রিমাইন্ডার (Fee Reminder)</option>
                  <option value="WITNESS_SUMMONS">👥 সাক্ষীদের আদালতে হাজিরা তলব বার্তা (Witness Prep)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">মক্কেলের নাম *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">মোবাইল নম্বর (WhatsApp) *</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">মামলার শিরোনাম ও নম্বর</label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              {notifyType === "HEARING_ALERT" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">ধার্য তারিখ</label>
                      <input
                        type="text"
                        value={hearingDate}
                        onChange={(e) => setHearingDate(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">আদালতের নাম</label>
                      <input
                        type="text"
                        value={courtName}
                        onChange={(e) => setCourtName(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">মক্কেলের জন্য বিশেষ নির্দেশনা</label>
                    <input
                      type="text"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="যেমন: মূল দলিলের ফটোকপি সাথে আনতে হবে"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                    />
                  </div>
                </>
              )}

              {notifyType === "FEE_REMINDER" && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">বকেয়া / প্রয়োজনীয় টাকার পরিমাণ (৳)</label>
                  <input
                    type="text"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              )}

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>স্বয়ংক্রিয় এআই ড্রাফটিং:</strong> আপনি তথ্য পরিবর্তনের সাথে সাথে ডানের মেসেজটি স্বয়ংক্রিয়ভাবে পরিমার্জিত বাংলায় তৈরি হয়ে যাবে।
                </p>
              </div>
            </div>

            {/* Live Preview & Actions Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-xs text-slate-900">লাইভ বার্তা প্রিভিউ (WhatsApp / SMS Format)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">প্রেরণযোগ্য রেডি মেসেজ</span>
                </div>

                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
                  {currentMessage}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? "কপি সম্পন্ন!" : "মেসেজ কপি করুন"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>সরাসরি WhatsApp-এ পাঠান</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>
                </div>
              </div>

              {/* Delivery Protocol Card */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>আইনজীবী-মক্কেল যোগাযোগ অটোমেশনের সুবিধা</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800">১। মক্কেলের সময়মতো কোর্টে উপস্থিতি</p>
                    <p className="text-[11px] text-slate-500">শুনানির আগের দিন সুস্পষ্ট নোটিফিকেশন যাওয়ায় মক্কেল কখনো কোর্টের ধার্য তারিখ ভুল করেন না।</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800">২। ১০০% পেশাদারিত্ব ও স্বচ্ছতা</p>
                    <p className="text-[11px] text-slate-500">চেম্বারের প্যাডের ভাষায় নিখুঁত বাংলায় বার্তা পৌঁছায়, যা মক্কেলের আস্থা বহু গুণে বৃদ্ধি করে।</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
