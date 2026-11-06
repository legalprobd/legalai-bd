"use client";

import React, { useState, useEffect } from "react";
import { AppNavbar } from "@/components/common/AppNavbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskRecord } from "@/lib/types/legalSuite";
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form
  const [title, setTitle] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("জুনিয়র অ্যাডভোকেট তানভীর আহমেদ");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      const json = await res.json();
      if (json.ok && Array.isArray(json.data)) {
        setTasks(json.data);
      }
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          caseTitle,
          assignedTo,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority,
          notes,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setShowAddModal(false);
        setTitle("");
        setCaseTitle("");
        setDueDate("");
        setNotes("");
        fetchTasks();
      } else {
        alert(json.error?.messageBn || "টাস্ক সংরক্ষণ ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("সার্ভার এরর। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "COMPLETED") => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
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
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <CheckSquare className="w-4 h-4" />
              <span>Internal Collaboration & Delegation (মডিউল ৫)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              চেম্বার টাস্ক ও অ্যাসাইনমেন্ট ম্যানেজমেন্ট
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              সিনিয়র আইনজীবীদের পক্ষ থেকে জুনিয়র অ্যাসোসিয়েট ও ক্লার্কদের (মুহুরি) ড্রাফটিং, ফাইলিং ও নকল উত্তোলনের দায়িত্ব প্রদান ও ট্র্যাকিং।
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন টাস্ক অর্পণ করুন</span>
          </button>
        </div>

        {/* Board Columns */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">লোড হচ্ছে...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {/* Column 1: TODO */}
            <div className="bg-slate-100/70 rounded-3xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-amber-500" />
                  <span>অর্পিত দায়িত্ব (To-Do)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-600">
                  {tasks.filter((t) => t.status === "TODO").length}
                </span>
              </div>

              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === "TODO")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          task.priority === "HIGH"
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}>
                          {task.priority === "HIGH" ? "জরুরি (High)" : "স্বাভাবিক"}
                        </span>
                        <button
                          onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                          className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          কাজ শুরু →
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {task.title}
                      </h4>
                      {task.caseTitle && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          মামলা: {task.caseTitle}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{task.assignedTo}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString("bn-BD")}</span>
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 2: IN_PROGRESS */}
            <div className="bg-slate-100/70 rounded-3xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>চলমান কাজ (In Progress)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-600">
                  {tasks.filter((t) => t.status === "IN_PROGRESS").length}
                </span>
              </div>

              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === "IN_PROGRESS")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-white rounded-2xl border border-blue-200 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                          চলমান
                        </span>
                        <button
                          onClick={() => handleUpdateStatus(task.id, "COMPLETED")}
                          className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                        >
                          সম্পন্ন করুন ✓
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {task.title}
                      </h4>
                      {task.caseTitle && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          মামলা: {task.caseTitle}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{task.assignedTo}</span>
                        </span>
                        <span className="text-[10px] text-blue-600 font-medium">
                          {new Date(task.dueDate).toLocaleDateString("bn-BD")}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 3: COMPLETED */}
            <div className="bg-slate-100/70 rounded-3xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-xs text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>সম্পন্ন কাজ (Completed)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-600">
                  {tasks.filter((t) => t.status === "COMPLETED").length}
                </span>
              </div>

              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === "COMPLETED")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs opacity-75"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          সম্পন্ন
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-through opacity-80">
                        {task.title}
                      </h4>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
                        <span>সম্পন্ন করেছেন: {task.assignedTo}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: New Task */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>নতুন টাস্ক বা দায়িত্ব অর্পণ</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    টাস্কের বিবরণ বা শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: আরজি ড্রাফটিং, সিডি নকল তোলা, জামিন পিটিশন প্রস্তুত..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    সংশ্লিষ্ট মামলা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    placeholder="যেমন: বাসায় হামলা ও ভাঙচুর — করিম মিয়া"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      দায়িত্বপ্রাপ্ত সহযোগী *
                    </label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium"
                    >
                      <option value="জুনিয়র অ্যাডভোকেট তানভীর আহমেদ">জুনিয়র অ্যাডভোকেট তানভীর আহমেদ</option>
                      <option value="মো. খোরশেদ আলম (প্রধান ক্লার্ক / মুহুরি)">মো. খোরশেদ আলম (ক্লার্ক / মুহুরি)</option>
                      <option value="ব্যারিস্টার এম. এ. রহমান (অ্যাডভোকেট)">ব্যারিস্টার এম. এ. রহমান নিজে</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      অগ্রাধিকার (Priority)
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as unknown as typeof priority)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                    >
                      <option value="HIGH">জরুরি (High Priority)</option>
                      <option value="MEDIUM">স্বাভাবিক (Medium)</option>
                      <option value="LOW">সাধারণ (Low)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    সম্পন্নের শেষ তারিখ (Due Date)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    নির্দেশনা বা কাজের নোট
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="কাজের বিশেষ নির্দেশনা..."
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
                    {isSubmitting ? "সংরক্ষণ হচ্ছে..." : "টাস্ক অর্পণ করুন"}
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
