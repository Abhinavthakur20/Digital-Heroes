import { NextResponse } from "next/server";
import { getProfiles, getWinners } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || undefined;

    const [winners, profiles] = await Promise.all([
      getWinners(userId),
      getProfiles()
    ]);

    const enriched = winners.map((winner) => ({
      ...winner,
      profile: profiles.find((p) => p.id === winner.userId)
    }));

    return NextResponse.json({ winners: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch winners" },
      { status: 500 }
    );
  }
}
