"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Swords,
  Sparkles,
  Send,
  RotateCcw,
  User,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Scale,
  Gavel,
  MessageSquare,
} from "lucide-react";
import { MockTrialResponse } from "@/app/api/mock-trial/route";

interface ChatMessage {
  id: string;
  sender: "advocate" | "witness";
  text: string;
  objection?: string | null;
  contradiction?: string | null;
  coachingTip?: string | null;
}

const TRIAL_PRESETS = [
  {
    name: "১. রাতের চুরির মামলা — নাইট গার্ড",
    fact: "গত ১৫ অক্টোবর দিবাগত রাত আনুমানিক ২:৩০ ঘটিকায় ধানমন্ডি এলাকার একটি ইলেকট্রনিক্স দোকানে তালা ভেঙে চুরির ঘটনা ঘটে। প্রত্যক্ষদর্শী সাক্ষী হলেন পাশের ভবনের নাইট গার্ড রহিম মিয়া।",
    persona: "সাক্ষীর নাম: রহিম মিয়া, বয়স: ৪৫ বছর, পেশা: নাইট গার্ড। তিনি রাতে টহল দিচ্ছিলেন। কিছুটা ভীতু স্বভাবের এবং নিজের চাকরি বাঁচানোর চেষ্টায় আত্মরক্ষামূলক জবাব দেন।",
  },
  {
    name: "২. চেক ডিজঅনার মামলা — ব্যাংক ক্যাশিয়ার",
    fact: "বাদী দাবি করেছেন যে আসামি তাকে ৫০ লক্ষ টাকার একটি চেক প্রদান করেছিলেন যা অপর্যাপ্ত তহবিলের কারণে বাউন্স করে। সাক্ষী হলেন সোনালী ব্যাংকের প্রধান ক্যাশিয়ার মোঃ জহিরুল ইসলাম।",
    persona: "সাক্ষীর নাম: মোঃ জহিরুল ইসলাম, বয়স: ৩৮ বছর, পেশা: ব্যাংক কর্মকর্তা/ক্যাশিয়ার। তিনি অত্যন্ত নিয়মনিষ্ঠ ও ব্যাংকিং নথির ওপর নির্ভরশীল।",
  },
  {
    name: "৩. জমিতে মারামারি ও ভাঙচুর — প্রতিবেশী",
    fact: "মিরপুর মৌজায় সীমানা প্রাচীর ভাঙচুর ও দেশীয় অস্ত্র নিয়া মারপিটের ঘটনায় আসামি করিম মিয়ার বিরুদ্ধে এজাহার। সাক্ষী হলেন পাশের বাড়ির বাসিন্দা আলহাজ্ব আবুল কাশেম।",
    persona: "সাক্ষীর নাম: আলহাজ্ব আবুল কাশেম, বয়স: ৬০ বছর, প্রতিবেশী প্রত্যক্ষদর্শী। তিনি কোনো পক্ষের প্রতি শত্রুতা পোষণ করেন না বলে দাবি করেন কিন্তু রাতে চশমা ছাড়া দেখেন।",
  },
];

