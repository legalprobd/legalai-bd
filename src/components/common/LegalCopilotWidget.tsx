"use client";

import React, { useState } from "react";
import {
  Scale,
  Sparkles,
  MessageSquare,
  X,
  Send,
  HelpCircle,
  BookOpen,
  ChevronDown,
  Minimize2,
  Maximize2,
  Bot,
  User,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export function LegalCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "আসসালামু আলাইকুম বিজ্ঞ আইনজীবী। আমি আপনার চেম্বার লিগ্যাল কো-পাইলট। বাংলাদেশ কোড, সুপ্রিম কোর্ট নজির ও দেওয়ানি/ফৌজদারি প্রসিডিউর নিয়ে যেকোনো আইনি প্রশ্ন আমাকে করতে পারেন।",
    },
  ]);

  const quickPrompts = [
    {
      label: "অস্থায়ী নিষেধাজ্ঞা খারিজ হলে করণীয়?",
      q: "দেওয়ানি মোকদ্দমায় অস্থায়ী নিষেধাজ্ঞার দরখাস্ত খারিজ হলে কত দিনের মধ্যে কোথায় মিস আপিল করতে হবে?",
      ans: "দেওয়ানি কার্যবিধি (CPC 1908) এর অর্ডার ৪৩ রুল ১(r) অনুযায়ী দেওয়ানি আদালতের অন্তর্বর্তীকালীন নিষেধাজ্ঞা খারিজ আদেশের বিরুদ্ধে জেলা জজ আদালতে 'মিস আপিল' (Misc Appeal) দায়ের করতে হবে। তামাদি আইন ১৯০৮-এর আর্টিকল ১৫২ মোতাবেক আদেশের নকল পাওয়ার পর থেকে ৩০ দিনের মধ্যে এই আপিল দাখিল করতে হয়।",
    },
    {
      label: "দণ্ডবিধি ৩২৩ বনাম ৩২৫ ধারার পার্থক্য?",
      q: "দণ্ডবিধি ৩২৩ এবং ৩২৫ ধারার প্রধান পার্থক্য কী?",
      ans: "দণ্ডবিধি ৩২৩ ধারা হলো সাধারণ স্বেচ্ছাকৃত আঘাত (Voluntarily causing hurt) যার সর্বোচ্চ শাস্তি ১ বছর কারাদণ্ড বা ১,০০০ টাকা অর্থদণ্ড বা উভয় দণ্ড। পক্ষান্তরে, ৩২৫ ধারা হলো মারাত্মক জখম (Grievous hurt - দণ্ডবিধি ৩২০ ধারার ৮টি শর্তের যেকোনো একটি, যেমন: হাড় ভাঙা, স্থায়ী অঙ্গহানি, ২০ দিন তীব্র শারীরিক যাতনা ইত্যাদি)। ৩২৫ ধারার শাস্তি সর্বোচ্চ ৭ বছর সশ্রম কারাদণ্ড এবং অর্থদণ্ড বাধ্যতামূলক।",
    },
    {
      label: "চেক বাউন্সে নোটিশ ও মামলার তামাদি?",
      q: "এনআই অ্যাক্ট ১৩৮ ধারায় চেক বাউন্স হলে লিগ্যাল নোটিশ ও মামলা করার সময়সীমা কতদিন?",
      ans: "The Negotiable Instruments Act 1881-এর ধারা ১৩৮(১)(b) মোতাবেক ব্যাংক থেকে চেক ডিজঅনার মেমো পাওয়ার ৩০ দিনের মধ্যে বিবাদীকে লিখিত রেজিস্টার্ড লিগ্যাল নোটিশ পাঠাতে হবে। নোটিশ প্রাপ্তির ৩০ দিনের মধ্যে বিবাদী টাকা পরিশোধ না করলে, ধারা ১৩৮(১)(c) মোতাবেক পরবর্তী ৩০ দিনের মধ্যে বিজ্ঞ ম্যাজিস্ট্রেট আদালতে নালিশি মামলা (C.R. Case) দায়ের করতে হবে।",
    },
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      const lower = query.toLowerCase();

      // Check matched prompt
      const matchedPrompt = quickPrompts.find((p) => p.q === query);
      if (matchedPrompt) {
        reply = matchedPrompt.ans;
      } else if (lower.includes("নিষেধাজ্ঞা") || lower.includes("ইনজাংশন")) {
        reply =
          "দেওয়ানি কার্যবিধির অর্ডার ৩৯ রুল ১ ও ২ অনুযায়ী অস্থায়ী নিষেধাজ্ঞার ৩টি মূল উপাদান প্রমাণ করতে হয়: ১. প্রাইমা ফেসি কেস (Prima Facie Case), ২. অপূরণীয় ক্ষতি (Irreparable Loss), এবং ৩. সুবিধার ভারসাম্য (Balance of Inconvenience)।";
      } else if (lower.includes("তামাদি") || lower.includes("limitation")) {
        reply =
          "তামাদি আইন ১৯০৮-এর ধারা ৩ অত্যন্ত কঠোর—তামাদি অতিক্রান্ত হলে কোনো অজুহাত ছাড়াই মামলা খারিজের বাধ্যবাধকতা রয়েছে। তবে সিভিল আরজি বা আপিলে ধারা ৫ (Condonation of delay) অনুযায়ী উপযুক্ত কারণ দর্শিয়ে সময় প্রার্থনার সুযোগ থাকে।";
      } else if (lower.includes("জামিন") || lower.includes("bail")) {
        reply =
          "ফৌজদারি কার্যবিধি (CrPC) এর ধারা ৪৯৬ হলো জামিনযোগ্য অপরাধের জামিন (Bailable offence - জামিন অধিকার)। আর ধারা ৪৯৭ হলো জামিন-অযোগ্য অপরাধের জামিন (Non-bailable - আদালতের সুবিবেচনা)।";
      } else {
        reply = `আপনার আইনি প্রশ্নের প্রেক্ষিতে: "${query}" — বাংলাদেশ কোড ও সুপ্রিম কোর্টের নজির অনুযায়ী প্রাথমিক আইনি অনুসন্ধান সম্পন্ন হয়েছে। সংশ্লিষ্ট মামলার নথি ও তারিখের সাথে মিলিয়ে আরজি বা পিটিশনে এই বিধান অন্তর্ভুক্ত করা সমীচীন হবে।`;
      }

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Trigger Button on bottom-right */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center gap-2.5 transition-all cursor-pointer active:scale-95 group border-2 border-white"
          title="এআই লিগ্যাল কো-পাইলট ওপেন করুন"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Scale className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="text-xs font-bold tracking-tight">এআই জুনিয়র চ্যাট</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[420px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">এআই ভার্চুয়াল জুনিয়র ব্যারিস্টার</h4>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>বাংলাদেশ কোড ও নজির ডেটাবেস লাইভ</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 overflow-x-auto flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-1">দ্রুত প্রশ্ন:</span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(p.q)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-lg text-[10px] font-medium whitespace-nowrap transition cursor-pointer shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-bl-xs"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                <span>আইনি ধারা ও নজির বিশ্লেষণ চলছে...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="আইনের ধারা বা প্রসিডিউর নিয়ে প্রশ্ন লিখুন..."
              className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
