import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Lock, ShieldCheck, Database, Key } from "lucide-react";

export const metadata = {
  title: "গোপনীয়তা নীতি (Privacy Policy)",
  description: "LegalAI BD প্ল্যাটফর্মে অ্যাডভোকেট ও ক্লায়েন্ট তথ্যের গোপনীয়তা ও সুরক্ষা নীতিমালা।",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরে যান</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">LegalAI BD</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50">
            গোপনীয়তা নীতি (Privacy Policy)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            সর্বশেষ পরিমার্জন: নভেম্বর ২০২৬ | আইনজীবী-ক্লায়েন্ট প্রিভিলেজ ও সাইবার নিরাপত্তা নিশ্চিতে প্রতিশ্রুতিবদ্ধ
          </p>
        </div>

        {/* Highlight Card */}
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
            <p className="font-bold">অ্যাডভোকেট-ক্লায়েন্ট তথ্যের সর্বোচ্চ নিরাপত্তা গ্যারান্টি:</p>
            <p className="leading-relaxed">
              আইন পেশার নীতি ও এভিডেন্স অ্যাক্ট ১৮৭২ (The Evidence Act 1872, Sec 126) অনুসারে অ্যাডভোকেট ও মক্কেলের মধ্যকার বার্তা ও দলিলের পূর্ণাঙ্গ গোপনীয়তা বজায় রাখা আমাদের প্রধান অগ্রাধিকার। প্ল্যাটফর্মে সংরক্ষিত কোনো মামলার তথ্য তৃতীয় পক্ষের কাছে বিক্রয় বা প্রশিক্ষণ কাজে বাণিজ্যিক উন্মুক্তকরণ করা হয় না।
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              ১. আমরা কী তথ্য সংগ্রহ করি?
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>অ্যাকাউন্ট তথ্য:</strong> অ্যাডভোকেটের পূর্ণ নাম, মোবাইল নম্বর, ইমেইল, বাংলাদেশ বার কাউন্সিল আইডি এবং চেম্বারের ঠিকানা।</li>
              <li><strong>মামলা ও বয়ান সংক্রান্ত তথ্য:</strong> মক্কেলের প্রাথমিক বক্তব্য, পক্ষগণের বিবরণ, মামলার সংশ্লিষ্ট আদালতের নাম এবং সংযুক্ত নথিপত্র (OCR এনালাইসিসের জন্য)।</li>
              <li><strong>পেমেন্ট ট্রানজ্যাকশন:</strong> মোবাইল ফিনান্সিয়াল সার্ভিসেস (MFS) TrxID ও পেমেন্ট হিস্টোরি (কার্ড নম্বর বা পাসওয়ার্ড আমাদের সার্ভারে সংরক্ষণ করা হয় না)।</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              ২. তথ্যের প্রক্রিয়াকরণ ও এআই মডেলের ব্যবহার
            </h2>
            <p>
              মামলার বয়ান প্রক্রিয়াকরণে এবং আইনের সুনির্দিষ্ট ধারা শনাক্তকরণে যে এআই মডেল (Google Gemini ও নিজস্ব RAG ইঞ্জিন) ব্যবহার করা হয়, তা এনক্রিপ্টেড চ্যানেলে কল করা হয়। আপনার সংবেদনশীল কেস ডেটা কখনোই সাধারণ পাবলিক এআই প্রশিক্ষণে ব্যবহৃত হয় না।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              ৩. ডেটা এনক্রিপশন ও ব্যাকআপ
            </h2>
            <p>
              ডাটাবেসে সংরক্ষিত নথিপত্র ও প্রমাণাদি ইন্ডাস্ট্রি-স্ট্যান্ডার্ড AES-256 এনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে। ট্রানজিট লেভেলে TLS 1.3 এনক্রিপশন ব্যবহার করা হয় যা ম্যান-ইন-দ্য-মিডল (MITM) আক্রমণ প্রতিহত করে।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              ৪. ডেটা মুছে ফেলা ও অ্যাডভোকেটের নিয়ন্ত্রণ
            </h2>
            <p>
              যেকোনো অ্যাডভোকেট তার চেম্বারের কোনো নথি বা সম্পূর্ণ মামলা প্ল্যাটফর্ম থেকে স্থায়ীভাবে মুছে ফেলার পূর্ণ অধিকার সংরক্ষণ করেন। ডিলিট করার সঙ্গে সঙ্গেই তা আমাদের সক্রিয় ডাটাবেস থেকে মুছে ফেলা হয়।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
