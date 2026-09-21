"use client";

import { Calendar, CheckCircle2, Clock, Sparkles, Trophy } from "lucide-react";
import { money, monthLabel } from "@/lib/format";
import type { Draw, DrawEntry } from "@/lib/types";

export function UserParticipationSummary({
  upcomingDrawDate,
  estimatedPrizePool,
  isSubscribed,
  drawsEntered,
  publishedDraws
}: {
  upcomingDrawDate: string;
  estimatedPrizePool: number;
  isSubscribed: boolean;
  drawsEntered: DrawEntry[];
  publishedDraws: Draw[];
}) {
  // Days until upcoming draw
  const target = new Date(upcomingDrawDate).getTime();
  const diffDays = Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <section className="space-y-6">
      {/* Upcoming Draw Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-forest-950 p-6 sm:p-8 text-white shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span>Next Official Monthly Draw</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {monthLabel(upcomingDrawDate.slice(0, 7) + "-01")} Championship Draw
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Every active subscriber is automatically assigned a 5-number algorithmic entry anchored around their rolling-5 Stableford scoring vector.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projected Pool</span>
              <p className="mt-1 text-2xl font-mono font-extrabold text-gold">{money(estimatedPrizePool)}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Countdown</span>
              <p className="mt-1 text-2xl font-mono font-extrabold text-white">{diffDays} Days</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Ticket</span>
              <div className="mt-1 flex items-center justify-center gap-1">
                {isSubscribed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Eligible
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400">Sub Required</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draws Entered History */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-forest" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Participation History & Tickets</h3>
              <p className="text-xs text-slate-500">Historical record of monthly draw entries and matched sequences</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {drawsEntered.length} Draws Entered
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {drawsEntered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No previous draw entries on file. Your ticket will be generated automatically for the next scheduled monthly draw.
            </div>
          ) : (
            drawsEntered.map((entry) => {
              const draw = publishedDraws.find((d) => d.id === entry.drawId);
              const winningNumbers = draw?.winningNumbers || [];

              return (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-50/50 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {draw ? monthLabel(draw.month) : "Monthly Draw"}
                      </span>
                      {draw?.drawType && (
                        <span className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                          {draw.drawType}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-slate-500 mr-1">Your 5 Numbers:</span>
                      {entry.numbers.map((n) => {
                        const isMatch = winningNumbers.includes(n);
                        return (
                          <span
                            key={n}
                            className={`flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-bold shadow-sm ${
                              isMatch
                                ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
                          >
                            {n}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {entry.matchCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                        <Trophy className="h-3 w-3 text-emerald-600" />
                        {entry.matchCount} Matches Hit!
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        No Tier Match
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
