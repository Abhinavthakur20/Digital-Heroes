import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";
import { updateSubscriptionStatus } from "@/lib/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") === "yearly" ? "yearly" : "monthly";
  const user = await getCurrentUser();
  const userId = user?.id ?? "user-ava";
  const email = user?.email;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId =
    plan === "yearly" ? process.env.STRIPE_YEARLY_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID;

  // If no Stripe Secret Key configured yet, simulate instant checkout activation in local persistent store
  if (!secretKey) {
    if (userId) {
      await updateSubscriptionStatus(userId, "active", plan);
    }
    return NextResponse.redirect(new URL(`/dashboard?checkout=success&mode=local`, request.url));
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

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Stripe Checkout session" },
      { status: 500 }
    );
  }
}
