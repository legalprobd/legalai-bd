"use client";

import React, { useState, useEffect, useRef } from "react";
import { CaseRecord, DraftDocType } from "@/lib/ai/schemas";
import { PlaceholderNavigator } from "@/components/common/PlaceholderNavigator";
import { MandatoryDisclaimer } from "@/components/common/Disclaimer";
import { convertUnicodeToBijoy, convertBijoyToUnicode } from "@/lib/utils/bijoyConverter";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  FileCheck2,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Bot,
  ChevronDown,
  AlertCircle,
  X,
  Scale,
  ShieldCheck,
  CheckCircle2,
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

  // Determine active document
  const docs = caseRecord.documents || [];
  const currentDoc =
    docs.find((d) => d.id === activeTabDocId) ||
    docs.find((d) => d.docType === selectedDocType) ||
    docs[docs.length - 1] ||
    docs[0];

  const initialContent = currentDoc?.contentHtml || "";
  const [localHtml, setLocalHtml] = useState<string>(initialContent);

  // AI Assistant states
  const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [weaknessResult, setWeaknessResult] = useState<{ score: number; weaknesses: string[] } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close AI dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAiDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // TipTap Editor setup
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent || "<p class='text-slate-400'>ডকুমেন্ট তৈরি করুন বা এডিট শুরু করুন...</p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setLocalHtml(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "legal-doc prose prose-slate max-w-none focus:outline-none min-h-[700px] text-slate-900 leading-relaxed font-serif",
      },
    },
  });

  // Sync document content when caseRecord or active tab changes
  useEffect(() => {
    if (docs.length > 0) {
      const activeDoc = docs.find((d) => d.id === activeTabDocId) || docs[docs.length - 1] || docs[0];
      if (activeDoc) {
        setLocalHtml(activeDoc.contentHtml);
        setSelectedDocType(activeDoc.docType);
        setActiveTabDocId(activeDoc.id);
        if (editor && editor.getHTML() !== activeDoc.contentHtml) {
          editor.commands.setContent(activeDoc.contentHtml);
        }
      }
    } else {
      setLocalHtml("");
      setActiveTabDocId(null);
      setSelectedDocType(defaultDocType);
    }
  }, [caseRecord.id, caseRecord.documents, caseRecord.updatedAt, editor]);

  // Handle font mode toggle (Unicode <-> Bijoy)
  const handleToggleFontMode = (mode: "unicode" | "bijoy") => {
    if (mode === fontMode) return;
    setFontMode(mode);
    const converted = mode === "bijoy" ? convertUnicodeToBijoy(localHtml) : convertBijoyToUnicode(localHtml);
    setLocalHtml(converted);
    if (editor) {
      editor.commands.setContent(converted);
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

  // AI Assistant Action: Suggest Legal Phrasing
  const handleAiSuggestPhrasing = async () => {
    if (!editor) return;
    setIsAiDropdownOpen(false);

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!selectedText || selectedText.trim().length === 0) {
      setAiMessage("অনুগ্রহ করে খসড়ার যে অংশটি পরিমার্জন করতে চান তা মাউস দিয়ে নির্বাচন (Highlight) করুন।");
      setTimeout(() => setAiMessage(null), 4000);
      return;
    }

    try {
      setIsAiLoading(true);
      const res = await fetch("/api/drafting/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest_phrasing",
          selectedText,
          caseCategory: caseRecord.category,
        }),
      });

      const data = await res.json();
      if (data.ok && data.suggestion) {
        editor.chain().focus().deleteRange({ from, to }).insertContent(data.suggestion).run();
        setAiMessage("✓ নির্বাচিত অংশটি প্রমিত আইনি ভাষায় সফলভাবে রূপান্তর করা হয়েছে!");
      } else {
        setAiMessage("পরিমার্জন পরামর্শ পাওয়া যায়নি।");
      }
    } catch {
      setAiMessage("এআই সার্ভারে সমস্যা হয়েছে।");
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiMessage(null), 3500);
    }
  };

  // AI Assistant Action: Insert Standard Clause
  const handleAiInsertClause = async (clauseType: "prayer" | "jurisdiction" | "cause_of_action" | "verification" | "limitation") => {
    if (!editor) return;
    setIsAiDropdownOpen(false);

    try {
      setIsAiLoading(true);
      const res = await fetch("/api/drafting/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "insert_clause",
          clauseType,
          caseCategory: caseRecord.category,
        }),
      });

      const data = await res.json();
      if (data.ok && data.html) {
        editor.chain().focus().insertContent(data.html).run();
        setAiMessage(`✓ '${data.title}' সফলভাবে ডকুমেন্টে যোগ করা হয়েছে।`);
      }
    } catch {
      setAiMessage("দফা সন্নিবেশে সমস্যা হয়েছে।");
    } finally {
      setIsAiLoading(false);
      setTimeout(() => setAiMessage(null), 3500);
    }
  };

  // AI Assistant Action: Check Draft Weaknesses
  const handleAiCheckWeaknesses = async () => {
    if (!editor) return;
    setIsAiDropdownOpen(false);

    try {
      setIsAiLoading(true);
      const res = await fetch("/api/drafting/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_weaknesses",
          fullDraft: editor.getHTML(),
          caseCategory: caseRecord.category,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setWeaknessResult({
          score: data.score,
          weaknesses: data.weaknesses || [],
        });
      }
    } catch {
      setAiMessage("খসড়ার দুর্বলতা যাচাইয়ে সমস্যা হয়েছে।");
    } finally {
      setIsAiLoading(false);
    }
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
      window.print();
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
    } catch {
      alert("DOCX ফাইল তৈরিতে সমস্যা হয়েছে।");
    } finally {
      setIsExporting(false);
    }
  };

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
      {/* Top Header */}
      <div className="p-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                ধাপ ৩: স্মার্ট লিগ্যাল ড্রাফট ও এআই এডিটর
              </h3>
              <p className="text-[10px] text-slate-500">
                আদালতে দাখিলের উপযোগী প্রমিত আরজি, পিটিশন ও সত্যপাঠ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPrevStep && (
              <button
                type="button"
                onClick={onPrevStep}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
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
                  if (editor) editor.commands.setContent(d.contentHtml);
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

      {/* TipTap Full Rich Text Toolbar & AI Assistant */}
      <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center flex-wrap gap-1">
          {/* AI Assistant Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsAiDropdownOpen(!isAiDropdownOpen)}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded text-xs font-bold shadow-2xs hover:from-indigo-700 hover:to-indigo-800 transition"
              title="এআই লিগ্যাল ড্রাফটিং অ্যাসিস্ট্যান্ট"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{isAiLoading ? "এআই কাজ করছে..." : "এআই অ্যাসিস্ট্যান্ট"}</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {isAiDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-xs text-slate-800">
                <button
                  type="button"
                  onClick={handleAiSuggestPhrasing}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-bold">Suggest Legal Phrasing</div>
                    <div className="text-[10px] text-slate-500">নির্বাচিত অংশ প্রমিত কোর্ট ভাষায় রূপান্তর</div>
                  </div>
                </button>

                <div className="border-t border-slate-100 my-1"></div>
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Insert Standard Clause (প্রমিত দফা)
                </div>

                <button
                  type="button"
                  onClick={() => handleAiInsertClause("prayer")}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Scale className="w-3 h-3 text-emerald-600" />
                  <span>প্রার্থনা / প্রতিকার দফা (Prayer Clause)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAiInsertClause("jurisdiction")}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Scale className="w-3 h-3 text-blue-600" />
                  <span>আদালতের এখতিয়ার দফা (Jurisdiction)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAiInsertClause("cause_of_action")}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Scale className="w-3 h-3 text-amber-600" />
                  <span>মোকদ্দমার কারণ দফা (Cause of Action)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAiInsertClause("verification")}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2"
                >
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>সত্যপাঠ ও হলফনামা (Verification)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAiInsertClause("limitation")}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2"
                >
                  <Scale className="w-3 h-3 text-slate-600" />
                  <span>তামাদি মেয়াদের বিবৃতি (Limitation)</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>
                <button
                  type="button"
                  onClick={handleAiCheckWeaknesses}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 transition"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-bold text-rose-700">Check Weaknesses</div>
                    <div className="text-[10px] text-slate-500">আইনি উপাদান ও ঘাটতি স্ক্যান করুন</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-300 mx-1"></div>

          {/* Formatting buttons */}
          {editor && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-slate-200 transition ${
                  editor.isActive("bold") ? "bg-slate-200 text-indigo-700" : "text-slate-600"
                }`}
                title="Bold (গাঢ়)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-slate-200 transition ${
                  editor.isActive("italic") ? "bg-slate-200 text-indigo-700" : "text-slate-600"
                }`}
                title="Italic (তির্যক)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-slate-200 transition ${
                  editor.isActive("heading", { level: 2 }) ? "bg-slate-200 text-indigo-700" : "text-slate-600"
                }`}
                title="Heading 2 (বড় শিরোনাম)"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1.5 rounded hover:bg-slate-200 transition ${
                  editor.isActive("heading", { level: 3 }) ? "bg-slate-200 text-indigo-700" : "text-slate-600"
                }`}
                title="Heading 3 (উপ-শিরোনাম)"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-slate-200 transition ${
                  editor.isActive("bulletList") ? "bg-slate-200 text-indigo-700" : "text-slate-600"
                }`}
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-slate-200 transition ${
                  editor.isActive("orderedList") ? "bg-slate-200 text-indigo-700" : "text-slate-600"
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-slate-200 transition ${
                  editor.isActive("blockquote") ? "bg-slate-200 text-indigo-700" : "text-slate-600"
                }`}
                title="Legal Quote / বয়ান"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                title="পূর্বাবস্থায় ফিরুন (Undo)"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                title="সামনে যান (Redo)"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Actions: Copy, Docx, Print */}
        <div className="flex items-center gap-1.5">
          <PlaceholderNavigator content={localHtml} />

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
            <span>{isExportingPdf ? "পিডিএফ প্রস্তুত..." : "প্রিন্ট / PDF"}</span>
          </button>
        </div>
      </div>

      {/* Floating AI Notification Toast */}
      {aiMessage && (
        <div className="bg-indigo-900 text-white text-xs px-4 py-2 flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{aiMessage}</span>
          </div>
          <button type="button" onClick={() => setAiMessage(null)}>
            <X className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
          </button>
        </div>
      )}

      {/* Weakness Scan Result Banner */}
      {weaknessResult && (
        <div className="m-4 bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-amber-900">
                এআই খসড়া অডিট ফলাফল (আইনি গ্রহণযোগ্যতা স্কোর: {weaknessResult.score}%)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWeaknessResult(null)}
              className="text-amber-700 hover:text-amber-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {weaknessResult.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-1.5 text-amber-900">
                <span className="text-amber-600 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rich Court Document Canvas (TipTap Editor & Judicial Sheet) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center">
        <div
          className={`legal-doc-container w-full max-w-3xl bg-white shadow-md border border-slate-300 rounded p-8 min-h-[750px] outline-none text-slate-900 leading-relaxed ${
            fontMode === "bijoy" ? "font-mono" : "font-serif"
          }`}
        >
          {editor ? (
            <EditorContent editor={editor} />
          ) : (
            <div
              className="legal-doc-fallback"
              dangerouslySetInnerHTML={{ __html: localHtml || "<p class='text-slate-400'>ডকুমেন্ট তৈরি করুন বা এডিট শুরু করুন...</p>" }}
            />
          )}
        </div>
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
