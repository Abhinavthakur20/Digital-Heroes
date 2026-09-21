import { RazorpayButton } from "./razorpay-button";
import type { SubscriptionStatus } from "@/lib/types";

export function DemoSubscriptionToggle({
  initialStatus
}: {
  userId: string;
  initialStatus: SubscriptionStatus;
  hasStripeCustomer?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 text-xs">
      {initialStatus !== "active" && (
        <RazorpayButton
          plan="monthly"
          label="Pay with Razorpay (₹1,600/mo)"
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-forest hover:bg-forest-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
        />
      )}

      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
        {initialStatus}
      </span>
    </div>
  );
}
