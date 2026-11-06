import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Check, Sparkles, Building2, Zap, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "সাবস্ক্রিপশন ও মূল্যতালিকা (Pricing)",
  description: "বাংলাদেশের বিজ্ঞ অ্যাডভোকেট ও চেম্বারের জন্য সাশ্রয়ী এআই সাবস্ক্রিপশন প্ল্যানসমূহ।",
};

export default function PricingPage() {
  const plans = [
    {
      id: "FREE",
      name: "স্টার্টার (Starter)",
      price: "৳ ০",
      period: "আজীবন বিনামূল্যে",
      description: "নতুন অ্যাডভোকেট ও ট্রায়াল ব্যবহারের জন্য আদর্শ প্যাকেজ।",
      badge: "ফ্রি প্যাকেজ",
      buttonText: "বিনামূল্যে শুরু করুন",
      buttonHref: "/dashboard",
      features: [
        "মাসে ৫টি মামলার পূর্ণাঙ্গ ড্রাফটিং",
        "বেসিক বাংলাদেশ কোর্ট টেমপ্লেট (FIR, GD, নোটিশ)",
        "ইউনিকোড (Nikosh) ⇄ বিজয় (SutonnyMJ) লাইভ কনভার্টার",
        "মাইক্রোসফট ওয়ার্ড (.docx) এক্সপোর্ট",
        "তামাদি ক্যালকুলেটর মৌলিক সুবিধা",
      ],
      highlighted: false,
    },
    {
      id: "PRO",
      name: "অ্যাডভোকেট প্রো (Advocate PRO)",
      price: "৳ ১,৪৯০",
      period: "প্রতি মাসে (অথবা ৳ ১২,৯০০/বছর)",
      description: "স্বতন্ত্র প্র্যাকটিসকারী বিজ্ঞ আইনজীবীদের জন্য পূর্ণাঙ্গ এআই সমাধান।",
      badge: "সর্বাধিক জনপ্রিয়",
      buttonText: "প্রো-তে আপগ্রেড করুন",
      buttonHref: "/billing",
      features: [
        "আনলিমিটেড মামলা বিশ্লেষণ ও ড্রাফটিং",
        "৩৪টি পূর্ণাঙ্গ বাংলাদেশ জুডিশিয়াল কোর্ট টেমপ্লেট",
        "Google Gemini Live AI + RAG অফিসিয়াল আইন অনুসন্ধান",
        "সার্ভার-সাইড A4 জুডিশিয়াল PDF ও কালপুরুষ ফন্ট এক্সপোর্ট",
        "পূর্ণাঙ্গ তামাদি ক্যালকুলেটর ও তারিখ ট্র্যাকার",
        "স্বয়ংক্রিয় অপরাধের উপাদান শনাক্তকরণ ও সেকশন আপগ্রেড",
      ],
      highlighted: true,
    },
    {
      id: "CHAMBER",
      name: "চেম্বার পার্টনার (Chamber Enterprise)",
      price: "৳ ৩,৯৯০",
      period: "প্রতি মাসে (মাল্টি-ইউজার)",
      description: "ল' ফার্ম এবং সিনিয়র-জুনিয়র সমন্বিত বড় লিগ্যাল চেম্বারের জন্য।",
      badge: "চেম্বার টিম",
      buttonText: "চেম্বার প্ল্যান নিন",
      buttonHref: "/billing",
      features: [
        "সিনিয়র ও জুনিয়রদের জন্য মাল্টিপল টিম মেম্বার অ্যাকাউন্ট",
        "সেন্ট্রাল এভিডেন্স ভল্ট (Evidence Vault) ও চেম্বার ক্লায়েন্ট ফাইল",
        "কাস্টম চেম্বার লেটারহেড ও ডিজিটাল স্বাক্ষর ওয়াটারমার্কিং",
        "আদালত শুনানির দিনপঞ্জি ও কেস নোট শেয়ারিং",
        "ডেডিকেটেড এআই রিসোর্স ও প্রায়োরিটি গ্রাহক সেবা",
        "অ্যাডমিন ও রোল-বেসড এক্সেস কন্ট্রোল (RBAC)",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50  text-slate-900  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-200  pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600  hover:underline"
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

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-100  text-indigo-700  px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>স্বচ্ছ ও নিরাপদ বিকাশ / নগদ মোবাইল ব্যাংকিং পেমেন্ট</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 ">
            আপনার চেম্বারের প্র্যাকটিসের গতি বাড়াতে সঠিক প্ল্যান বেছে নিন
          </h1>
          <p className="text-sm sm:text-base text-slate-600 ">
            আইনি গবেষণা ও ড্রাফটিংয়ে শত শত কর্মঘণ্টা সাশ্রয় করুন। কোনো গোপন ফি নেই, যখন ইচ্ছা বাতিলযোগ্য।
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl flex flex-col justify-between p-6 sm:p-8 transition-all duration-200 ${
                p.highlighted
                  ? "bg-white  border-2 border-indigo-600  shadow-xl relative"
                  : "bg-white  border border-slate-200  shadow-sm hover:shadow-md"
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  {p.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 ">
                    {p.badge}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900  mt-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500  mt-1">
                    {p.description}
                  </p>
                </div>

                <div className="border-y border-slate-100  py-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 ">
                      {p.price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500  mt-1">
                    {p.period}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700  uppercase tracking-wider">
                    অন্তর্ভুক্ত সুবিধাসমূহ:
                  </p>
                  <ul className="space-y-2 text-xs text-slate-600 ">
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600  shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={p.buttonHref}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-center block transition-all shadow-xs ${
                    p.highlighted
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                      : "bg-slate-100 hover:bg-slate-200   text-slate-800 "
                  }`}
                >
                  {p.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ & Trust Note */}
        <div className="bg-white  rounded-2xl p-6 sm:p-8 border border-slate-200  text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-emerald-600  text-sm font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>বাংলাদেশ বার কাউন্সিল আইনজীবী নীতিমালার প্রতি শ্রদ্ধাশীল</span>
          </div>
          <p className="text-xs text-slate-500  max-w-2xl mx-auto leading-relaxed">
            আপনার চেম্বার অনুযায়ী কাস্টম এন্টারপ্রাইজ প্যাকেজ বা প্রশিক্ষণের প্রয়োজন হলে আমাদের সাপোর্ট টিমকে জানাতে পারেন। পেমেন্ট সম্পূর্ণ সুরক্ষিত ও এনক্রিপ্টেড।
          </p>
        </div>
      </div>
    </div>
  );
}
