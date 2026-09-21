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

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const scoreId = String(body.scoreId || "").trim();
    const requestedUserId = body.userId ? String(body.userId) : null;

    if (!scoreId) {
      return NextResponse.json({ error: "Score ID is required." }, { status: 400 });
    }

    // Determine target userId
    let targetUserId = user?.id ?? "user-ava";
    if (requestedUserId && requestedUserId !== targetUserId) {
      if (user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized to edit another user's score." }, { status: 403 });
      }
      targetUserId = requestedUserId;
    }

    const value = body.value !== undefined ? Number(body.value) : undefined;
    const playedOn = body.playedOn !== undefined ? String(body.playedOn).trim() : undefined;

    const result = await updateScore(targetUserId, scoreId, { value, playedOn });

    return NextResponse.json({
      success: true,
      score: result.score,
      rollingScores: result.rollingScores,
      message: "Score updated successfully."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update score" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const url = new URL(request.url);
    const scoreId = url.searchParams.get("scoreId") || (await request.json().catch(() => ({})))?.scoreId;
    const requestedUserId = url.searchParams.get("userId") || (await request.json().catch(() => ({})))?.userId;

    if (!scoreId) {
      return NextResponse.json({ error: "Score ID is required." }, { status: 400 });
    }

    let targetUserId = user?.id ?? "user-ava";
    if (requestedUserId && requestedUserId !== targetUserId) {
      if (user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized to delete another user's score." }, { status: 403 });
      }
      targetUserId = requestedUserId;
    }

    const result = await deleteScore(targetUserId, scoreId);

    return NextResponse.json({
      success: true,
      rollingScores: result.rollingScores,
      message: "Score deleted successfully."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete score" },
      { status: 400 }
    );
  }
}
