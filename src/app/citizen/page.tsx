"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Sparkles,
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Shield,
  ArrowRight,
  User,
  Phone,
  MapPin,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";

export default function CitizenLegalAidPage() {
  const [statement, setStatement] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const presets = [
    {
      title: "বারান্দার সামনে প্রকাশ্যে ধূমপান",
      tag: "পাবলিক নুইসেন্স ও জিডি",
      text: "প্রতিদিন আমার বাসার বারান্দার সামনে প্রকাশ্যে সিগারেট খায় শামীম। আমি বারবার তাকে মানা করার পরও সে এটা করেই যাচ্ছে। এতে পরিবারের বয়োবৃদ্ধ ও শিশুদের মারাত্মক স্বাস্থ্যহানি ঘটছে এবং শান্তি বিনষ্ট হচ্ছে।",
    },
    {
      title: "গভীর রাতে উচ্চশব্দে লাউডস্পিকার",
      tag: "শব্দ দূষণ নিয়ন্ত্রণ",
      text: "পাশের বাসার লোকেরা গভীর রাত ২টা/৩টা পর্যন্ত অত্যন্ত উচ্চশব্দে সাউন্ড বক্সে গান বাজিয়ে আমাদের ঘুম ও শান্তি নষ্ট করে। অনুরোধ করলেও তারা ঔদ্ধত্য প্রকাশ করে।",
    },
    {
      title: "চেক ডিজঅনার ও টাকা আটকে রাখা",
      tag: "এন.আই. অ্যাক্ট ১৩৮",
      text: "ব্যবসায়িক দেনা বাবদ জনৈক ব্যক্তি আমাকে ৫ লক্ষ টাকার ব্যাংক চেক প্রদান করেছিল। ব্যাংকে জমা দিলে পর্যাপ্ত তহবিল না থাকায় চেকটি ডিজঅনার মেমো সহ প্রত্যাখ্যাত হয়।",
    },
    {
      title: "পৈতৃক জমিতে অবৈধ অনুপ্রবেশ ও প্রাচীর ভাঙা",
      tag: "দেওয়ানি স্বত্ব বিরোধ",
      text: "আমাদের পৈতৃক খরিদাসূত্রে ভোগদখলে থাকা জমিতে প্রতিপক্ষ দলবল নিয়ে জোরপূর্বক সীমানা প্রাচীর ভেঙে অনুপ্রবেশ করেছে এবং জমি জবরদখলের হুমকি দিচ্ছে।",
    },
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!statement.trim() || statement.trim().length < 5) {
      alert("অনুগ্রহ করে আপনার ঘটনার বিবরণ অন্তত ৫ অক্ষরে বাংলায় লিখুন।");
      return;
    }

    try {
      setIsAnalyzing(true);
      const res = await fetch("/api/free-legal-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: statement.trim(),
          clientName: clientName.trim() || undefined,
          clientPhone: clientPhone.trim() || undefined,
          clientAddress: clientAddress.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setAnalysisResult(json.data);
        // Scroll to results
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        alert(json.error?.messageBn || "বিশ্লেষণ করা যায়নি। পুনরায় চেষ্টা করুন।");
      }
    } catch {
      alert("সার্ভার সমস্যা। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult?.generatedGdHtml) return;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = analysisResult.generatedGdHtml;
    const textToCopy = tempDiv.innerText || tempDiv.textContent || "";
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !analysisResult?.generatedGdHtml) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${analysisResult.caseTitleBn || "সাধারণ ডায়েরি আবেদন"}</title>
          <style>
            body { font-family: 'SolaimanLipi', 'Nikosh', Arial, sans-serif; padding: 40px; line-height: 1.8; color: #111; }
            h1, h2, h3 { text-align: center; }
            .border { border: 1px solid #ddd; padding: 12px; margin: 15px 0; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${analysisResult.generatedGdHtml}
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col">
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/citizen" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-slate-900 tracking-tight">LegalAI BD</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ফ্রি নাগরিক সেবা
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">সাধারণ নাগরিক ও মক্কেলদের আইনি সহায়তা</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/court-fee"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>কোর্ট ফি হিসাব</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-xs"
            >
              <span>আইনজীবী লগইন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>১০০% বিনামূল্যে প্রাথমিক আইনি রোগনির্ণয় ও থানার জিডি তৈরি</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            আপনার ঘটনাটি নিজের ভাষায় বলুন, <br className="hidden sm:block" />
            <span className="text-indigo-600">এআই দেবে সঠিক আইনি ধারা ও ফ্রি জিডি ড্রাফট</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            কোনো জটিল আইনি ভাষা বা বইয়ের দরকার নেই। আপনার সাথে কী অবিচার ঘটেছে তা বাংলায় লিখুন। সিস্টেম স্বয়ংক্রিয়ভাবে জানিয়ে দেবে কোন আইন প্রযোজ্য এবং এখনই প্রিন্ট করার জন্য থানায় দাখিলের উপযোগী আবেদনপত্র প্রস্তুত করে দেবে।
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1 space-y-8">
        {/* Quick Demo Pre-fill chips */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>সহজে যাচাই করতে যেকোনো একটি নমুনা ঘটনায় ক্লিক করুন:</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStatement(p.text)}
                className="text-left p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/40 transition group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                  {p.tag}
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1.5 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {p.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>ঘটনার বর্ণনা ও সাধারণ তথ্য</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              তারিখ, সময়, ঘটনাস্থল এবং কার দ্বারা কী ক্ষতি হয়েছে তা বাংলায় স্পষ্টভাবে লিখুন।
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                কী ঘটেছে? (আপনার মুখ থেকে শোনা সাধারণ কথায় লিখুন) *
              </label>
              <textarea
                rows={6}
                required
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="যেমন: প্রতিদিন আমার বাসার বারান্দার সামনে প্রকাশ্যে ধূমপান করে শামীম। মানা করলেও সে ঔদ্ধত্য দেখায় এবং গালাগালি করে..."
                className="w-full text-xs p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 text-slate-900 leading-relaxed shadow-xs"
              />
            </div>

            {/* Optional Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>আপনার নাম (ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="যেমন: মো. আব্দুল করিম"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>মোবাইল নম্বর (ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>ঘটনাস্থল / থানা (ঐচ্ছিক)</span>
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="যেমন: মিরপুর, ঢাকা"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAnalyzing || !statement.trim()}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isAnalyzing ? "এআই বিশ্লেষণ করছে..." : "বিনামূল্যে তাৎক্ষণিক বিশ্লেষণ ও জিডি তৈরি করুন"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div id="results-section" className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* 1. Legal Diagnosis Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                    এআই আইনি রোগনির্ণয় (Legal Diagnosis)
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {analysisResult.caseTitleBn}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">তথ্যের সম্পূর্ণতা:</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {analysisResult.completenessScore}%
                  </span>
                </div>
              </div>

              {/* Applicable Laws Pills */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>আপনার ঘটনায় সংশ্লিষ্ট বাংলাদেশ আইন ও ধারা:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.applicableLaws?.map((law: any, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-900">
                          {law.actNameBn} — ধারা {law.section}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          {law.bailableStatusBn || "আইনগত প্রতিকার"}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800">{law.titleBn}</p>
                      <p className="text-[11px] text-slate-500">{law.reasoningBn}</p>
                      {law.punishmentBn && (
                        <p className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 mt-1">
                          আইনগত শাস্তি/প্রতিকার: {law.punishmentBn}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Free Advice */}
              {analysisResult.strategicAdvice && analysisResult.strategicAdvice.length > 0 && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span>আপনার জন্য আইনি পরামর্শ ও করণীয়:</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-indigo-900 leading-relaxed list-disc list-inside">
                    {analysisResult.strategicAdvice.map((adv: string, idx: number) => (
                      <li key={idx}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 2. Ready-to-Print GD Document Canvas */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    থানায় দাখিলের আবেদন প্রস্তুত
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {analysisResult.generatedGdTitle || "সাধারণ ডায়েরি (GD) আবেদনপত্র"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    এই দরখাস্তটি প্রিন্ট করে আপনার স্থানীয় থানায় সরাসরি দাখিল করতে পারবেন।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>{copySuccess ? "কপি হয়েছে!" : "টেক্সট কপি"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট / PDF ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {/* Rendered GD Paper */}
              <div
                className="p-6 sm:p-8 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 leading-relaxed font-serif shadow-inner overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: analysisResult.generatedGdHtml }}
              />
            </div>

            {/* 3. Advocate Connection Callout (When Court Case is Required) */}
            {analysisResult.isCourtCaseRequired && (
              <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 text-amber-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>এই বিরোধে আদালতে মামলা দায়েরের প্রয়োজন হতে পারে</span>
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    এটি থানার সাধারণ জিডি ছাড়াও দেওয়ানি বা ফৌজদারি আদালতের আওতায় পড়ে। আদালতের আরজি ও সমন জারির জন্য একজন অভিজ্ঞ বিজ্ঞ আইনজীবীর ওকালতনামা ও পরামর্শ প্রয়োজন।
                  </p>
                </div>
                <Link
                  href="/login"
                  className="shrink-0 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>চেম্বার আইনজীবীর সাথে যোগাযোগ</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        <p>© 2026 LegalAI BD. সাধারণ নাগরিক ও বিজ্ঞ আইনজীবীদের ডিজিটাল প্ল্যাটফর্ম।</p>
        <p className="text-[10px] text-slate-400 mt-1">
          সতর্কীকরণ: এআই প্রযুক্তি আইনি সচেতনতা ও প্রাথমিক খসড়ায় সহায়তাকারী। যেকোনো আদালতে মামলা পরিচালনার জন্য বিজ্ঞ আইনজীবীর পরামর্শ অপরিহার্য।
        </p>
      </footer>
    </div>
  );
}
