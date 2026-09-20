import { ScoreForm } from "@/components/score-form";
import { getCurrentUser } from "@/lib/auth";
import { getScores } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ScoresPage() {
  const user = await getCurrentUser();
  const userId = user?.id ?? "user-ava";
  const userScores = await getScores(userId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-semibold text-ink">Golf Scores</h1>
          <p className="mt-2 max-w-2xl text-ink/65">
            Database uniqueness prevents duplicate dates; application logic keeps only the five most recent scores for draw weighting.
          </p>
        </div>
        <div className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-xs font-medium text-ink/70">
          User: <strong className="text-ink">{user?.fullName ?? "Ava Mitchell"}</strong>
        </div>
      </div>

      <div className="mt-8">
        <ScoreForm initialScores={userScores} userId={userId} />
      </div>
    </div>
  );
}
