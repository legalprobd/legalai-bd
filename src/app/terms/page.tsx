import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "ব্যবহারের শর্তাবলি (Terms of Service)",
  description: "LegalAI BD প্ল্যাটফর্ম ব্যবহারের সাধারণ শর্তাবলি ও নিয়মকানুন।",
};

export default function TermsPage() {
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
            ব্যবহারের শর্তাবলি (Terms of Service)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            সর্বশেষ পরিমার্জন: নভেম্বর ২০২৬ | বাংলাদেশ আইন ও তথ্যপ্রযুক্তি বিধিমালা অনুসারে কার্যকর
          </p>
        </div>

        {/* Mandatory Legal Warning Alert */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">বাধ্যতামূলক আইনি সতর্কতা ও ডিসক্লেইমার:</p>
            <p className="leading-relaxed">
              LegalAI BD কোনো নিবন্ধিত ল’ ফার্ম বা বিচারিক কর্তৃপক্ষ নয় এবং প্ল্যাটফর্মটি কোনো অবস্থাতেই সরাসরি আইনি পরামর্শ (Legal Advice) প্রদান করে না। এটি একটি কৃত্রিম বুদ্ধিমত্তা ও সফটওয়্যার নির্ভর খসড়া ও গবেষণা সহকারী টুল যা কেবল বাংলাদেশ বার কাউন্সিলের সনদপ্রাপ্ত বিজ্ঞ অ্যাডভোকেট ও আইন পেশাজীবীদের কার্যসহায়তার জন্য প্রস্তুতকৃত। আদালতে কোনো নথি দাখিলের পূর্বে সংশ্লিষ্ট আইনজীবীর ব্যক্তিগত যাচাইকরণ ও দায়িত্ব নেওয়া বাধ্যতামূলক।
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ১. সেবা গ্রহণের যোগ্যতা ও অ্যাকাউন্ট নিরাপত্তা
            </h2>
            <p>
              LegalAI BD প্ল্যাটফর্ম ব্যবহারের জন্য ব্যবহারকারীকে অবশ্যই বাংলাদেশ বার কাউন্সিলের নিবন্ধিত সদস্য অথবা সংশ্লিষ্ট আইনজীবীর মনোনীত সহকারী বা জুনিয়র হতে হবে। ব্যবহারকারী তার অ্যাকাউন্টের পাসওয়ার্ড ও অ্যাক্সেস সুরক্ষার জন্য সম্পূর্ণ দায়ী থাকবেন।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ২. এআই জেনারেটেড খসড়া ও আইনজীবীর দায়ভার
            </h2>
            <p>
              প্ল্যাটফর্মের মাধ্যমে স্বয়ংক্রিয়ভাবে প্রস্তুতকৃত যে কোনো আরজি (Plaint), এজাহার (FIR), দরখাস্ত (Petition) বা লিগ্যাল নোটিশ কেবল প্রাথমিক খসড়া মাত্র। বাংলাদেশ কোর্ট রুলস, মামলা দায়েরের তামাদি আইন (Limitation Act 1908) এবং আদালতের এখতিয়ার যাচাইয়ের চূড়ান্ত দায়িত্ব সংশ্লিষ্ট অ্যাডভোকেটের ওপর বর্তাবে। ভুল তথ্য বা অসম্পূর্ণ তথ্যের কারণে মামলার কোনো ক্ষতির দায় সফটওয়্যার কর্তৃপক্ষ বহন করবে না।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ৩. ক্লায়েন্ট গোপনীয়তা ও তথ্য অধিকার
            </h2>
            <p>
              অ্যাডভোকেট-ক্লায়েন্ট প্রিভিলেজ (Advocate-Client Privilege) রক্ষার্থে আমরা ক্লায়েন্টের ব্যক্তিগত তথ্য সর্বোচ্চ এনক্রিপশনের মাধ্যমে সংরক্ষণ করি। কোনো তৃতীয় পক্ষের নিকট আইনজীবীর চেম্বারের নথি উন্মুক্ত করা হয় না।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ৪. সাবস্ক্রিপশন, পেমেন্ট ও রিফান্ড
            </h2>
            <p>
              প্রদত্ত সাবস্ক্রিপশন প্ল্যানসমূহ (FREE, PRO, CHAMBER) মাসিক বা বাৎসরিক ভিত্তিতে কার্যকর হবে। মোবাইল ব্যাংকিং (bKash/Nagad) বা কার্ডের মাধ্যমে পেমেন্ট সম্পন্ন হওয়ার পর সার্ভিস অ্যাক্টিভেশন নিশ্চিত করা হবে। ডিজিটাল সার্ভিসের প্রকৃতি অনুযায়ী ব্যবহার শুরু হওয়ার পর পেমেন্ট রিফান্ডযোগ্য নয়।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ৫. প্রযোজ্য আইন ও বিরোধ নিষ্পত্তি
            </h2>
            <p>
              এই শর্তাবলি গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত আইন দ্বারা পরিচালিত ও ব্যাখ্যায়িত হবে। প্ল্যাটফর্ম ব্যবহার সংক্রান্ত যেকোনো বিরোধের ক্ষেত্রে ঢাকার উপযুক্ত দেওয়ানি আদালতের বিচারিক এখতিয়ার প্রযোজ্য হবে।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
