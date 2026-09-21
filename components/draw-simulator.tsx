"use client";

import { useState } from "react";
import { CheckCircle2, Dices, Loader2, Rocket } from "lucide-react";
import { money } from "@/lib/format";
import type { DrawType } from "@/lib/types";

type SimulationResponse = {
  result: {
    winningNumbers: number[];
    activeSubscriberCount?: number;
    recognizedRevenue?: number;
    pools: {
      totalPool?: number;
      pool5: number;
      pool4: number;
      pool3: number;
      nextRollover: number;
    };
    winners: Array<{ id: string; userId: string; matchTier: number; amount: number }>;
  };
  message?: string;
};

export function DrawSimulator({ onPublished }: { onPublished?: () => void }) {
  const [drawType, setDrawType] = useState<DrawType>("algorithmic");
  const [month, setMonth] = useState("2026-09-01");
  const [result, setResult] = useState<SimulationResponse["result"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [published, setPublished] = useState(false);

  async function simulate() {
    setLoading(true);
    setStatusMessage("");
    setPublished(false);
    try {
      const response = await fetch("/api/draws/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ drawType, month })
      });
      const data = (await response.json()) as SimulationResponse;
      setResult(data.result);
      setStatusMessage("Dry-run simulation completed. Review mathematical breakdown below.");
    } catch {
      setStatusMessage("Failed to execute simulation.");
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    setLoading(true);
    setStatusMessage("");
    try {
      const response = await fetch("/api/draws/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ drawType, month })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to publish draw");
      setResult(data.result);
      setPublished(true);
      setStatusMessage(data.message || "Official draw published! Member entries and winner claims created.");
      if (onPublished) onPublished();
      else window.location.reload();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Draw publication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-forest" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Draw Engine Console</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Simulate dry-run projects matching tickets without database commits. Official publish writes winner rows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="focus-ring rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="2026-09-01">September 2026</option>
            <option value="2026-10-01">October 2026</option>
            <option value="2026-11-01">November 2026</option>
          </select>

          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/70 p-1">
            {(["algorithmic", "random"] as DrawType[]).map((type) => (
              <button
                key={type}
                className={`focus-ring rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${
                  drawType === type
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setDrawType(type)}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={simulate}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
          disabled={loading}
        >
          {loading && !published ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Dices className="h-3.5 w-3.5 text-slate-500" />}
          Run Dry-Run Simulation
        </button>
        <button
          type="button"
          onClick={publish}
          className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-forest px-4 text-xs font-semibold text-white hover:bg-forest-800 disabled:opacity-50 transition-colors shadow-soft"
          disabled={loading}
        >
          {loading && published ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5 text-gold-light" />}
          Publish Official Draw
        </button>
      </div>

      {statusMessage ? (
        <div
          className={`mt-5 flex items-center gap-2 rounded-lg p-3 text-xs font-medium border ${
            published
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-slate-50 text-slate-800"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 flex-none text-emerald-700" />
          <span>{statusMessage}</span>
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3 pt-5 border-t border-slate-100">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Winning Numbers</span>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.winningNumbers.map((number) => (
                <span
                  key={number}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-obsidian-950 font-mono text-sm font-bold text-white shadow-sm ring-1 ring-white/20"
                >
                  {number}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Selected via {drawType} mode with 1–49 range
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Prize Pool Distribution</span>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Tier 1 (5 Matches - 40%):</span>
                <span className="font-mono text-forest">{money(result.pools.pool5)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tier 2 (4 Matches - 35%):</span>
                <span className="font-mono">{money(result.pools.pool4)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tier 3 (3 Matches - 25%):</span>
                <span className="font-mono">{money(result.pools.pool3)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Claim Results</span>
            <p className="mt-1 text-2xl font-bold font-mono text-slate-900">{result.winners.length} Winners</p>
            <div className="mt-2 flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
              <span className="text-slate-500">Next Rollover:</span>
              <span className="font-bold font-mono text-gold-dark">{money(result.pools.nextRollover)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
