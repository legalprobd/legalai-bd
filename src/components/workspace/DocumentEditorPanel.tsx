"use client";

import React, { useState } from "react";
import { CaseRecord, DraftDocType, GeneratedDocItem } from "@/lib/ai/schemas";
import { PlaceholderNavigator } from "@/components/common/PlaceholderNavigator";
import { MandatoryDisclaimer } from "@/components/common/Disclaimer";
import { convertUnicodeToBijoy, convertBijoyToUnicode } from "@/lib/utils/bijoyConverter";
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  Share2,
  FileCheck2,
  ShieldCheck,
  Type,
  Layers,
  ChevronDown,
} from "lucide-react";

interface DocumentEditorPanelProps {
  caseRecord: CaseRecord;
  onGenerateDocument: (docType: DraftDocType, fontMode: "unicode" | "bijoy") => Promise<void>;
  isGenerating: boolean;
  onPrevStep?: () => void;
}

export function DocumentEditorPanel({
  caseRecord,
  onGenerateDocument,
  isGenerating,
  onPrevStep,
}: DocumentEditorPanelProps) {
  const defaultDocType: DraftDocType =
    caseRecord.category === "Civil"
      ? "PLAINT"
      : caseRecord.category === "Special_Tribunal"
      ? "CR_PETITION"
      : "FIR";

  const [selectedDocType, setSelectedDocType] = useState<DraftDocType>(defaultDocType);
  const [activeTabDocId, setActiveTabDocId] = useState<string | null>(null);
  const [fontMode, setFontMode] = useState<"unicode" | "bijoy">("unicode");
  const [copied, setCopied] = useState(false);
  const [isAdvocateApproved, setIsAdvocateApproved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [localHtml, setLocalHtml] = useState<string>("");

  // Determine active document
  const docs = caseRecord.documents || [];
  const currentDoc =
    docs.find((d) => d.id === activeTabDocId) ||
    docs.find((d) => d.docType === selectedDocType) ||
    docs[docs.length - 1] ||
    docs[0];

  React.useEffect(() => {
    if (docs.length > 0) {
      const activeDoc = docs.find((d) => d.id === activeTabDocId) || docs[docs.length - 1] || docs[0];
      if (activeDoc) {
        setLocalHtml(activeDoc.contentHtml);
        setSelectedDocType(activeDoc.docType);
        setActiveTabDocId(activeDoc.id);
      }
    } else {
      setLocalHtml("");
      setActiveTabDocId(null);
      setSelectedDocType(defaultDocType);
    }
  }, [caseRecord.id, caseRecord.documents, caseRecord.updatedAt]);

  // Handle font mode toggle (Unicode <-> Bijoy)
  const handleToggleFontMode = (mode: "unicode" | "bijoy") => {
    if (mode === fontMode) return;
    setFontMode(mode);
    if (mode === "bijoy") {
      setLocalHtml(convertUnicodeToBijoy(localHtml));
    } else {
      setLocalHtml(convertBijoyToUnicode(localHtml));
    }
  };

  const handleCopy = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = localHtml;
    const text = tempDiv.innerText || tempDiv.textContent || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    handleDownloadPdf();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: localHtml,
          titleBn: currentDoc?.titleBn || "Court_Document",
        }),
      });

      if (!res.ok) throw new Error("PDF Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentDoc?.titleBn || "Court_Document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // Fallback to browser print if needed
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${currentDoc?.titleBn || "Court Document"}</title>
              <style>
                @page { size: legal; margin: 1in; }
                body { font-family: 'Noto Serif Bengali', serif, 'Nikosh', 'SolaimanLipi'; line-height: 1.6; }
                .legal-doc { padding: 20px; }
              </style>
            </head>
            <body>${localHtml}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExporting(true);
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: localHtml,
          titleBn: currentDoc?.titleBn || "Court_Document",
          fontMode,
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentDoc?.docType || "Case"}_Document.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("DOCX ফাইল তৈরিতে সমস্যা হয়েছে।");
    } finally {
      setIsExporting(false);
    }
  };

  // 34 Available Doc Types list categorized
  const docTypeOptions: { group: string; items: { id: DraftDocType; label: string }[] }[] = [
    {
      group: "থানা ও ম্যাজিস্ট্রেট আদালত (Criminal)",
      items: [
        { id: "FIR", label: "থানার এজাহার (FIR)" },
        { id: "GD", label: "সাধারণ ডায়েরি (GD)" },
        { id: "CR_PETITION", label: "সি.আর. মামলার আরজি (CR Petition)" },
        { id: "BAIL_PETITION", label: "জামিনের আবেদন (Bail Petition)" },
        { id: "ANTICIPATORY_BAIL", label: "আগাম জামিনের আবেদন (Anticipatory Bail)" },
        { id: "NARAJI", label: "নারাজি পিটিশন (Naraji Petition)" },
        { id: "TIME_PETITION", label: "সময়ের আবেদন (Time Petition)" },
        { id: "CROSS_EXAM_QUESTIONS", label: "জেরার প্রশ্নাবলি (Cross-Exam Guide)" },
      ],
    },
    {
      group: "দেওয়ানি আদালত (Civil Court)",
      items: [
        { id: "PLAINT", label: "দেওয়ানি আরজি (Plaint)" },
        { id: "WRITTEN_STATEMENT", label: "লিখিত জবাব (Written Statement)" },
        { id: "INJUNCTION_TEMP", label: "অস্থায়ী নিষেধাজ্ঞা (Temp Injunction)" },
        { id: "INJUNCTION_PERMANENT", label: "চিরস্থায়ী নিষেধাজ্ঞা (Perpetual Injunction)" },
        { id: "AFFIDAVIT", label: "হলফনামা (Affidavit)" },
        { id: "VAKALATNAMA", label: "ওকালতনামা (Vakalatnama)" },
      ],
    },
    {
      group: "পারিবারিক ও বিশেষ ট্রাইব্যুনাল (Family & Special)",
      items: [
        { id: "DIVORCE_PLAINT", label: "তালাক / বিবাহবিচ্ছেদ মোকদ্দমা" },
        { id: "DOWER_RECOVERY", label: "মোহরানা আদায়ের আরজি" },
        { id: "MAINTENANCE", label: "খোরপোশ ও ভরণপোষণ দাবি" },
        { id: "ARTHA_RIN_PLAINT", label: "অর্থ ঋণ মামলার আরজি" },
        { id: "CYBER_COMPLAINT", label: "সাইবার অপরাধের নালিশ" },
      ],
    },
    {
      group: "সহায়ক আইনি নথি (Supporting Docs)",
      items: [
        { id: "LEGAL_NOTICE", label: "লিগ্যাল নোটিশ (Legal Notice)" },
        { id: "DAMAGE_INVENTORY", label: "ক্ষয়ক্ষতি ও লুণ্ঠিত মালামালের তফসিল" },
        { id: "WITNESS_LIST", label: "সাক্ষীদের নামের ফর্দ" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Panel Top Header & Toolbar */}
      <div className="p-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                ধাপ ৩: আদালতে দাখিলের উপযোগী আরজি ও খসড়া
              </h3>
              <p className="text-[10px] text-slate-500">প্রস্তুতকৃত আইনি ড্রাফট পড়ুন, এডিট করুন বা প্রিন্ট নিন</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPrevStep && (
              <button
                type="button"
                onClick={onPrevStep}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                title="২য় ধাপের প্রশ্নাবলীতে ফিরে যান"
              >
                <span>← ২য় ধাপ</span>
              </button>
            )}

            {/* Font Mode Live Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleToggleFontMode("unicode")}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  fontMode === "unicode"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ইউনিকোড (Nikosh)
              </button>
              <button
                type="button"
                onClick={() => handleToggleFontMode("bijoy")}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  fontMode === "bijoy"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                বিজয় (SutonnyMJ)
              </button>
            </div>
          </div>
        </div>

        {/* Document Selector & Generator Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DraftDocType)}
              className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-indigo-500 pr-8"
            >
              {docTypeOptions.map((grp, gIdx) => (
                <optgroup key={gIdx} label={grp.group}>
                  {grp.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onGenerateDocument(selectedDocType, fontMode)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isGenerating ? "খসড়া তৈরি হচ্ছে..." : "নতুন খসড়া তৈরি করুন"}
            </span>
          </button>
        </div>

        {/* Existing Document Tabs */}
        {docs.length > 0 && (
          <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1">
            {docs.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActiveTabDocId(d.id);
                  setLocalHtml(d.contentHtml);
                }}
                className={`px-3 py-1 rounded text-xs whitespace-nowrap font-medium transition-colors ${
                  (activeTabDocId === d.id || (!activeTabDocId && currentDoc?.id === d.id))
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {d.titleBn}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor Sub-toolbar: Placeholder Navigator & Action Buttons */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <PlaceholderNavigator content={localHtml} />

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium shadow-2xs"
            title="ক্লিপবোর্ডে কপি করুন"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>কপি</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExporting}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium shadow-2xs"
            title="Microsoft Word (.docx) ফাইল ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Word (.docx)</span>
          </button>

          <button
            type="button"
            data-testid="download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-medium shadow-2xs disabled:opacity-50"
            title="সার্ভার-সাইড A4 পিডিএফ ডাউনলোড করুন"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>{isExportingPdf ? "পিডিএফ প্রস্তুত হচ্ছে..." : "প্রিন্ট / PDF"}</span>
          </button>
        </div>
      </div>

      {/* Rich Court Document Canvas (Styled like A4 / Legal Judicial Paper) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center">
        <div
          className={`w-full max-w-3xl bg-white shadow-md border border-slate-300 rounded p-8 min-h-[750px] outline-none text-slate-900 leading-relaxed ${
            fontMode === "bijoy" ? "font-mono" : "font-serif"
          }`}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setLocalHtml(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: localHtml || "<p class='text-gray-400'>ডকুমেন্ট জেনারেট করুন...</p>" }}
        />
      </div>

      {/* Export & Advocate Approval Verification Bar */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
            <input
              type="checkbox"
              checked={isAdvocateApproved}
              onChange={(e) => setIsAdvocateApproved(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="font-semibold text-slate-800">
              আমি বিজ্ঞ অ্যাডভোকেট হিসেবে খসড়াটি পুনঃপরীক্ষা ও যাচাই করেছি
            </span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!isAdvocateApproved || isExportingPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{isExportingPdf ? "পিডিএফ তৈরি হচ্ছে..." : "আদালতে দাখিলের জন্য পিডিএফ/প্রিন্ট"}</span>
            </button>
          </div>
        </div>

        <div className="mt-2">
          <MandatoryDisclaimer compact />
        </div>
      </div>
    </div>
  );
}
