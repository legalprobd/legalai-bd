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
} from "lucide-react";

function CaseWorkspaceInner() {
  const params = useParams();
  const caseId = (params?.id as string) || "case-karim-miah-001";

  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch initial case record
  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cases/${caseId}`);
      const json = await res.json();
      if (json.ok) {
        setCaseRecord(json.data);
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-700">
            মামলার বিস্তারিত ও কোর্ট রেকর্ড লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !caseRecord) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">
            মামলা লোড করা যায়নি
          </h2>
          <p className="text-xs text-slate-600">{errorMsg}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Top Navigation & Case Status Bar */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-20 shadow-2xs">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-indigo-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                LegalAI BD
              </span>
              <span className="text-slate-300">|</span>
              <h1 className="font-bold text-xs md:text-sm text-slate-800 truncate max-w-xs md:max-w-md">
                {caseRecord.title}
              </h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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

          {/* Case Metadata Badges */}
          <div className="hidden lg:flex items-center gap-4 text-xs">
            {caseRecord.courtName && (
              <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <span className="font-medium text-slate-500">আদালত:</span>
                <span className="font-semibold text-slate-800">
                  {caseRecord.courtName}
                </span>
              </div>
            )}

            {caseRecord.nextHearingDate && (
              <div className="flex items-center gap-1.5 text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  পরবর্তী শুনানি:{" "}
                  <strong>
                    {new Date(caseRecord.nextHearingDate).toLocaleDateString("bn-BD")}
                  </strong>
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-emerald-800 font-medium">
              <span>সম্পূর্ণতা:</span>
              <strong>{caseRecord.completenessScore}%</strong>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-4 px-4 text-xs font-medium border-t border-slate-100 pt-1">
          <Link
            href={`/case/${caseId}`}
            className="pb-2 px-1 border-b-2 border-indigo-600 text-indigo-600 font-bold"
          >
            মামলার খসড়া ও ইন্টারোগেশন
          </Link>
          <Link
            href={`/case/${caseId}/hearings`}
            className="pb-2 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            কোর্ট ডায়েরি ও শুনানি ({caseRecord.hearings?.length || 0})
          </Link>
          <Link
            href={`/case/${caseId}/evidence`}
            className="pb-2 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 flex items-center gap-1"
          >
            <FileBox className="w-3.5 h-3.5" />
            প্রমাণপত্র ও এভিডেন্স ভল্ট ({caseRecord.evidenceFiles?.length || 0})
          </Link>
        </div>
      </header>

      {/* 3-Panel Core Advocate Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Left Column (28% ~ md:col-span-3 or 4) */}
        <section className="md:col-span-3 lg:col-span-3 h-full overflow-hidden">
          <StatementInputPanel
            caseRecord={caseRecord}
            onUpdateStatement={handleUpdateStatement}
            isAnalyzing={isAnalyzing}
          />
        </section>

        {/* Center Column (34% ~ md:col-span-4 or 5) */}
        <section className="md:col-span-4 lg:col-span-4 h-full overflow-hidden">
          <InterrogationPanel
            caseRecord={caseRecord}
            onSubmitAnswers={handleSubmitAnswers}
            isSubmitting={isSubmitting}
          />
        </section>

        {/* Right Column (38% ~ md:col-span-5) */}
        <section className="md:col-span-5 lg:col-span-5 h-full overflow-hidden">
          <DocumentEditorPanel
            caseRecord={caseRecord}
            onGenerateDocument={handleGenerateDocument}
            isGenerating={isGenerating}
          />
        </section>
      </main>
    </div>
  );
}

export default function CaseWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CaseWorkspaceInner />
    </Suspense>
  );
}
