"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ShieldCheck, Trophy, HeartHandshake, ArrowRight } from "lucide-react";
import { RazorpayButton } from "./razorpay-button";
import type { Profile } from "@/lib/types";

export function SubscriptionCards({ user }: { user?: Profile | null }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      id: "monthly" as const,
      name: "Monthly Membership",
      tagline: "Flexible month-to-month access to performance tracking and charity draws.",
      price: "₹1,600",
      period: "/ month",
      billedAs: "Billed monthly · Cancel anytime",
      popular: false,
      badge: null,
      features: [
        "Eligibility in every monthly audited prize draw",
        "Rolling-5 handicap & scoring performance engine",
        "Choose your charity partner (10% to 60% allocation)",
        "Verified charitable impact receipt each billing cycle",
        "Member dashboard with prize claim records",
        "Community leaderboard ranking"
      ]
    },
    {
      id: "yearly" as const,
      name: "Annual Champion",
      tagline: "Maximum impact and uninterrupted draw eligibility with 2 months free.",
      price: "₹16,000",
      period: "/ year",
      billedAs: "Billed annually (Save ₹3,200 / 17% off)",
      popular: true,
      badge: "Best Value · 2 Months Free",
      features: [
        "Guaranteed entry into all 12 monthly audited draws",
        "Priority draw ticket allocation weighting",
        "Dedicated charity allocation with annual impact report",
        "Rolling-5 performance tracking & advanced round stats",
        "Verified VIP Champion badge on member leaderboards",
        "Direct claim disbursement with priority verification"
      ]
    }
  ];

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-forest mb-4">
          <Trophy className="h-3.5 w-3.5 text-forest" />
          <span>Membership & Entry</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Invest in your game.
          <br />
          <span className="bg-gradient-to-r from-forest to-emerald-600 bg-clip-text text-transparent">
            Empower a vetted cause.
          </span>
        </h2>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          Every membership fuels verified non-profit partners while entering you into audited monthly prize pools based on your genuine golf performance.
        </p>

        {/* Billing cycle pill toggle */}
        <div className="mt-8 inline-flex items-center rounded-full bg-slate-100 p-1.5 ring-1 ring-slate-200/80">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition-all ${
              billingCycle === "yearly"
                ? "bg-forest text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto items-stretch">
        {plans.map((plan) => {
          const isSelected = billingCycle === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 sm:p-10 transition-all duration-300 ${
                plan.popular
                  ? "border-2 border-forest bg-gradient-to-b from-white via-slate-50/50 to-emerald-50/20 shadow-xl shadow-forest/10 ring-1 ring-forest/20"
                  : "border border-slate-200/90 bg-white shadow-soft hover:shadow-card hover:border-slate-300"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-1 text-xs font-bold text-white shadow-md shadow-forest/20">
                  <Sparkles className="h-3 w-3 text-gold" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  {plan.popular && (
                    <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-bold text-forest">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed min-h-[32px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1.5 border-b border-slate-100 pb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">{plan.period}</span>
                </div>

                <p className="mt-2 text-xs font-medium text-slate-500">{plan.billedAs}</p>

                {/* Feature checklist */}
                <div className="mt-8 space-y-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    What&apos;s included:
                  </p>
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-10 pt-6 border-t border-slate-100">
                {user ? (
                  <RazorpayButton
                    plan={plan.id}
                    label={`Subscribe ${plan.id === "yearly" ? "Annually" : "Monthly"} with Razorpay`}
                    className={`w-full justify-center py-3.5 text-sm font-bold shadow-md transition-all ${
                      plan.popular
                        ? "bg-forest hover:bg-forest-600 text-white shadow-forest/25 hover:shadow-forest/35 hover:scale-[1.01]"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  />
                ) : (
                  <Link
                    href={`/signup?plan=${plan.id}`}
                    className={`focus-ring group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all ${
                      plan.popular
                        ? "bg-forest hover:bg-forest-600 text-white shadow-forest/25 hover:shadow-forest/35 hover:scale-[1.01]"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                )}

                {/* Trust guarantee */}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                  <span>Secure 256-bit Razorpay Checkout · Instant Access</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust banner under pricing */}
      <div className="mt-12 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest flex-none">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Direct Charity Impact Guarantee</p>
            <p className="text-xs text-slate-500">
              A minimum of 10% (up to 60%) of your membership goes straight to your selected charity partner, completely separate from prize pools.
            </p>
          </div>
        </div>
        <Link
          href="/charities"
          className="text-xs font-bold text-forest hover:text-forest-800 flex-none flex items-center gap-1"
        >
          <span>Explore Charities</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}
