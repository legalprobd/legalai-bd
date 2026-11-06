"use client";

import React, { useState } from "react";
import { HearingItem } from "@/lib/ai/schemas";
import {
  Calendar,
  Clock,
  User,
  FileText,
  PlusCircle,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Bookmark,
  Send,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

interface HearingTimelineProps {
  caseId: string;
  initialHearings: HearingItem[];
  clientPhone?: string;
  onHearingChange?: () => void;
}

export const HearingTimeline: React.FC<HearingTimelineProps> = ({
  caseId,
  initialHearings,
  clientPhone,
  onHearingChange,
}) => {
  const [hearings, setHearings] = useState<HearingItem[]>(initialHearings);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reminder modal state
  const [reminderModalHearing, setReminderModalHearing] = useState<HearingItem | null>(null);
  const [recipientPhone, setRecipientPhone] = useState(clientPhone || "01711000000");
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderChannel, setReminderChannel] = useState<"SMS" | "WHATSAPP">("SMS");
  const [sendingReminder, setSendingReminder] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openReminderModal = (h: HearingItem) => {
    const formattedDate = new Date(h.date).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setReminderModalHearing(h);
    setRecipientPhone(clientPhone || "01711000000");
    setReminderMessage(
      `বিজ্ঞ আদালত: আগামী ${formattedDate} তারিখে আপনার মামলার পরবর্তী শুনানির তারিখ ধার্য করা হয়েছে (পদক্ষেপ: ${h.purpose})। অনুগ্রহপূর্বক সকাল ১০টায় বিজ্ঞ আদালতে হাজির থাকতে অনুরোধ করা হচ্ছে। - বিজ্ঞ আইনজীবী`
    );
  };

  const handleSendReminder = async () => {
    if (!reminderModalHearing || !recipientPhone.trim() || !reminderMessage.trim()) return;
    try {
      setSendingReminder(true);
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          hearingId: reminderModalHearing.id,
          recipientPhone: recipientPhone.trim(),
          message: reminderMessage.trim(),
          channel: reminderChannel,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setToastMessage(json.messageBn || "মক্কেলকে SMS সফলভাবে পাঠানো হয়েছে");
        setReminderModalHearing(null);
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(json.error?.messageBn || "বার্তা পাঠাতে ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।");
    } finally {
      setSendingReminder(false);
    }
  };

  // Form state
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newPurpose, setNewPurpose] = useState("");
  const [newJudgeName, setNewJudgeName] = useState("");
  const [newOutcome, setNewOutcome] = useState("");
  const [newOrderSheet, setNewOrderSheet] = useState("");
  const [newNextDate, setNewNextDate] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOutcome, setEditOutcome] = useState("");
  const [editOrderSheet, setEditOrderSheet] = useState("");
  const [editNextDate, setEditNextDate] = useState("");

  const handleAddHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newPurpose.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/cases/${caseId}/hearings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date(newDate).toISOString(),
          purpose: newPurpose.trim(),
          judgeName: newJudgeName.trim() || undefined,
          outcomeBn: newOutcome.trim() || undefined,
          orderSheetBn: newOrderSheet.trim() || undefined,
          nextDate: newNextDate ? new Date(newNextDate).toISOString() : undefined,
        }),
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setHearings((prev) =>
          [...prev, json.data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
        setShowAddForm(false);
        setNewPurpose("");
        setNewJudgeName("");
        setNewOutcome("");
        setNewOrderSheet("");
        setNewNextDate("");
        if (onHearingChange) onHearingChange();
      }
    } catch (err) {
      console.error("Failed to add hearing:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHearing = async (hid: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই শুনানির রেকর্ডটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/cases/${caseId}/hearings/${hid}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setHearings((prev) => prev.filter((h) => h.id !== hid));
        if (onHearingChange) onHearingChange();
      }
    } catch (err) {
      console.error("Failed to delete hearing:", err);
    }
  };

  const startEdit = (h: HearingItem) => {
    setEditingId(h.id);
    setEditOutcome(h.outcomeBn || "");
    setEditOrderSheet(h.orderSheetBn || "");
    setEditNextDate(h.nextDate ? h.nextDate.split("T")[0] : "");
  };

  const saveEdit = async (hid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cases/${caseId}/hearings/${hid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcomeBn: editOutcome.trim() || null,
          orderSheetBn: editOrderSheet.trim() || null,
          nextDate: editNextDate ? new Date(editNextDate).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setHearings((prev) =>
          prev.map((h) => (h.id === hid ? { ...h, ...json.data } : h))
        );
        setEditingId(null);
        if (onHearingChange) onHearingChange();
      }
    } catch (err) {
      console.error("Failed to update hearing:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    const hearingDay = dateStr.split("T")[0];

    if (hearingDay === today) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          আজকের শুনানি
        </span>
      );
    } else if (hearingDay > today) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          আসন্ন তারিখ
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          সম্পন্ন
        </span>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>কোর্ট ডায়েরি ও শুনানির সময়রেখা</span>
          </h3>
          <p className="text-xs text-slate-500">
            বিজ্ঞ আদালতের নিয়মিত কার্যবিবরণী, আদেশনামা (Order Sheet) ও পরবর্তী ধার্য তারিখ
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {showAddForm ? "বাতিল করুন" : "নতুন শুনানি যোগ করুন"}
        </button>
      </div>

      {/* Add Hearing Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddHearing}
          className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm space-y-3"
        >
          <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-indigo-600" />
            <span>নতুন শুনানির বিবরণ লিপিবদ্ধ করুন</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                শুনানির তারিখ *
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                শুনানির উদ্দেশ্য / পদক্ষেপ *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: চার্জ গঠন / জামিন শুনানি / সাক্ষ্য গ্রহণ / যুক্তিতর্ক"
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                বিজ্ঞ বিচারক / এজলাস
              </label>
              <input
                type="text"
                placeholder="যেমন: বিজ্ঞ চীফ জুডিসিয়াল ম্যাজিস্ট্রেট, আদালত নং ৩"
                value={newJudgeName}
                onChange={(e) => setNewJudgeName(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                পরবর্তী ধার্য তারিখ (যদি থাকে)
              </label>
              <input
                type="date"
                value={newNextDate}
                onChange={(e) => setNewNextDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              আদালতের আদেশনামা / কার্যবিবরণী (Order Sheet Notes)
            </label>
            <textarea
              rows={2}
              placeholder="আদালতের প্রদত্ত মৌখিক বা লিখিত নির্দেশের সারসংক্ষেপ..."
              value={newOrderSheet}
              onChange={(e) => setNewOrderSheet(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-800 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Hearing List */}
      {hearings.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold">কোনো শুনানির রেকর্ড পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400 mt-1">
            মামলার পরবর্তী তারিখ ও আদালতের আদেশ সংরক্ষণের জন্য ওপরের বাটনটি ব্যবহার করুন।
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200">
          {hearings.map((h) => {
            const isEditing = editingId === h.id;
            const hDate = new Date(h.date);

            return (
              <div
                key={h.id}
                className="relative bg-white border border-slate-200 rounded-xl p-4 shadow-xs transition hover:shadow-sm"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white bg-indigo-600 shadow-xs" />

                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {hDate.toLocaleDateString("bn-BD", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {getStatusBadge(h.date)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openReminderModal(h)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                      title="মক্কেলকে SMS / WhatsApp রিমাইন্ডার পাঠান"
                    >
                      <Send className="w-3 h-3 text-emerald-600" />
                      <span>রিমাইন্ডার পাঠান</span>
                    </button>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(h)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        title="সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteHearing(h.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 space-y-1.5 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 text-sm">{h.purpose}</div>

                  {h.judgeName && (
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{h.judgeName}</span>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="mt-2 pt-2 border-t border-slate-200 space-y-2 bg-slate-50 p-3 rounded-lg">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          আদালতের আদেশনামা (Order Sheet):
                        </label>
                        <textarea
                          rows={2}
                          value={editOrderSheet}
                          onChange={(e) => setEditOrderSheet(e.target.value)}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 text-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            ফলাফল / বর্তমান অবস্থা:
                          </label>
                          <input
                            type="text"
                            value={editOutcome}
                            onChange={(e) => setEditOutcome(e.target.value)}
                            className="w-full text-xs rounded border border-slate-300 p-1.5 text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            পরবর্তী শুনানির তারিখ:
                          </label>
                          <input
                            type="date"
                            value={editNextDate}
                            onChange={(e) => setEditNextDate(e.target.value)}
                            className="w-full text-xs rounded border border-slate-300 p-1.5 text-slate-800"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                        >
                          বাতিল
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => saveEdit(h.id)}
                          className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          আপডেট করুন
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {h.orderSheetBn && (
                        <div className="mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1 mb-0.5">
                            <FileText className="w-3 h-3 text-indigo-600" />
                            আদেশনামা (Order Sheet Notes):
                          </span>
                          <p className="text-slate-600 text-xs whitespace-pre-wrap">{h.orderSheetBn}</p>
                        </div>
                      )}

                      {h.outcomeBn && (
                        <div className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">ফলাফল: </span>
                          <span>{h.outcomeBn}</span>
                        </div>
                      )}

                      {h.nextDate && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            পরবর্তী ধার্য তারিখ:{" "}
                            {new Date(h.nextDate).toLocaleDateString("bn-BD", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reminder Modal */}
      {reminderModalHearing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">শুনানির রিমাইন্ডার পাঠান</h3>
                  <p className="text-xs text-slate-500">মক্কেলের মোবাইল নম্বরে এসএমএস বা হোয়াটসঅ্যাপ বার্তা</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderModalHearing(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  প্রেরণের মাধ্যম (Channel):
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderChannel("SMS")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                      reminderChannel === "SMS"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    SMS (মোবাইল এসএমএস)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderChannel("WHATSAPP")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
                      reminderChannel === "WHATSAPP"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    WhatsApp বার্তা
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মক্কেলের মোবাইল নম্বর:
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বার্তার খসড়া (Message Template):
                </label>
                <textarea
                  rows={4}
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 leading-relaxed focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                  <span>দৈর্ঘ্য: {reminderMessage.length} অক্ষর</span>
                  <span>স্বয়ংক্রিয় লগ ডাটাবেসে সংরক্ষিত হবে</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReminderModalHearing(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={sendingReminder || !recipientPhone.trim() || !reminderMessage.trim()}
                onClick={handleSendReminder}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingReminder ? "পাঠানো হচ্ছে..." : "এখনই পাঠান"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
