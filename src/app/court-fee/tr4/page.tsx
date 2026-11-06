"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Receipt,
  Printer,
  Copy,
  Check,
  Building,
  Coins,
  Scale,
  Sparkles,
  ArrowLeft,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";
import {
  generateTR4ChallanHtml,
  numberToBengaliWords,
  TR4ChallanData,
  toBengaliDigits,
} from "@/lib/templates/courtEssentialsTemplates";

const HEAD_OF_ACCOUNT_PRESETS = [
  { code: "1-40-801", label: "১-৪০-৮০১ (কোর্ট ফি ও প্রসেস ফি আদায়)" },
  { code: "1-1101-0025-2681", label: "১-১১০১-০০২৫-২৬৮১ (আদালতের অন্যান্য প্রশাসনিক ফিস ও বিবিধ)" },
  { code: "1-2101-0001-1801", label: "১-২১০১-০০০১-১৮০১ (ট্রেজারি জুডিশিয়াল ফাইন/জরিমানা)" },
  { code: "CUSTOM", label: "অন্যান্য হিসাব কোড (ম্যানুয়াল এন্ট্রি)" },
];

export default function TR4ChallanPage() {
  const [headPreset, setHeadPreset] = useState("1-40-801");
  const [customHead, setCustomHead] = useState("");
  const [courtName, setCourtName] = useState("বিজ্ঞ যুগ্ম জেলা ও দায়রা জজ ১ম আদালত");
  const [district, setDistrict] = useState("ঢাকা");
  const [bankBranch, setBankBranch] = useState("সোনালী ব্যাংক লিমিটেড, ঢাকা জজ কোর্ট শাখা");
  const [depositorName, setDepositorName] = useState("ব্যারিস্টার মোঃ তানভীর আহমেদ");
  const [depositorAddress] = useState("চেম্বার ৩০৪, সুপ্রিম কোর্ট বার অ্যানেক্স, ঢাকা");
  const [onBehalfOfName, setOnBehalfOfName] = useState("জনাব আলহাজ্ব নূরুল হুদা (বাদী)");
  const [caseNo, setCaseNo] = useState("দেওয়ানি মোকদ্দমা নং ৪৫/২০২৪");
  const [purpose, setPurpose] = useState("বিজ্ঞ আদালতের আদেশানুযায়ী অ্যাড-ভ্যালোরেম কোর্ট ফি বাবদ সরকারি কোষাগারে জমাদান");
  const [amount, setAmount] = useState<number>(1500);
  const [copied, setCopied] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState("");

  React.useEffect(() => {
    setCurrentDateStr(new Date().toLocaleDateString("bn-BD"));
  }, []);

  const selectedHead = headPreset === "CUSTOM" ? customHead : headPreset;
  const amountWords = numberToBengaliWords(amount || 0);

  const challanData: TR4ChallanData = {
    headOfAccount: selectedHead,
    courtName,
    district,
    bankBranch,
    depositorName,
    depositorAddress,
    onBehalfOfName,
    caseNo,
    purpose,
    amount: Number(amount) || 0,
    dateStr: currentDateStr || "আজকের তারিখ",
  };

  const challanHtml = generateTR4ChallanHtml(challanData);

  const handleCopy = () => {
    navigator.clipboard.writeText(challanHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TR-4 Treasury Challan Print</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            body { background: white; font-family: 'SolaimanLipi', 'Kalpurush', serif; }
          </style>
        </head>
        <body class="p-4">
          ${challanHtml}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/court-fee"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> কোর্ট ফি ক্যালকুলেটরে ফিরুন
                </Link>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Sparkles className="w-3 h-3" /> Treasury Rules Form No. TR-4 (বিধি ৯২)
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                টি.আর. ৪ চালান ফরম জেনারেটর (TR-4 Treasury Challan)
              </h1>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                বাংলাদেশ ট্রেজারি বিধিমালা অনুযায়ী কোর্ট ফি, প্রসেস ফি, খোরপোশ বা জরিমানার সরকারি ট্রেজারি চালান অবিলম্বে প্রস্তুত করুন এবং ব্যাংকে জমার জন্য প্রিন্ট নিন।
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "কপি সম্পন্ন" : "কপি"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>চালান প্রিন্ট করুন (Print TR-4)</span>
              </button>
            </div>
          </div>

          {/* Form & Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>চালানের হিসাব ও বিবরণ এন্ট্রি</span>
              </h2>

              {/* Head of account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  হেড অফ অ্যাকাউন্ট / হিসাব কোড (Head of Account):
                </label>
                <select
                  value={headPreset}
                  onChange={(e) => setHeadPreset(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 mb-1.5 bg-slate-50 font-medium text-slate-800"
                >
                  {HEAD_OF_ACCOUNT_PRESETS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {headPreset === "CUSTOM" && (
                  <input
                    type="text"
                    value={customHead}
                    onChange={(e) => setCustomHead(e.target.value)}
                    placeholder="যেমন: 1-40-801"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                  />
                )}
              </div>

              {/* Court & District */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    মোকাম আদালত:
                  </label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    জেলা:
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Bank Branch */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ট্রেজারি / ব্যাংক ও শাখার নাম:
                </label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              {/* Case No & Parties */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    মামলা নম্বর:
                  </label>
                  <input
                    type="text"
                    value={caseNo}
                    onChange={(e) => setCaseNo(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    যাহার বাবদ জমা (পক্ষ):
                  </label>
                  <input
                    type="text"
                    value={onBehalfOfName}
                    onChange={(e) => setOnBehalfOfName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Depositor Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  জমাকারীর নাম (কৌঁসুলি বা প্রতিনিধি):
                </label>
                <input
                  type="text"
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  জমার কারণ ও বিবরণ (Purpose):
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              {/* Amount */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>টাকার পরিমাণ (Amount in BDT):</span>
                    <span className="text-[11px] font-mono text-indigo-700">৳ {toBengaliDigits(amount || 0)}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-sm font-bold p-2 bg-white rounded-lg border border-indigo-300 text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="text-xs text-indigo-950 pt-1">
                  <span className="font-bold">কথায়: </span>
                  <span className="font-semibold">{amountWords}</span>
                </div>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">টি.আর. ৪ চালানের চূড়ান্ত প্রিভিউ (A4 Format)</span>
                </div>

                <div className="flex lg:hidden items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" /> প্রিন্ট
                  </button>
                </div>
              </div>

              <div
                className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-y-auto max-h-[750px]"
                dangerouslySetInnerHTML={{ __html: challanHtml }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
