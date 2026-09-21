"use client";

import { useState } from "react";
import { CheckCircle2, HeartHandshake, Loader2, Sparkles, X } from "lucide-react";
import { money } from "@/lib/format";
import type { Charity } from "@/lib/types";

const PRESET_AMOUNTS = [10, 25, 50, 100];

export function IndependentDonationModal({
  charity,
  isOpen,
  onClose
}: {
  charity: Charity;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      setError("Please select or enter a valid donation amount.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/charities/${charity.id}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          donorName,
          donorEmail
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Donation failed");

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Donation failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSuccess(false);
    setError("");
    setCustomAmount("");
    setSelectedAmount(25);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/70 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white p-6 sm:p-8 shadow-2xl">
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Direct Impact Certified!</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Thank you, <strong className="text-slate-900">{donorName || "Hero"}</strong>! Your direct gift of{" "}
                <strong className="text-forest font-mono">{money(finalAmount)}</strong> to{" "}
                <strong className="text-slate-900">{charity.name}</strong> was recorded.
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                100% of this independent contribution is channeled directly to this non-profit mission, outside of gameplay.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 w-full rounded-lg bg-forest px-4 py-2.5 text-xs font-bold text-white hover:bg-forest-800 transition-colors"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleDonate} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Make an Independent Gift</h3>
                <p className="text-xs text-slate-500">
                  Direct donation to {charity.name} (Not tied to gameplay)
                </p>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Amount (USD)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((amt) => {
                  const isSelected = !customAmount && selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount("");
                      }}
                      className={`rounded-lg border py-2 text-xs font-bold font-mono transition-all ${
                        isSelected
                          ? "border-forest bg-forest text-white shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ${amt}
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <div className="mt-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min={1}
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setError("");
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-7 pr-3 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Donor info */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Donor Full Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Spieth"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address for Receipt (optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-forest text-xs font-bold text-white hover:bg-forest-800 transition-colors shadow-soft disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-gold-light" />
                  <span>Donate {money(finalAmount)} Now</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Tax-exempt charitable receipt provided immediately upon confirmation.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
