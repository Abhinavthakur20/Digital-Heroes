"use client";

import { useState } from "react";
import { RazorpayButton } from "./razorpay-button";
import type { SubscriptionStatus } from "@/lib/types";

export function DemoSubscriptionToggle({
  userId,
  initialStatus
}: {
  userId: string;
  initialStatus: SubscriptionStatus;
  hasStripeCustomer?: boolean;
}) {
  const [status, setStatus] = useState<SubscriptionStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: SubscriptionStatus) {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: newStatus })
      });
      if (response.ok) {
        setStatus(newStatus);
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-xs">
      {status !== "active" && (
        <RazorpayButton
          plan="monthly"
          label="Pay with Razorpay (₹1,600/mo)"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-forest hover:bg-forest-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
        />
      )}

      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
        <select
          value={status}
          disabled={loading}
          onChange={(e) => handleStatusChange(e.target.value as SubscriptionStatus)}
          className="focus-ring rounded-md border-0 bg-transparent px-2 py-1 text-[11px] font-semibold capitalize text-slate-600 focus:bg-white"
          title="State Override"
        >
          <option value="active">Active (Eligible)</option>
          <option value="lapsed">Lapsed (Past Due)</option>
          <option value="cancelled">Cancelled</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}
