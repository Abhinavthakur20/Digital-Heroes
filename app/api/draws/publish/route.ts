import { NextResponse } from "next/server";
import { publishDraw } from "@/lib/store";
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

    const { draw, winners, entries } = await publishDraw({
      month,
      drawType,
      prizePoolShare
    });

    return NextResponse.json({
      success: true,
      mode: "published",
      committed: true,
      message: `Draw for ${month} published successfully! ${winners.length} winners generated.`,
      result: {
        drawId: draw.id,
        month: draw.month,
        drawType: draw.drawType,
        winningNumbers: draw.winningNumbers,
        pools: {
          pool5: draw.pool5Match,
          pool4: draw.pool4Match,
          pool3: draw.pool3Match,
          nextRollover: draw.jackpotRollover
        },
        winners,
        entriesCount: entries.length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publishing draw failed" },
      { status: 500 }
    );
  }
}
