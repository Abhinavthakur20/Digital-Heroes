import Link from "next/link";
import { Banknote, HeartHandshake, ShieldCheck, Users, Wand2 } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { StatusPill } from "@/components/status-pill";
import { getCharities, getProfiles, getSubscriptions, getWinners } from "@/lib/store";
import { money } from "@/lib/format";
import { activeMonthlyRevenue, activeSubscriptions } from "@/lib/subscription";

export const dynamic = "force-dynamic";

const adminLinks = [
  { href: "/admin/users", label: "Users & Subscriptions", icon: Users, desc: "Manage member roles & subscription states" },
  { href: "/admin/draws", label: "Draw Engine Console", icon: Wand2, desc: "Simulate tickets, publish & track rollovers" },
  { href: "/admin/charities", label: "Giving Partners", icon: HeartHandshake, desc: "Directory CRUD & homepage spotlight" },
  { href: "/admin/winners", label: "Claims & Disbursements", icon: Banknote, desc: "Review proofs & process prize payouts" }
];

export default async function AdminPage() {
  const [profiles, subscriptions, charities, winners] = await Promise.all([
    getProfiles(),
    getSubscriptions(),
    getCharities(),
    getWinners()
  ]);

  const active = activeSubscriptions(subscriptions);
  const revenue = activeMonthlyRevenue(subscriptions);
  const pendingWinners = winners.filter((winner) => winner.verificationStatus === "pending");
  const charityAllocation = profiles
    .filter((profile) => profile.role === "subscriber")
    .reduce((sum, profile) => sum + profile.charityPct, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:pt-32 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest">
            <ShieldCheck className="h-4 w-4" />
            <span>Executive Console</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Platform Administration
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Real-time audit across member subscriptions, prize liabilities, charity disbursements, and draw engines.
          </p>
        </div>
        <StatusPill tone="green">Admin Operations Online</StatusPill>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Subscribers"
          value={String(profiles.filter((profile) => profile.role === "subscriber").length)}
          detail={`${active.length} active draw entries`}
        />
        <KpiCard
          label="Recognized Revenue"
          value={money(revenue)}
          detail="Active monthly subscription billing"
        />
        <KpiCard
          label="Pending Proofs"
          value={String(pendingWinners.length)}
          detail={`${winners.length} total prize claims`}
        />
        <KpiCard
          label="Charity Partners"
          value={String(charities.length)}
          detail={`${charityAllocation.toFixed(1)} total allocation points`}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-white">
                <item.icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-900 group-hover:text-forest transition-colors">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
            <span className="mt-4 text-[11px] font-bold text-forest">Open console →</span>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Charity Allocation Distribution</h2>
            <p className="text-xs text-slate-500">Live breakdown of subscriber-directed giving</p>
          </div>
          <Link href="/admin/charities" className="text-xs font-bold text-forest hover:text-forest-800">
            Manage partners →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Giving Partner</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Supporters</th>
                <th className="py-3 px-3">Avg Allocation</th>
                <th className="py-3 px-3">Reported Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {charities.map((charity) => {
                const supporters = profiles.filter((profile) => profile.charityId === charity.id);
                const average =
                  supporters.length > 0
                    ? supporters.reduce((sum, profile) => sum + profile.charityPct, 0) / supporters.length
                    : 0;

                return (
                  <tr key={charity.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{charity.name}</td>
                    <td className="py-3 px-3 text-slate-500">{charity.category}</td>
                    <td className="py-3 px-3 text-slate-700">{supporters.length} golfers</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{average.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-forest font-semibold">{charity.impactMetric}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
