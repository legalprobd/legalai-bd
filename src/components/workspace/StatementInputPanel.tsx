"use client";

import React, { useState, useEffect } from "react";
import { CaseRecord, ExtractedFacts } from "@/lib/ai/schemas";
import {
  Mic,
  MicOff,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText,
  Volume2,
  Clock,
  MapPin,
  Users,
  Swords,
  HeartPulse,
  Banknote,
  Eye,
} from "lucide-react";

interface StatementInputPanelProps {
  caseRecord: CaseRecord;
  onUpdateStatement: (statement: string) => Promise<void>;
  isAnalyzing: boolean;
  onNextStep?: () => void;
}

export function StatementInputPanel({
  caseRecord,
  onUpdateStatement,
  isAnalyzing,
  onNextStep,
}: StatementInputPanelProps) {
  const [statement, setStatement] = useState(caseRecord.rawStatement || "");
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [piiRedacted, setPiiRedacted] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Sync state if case changes
  useEffect(() => {
    setStatement(caseRecord.rawStatement || "");
  }, [caseRecord.rawStatement]);

  // Voice recording with Web Speech API (bn-BD)
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleRecording = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট নেই। Chrome বা Edge ব্যবহার করুন।");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.lang = "bn-BD";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + " ";
          }
        }
        if (transcript.trim().length > 0) {
          setStatement((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!statement.trim()) return;
    await onUpdateStatement(statement);
  };

  const facts: ExtractedFacts = caseRecord.extractedFacts || {};

  // Redacted statement display if toggled
  const displayStatement = piiRedacted
    ? statement.replace(/করিম মিয়া/g, "ক*** ম***").replace(/০১৭\d{8}/g, "০১৭********")
    : statement;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              ধাপ ১: মক্কেলের ঘটনা ও বিবরণ
            </h3>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            ধাপ ১ (Intake)
          </span>
        </div>
        <p className="text-xs text-slate-500">
          মক্কেলের মুখ থেকে সাধারণ ভাষায় ঘটনাটি টাইপ করুন বা মুখে বলুন
        </p>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Voice & Redaction Toolbar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isRecording
                ? "bg-red-600 text-white animate-pulse shadow-md"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>রেকর্ডিং হচ্ছে (bn-BD)...</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>বাংলা ভয়েস ইনপুট</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPiiRedacted(!piiRedacted)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-colors ${
              piiRedacted
                ? "bg-amber-100 text-amber-800 font-bold border border-amber-300"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="গোপনীয়তার স্বার্থে নাম ও ফোন নম্বর মাস্ক করুন"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{piiRedacted ? "PII সুরক্ষিত" : "PII মাস্কিং"}</span>
          </button>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={displayStatement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="উদাহরণ: গতকাল রাতে পাশের বাড়ির করিম মিয়া তার লোকজন নিয়ে আমাদের বাসায় ঢুকে ভাঙচুর করেছে এবং আমার ভাইকে মেরে মাথা ফাটিয়ে দিয়েছে..."
            className="w-full h-44 p-3 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-sans leading-relaxed bg-slate-50/30"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">
              {statement.length} অক্ষর
            </span>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !statement.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
          <span>
            {isAnalyzing
              ? "আইনি উপাদান ও ধারা বিশ্লেষণ হচ্ছে..."
              : "ঘটনাটি বিশ্লেষণ করুন ও ২য় ধাপে যান →"}
          </span>
        </button>

        {/* Drag-Drop / OCR Mock Box */}
        <div className="p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50/50 flex flex-col items-center justify-center text-center">
          <Upload className="w-4 h-4 text-slate-400 mb-1" />
          <p className="text-[11px] font-medium text-slate-700">
            ইনজুরি রিপোর্ট / নালিশি নথি ড্রপ করুন (OCR)
          </p>
          <button
            type="button"
            onClick={() => {
              setUploadStatus("মেডিকেল সার্টিফিকেট OCR সম্পন্ন: ৩টি সেলাই, ভোঁতা অস্ত্রের জখম সনাক্ত হয়েছে।");
            }}
            className="text-[10px] text-indigo-600 hover:underline mt-1 font-semibold"
          >
            নমুনা ইনজুরি রিপোর্ট লোড করুন
          </button>
          {uploadStatus && (
            <p className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 mt-2 rounded border border-emerald-200">
              {uploadStatus}
            </p>
          )}
        </div>

        {/* Extracted Fact Sheet Card */}
        <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/60 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>শনাক্তকৃত ফ্যাক্টস শীট (Extracted Fact-Sheet)</span>
            </h4>
            <span className="text-[10px] text-slate-500">স্বয়ংক্রিয় ম্যাপিং</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Date & Time */}
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                তারিখ ও সময়:
              </span>
              <span className="font-medium text-right max-w-[150px] truncate">
                {facts.incidentDate ? (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                    {facts.incidentDate}
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                    অনুল্লিখিত
                  </span>
                )}
              </span>
            </div>

            {/* Place */}
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                ঘটনাস্থল:
              </span>
              <span className="font-medium text-right max-w-[150px] truncate">
                {facts.incidentPlace ? (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                    {facts.incidentPlace}
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                    অনুল্লিখিত
                  </span>
                )}
              </span>
            </div>

            {/* Accused */}
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                আসামি সনাক্ত:
              </span>
              <span className="font-medium text-right max-w-[150px] truncate">
                {facts.accusedList && facts.accusedList.length > 0 ? (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                    {facts.accusedList.length} জন চিহ্নিত
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                    নাম নেই
                  </span>
                )}
              </span>
            </div>

            {/* Weapons */}
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-slate-400" />
                ব্যবহৃত অস্ত্র:
              </span>
              <span className="font-medium text-right max-w-[150px] truncate">
                {facts.weaponsUsed && facts.weaponsUsed.length > 0 ? (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                    {facts.weaponsUsed.join(", ")}
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                    অজ্ঞাত
                  </span>
                )}
              </span>
            </div>

            {/* Injuries */}
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-slate-400" />
                আঘাত ও চিকিৎসা:
              </span>
              <span className="font-medium text-right max-w-[150px] truncate">
                {facts.injuriesAndMedical ? (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                    {facts.injuriesAndMedical}
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                    রেকর্ড নেই
                  </span>
                )}
              </span>
            </div>

            {/* Stolen / Damage */}
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-slate-400" />
                ক্ষতি / লুণ্ঠন:
              </span>
              <span className="font-medium text-right max-w-[150px] truncate">
                {facts.totalFinancialLoss || facts.stolenOrDamagedItems ? (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                    {facts.totalFinancialLoss || "ভাঙচুর"}
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                    মূল্যায়ন বাকি
                  </span>
                )}
              </span>
            </div>

            {/* Witnesses */}
            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                সাক্ষী তালিকা:
              </span>
              <span className="font-medium text-right max-w-[150px] truncate">
                {facts.witnesses && facts.witnesses.length > 0 ? (
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                    {facts.witnesses.length} জন উপস্থিত
                  </span>
                ) : (
                  <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                    নাম নেই
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Step 1 Bottom Action */}
        {onNextStep && (
          <div className="pt-2 pb-4">
            <button
              type="button"
              onClick={onNextStep}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
            >
              <span>২য় ধাপে যান (আইনি মূল্যায়ন ও জেরা) →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
