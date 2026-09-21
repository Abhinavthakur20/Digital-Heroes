"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, Check, DollarSign, FileCheck, Loader2, X } from "lucide-react";
import { money } from "@/lib/format";
import type { Profile, Winner } from "@/lib/types";
import { StatusPill } from "./status-pill";

export function WinnerCard({
  winner: initialWinner,
  profile,
  onUpdate
}: {
  winner: Winner;
  profile?: Profile;
  onUpdate?: (updated: Winner) => void;
}) {
  const [winner, setWinner] = useState(initialWinner);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const approved = winner.verificationStatus === "approved";
  const rejected = winner.verificationStatus === "rejected";
  const isPaid = winner.paymentStatus === "paid";

  async function updateStatus(updates: {
    verificationStatus?: "approved" | "rejected";
    paymentStatus?: "paid" | "pending";
  }) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/winners/${winner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }
      setWinner(data.winner);
      if (onUpdate) onUpdate(data.winner);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update claim");
    } finally {
      setLoading(false);
    }
  }

  const defaultScorecardProof =
    "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=800&q=80";

  return (
    <>
      <article className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-soft transition-all duration-200 hover:border-slate-300 hover:shadow-card">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-forest">
              <Award className="h-4 w-4 text-gold" />
              {winner.matchTier}-Match Winner
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
              Draw {winner.drawId.replace("published-", "")}
            </span>
          </div>

          <h3 className="mt-3 text-base font-bold text-slate-900">{profile?.fullName ?? winner.userId}</h3>
          <p className="text-xs text-slate-500">{profile?.email ?? "Verified Member"}</p>
          <p className="mt-4 text-3xl font-extrabold font-mono text-slate-900">{money(winner.amount)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill tone={approved ? "green" : rejected ? "red" : "amber"}>
              {winner.verificationStatus}
            </StatusPill>
            <StatusPill tone={isPaid ? "green" : "slate"}>
              {winner.paymentStatus === "paid" ? "paid" : "unpaid"}
            </StatusPill>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="focus-ring mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <FileCheck className="h-3.5 w-3.5 text-slate-500" />
          Review Proof & Payout
        </button>
      </article>

      {/* Review Modal */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Verify Prize Claim</h2>
                <p className="text-xs text-slate-500">
                  Inspect scorecard screenshot before approving payout
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500">Subscriber:</span>
                  <p className="font-bold text-slate-900">{profile?.fullName ?? winner.userId}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Prize Amount:</span>
                  <p className="font-bold font-mono text-forest">{money(winner.amount)}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Match Tier:</span>
                  <p className="font-semibold text-slate-800">{winner.matchTier} Numbers Matched</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Verification:</span>
                  <p className="font-semibold capitalize text-slate-800">{winner.verificationStatus}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700">Submitted Scorecard Proof:</span>
                <div className="relative mt-2 h-48 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <Image
                    src={winner.proofUrl || defaultScorecardProof}
                    alt="Proof screenshot"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-obsidian-950/80 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
                    {winner.proofUrl ? "Proof Submitted" : "Sample Verified Scorecard"}
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-800">
                  {error}
                </div>
              ) : null}

              {/* Actions */}
              <div className="border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-semibold text-slate-700">Administrative Decision:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={loading || approved}
                    onClick={() => updateStatus({ verificationStatus: "approved" })}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-forest px-3.5 text-xs font-semibold text-white hover:bg-forest-800 disabled:opacity-40 transition-colors"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Approve Proof
                  </button>

                  <button
                    type="button"
                    disabled={loading || rejected}
                    onClick={() => updateStatus({ verificationStatus: "rejected" })}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject Claim
                  </button>

                  <button
                    type="button"
                    disabled={loading || !approved || isPaid}
                    onClick={() => updateStatus({ paymentStatus: "paid" })}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-obsidian-900 px-3.5 text-xs font-semibold text-white hover:bg-obsidian-950 disabled:opacity-30 transition-colors"
                    title={!approved ? "Proof must be approved before marking as paid" : ""}
                  >
                    <DollarSign className="h-3.5 w-3.5 text-gold-light" />
                    {isPaid ? "Paid in Full" : "Authorize Payout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
