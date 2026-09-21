import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  HeartHandshake,
  LineChart,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import { getCharities, getProfiles, getSubscriptions, getWinners } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { activeSubscriptions } from "@/lib/subscription";
import { money } from "@/lib/format";
import { HeroVideo } from "@/components/hero-video";
import { SubscriptionCards } from "@/components/subscription-cards";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [charities, profiles, subscriptions, winners, user] = await Promise.all([
    getCharities(),
    getProfiles(),
    getSubscriptions(),
    getWinners(),
    getCurrentUser()
  ]);

  const featured = charities.filter((charity) => charity.isFeatured);
  const activeCount = activeSubscriptions(subscriptions).length;
  const paidOut = winners.reduce((sum, winner) => sum + winner.amount, 0);

  const subscribers = profiles.filter((profile) => profile.role === "subscriber");
  const avgCharityPct =
    subscribers.length > 0
      ? subscribers.reduce((sum, profile) => sum + profile.charityPct, 0) / subscribers.length
      : 10;

  return (
    <div className="pb-20">

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Full-bleed cinematic video background with dark overlays
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] overflow-hidden bg-obsidian-950">
        {/* Video background */}
        <HeroVideo />

        {/* Hero content */}
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="w-full grid lg:grid-cols-[1fr_380px] gap-12 xl:gap-20 items-center pt-24 pb-16">

            {/* Left — Copy */}
            <div className="space-y-8 max-w-2xl">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-white/[0.06] px-4 py-1.5 backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold text-emerald-300 tracking-wide">
                  Live Platform · Monthly Draws · Verified Impact
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                <h1 className="font-display font-extrabold text-5xl tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05]">
                  Elevate your
                  <br />
                  <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-teal-200 bg-clip-text text-transparent">
                    performance.
                  </span>
                </h1>
                <p className="font-display font-semibold text-2xl sm:text-3xl text-emerald-100/90 leading-tight">
                  Back your cause.
                </p>
              </div>

              {/* Description */}
              <p className="max-w-lg text-base sm:text-lg leading-relaxed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                The only platform that connects competitive Stableford scoring with
                automated prize draws and{" "}
                <span className="text-emerald-300 font-semibold">
                  guaranteed charitable giving.
                </span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="focus-ring group relative inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-emerald-400 px-7 text-sm font-bold text-obsidian-950 shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all duration-300 hover:bg-emerald-300 hover:shadow-[0_0_45px_rgba(52,211,153,0.5)] hover:scale-[1.02]"
                >
                  <span>Join the Platform</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/charities"
                  className="focus-ring group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.06] px-7 text-sm font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.12] hover:border-white/25"
                >
                  <HeartHandshake className="h-4 w-4 text-emerald-400" />
                  <span>Explore Charities</span>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-white/10">
                {[
                  { icon: Shield, text: "Audited 40/35/25% Prize Splits" },
                  { icon: LineChart, text: "Rolling 5 Score Weighting" },
                  { icon: HeartHandshake, text: "Minimum 10% Giving" }
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-[11px] font-medium text-white/60">
                    <item.icon className="h-3.5 w-3.5 text-emerald-400/70" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Floating stat cards (visible lg+) */}
            <div className="hidden lg:flex flex-col gap-4">
              {[
                { icon: Users, label: "Members", value: String(activeCount), detail: "Active subscribers" },
                { icon: Trophy, label: "Prize Pool", value: money(paidOut), detail: "Total distributed" },
                { icon: HeartHandshake, label: "Giving", value: `${avgCharityPct.toFixed(1)}%`, detail: "Avg charity allocation" }
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-5 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <card.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/70">{card.label}</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white tabular-nums">{card.value}</p>
                  <p className="mt-1 text-[11px] text-white/50">{card.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE KPI STRIP — Visible only below lg
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-obsidian-950 pb-16 pt-2 lg:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Active Subscribers", value: String(activeCount), detail: "Eligible for upcoming monthly draw" },
              { label: "Prize Pool Payouts", value: money(paidOut), detail: "Published and verified member winnings" },
              { label: "Avg Charity Allocation", value: `${avgCharityPct.toFixed(1)}%`, detail: "Dedicated giving directed by subscribers" }
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-white/[0.08] bg-obsidian-900/80 p-5 backdrop-blur-xl">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{kpi.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white tabular-nums">{kpi.value}</p>
                <p className="mt-2 text-[11px] text-slate-500 font-medium">{kpi.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURED CHARITIES — Premium cards with hover effects
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-forest/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest">
              <Award className="h-3.5 w-3.5 text-gold" />
              <span>Verified Impact Partners</span>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Spotlight Giving Initiatives
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl leading-relaxed">
              Every subscriber selects one partner upon onboarding, directing a chosen percentage of
              monthly dues directly to vetted grassroot programs.
            </p>
          </div>
          <Link
            href="/charities"
            className="focus-ring group inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-800 transition-colors"
          >
            <span>View all partners</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {featured.map((charity) => (
            <article
              key={charity.id}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-card"
            >
              <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <Image
                  src={charity.imageUrl}
                  alt={charity.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur-md">
                    {charity.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">{charity.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
                  {charity.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                  <span className="font-semibold text-forest flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                    {charity.impactMetric}
                  </span>
                  <Link
                    href={`/charities/${charity.id}`}
                    className="group/link font-bold text-slate-700 hover:text-forest transition-colors flex items-center gap-1"
                  >
                    View profile
                    <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PLATFORM PILLARS — How it works, 3-column feature grid
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24">
        <div className="rounded-3xl border border-slate-200/60 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 p-8 sm:p-12 shadow-soft">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest mb-4">
              <Zap className="h-3.5 w-3.5" />
              <span>The Platform Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Built for integrity, performance,
              <br className="hidden sm:block" /> and transparency
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: LineChart,
                title: "Rolling-5 Performance Engine",
                description:
                  "Log your Stableford scores after each round. The engine auto-prunes rounds beyond your last five, creating an explainable weighting vector for draw tickets.",
                accent: "from-emerald-500/10 to-forest/5",
                iconColor: "text-emerald-500"
              },
              {
                icon: Trophy,
                title: "Audited 40/35/25% Prize Pools",
                description:
                  "A fixed 20% share of recognized revenue seeds each monthly pool. Empty 5-match tiers automatically roll over to form escalating jackpots.",
                accent: "from-gold/10 to-gold/5",
                iconColor: "text-gold"
              },
              {
                icon: HeartHandshake,
                title: "Guaranteed Dedicated Giving",
                description:
                  "Charity allocations (minimum 10%) are independent of prize pools, ensuring non-profit partners receive predictable, recurring support each billing cycle.",
                accent: "from-forest/10 to-emerald-500/5",
                iconColor: "text-forest"
              }
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-soft transition-all duration-300 hover:border-slate-300 hover:shadow-card hover:-translate-y-0.5"
              >
                <div className={`absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br ${pillar.accent} blur-3xl opacity-60 transition-opacity group-hover:opacity-100`} />
                <div className="relative">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${pillar.accent} ring-1 ring-black/[0.03]`}>
                    <pillar.icon className={`h-5 w-5 ${pillar.iconColor}`} />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-900">{pillar.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SUBSCRIPTION PLANS — Monthly & Yearly pricing cards
         ═══════════════════════════════════════════════════════════════════ */}
      <SubscriptionCards user={user} />

      {/* ═══════════════════════════════════════════════════════════════════
          CTA BANNER — Dark premium call to action
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
        <div className="relative overflow-hidden rounded-3xl bg-obsidian-950 p-8 sm:p-12 lg:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,92,58,0.2),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(184,142,68,0.08),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }} />

          <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 backdrop-blur-xl mb-6">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs font-semibold text-slate-400">Start your journey today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Ready to elevate your game
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                and make an impact?
              </span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
              Join a community of competitive golfers who play with purpose.
              Every round counts — for your ranking and for your chosen cause.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                href="/signup"
                className="focus-ring group relative inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-forest to-forest-600 px-8 text-sm font-bold text-white shadow-xl shadow-forest/25 transition-all duration-300 hover:shadow-[0_8px_40px_-4px_rgba(13,92,58,0.4)] hover:scale-[1.02]"
              >
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-8 text-sm font-semibold text-slate-300 hover:bg-white/[0.07] hover:text-white transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
