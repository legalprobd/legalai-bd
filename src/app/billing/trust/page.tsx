"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { TrustAccountRecord } from "@/lib/types/legalSuite";
import {
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Building2,
  FileCheck2,
  Coins,
  Receipt,
  Info,
} from "lucide-react";

export default function TrustAccountingPage() {
  const [accounts, setAccounts] = useState<TrustAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [txType, setTxType] = useState<"DEPOSIT" | "DISBURSEMENT">("DEPOSIT");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [voucherRef, setVoucherRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/billing/trust");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setAccounts(json.data);
        if (json.data.length > 0 && !selectedAccountId) {
          setSelectedAccountId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load trust accounts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || !amount || !purpose) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/billing/trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trustAccountId: selectedAccountId,
          type: txType,
          amount: Number(amount),
          purpose,
          voucherRef,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setShowModal(false);
        setAmount("");
        setPurpose("");
        setVoucherRef("");
        fetchAccounts();
      } else {
        alert(json.error?.messageBn || "লেনদেন সংরক্ষণ ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalHeldInTrust = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Trust Accounting & IOLTA Compliance (মডিউল ১৩)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              মক্কেল রিটেইনার ও ট্রাস্ট ফান্ড হিসাবরক্ষণ
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              মক্কেলের মামলার খরচের অগ্রিম অর্থ চেম্বারের নিজস্ব আয়ের সাথে না মিশিয়ে আলাদা ট্রাস্ট লেজারে স্বচ্ছভাবে পরিচালনা ও ভাউচার ট্র্যাকিং।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/billing"
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition"
            >
              সাধারণ বিলিংয়ে ফিরুন
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ ট্রাস্ট লেনদেন লিপিবদ্ধ করুন</span>
            </button>
          </div>
        </div>

        {/* Top Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl shadow-sm">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
              মোট ট্রাস্ট ব্যালেন্স (IOLTA Escrow)
            </span>
            <span className="text-3xl font-black text-amber-300 block mt-2">
              ৳ {totalHeldInTrust.toLocaleString("bn-BD")}
            </span>
            <span className="text-[11px] text-indigo-200 mt-1 block">
              আইনজীবীর ব্যক্তিগত আয় নয়, মক্কেলের আমানত
            </span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              সর্বমোট গৃহীত রিটেইনার ডিপোজিট
            </span>
            <span className="text-2xl font-black text-emerald-600">
              ৳ {accounts.reduce((acc, a) => acc + (a.totalDeposited || 0), 0).toLocaleString("bn-BD")}
            </span>
            <span className="text-[11px] text-slate-500">ব্যাংক ট্রাস্ট ডিপোজিট স্লিপ সংরক্ষিত</span>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              কোর্ট ফি ও প্রসেস বাবদ খরচ (Disbursed)
            </span>
            <span className="text-2xl font-black text-rose-600">
              ৳ {accounts.reduce((acc, a) => acc + (a.totalDisbursed || 0), 0).toLocaleString("bn-BD")}
            </span>
            <span className="text-[11px] text-slate-500">ভাউচারযুক্ত সমন্বিত খরচ</span>
          </div>
        </div>

        {/* Ledger */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">লোড হচ্ছে...</div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  মক্কেল ট্রাস্ট লেজার ও লেনদেনের ইতিহাস
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  মক্কেল: <strong>{selectedAccount?.clientName || "আব্দুল করিম"}</strong> (ব্যালেন্স: ৳ {(selectedAccount?.balance || 0).toLocaleString("bn-BD")})
                </p>
              </div>

              {accounts.length > 1 && (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.clientName} (৳ {acc.balance.toLocaleString("bn-BD")})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[11px]">
                    <th className="py-3 px-3">তারিখ</th>
                    <th className="py-3 px-3">লেনদেনের ধরন</th>
                    <th className="py-3 px-3">বিবরণ ও উদ্দেশ্য</th>
                    <th className="py-3 px-3">ভাউচার রেফারেন্স</th>
                    <th className="py-3 px-3 text-right">টাকার পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedAccount?.transactions?.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(tx.date).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            tx.type === "DEPOSIT"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-rose-50 text-rose-600 border border-rose-200"
                          }`}
                        >
                          {tx.type === "DEPOSIT" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{tx.type === "DEPOSIT" ? "রিটেইনার জমা" : "খরচ কর্তন"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-900 font-semibold">
                        {tx.purpose}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {tx.voucherRef || "—"}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-black ${
                          tx.type === "DEPOSIT" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {tx.type === "DEPOSIT" ? "+" : "-"} ৳ {tx.amount.toLocaleString("bn-BD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Transaction */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>ট্রাস্ট অ্যাকাউন্টে লেনদেন লিপিবদ্ধকরণ</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    লেনদেনের ধরন *
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as "DEPOSIT" | "DISBURSEMENT")}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold"
                  >
                    <option value="DEPOSIT">ডিপোজিট / মক্কেলের অগ্রিম জমা (Deposit into Escrow)</option>
                    <option value="DISBURSEMENT">খরচ কর্তন / আদালত ফি প্রদান (Disbursement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    টাকার পরিমাণ (টাকায়) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="যেমন: ১৫০০০"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    লেনদেনের উদ্দেশ্য বা বিবরণ *
                  </label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="যেমন: আরজি কোর্ট ফি ও প্রসেস সার্ভার ব্যয়..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ভাউচার বা মানি রিসিট নম্বর
                  </label>
                  <input
                    type="text"
                    value={voucherRef}
                    onChange={(e) => setVoucherRef(e.target.value)}
                    placeholder="VR-2026-XXXX"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                  >
                    {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "ট্রানজেকশন যুক্ত করুন"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
