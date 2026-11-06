"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Sparkles,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Copy,
  Check,
  Share2,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { VoiceInputButton } from "@/components/common/VoiceInputButton";

export default function PublicIntakePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("AUTO");
  const [statement, setStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const presets = [
    {
      title: "জমি দখল ও সীমানা বিরোধ",
      cat: "Civil",
      text: "আমার পৈতৃক সূত্রে প্রাপ্ত মিরপুরের জমিতে সীমানা প্রাচীর নির্মাণের সময় প্রতিবেশী আনোয়ার হোসেন দলবল নিয়ে এসে কাজ বন্ধ করে দেয় এবং লোহার রড নিয়ে আক্রমণ করে। সে ভুয়া দলিল তৈরি করে জমি দখলের পাঁয়তারা করছে এবং আমাকে প্ররোচনা ও প্রাণনাশের হুমকি দিচ্ছে।",
    },
    {
      title: "প্রকাশ্য ধূমপান ও গণউপদ্রব",
      cat: "Criminal",
      text: "আমাদের গলির মোড়ের চা দোকানে শামীম ও তার সহযোগীরা প্রকাশ্য পাবলিক প্লেসে চেইন স্মোকিং করে চারপাশের পথচারী ও শিশুদের ক্ষতি করছে। নিষেধ করায় আমাকে অকথ্য ভাষায় গালিগালাজ করে এবং মারধরের হুমকি দেয়।",
    },
    {
      title: "চেক ডিজঅনার (এনআই অ্যাক্ট)",
      cat: "Special_Tribunal",
      text: "ব্যবসায়িক পাওনা বাবদ জনাব রফিকুল ইসলাম আমাকে ৫,০০,০০০ টাকার একটি ডাচ-বাংলা ব্যাংক চেক প্রদান করেন। ব্যাংকে জমা দিলে অ্যাকাউন্টে পর্যাপ্ত ফান্ড না থাকায় চেকটি ডিজঅনার হয়। পরে বারবার তাগাদা দেওয়া সত্ত্বেও টাকা পরিশোধ করছে না।",
    },
  ];

  const handleCopyPublicLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/intake`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !statement.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawStatement: `[মক্কেল: ${fullName}, ফোন: ${phone}, ঠিকানা: ${address || "উল্লেখ নেই"}]\n\n${statement}`,
          category: category === "AUTO" ? undefined : category,
          clientPhone: phone,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setSubmitted(true);
        setCaseId(json.data.id);
      } else {
        alert(json.error?.messageBn || "ইনটেক জমা ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      {/* Unified Chamber Top Navbar */}
      <AppNavbar />

      <div className="flex-1 flex w-full">
        {/* Unified Chamber Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Page Top Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  অনলাইন মক্কেল ইনটেক ফরম (Automated Client Intake)
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  চেম্বারে আসার আগেই মক্কেলের প্রাথমিক জবানবন্দি নথিভুক্তি ও স্বয়ংক্রিয় এআই বিশ্লেষণ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedLink ? "লিংক কপি হয়েছে!" : "মক্কেল শেয়ার লিংক কপি"}</span>
              </button>
              <Link
                href="/citizen"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition"
              >
                <span>ফ্রি নাগরিক জিডি পোর্টাল</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {submitted ? (
            <div className="p-10 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                মক্কেলের প্রাথমিক জবানবন্দি সফলভাবে চেম্বারে অন্তর্ভুক্ত হয়েছে!
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                মক্কেল <strong>{fullName}</strong>-এর বিবরণ আমাদের লিগ্যাল এআই দ্বারা বিশ্লেষণ করা হয়েছে এবং চেম্বার কেস ফাইলে সংরক্ষিত হয়েছে।
              </p>

              <div className="pt-4 flex justify-center gap-3">
                {caseId && (
                  <Link
                    href={`/case/${caseId}`}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    নতুন কেস ফাইলে যান →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setStatement("");
                    setFullName("");
                    setPhone("");
                    setEmail("");
                    setAddress("");
                    setCategory("AUTO");
                  }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  আরেকটি ইনটেক যোগ করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Intake Form (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Friendly Guidance Box */}
                <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950 space-y-1">
                    <p className="font-bold">আইনি ধারা বা শ্রেণিবিভাগ জানা না থাকলেও কোনো সমস্যা নেই!</p>
                    <p className="text-indigo-800 leading-relaxed text-[11px]">
                      ঘটনার শ্রেণিবিভাগ (দেওয়ানি নাকি ফৌজদারি) বাছাই করা আবশ্যক নয়। আপনি শুধু সহজ ভাষায় কী ঘটেছে তা লিখলেই আমাদের লিগ্যাল এআই স্বয়ংক্রিয়ভাবে সঠিক আইনের ধারা, কোর্ট এবং প্রয়োজনীয় খসড়া প্রস্তুত করে দেবে।
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                  {/* Quick Sample Presets */}
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>দ্রুত নমুনা থেকে লিখুন (Quick Templates):</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {presets.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setStatement(p.text);
                            setCategory(p.cat);
                            if (!fullName) setFullName("মো. আবেদনকারী");
                            if (!phone) setPhone("01711000000");
                          }}
                          className="p-3 text-left rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/40 transition group cursor-pointer"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            নমুনা টেক্সট বসাতে ক্লিক করুন
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          মক্কেলের পূর্ণ নাম *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="যেমন: মো. আব্দুল করিম"
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          মোবাইল নম্বর *
                        </label>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="017xxxxxxxx"
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ইমেইল ঠিকানা (ঐচ্ছিক)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@mail.com"
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>মামলার বিষয়শ্রেণি (Category)</span>
                          <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            না জানলে এআই নির্ধারণ করবে
                          </span>
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition cursor-pointer"
                        >
                          <option value="AUTO">✨ স্বয়ংক্রিয় এআই শনাক্তকরণ (AI Auto-Detect — ঘটনা পড়ে AI শ্রেণি ঠিক করবে)</option>
                          <option value="Criminal">ফৌজদারি (মারধর, হুমকি, চুরি, ভাঙচুর বা এজাহার)</option>
                          <option value="Civil">দেওয়ানি (জমিজমা, দলিল, স্বত্ব বা নিষেধাজ্ঞা)</option>
                          <option value="Special_Tribunal">চেক ডিজঅনার (এনআই অ্যাক্ট ১৩৮ ধারা / সাইবার ট্রাইব্যুনাল)</option>
                          <option value="Family">পারিবারিক (দেনমোহর, ভরণপোষণ বা বিবাহবিচ্ছেদ)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        মক্কেলের বর্তমান ঠিকানা
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="গ্রাম/মহল্লা, থানা, জেলা..."
                        className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          ঘটনার বিস্তারিত বিবরণ (বাংলা ভাষায় সহজভাবে লিখুন) *
                        </label>
                        <VoiceInputButton
                          onTranscript={(txt) => setStatement((prev) => (prev ? `${prev} ${txt}` : txt))}
                        />
                      </div>
                      <textarea
                        rows={6}
                        required
                        value={statement}
                        onChange={(e) => setStatement(e.target.value)}
                        placeholder="ঘটনাটি কখন, কোথায় ঘটেছিল এবং অপর পক্ষ কী ধরনের অবিচার বা ক্ষতি করেছে তা সহজ ভাষায় লিখুন..."
                        className="w-full text-xs p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition leading-relaxed"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{isSubmitting ? "জমা হচ্ছে ও AI বিশ্লেষণ চলছে..." : "ইনটেক জমা ও এআই কেস ফাইল তৈরি করুন"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Information & Feature Guide */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-xs text-slate-900">ইনটেক ফরম কীভাবে কাজ করে?</h3>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">১</span>
                      <span>মক্কেল চেম্বারে সরাসরি এলে বা ফোনে কথা বলে আইনজীবী নিজেই এখানে তথ্য ইনপুট দিতে পারেন।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">২</span>
                      <span>অথবা ওপরের <strong>&quot;মক্কেল শেয়ার লিংক কপি&quot;</strong> দিয়ে লিংকটি মক্কেলের হোয়াটসঅ্যাপে পাঠিয়ে সরাসরি পূরণ করিয়ে নিতে পারেন।</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">৩</span>
                      <span>জমা হওয়ার সাথে সাথে এআই ইঞ্জিন তামাদি আইন (Limitation), পেনাল কোড ধারা ও আদালতের খসড়া নিজে নিজেই প্রস্তুত করে নেবে।</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-white rounded-3xl p-6 border border-indigo-100/80 shadow-xs space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>স্মার্ট এআই অটোমেশন</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">আইনি অজ্ঞতার কোনো বাধা নেই</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    মক্কেল আইনি ধারা না বুঝলেও তার স্বাভাবিক মুখের ভাষাতেই ঘটনা রেকর্ড করা যায়। আমাদের বাংলাদেশের আইন সংক্রান্ত ট্রেইন্ড এআই মডেল ধারাগুলোকে সাজিয়ে বিজ্ঞ আইনজীবীর সামনে উপস্থাপন করবে।
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
