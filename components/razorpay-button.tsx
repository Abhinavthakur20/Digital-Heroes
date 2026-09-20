"use client";

import { useState } from "react";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayButton({
  plan = "monthly",
  className,
  label
}: {
  plan?: "monthly" | "yearly";
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePayment() {
    setLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create order on backend
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });

      const orderData = await res.json();
      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || "Failed to initialize payment");
      }

      // 2. Configure Razorpay checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Digital Heroes",
        description: `${plan === "yearly" ? "Yearly" : "Monthly"} Membership Subscription`,
        image: "/images/logo.jpg",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user?.fullName || "",
          email: orderData.user?.email || ""
        },
        theme: {
          color: "#0D5C3A" // Digital Heroes Forest Green
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async function (response: any) {
          // 3. Verify payment signature on backend
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setSuccess(true);
              setTimeout(() => {
                window.location.reload();
              }, 1200);
            } else {
              alert(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Error verifying payment.");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert(err instanceof Error ? err.message : "Payment failed to start.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
        <CheckCircle className="h-4 w-4 text-emerald-500" />
        Payment Verified! Reloading...
      </span>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={
        className ||
        "focus-ring inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-700 transition-all duration-200 disabled:opacity-50"
      }
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Opening Razorpay...</span>
        </>
      ) : (
        <>
          <CreditCard className="h-3.5 w-3.5" />
          <span>{label || `Pay ₹${plan === "yearly" ? "16,000" : "1,600"} with Razorpay`}</span>
        </>
      )}
    </button>
  );
}
