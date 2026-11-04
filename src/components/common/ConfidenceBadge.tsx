import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

export function ConfidenceBadge({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) {
  if (level === "HIGH") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        উচ্চ নির্ভরতা (High Confidence)
      </span>
    );
  }

  if (level === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
        <AlertCircle className="w-3 h-3 text-blue-600" />
        মধ্যম নির্ভরতা (Medium)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
      <HelpCircle className="w-3 h-3 text-amber-600" />
      যাচাই করুন (Low / Verification Needed)
    </span>
  );
}
