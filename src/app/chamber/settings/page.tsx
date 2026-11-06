"use client";

import React, { useState, useEffect } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  Building2,
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Link as LinkIcon,
  Mail,
  Copy,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";

interface ChamberUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  barCouncilId?: string;
  courtStation: string;
  role: string;
  plan: string;
  createdAt: string;
}

export default function ChamberSettingsPage() {
  const [members, setMembers] = useState<ChamberUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/chamber/users");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setMembers(json.data);
      }
    } catch {
      console.error("Failed to load chamber members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    try {
      setIsInviting(true);
      setMessage(null);
      const res = await fetch("/api/chamber/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, fullName: inviteName }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessage({ text: json.messageBn || "জুনিয়রকে সফলভাবে যুক্ত করা হয়েছে।", isError: false });
        setInviteEmail("");
        setInviteName("");
        fetchMembers();
      } else {
        setMessage({ text: json.error?.messageBn || "ইনভাইটেশন ব্যর্থ হয়েছে।", isError: true });
      }
    } catch {
      setMessage({ text: "সার্ভার এরর। আবার চেষ্টা করুন।", isError: true });
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/login?invite=chamber-rahman-associates`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
      <AppNavbar />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 w-full overflow-x-hidden p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4 text-indigo-700" />
                <span>Chamber & Multi-Advocate System (মডিউল ৩)</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                চেম্বার সেটিংস ও অ্যাসোসিয়েটস টিম ম্যানেজমেন্ট
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                চেম্বার প্রধান হিসেবে জুনিয়র আইনজীবী ও ক্লার্ক যুক্ত করুন, পারমিশন রোল নির্ধারণ করুন এবং মামলা ডেলিগেশন পর্যবেক্ষণ করুন।
              </p>
            </div>

            <button
              onClick={copyInviteLink}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? "ইনভাইট লিংক কপি হয়েছে!" : "চেম্বার ইনভাইট লিংক কপি করুন"}</span>
            </button>
          </div>

          {/* Feedback message */}
          {message && (
            <div
              className={`my-4 p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                message.isError
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {message.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-start">
            {/* Invite Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserPlus className="w-4 h-4 text-indigo-700" />
                <span>নতুন জুনিয়র বা সহযোগী আইনজীবী যুক্ত করুন</span>
              </h2>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সহযোগী আইনজীবীর পূর্ণ নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="যেমন: অ্যাডভোকেট মো. তানভীর আহমেদ"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইমেইল ঠিকানা *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="junior@demo.bd"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                  />
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>জুনিয়র অ্যাডভোকেট রেস্ট্রিকশন পলিসি:</span>
                  </div>
                  <p>
                    • জুনিয়ররা কোনো মামলা স্থায়ীভাবে ডিলিট করতে পারবেন না।<br />
                    • চেম্বারের রিটেইনার বা বিলিং ডাটা দেখতে পারবেন না।<br />
                    • জুনিয়রের তৈরি সব মামলা স্বয়ংক্রিয়ভাবে চেম্বারের আওতাভুক্ত থাকবে।
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail || !inviteName}
                  className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-300 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isInviting ? "যোগ করা হচ্ছে..." : "+ চেম্বারে যুক্ত করুন"}</span>
                </button>
              </form>
            </div>

            {/* Members Directory */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-700" />
                  <span>বর্তমান চেম্বার সদস্য তালিকা (Team Roster)</span>
                </h2>
                <span className="text-xs text-slate-500 font-semibold">{members.length} জন সক্রিয়</span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400">সদস্য তালিকা লোড হচ্ছে...</div>
              ) : members.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">কোনো সদস্য পাওয়া যায়নি।</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">নাম ও পরিচয়</th>
                        <th className="py-3 px-4">বার সনদ ও কোর্ট</th>
                        <th className="py-3 px-4">রোল</th>
                        <th className="py-3 px-4">পারমিশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{m.fullName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{m.email}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-700 font-medium block">{m.courtStation}</span>
                            <span className="text-[10px] text-slate-400">{m.barCouncilId || "সনদ প্রক্রিয়াধীন"}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                m.role === "JUNIOR"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              }`}
                            >
                              {m.role === "JUNIOR" ? "জুনিয়র অ্যাসোসিয়েট" : "চেম্বার প্রধান (Owner)"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[11px] text-slate-600 font-semibold">
                              {m.role === "JUNIOR" ? "সীমাবদ্ধ (Restricted)" : "পূর্ণ নিয়ন্ত্রণ (Full Admin)"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
