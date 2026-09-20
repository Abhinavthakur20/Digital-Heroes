import { TrendingUp } from "lucide-react";

export function KpiCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-obsidian-900/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/[0.12] hover:bg-obsidian-850/90">
      {/* Subtle glow accent */}
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-forest/5 blur-2xl transition-all duration-500 group-hover:bg-forest/10" />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-forest/10">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-white tabular-nums">{value}</p>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span className="h-1 w-1 rounded-full bg-emerald-500/60" />
          <span>{detail}</span>
        </div>
      </div>
    </section>
  );
}
