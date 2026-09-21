import { NextResponse } from "next/server";
import { createDonation, getCharity } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const charity = await getCharity(id);
    if (!charity) {
      return NextResponse.json({ error: "Charity partner not found." }, { status: 404 });
    }

    const body = await request.json();
    const amount = Number(body.amount);
    const donorName = String(body.donorName || "Anonymous Supporter").trim();
    const donorEmail = String(body.donorEmail || "").trim();

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Please enter a valid donation amount." }, { status: 400 });
    }

    const donation = await createDonation({
      charityId: id,
      donorName: donorName || "Anonymous Supporter",
      donorEmail,
      amount
    });

    return NextResponse.json({
      success: true,
      donation,
      message: `Thank you! Your donation of $${amount} to ${charity.name} has been processed.`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record donation" },
      { status: 500 }
    );
  }
}
