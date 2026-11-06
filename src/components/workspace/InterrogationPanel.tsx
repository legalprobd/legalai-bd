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
  onPrevStep?: () => void;
  onNextStep?: () => void;
}

export function InterrogationPanel({
  caseRecord,
  onSubmitAnswers,
  isSubmitting,
  onPrevStep,
  onNextStep,
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

  const isSmokingNuisance =
    (caseRecord.title && (caseRecord.title.includes("ধূমপান") || caseRecord.title.includes("ধুমপান") || caseRecord.title.includes("সিগারেট") || caseRecord.title.includes("উপদ্রব"))) ||
    (caseRecord.rawStatement && (caseRecord.rawStatement.includes("ধূমপান") || caseRecord.rawStatement.includes("ধুমপান") || caseRecord.rawStatement.includes("সিগারেট") || caseRecord.rawStatement.includes("তামাক"))) ||
    laws.some(l => l.section.includes("tobacco") || l.section.includes("২৯০") || l.section.includes("290"));

  const isHumanitarianRescue =
    (caseRecord.title && (caseRecord.title.includes("উদ্ধার") || caseRecord.title.includes("অজ্ঞান") || caseRecord.title.includes("বৃদ্ধ") || caseRecord.title.includes("মানবিক") || caseRecord.title.includes("মুমূর্ষু"))) ||
    (caseRecord.rawStatement && (caseRecord.rawStatement.includes("অজ্ঞান") || caseRecord.rawStatement.includes("বৃদ্ধ") || caseRecord.rawStatement.includes("পড়ে আছে") || caseRecord.rawStatement.includes("উদ্ধার"))) ||
    laws.some(l => l.section?.includes("৪৪") || l.section?.includes("police") || l.section?.includes("destitute"));

  const isChequeCase =
    laws.some(l => l.section.includes("138") || l.titleBn?.includes("চেক"));

  const isCivilLand =
    !isSmokingNuisance &&
    !isHumanitarianRescue &&
    (caseRecord.category === "Civil" ||
    laws.some(l => l.section.includes("৪২") || l.section.includes("৫৪") || l.section.includes("cpc")));

  // Dynamic Evidence Checklist Items
  const evidenceChecklist = isHumanitarianRescue
    ? [
        { id: "ev-0", label: "বিপন্ন ব্যক্তির বর্তমান অবস্থানের স্পষ্ট ছবি ও ভিডিও ফুটেজ" },
        { id: "ev-1", label: "স্থানীয় পথচারী বা প্রত্যক্ষদর্শী সাক্ষীদের নাম ও মোবাইল নম্বর" },
        { id: "ev-2", label: "জাতীয় জরুরি সেবা ৯৯৯ বা নিকটস্থ থানায় অবহিতকরণের কল রেকর্ড/মেসেজ" },
        { id: "ev-3", label: "সরকারি হাসপাতালে প্রাথমিক ভর্তির টিকিট বা ছাড়পত্র (যদি থাকে)" },
      ]
    : isSmokingNuisance
    ? [
        { id: "ev-0", label: "প্রকাশ্যে ধূমপান ও উপদ্রবের স্পষ্ট ছবি বা ভিডিও ফুটেজ (যদি থাকে)" },
        { id: "ev-1", label: "বাদী ও ভুক্তভোগী পরিবারের জাতীয় পরিচয়পত্রের (NID) কপি" },
        { id: "ev-2", label: "প্রত্যক্ষদর্শী প্রতিবেশী সাক্ষীদের নাম ও মোবাইল নম্বর তালিকা" },
        { id: "ev-3", label: "বাড়িওয়ালা বা ভবন পরিচালনা কমিটির নিকট ইতিপূর্বে প্রদত্ত অভিযোগের প্রমাণ" },
      ]
    : isChequeCase
    ? [
        { id: "ev-0", label: "মূল ব্যাংক চেক ও চেকের উভয় পিঠের স্পষ্ট রঙিন কপি" },
        { id: "ev-1", label: "ব্যাংক কর্তৃক প্রদত্ত সিল ও তারিখযুক্ত চেক ডিজঅনার মেমো স্লিপ" },
        { id: "ev-2", label: "ডাকযোগে প্রেরিত লিগ্যাল নোটিশের কপি ও রেজিস্ট্রি রসিদ (A/D Card)" },
        { id: "ev-3", label: "লেনদেন বা দেনা-পাওনা সংক্রান্ত চুক্তিপত্র বা ইনভয়েস" },
      ]
    : isCivilLand
    ? [
        { id: "ev-0", label: "মূল রেজিস্ট্রি কবলা দলিল ও বায়া দলিলসমূহ" },
        { id: "ev-1", label: "সিএস, এসএ, আরএস/বিএস খতিয়ান ও নামজারি পরচা (DCR)" },
        { id: "ev-2", label: "হাল সনের ভূমি উন্নয়ন কর (খাজনা) পরিশোধের দাখিলা" },
        { id: "ev-3", label: "নালিশি সম্পত্তির চৌহদ্দি ও সীমানা পরিমাপের স্কেচ ম্যাপ" },
      ]
    : [
        { id: "ev-0", label: "সরকারি হাসপাতালের জখমি সনদ (Medical Injury Certificate - যদি থাকে)" },
        { id: "ev-1", label: "ঘটনাস্থল ও শারীরিক আঘাতের স্পষ্ট ছবি/ভিডিও" },
        { id: "ev-2", label: "বাদী ও সাক্ষীদের জাতীয় পরিচয়পত্রের (NID) কপি" },
        { id: "ev-3", label: "ঘটনাস্থলের চাক্ষুষ প্রত্যক্ষদর্শীদের পূর্ণাঙ্গ নাম-ঠিকানা" },
      ];

  // Adaptive 3-Tier Missing Facts Checklist
  const tierConfig = isHumanitarianRescue
    ? {
        tier1: {
          title: "টায়ার ১: বিপন্ন ব্যক্তির অবস্থান ও এখতিয়ার",
          item1: { label: "সুনির্দিষ্ট অবস্থান ও সংশ্লিষ্ট থানা এখতিয়ার", done: !!caseRecord.extractedFacts?.incidentPlace },
          item2: { label: "উদ্ধারহীন থাকার স্থায়িত্ব ও সময়কাল", done: !!caseRecord.extractedFacts?.incidentDate },
        },
        tier2: {
          title: "টায়ার ২: শারীরিক অবস্থা ও তাৎক্ষণিক পদক্ষেপ",
          item1: { label: "ব্যক্তির চেতনা ও শারীরিক বিপন্নতার ধরন", done: !!answers["victim_condition"] || !!caseRecord.extractedFacts?.injuriesAndMedical },
          item2: { label: "জরুরি সেবা (৯৯৯ / পুলিশ) অবহিতকরণের রেকর্ড", done: !!answers["emergency_notified"] },
        },
        tier3: {
          title: "টায়ার ৩: প্রশাসনিক ও আইনি বাধ্যবাধকতা",
          item1: { label: "পুলিশ আইন ৪৪ ধারা (উদ্ধারের আইনি দায়িত্ব)", done: true },
          item2: { label: "সংবিধানের ৩২ অনুচ্ছেদ (জীবন রক্ষার অধিকার)", done: true },
        },
      }
    : isSmokingNuisance
    ? {
        tier1: {
          title: "টায়ার ১: উপদ্রবের স্থান ও সময়কাল",
          item1: { label: "ধূমপান বা উপদ্রবের সুনির্দিষ্ট অবস্থান", done: !!caseRecord.extractedFacts?.incidentPlace },
          item2: { label: "উপদ্রব সংঘটনের নিয়মিত সময়কাল", done: !!caseRecord.extractedFacts?.incidentDate },
        },
        tier2: {
          title: "টায়ার ২: প্রত্যক্ষদর্শী ও স্বাস্থ্যগত প্রভাব",
          item1: { label: "শিশু/রোগীর স্বাস্থ্যঝুঁকি ও উপদ্রবের ছবি/ভিডিও", done: !!answers["evidence_recorded"] || score >= 50 },
          item2: { label: "প্রত্যক্ষদর্শী প্রতিবেশী ও পরিবারের সাক্ষ্য", done: (caseRecord.extractedFacts?.witnesses?.length || 0) > 0 },
        },
        tier3: {
          title: "টায়ার ৩: নিষেধ অমান্য ও নির্বাহী এখতিয়ার",
          item1: { label: "বারবার নিষেধ সত্ত্বেও বারণ না মানার বিবরণ", done: !!caseRecord.extractedFacts?.motiveOrPreviousDispute },
          item2: { label: "নির্বাহী ম্যাজিস্ট্রেটের প্রতিকার (ধারা ১৩৩)", done: true },
        },
      }
    : isChequeCase
    ? {
        tier1: {
          title: "টায়ার ১: চেক ও ডিজঅনার সংক্রান্ত তথ্য",
          item1: { label: "চেক প্রদানের তারিখ ও ব্যাংক শাখা", done: !!caseRecord.extractedFacts?.incidentDate },
          item2: { label: "চেক প্রত্যাখ্যাত (Dis-honour) হওয়ার তারিখ", done: !!answers["cheque_dishonour_date"] || score >= 40 },
        },
        tier2: {
          title: "টায়ার ২: দালিলিক প্রমাণ ও ব্যাংক মেমো",
          item1: { label: "মূল চেক ও ব্যাংক ডিজঅনার স্লিপ", done: true },
          item2: { label: "রেজিস্ট্রি লিগ্যাল নোটিশ ও প্রাপ্তি স্বীকার (A/D)", done: !!answers["legal_notice_date"] || score >= 60 },
        },
        tier3: {
          title: "টায়ার ৩: আইনি তামাদি ও দায় পর্যালোচনা",
          item1: { label: "নোটিশ প্রাপ্তির ৩০ দিন তামাদি হিসাব", done: true },
          item2: { label: "আর্থিক দেনা বা চুক্তিভিত্তিক বৈধ দায়", done: !!caseRecord.extractedFacts?.motiveOrPreviousDispute },
        },
      }
    : isCivilLand
    ? {
        tier1: {
          title: "টায়ার ১: সম্পত্তির বিবরণ ও স্বত্ব",
          item1: { label: "সুনির্দিষ্ট মৌজা, খতিয়ান ও দাগ নম্বর", done: !!caseRecord.extractedFacts?.incidentPlace },
          item2: { label: "স্বত্ব অর্জনের মাধ্যম ও দলিলের তারিখ", done: !!caseRecord.extractedFacts?.incidentDate },
        },
        tier2: {
          title: "টায়ার ২: দালিলিক পরচা ও ভোগদখল",
          item1: { label: "সিএস/এসএ/আরএস/বিএস খতিয়ান ও নামজারি", done: !!answers["property_document"] || score >= 50 },
          item2: { label: "শান্তিপূর্ণ ভোগদখল ও খাজনা দাখিলা", done: (caseRecord.extractedFacts?.witnesses?.length || 0) > 0 },
        },
        tier3: {
          title: "টায়ার ৩: বিরোধের কারণ ও তামাদি",
          item1: { label: "বেদখল বা বিরোধ সৃষ্টির সুনির্দিষ্ট তারিখ", done: score >= 50 || !!answers["threat_nature"] },
          item2: { label: "স্থায়ী নিষেধাজ্ঞা ও স্বত্ব ঘোষণার এখতিয়ার", done: true },
        },
      }
    : {
        tier1: {
          title: "টায়ার ১: প্রাথমিক আইনি উপাদান (Basic Statutory Facts)",
          item1: { label: "ঘটনার সুনির্দিষ্ট তারিখ ও সময়", done: !!caseRecord.extractedFacts?.incidentDate },
          item2: { label: "সুনির্দিষ্ট ঘটনাস্থল ও এখতিয়ার", done: !!caseRecord.extractedFacts?.incidentPlace },
        },
        tier2: {
          title: "টায়ার ২: আলামত ও প্রমাণাদি (Evidence & Witnesses)",
          item1: { label: "ব্যবহৃত অস্ত্র / আঘাতের ধরন", done: (caseRecord.extractedFacts?.weaponsUsed?.length || 0) > 0 || !!answers["weapon_used"] },
          item2: { label: "প্রত্যক্ষদর্শী নিরপেক্ষ সাক্ষী", done: (caseRecord.extractedFacts?.witnesses?.length || 0) > 0 },
        },
        tier3: {
          title: "টায়ার ৩: আইনি ফাঁকফোকর ও ডিফেন্স পূর্বানুমান (Legal Loopholes)",
          item1: { label: "এজাহার দায়েরের বিলম্বের কারণ", done: score >= 50 || !!answers["delay_reason"] },
          item2: { label: "পূর্বশত্রুতা / আত্মরক্ষা পর্যালোচনা", done: !!caseRecord.extractedFacts?.motiveOrPreviousDispute || !!answers["prior_dispute"] },
        },
      };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 border-r border-slate-200 overflow-y-auto">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              ধাপ ২: প্রয়োজনীয় আইনি তথ্য ও এআই অনুসন্ধান
            </h3>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            ধাপ ২ (Questions)
          </span>
        </div>

        {/* Case Completeness Meter & Investigation Progress */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
              <span>Investigation Progress:</span>
            </span>
            <span
              className={`font-black ${
                score >= 90
                  ? "text-emerald-700"
                  : score >= 60
                  ? "text-indigo-700"
                  : "text-amber-700"
              }`}
            >
              Investigation Progress ({Math.min(100, Math.max(score, 30))}% Complete)
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
              style={{ width: `${Math.max(30, score)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            * সিনিয়র অ্যাডভোকেট ইনভেস্টিগেশন ইঞ্জিন: অপরাধের উপাদান (Ingredients of Offence) ও সেকশন রুলসের ভিত্তিতে গণনাকৃত।
          </p>
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Missing Facts Checklist (3 Tiers) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-indigo-700" />
              <span>Missing Facts Checklist (আইনি তথ্যের ৩-স্তরীয় চেকলিস্ট)</span>
            </h4>
            <span className="text-[10px] text-slate-500">স্বয়ংক্রিয় ফ্যাক্ট ট্র্যাকার</span>
          </div>

          {/* Tier 1 */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
              {tierConfig.tier1.title}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                {tierConfig.tier1.item1.done ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className={tierConfig.tier1.item1.done ? "text-slate-800 font-medium" : "text-amber-700"}>
                  {tierConfig.tier1.item1.label}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                {tierConfig.tier1.item2.done ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className={tierConfig.tier1.item2.done ? "text-slate-800 font-medium" : "text-amber-700"}>
                  {tierConfig.tier1.item2.label}
                </span>
              </div>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
              {tierConfig.tier2.title}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                {tierConfig.tier2.item1.done ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="text-slate-700">{tierConfig.tier2.item1.label}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                {tierConfig.tier2.item2.done ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="text-slate-700">{tierConfig.tier2.item2.label}</span>
              </div>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 inline-block">
              {tierConfig.tier3.title}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                {tierConfig.tier3.item1.done ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="text-slate-700">{tierConfig.tier3.item1.label}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                {tierConfig.tier3.item2.done ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="text-slate-700">{tierConfig.tier3.item2.label}</span>
              </div>
            </div>
          </div>
        </div>
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
                    ? "আইনি তথ্য যাচাই ও ধারা পুনর্মূল্যায়ন হচ্ছে..."
                    : "উত্তরগুলো সংরক্ষণ করুন ও ৩য় ধাপে আরজি প্রস্তুত করুন →"}
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

        {/* Step 2 Bottom Sequential Navigation Controls */}
        <div className="pt-2 pb-4 flex items-center justify-between gap-3 border-t border-slate-200 mt-2">
          {onPrevStep && (
            <button
              type="button"
              onClick={onPrevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              <span>← ১ম ধাপ: ঘটনা পরিবর্তন</span>
            </button>
          )}

          {onNextStep && (
            <button
              type="button"
              onClick={onNextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition ml-auto cursor-pointer"
            >
              <span>৩য় ধাপ: আদালতের আরজি ও প্রিন্ট →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
