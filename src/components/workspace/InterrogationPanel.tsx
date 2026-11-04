"use client";

import React, { useState } from "react";
import { CaseRecord, ApplicableLaw } from "@/lib/ai/schemas";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import {
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CheckSquare,
  Square,
  ShieldAlert,
} from "lucide-react";
import { LimitationCard } from "./LimitationCard";

interface InterrogationPanelProps {
  caseRecord: CaseRecord;
  onSubmitAnswers: (answers: Record<string, string>) => Promise<void>;
  isSubmitting: boolean;
}

export function InterrogationPanel({
  caseRecord,
  onSubmitAnswers,
  isSubmitting,
}: InterrogationPanelProps) {
  // Local state for pending answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expandedLaws, setExpandedLaws] = useState<Record<string, boolean>>({
    "0": true,
    "1": true,
  });
  const [checkedEvidence, setCheckedEvidence] = useState<Record<string, boolean>>({
    "ev-0": true,
  });

  const handleSelectOption = (fieldKey: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleToggleMultiOption = (fieldKey: string, value: string) => {
    setAnswers((prev) => {
      const current = prev[fieldKey] ? prev[fieldKey].split(", ") : [];
      let updated: string[];
      if (current.includes(value)) {
        updated = current.filter((item) => item !== value);
      } else {
        updated = [...current, value];
      }
      return {
        ...prev,
        [fieldKey]: updated.join(", "),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitAnswers(answers);
  };

  const toggleLawExpand = (idx: string) => {
    setExpandedLaws((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleEvidence = (id: string) => {
    setCheckedEvidence((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const questions = caseRecord.questions || [];
  const pendingQuestions = questions.filter((q) => !q.isAnswered);
  const laws = caseRecord.applicableLaws || [];
  const score = caseRecord.completenessScore || 0;

  // Evidence Checklist Items based on laws
  const evidenceChecklist = [
    { id: "ev-0", label: "সরকারি হাসপাতালের জখমি সনদ (Medical Injury Certificate)" },
    { id: "ev-1", label: "ভাঙচুরকৃত আসবাবপত্র ও আঘাতের স্পষ্ট ছবি/ভিডিও" },
    { id: "ev-2", label: "বাদী ও সাক্ষীদের জাতীয় পরিচয়পত্রের (NID) কপি" },
    { id: "ev-3", label: "লুণ্ঠিত স্বর্ণালংকার ক্রয়ের ভাউচার/মেমো (যদি থাকে)" },
    { id: "ev-4", label: "ঘটনাস্থলের ৩ জন চাক্ষুষ প্রত্যক্ষদর্শীর পূর্ণাঙ্গ নাম-ঠিকানা" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 border-r border-slate-200 overflow-y-auto">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              AI লিগ্যাল ইন্টারোগেশন ও ধারা মূল্যায়ন
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            ধাপ ২ (Interrogation)
          </span>
        </div>

        {/* Case Completeness Meter */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span>মামলার সম্পূর্ণতা স্কোর (Completeness):</span>
            </span>
            <span
              className={`font-extrabold ${
                score >= 90
                  ? "text-emerald-700"
                  : score >= 60
                  ? "text-indigo-700"
                  : "text-amber-700"
              }`}
            >
              {score}% {score >= 90 ? "— ড্রাফটের জন্য প্রস্তুত" : "— তথ্যের ঘাটতি আছে"}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                score >= 90
                  ? "bg-emerald-600"
                  : score >= 60
                  ? "bg-indigo-600"
                  : "bg-amber-500"
              }`}
              style={{ width: `${Math.max(5, score)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            * অপরাধের উপাদান (Ingredients of Offence) ও সেকশন রুলসের ভিত্তিতে গণনাকৃত।
          </p>
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Limitation Calculator Card */}
        <LimitationCard
          caseId={caseRecord.id}
          initialCaseType={caseRecord.limitationCaseType}
          initialTriggerDate={caseRecord.limitationTriggerDate}
        />

        {/* Contradiction Warnings Card */}
        {caseRecord.contradictionsDetected &&
          caseRecord.contradictionsDetected.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-900 text-xs shadow-xs">
              <div className="flex items-center gap-2 font-bold mb-1">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>বয়ান ও তথ্যের বৈপরীত্য সনাক্ত (Contradiction Alert):</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {caseRecord.contradictionsDetected.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

        {/* Dynamic Follow-Up Questions Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>প্রয়োজনীয় প্রশ্নাবলি (Missing Fact-Finder)</span>
            </h4>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
              {pendingQuestions.length}টি প্রশ্ন বাকি
            </span>
          </div>

          {pendingQuestions.length === 0 ? (
            <div className="p-4 text-center bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
              <p className="font-bold">সমস্ত প্রয়োজনীয় তথ্য সংগৃহীত হয়েছে!</p>
              <p className="text-[11px] mt-0.5">
                {caseRecord.category === "Civil"
                  ? "ডান পাশের প্যানেলে দেওয়ানি আরজি ও নিষেধাজ্ঞার খসড়া প্রস্তুত রয়েছে।"
                  : caseRecord.category === "Special_Tribunal"
                  ? "ডান পাশের প্যানেলে বিশেষ ট্রাইব্যুনাল / সি.আর. নালিশি আরজি প্রস্তুত রয়েছে।"
                  : "ডান পাশের প্যানেলে থানার এজাহার ও আদালতের খসড়া প্রস্তুত রয়েছে।"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {pendingQuestions.map((q, idx) => {
                const currentVal = answers[q.fieldKey] || "";
                return (
                  <div
                    key={q.id || idx}
                    className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2.5"
                  >
                    {/* Bengali Question */}
                    <p className="font-bold text-xs text-slate-900">
                      {idx + 1}। {q.questionBn}
                    </p>

                    {/* Legal Importance Badge */}
                    <div className="flex items-start gap-1.5 text-[11px] text-indigo-900 bg-indigo-50/80 p-2 rounded border border-indigo-100">
                      <AlertTriangle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        <strong>কেন জরুরি:</strong> {q.legalImportanceBn}
                      </span>
                    </div>

                    {/* Input controls based on type */}
                    {q.inputType === "select" && (
                      <div className="space-y-1.5 pt-1">
                        {q.optionsBn.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer border transition-colors ${
                              currentVal === opt
                                ? "bg-indigo-50 border-indigo-400 font-medium text-indigo-900"
                                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.fieldKey}
                              value={opt}
                              checked={currentVal === opt}
                              onChange={() => handleSelectOption(q.fieldKey, opt)}
                              className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.inputType === "multiselect" && (
                      <div className="space-y-1.5 pt-1">
                        {q.optionsBn.map((opt, oIdx) => {
                          const selected = currentVal
                            .split(", ")
                            .includes(opt);
                          return (
                            <label
                              key={oIdx}
                              className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer border transition-colors ${
                                selected
                                  ? "bg-indigo-50 border-indigo-400 font-medium text-indigo-900"
                                  : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  handleToggleMultiOption(q.fieldKey, opt)
                                }
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {q.inputType === "text" && (
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) =>
                          handleSelectOption(q.fieldKey, e.target.value)
                        }
                        placeholder="এখানে সুনির্দিষ্ট তথ্য লিখুন..."
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? "আইন ও সম্পূর্ণতা রি-ক্যালকুলেট হচ্ছে..."
                    : "উত্তরগুলো সাবমিট ও আপডেট করুন (Submit Answers)"}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Applicable Bangladesh Laws Accordion */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>প্রযোজ্য বাংলাদেশ আইন ও ধারা সমূহ (Applicable Laws)</span>
            </h4>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {laws.length}টি ধারা সংযুক্ত
            </span>
          </div>

          <div className="space-y-2.5">
            {laws.map((law, idx) => {
              const isExpanded = expandedLaws[idx.toString()];
              const isNonBailable =
                law.bailableStatusBn.includes("জামিন-অযোগ্য") ||
                law.bailableStatusBn.includes("Non-Bailable");

              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50"
                >
                  <div
                    onClick={() => toggleLawExpand(idx.toString())}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 bg-white border px-2 py-0.5 rounded shadow-2xs">
                        ধারা {law.section}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {law.titleBn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isNonBailable
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {law.bailableStatusBn}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-white border-t border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">আইন:</span>
                        <span className="font-semibold text-slate-800">
                          {law.actNameBn}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">
                          সর্বোচ্চ শাস্তি:
                        </span>
                        <span className="font-bold text-red-700">
                          {law.punishmentBn}
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="text-slate-500 font-medium block mb-1">
                          প্রযোজ্যতার কারণ ও নির্ভরতা:
                        </span>
                        <p className="p-2 bg-slate-50 rounded border text-slate-700 leading-relaxed text-[11px]">
                          {law.reasoningBn}
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                        <span className="text-slate-400 text-[10px]">
                          কনফিডেন্স স্কোর:
                        </span>
                        <ConfidenceBadge level={law.confidence || "HIGH"} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Advocate Evidence Checklist */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b pb-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-amber-600" />
              <span>অ্যাডভোকেট প্রমাণ সংগ্রহ চেকলিস্ট</span>
            </h4>
            <span className="text-[10px] text-slate-400">ট্রায়াল প্রস্তুতি</span>
          </div>

          <div className="space-y-2 text-xs">
            {evidenceChecklist.map((item) => {
              const isChecked = checkedEvidence[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleEvidence(item.id)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span
                    className={
                      isChecked
                        ? "line-through text-slate-400"
                        : "text-slate-700"
                    }
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
