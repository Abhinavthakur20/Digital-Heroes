import { NextResponse } from "next/server";
import { getProfiles, getWinners } from "@/lib/store";
import { assertSelfOrAdmin, errorResponse, requireUser } from "@/lib/access";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const requestedUserId = url.searchParams.get("userId") || undefined;
    const userId = requestedUserId || (user.role === "admin" ? undefined : user.id);
    if (requestedUserId) {
      assertSelfOrAdmin(user, requestedUserId);
    }

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
    return errorResponse(error, "Failed to fetch winners");
  }
}
