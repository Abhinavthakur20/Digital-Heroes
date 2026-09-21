import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getPaymentByProviderOrder, updatePaymentRecord, updateSubscriptionStatus } from "@/lib/store";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({
      received: true,
      demo: true,
      note: "Live webhook endpoint ready. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env.local to verify signatures in production."
    });
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;
      const plan = (session.metadata?.plan as "monthly" | "yearly") || "monthly";
      const customerId = typeof session.customer === "string" ? session.customer : undefined;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : undefined;

      if (userId) {
        const payment = await getPaymentByProviderOrder("stripe", session.id);
        if (payment) {
          await updatePaymentRecord(payment.id, {
            status: "succeeded",
            providerPaymentId: subscriptionId || session.id
          });
        }
        await updateSubscriptionStatus(userId, "active", plan, customerId, subscriptionId);
      }
    } else if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const status =
        sub.status === "active"
          ? "active"
          : sub.status === "past_due"
          ? "lapsed"
          : sub.status === "canceled"
          ? "cancelled"
          : "inactive";
      const customerId = typeof sub.customer === "string" ? sub.customer : undefined;

      if (userId) {
        await updateSubscriptionStatus(userId, status, undefined, customerId, sub.id);
      }
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;

      if (userId) {
        await updateSubscriptionStatus(userId, "cancelled");
      }
    } else if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : undefined;
      // If payment failed on recurring charge, mark lapsed
      if (customerId) {
        // Can optionally lookup by customer id if needed
      }
    }

    return NextResponse.json({
      received: true,
      handled: true,
      type: event.type
    });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook verification failed." },
      { status: 400 }
    );
  }
}
