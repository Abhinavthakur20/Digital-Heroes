import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addScore, getScores } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let userId = url.searchParams.get("userId");

    if (!userId) {
      const user = await getCurrentUser();
      userId = user?.id ?? "user-ava";
    }

    const scores = await getScores(userId);
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch scores" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id ?? "user-ava";

    const body = await request.json();
    const value = Number(body.value);
    const playedOn = String(body.playedOn || "").trim();

    if (!value || isNaN(value)) {
      return NextResponse.json({ error: "Score value is required." }, { status: 400 });
    }
    if (value < 1 || value > 45) {
      return NextResponse.json(
        { error: "Stableford score must be between 1 and 45." },
        { status: 400 }
      );
    }
    if (!playedOn) {
      return NextResponse.json({ error: "Date played is required." }, { status: 400 });
    }

    const result = await addScore(userId, value, playedOn);

    return NextResponse.json({
      success: true,
      score: result.score,
      rollingScores: result.rollingScores,
      message: "Score logged successfully with rolling 5 applied."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save score" },
      { status: 400 }
    );
  }
}
