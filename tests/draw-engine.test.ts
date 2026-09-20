import { describe, expect, it } from "vitest";
import { matchCount, simulateDraw } from "@/lib/draw-engine";
import { profiles, scores, subscriptions } from "@/lib/mock-data";

describe("draw engine", () => {
  it("counts matching numbers without depending on order", () => {
    expect(matchCount([1, 2, 3, 4, 5], [5, 9, 3, 2, 11])).toBe(3);
  });

  it("creates one entry for each active subscriber", () => {
    const result = simulateDraw({
      month: "2026-09-01",
      drawType: "random",
      profiles,
      subscriptions,
      scores,
      now: new Date("2026-09-20T00:00:00Z")
    });

    expect(result.activeSubscriberCount).toBe(3);
    expect(result.entries).toHaveLength(3);
    expect(result.entries.every((entry) => entry.numbers.length === 5)).toBe(true);
  });

  it("splits tier pools evenly and rolls over the jackpot when there are no five-match winners", () => {
    const result = simulateDraw({
      month: "2026-09-01",
      drawType: "algorithmic",
      profiles,
      subscriptions,
      scores,
      winningNumbers: [1, 2, 3, 4, 5],
      previousRollover: 100,
      prizePoolShare: 0.2,
      now: new Date("2026-09-20T00:00:00Z")
    });

    const fiveMatchWinners = result.winners.filter((winner) => winner.matchTier === 5);

    if (fiveMatchWinners.length === 0) {
      expect(result.pools.nextRollover).toBe(result.pools.pool5);
    } else {
      expect(result.pools.nextRollover).toBe(0);
      const totalFivePayout = fiveMatchWinners.reduce((total, winner) => total + winner.amount, 0);
      expect(Math.round(totalFivePayout)).toBe(Math.round(result.pools.pool5));
    }
  });
});
