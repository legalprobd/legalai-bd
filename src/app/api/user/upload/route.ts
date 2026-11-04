import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-check";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string; // "signature" | "letterhead"

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_FILE", messageBn: "কোনো ফাইল নির্বাচন করা হয়নি।" } },
        { status: 400 }
      );
    }

    if (!["signature", "letterhead"].includes(type)) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_TYPE", messageBn: "অবৈধ আপলোড ধরন।" } },
        { status: 400 }
      );
    }

    // Size check: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: { code: "FILE_TOO_LARGE", messageBn: "ফাইলের আকার ৫ মেগাবাইটের কম হতে হবে।" } },
        { status: 400 }
      );
    }

    // MIME type check
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_FORMAT", messageBn: "শুধুমাত্র PNG, JPG বা WEBP ছবি গ্রহণযোগ্য।" } },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${type}-${authCheck.userId}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/profiles/${fileName}`;
    const fieldToUpdate = type === "signature" ? "digitalSignatureUrl" : "chamberLetterheadUrl";

    await db.updateUser(authCheck.userId!, {
      [fieldToUpdate]: publicUrl,
    });

    await db.logAudit(authCheck.userId!, "PROFILE_IMAGE_UPLOADED", {
      type,
      fileName,
      url: publicUrl,
    });

    return NextResponse.json({
      ok: true,
      data: {
        field: fieldToUpdate,
        url: publicUrl,
      },
    });
  } catch (error) {
    console.error("POST /api/user/upload error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "UPLOAD_ERROR", messageBn: "ছবি আপলোড করতে ব্যর্থ হয়েছে।" } },
      { status: 500 }
    );
  }
}
