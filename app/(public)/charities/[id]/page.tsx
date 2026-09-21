import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Calendar, HeartHandshake, MapPin, Sparkles, Trophy, Users } from "lucide-react";
import { getCharities, getCharity, getProfiles } from "@/lib/store";
import { shortDate } from "@/lib/format";
import { CharitySupportPanel } from "@/components/charity-support-panel";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const charities = await getCharities();
  return charities.map((charity) => ({ id: charity.id }));
}

export default async function CharityProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [charity, profiles] = await Promise.all([
    getCharity(id),
    getProfiles()
  ]);

  if (!charity) {
    notFound();
  }

  const supporters = profiles.filter((profile) => profile.charityId === charity.id);
  const avgAllocation =
    supporters.length > 0
      ? supporters.reduce((total, profile) => total + profile.charityPct, 0) / supporters.length
      : 10;

  const events = charity.upcomingEvents || [];

  return (
    <div className="pb-20 space-y-12">
      {/* Editorial Header */}
      <section className="relative min-h-[440px] overflow-hidden bg-obsidian-950">
        <Image
          src={charity.imageUrl}
          alt={charity.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian-950 via-obsidian-950/80 to-transparent" />

        <div className="relative mx-auto flex min-h-[440px] max-w-7xl flex-col justify-end px-4 py-12 text-white sm:px-6 lg:px-8">
          <Link
            href="/charities"
            className="focus-ring inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to directory</span>
          </Link>

          <div className="mt-8 flex items-center gap-2">
            <span className="rounded-full bg-forest-700/80 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
              {charity.category}
            </span>
            {charity.isFeatured && (
              <span className="rounded-full bg-gold-light/20 border border-gold/40 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-gold">
                Featured Partner
              </span>
            )}
          </div>

          <h1 className="mt-3 max-w-3xl text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {charity.name}
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300">
            {charity.description}
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <article className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Impact</span>
            <Award className="h-4 w-4 text-forest" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{charity.impactMetric}</p>
          <p className="mt-1 text-xs text-slate-500">Directly funded through membership allocations</p>
        </article>

        <article className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Supporters</span>
            <Users className="h-4 w-4 text-forest" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{supporters.length} Golfers</p>
          <p className="mt-1 text-xs text-slate-500">Subscribers currently designating this cause</p>
        </article>

        <article className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mean Allocation</span>
            <HeartHandshake className="h-4 w-4 text-forest" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900">{avgAllocation.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-slate-500">Above the 10% platform giving floor</p>
        </article>
      </section>

      {/* Upcoming Events / Golf Days Section (§08.2) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-forest" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upcoming Golf Days & Charity Events</h2>
                <p className="text-xs text-slate-500">Participate, compete, and meet fellow changemakers on the course</p>
              </div>
            </div>
            <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest">
              {events.length} Scheduled
            </span>
          </div>

          {events.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              No upcoming golf days scheduled at this time. Check back soon for seasonal tournament announcements!
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((evt) => (
                <article
                  key={evt.id}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 p-5 hover:border-forest/30 hover:bg-white hover:shadow-card transition-all duration-200"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-forest/10 px-2.5 py-1 text-[11px] font-bold text-forest">
                        <Calendar className="h-3 w-3" />
                        {shortDate(evt.date)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {evt.location}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-forest transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-emerald-700">Official Sanctioned Event</span>
                    <span className="font-bold text-forest">Registration Open →</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Support Box with Independent Donation Modal */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CharitySupportPanel charity={charity} />
      </section>
    </div>
  );
}
