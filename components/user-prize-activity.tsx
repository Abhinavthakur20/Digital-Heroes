"use client";

import { useState } from "react";
import { Award, Check, CheckCircle2, DollarSign, Loader2, Trophy, Upload } from "lucide-react";
import { money } from "@/lib/format";
import type { Winner } from "@/lib/types";

export function UserPrizeActivity({ initialWinners }: { initialWinners: Winner[] }) {
  const [winners, setWinners] = useState<Winner[]>(initialWinners);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ id: string; message: string } | null>(null);

  async function handleUploadProof(winnerId: string) {
    if (!proofUrl.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/winners/${winnerId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      setWinners((prev) =>
        prev.map((w) => (w.id === winnerId ? data.winner : w))
      );
      setFeedback({ id: winnerId, message: "Proof uploaded! Admin certification pending." });
      setUploadingForId(null);
      setProofUrl("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" />
            <h2 className="text-base font-bold text-slate-900">Prize Activity & Winnings</h2>
          </div>
          <p className="text-xs text-slate-500">
            Submit official scorecard screenshot proof to authorize prize distribution
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold font-mono text-slate-700">
          {winners.length} Claims
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {winners.length === 0 ? (
          <p className="col-span-full py-10 text-center text-xs text-slate-400">
            No prize claims recorded yet. Keep logging your scores to participate in monthly draws.
          </p>
        ) : (
          winners.map((winner) => {
            const isApproved = winner.verificationStatus === "approved";
            const isPaid = winner.paymentStatus === "paid";
            const isRejected = winner.verificationStatus === "rejected";

            return (
              <div
                key={winner.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 transition-all hover:bg-slate-50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Award className="h-3.5 w-3.5 text-gold" />
                      {winner.matchTier}-Match Prize
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-800"
                          : isRejected
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {winner.verificationStatus}
                    </span>
                  </div>

                  <p className="mt-3 text-3xl font-extrabold font-mono text-slate-900">{money(winner.amount)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Draw {winner.drawId.replace("published-", "")} · Payout:{" "}
                    <strong className="capitalize text-slate-700">{winner.paymentStatus}</strong>
                  </p>

                  {feedback?.id === winner.id ? (
                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {feedback.message}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 border-t border-slate-200/60 pt-3">
                  {!isPaid && (
                    <>
                      {uploadingForId === winner.id ? (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-slate-700">
                            Scorecard Proof Link:
                          </label>
                          <input
                            type="text"
                            placeholder="Enter image link"
                            value={proofUrl}
                            onChange={(e) => setProofUrl(e.target.value)}
                            className="focus-ring w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                          />
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setProofUrl(
                                  "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=800&q=80"
                                )
                              }
                              className="text-[11px] font-semibold text-forest underline hover:text-forest-800"
                            >
                              Insert sample scorecard
                            </button>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setUploadingForId(null)}
                                className="rounded px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200/60"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={loading}
                                onClick={() => handleUploadProof(winner.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-forest px-3 py-1 text-xs font-semibold text-white hover:bg-forest-800"
                              >
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {winner.proofUrl ? "Proof Submitted" : "Proof Required"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadingForId(winner.id);
                              setProofUrl(
                                winner.proofUrl ||
                                  "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=800&q=80"
                              );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            <Upload className="h-3 w-3 text-slate-500" />
                            {winner.proofUrl ? "Replace proof" : "Upload proof"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {isPaid && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <DollarSign className="h-3.5 w-3.5" />
                      Disbursed to bank account on file
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
