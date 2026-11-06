"use client";

import React, { useState, useEffect } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  FileText,
  Clock,
  UserCheck,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  Scale,
  Sparkles,
  Download,
} from "lucide-react";
import {
  generateHaziraSlipHtml,
  generateTimePetitionHtml,
  generateVakalatnamaFullHtml,
  HaziraSlipData,
  TimePetitionData,
  VakalatnamaData,
} from "@/lib/templates/courtEssentialsTemplates";

type TabType = "HAZIRA" | "TIME_PETITION" | "VAKALATNAMA";

export default function CourtEssentialsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("HAZIRA");
  const [copied, setCopied] = useState(false);

  // Common advocate profile defaults
  const [advocateName, setAdvocateName] = useState("ব্যারিস্টার মোঃ তানভীর আহমেদ");
  const [advocateBarReg, setAdvocateBarReg] = useState("BC/DH/2018/4892");
  const [chamberName, setChamberName] = useState("তানভীর অ্যান্ড অ্যাসোসিয়েটস, চেম্বার নং ৩০৪, সুপ্রিম কোর্ট বার অ্যানেক্স, ঢাকা");
  const [advocateMobile, setAdvocateMobile] = useState("01711-234567");

  // Hazira Slip State
  const [haziraCourt, setHaziraCourt] = useState("বিজ্ঞ মেট্রোপলিটন ম্যাজিস্ট্রেট আদালত নং ০৪, ঢাকা");
  const [haziraCaseNo, setHaziraCaseNo] = useState("সি.আর. মামলা নং ৪৫২/২০২৪");
  const [haziraSections, setHaziraSections] = useState("দণ্ডবিধি আইনের ৩২৩/৩২৫/৫০৬ ধারা");
  const [haziraComplainant, setHaziraComplainant] = useState("রাষ্ট্র (বাদী: জনাব কামাল উদ্দিন)");
  const [haziraDate, setHaziraDate] = useState("আজকের ধার্য তারিখ");
  const [accusedList, setAccusedList] = useState<
    Array<{ name: string; status: "HAZIR" | "IN_CUSTODY" | "TIME_PRAYED"; remarks?: string }>
  >([
    { name: "১। মোঃ রফিকুল ইসলাম", status: "HAZIR", remarks: "জামিনে হাজির" },
    { name: "২। মোঃ জহিরুল হক", status: "HAZIR", remarks: "জামিনে হাজির" },
  ]);

  // Time Petition State
  const [timeCourt, setTimeCourt] = useState("বিজ্ঞ ৫ম অতিরিক্ত মহানগর দায়রা জজ আদালত, ঢাকা");
  const [timeCaseNo, setTimeCaseNo] = useState("মেট্রো দায়রা মামলা নং ৭৮৯/২০২৩");
  const [timeCaseType, setTimeCaseType] = useState<"CRIMINAL" | "CIVIL">("CRIMINAL");
  const [timePetitionerSide, setTimePetitionerSide] = useState<"বাদী পক্ষ" | "বিবাদী / আসামি পক্ষ">("বিবাদী / আসামি পক্ষ");
  const [timeComplainant, setTimeComplainant] = useState("রাষ্ট্র");
  const [timeAccused, setTimeAccused] = useState("মোঃ মিজানুর রহমান ও অন্যান্য");
  const [timePrevDate, setTimePrevDate] = useState("১৫ অক্টোবর, ২০২৪");
  const [timeStage, setTimeStage] = useState("সাক্ষী গ্রহণ (P.W. Examination)");
  const [timeReason, setTimeReason] = useState(
    "দরখাস্তকারী আসামি হঠাৎ তীব্র জ্বরে আক্রান্ত হওয়ায় বিজ্ঞ আদালতে উপস্থিত হইতে অপারগ এবং বিজ্ঞ সিনিয়র কৌঁসুলি অন্য আদালতে বিশেষ শুনানিতে ব্যস্ত থাকায় অদ্য সাক্ষ্য গ্রহণ মুলতবি রাখা আবশ্যক।"
  );

  // Vakalatnama State
  const [vakalatCourt, setVakalatCourt] = useState("বিজ্ঞ যুগ্ম জেলা ও দায়রা জজ ১ম আদালত, ঢাকা");
  const [vakalatCaseNo, setVakalatCaseNo] = useState("দেওয়ানি মোকদ্দমা নং ২১৩/২০২৪");
  const [vakalatComplainant, setVakalatComplainant] = useState("জনাব আলহাজ্ব নূরুল হুদা");
  const [vakalatAccused, setVakalatAccused] = useState("জনাব মোস্তাফিজুর রহমান গং");
  const [vakalatAppointing, setVakalatAppointing] = useState("বাদী");

  // Load profile from localStorage if exists
  useEffect(() => {
    setHaziraDate(new Date().toLocaleDateString("bn-BD"));
    try {
      const savedProfile = localStorage.getItem("legalai_user_profile");
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.name) setAdvocateName(p.name);
        if (p.barReg || p.barCouncilId) setAdvocateBarReg(p.barReg || p.barCouncilId);
        if (p.chamberAddress || p.chamberName) setChamberName(p.chamberAddress || p.chamberName);
        if (p.phone) setAdvocateMobile(p.phone);
      }
    } catch {
      // ignore
    }
  }, []);

  // Compute live HTML
  const haziraData: HaziraSlipData = {
    courtName: haziraCourt,
    caseNo: haziraCaseNo,
    sections: haziraSections,
    complainantName: haziraComplainant,
    accusedList,
    hearingDate: haziraDate,
    advocateName,
    advocateBarReg,
    chamberName,
  };

  const timeData: TimePetitionData = {
    courtName: timeCourt,
    caseNo: timeCaseNo,
    caseType: timeCaseType,
    complainantName: timeComplainant,
    accusedOrOppositeParty: timeAccused,
    previousHearingDate: timePrevDate,
    reasonsBn: timeReason,
    stageBn: timeStage,
    advocateName,
    advocateBarReg,
    petitionerSide: timePetitionerSide,
    petitionDate: haziraDate || "আজকের তারিখ",
  };

  const vakalatData: VakalatnamaData = {
    courtName: vakalatCourt,
    caseNo: vakalatCaseNo,
    complainantName: vakalatComplainant,
    accusedOrOppositeParty: vakalatAccused,
    appointingParty: vakalatAppointing,
    advocateName,
    advocateBarReg,
    advocateChamber: chamberName,
    advocateMobile,
    dateStr: haziraDate || "আজকের তারিখ",
  };

  let currentHtml = "";
  if (activeTab === "HAZIRA") {
    currentHtml = generateHaziraSlipHtml(haziraData);
  } else if (activeTab === "TIME_PETITION") {
    currentHtml = generateTimePetitionHtml(timeData);
  } else {
    currentHtml = generateVakalatnamaFullHtml(vakalatData);
  }

  const handleCopy = () => {
    // Strip tags for clipboard or copy HTML
    navigator.clipboard.writeText(currentHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LegalAI BD - Court Print</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 15mm; }
            body { background: white; font-family: 'SolaimanLipi', 'Kalpurush', serif; }
          </style>
        </head>
        <body class="p-6">
          ${currentHtml}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const addAccusedRow = () => {
    setAccusedList([
      ...accusedList,
      {
        name: `${accusedList.length + 1}। নতুন আসামির নাম`,
        status: "HAZIR",
        remarks: "জামিনে হাজির",
      },
    ]);
  };

  const removeAccusedRow = (index: number) => {
    setAccusedList(accusedList.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Court Daily Generator • Daily Essentials (Tier 1)</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              কোর্ট দৈনিক এসেনশিয়ালস ও দরখাস্ত জেনারেটর
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              আদালতের প্রাত্যহিক শুনানির হাজিরা স্লিপ, ফৌজদারি ৩৪৪ ধারা বা দেওয়ানি ১৭ আদেশ মতে সময় প্রার্থনার দরখাস্ত এবং ওকালতনামা এক ক্লিকে প্রস্তুত ও প্রিন্ট করুন।
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("HAZIRA")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === "HAZIRA"
                  ? "border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>১. আসামির হাজিরা স্লিপ (Hazira Slip)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TIME_PETITION")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === "TIME_PETITION"
                  ? "border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>২. সময় প্রার্থনার দরখাস্ত (Time Petition)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("VAKALATNAMA")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === "VAKALATNAMA"
                  ? "border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>৩. ওকালতনামা (Vakalatnama)</span>
            </button>
          </div>

          {/* Main Grid: Form Left, Preview Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>
                    {activeTab === "HAZIRA" && "হাজিরা স্লিপের তথ্য"}
                    {activeTab === "TIME_PETITION" && "সময় প্রার্থনার বিবরণ"}
                    {activeTab === "VAKALATNAMA" && "ওকালতনামা তথ্য ও আইনজীবী সনদ"}
                  </span>
                </h2>
              </div>

              {/* TAB 1: HAZIRA SLIP FORM */}
              {activeTab === "HAZIRA" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      বিজ্ঞ আদালতের নাম (মোকাম):
                    </label>
                    <input
                      type="text"
                      value={haziraCourt}
                      onChange={(e) => setHaziraCourt(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        মামলা নম্বর:
                      </label>
                      <input
                        type="text"
                        value={haziraCaseNo}
                        onChange={(e) => setHaziraCaseNo(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        ধার্য তারিখ:
                      </label>
                      <input
                        type="text"
                        value={haziraDate}
                        onChange={(e) => setHaziraDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        বাদী / রাষ্ট্র:
                      </label>
                      <input
                        type="text"
                        value={haziraComplainant}
                        onChange={(e) => setHaziraComplainant(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        আইনের ধারা:
                      </label>
                      <input
                        type="text"
                        value={haziraSections}
                        onChange={(e) => setHaziraSections(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Accused Dynamic List */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">আসামিদের তালিকা:</span>
                      <button
                        type="button"
                        onClick={addAccusedRow}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" /> আসামি যোগ করুন
                      </button>
                    </div>

                    <div className="space-y-2">
                      {accusedList.map((acc, index) => (
                        <div key={index} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={acc.name}
                              onChange={(e) => {
                                const next = [...accusedList];
                                next[index].name = e.target.value;
                                setAccusedList(next);
                              }}
                              className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded"
                              placeholder="আসামির নাম"
                            />
                            {accusedList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAccusedRow(index)}
                                className="text-rose-500 hover:text-rose-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={acc.status}
                              onChange={(e) => {
                                const next = [...accusedList];
                                next[index].status = e.target.value as any;
                                setAccusedList(next);
                              }}
                              className="text-xs p-1.5 bg-white border border-slate-300 rounded text-slate-700"
                            >
                              <option value="HAZIR">হাজির (জামিনে)</option>
                              <option value="IN_CUSTODY">জেল হাজতে</option>
                              <option value="TIME_PRAYED">সময় প্রার্থনা</option>
                            </select>
                            <input
                              type="text"
                              value={acc.remarks || ""}
                              onChange={(e) => {
                                const next = [...accusedList];
                                next[index].remarks = e.target.value;
                                setAccusedList(next);
                              }}
                              placeholder="মন্তব্য (ঐচ্ছিক)"
                              className="text-xs p-1.5 bg-white border border-slate-300 rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TIME PETITION FORM */}
              {activeTab === "TIME_PETITION" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        মামলার ধরন:
                      </label>
                      <select
                        value={timeCaseType}
                        onChange={(e) => setTimeCaseType(e.target.value as any)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      >
                        <option value="CRIMINAL">ফৌজদারি (Sec 344 CrPC)</option>
                        <option value="CIVIL">দেওয়ানি (Order 17 CPC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        দরখাস্তকারী পক্ষ:
                      </label>
                      <select
                        value={timePetitionerSide}
                        onChange={(e) => setTimePetitionerSide(e.target.value as any)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      >
                        <option value="বিবাদী / আসামি পক্ষ">বিবাদী / আসামি পক্ষ</option>
                        <option value="বাদী পক্ষ">বাদী পক্ষ</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      বিজ্ঞ আদালতের নাম:
                    </label>
                    <input
                      type="text"
                      value={timeCourt}
                      onChange={(e) => setTimeCourt(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        মামলা নম্বর:
                      </label>
                      <input
                        type="text"
                        value={timeCaseNo}
                        onChange={(e) => setTimeCaseNo(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        বর্তমান পর্যায় (Stage):
                      </label>
                      <input
                        type="text"
                        value={timeStage}
                        onChange={(e) => setTimeStage(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        বাদী / অভিযোগকারী:
                      </label>
                      <input
                        type="text"
                        value={timeComplainant}
                        onChange={(e) => setTimeComplainant(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        বিবাদী / আসামি:
                      </label>
                      <input
                        type="text"
                        value={timeAccused}
                        onChange={(e) => setTimeAccused(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      পূর্ববর্তী ধার্য তারিখ:
                    </label>
                    <input
                      type="text"
                      value={timePrevDate}
                      onChange={(e) => setTimePrevDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      সময় প্রার্থনার সুনির্দিষ্ট কারণ:
                    </label>
                    <textarea
                      rows={3}
                      value={timeReason}
                      onChange={(e) => setTimeReason(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 leading-relaxed"
                    />
                    <div className="mt-1 flex gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          setTimeReason(
                            "দরখাস্তকারী আসামি আকস্মিক গুরুতর অসুস্থ থাকায় অদ্য বিজ্ঞ আদালতে সশরীরে উপস্থিত হইতে অপারগ হইয়াছেন।"
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                      >
                        + অসুস্থতার কারণ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTimeReason(
                            "উক্ত মামলায় মাননীয় মহামান্য হাইকোর্ট বিভাগে কোয়াশমেন্ট বা রিট বিচারাধীন থাকায় আদেশের সার্টিফাইড কপির জন্য সময় আবশ্যক।"
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                      >
                        + হাইকোর্ট রিভিশন
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTimeReason(
                            "বিজ্ঞ সিনিয়র আইনজীবী অন্য আদালতে পূর্বনির্ধারিত একটি বিশেষ মামলার শুনানিতে ব্যস্ত রহিয়াছেন।"
                          )
                        }
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                      >
                        + সিনিয়র আইনজীবী ব্যস্ত
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VAKALATNAMA FORM */}
              {activeTab === "VAKALATNAMA" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      বিজ্ঞ আদালতের নাম:
                    </label>
                    <input
                      type="text"
                      value={vakalatCourt}
                      onChange={(e) => setVakalatCourt(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        মামলা নম্বর:
                      </label>
                      <input
                        type="text"
                        value={vakalatCaseNo}
                        onChange={(e) => setVakalatCaseNo(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        নিয়োগকারী পক্ষ:
                      </label>
                      <select
                        value={vakalatAppointing}
                        onChange={(e) => setVakalatAppointing(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      >
                        <option value="বাদী / আবেদনকারী">বাদী / আবেদনকারী</option>
                        <option value="বিবাদী / আসামি">বিবাদী / আসামি</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        বাদী / দরখাস্তকারী:
                      </label>
                      <input
                        type="text"
                        value={vakalatComplainant}
                        onChange={(e) => setVakalatComplainant(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        বিবাদী / আসামি:
                      </label>
                      <input
                        type="text"
                        value={vakalatAccused}
                        onChange={(e) => setVakalatAccused(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advocate Details Section (Applicable to all forms) */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  বিজ্ঞ আইনজীবীর প্রোফাইল তথ্য (স্বয়ংক্রিয় সংগৃহীত)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      আইনজীবীর নাম:
                    </label>
                    <input
                      type="text"
                      value={advocateName}
                      onChange={(e) => setAdvocateName(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      বার কাউন্সিল সনদ নং:
                    </label>
                    <input
                      type="text"
                      value={advocateBarReg}
                      onChange={(e) => setAdvocateBarReg(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    চেম্বারের ঠিকানা:
                  </label>
                  <input
                    type="text"
                    value={chamberName}
                    onChange={(e) => setChamberName(e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col min-h-[600px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900">লাইভ প্রিভিউ ও প্রিন্ট লেআউট</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "কপি সম্পন্ন" : "কপি"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 shadow-sm transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট করুন (Print)</span>
                  </button>
                </div>
              </div>

              {/* Rendered HTML Container */}
              <div
                className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-y-auto max-h-[750px]"
                dangerouslySetInnerHTML={{ __html: currentHtml }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
