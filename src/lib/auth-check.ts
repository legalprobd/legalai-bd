import { NextResponse } from "next/server";
import { auth } from "@/auth";

export interface AuthCheckResult {
  ok: boolean;
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
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

    return {
      ok: true,
      userId,
      userEmail: session.user.email || undefined,
      isAdmin,
    };
  } catch (error) {
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
