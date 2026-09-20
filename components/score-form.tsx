"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, History, Loader2, PlusCircle, Save } from "lucide-react";
import { shortDate } from "@/lib/format";
import type { Score } from "@/lib/types";

export function ScoreForm({
  initialScores,
  userId
}: {
  initialScores: Score[];
  userId?: string;
}) {
  const [scores, setScores] = useState(initialScores);
  const [playedOn, setPlayedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [value, setValue] = useState(36);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const orderedScores = useMemo(
    () => [...scores].sort((a, b) => b.playedOn.localeCompare(a.playedOn)),
    [scores]
  );

  async function addScore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (value < 1 || value > 45) {
      setError("Stableford score must be between 1 and 45.");
      return;
    }

    if (scores.some((score) => score.playedOn === playedOn)) {
      setError("A round has already been submitted for this date. (1 entry per date rule)");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, playedOn, userId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to record score");
      }

      setScores(data.rollingScores);
      setSuccess(`Score of ${value} pts logged for ${shortDate(playedOn)}. Rolling 5 updated.`);
      const nextDate = new Date(playedOn);
      nextDate.setDate(nextDate.getDate() - 1);
      setPlayedOn(nextDate.toISOString().slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Entry Form */}
      <form onSubmit={addScore} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PlusCircle className="h-4 w-4 text-forest" />
            <h2 className="text-base font-bold text-slate-900">Log Stableford Round</h2>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Submit official 18-hole Stableford point totals (1–45). Only your latest 5 rounds are factored into monthly algorithmic draw weightings.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700" htmlFor="playedOn">
                Date of Round
              </label>
              <input
                id="playedOn"
                type="date"
                required
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800"
                value={playedOn}
                onChange={(event) => {
                  setPlayedOn(event.target.value);
                  setError("");
                  setSuccess("");
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700" htmlFor="scoreValue">
                Points Total (1–45)
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="scoreValue"
                  type="number"
                  min={1}
                  max={45}
                  required
                  className="focus-ring w-28 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-base font-bold text-slate-900"
                  value={value}
                  onChange={(event) => {
                    setValue(Number(event.target.value));
                    setError("");
                    setSuccess("");
                  }}
                />
                <span className="text-xs text-slate-500">Stableford scoring format</span>
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-xs font-medium text-rose-800">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs font-medium text-emerald-900">
              <CheckCircle2 className="h-4 w-4 flex-none text-emerald-700" />
              <span>{success}</span>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-forest px-4 text-xs font-semibold text-white hover:bg-forest-800 disabled:opacity-50 transition-colors shadow-soft"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-gold-light" />}
          Record Round
        </button>
      </form>

      {/* Rolling 5 Display */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-forest" />
            <h2 className="text-base font-bold text-slate-900">Active Rolling-5 Rounds</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {orderedScores.length} / 5 Stored
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Reverse chronological ranking. Newer rounds automatically displace older records.
        </p>

        <div className="mt-4 divide-y divide-slate-100">
          {orderedScores.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              No rounds recorded yet. Complete the form to log your first round.
            </p>
          ) : (
            orderedScores.map((score, index) => (
              <div key={score.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-700">{shortDate(score.playedOn)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-base font-bold text-slate-900">{score.value}</span>
                  <span className="text-[11px] text-slate-400 font-medium">pts</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