export default function MockTrialPage() {
  const [caseFact, setCaseFact] = useState(TRIAL_PRESETS[0].fact);
  const [witnessPersona, setWitnessPersona] = useState(TRIAL_PRESETS[0].persona);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      sender: "witness",
      text: "আমি শপথপূর্বক বলতেছি যে, আমি বিজ্ঞ আদালতে যা বলিব কেবল সত্য বলিব, সত্য বই মিথ্যা বলিব না। বিজ্ঞ কৌঁসুলি, আপনি আমাকে প্রশ্ন করতে পারেন।",
      coachingTip: "জেরা শুরু করার পূর্বে সাক্ষীর উপস্থিতির সময়, দেখার দূরত্ব ও সাক্ষীর ব্যক্তিগত স্বার্থ বা বৈরিতা সম্পর্কে স্পষ্ট ধারণা নিন।",
    },
  ]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = inputQuestion.trim();
    if (!q || isSending) return;

    const userMsg: ChatMessage = {
      id: `advocate-${Date.now()}`,
      sender: "advocate",
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setIsSending(true);

    try {
      const res = await fetch("/api/mock-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseFact,
          witnessPersona,
          newQuestion: q,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        const data: MockTrialResponse = json.data;
        const witnessMsg: ChatMessage = {
          id: `witness-${Date.now()}`,
          sender: "witness",
          text: data.witnessReplyBn,
          objection: data.objection,
          contradiction: data.contradictionDetected ? data.contradictionNoteBn : null,
          coachingTip: data.coachingTipBn,
        };
        setMessages((prev) => [...prev, witnessMsg]);
      }
    } catch {
      alert("সিমুলেটরে সংযোগ বিঘ্নিত হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `intro-${Date.now()}`,
        sender: "witness",
        text: "আমি শপথপূর্বক বলতেছি যে, বিজ্ঞ আদালতে কেবল সত্য কথাই ব্যক্ত করিব। আপনি আমাকে প্রশ্ন করতে পারেন।",
        coachingTip: "ইঙ্গিতবাহী প্রশ্ন পরিহার করে সাক্ষীকে নিজস্ব ভাষায় ঘটনা বর্ণনা করার সুযোগ দিন।",
      },
    ]);
  };

  const applyPreset = (preset: (typeof TRIAL_PRESETS)[0]) => {
    setCaseFact(preset.fact);
    setWitnessPersona(preset.persona);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
                <Gavel className="w-3.5 h-3.5" />
                <span>AI Mock Trial & Witness Simulator • Evidence Act 1872 Engine</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                মক ট্রায়াল ও সাক্ষী জেরা সিমুলেটর (Cross-Examination Simulator)
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                জুনিয়র আইনজীবীদের আদালতে জেরা (Cross-Examination) অনুশীলনের বিশেষ সিমুলেটর। সাক্ষ্য আইন ১৮৭২ এর ১৪১-১৪২ ধারা অনুযায়ী ইঙ্গিতবাহী প্রশ্নে আদালত সরাসরি আপত্তি (Objection) জানাবে।
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>ট্রায়াল রিসেট করুন (Reset Trial)</span>
            </button>
          </div>

          {/* Quick Case Presets */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">নমুনা ট্রায়াল দৃশ্যপট:</span>
            {TRIAL_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs bg-white hover:bg-slate-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Main Grid: Left Setup, Right Chat Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Case Facts & Witness Persona */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>মোকদ্দমার ঘটনা ও সাক্ষীর পরিচয় (Persona)</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ঘটনার বিবরণ (Case Facts):
                </label>
                <textarea
                  rows={4}
                  value={caseFact}
                  onChange={(e) => setCaseFact(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সাক্ষীর চরিত্র ও মনোভাব (Witness Persona):
                </label>
                <textarea
                  rows={4}
                  value={witnessPersona}
                  onChange={(e) => setWitnessPersona(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 leading-relaxed"
                />
              </div>

              {/* Legal Tip Box */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  সাক্ষ্য আইন বিধিমালা (Evidence Rules):
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  জেরার সময় এমন প্রশ্ন করবেন না যার উত্তরে সাক্ষী কেবল &quot;হ্যাঁ&quot; বা &quot;না&quot; বলতে বাধ্য হয় বা প্রশ্নের মধ্যেই উত্তর লুকিয়ে থাকে (যেমন: &quot;আপনি চোরকে দেখেছেন, তাই না?&quot;)। এমন প্রশ্ন করলে আদালত তৎক্ষণাৎ <strong>Objection (আপত্তি)</strong> তুলবে।
                </p>
              </div>
            </div>

            {/* Right: Mock Courtroom Chat Panel */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                    কাঠগড়া
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">সাক্ষীর কাঠগড়া (Witness on the Stand)</h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-md">
                      {witnessPersona.slice(0, 70)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>লাইভ ট্রায়াল সেশন</span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "advocate" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-slate-500">
                      {m.sender === "advocate" ? (
                        <>
                          <span>আপনি (বিজ্ঞ কৌঁসুলি)</span>
                          <User className="w-3 h-3 text-indigo-600" />
                        </>
                      ) : (
                        <>
                          <Gavel className="w-3 h-3 text-slate-700" />
                          <span>সাক্ষী (Witness Stand)</span>
                        </>
                      )}
                    </div>

                    {/* Speech Bubble */}
                    <div
                      className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender === "advocate"
                          ? "bg-indigo-700 text-white rounded-tr-none shadow-xs"
                          : "bg-white text-slate-900 border border-slate-200 rounded-tl-none shadow-2xs"
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* Objection Alert if raised */}
                    {m.objection && (
                      <div className="mt-1.5 max-w-xl p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2 animate-bounce-short">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{m.objection}</span>
                      </div>
                    )}

                    {/* Contradiction Alert if detected */}
                    {m.contradiction && (
                      <div className="mt-1.5 max-w-xl p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>অসঙ্গতি (Contradiction): {m.contradiction}</span>
                      </div>
                    )}

                    {/* Coaching Tip */}
                    {m.coachingTip && (
                      <div className="mt-1.5 max-w-xl p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>কৌশলগত পরামর্শ: {m.coachingTip}</span>
                      </div>
                    )}
                  </div>
                ))}

                {isSending && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white rounded-xl w-fit border border-slate-200">
                    <div className="w-3 h-3 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <span>সাক্ষী জবানবন্দি বিবেচনা করছেন...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3.5 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder="সাক্ষীকে উদ্দেশ্য করে প্রশ্ন করুন (যেমন: ঘটনার সময় আপনি নির্দিষ্ট কোন স্থানে উপস্থিত ছিলেন?)..."
                    className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !inputQuestion.trim()}
                    className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>প্রশ্ন করুন</span>
                  </button>
                </form>

                {/* Quick Question Starters */}
                <div className="mt-2 flex gap-1.5 flex-wrap items-center text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-600">নমুনা প্রশ্ন:</span>
                  <button
                    type="button"
                    onClick={() => setInputQuestion("সেই রাতে আপনি কত দূর থেকে ঘটনা প্রত্যক্ষ করেছিলেন?")}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    + দেখার দূরত্ব
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputQuestion("আপনি কি চোরকে পালাতে দেখেছিলেন, তাই না?")}
                    className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    title="ইঙ্গিতবাহী প্রশ্নের আপত্তি টেস্ট করার জন্য"
                  >
                    + ইঙ্গিতবাহী প্রশ্ন (Leading Test)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputQuestion("পুলিশের কাছে দেওয়া জবানবন্দিতে কি আপনি এই ব্যক্তির নাম উল্লেখ করেছিলেন?")}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    + ১৬১ ধারার জবানবন্দি
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
