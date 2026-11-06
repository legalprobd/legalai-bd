import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-check";
import { calculateBangladeshCourtFee, CourtFeeCalculationRequest } from "@/lib/courtFee";

export async function POST(request: Request) {
  try {
    const authCheck = await requireAuth();
    if (!authCheck.ok) return authCheck.response!;

    const body = await request.json();
    const { suitType, claimAmountOrValuation } = body as CourtFeeCalculationRequest;

    const result = calculateBangladeshCourtFee(suitType, Number(claimAmountOrValuation) || 0);

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in POST /api/court-fee/calculate:", error);
    return NextResponse.json(
      { ok: false, error: { messageBn: "কোর্ট ফি গণনায় সমস্যা হয়েছে।" } },
      { status: 500 }
    );
  }
}
