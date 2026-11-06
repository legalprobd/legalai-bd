import { NextResponse } from "next/server";
import { auth } from "@/auth";

export interface AuthCheckResult {
  ok: boolean;
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
  role?: string;
  response?: NextResponse;
}

export async function requireAuth(): Promise<AuthCheckResult> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            ok: false,
            error: {
              code: "UNAUTHORIZED",
              messageBn: "অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।",
            },
          },
          { status: 401 }
        ),
      };
    }

    const userId = session.user.id || "demo-user-advocate-001";
    const isAdmin = Boolean((session.user as any).isAdmin);
    const role = String((session.user as any).role || (isAdmin ? "ADVOCATE" : "JUNIOR"));

    return {
      ok: true,
      userId,
      userEmail: session.user.email || undefined,
      isAdmin,
      role,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_") || error?.digest === "HANGING_PROMISE_REJECTION") throw error;
    console.error("Auth check failed:", error);
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            messageBn: "অননুমোদিত অ্যাক্সেস।",
          },
        },
        { status: 401 }
      ),
    };
  }
}

export async function requirePlatformOwner(): Promise<AuthCheckResult> {
  const check = await requireAuth();
  if (!check.ok) return check;

  if (check.role !== "PLATFORM_OWNER") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            messageBn: "শুধুমাত্র প্ল্যাটফর্ম ওনার (সুপার অ্যাডমিন) এই পৃষ্ঠায় প্রবেশ করতে পারবেন।",
          },
        },
        { status: 403 }
      ),
    };
  }

  return check;
}
