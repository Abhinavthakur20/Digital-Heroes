"use client";

import { useState } from "react";
import { Check, Edit3, Loader2, Plus, Target, Trash2, X } from "lucide-react";
import { shortDate } from "@/lib/format";
import type { Profile, Role, Score, Subscription, SubscriptionStatus } from "@/lib/types";

type EnrichedUser = Profile & {
  subscription?: Subscription;
};

export function AdminUsersManager({ initialUsers }: { initialUsers: EnrichedUser[] }) {
  const [users, setUsers] = useState<EnrichedUser[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Scores Modal State
  const [activeScoreUser, setActiveScoreUser] = useState<EnrichedUser | null>(null);
  const [userScores, setUserScores] = useState<Score[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [scoreError, setScoreError] = useState("");
  const [scoreSuccess, setScoreSuccess] = useState("");

  // Edit Score in Modal
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(36);
  const [editDate, setEditDate] = useState<string>("");

  // New Score in Modal
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newValue, setNewValue] = useState(36);

  async function updateUser(userId: string, updates: {
    role?: Role;
    subscriptionStatus?: SubscriptionStatus;
    charityPct?: number;
  }) {
    setLoadingId(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");

      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== userId) return user;
          return {
            ...user,
            ...(data.profile || {}),
            subscription: data.subscription || user.subscription
          };
        })
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setLoadingId(null);
    }
  }

  async function openScoresModal(user: EnrichedUser) {
    setActiveScoreUser(user);
    setScoresLoading(true);
    setScoreError("");
    setScoreSuccess("");
    setEditingScoreId(null);
    try {
      const response = await fetch(`/api/scores?userId=${user.id}`);
      const data = await response.json();
      setUserScores(data.scores || []);
    } catch {
      setScoreError("Failed to load user scores.");
    } finally {
      setScoresLoading(false);
    }
  }

  async function handleAdminSaveEdit(scoreId: string) {
    if (!activeScoreUser) return;
    if (editValue < 1 || editValue > 45) {
      setScoreError("Stableford score must be between 1 and 45.");
      return;
    }

    setScoresLoading(true);
    setScoreError("");
    setScoreSuccess("");

    try {
      const response = await fetch("/api/scores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scoreId,
          userId: activeScoreUser.id,
          value: editValue,
          playedOn: editDate
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update score");

      setUserScores(data.rollingScores);
      setScoreSuccess(`Score updated to ${editValue} pts.`);
      setEditingScoreId(null);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setScoresLoading(false);
    }
  }

  async function handleAdminDeleteScore(scoreId: string) {
    if (!activeScoreUser) return;
    if (!confirm("Delete this user score?")) return;

    setScoresLoading(true);
    setScoreError("");
    setScoreSuccess("");

    try {
      const response = await fetch(`/api/scores?scoreId=${scoreId}&userId=${activeScoreUser.id}`, {
        method: "DELETE"
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete score");

      setUserScores(data.rollingScores);
      setScoreSuccess("Score removed from rolling 5.");
      if (editingScoreId === scoreId) setEditingScoreId(null);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : "Deletion failed");
    } finally {
      setScoresLoading(false);
    }
  }

  async function handleAdminAddScore(e: React.FormEvent) {
    e.preventDefault();
    if (!activeScoreUser) return;
    if (newValue < 1 || newValue > 45) {
      setScoreError("Stableford score must be between 1 and 45.");
      return;
    }

    setScoresLoading(true);
    setScoreError("");
    setScoreSuccess("");

    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeScoreUser.id,
          value: newValue,
          playedOn: newDate
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to record score");

      setUserScores(data.rollingScores);
      setScoreSuccess(`Logged ${newValue} pts on ${shortDate(newDate)}.`);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : "Failed to record score");
    } finally {
      setScoresLoading(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-xs">
            <thead className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User & Account</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Subscription Status</th>
                <th className="px-5 py-3.5">Charity Allocation</th>
                <th className="px-5 py-3.5">Golf Scores</th>
                <th className="px-5 py-3.5">Registration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((user) => {
                const subStatus = user.subscription?.status ?? "inactive";
                const isLoading = loadingId === user.id;

                return (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${isLoading ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-5 py-3.5">
                      <select
                        value={user.role}
                        disabled={isLoading}
                        onChange={(e) => updateUser(user.id, { role: e.target.value as Role })}
                        className="focus-ring rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 shadow-sm"
                      >
                        <option value="subscriber">Subscriber</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    {/* Subscription Status */}
                    <td className="px-5 py-3.5">
                      <select
                        value={subStatus}
                        disabled={isLoading}
                        onChange={(e) =>
                          updateUser(user.id, { subscriptionStatus: e.target.value as SubscriptionStatus })
                        }
                        className={`focus-ring rounded-md border px-2.5 py-1 text-xs font-semibold capitalize shadow-sm ${
                          subStatus === "active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : subStatus === "lapsed"
                            ? "border-amber-200 bg-amber-50 text-amber-900"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="lapsed">Lapsed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {user.subscription?.plan ? (
                        <span className="ml-2 text-[11px] text-slate-400 capitalize">
                          ({user.subscription.plan})
                        </span>
                      ) : null}
                    </td>

                    {/* Charity Allocation */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={10}
                          max={100}
                          step={1}
                          defaultValue={user.charityPct}
                          disabled={isLoading}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 10 && val <= 100 && val !== user.charityPct) {
                              updateUser(user.id, { charityPct: val });
                            }
                          }}
                          className="w-14 rounded-md border border-slate-200 px-2 py-1 font-mono text-xs font-bold text-slate-800"
                        />
                        <span className="text-[11px] text-slate-500">%</span>
                      </div>
                    </td>

                    {/* Golf Scores Manage Button */}
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => openScoresModal(user)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-forest hover:bg-forest/5 transition-colors shadow-sm"
                      >
                        <Target className="h-3 w-3" />
                        <span>Scores</span>
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                      {shortDate(user.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Admin Scores Management Modal */}
      {activeScoreUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Manage Golf Scores: {activeScoreUser.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect, adjust, or remove rounds from rolling-5 engine
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveScoreUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {scoreError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 font-medium">
                {scoreError}
              </div>
            )}
            {scoreSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-medium">
                {scoreSuccess}
              </div>
            )}

            {/* Existing Scores List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Active Rolling 5</span>
                <span>{userScores.length}/5 Stored</span>
              </div>

              {scoresLoading && userScores.length === 0 ? (
                <div className="flex py-6 justify-center text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : userScores.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">No rounds logged for this user.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                  {userScores.map((score, idx) => (
                    <div key={score.id} className="py-2.5 flex items-center justify-between text-xs">
                      {editingScoreId === score.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="rounded border border-slate-300 px-2 py-0.5 text-xs"
                          />
                          <input
                            type="number"
                            min={1}
                            max={45}
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className="w-14 rounded border border-slate-300 px-2 py-0.5 font-mono text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleAdminSaveEdit(score.id)}
                            className="rounded bg-forest px-2 py-0.5 text-[11px] font-bold text-white hover:bg-forest-800"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingScoreId(null)}
                            className="rounded bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">#{idx + 1}</span>
                            <span className="font-medium text-slate-800">{shortDate(score.playedOn)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-900">{score.value} pts</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingScoreId(score.id);
                                  setEditValue(score.value);
                                  setEditDate(score.playedOn);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdminDeleteScore(score.id)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Score for User Form */}
            <form onSubmit={handleAdminAddScore} className="rounded-xl border border-slate-200 bg-slate-50/75 p-3.5 space-y-3">
              <span className="text-xs font-bold text-slate-800">Add Score for User</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
                />
                <input
                  type="number"
                  min={1}
                  max={45}
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-bold text-slate-900"
                />
                <button
                  type="submit"
                  disabled={scoresLoading}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg bg-forest px-3 py-1 text-xs font-bold text-white hover:bg-forest-800"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
