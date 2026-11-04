"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import {
  Search,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Shield,
  CreditCard,
  Sun,
  Moon,
  FolderOpen,
} from "lucide-react";

interface CaseItem {
  id: string;
  title: string;
  caseNumber?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState<CaseItem[]>([]);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch cases for search when opened
  useEffect(() => {
    if (open) {
      fetch("/api/cases")
        .then((res) => res.json())
        .then((res) => {
          if (res.ok && Array.isArray(res.data)) {
            setCases(
              res.data.map((c: any) => ({
                id: c.id,
                title: c.title || "নামবিহীন মামলা",
                caseNumber: c.caseNumber || "",
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      data-testid="command-palette-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <Command.Input
              data-testid="command-palette-input"
              value={search}
              onValueChange={setSearch}
              placeholder="মেনু খুঁজুন বা মামলা অনুসন্ধান করুন... (Ctrl+K)"
              className="w-full py-4 text-base bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              কোনো ফলাফল পাওয়া যায়নি।
            </Command.Empty>

            <Command.Group
              heading="ন্যাভিগেশন"
              className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider"
            >
              <Command.Item
                data-testid="cmd-dashboard"
                value="ড্যাশবোর্ড Dashboard"
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>ড্যাশবোর্ড (Dashboard)</span>
              </Command.Item>

              <Command.Item
                data-testid="cmd-intake"
                value="নতুন মামলা তৈরি New Case Intake"
                onSelect={() => runCommand(() => router.push("/intake"))}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>নতুন মামলা তৈরি (New Case Intake)</span>
              </Command.Item>

              <Command.Item
                data-testid="cmd-settings"
                value="প্রোফাইল ও চেম্বার সেটিংস Settings"
                onSelect={() => runCommand(() => router.push("/settings"))}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>প্রোফাইল ও চেম্বার সেটিংস (Settings)</span>
              </Command.Item>

              <Command.Item
                data-testid="cmd-admin"
                value="অ্যাডমিন প্যানেল Admin Panel"
                onSelect={() => runCommand(() => router.push("/admin"))}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>অ্যাডমিন প্যানেল (Admin Panel)</span>
              </Command.Item>

              <Command.Item
                data-testid="cmd-billing"
                value="বিলিং ও সাবস্ক্রিপশন Billing"
                onSelect={() => runCommand(() => router.push("/billing"))}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>বিলিং ও সাবস্ক্রিপশন (Billing)</span>
              </Command.Item>
            </Command.Group>

            <Command.Group
              heading="থিম নিয়ন্ত্রণ"
              className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider mt-2"
            >
              <Command.Item
                data-testid="cmd-theme-toggle"
                value="থিম পরিবর্তন Theme Dark Light"
                onSelect={() =>
                  runCommand(() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  )
                }
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
              >
                {resolvedTheme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>লাইট মোড চালু করুন (Switch to Light Mode)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-600" />
                    <span>ডার্ক মোড চালু করুন (Switch to Dark Mode)</span>
                  </>
                )}
              </Command.Item>
            </Command.Group>

            {filteredCases.length > 0 && (
              <Command.Group
                heading="মামলাসমূহ"
                className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider mt-2"
              >
                {filteredCases.slice(0, 5).map((c) => (
                  <Command.Item
                    key={c.id}
                    data-testid={`cmd-case-${c.id}`}
                    value={`${c.title} ${c.caseNumber || ""} ${c.id}`}
                    onSelect={() =>
                      runCommand(() => router.push(`/case/${c.id}`))
                    }
                    className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FolderOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </div>
                    {c.caseNumber && (
                      <span className="text-xs text-slate-400 shrink-0 ml-2">
                        {c.caseNumber}
                      </span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
