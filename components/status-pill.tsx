import { clsx } from "clsx";

const toneClass = {
  green: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  amber: "bg-amber-50 text-amber-900 border-amber-200/80",
  red: "bg-rose-50 text-rose-800 border-rose-200/80",
  slate: "bg-slate-50 text-slate-700 border-slate-200/80",
  gold: "bg-gold-light text-gold-dark border-gold-border"
};

const dotClass = {
  green: "bg-emerald-600",
  amber: "bg-amber-600",
  red: "bg-rose-600",
  slate: "bg-slate-500",
  gold: "bg-gold"
};

export function StatusPill({
  children,
  tone = "slate"
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClass;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        toneClass[tone]
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", dotClass[tone])} />
      {children}
    </span>
  );
}
