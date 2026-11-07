"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CaseRecord, DraftDocType } from "@/lib/ai/schemas";
import { StatementInputPanel } from "@/components/workspace/StatementInputPanel";
import { InterrogationPanel } from "@/components/workspace/InterrogationPanel";
import { DocumentEditorPanel } from "@/components/workspace/DocumentEditorPanel";
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  Clock,
  Shield,
  FileText,
  User,
  Scale,
  Bell,
  FileBox,
  LayoutGrid,
  Columns3,
  Maximize2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Printer,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";

function CaseWorkspaceInner() {
  const params = useParams();
  const caseId = (params?.id as string) || "case-karim-miah-001";

  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // View mode: single step wizard focus ("intake" | "interrogation" | "document") or expert "studio"
  const [viewMode, setViewMode] = useState<"studio" | "intake" | "interrogation" | "document">("intake");

  // Fetch initial case record
  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cases/${caseId}`);
      const json = await res.json();
      if (json.ok) {
        setCaseRecord(json.data);
        // Smart wizard step resolution
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const stepParam = urlParams.get("step");
          const modeParam = urlParams.get("mode");
          if (modeParam === "studio") {
            setViewMode("studio");
          } else if (stepParam === "1") {
            setViewMode("intake");
          } else if (stepParam === "2") {
            setViewMode("interrogation");
          } else if (stepParam === "3") {
            setViewMode("document");
          } else if (json.data.documents && json.data.documents.length > 0) {
            setViewMode("document");
          } else {
            setViewMode("intake");
          }
        }
      } else {
        setErrorMsg(json.error?.messageBn || "মামলা লোড ব্যর্থ হয়েছে।");
      }
    } catch {
      setErrorMsg("নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  // Handle re-analyzing or updating statement (Stage 1)
  const handleUpdateStatement = async (statement: string) => {
    try {
      setIsAnalyzing(true);
      const res = await fetch(`/api/cases/${caseId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawStatement: statement,
          answers: {},
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setCaseRecord(json.data);
        // Automatically invite user to Step 2 if in focused intake mode
        if (viewMode === "intake") {
          setViewMode("interrogation");
        }
      } else {
        alert(json.error?.messageBn || "বিশ্লেষণ ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle submitting answers to follow-up questions (Stage 2)
  const handleSubmitAnswers = async (answers: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/cases/${caseId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (json.ok) {
        setCaseRecord(json.data);
        // If completeness is high, suggest viewing ready draft in Step 3
        if (json.data.completenessScore >= 80 && viewMode === "interrogation") {
          setViewMode("document");
        }
      } else {
        alert(json.error?.messageBn || "আপডেট ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle generating court documents (Stage 3)
  const handleGenerateDocument = async (
    docType: DraftDocType,
    fontMode: "unicode" | "bijoy"
  ) => {
    try {
      setIsGenerating(true);
      const res = await fetch(`/api/cases/${caseId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          fontMode,
          courtNameBn: caseRecord?.courtName || undefined,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        await fetchCase();
      } else {
        alert(json.error?.messageBn || "ডকুমেন্ট তৈরি করা যায়নি।");
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-700">
            মামলার ফাইল ও কোর্ট ড্রাফট লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !caseRecord) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="text-center space-y-4 max-w-md p-6 bg-white rounded-3xl shadow-lg border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">
            মামলা লোড করা যায়নি
          </h2>
          <p className="text-xs text-slate-600">{errorMsg}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  const isStep1Valid = (caseRecord?.rawStatement || "").trim().length >= 20;
  const isStep2Valid =
    isStep1Valid &&
    ((caseRecord?.questions?.some((q) => q.isAnswered)) ||
      (caseRecord?.questions?.length === 0));
  const isStep3Valid =
    isStep2Valid &&
    ((caseRecord?.applicableLaws?.length || 0) > 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans antialiased">
      {/* Global Unified Navbar */}
      <AppNavbar />

      {/* Case Header & Sub-Bar */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-20 shadow-xs">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2 truncate">
              <h1 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-xs sm:max-w-md">
                {caseRecord.title}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                  caseRecord.category === "General"
                    ? "bg-slate-100 text-slate-700 border-slate-300"
                    : caseRecord.category === "Civil"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : caseRecord.category === "Criminal"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : caseRecord.category === "Public Interest & Human Rights" || caseRecord.category?.includes("Public Interest")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-purple-50 text-purple-700 border-purple-200"
                }`}
              >
                {caseRecord.category === "General"
                  ? "সাধারণ তথ্যানুসন্ধান"
                  : caseRecord.category === "Criminal"
                  ? "ফৌজদারি"
                  : caseRecord.category === "Civil"
                  ? "দেওয়ানি"
                  : caseRecord.category === "Public Interest & Human Rights" || caseRecord.category?.includes("Public Interest")
                  ? "জনস্বার্থ"
                  : "বিশেষ ট্রাইব্যুনাল"}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  caseRecord.priority === "URGENT"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : caseRecord.priority === "HIGH"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {caseRecord.priority === "URGENT"
                  ? "জরুরি"
                  : caseRecord.priority === "HIGH"
                  ? "উচ্চ অগ্রাধিকার"
                  : "সাধারণ"}
              </span>
            </div>
          </div>

          {/* Right Meta & Studio View Controls */}
          <div className="flex items-center gap-3 text-xs">
            {caseRecord.courtName && (
              <div className="hidden lg:flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                <span className="text-slate-400">আদালত:</span>
                <span className="font-semibold text-slate-800">{caseRecord.courtName}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 font-bold">
              <span>সম্পূর্ণতা:</span>
              <strong>{caseRecord.completenessScore}%</strong>
            </div>
          </div>
        </div>

        {/* Step-by-Step Navigation Bar (ধাপ ১ ➔ ধাপ ২ ➔ ধাপ ৩) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-1.5 border-t border-slate-100 bg-slate-50/60 gap-2">
          {/* 3 Clear Action Steps */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setViewMode("intake")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                viewMode === "intake"
                  ? "bg-indigo-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">১</span>
              <span>মক্কেলের ঘটনা (Intake)</span>
            </button>

            <span className="text-slate-300 font-bold">→</span>

            <button
              type="button"
              onClick={() => isStep1Valid && setViewMode("interrogation")}
              disabled={!isStep1Valid}
              title={!isStep1Valid ? "১ম ধাপে অন্তত ২০ অক্ষরের ঘটনা লিখুন" : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                !isStep1Valid
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : viewMode === "interrogation"
                  ? "bg-indigo-600 text-white shadow-xs font-bold cursor-pointer"
                  : "text-slate-600 hover:bg-slate-200 cursor-pointer"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">২</span>
              <span>আইনি অনুসন্ধান ও জেরা (Questions)</span>
            </button>

            <span className="text-slate-300 font-bold">→</span>

            <button
              type="button"
              onClick={() => isStep2Valid && isStep3Valid && setViewMode("document")}
              disabled={!isStep2Valid || !isStep3Valid}
              title={
                !isStep2Valid
                  ? "২য় ধাপে অন্তত ১টি প্রশ্নের উত্তর দিন"
                  : !isStep3Valid
                  ? "প্রযোজ্য আইন নির্ধারিত হতে হবে"
                  : undefined
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                !isStep2Valid || !isStep3Valid
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : viewMode === "document"
                  ? "bg-indigo-600 text-white shadow-xs font-bold cursor-pointer"
                  : "text-slate-600 hover:bg-slate-200 cursor-pointer"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">৩</span>
              <span>আদালতের আরজি ও প্রিন্ট (Draft)</span>
            </button>

            <span className="text-slate-300 mx-1">|</span>

            <button
              type="button"
              onClick={() => setViewMode("studio")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                viewMode === "studio"
                  ? "bg-slate-800 text-white font-bold"
                  : "text-slate-500 hover:bg-slate-200"
              }`}
              title="এক নজরে ৩টি প্যানেলই একসাথে দেখুন"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>৩-প্যানেল স্টুডিও</span>
            </button>
          </div>

          {/* 1-Click Court Filing Toolbar */}
          <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
            <Link
              href={`/court-essentials?caseNo=${encodeURIComponent(caseRecord.title)}&court=${encodeURIComponent(caseRecord.courtName || "বিজ্ঞ আদালত")}&type=hazira`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition"
              title="এই মামলার আজকের আসামির হাজিরা স্লিপ প্রস্তুত করুন"
            >
              <FileCheck2 className="w-3 h-3" />
              <span>হাজিরা স্লিপ</span>
            </Link>

            <Link
              href={`/court-essentials?caseNo=${encodeURIComponent(caseRecord.title)}&court=${encodeURIComponent(caseRecord.courtName || "বিজ্ঞ আদালত")}&type=time_petition`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition"
              title="এই মামলার শুনানির সময় প্রার্থনার দরখাস্ত প্রস্তুত করুন"
            >
              <Clock className="w-3 h-3" />
              <span>সময় দরখাস্ত</span>
            </Link>

            <Link
              href={`/court-essentials?caseNo=${encodeURIComponent(caseRecord.title)}&court=${encodeURIComponent(caseRecord.courtName || "বিজ্ঞ আদালত")}&type=vakalatnama`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition"
              title="এই মামলার ওকালতনামা প্রস্তুত করুন"
            >
              <Scale className="w-3 h-3" />
              <span>ওকালতনামা</span>
            </Link>

            <Link
              href={`/case/${caseId}/hearings`}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 text-[11px]"
            >
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>শুনানি ({caseRecord.hearings?.length || 0})</span>
            </Link>

            <Link
              href={`/case/${caseId}/evidence`}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 text-[11px]"
            >
              <FileBox className="w-3 h-3 text-slate-500" />
              <span>নথিপত্র ({caseRecord.evidenceFiles?.length || 0})</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3-Step Wizard & Advocate Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-100">
        {/* Step 1: Client Statement & Facts Intake */}
        <section
          className={`h-full overflow-hidden ${
            viewMode === "document" || viewMode === "interrogation"
              ? "hidden"
              : viewMode === "intake"
              ? "md:col-span-12"
              : "md:col-span-3 lg:col-span-3"
          }`}
        >
          <div className={viewMode === "intake" ? "max-w-4xl mx-auto h-full p-2 sm:p-4" : "h-full"}>
            <StatementInputPanel
              key={`stmt-${caseRecord.id}`}
              caseRecord={caseRecord}
              onUpdateStatement={handleUpdateStatement}
              isAnalyzing={isAnalyzing}
              onNextStep={() => setViewMode("interrogation")}
            />
          </div>
        </section>

        {/* Step 2: Legal Interrogation & Applicable Laws */}
        <section
          className={`h-full overflow-hidden ${
            viewMode === "document" || viewMode === "intake"
              ? "hidden"
              : viewMode === "interrogation"
              ? "md:col-span-12"
              : "md:col-span-4 lg:col-span-4"
          }`}
        >
          <div className={viewMode === "interrogation" ? "max-w-4xl mx-auto h-full p-2 sm:p-4" : "h-full"}>
            <InterrogationPanel
              key={`inter-${caseRecord.id}`}
              caseRecord={caseRecord}
              onSubmitAnswers={handleSubmitAnswers}
              isSubmitting={isSubmitting}
              onPrevStep={() => setViewMode("intake")}
              onNextStep={() => setViewMode("document")}
            />
          </div>
        </section>

        {/* Step 3: Court Document Canvas */}
        <section
          className={`h-full overflow-hidden ${
            viewMode === "intake" || viewMode === "interrogation"
              ? "hidden"
              : viewMode === "document"
              ? "md:col-span-12"
              : "md:col-span-5 lg:col-span-5"
          }`}
        >
          <div className={viewMode === "document" ? "max-w-5xl mx-auto h-full p-2 sm:p-4" : "h-full"}>
            <DocumentEditorPanel
              key={`doc-${caseRecord.id}`}
              caseRecord={caseRecord}
              onGenerateDocument={handleGenerateDocument}
              isGenerating={isGenerating}
              onPrevStep={() => setViewMode("interrogation")}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default function CaseWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CaseWorkspaceInner />
    </Suspense>
  );
}
