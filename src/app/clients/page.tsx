"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ClientRecord } from "@/lib/types/legalSuite";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Client Form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nid, setNid] = useState("");
  const [address, setAddress] = useState("");
  const [initialRetainer, setInitialRetainer] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setClients(json.data);
      }
    } catch (e) {
      console.error("Failed to load clients", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          nidOrPassport: nid,
          address,
          initialRetainer: Number(initialRetainer) || 0,
          notes,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setShowAddModal(false);
        setFullName("");
        setPhone("");
        setEmail("");
        setNid("");
        setAddress("");
        setInitialRetainer("");
        setNotes("");
        fetchClients();
      } else {
        alert(json.error?.messageBn || "মক্কেল সংরক্ষণ ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter((c) =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    (c.nidOrPassport && c.nidOrPassport.includes(searchQuery))
  );

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
              <Users className="w-4 h-4" />
              <span>Client Onboarding & CRM (মডিউল ১)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              মক্কেল প্রোফাইল ও ডিরেক্টরি
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              চেম্বারের সকল মক্কেলের পরিচিতি, এনআইডি, যোগাযোগের ইতিহাস ও রিটেইনার ব্যালেন্স পর্যবেক্ষণ করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/intake"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>অনলাইন ইনটেক ফর্ম লিংক</span>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ নতুন মক্কেল যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">মোট নথিবদ্ধ মক্কেল</p>
              <p className="text-lg font-black text-slate-900">{clients.length} জন</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">মোট ট্রাস্ট রিটেইনার ব্যালেন্স</p>
              <p className="text-lg font-black text-slate-900">
                ৳ {clients.reduce((acc, c) => acc + (c.retainerBalance || 0), 0).toLocaleString("bn-BD")}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">এথিক্স ও গোপনীয়তা যাচাই</p>
              <p className="text-xs font-bold text-emerald-600">১০০% সংরক্ষিত (Privileged)</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="মক্কেলের নাম, মোবাইল নম্বর বা এনআইডি দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Clients Table / Cards */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">লোড হচ্ছে...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Users className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
            <p className="text-xs font-bold text-slate-600">কোনো মক্কেল পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        {client.fullName}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{client.phone}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      সক্রিয় মক্কেল
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    {client.email && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.nidOrPassport && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>NID: {client.nidOrPassport}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">রিটেইনার ব্যালেন্স</span>
                    <span className="font-bold text-emerald-600 text-xs">
                      ৳ {(client.retainerBalance || 0).toLocaleString("bn-BD")}
                    </span>
                  </div>
                  <Link
                    href={`/portal?phone=${client.phone}`}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-[11px] hover:bg-indigo-100 transition flex items-center gap-1"
                  >
                    <span>পোর্টাল ভিউ</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Client */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>নতুন মক্কেল অনবোর্ডিং (Client Registration)</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddClient} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    মক্কেলের পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="যেমন: মো. আব্দুল করিম"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ইমেইল (ঐচ্ছিক)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@mail.com"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      এনআইডি বা পাসপোর্ট নম্বর
                    </label>
                    <input
                      type="text"
                      value={nid}
                      onChange={(e) => setNid(e.target.value)}
                      placeholder="জাতীয় পরিচয়পত্র নম্বর"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      প্রাথমিক রিটেইনার ফি (টাকা)
                    </label>
                    <input
                      type="number"
                      value={initialRetainer}
                      onChange={(e) => setInitialRetainer(e.target.value)}
                      placeholder="যেমন: ২৫০০০"
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    স্থায়ী ও যোগাযোগের ঠিকানা
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="গ্রাম/মহল্লা, থানা, জেলা..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    চেম্বারের অভ্যন্তরীণ নোট (গোপনীয়)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="মক্কেলের রেফারেন্স বা বিশেষ নির্দেশনা..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                  >
                    {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "মক্কেল সংরক্ষণ করুন"}
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
