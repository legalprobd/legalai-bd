"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  FolderOpen,
  ChevronDown,
  Layers,
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

function CourtEssentialsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("HAZIRA");
  const [copied, setCopied] = useState(false);
  const [chamberCases, setChamberCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

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

  // Load cases from API
  useEffect(() => {
    fetch("/api/cases")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && Array.isArray(json.data)) {
          setChamberCases(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Handle URL query parameters
  useEffect(() => {
    setHaziraDate(new Date().toLocaleDateString("bn-BD"));

    const typeParam = searchParams.get("type");
    if (typeParam === "time_petition") setActiveTab("TIME_PETITION");
    else if (typeParam === "vakalatnama") setActiveTab("VAKALATNAMA");
    else if (typeParam === "hazira") setActiveTab("HAZIRA");

    const courtParam = searchParams.get("court");
    const caseNoParam = searchParams.get("caseNo");

    if (courtParam) {
      setHaziraCourt(courtParam);
      setTimeCourt(courtParam);
      setVakalatCourt(courtParam);
    }
    if (caseNoParam) {
      setHaziraCaseNo(caseNoParam);
      setTimeCaseNo(caseNoParam);
      setVakalatCaseNo(caseNoParam);
    }

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
  }, [searchParams]);

  // Auto-populate when user selects a case from chamber dropdown
  const handleSelectChamberCase = (cId: string) => {
    setSelectedCaseId(cId);
    const found = chamberCases.find((c) => c.id === cId);
    if (!found) return;

    const sectionsText = found.applicableLaws?.length
      ? found.applicableLaws.map((l: any) => `ধারা ${l.section}`).join(", ")
      : "দণ্ডবিধি আইনের ৩২৩/৩২৫/৫০৬ ধারা";

    setHaziraCaseNo(found.title || "মামলা নং");
    setTimeCaseNo(found.title || "মামলা নং");
    setVakalatCaseNo(found.title || "মামলা নং");

    setHaziraSections(sectionsText);

    if (found.category === "Civil") {
      setTimeCaseType("CIVIL");
      setVakalatCourt("বিজ্ঞ সহকারী জজ আদালত / যুগ্ম জেলা জজ আদালত");
      setTimeCourt("বিজ্ঞ সহকারী জজ আদালত / যুগ্ম জেলা জজ আদালত");
      setHaziraCourt("বিজ্ঞ সহকারী জজ আদালত / যুগ্ম জেলা জজ আদালত");
    } else {
      setTimeCaseType("CRIMINAL");
      setHaziraCourt("বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা");
      setTimeCourt("বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা");
      setVakalatCourt("বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত, ঢাকা");
    }

    // Populate accused/parties from title
    const parties = found.title?.split("—") || [];
    const partyName = parties[1]?.trim() || "মোঃ করিম মিয়া";
    setAccusedList([
      { name: `১। ${partyName}`, status: "HAZIR", remarks: "জামিনে হাজির" },
      { name: `২। মোঃ অজ্ঞাত`, status: "HAZIR", remarks: "জামিনে হাজির" },
    ]);
    setTimeAccused(partyName);
    setVakalatAccused(partyName);
  };

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
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-5">
          {/* Executive Header */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-2">
                  <Scale className="w-3.5 h-3.5" />
                  <span>দৈনিক আদালত ফাইলিং ও প্রাত্যহিক পিটিশন হাব</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  হাজিরা স্লিপ, সময় প্রার্থনার দরখাস্ত ও ওকালতনামা জেনারেটর
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  কোনো তথ্য বারবার টাইপ করার প্রয়োজন নেই। চেম্বারের মামলা নির্বাচন করলেই তথ্য স্বয়ংক্রিয়ভাবে বসে প্রিন্ট-উপযোগী হয়ে যাবে।
                </p>
              </div>

              {/* 1-Click Chamber Case Selector */}
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 max-w-md w-full">
                <label className="block text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>১-ক্লিকে মামলা নির্বাচন করুন (Auto-Fill):</span>
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => handleSelectChamberCase(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:ring-1 focus:ring-amber-400 font-medium cursor-pointer"
                >
                  <option value="">-- চেম্বারের যেকোনো চলমান মামলা বাছুন --</option>
                  {chamberCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category === "Civil" ? "দেওয়ানি" : "ফৌজদারি"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("HAZIRA")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === "HAZIRA"
                  ? "border-slate-900 text-slate-900 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>১. আসামির হাজিরা স্লিপ (Hazira Slip)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TIME_PETITION")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === "TIME_PETITION"
                  ? "border-slate-900 text-slate-900 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
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
                  ? "border-slate-900 text-slate-900 bg-white rounded-t-lg shadow-xs"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <Scale className="w-4 h-4 text-blue-600" />
              <span>৩. ওকালতনামা (Vakalatnama)</span>
            </button>
          </div>

          {/* Main Grid: Form Left, Preview Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span>
                    {activeTab === "HAZIRA" && "হাজিরা স্লিপের তথ্য"}
                    {activeTab === "TIME_PETITION" && "সময় প্রার্থনা দরখাস্তের তথ্য"}
                    {activeTab === "VAKALATNAMA" && "ওকালতনামার বিবরণ"}
                  </span>
                </h2>
                <span className="text-[11px] text-slate-400 font-mono">লাইভ প্রিভিউ সক্রিয়</span>
              </div>

              {/* TAB 1: HAZIRA SLIP FORM */}
              {activeTab === "HAZIRA" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বিজ্ঞ আদালতের নাম</label>
                    <input
                      type="text"
                      value={haziraCourt}
                      onChange={(e) => setHaziraCourt(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 text-xs bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মামলা নম্বর</label>
                      <input
                        type="text"
                        value={haziraCaseNo}
                        onChange={(e) => setHaziraCaseNo(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 text-xs bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">ধার্য তারিখ</label>
                      <input
                        type="text"
                        value={haziraDate}
                        onChange={(e) => setHaziraDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 text-xs bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">সংশ্লিষ্ট ধারা / আইন</label>
                    <input
                      type="text"
                      value={haziraSections}
                      onChange={(e) => setHaziraSections(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 text-xs bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বাদী / দরখাস্তকারী</label>
                    <input
                      type="text"
                      value={haziraComplainant}
                      onChange={(e) => setHaziraComplainant(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 text-xs bg-slate-50"
                    />
                  </div>

                  {/* Accused Table in Hazira */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-slate-800">হাজিরা প্রদানকারী আসামিদের তালিকা</label>
                      <button
                        type="button"
                        onClick={addAccusedRow}
                        className="text-[11px] font-bold text-slate-800 hover:text-black flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"
                      >
                        <Plus className="w-3 h-3" />
                        <span>আসামি যোগ</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {accusedList.map((acc, index) => (
                        <div key={index} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex gap-2 items-center">
                          <input
                            type="text"
                            value={acc.name}
                            onChange={(e) => {
                              const newList = [...accusedList];
                              newList[index].name = e.target.value;
                              setAccusedList(newList);
                            }}
                            className="flex-1 p-1.5 border border-slate-300 rounded bg-white text-xs"
                          />
                          <select
                            value={acc.status}
                            onChange={(e) => {
                              const newList = [...accusedList];
                              newList[index].status = e.target.value as any;
                              newList[index].remarks =
                                e.target.value === "HAZIR"
                                  ? "জামিনে হাজির"
                                  : e.target.value === "IN_CUSTODY"
                                  ? "জেল হাজতে"
                                  : "সময় প্রার্থনা";
                              setAccusedList(newList);
                            }}
                            className="p-1.5 border border-slate-300 rounded bg-white text-[11px]"
                          >
                            <option value="HAZIR">হাজির</option>
                            <option value="IN_CUSTODY">হাজতে</option>
                            <option value="TIME_PRAYED">সময় প্রার্থী</option>
                          </select>
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
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TIME PETITION FORM */}
              {activeTab === "TIME_PETITION" && (
                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মামলার ধরণ</label>
                      <select
                        value={timeCaseType}
                        onChange={(e) => setTimeCaseType(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs font-semibold"
                      >
                        <option value="CRIMINAL">ফৌজদারি (CrPC ৩৪৪ ধারা)</option>
                        <option value="CIVIL">দেওয়ানি (CPC অর্ডার ১৭ রুল ১)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">পক্ষ নির্বাচন</label>
                      <select
                        value={timePetitionerSide}
                        onChange={(e) => setTimePetitionerSide(e.target.value as any)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs font-semibold"
                      >
                        <option value="বিবাদী / আসামি পক্ষ">বিবাদী / আসামি পক্ষ</option>
                        <option value="বাদী পক্ষ">বাদী পক্ষ</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বিজ্ঞ আদালতের নাম</label>
                    <input
                      type="text"
                      value={timeCourt}
                      onChange={(e) => setTimeCourt(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">মামলা নম্বর</label>
                      <input
                        type="text"
                        value={timeCaseNo}
                        onChange={(e) => setTimeCaseNo(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">পূর্ববর্তী শুনানির তারিখ</label>
                      <input
                        type="text"
                        value={timePrevDate}
                        onChange={(e) => setTimePrevDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বাদী / রাষ্ট্র</label>
                      <input
                        type="text"
                        value={timeComplainant}
                        onChange={(e) => setTimeComplainant(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">আসামি / বিবাদী</label>
                      <input
                        type="text"
                        value={timeAccused}
                        onChange={(e) => setTimeAccused(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মামলার বর্তমান স্তর / পর্যায়</label>
                    <input
                      type="text"
                      value={timeStage}
                      onChange={(e) => setTimeStage(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">সময় প্রার্থনার সুনির্দিষ্ট কারণ</label>
                    <textarea
                      rows={3}
                      value={timeReason}
                      onChange={(e) => setTimeReason(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: VAKALATNAMA FORM */}
              {activeTab === "VAKALATNAMA" && (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">বিজ্ঞ আদালতের নাম</label>
                    <input
                      type="text"
                      value={vakalatCourt}
                      onChange={(e) => setVakalatCourt(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">মামলা নম্বর</label>
                    <input
                      type="text"
                      value={vakalatCaseNo}
                      onChange={(e) => setVakalatCaseNo(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বাদী পক্ষ</label>
                      <input
                        type="text"
                        value={vakalatComplainant}
                        onChange={(e) => setVakalatComplainant(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">বিবাদী পক্ষ</label>
                      <input
                        type="text"
                        value={vakalatAccused}
                        onChange={(e) => setVakalatAccused(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">নিয়োগকারী পক্ষ</label>
                    <input
                      type="text"
                      value={vakalatAppointing}
                      onChange={(e) => setVakalatAppointing(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Advocate Details Section */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  আইনজীবীর নাম ও সনদ বিবরণী
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <input
                      type="text"
                      placeholder="আইনজীবীর নাম"
                      value={advocateName}
                      onChange={(e) => setAdvocateName(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="বার কাউন্সিল রেজিস্ট্রেশন"
                      value={advocateBarReg}
                      onChange={(e) => setAdvocateBarReg(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>আদালতের প্রস্তুতকৃত ফরম্যাট (A4 Judicial Document)</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "কপি হয়েছে!" : "কপি করুন"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট / PDF ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {/* Rendered Court Document */}
              <div
                className="bg-white p-8 rounded-2xl border border-slate-300 shadow-md min-h-[600px] overflow-x-auto text-slate-900"
                dangerouslySetInnerHTML={{ __html: currentHtml }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CourtEssentialsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-xs text-slate-500 font-semibold animate-pulse">লোড হচ্ছে...</div>
        </div>
      }
    >
      <CourtEssentialsContent />
    </Suspense>
  );
}
