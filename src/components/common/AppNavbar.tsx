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

  const navLinks = [
    {
      href: "/dashboard",
      label: "মামলার ফাইল",
      icon: FolderOpen,
      isActive: pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/case"),
    },
    {
      href: "/calendar",
      label: "কজলিস্ট ও ক্যালেন্ডার",
      icon: Calendar,
      isActive: pathname.startsWith("/calendar"),
    },
    {
      href: "/billing",
      label: "বিলিং ও সাবস্ক্রিপশন",
      icon: CreditCard,
      isActive: pathname.startsWith("/billing"),
    },
    {
      href: "/settings",
      label: "চেম্বার সেটিংস",
      icon: Settings,
      isActive: pathname.startsWith("/settings"),
    },
  ];

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-slate-950 dark:to-indigo-950 text-amber-400 flex items-center justify-center shadow-xs border border-indigo-700/30 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-950 dark:text-white tracking-tight">
                  LegalAI BD
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                অ্যাডভোকেট ডিজিটাল চেম্বার পোর্টাল
              </p>
            </div>
          </Link>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  link.isActive
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {user.isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>অ্যাডমিন</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Command Palette Hint, Theme, User Avatar, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Shortcut Pill */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true })
              );
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition cursor-pointer"
            title="সার্চ ও কমান্ড প্যালেট (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>খুঁজুন</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700">
              Ctrl+K
            </kbd>
          </button>

          <ThemeToggle />

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="প্রোফাইল ও চেম্বার সেটিংস"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-800">
                {user.name.slice(0, 2)}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {user.courtStation} •{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {user.plan || "PRO"}
                  </span>
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="লগআউট করুন"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
