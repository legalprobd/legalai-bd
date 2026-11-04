"use client";

import React, { useState } from "react";
import { EvidenceFileItem } from "@/lib/ai/schemas";
import {
  FileBox,
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  Trash2,
  ExternalLink,
  Tag,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface EvidenceVaultProps {
  caseId: string;
  initialEvidence: EvidenceFileItem[];
  onEvidenceChange?: () => void;
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({
  caseId,
  initialEvidence,
  onEvidenceChange,
}) => {
  const [evidenceList, setEvidenceList] = useState<EvidenceFileItem[]>(initialEvidence);
  const [uploading, setUploading] = useState(false);
  const [selectedTag, setSelectedTag] = useState("মেডিকেল ইনজুরি রিপোর্ট");
  const [customTag, setCustomTag] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const predefinedTags = [
    "মেডিকেল ইনজুরি রিপোর্ট",
    "চেক ও ডিজঅনার মেমো",
    "নালিশি খতিয়ান ও পর্চা",
    "রেজিস্ট্রি বায়না বা মূল দলিল",
    "ভাঙচুর ও আঘাতের ছবি",
    "সাক্ষীদের জাতীয় পরিচয়পত্র (NID)",
    "লিগ্যাল নোটিশ ও ডাক রসিদ",
  ];

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "০ KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-rose-600" />;
    if (fileType.includes("image")) return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    return <File className="w-5 h-5 text-indigo-600" />;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const tag = customTag.trim() || selectedTag;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("factMapping", JSON.stringify({ category: tag }));

    try {
      setUploading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.ok && json.data) {
        setEvidenceList((prev) => [json.data, ...prev]);
        setCustomTag("");
        if (onEvidenceChange) onEvidenceChange();
      } else {
        setErrorMsg(json.error?.messageBn || "আপলোড ব্যর্থ হয়েছে।");
      }
    } catch {
      setErrorMsg("ফাইল আপলোডে ত্রুটি দেখা দিয়েছে।");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (eid: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই প্রমাণপত্রটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/cases/${caseId}/evidence/${eid}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setEvidenceList((prev) => prev.filter((e) => e.id !== eid));
        if (onEvidenceChange) onEvidenceChange();
      }
    } catch (err) {
      console.error("Failed to delete evidence:", err);
    }
  };

  const handleTriggerOcr = async (eid: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/evidence/${eid}/ocr`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setEvidenceList((prev) =>
          prev.map((item) =>
            item.id === eid ? { ...item, ocrTextBn: json.data.ocrTextBn } : item
          )
        );
        alert(json.data.ocrTextBn);
      }
    } catch (err) {
      console.error("Failed OCR:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileBox className="w-5 h-5 text-indigo-600" />
          <span>প্রমাণপত্র ও এভিডেন্স ভল্ট (Evidence Vault)</span>
        </h3>
        <p className="text-xs text-slate-500">
          মামলার সমর্থনে যাবতীয় দালিলিক সাক্ষ্য-প্রমাণ, মেডিকেল সনদ ও আলোকচিত্র সংরক্ষণ ও ফ্যাক্ট-ম্যাপিং
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl p-5 transition bg-indigo-50/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                নতুন প্রমাণপত্র আপলোড করুন
              </h4>
              <p className="text-xs text-slate-500">
                PDF, PNG, JPG বা DOCX (সর্বোচ্চ ১০MB)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {predefinedTags.map((tag) => (
                <option key={tag} value={tag}>
                  ট্যাগ: {tag}
                </option>
              ))}
            </select>

            <label className="relative inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer shadow-xs disabled:opacity-50">
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  আপলোড হচ্ছে...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1.5" />
                  ফাইল নির্বাচন করুন
                </>
              )}
              <input
                type="file"
                disabled={uploading}
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc"
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Evidence List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            সংরক্ষিত প্রমাণপত্রাদি ({evidenceList.length}টি ফাইল)
          </h4>
        </div>

        {evidenceList.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            <FileBox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">কোনো প্রমাণপত্র আপলোড করা হয়নি</p>
            <p className="text-xs text-slate-400 mt-1">
              মামলার উপাদান প্রমাণের জন্য নথিপত্র যুক্ত করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evidenceList.map((file) => {
              const mapping = file.factMapping as Record<string, string> | null;
              const categoryTag = mapping?.category || Object.values(mapping || {})[0] || "সাধারণ প্রমাণ";

              return (
                <div
                  key={file.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-sm transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 truncate" title={file.fileName}>
                          {file.fileName}
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {formatFileSize(file.sizeBytes)} •{" "}
                          {new Date(file.uploadedAt).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Fact mapping tag */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Tag className="w-3 h-3" />
                      {categoryTag}
                    </span>
                  </div>

                  {/* OCR snippet */}
                  {file.ocrTextBn && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-150 line-clamp-2">
                      <span className="font-semibold text-slate-700">OCR নোট: </span>
                      {file.ocrTextBn}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleTriggerOcr(file.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      OCR বিশ্লেষণ
                    </button>

                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      নথি দেখুন
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
