import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { updateSubscriptionStatus } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification parameters" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Server missing Razorpay secret" }, { status: 500 });
    }

    // Verify HMAC SHA256 signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment signature verified! Activate membership in database
    await updateSubscriptionStatus(
      user.id,
      "active",
      plan === "yearly" ? "yearly" : "monthly",
      razorpay_payment_id, // stored as reference
      razorpay_order_id
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully. Membership activated!",
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}
