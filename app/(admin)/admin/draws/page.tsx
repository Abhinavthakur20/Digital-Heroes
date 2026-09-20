import { DrawSimulator } from "@/components/draw-simulator";
import { getDraws } from "@/lib/store";
import { money, monthLabel } from "@/lib/format";
import { StatusPill } from "@/components/status-pill";

export const dynamic = "force-dynamic";

export default async function AdminDrawsPage() {
  const allDraws = await getDraws();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest">
            <span>Draw Engine Administration</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Draw Configurations & Jackpots
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Simulate dry-run matching, audit revenue allocations, and officially commit monthly prize distributions.
          </p>
        </div>
        <StatusPill tone="green">Draw Engine Active</StatusPill>
      </div>

      <DrawSimulator />

      <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Official Published Draws</h2>
            <p className="text-xs text-slate-500">Historical records of executed draws and jackpot rollovers</p>
          </div>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
            {allDraws.length} Draws Recorded
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {allDraws.map((draw) => (
            <article
              key={draw.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 sm:flex-row sm:items-center hover:bg-slate-50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-slate-900 text-base">{monthLabel(draw.month)}</p>
                  <span className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                    {draw.drawType}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 mr-1">Winning Sequence:</span>
                  {draw.winningNumbers.map((n) => (
                    <span
                      key={n}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-obsidian-900 font-mono text-xs font-bold text-white shadow-sm ring-1 ring-white/10"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="mt-2.5 flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                  <span>5-Match: <strong className="text-slate-800 font-mono">{money(draw.pool5Match)}</strong></span>
                  <span>4-Match: <strong className="text-slate-800 font-mono">{money(draw.pool4Match)}</strong></span>
                  <span>3-Match: <strong className="text-slate-800 font-mono">{money(draw.pool3Match)}</strong></span>
                </div>
              </div>

              <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-200/60 pt-3 sm:pt-0">
                <StatusPill tone="green">{draw.status}</StatusPill>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next Rollover</p>
                  <p className="text-base font-bold font-mono text-forest">{money(draw.jackpotRollover)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
