import { NextResponse } from "next/server";
import { uploadWinnerProof } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const proofUrl = String(body.proofUrl || "").trim();

    if (!proofUrl) {
      return NextResponse.json({ error: "Proof URL or image data is required." }, { status: 400 });
    }

    const winner = await uploadWinnerProof(id, proofUrl);
    if (!winner) {
      return NextResponse.json({ error: "Winner record not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Proof screenshot submitted successfully! Admin review is pending.",
      winner
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload proof." },
      { status: 500 }
    );
  }
}
