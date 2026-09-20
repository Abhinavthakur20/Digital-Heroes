import Link from "next/link";
import { AlertCircle, CalendarDays, HeartHandshake, History, ShieldCheck, Trophy } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { StatusPill } from "@/components/status-pill";
import { UserPrizeActivity } from "@/components/user-prize-activity";
import { DemoSubscriptionToggle } from "@/components/demo-subscription-toggle";
import { getCurrentUser } from "@/lib/auth";
import { getCharity, getScores, getSubscription, getWinners } from "@/lib/store";
import { money, percent, shortDate } from "@/lib/format";
import { isActiveSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user?.id ?? "user-ava";

  const [charity, subscription, userScores, userWinnings] = await Promise.all([
    user?.charityId ? getCharity(user.charityId) : null,
    getSubscription(userId),
    getScores(userId),
    getWinners(userId)
  ]);

  const totalWinnings = userWinnings.reduce((sum, winner) => sum + winner.amount, 0);
  const isSubActive = isActiveSubscription(subscription ?? undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Lapsed / Inactive Subscription Alert */}
      {!isSubActive && (
        <div className="flex items-start gap-3.5 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-950 shadow-sm">
          <AlertCircle className="h-5 w-5 flex-none text-amber-700 mt-0.5" />
          <div className="flex-1 text-xs">
            <h3 className="font-bold text-sm text-amber-900">
              Subscription Status: {subscription?.status === "lapsed" ? "Lapsed (Payment Past Due)" : "Inactive"}
            </h3>
            <p className="mt-1 leading-relaxed text-amber-800">
              Your subscription is currently {subscription?.status || "inactive"}. Past golf rounds and giving records are safe, but monthly draw ticket issuance is paused until membership renewal.
            </p>
          </div>
          <Link
            href="/api/stripe/checkout?plan=monthly"
            className="rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900 transition-colors"
          >
            Renew Membership via Stripe
          </Link>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest">
            <span>Member Portal</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Subscriber Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome back, <strong className="text-slate-900">{user?.fullName ?? "Golfer"}</strong>. Track your scoring vector and charitable impact.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DemoSubscriptionToggle
            userId={userId}
            initialStatus={subscription?.status ?? "active"}
            hasStripeCustomer={Boolean(subscription?.stripeCustomerId)}
          />
          <StatusPill tone={isSubActive ? "green" : "red"}>
            {subscription?.status ?? "inactive"} membership
          </StatusPill>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Last Round Logged"
          value={String(userScores[0]?.value ?? "-")}
          detail={userScores[0] ? `${shortDate(userScores[0].playedOn)} · 18 holes` : "No rounds logged"}
        />
        <KpiCard
          label="Cumulative Winnings"
          value={money(totalWinnings)}
          detail={`${userWinnings.length} prize claim records`}
        />
        <KpiCard
          label="Giving Allocation"
          value={percent(user?.charityPct ?? 10)}
          detail={charity?.name ?? "Designated Partner"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Rolling-5 Rounds</h2>
              <p className="text-xs text-slate-500">Latest rounds informing your algorithmic draw ticket</p>
            </div>
            <Link
              href="/dashboard/scores"
              className="text-xs font-bold text-forest hover:text-forest-800 transition-colors"
            >
              Log round →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {userScores.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No rounds logged yet.{" "}
                <Link href="/dashboard/scores" className="text-forest underline font-semibold">
                  Log your first score
                </Link>
              </p>
            ) : (
              userScores.map((score, idx) => (
                <div key={score.id} className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                      #{idx + 1}
                    </span>
                    {shortDate(score.playedOn)}
                  </span>
                  <div className="flex items-center gap-1 font-mono">
                    <strong className="text-slate-900 text-base">{score.value}</strong>
                    <span className="text-[11px] text-slate-400">pts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <HeartHandshake className="h-4 w-4 text-forest" />
              <h2 className="text-base font-bold text-slate-900">Designated Giving Partner</h2>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{charity?.name ?? "Giving Partner"}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              {charity?.description ?? "Your subscription directly funds this non-profit's grassroots athletic initiatives."}
            </p>
          </div>
          <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200/60 p-3.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Reported Impact:</span>
            <p className="mt-1 font-bold text-forest">{charity?.impactMetric ?? "100% transparent giving"}</p>
          </div>
        </section>
      </div>

      <UserPrizeActivity initialWinners={userWinnings} />
    </div>
  );
}
