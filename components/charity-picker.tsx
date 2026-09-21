"use client";

import { useMemo, useState } from "react";
import { HeartHandshake, TrendingUp } from "lucide-react";
import type { Charity } from "@/lib/types";

export function CharityPicker({
  charities,
  selectedId: controlledSelectedId,
  charityPct: controlledCharityPct,
  onChange,
}: {
  charities: Charity[];
  selectedId?: string;
  charityPct?: number;
  onChange?: (selected: { charityId: string; charityPct: number }) => void;
}) {
  const [internalSelectedId, setInternalSelectedId] = useState(
    charities[0]?.id ?? ""
  );
  const [internalCharityPct, setInternalCharityPct] = useState(15);

  const selectedId =
    controlledSelectedId !== undefined
      ? controlledSelectedId
      : internalSelectedId;
  const charityPct =
    controlledCharityPct !== undefined
      ? controlledCharityPct
      : internalCharityPct;

  const selected = useMemo(
    () => charities.find((charity) => charity.id === selectedId) ?? charities[0],
    [charities, selectedId]
  );

  function handleCharityChange(id: string) {
    setInternalSelectedId(id);
    if (onChange) onChange({ charityId: id, charityPct });
  }

  function handlePctChange(pct: number) {
    setInternalCharityPct(pct);
    if (onChange) onChange({ charityId: selectedId, charityPct: pct });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      {/* Left: selector + slider */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft flex flex-col justify-between">
        <div>
          <label
            className="block text-xs font-semibold text-slate-700 mb-1.5"
            htmlFor="charity"
          >
            Giving Partner
          </label>
          <select
            id="charity"
            className="premium-input"
            value={selectedId}
            onChange={(event) => handleCharityChange(event.target.value)}
          >
            {charities.map((charity) => (
              <option key={charity.id} value={charity.id}>
                {charity.name} ({charity.category})
              </option>
            ))}
          </select>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-xs font-semibold text-slate-700"
                htmlFor="charityPct"
              >
                Allocation Percentage
              </label>
              <span className="inline-flex items-center gap-1 rounded-lg bg-forest-50 px-2.5 py-1 font-mono text-sm font-bold text-forest">
                <TrendingUp className="h-3.5 w-3.5" />
                {charityPct}%
              </span>
            </div>

            {/* Custom range track */}
            <div className="relative pt-1">
              <input
                id="charityPct"
                className="w-full accent-forest cursor-pointer h-2 rounded-full appearance-none bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-forest [&::-webkit-slider-thumb]:shadow-glow [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                type="range"
                min={10}
                max={60}
                step={2.5}
                value={charityPct}
                onChange={(event) =>
                  handlePctChange(Number(event.target.value))
                }
              />
              {/* Progress fill illusion */}
              <div
                className="absolute top-1 left-0 h-2 rounded-full bg-gradient-to-r from-forest to-forest-600 pointer-events-none"
                style={{
                  width: `${((charityPct - 10) / 50) * 100}%`,
                }}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>10% min</span>
              <span>60% max</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 border-t border-slate-100 pt-3 leading-relaxed">
          This allocation is automatically deducted from your membership fee and
          remitted directly to the partner.
        </p>
      </div>

      {/* Right: preview card */}
      <aside className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest/10">
              <HeartHandshake className="h-3.5 w-3.5 text-forest" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Selected Partner
            </span>
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-900">
            {selected?.name}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-3">
            {selected?.description}
          </p>
        </div>

        <div className="mt-5 rounded-xl bg-white border border-slate-200/80 p-3.5 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Verified Impact
          </span>
          <p className="mt-1 text-sm font-bold text-forest">
            {selected?.impactMetric}
          </p>
        </div>
      </aside>
    </div>
  );
}
