import type { Subscription } from "./types";

export const PLAN_PRICES = {
  monthly: 20,
  yearly: 200
} as const;

export function isActiveSubscription(subscription?: Subscription, now = new Date()) {
  if (!subscription || subscription.status !== "active") {
    return false;
  }

  return new Date(subscription.currentPeriodEnd).getTime() > now.getTime();
}

export function monthlyRecognizedRevenue(subscription: Subscription) {
  return subscription.plan === "yearly" ? PLAN_PRICES.yearly / 12 : PLAN_PRICES.monthly;
}

export function activeSubscriptions(subscriptions: Subscription[], now = new Date()) {
  return subscriptions.filter((subscription) => isActiveSubscription(subscription, now));
}

export function activeMonthlyRevenue(subscriptions: Subscription[], now = new Date()) {
  return activeSubscriptions(subscriptions, now).reduce(
    (total, subscription) => total + monthlyRecognizedRevenue(subscription),
    0
  );
}
