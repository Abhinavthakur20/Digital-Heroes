import { WinnerCard } from "@/components/winner-card";
import { getProfiles, getWinners } from "@/lib/store";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminWinnersPage() {
  const [allWinners, profiles] = await Promise.all([
    getWinners(),
    getProfiles()
  ]);

  const totalPrizeLiability = allWinners.reduce((sum, w) => sum + w.amount, 0);
  const pendingProofCount = allWinners.filter((w) => w.verificationStatus === "pending").length;
  const approvedCount = allWinners.filter((w) => w.verificationStatus === "approved").length;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-16 sm:pt-32 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest">
            <span>Disbursement & Verification</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Winner Claims & Proof Audit
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Review submitted scorecard proof screenshots, certify match eligibility, and authorize direct payouts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-1 text-amber-900">
            {pendingProofCount} Pending Proof
          </span>
          <span className="rounded-lg bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-emerald-900">
            {approvedCount} Approved
          </span>
          <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-slate-800 font-mono">
            Total Pools: {money(totalPrizeLiability)}
          </span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {allWinners.length === 0 ? (
          <p className="col-span-full py-12 text-center text-xs text-slate-400">
            No prize claims recorded yet. Execute a draw to generate winners.
          </p>
        ) : (
          allWinners.map((winner) => (
            <WinnerCard
              key={winner.id}
              winner={winner}
              profile={profiles.find((profile) => profile.id === winner.userId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
