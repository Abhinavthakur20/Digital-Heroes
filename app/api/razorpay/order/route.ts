import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to continue." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const plan = body.plan === "yearly" ? "yearly" : "monthly";

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured in .env.local" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    // Monthly: ₹1,600 (160000 paise) | Yearly: ₹16,000 (1600000 paise)
    const amountInPaise = plan === "yearly" ? 1600000 : 160000;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `dh_${user.id.slice(-6)}_${Date.now()}`,
      notes: {
        userId: user.id,
        userEmail: user.email,
        plan
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      user: {
        fullName: user.fullName,
        email: user.email
      },
      plan
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
