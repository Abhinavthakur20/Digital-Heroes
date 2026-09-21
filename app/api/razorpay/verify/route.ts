import { NextResponse } from "next/server";
import crypto from "crypto";
import { errorResponse, HttpError, requireUser } from "@/lib/access";
import { getPaymentByProviderOrder, updatePaymentRecord, updateSubscriptionStatus } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new HttpError(400, "Missing payment verification parameters");
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new HttpError(500, "Server missing Razorpay secret");
    }

    const payment = await getPaymentByProviderOrder("razorpay", razorpay_order_id);
    if (!payment || payment.userId !== user.id) {
      throw new HttpError(403, "Payment order does not belong to this user.");
    }
    const verifiedPlan = plan === "yearly" ? "yearly" : "monthly";
    const expectedAmount = verifiedPlan === "yearly" ? 1600000 : 160000;
    if (payment.plan !== verifiedPlan || payment.amount !== expectedAmount || payment.currency !== "INR") {
      throw new HttpError(400, "Payment order details do not match the requested plan.");
    }

    // Verify HMAC SHA256 signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await updatePaymentRecord(payment.id, { status: "failed", providerPaymentId: razorpay_payment_id });
      throw new HttpError(400, "Invalid payment signature");
    }

    await updatePaymentRecord(payment.id, { status: "succeeded", providerPaymentId: razorpay_payment_id });
    await updateSubscriptionStatus(
      user.id,
      "active",
      verifiedPlan,
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
    return errorResponse(error, "Payment verification failed", 400);
  }
}
