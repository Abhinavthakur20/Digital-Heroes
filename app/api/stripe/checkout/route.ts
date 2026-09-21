import { NextResponse } from "next/server";
import Stripe from "stripe";
import { errorResponse, requireUser } from "@/lib/access";
import { createPaymentRecord } from "@/lib/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") === "yearly" ? "yearly" : "monthly";
  const user = await requireUser().catch(() => null);
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=login_required", request.url));
  }
  const userId = user.id;
  const email = user.email;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId =
    plan === "yearly" ? process.env.STRIPE_YEARLY_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!secretKey) {
    return NextResponse.redirect(new URL(`/dashboard?checkout=unconfigured&plan=${plan}`, request.url));
  }

  try {
    const stripe = new Stripe(secretKey);

    // Build line item: use price ID if provided, otherwise create recurring price_data on the fly
    const lineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan === "yearly" ? "Digital Heroes — Yearly Membership" : "Digital Heroes — Monthly Membership",
              description: "Executive golf tracking, monthly prize draws, and verified charity giving."
            },
            unit_amount: plan === "yearly" ? 20000 : 2000,
            recurring: {
              interval: (plan === "yearly" ? "year" : "month") as "year" | "month"
            }
          },
          quantity: 1
        };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: userId,
      customer_email: email,
      metadata: { userId, plan },
      line_items: [lineItem],
      success_url: new URL("/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}", request.url).toString(),
      cancel_url: new URL("/dashboard?checkout=cancelled", request.url).toString()
    });

    await createPaymentRecord({
      userId,
      provider: "stripe",
      providerOrderId: session.id,
      plan,
      amount: plan === "yearly" ? 20000 : 2000,
      currency: "USD",
      status: "pending"
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return errorResponse(error, "Failed to create Stripe Checkout session");
  }
}
