import { describe, expect, it } from "vitest";
import { addScore, createDonation, deleteScore, getScores, updateScore } from "@/lib/store";

describe("Score CRUD & Rolling-5 Invariants", () => {
  const testUser = "user-test-crud-" + Date.now();

  it("adds scores and maintains rolling-5 order", async () => {
    await addScore(testUser, 30, "2026-03-01");
    await addScore(testUser, 32, "2026-03-02");
    await addScore(testUser, 34, "2026-03-03");

    const scores = await getScores(testUser);
    expect(scores.length).toBe(3);
    expect(scores[0].playedOn).toBe("2026-03-03");
    expect(scores[0].value).toBe(34);
  });

  it("updates an existing score value and date successfully", async () => {
    const scores = await getScores(testUser);
    const target = scores[0];

    const updated = await updateScore(testUser, target.id, {
      value: 42,
      playedOn: "2026-03-04"
    });

    expect(updated.score.value).toBe(42);
    expect(updated.score.playedOn).toBe("2026-03-04");

    const refreshed = await getScores(testUser);
    expect(refreshed[0].value).toBe(42);
    expect(refreshed[0].playedOn).toBe("2026-03-04");
  });

  it("prevents updating to a duplicate date", async () => {
    const scores = await getScores(testUser);
    const scoreToUpdate = scores[0];
    const otherScore = scores[1];

    await expect(
      updateScore(testUser, scoreToUpdate.id, {
        playedOn: otherScore.playedOn
      })
    ).rejects.toThrow("Another round already exists on this date.");
  });

  it("deletes a score and updates the rolling-5 list", async () => {
    const scoresBefore = await getScores(testUser);
    const idToDelete = scoresBefore[0].id;

    const result = await deleteScore(testUser, idToDelete);
    expect(result.success).toBe(true);

    const scoresAfter = await getScores(testUser);
    expect(scoresAfter.length).toBe(scoresBefore.length - 1);
    expect(scoresAfter.some((s) => s.id === idToDelete)).toBe(false);
  });
});

describe("Independent Charity Donation (§08.1)", () => {
  it("records an independent non-gameplay donation", async () => {
    const donation = await createDonation({
      charityId: "charity-junior-golf",
      donorName: "Phil Mickelson",
      donorEmail: "phil@example.com",
      amount: 150
    });

    expect(donation.id).toBeDefined();
    expect(donation.amount).toBe(150);
    expect(donation.donorName).toBe("Phil Mickelson");
    expect(donation.charityId).toBe("charity-junior-golf");
  });
});
