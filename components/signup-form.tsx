"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, CreditCard, Loader2, ShieldCheck, Sparkles } from "lucide-react";
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
          plan
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete signup");
      }

      router.push(data.redirectTo || "/dashboard?checkout=success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 flex-none mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Account Info */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Member Information
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Full Name</label>
            <input
              required
              className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Colin Montgomerie"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              required
              type="email"
              className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colin@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <input
              type="password"
              className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Giving Partner */}
      <div>
        <h2 className="mb-3 text-base font-bold text-slate-900">
          2. Designated Charitable Cause
        </h2>
        <CharityPicker
          charities={charities}
          selectedId={charityId}
          charityPct={charityPct}
          onChange={({ charityId: id, charityPct: pct }) => {
            setCharityId(id);
            setCharityPct(pct);
          }}
        />
      </div>

      {/* Plan Selection */}
      <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          3. Membership Tier
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label
            onClick={() => setPlan("monthly")}
            className={`cursor-pointer rounded-xl border p-5 transition-all relative ${
              plan === "monthly"
                ? "border-forest bg-forest-50/40 ring-1 ring-forest shadow-soft"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Monthly Plan</span>
              <input
                className="accent-forest h-4 w-4"
                type="radio"
                name="plan"
                checked={plan === "monthly"}
                onChange={() => setPlan("monthly")}
              />
            </div>
            <p className="mt-3 font-mono text-2xl font-extrabold text-slate-900">$20 <span className="text-xs font-normal text-slate-500 font-sans">/ month</span></p>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Standard monthly billing with 1 ticket per draw, real-time round logging, and charitable allocation.
            </p>
          </label>

          <label
            onClick={() => setPlan("yearly")}
            className={`cursor-pointer rounded-xl border p-5 transition-all relative ${
              plan === "yearly"
                ? "border-forest bg-forest-50/40 ring-1 ring-forest shadow-soft"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Yearly Plan</span>
                <span className="rounded-full bg-gold-light border border-gold-border px-2 py-0.5 text-[10px] font-bold text-gold-dark">
                  Save $40 / yr
                </span>
              </div>
              <input
                className="accent-forest h-4 w-4"
                type="radio"
                name="plan"
                checked={plan === "yearly"}
                onChange={() => setPlan("yearly")}
              />
            </div>
            <p className="mt-3 font-mono text-2xl font-extrabold text-slate-900">$200 <span className="text-xs font-normal text-slate-500 font-sans">/ year</span></p>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Continuous annual entry with full ticket rollover protection and amplified annual giving impact.
            </p>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-forest px-6 text-xs font-bold text-white hover:bg-forest-800 disabled:opacity-50 transition-colors shadow-soft"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4 text-gold-light" />}
          Complete Registration & Enter Monthly Draw
        </button>

        <p className="mt-3 text-[11px] text-slate-400">
          Encrypted membership registration. In demo mode, accounts are instantaneously activated.
        </p>
      </section>
    </form>
  );
}
