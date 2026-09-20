import { NextResponse } from "next/server";
import { updateWinnerStatus } from "@/lib/store";
import type { PaymentStatus, VerificationStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const verificationStatus = body.verificationStatus as VerificationStatus | undefined;
    const paymentStatus = body.paymentStatus as PaymentStatus | undefined;

    const winner = await updateWinnerStatus(id, {
      verificationStatus,
      paymentStatus
    });

    if (!winner) {
      return NextResponse.json({ error: "Winner record not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, winner });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update winner." },
      { status: 400 }
    );
  }
}
