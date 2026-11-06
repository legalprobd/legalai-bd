"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Building,
  KeyRound,
  FileSignature,
  ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Scale,
  Save,
  Loader2,
} from "lucide-react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [uploadingLetterhead, setUploadingLetterhead] = useState(false);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [barCouncilId, setBarCouncilId] = useState("");
  const [chamberName, setChamberName] = useState("");
  const [courtStation, setCourtStation] = useState("");
  const [digitalSignatureUrl, setDigitalSignatureUrl] = useState<string | null>(null);
  const [chamberLetterheadUrl, setChamberLetterheadUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/profile");
      const json = await res.json();
      if (json.ok && json.data) {
        const u = json.data;
        setFullName(u.fullName || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setBarCouncilId(u.barCouncilId || "");
        setChamberName(u.chamberName || "");
        setCourtStation(u.courtStation || "ঢাকা জজ কোর্ট");
        setDigitalSignatureUrl(u.digitalSignatureUrl || null);
        setChamberLetterheadUrl(u.chamberLetterheadUrl || null);
        setIsAdmin(Boolean(u.isAdmin));
      }
    } catch {
      setMessage({ type: "error", text: "প্রোফাইল লোড করতে ব্যর্থ হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setMessage(null);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          barCouncilId,
          chamberName,
          courtStation,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessage({ type: "success", text: "প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে।" });
      } else {
        setMessage({ type: "error", text: json.error?.messageBn || "সংরক্ষণ ব্যর্থ হয়েছে।" });
      }
    } catch {
      setMessage({ type: "error", text: "সার্ভার এরর। অনুগ্রহ করে আবার চেষ্টা করুন।" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileUpload = async (file: File, type: "signature" | "letterhead") => {
    try {
      if (type === "signature") setUploadingSignature(true);
      else setUploadingLetterhead(true);
      setMessage(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.ok && json.data) {
        if (type === "signature") {
          setDigitalSignatureUrl(json.data.url);
          setMessage({ type: "success", text: "ডিজিটাল স্বাক্ষর সফলভাবে আপলোড হয়েছে।" });
        } else {
          setChamberLetterheadUrl(json.data.url);
          setMessage({ type: "success", text: "চেম্বার লেটারহেড সফলভাবে আপলোড হয়েছে।" });
        }
      } else {
        setMessage({ type: "error", text: json.error?.messageBn || "আপলোড ব্যর্থ হয়েছে।" });
      }
    } catch {
      setMessage({ type: "error", text: "ছবি আপলোডে সমস্যা হয়েছে।" });
    } finally {
      if (type === "signature") setUploadingSignature(false);
      else setUploadingLetterhead(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" });
      return;
    }

    try {
      setChangingPassword(true);
      setMessage(null);
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessage({ type: "success", text: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: json.error?.messageBn || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।" });
      }
    } catch {
      setMessage({ type: "error", text: "সার্ভার এরর। আবার চেষ্টা করুন।" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50  flex flex-col font-sans">
        <AppNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      {/* Global Unified Navbar */}
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        {/* Main Container */}
        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Page Title Card */}
        <div className="bg-white  rounded-3xl p-6 border border-slate-200/80  shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50  text-indigo-600  border border-indigo-200  flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 ">
                অ্যাডভোকেট প্রোফাইল ও চেম্বার সেটিংস
              </h1>
              <p className="text-xs text-slate-500  mt-0.5">
                আদালতের নথিতে প্রদর্শিত তথ্য, ডিজিটাল স্বাক্ষর ও নিরাপত্তা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs font-bold text-emerald-700  bg-emerald-50  border border-emerald-200  px-3.5 py-2 rounded-xl hover:bg-emerald-100 transition flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>অ্যাডমিন প্যানেল</span>
              </Link>
            )}
            <span className="text-xs font-medium text-slate-500  bg-slate-100  px-3.5 py-2 rounded-xl border border-slate-200 ">
              {email}
            </span>
          </div>
        </div>

        {/* Notification Toast */}
        {message && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-sm transition ${
              message.type === "success"
                ? "bg-emerald-50  border-emerald-300  text-emerald-900 "
                : "bg-rose-50  border-rose-300  text-rose-900 "
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600  shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600  shrink-0" />
            )}
            <span className="font-semibold text-xs">{message.text}</span>
          </div>
        )}

        {/* Section 1: Advocate Profile Information */}
        <div className="bg-white  rounded-3xl border border-slate-200/80  shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100  bg-slate-50/50  flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600 " />
              <h2 className="text-sm font-bold text-slate-800 ">অ্যাডভোকেট ও চেম্বার পরিচিতি</h2>
            </div>
            <span className="text-xs text-slate-500 ">আইনজীবী হিসেবে প্রস্তুতকৃত নথিতে ব্যবহৃত হবে</span>
          </div>

          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700  mb-1.5">
                  পূর্ণ নাম (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300  rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50  text-slate-900 "
                  placeholder="যেমন: ব্যারিস্টার এম. এ. রহমান"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700  mb-1.5">
                  বার কাউন্সিল সনদ নং (Bar Council ID)
                </label>
                <input
                  type="text"
                  value={barCouncilId}
                  onChange={(e) => setBarCouncilId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300  rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50  text-slate-900 "
                  placeholder="যেমন: BC/DH/2014/8942"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700  mb-1.5">
                  মোবাইল নম্বর (Phone)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300  rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50  text-slate-900 "
                  placeholder="যেমন: 01711000000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700  mb-1.5">
                  আইন চেম্বারের নাম (Chamber Name)
                </label>
                <input
                  type="text"
                  value={chamberName}
                  onChange={(e) => setChamberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300  rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50  text-slate-900 "
                  placeholder="যেমন: রহমান অ্যান্ড পার্টনার্স লিগ্যাল চেম্বার"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700  mb-1.5">
                  কর্মস্থল আদালত (Court Station)
                </label>
                <input
                  type="text"
                  value={courtStation}
                  onChange={(e) => setCourtStation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300  rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50  text-slate-900 "
                  placeholder="যেমন: ঢাকা জজ কোর্ট ও সুপ্রিম কোর্ট"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>তথ্য সংরক্ষণ করুন</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Digital Signatures & Chamber Letterhead */}
        <div className="bg-white  rounded-3xl border border-slate-200/80  shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100  bg-slate-50/50  flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-indigo-600 " />
              <h2 className="text-sm font-bold text-slate-800 ">ডিজিটাল স্বাক্ষর ও চেম্বার লেটারহেড</h2>
            </div>
            <span className="text-xs text-slate-500 ">স্বয়ংক্রিয় কোর্ট পিটিশন ও ওকালতনামায় ব্যবহারের জন্য</span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Digital Signature */}
            <div className="border border-slate-200  rounded-2xl p-5 bg-slate-50/50  flex flex-col items-center text-center">
              <span className="text-xs font-bold text-slate-800  mb-2 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-indigo-600 " />
                ডিজিটাল স্বাক্ষর (Digital Signature)
              </span>

              <div className="w-full h-32 border-2 border-dashed border-slate-300  rounded-xl bg-white  flex items-center justify-center overflow-hidden mb-3">
                {digitalSignatureUrl ? (
                  <img
                    src={digitalSignatureUrl}
                    alt="Digital Signature"
                    className="max-h-full max-w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-slate-400">স্বাক্ষরের ছবি আপলোড করা হয়নি</span>
                )}
              </div>

              <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingSignature ? "আপলোড হচ্ছে..." : "স্বাক্ষর আপলোড করুন (PNG/JPG)"}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "signature");
                  }}
                  disabled={uploadingSignature}
                />
              </label>
            </div>

            {/* Chamber Letterhead */}
            <div className="border border-slate-200  rounded-2xl p-5 bg-slate-50/50  flex flex-col items-center text-center">
              <span className="text-xs font-bold text-slate-800  mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600 " />
                চেম্বার লেটারহেড ব্যানার (Letterhead)
              </span>

              <div className="w-full h-32 border-2 border-dashed border-slate-300  rounded-xl bg-white  flex items-center justify-center overflow-hidden mb-3">
                {chamberLetterheadUrl ? (
                  <img
                    src={chamberLetterheadUrl}
                    alt="Chamber Letterhead"
                    className="max-h-full max-w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-slate-400">লেটারহেড ব্যানার আপলোড করা হয়নি</span>
                )}
              </div>

              <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingLetterhead ? "আপলোড হচ্ছে..." : "লেটারহেড আপলোড করুন"}</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "letterhead");
                  }}
                  disabled={uploadingLetterhead}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Change Password */}
        <div className="bg-white  rounded-3xl border border-slate-200/80  shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100  bg-slate-50/50  flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600 " />
              <h2 className="text-sm font-bold text-slate-800 ">পাসওয়ার্ড পরিবর্তন (Security)</h2>
            </div>
            <span className="text-xs text-slate-500 ">আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করুন</span>
          </div>

          <form onSubmit={handleChangePassword} className="p-6 sm:p-8 space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-700  mb-1.5">
                বর্তমান পাসওয়ার্ড (Current Password)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300  rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50  text-slate-900 "
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700  mb-1.5">
                নতুন পাসওয়ার্ড (New Password)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300  rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50  text-slate-900 "
                placeholder="কমপক্ষে ৬ অক্ষর"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700  mb-1.5">
                নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm New Password)
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300  rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50  text-slate-900 "
                placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900  hover:bg-slate-800  text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {changingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>পাসওয়ার্ড আপডেট করুন</span>
            </button>
          </form>
        </div>
      </main>
      </div>
    </div>
  );
}
