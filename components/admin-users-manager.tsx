"use client";

import { useState } from "react";
import { shortDate } from "@/lib/format";
import type { Profile, Role, Subscription, SubscriptionStatus } from "@/lib/types";

type EnrichedUser = Profile & {
  subscription?: Subscription;
};

export function AdminUsersManager({ initialUsers }: { initialUsers: EnrichedUser[] }) {
  const [users, setUsers] = useState<EnrichedUser[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">User & Account</th>
              <th className="px-5 py-3.5">Assigned Role</th>
              <th className="px-5 py-3.5">Subscription Status</th>
              <th className="px-5 py-3.5">Charity Allocation</th>
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
  );
}
