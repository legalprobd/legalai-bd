"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CaseRecord } from "@/lib/ai/schemas";
import { EvidenceVault } from "@/components/workspace/EvidenceVault";
import { ArrowLeft, Scale, Calendar, FileBox, RefreshCw } from "lucide-react";

function CaseEvidencePageInner() {
  const params = useParams();
  const caseId = (params?.id as string) || "";

  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cases/${caseId}`);
      const json = await res.json();
      if (json.ok) {
        setCaseRecord(json.data);
      } else {
        setErrorMsg(json.error?.messageBn || "মামলা পাওয়া যায়নি।");
      }
    } catch {
      setErrorMsg("নেটওয়ার্ক ত্রুটি। পুনরায় চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">মামলা ও প্রমাণপত্রের তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !caseRecord) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-6 bg-white rounded-xl border border-red-200">
          <p className="text-sm text-red-600 font-bold mb-3">{errorMsg || "মামলা পাওয়া যায়নি"}</p>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            ড্যাশবোর্ডে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                title="ড্যাশবোর্ডে ফিরে যান"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span className="font-extrabold text-slate-900 text-sm">LegalAI BD</span>
                <span className="text-slate-300">|</span>
                <h1 className="text-xs font-bold text-slate-800 truncate max-w-md">
                  {caseRecord.title}
                </h1>
                {caseRecord.caseNumber && (
                  <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    {caseRecord.caseNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-medium">{caseRecord.courtName || "বিজ্ঞ আদালত"}</span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-4 -mb-px text-xs font-medium border-t border-slate-100 pt-1">
            <Link
              href={`/case/${caseId}`}
              className="pb-2.5 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            >
              মামলার খসড়া ও ইন্টারোগেশন
            </Link>
            <Link
              href={`/case/${caseId}/hearings`}
              className="pb-2.5 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              কোর্ট ডায়েরি ও শুনানি ({caseRecord.hearings?.length || 0})
            </Link>
            <Link
              href={`/case/${caseId}/evidence`}
              className="pb-2.5 px-1 border-b-2 border-indigo-600 text-indigo-600 font-bold flex items-center gap-1.5"
            >
              <FileBox className="w-3.5 h-3.5" />
              প্রমাণপত্র ও এভিডেন্স ভল্ট ({caseRecord.evidenceFiles?.length || 0})
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <EvidenceVault
          caseId={caseId}
          initialEvidence={caseRecord.evidenceFiles || []}
          onEvidenceChange={fetchCase}
        />
      </main>
    </div>
  );
}

export default function CaseEvidencePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">লোড হচ্ছে...</div>}>
      <CaseEvidencePageInner />
    </Suspense>
  );
}
