import { NextResponse } from "next/server";
import { addScore, deleteScore, getScores, updateScore } from "@/lib/store";
import {
  assertSelfOrAdmin,
  errorResponse,
  HttpError,
  requireActiveSubscriber,
  requireUser
} from "@/lib/access";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") || user.id;
    assertSelfOrAdmin(user, userId);

    const scores = await getScores(userId);
    return NextResponse.json({ scores });
  } catch (error) {
    return errorResponse(error, "Failed to fetch scores");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json();
    const requestedUserId = body.userId ? String(body.userId) : user.id;
    assertSelfOrAdmin(user, requestedUserId);
    if (user.role !== "admin") {
      await requireActiveSubscriber(user);
    }

    const value = Number(body.value);
    const playedOn = String(body.playedOn || "").trim();

    if (!value || isNaN(value)) {
      throw new HttpError(400, "Score value is required.");
    }
    if (value < 1 || value > 45) {
      throw new HttpError(400, "Stableford score must be between 1 and 45.");
    }
    if (!playedOn) {
      throw new HttpError(400, "Date played is required.");
    }

    const result = await addScore(requestedUserId, value, playedOn);

    return NextResponse.json({
      success: true,
      score: result.score,
      rollingScores: result.rollingScores,
      message: "Score logged successfully with rolling 5 applied."
    });
  } catch (error) {
    return errorResponse(error, "Failed to save score", 400);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const scoreId = String(body.scoreId || "").trim();
    const requestedUserId = body.userId ? String(body.userId) : null;

    if (!scoreId) {
      throw new HttpError(400, "Score ID is required.");
    }

    const targetUserId = requestedUserId || user.id;
    assertSelfOrAdmin(user, targetUserId);
    if (user.role !== "admin") {
      await requireActiveSubscriber(user);
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
    return errorResponse(error, "Failed to update score", 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const scoreId = url.searchParams.get("scoreId") || body?.scoreId;
    const requestedUserId = url.searchParams.get("userId") || body?.userId;

    if (!scoreId) {
      throw new HttpError(400, "Score ID is required.");
    }

    const targetUserId = requestedUserId || user.id;
    assertSelfOrAdmin(user, targetUserId);
    if (user.role !== "admin") {
      await requireActiveSubscriber(user);
    }

    const result = await deleteScore(targetUserId, scoreId);

    return NextResponse.json({
      success: true,
      rollingScores: result.rollingScores,
      message: "Score deleted successfully."
    });
  } catch (error) {
    return errorResponse(error, "Failed to delete score", 400);
  }
}
