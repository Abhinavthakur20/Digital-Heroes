"use client";

import { useMemo, useState } from "react";
import { HeartHandshake } from "lucide-react";
import type { Charity } from "@/lib/types";

export function CharityPicker({
  charities,
  selectedId: controlledSelectedId,
  charityPct: controlledCharityPct,
  onChange
}: {
  charities: Charity[];
  selectedId?: string;
  charityPct?: number;
  onChange?: (selected: { charityId: string; charityPct: number }) => void;
}) {
  const [internalSelectedId, setInternalSelectedId] = useState(charities[0]?.id ?? "");
  const [internalCharityPct, setInternalCharityPct] = useState(15);

  const selectedId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;
  const charityPct = controlledCharityPct !== undefined ? controlledCharityPct : internalCharityPct;

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
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft flex flex-col justify-between">
        <div>
          <label className="block text-xs font-semibold text-slate-700" htmlFor="charity">
            Designated Giving Partner
          </label>
          <select
            id="charity"
            className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800"
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700" htmlFor="charityPct">
                Charity Allocation Percentage
              </label>
              <span className="font-mono text-sm font-bold text-forest">{charityPct}%</span>
            </div>
            <input
              id="charityPct"
              className="mt-2.5 w-full accent-forest cursor-pointer"
              type="range"
              min={10}
              max={60}
              step={2.5}
              value={charityPct}
              onChange={(event) => handlePctChange(Number(event.target.value))}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>10% Platform Minimum</span>
              <span>60% Maximum Cap</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
          This allocation is automatically deducted from your monthly membership fee and remitted directly to the partner.
        </p>
      </div>

      <aside className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-forest" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Selected Partner</span>
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-900">{selected?.name}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-3">
            {selected?.description}
          </p>
        </div>

        <div className="mt-5 rounded-lg bg-white border border-slate-200/80 p-3 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Impact:</span>
          <p className="mt-0.5 font-bold text-forest">{selected?.impactMetric}</p>
        </div>
      </aside>
    </div>
  );
}
