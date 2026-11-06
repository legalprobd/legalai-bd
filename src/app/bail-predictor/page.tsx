"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Scale,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { BailPredictionResult } from "@/app/api/bail-predictor/route";

const PRESETS = [
  {
    name: "১. দীর্ঘ কারাবাস ও অসুস্থতা (৩০৭ ধারা, ৯০ দিন)",
    sections: "দণ্ডবিধি আইনের ৩২৩/৩২৫/৩২৬/৩০৭ ধারা",
    days: 90,
    csSubmitted: false,
    prevRecord: false,
    med: "CRITICAL",
    gender: "MALE",
    age: 48,
  },
  {
    name: "২. জামিনযোগ্য অপরাধ (ধারা ৪২০/৫০৬ ও এনআই অ্যাক্ট)",
    sections: "দণ্ডবিধি আইনের ৪২০/৪০৬/৫০৬ ধারা এবং এনআই অ্যাক্ট ১৩৮ ধারা",
    days: 20,
    csSubmitted: false,
    prevRecord: false,
    med: "NONE",
    gender: "MALE",
    age: 35,
  },
  {
    name: "৩. নারী আসামি (৪৯৭ ধারা প্রোভাইসো ও পারিবারিক মামলা)",
    sections: "পেনাল কোড ধারা ৩২৩/৩২৪/৪৯৮ ও নারী ও শিশু নির্যাতন দমন আইন",
    days: 45,
    csSubmitted: false,
    prevRecord: false,
    med: "MODERATE",
    gender: "FEMALE",
    age: 28,
  },
];

