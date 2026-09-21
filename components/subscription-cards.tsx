"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  HeartHandshake, 
  ArrowRight, 
  Zap
} from "lucide-react";
import { RazorpayButton } from "./razorpay-button";
import type { Profile } from "@/lib/types";

export function SubscriptionCards({ user }: { user?: Profile | null }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-forest mb-4">
          <Trophy className="h-3.5 w-3.5 text-forest" />
          <span>Membership & Draw Access</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Invest in your game.
          <br />
          <span className="bg-gradient-to-r from-forest via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Empower a vetted cause.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Every membership enters your verified Stableford scores into audited monthly prize pools while directly channeling your chosen contribution to non-profit causes.
        </p>

        {/* Interactive Billing Cycle Toggle */}
        <div className="mt-8 inline-flex items-center rounded-full bg-slate-100 p-1.5 ring-1 ring-slate-200/90 shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`relative rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
              billingCycle === "monthly"
                ? "bg-white text-slate-900 shadow-md shadow-slate-200/50"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`relative flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
              billingCycle === "yearly"
                ? "bg-forest text-white shadow-md shadow-forest/30"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition-colors ${
              billingCycle === "yearly"
                ? "bg-emerald-400 text-obsidian-950"
                : "bg-emerald-100 text-emerald-800"
            }`}>
              Save 17% (2 Mo Free)
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto items-stretch">
        
        {/* Plan 1: Monthly Membership */}
        <div
          onClick={() => setBillingCycle("monthly")}
          className={`group relative flex flex-col justify-between rounded-3xl p-8 sm:p-10 transition-all duration-300 cursor-pointer ${
            billingCycle === "monthly"
              ? "border-2 border-forest bg-white shadow-xl shadow-forest/10 ring-2 ring-forest/20 -translate-y-1"
              : "border border-slate-200/90 bg-slate-50/50 hover:bg-white shadow-soft hover:shadow-card hover:border-slate-300"
          }`}
        >
          {billingCycle === "monthly" && (
            <div className="absolute -top-3.5 left-8 inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-1 text-xs font-bold text-white shadow-md shadow-forest/20">
              <Zap className="h-3 w-3 text-emerald-300" />
              <span>Selected Option</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Flexible Entry</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">Monthly Player</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Cancel Anytime
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Ideal for golfers looking for flexible month-to-month access to performance tracking and live monthly prize draws.
            </p>

            {/* Pricing Section */}
            <div className="mt-6 border-y border-slate-100 py-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                  ₹1,600
                </span>
                <span className="text-sm font-semibold text-slate-500">/ month</span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Billed monthly · 1 automated monthly draw entry per cycle
              </p>
            </div>

            {/* Impact Metric Chips */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Charity Direct</p>
                <p className="text-xs font-bold text-forest mt-0.5">Min 10% (₹160+)</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Prize Pool Share</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">Full Pool Access</p>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-8 space-y-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                What&apos;s included:
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>Automated entry into each month&apos;s audited prize draw</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>Rolling-5 handicap & Stableford score tracking engine</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>Choose any vetted charity partner (10% to 60% allocation)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>Verified digital impact receipt for tax records</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest/10 text-forest mt-0.5">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>Member dashboard with live draw simulation results</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-10 pt-6 border-t border-slate-100">
            {user ? (
              <RazorpayButton
                plan="monthly"
                label="Subscribe Monthly (₹1,600/mo)"
                className={`w-full justify-center py-3.5 text-sm font-bold shadow-md transition-all ${
                  billingCycle === "monthly"
                    ? "bg-forest hover:bg-forest-600 text-white shadow-forest/25"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              />
            ) : (
              <Link
                href="/signup?plan=monthly"
                className={`focus-ring group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all ${
                  billingCycle === "monthly"
                    ? "bg-forest hover:bg-forest-600 text-white shadow-forest/25"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                <span>Get Started Monthly</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-forest" />
              <span>Instant activation · No setup fees · Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Plan 2: Annual Champion */}
        <div
          onClick={() => setBillingCycle("yearly")}
          className={`group relative flex flex-col justify-between rounded-3xl p-8 sm:p-10 transition-all duration-300 cursor-pointer ${
            billingCycle === "yearly"
              ? "border-2 border-forest bg-gradient-to-b from-white via-slate-50/40 to-emerald-50/20 shadow-2xl shadow-forest/15 ring-2 ring-forest/30 -translate-y-1"
              : "border border-slate-200/90 bg-slate-50/50 hover:bg-white shadow-soft hover:shadow-card hover:border-slate-300"
          }`}
        >
          {/* Top Banner Tag */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-1 text-xs font-bold text-white shadow-lg shadow-forest/30">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>Best Value · 2 Months Free</span>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-forest font-semibold">Annual Pass</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">Annual Champion</h3>
              </div>
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                Save ₹3,200/yr
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Continuous draw eligibility all year round with priority ticket allocation and maximum charitable impact.
            </p>

            {/* Pricing Section */}
            <div className="mt-6 border-y border-slate-100 py-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                  ₹1,333
                </span>
                <span className="text-sm font-semibold text-slate-500">/ month</span>
                <span className="text-sm font-medium text-slate-400 line-through ml-1">₹1,600</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-forest">
                Billed annually at ₹16,000 / year (12 full months for the price of 10)
              </p>
            </div>

            {/* Impact Metric Chips */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-xl border border-forest/20 bg-forest/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-forest">Annual Charity Impact</p>
                <p className="text-xs font-bold text-forest mt-0.5">Min ₹1,600+ / year</p>
              </div>
              <div className="rounded-xl border border-forest/20 bg-forest/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-forest">Audited Draws</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">All 12 Draws Guaranteed</p>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-8 space-y-3.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Everything in Monthly, plus:
              </p>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest text-white mt-0.5 shadow-sm">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span className="font-semibold text-slate-900">
                    Guaranteed entry into all 12 monthly draws (never miss a rollover)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest text-white mt-0.5 shadow-sm">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>Priority draw ticket weighting & algorithmic eligibility</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest text-white mt-0.5 shadow-sm">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>VIP Champion status badge on community leaderboards</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest text-white mt-0.5 shadow-sm">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>Dedicated annual charity impact report & giving certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-forest text-white mt-0.5 shadow-sm">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </div>
                  <span>Priority winner claim verification & disbursement workflow</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-10 pt-6 border-t border-slate-100">
            {user ? (
              <RazorpayButton
                plan="yearly"
                label="Subscribe Annually (₹16,000/yr · 2 Mo Free)"
                className="w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-forest/25 bg-forest hover:bg-forest-600 text-white hover:scale-[1.01] transition-all"
              />
            ) : (
              <Link
                href="/signup?plan=yearly"
                className="focus-ring group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-forest/25 bg-forest hover:bg-forest-600 text-white hover:scale-[1.01] transition-all"
              >
                <span>Claim Annual Champion Pass</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            )}

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-forest" />
              <span>Includes 2 months free · 256-bit Razorpay checkout</span>
            </div>
          </div>
        </div>

      </div>

      {/* Audited Prize Pool & Giving Architecture Banner */}
      <div className="mt-14 rounded-3xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 sm:p-8 max-w-5xl mx-auto shadow-sm">
        <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
          
          <div className="sm:pr-6 pt-4 sm:pt-0 flex items-start gap-4">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Direct Charity Impact</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Min 10% up to 60% of your membership goes straight to your selected vetted charity.
              </p>
            </div>
          </div>

          <div className="sm:px-6 pt-4 sm:pt-0 flex items-start gap-4">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Audited 40/35/25 Splits</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                40% Jackpot (with rollover), 35% 4-match, 25% 3-match distributions pre-enforced.
              </p>
            </div>
          </div>

          <div className="sm:pl-6 pt-4 sm:pt-0 flex items-start gap-4">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-forest/10 text-forest">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Verified Stableford Sync</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Rolling 5 score algorithm rewards consistent golf performance fairly.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
