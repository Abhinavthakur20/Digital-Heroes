"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { CharityPicker } from "./charity-picker";
import type { Charity } from "@/lib/types";

export function SignupForm({ charities }: { charities: Charity[] }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [charityId, setCharityId] = useState(charities[0]?.id ?? "");
  const [charityPct, setCharityPct] = useState(15);
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!charityId) {
      setError("Please choose a charity partner.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          charityId,
          charityPct,
          plan,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete signup");
      }

      router.push(data.redirectTo || `/dashboard?checkout=payment_required&plan=${plan}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Signup registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 flex-none mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* ── Step 1: Member Info ── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-forest text-[10px] font-black text-white">
            1
          </span>
          <h2 className="text-sm font-bold text-slate-900">Member Information</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                className="premium-input !pl-12"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Colin Montgomerie"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                className="premium-input !pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colin@example.com"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="premium-input !pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Step 2: Charity ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-forest text-[10px] font-black text-white">
            2
          </span>
          <h2 className="text-sm font-bold text-slate-900">Choose Your Charity</h2>
        </div>
        <CharityPicker
          charities={charities}
          selectedId={charityId}
          charityPct={charityPct}
          onChange={({ charityId: id, charityPct: pct }) => {
            setCharityId(id);
            setCharityPct(pct);
          }}
        />
      </section>

      {/* ── Step 3: Plan Selection ── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-forest text-[10px] font-black text-white">
            3
          </span>
          <h2 className="text-sm font-bold text-slate-900">Select Your Plan</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Monthly */}
          <button
            type="button"
            onClick={() => setPlan("monthly")}
            className={`group relative cursor-pointer rounded-2xl border-2 p-5 text-left transition-all duration-300 ${
              plan === "monthly"
                ? "border-forest bg-forest-50/50 shadow-glow"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Monthly</span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                  plan === "monthly"
                    ? "border-forest bg-forest"
                    : "border-slate-300"
                }`}
              >
                {plan === "monthly" && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
            <p className="mt-3 font-mono text-2xl font-extrabold text-slate-900">
              $20
              <span className="ml-1 text-xs font-normal text-slate-500 font-sans">
                / month
              </span>
            </p>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              1 draw ticket per month, real-time round logging, and charitable
              allocation.
            </p>
          </button>

          {/* Yearly */}
          <button
            type="button"
            onClick={() => setPlan("yearly")}
            className={`group relative cursor-pointer rounded-2xl border-2 p-5 text-left transition-all duration-300 ${
              plan === "yearly"
                ? "border-forest bg-forest-50/50 shadow-glow"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            {/* savings badge */}
            <div className="absolute -top-2.5 right-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-dark to-gold px-2.5 py-0.5 text-[10px] font-bold text-white shadow-goldGlow">
                <Sparkles className="h-3 w-3" />
                Save $40/yr
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Yearly</span>
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                  plan === "yearly"
                    ? "border-forest bg-forest"
                    : "border-slate-300"
                }`}
              >
                {plan === "yearly" && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
            <p className="mt-3 font-mono text-2xl font-extrabold text-slate-900">
              $200
              <span className="ml-1 text-xs font-normal text-slate-500 font-sans">
                / year
              </span>
            </p>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              12 months of draws with full ticket rollover protection and
              amplified giving.
            </p>
          </button>
        </div>

        {/* submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-6"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Create Account & Continue to Payment
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          Encrypted registration · Membership activates after verified payment
        </p>
      </section>
    </form>
  );
}
