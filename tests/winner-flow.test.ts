import { describe, expect, it } from "vitest";
import { getWinners, updateWinnerStatus, uploadWinnerProof } from "@/lib/store";

describe("winner verification and payout flow", () => {
  it("allows uploading proof screenshot URL", async () => {
    const winners = await getWinners();
    const target = winners[0];
    expect(target).toBeDefined();

    const updated = await uploadWinnerProof(target.id, "https://example.com/test-proof.png");
    expect(updated?.proofUrl).toBe("https://example.com/test-proof.png");
    expect(updated?.verificationStatus).toBe("pending");
  });

  it("prevents marking as paid when claim is pending or rejected", async () => {
    const winners = await getWinners();
    const pendingWinner = winners.find((w) => w.verificationStatus === "pending") || winners[0];

    // Ensure it's not approved
    await updateWinnerStatus(pendingWinner.id, { verificationStatus: "pending" });

    await expect(
      updateWinnerStatus(pendingWinner.id, { paymentStatus: "paid" })
    ).rejects.toThrow("Cannot pay a prize before proof is approved.");
  });

  it("successfully approves proof and marks as paid", async () => {
    const winners = await getWinners();
    const target = winners[0];

    const approved = await updateWinnerStatus(target.id, { verificationStatus: "approved" });
    expect(approved?.verificationStatus).toBe("approved");

    const paid = await updateWinnerStatus(target.id, { paymentStatus: "paid" });
    expect(paid?.paymentStatus).toBe("paid");
  });
});
