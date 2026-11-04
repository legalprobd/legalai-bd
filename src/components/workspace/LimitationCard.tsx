"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert, Calendar, RefreshCw } from "lucide-react";
import { LIMITATION_RULES, LimitationCalculation, LimitationRule } from "@/lib/law/limitation";

interface LimitationCardProps {
  caseId: string;
  initialCaseType?: string | null;
  initialTriggerDate?: string | null;
  onUpdated?: (calculation: LimitationCalculation) => void;
}

export const LimitationCard: React.FC<LimitationCardProps> = ({
  caseId,
  initialCaseType,
  initialTriggerDate,
  onUpdated,
}) => {
  const [selectedCaseType, setSelectedCaseType] = useState<string>(
    initialCaseType || "CRIMINAL_FIR"
  );
  const [triggerDate, setTriggerDate] = useState<string>(
    initialTriggerDate
      ? new Date(initialTriggerDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [calculation, setCalculation] = useState<LimitationCalculation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchLimitation();
  }, [caseId]);

  const fetchLimitation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cases/${caseId}/limitation`);
      const json = await res.json();
      if (json.ok && json.data?.calculation) {
        setCalculation(json.data.calculation);
        setSelectedCaseType(json.data.calculation.caseType);
        if (json.data.calculation.triggerDate) {
          setTriggerDate(json.data.calculation.triggerDate.split("T")[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load limitation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/cases/${caseId}/limitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseType: selectedCaseType,
          triggerDate: new Date(triggerDate).toISOString(),
        }),
      });
      const json = await res.json();
      if (json.ok && json.data?.calculation) {
        setCalculation(json.data.calculation);
        if (onUpdated) onUpdated(json.data.calculation);
      }
    } catch (err) {
      console.error("Failed to update limitation:", err);
    } finally {
      setSaving(false);
    }
  };

  const renderStatusBadge = () => {
    if (!calculation) return null;
    switch (calculation.status) {
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            তামাদি উত্তীর্ণ (Time-Barred)
          </span>
        );
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            জরুরি: {calculation.daysRemaining} দিন বাকি
          </span>
        );
      case "APPROACHING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            সতর্কতা: {calculation.daysRemaining} দিন বাকি
          </span>
        );
      case "SAFE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            নিরাপদ: {calculation.daysRemaining} দিন বাকি
          </span>
        );
      case "NO_DEADLINE":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5" />
            নির্দিষ্ট মেয়াদ নেই
          </span>
        );
    }
  };

  const currentRule: LimitationRule | undefined = LIMITATION_RULES[selectedCaseType];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-slate-800 transition hover:shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">আইনগত তামাদি ক্যালকুলেটর</h3>
            <p className="text-[11px] text-slate-500">The Limitation Act 1908 & বিশেষ আইন ট্র্যাকার</p>
          </div>
        </div>
        {renderStatusBadge()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            মামলার আইনি প্রকৃতি / ধারা:
          </label>
          <select
            value={selectedCaseType}
            onChange={(e) => setSelectedCaseType(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {Object.values(LIMITATION_RULES).map((rule) => (
              <option key={rule.caseType} value={rule.caseType}>
                {rule.lawBn} ({rule.sectionBn}) — {rule.periodDays > 0 ? `${rule.periodDays} দিন` : "অনির্দিষ্ট"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            ট্রিগার তারিখ ({currentRule ? currentRule.triggerEventBn : "ঘটনার তারিখ"}):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={triggerDate}
              onChange={(e) => setTriggerDate(e.target.value)}
              className="flex-1 text-xs rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "হিসাব করুন"}
            </button>
          </div>
        </div>
      </div>

      {calculation && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 p-4 rounded-b-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">প্রযোজ্য আইন ও ধারা</span>
              <span className="font-semibold text-slate-800">{calculation.lawBn}</span>
              <span className="block text-slate-600 text-[11px]">{calculation.sectionBn}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">ট্রিগার তারিখ</span>
              <span className="font-semibold text-slate-800">
                {new Date(calculation.triggerDate).toLocaleDateString("bn-BD")}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">তামাদির শেষ তারিখ</span>
              <span className="font-semibold text-slate-800">
                {calculation.deadline
                  ? new Date(calculation.deadline).toLocaleDateString("bn-BD")
                  : "নির্দিষ্ট নয়"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">অবশিষ্ট সময়</span>
              <span
                className={`font-bold ${
                  calculation.isExpired
                    ? "text-rose-600"
                    : calculation.status === "CRITICAL"
                    ? "text-red-600"
                    : "text-indigo-600"
                }`}
              >
                {calculation.daysRemaining !== null
                  ? `${calculation.daysRemaining} দিন`
                  : "অনির্দিষ্ট"}
              </span>
            </div>
          </div>

          <div className="mt-2.5 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-700">আইনগত দিকনির্দেশনা: </span>
            {calculation.notesBn}
            {calculation.isExpired && (
              <span className="block mt-1 font-semibold text-rose-600">
                * তামাদি মার্জনা পাওয়ার জন্য তামাদি আইনের ৫ ধারা (Section 5) অনুযায়ী উপযুক্ত কারণ দর্শিয়ে দরখাস্ত দাখিল করুন।
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
