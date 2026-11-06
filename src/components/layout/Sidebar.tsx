"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Building2,
  Scale,
  Calculator,
  Search,
  BookOpen,
  FileSearch,
  CreditCard,
  TrendingUp,
  Settings,
  Shield,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  FileText,
  UserCheck,
  Layers,
  Swords,
  MessageSquare,
  ListOrdered,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(true);

  const mainNav = [
    { label: "চেম্বার ড্যাশবোর্ড", href: "/dashboard", icon: LayoutDashboard },
    { label: "মক্কেল ডিরেক্টরি", href: "/clients", icon: Users },
    { label: "কজ লিস্ট ও ক্যালেন্ডার", href: "/calendar", icon: Calendar },
    { label: "লাইভ কজলিস্ট ট্র্যাকার", href: "/cause-list-tracker", icon: ListOrdered },
    { label: "টাস্ক ও ডেলিগেশন", href: "/tasks", icon: CheckSquare },
    { label: "চেম্বার সেটিংস ও টিম", href: "/chamber/settings", icon: Building2 },
  ];

  const legalTools = [
    { label: "দলিল ও খতিয়ান চেইন অডিট", href: "/khatian-audit", icon: Layers },
    { label: "এআই জেরা ও ট্রায়াল ড্রিল", href: "/cross-exam", icon: Swords },
    { label: "মক্কেল অটোমেটেড নোটিফিকেশন", href: "/client-notify", icon: MessageSquare },
    { label: "কোর্ট ফি ক্যালকুলেটর", href: "/court-fee", icon: Calculator },
    { label: "কনফ্লিক্ট অফ ইন্টারেস্ট", href: "/conflict-check", icon: UserCheck },
    { label: "সুপ্রিম কোর্ট নজির (Precedents)", href: "/research", icon: BookOpen },
    { label: "চুক্তিপত্র ও দলিল অডিট", href: "/contract-review", icon: FileSearch },
    { label: "মক্কেল ট্রাস্ট লেজার (IOLTA)", href: "/billing/trust", icon: CreditCard },
    { label: "মক্কেল পোর্টাল ভিউ", href: "/portal", icon: ExternalLink },
    { label: "অনলাইন ইনটেক ফর্ম", href: "/intake", icon: FileText },
  ];

  const bottomNav = [
    { label: "বিলিং ও সাবস্ক্রিপশন", href: "/billing", icon: CreditCard },
    { label: "চেম্বার অ্যানালিটিক্স", href: "/analytics", icon: TrendingUp },
    { label: "আইনজীবী প্রোফাইল", href: "/settings", icon: Settings },
    { label: "অ্যাডমিন গভর্ন্যান্স", href: "/admin", icon: Shield },
    { label: "সুপার অ্যাডমিন কনসোল", href: "/super-admin", icon: ShieldAlert, highlight: true },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && (pathname === "/" || pathname === "/dashboard")) return true;
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 hidden lg:flex flex-col justify-between min-h-[calc(100vh-65px)] select-none">
      <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
        {/* Quick New Case CTA */}
        <div>
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন মামলা শুরু করুন</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-3">
            প্রধান মেনু
          </span>
          <nav className="mt-2 space-y-0.5">
            {mainNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-indigo-700" : "text-slate-600"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Legal Tools Accordion */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setToolsOpen(!toolsOpen)}
            className="w-full flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-800 transition"
          >
            <span>বাংলাদেশ লিগ্যাল টুলস</span>
            {toolsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {toolsOpen && (
            <nav className="mt-2 space-y-0.5">
              {legalTools.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      active
                        ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-indigo-700" : "text-slate-600"}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Governance & SaaS Console */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-3">
            ব্যবস্থাপনা ও অডিট
          </span>
          <nav className="mt-2 space-y-0.5">
            {bottomNav.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200"
                      : item.highlight
                      ? "text-purple-700 bg-purple-50/60 hover:bg-purple-100/60 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      active
                        ? "text-indigo-700"
                        : item.highlight
                        ? "text-purple-600"
                        : "text-slate-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Chamber Status Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            রপ
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-slate-900 block truncate">
              রহমান অ্যান্ড পার্টনার্স
            </span>
            <span className="text-[10px] text-emerald-700 font-medium block">
              ● PRO চেম্বার সক্রিয়
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
