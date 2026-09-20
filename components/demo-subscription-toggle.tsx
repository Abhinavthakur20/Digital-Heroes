"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";
import type { SubscriptionStatus } from "@/lib/types";

export function DemoSubscriptionToggle({
  userId,
  initialStatus,
  hasStripeCustomer
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
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {status === "active" ? (
        <a
          href="/api/stripe/portal"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          title="Open Stripe Customer Portal to manage cards and invoices"
        >
          <CreditCard className="h-3.5 w-3.5 text-forest" />
          <span>Stripe Billing Portal</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </a>
      ) : (
        <a
          href="/api/stripe/checkout?plan=monthly"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-forest-700 transition-colors"
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Pay via Stripe</span>
        </a>
      )}

      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
        <select
          value={status}
          disabled={loading}
          onChange={(e) => handleStatusChange(e.target.value as SubscriptionStatus)}
          className="focus-ring rounded-md border-0 bg-transparent px-2 py-1 text-[11px] font-semibold capitalize text-slate-600 focus:bg-white"
          title="Simulation State Override"
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
