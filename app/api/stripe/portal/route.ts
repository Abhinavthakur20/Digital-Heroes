import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";
import { getSubscription } from "@/lib/store";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const subscription = await getSubscription(user.id);

  if (!secretKey) {
    return NextResponse.redirect(new URL("/dashboard?portal=unconfigured", request.url));
  }

  if (!subscription?.stripeCustomerId) {
    return NextResponse.redirect(new URL("/dashboard?portal=no_customer", request.url));
  }

  try {
    const stripe = new Stripe(secretKey);
    const returnUrl = new URL("/dashboard", request.url).toString();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl
    });

    return NextResponse.redirect(portalSession.url);
  } catch (error) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.redirect(new URL("/dashboard?portal=error", request.url));
  }
}