export default function BailPredictorPage() {
  const [offenceSections, setOffenceSections] = useState("দণ্ডবিধি আইনের ৩২৩/৩২৫/৩২৬/৩০৭ ধারা");
  const [daysInCustody, setDaysInCustody] = useState<number>(90);
  const [isChargeSheetSubmitted, setIsChargeSheetSubmitted] = useState<boolean>(false);
  const [hasPreviousCriminalRecord, setHasPreviousCriminalRecord] = useState<boolean>(false);
  const [medicalCondition, setMedicalCondition] = useState<"NONE" | "MODERATE" | "CRITICAL">("CRITICAL");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [age, setAge] = useState<number>(45);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BailPredictionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!offenceSections.trim()) {
      setErrorMsg("অনুগ্রহ করে মামলার ধারা বা অভিযোগের বিবরণ প্রদান করুন।");
      return;
    }

    try {
      setErrorMsg(null);
      setLoading(true);
      const res = await fetch("/api/bail-predictor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offenceSections,
          daysInCustody: Number(daysInCustody) || 0,
          isChargeSheetSubmitted,
          hasPreviousCriminalRecord,
          medicalCondition,
          gender,
          age: Number(age) || 30,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setResult(json.data);
      } else {
        setErrorMsg(json.error || "বিশ্লেষণ সম্পন্ন করতে ব্যর্থ হয়েছে।");
      }
    } catch {
      setErrorMsg("সার্ভার সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const getProgressBarColor = (prob: number) => {
    if (prob < 30) return "bg-rose-600";
    if (prob <= 70) return "bg-amber-500";
    return "bg-emerald-600";
  };

  const getProgressBg = (prob: number) => {
    if (prob < 30) return "bg-rose-50 border-rose-200 text-rose-800";
    if (prob <= 70) return "bg-amber-50 border-amber-200 text-amber-800";
    return "bg-emerald-50 border-emerald-200 text-emerald-800";
  };

  const copyPrecedent = (citation: string, title: string) => {
    navigator.clipboard.writeText(`${citation} (${title})`);
    setCopiedCitation(citation);
    setTimeout(() => setCopiedCitation(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Bail Outcome Predictor • CrPC 497 & 51 DLR (AD) 1 Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              আদালতের জামিন সম্ভাবনা ও ফলাফল প্রিডিক্টর
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              মামলার ধারা, হাজতবাসের মেয়াদ, চার্জশিট অবস্থা ও শারীরিক অসুস্থতার ভিত্তিতে সুপ্রিম কোর্টের ঐতিহাসিক নজির (BLAST vs Bangladesh, Abul Hossain) মোতাবেক জামিনের সঠিক সম্ভাবনা বিশ্লেষণ করুন।
            </p>
          </div>

          {/* Presets */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">দ্রুত নমুনা প্যারামিটার:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setOffenceSections(p.sections);
                  setDaysInCustody(p.days);
                  setIsChargeSheetSubmitted(p.csSubmitted);
                  setHasPreviousCriminalRecord(p.prevRecord);
                  setMedicalCondition(p.med as any);
                  setGender(p.gender as any);
                  setAge(p.age);
                }}
                className="text-xs bg-white hover:bg-slate-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Main Grid: Form Left, Prediction Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>আসামির তথ্য ও মামলার প্যারামিটার</span>
              </h2>

              {/* Offence Sections */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মামলার ধারা বা অভিযোগের বিবরণ:
                </label>
                <input
                  type="text"
                  value={offenceSections}
                  onChange={(e) => setOffenceSections(e.target.value)}
                  placeholder="যেমন: ৩২৩/৩২৫/৩২৬/৩০৭/৫০৬ ধারা"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Days in Custody */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>হাজতবাসের দিন (Days in Custody):</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={daysInCustody}
                    onChange={(e) => setDaysInCustody(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>বয়স (Age in Years):</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Gender & Medical Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    লিঙ্গ (৪৯৭ ধারা প্রোভাইসো):
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="MALE">পুরুষ (Male)</option>
                    <option value="FEMALE">নারী (Female - বিশেষ অনুকম্পা)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    <span>শারীরিক অবস্থা (Medical):</span>
                  </label>
                  <select
                    value={medicalCondition}
                    onChange={(e) => setMedicalCondition(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="NONE">স্বাভাবিক সুস্থ</option>
                    <option value="MODERATE">মাঝারি অসুস্থ (চিকিৎসাধীন)</option>
                    <option value="CRITICAL">গুরুতর অসুস্থ (হৃদরোগ/ক্যান্সার/প্যারালাইসিস)</option>
                  </select>
                </div>
              </div>

              {/* Charge Sheet & Criminal Record Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">পুলিশ চার্জশিট দাখিল হয়েছে?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsChargeSheetSubmitted(true)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                        isChargeSheetSubmitted ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                      }`}
                    >
                      হ্যাঁ
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChargeSheetSubmitted(false)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                        !isChargeSheetSubmitted ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                      }`}
                    >
                      না
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">পূর্বের কোনো অপরাধের রেকর্ড আছে?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHasPreviousCriminalRecord(true)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                        hasPreviousCriminalRecord ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                      }`}
                    >
                      হ্যাঁ
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasPreviousCriminalRecord(false)}
                      className={`px-3 py-1 text-xs rounded-lg font-bold transition ${
                        !hasPreviousCriminalRecord ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300"
                      }`}
                    >
                      না
                    </button>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={handlePredict}
                className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>সুপ্রিম কোর্টের নজির অনুযায়ী জামিন বিশ্লেষণ চলছে...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>জামিনের সম্ভাবনা গণনা করুন (Predict Bail Outcome)</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm min-h-[550px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span>আইনি পূর্বাভাস ও জামিন কৌশল রিপোর্ট</span>
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ফৌজদারি কার্যবিধি আইনের ৪৯৬-৪৯৮ ধারা
                  </span>
                </div>

                {!result ? (
                  <div className="p-12 text-center text-slate-400">
                    <Scale className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">কোনো জামিন বিশ্লেষণ চালানো হয়নি</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      বাম পাশের ফর্মের প্যারামিটার পূরণ করে &quot;জামিনের সম্ভাবনা গণনা করুন&quot; বাটনে চাপুন।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Visual Probability Bar */}
                    <div className={`p-4 rounded-xl border ${getProgressBg(result.probability)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          জামিনের সামগ্রিক সম্ভাবনা (Bail Probability):
                        </span>
                        <span className="text-xl font-black font-mono">
                          {result.probability}%
                        </span>
                      </div>

                      {/* Progress Track */}
                      <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(
                            result.probability
                          )}`}
                          style={{ width: `${result.probability}%` }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-600">
                        <span>০% (কম সম্ভাবনা)</span>
                        <span>৫০% (শুনানি নির্ভর)</span>
                        <span>১০০% (নিশ্চিত জামিন)</span>
                      </div>
                    </div>

                    {/* Grounds */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 text-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>আদালতে উপস্থাপনের জন্য জোরালো আইনি গ্রাউন্ডসমূহ:</span>
                      </h3>
                      <ul className="space-y-1.5">
                        {result.groundsBn.map((g, i) => (
                          <li
                            key={i}
                            className="text-xs p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 flex items-start gap-2"
                          >
                            <span className="text-emerald-700 font-bold">✓</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Strategy */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950">
                      <strong className="font-bold flex items-center gap-1.5 mb-1 text-indigo-900">
                        <Lightbulb className="w-4 h-4 text-indigo-700" />
                        আইনজীবীর জন্য কৌশলগত সুপারিশ (Advocate Strategy):
                      </strong>
                      <p className="leading-relaxed">{result.advocateStrategyBn}</p>
                    </div>

                    {/* Relevant Precedents */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600" />
                        <span>সংশ্লিষ্ট সুপ্রিম কোর্টের নজির (Relevant Precedents):</span>
                      </h3>
                      <div className="space-y-2">
                        {result.relevantPrecedents.map((p, idx) => {
                          const isCopied = copiedCitation === p.citation;
                          return (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-indigo-900 font-mono text-[11px] block">
                                  {p.citation} — {p.titleBn}
                                </span>
                                <p className="text-slate-600 text-[11px] mt-0.5">{p.ratioBn}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyPrecedent(p.citation, p.titleBn)}
                                className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 shrink-0 flex items-center gap-1"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{isCopied ? "কপি হয়েছে" : "কপি"}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {result && (
                <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                  LegalAI BD v3.0 Bail Analytics Engine • সুপ্রিম কোর্টের আপিল বিভাগের রায় অনুযায়ী প্রস্তুতকৃত
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
