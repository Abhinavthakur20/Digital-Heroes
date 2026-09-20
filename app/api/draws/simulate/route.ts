import { NextResponse } from "next/server";
import { getDraws, getProfiles, getScores, getSubscriptions } from "@/lib/store";
import { simulateDraw } from "@/lib/draw-engine";
import type { DrawType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      month?: string;
      drawType?: DrawType;
      prizePoolShare?: number;
    };

    const month = body.month ?? "2026-09-01";
    const drawType = body.drawType ?? "algorithmic";
    const prizePoolShare = body.prizePoolShare ?? 0.2;

    const [profiles, subscriptions, scores, draws] = await Promise.all([
      getProfiles(),
      getSubscriptions(),
      getScores(),
      getDraws()
    ]);

    const latestPublished = draws
      .filter((d) => d.status === "published")
      .sort((a, b) => b.month.localeCompare(a.month))[0];
    const previousRollover = latestPublished?.jackpotRollover ?? 320;

    const result = simulateDraw({
      month,
      drawType,
      profiles,
      subscriptions,
      scores,
      prizePoolShare,
      previousRollover,
      now: new Date()
    });

    return NextResponse.json({
      mode: "simulation",
      result
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Simulation failed" },
      { status: 500 }
    );
  }
}
