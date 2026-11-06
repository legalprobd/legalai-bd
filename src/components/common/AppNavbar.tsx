"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  FolderOpen,
  Calendar,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  Search,
  Sparkles,
  Users,
  CheckSquare,
  Wrench,
  ChevronDown,
  Calculator,
  ShieldAlert,
  BookOpen,
  TrendingUp,
  FileSearch,
  Building2,
  FileText,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

interface AppNavbarProps {
  currentUser?: {
    name: string;
    email: string;
    plan?: string;
    isAdmin?: boolean;
    courtStation?: string;
    chamberName?: string;
  };
}

export function AppNavbar({ currentUser: initialUser }: AppNavbarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState(
    initialUser || {
      name: "ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)",
      email: "advocate@demo.bd",
      plan: "PRO",
      isAdmin: true,
      courtStation: "ঢাকা জজ কোর্ট ও সুপ্রিম কোর্ট",
      chamberName: "রহমান অ্যান্ড অ্যাসোসিয়েটস",
    }
  );

  useEffect(() => {
    if (!initialUser) {
      fetch("/api/auth/session")
        .then((res) => res.json())
        .then((data) => {
          if (data?.user?.name) {
            setUser({
              name: data.user.name,
              email: data.user.email || "",
              plan: data.user.plan || "PRO",
              isAdmin: Boolean(data.user.isAdmin),
              courtStation: data.user.courtStation || "ঢাকা জজ কোর্ট ও সুপ্রিম কোর্ট",
              chamberName: data.user.chamberName || "ব্যক্তিগত চেম্বার",
            });
          }
        })
        .catch(() => {});
    }
  }, [initialUser]);

  const [showToolsMenu, setShowToolsMenu] = useState(false);

  const navLinks = [
    {
      href: "/dashboard",
      label: "মামলার ফাইল",
      icon: FolderOpen,
      isActive: pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/case"),
    },
    {
      href: "/calendar",
      label: "কজলিস্ট",
      icon: Calendar,
      isActive: pathname.startsWith("/calendar"),
    },
    {
      href: "/clients",
      label: "মক্কেল",
      icon: Users,
      isActive: pathname.startsWith("/clients"),
    },
    {
      href: "/tasks",
      label: "টাস্ক",
      icon: CheckSquare,
      isActive: pathname.startsWith("/tasks"),
    },
    {
      href: "/billing",
      label: "বিলিং",
      icon: CreditCard,
      isActive: pathname.startsWith("/billing"),
    },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 text-amber-300 flex items-center justify-center shadow-xs border border-indigo-600 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight">
                  LegalAI BD
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                অ্যাডভোকেট ডিজিটাল চেম্বার পোর্টাল
              </p>
            </div>
          </Link>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  link.isActive
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Legal Tools Mega Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowToolsMenu((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                pathname.startsWith("/court-fee") ||
                pathname.startsWith("/conflict-check") ||
                pathname.startsWith("/research") ||
                pathname.startsWith("/analytics") ||
                pathname.startsWith("/contract-review") ||
                pathname.startsWith("/portal") ||
                pathname.startsWith("/intake")
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>লিগ্যাল টুলস</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showToolsMenu && (
              <div
                className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs"
                onClick={() => setShowToolsMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  আইনি অটোমেশন ও ক্যালকুলেটর
                </div>

                <Link
                  href="/court-fee"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <Calculator className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="font-bold">কোর্ট ফি ক্যালকুলেটর</div>
                    <div className="text-[10px] text-slate-400">Suits Valuation & Court Fees</div>
                  </div>
                </Link>

                <Link
                  href="/conflict-check"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-bold">এথিক্স ও কনফ্লিক্ট চেকার</div>
                    <div className="text-[10px] text-slate-400">বার কাউন্সিল স্বার্থের সংঘাত চেক</div>
                  </div>
                </Link>

                <Link
                  href="/research"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-bold">আইনি নজির (DLR/BLC)</div>
                    <div className="text-[10px] text-slate-400">সুপ্রিম কোর্টের নজির লাইব্রেরি</div>
                  </div>
                </Link>

                <Link
                  href="/contract-review"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <FileSearch className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-bold">চুক্তিপত্র রিস্ক রিভিউ</div>
                    <div className="text-[10px] text-slate-400">এআই লুপহোল ও রিস্ক স্ক্যানার</div>
                  </div>
                </Link>

                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 border-t border-slate-100 pt-2">
                  হিসাব ও গ্রাহক সেবা
                </div>

                <Link
                  href="/analytics"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-bold">চেম্বার অ্যানালিটিক্স</div>
                    <div className="text-[10px] text-slate-400">আর্থিক পূর্বাভাস ও উইন রেট</div>
                  </div>
                </Link>

                <Link
                  href="/billing/trust"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <Building2 className="w-4 h-4 text-cyan-500" />
                  <div>
                    <div className="font-bold">ট্রাস্ট ও রিটেইনার ফান্ড</div>
                    <div className="text-[10px] text-slate-400">IOLTA আমানত হিসাবরক্ষণ</div>
                  </div>
                </Link>

                <Link
                  href="/portal"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <Users className="w-4 h-4 text-teal-500" />
                  <div>
                    <div className="font-bold">মক্কেল সেবা পোর্টাল</div>
                    <div className="text-[10px] text-slate-400">ক্লায়েন্ট সেলফ সার্ভিস ভিউ</div>
                  </div>
                </Link>

                <Link
                  href="/intake"
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <FileText className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-bold">অনলাইন ইনটেক ফর্ম</div>
                    <div className="text-[10px] text-slate-400">পাবলিক কেস সাবমিশন ফরম</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

            {user.isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-semibold"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>অ্যাডমিন</span>
            </Link>
          )}

          <Link
            href="/super-admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              pathname.startsWith("/super-admin")
                ? "bg-purple-700 text-white shadow-xs font-bold"
                : "text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 font-semibold"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>সুপার অ্যাডমিন</span>
          </Link>
        </nav>

        {/* Right Section: Command Palette Hint, User Avatar, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut Pill */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
              );
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/70 transition cursor-pointer"
            title="সার্চ ও কমান্ড প্যালেট (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>খুঁজুন</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-300">
              Ctrl+K
            </kbd>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition"
              title="প্রোফাইল ও চেম্বার সেটিংস"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs border border-indigo-200">
                {user.name.slice(0, 2)}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <p className="font-bold text-slate-900 truncate max-w-[150px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[150px]">
                  {user.courtStation} •{" "}
                  <span className="text-emerald-600 font-semibold">
                    {user.plan || "PRO"}
                  </span>
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="লগআউট করুন"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
