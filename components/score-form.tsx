"use client";

import { useMemo, useState } from "react";
import { Check, CheckCircle2, Edit3, History, Loader2, PlusCircle, Save, Trash2, X } from "lucide-react";
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

  // Inline edit state
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(36);
  const [editDate, setEditDate] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);

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
      setError("A round has already been submitted for this date. (1 entry per date rule — edit existing instead)");
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

  function startEdit(score: Score) {
    setEditingScoreId(score.id);
    setEditValue(score.value);
    setEditDate(score.playedOn);
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditingScoreId(null);
  }

  async function saveEdit(scoreId: string) {
    if (editValue < 1 || editValue > 45) {
      setError("Stableford score must be between 1 and 45.");
      return;
    }

    // Check duplicate date with other rounds
    const duplicate = scores.some((s) => s.id !== scoreId && s.playedOn === editDate);
    if (duplicate) {
      setError("Another round already exists on this date.");
      return;
    }

    setEditLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreId,
          userId,
          value: editValue,
          playedOn: editDate
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update score");
      }

      setScores(data.rollingScores);
      setSuccess(`Round updated to ${editValue} pts on ${shortDate(editDate)}.`);
      setEditingScoreId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update score.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(scoreId: string) {
    if (!confirm("Are you sure you want to delete this round entry?")) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/scores?scoreId=${scoreId}&userId=${userId || ""}`, {
        method: "DELETE"
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete score");
      }

      setScores(data.rollingScores);
      setSuccess("Round deleted successfully. Rolling 5 updated.");
      if (editingScoreId === scoreId) {
        setEditingScoreId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete score.");
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

      {/* Rolling 5 Display with Edit & Delete */}
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
          Reverse chronological ranking. Click the edit icon to adjust points or date, or delete an incorrect entry.
        </p>

        <div className="mt-4 divide-y divide-slate-100">
          {orderedScores.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">
              No rounds recorded yet. Complete the form to log your first round.
            </p>
          ) : (
            orderedScores.map((score, index) => {
              const isEditing = editingScoreId === score.id;

              return (
                <div key={score.id} className="py-3">
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-forest/30 bg-forest/5 p-3">
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={45}
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className="w-16 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs font-bold text-slate-900"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">pts</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(score.id)}
                          disabled={editLoading}
                          className="inline-flex items-center gap-1 rounded bg-forest px-2.5 py-1 text-xs font-semibold text-white hover:bg-forest-800 transition-colors"
                        >
                          {editLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={editLoading}
                          className="inline-flex items-center gap-1 rounded bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition-colors"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-medium text-slate-700">{shortDate(score.playedOn)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-base font-bold text-slate-900">{score.value}</span>
                          <span className="text-[11px] text-slate-400 font-medium">pts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(score)}
                            title="Edit this score"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(score.id)}
                            title="Delete this score"
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
