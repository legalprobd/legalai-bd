import fs from "fs";
import path from "path";

export interface SaveFileResult {
  url: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function saveUploadedFile(
  caseId: string,
  file: File | { name: string; type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }
): Promise<SaveFileResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("ফাইলের আকার সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারে।");
  }

  const mimeType = file.type || "application/octet-stream";
  // Allow common extensions if browser sent empty or octet-stream
  const ext = path.extname(file.name).toLowerCase();
  const isAllowedExt = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".docx", ".doc"].includes(ext);

  if (!ALLOWED_MIME_TYPES.has(mimeType) && !isAllowedExt) {
    throw new Error("শুধুমাত্র PDF, ছবি (PNG, JPG) এবং Word (DOCX) ফাইল গ্রহণযোগ্য।");
  }

  const sanitizedCaseId = caseId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const targetDir = path.join(process.cwd(), "public", "uploads", sanitizedCaseId);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const timestamp = Date.now();
  const safeBaseName = path.basename(file.name).replace(/[^a-zA-Z0-9_.-]/g, "_");
  const uniqueFileName = `${timestamp}_${safeBaseName}`;
  const targetFilePath = path.join(targetDir, uniqueFileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(targetFilePath, buffer);

  const url = `/uploads/${sanitizedCaseId}/${uniqueFileName}`;

  return {
    url,
    fileName: file.name,
    fileType: mimeType,
    sizeBytes: file.size,
  };
}

export function deleteStoredFile(fileUrl: string): boolean {
  try {
    if (!fileUrl.startsWith("/uploads/")) return false;
    const relativePath = fileUrl.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), "public", relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error deleting stored file:", err);
    return false;
  }
}
