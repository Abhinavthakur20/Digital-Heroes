import { describe, expect, it } from "vitest";
import { addScore, getScores } from "@/lib/store";

describe("scores rolling-5 engine", () => {
  const testUserId = `user-test-${Date.now()}`;

  it("rejects scores below 1 or above 45", async () => {
    await expect(addScore(testUserId, 0, "2026-09-01")).rejects.toThrow(
      "Stableford score must be between 1 and 45."
    );
    await expect(addScore(testUserId, 46, "2026-09-01")).rejects.toThrow(
      "Stableford score must be between 1 and 45."
    );
  });

  it("rejects duplicate dates for the same user", async () => {
    await addScore(testUserId, 35, "2026-09-01");
    await expect(addScore(testUserId, 38, "2026-09-01")).rejects.toThrow(
      "You already have a score for this date."
    );
  });

  it("stores up to 5 scores in reverse-chronological order", async () => {
    await addScore(testUserId, 30, "2026-09-02");
    await addScore(testUserId, 32, "2026-09-03");
    await addScore(testUserId, 34, "2026-09-04");
    await addScore(testUserId, 36, "2026-09-05");

    const scores = await getScores(testUserId);
    expect(scores.length).toBe(5);
    expect(scores[0].playedOn).toBe("2026-09-05");
    expect(scores[4].playedOn).toBe("2026-09-01");
  });

  it("automatically drops the oldest score when a 6th round is added", async () => {
    // Add 6th round with newer date
    const { rollingScores } = await addScore(testUserId, 40, "2026-09-06");

    expect(rollingScores.length).toBe(5);
    // Newest is 2026-09-06
    expect(rollingScores[0].playedOn).toBe("2026-09-06");
    expect(rollingScores[0].value).toBe(40);
    // Oldest should now be 2026-09-02 (2026-09-01 dropped!)
    expect(rollingScores[4].playedOn).toBe("2026-09-02");
    expect(rollingScores.some((s) => s.playedOn === "2026-09-01")).toBe(false);
  });
});
