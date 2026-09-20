import { describe, expect, it } from "vitest";
import { createCharity, deleteCharity, getCharities, getCharity, updateCharity } from "@/lib/store";

describe("charity partner CRUD and spotlight", () => {
  it("creates a new charity partner", async () => {
    const created = await createCharity({
      name: "St. Andrews Junior Golf Foundation",
      category: "Youth sport",
      description: "Providing subsidized coaching and golf access to young athletes.",
      impactMetric: "85 kids sponsored",
      imageUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b",
      isFeatured: true
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe("St. Andrews Junior Golf Foundation");
    expect(created.isFeatured).toBe(true);

    const retrieved = await getCharity(created.id);
    expect(retrieved?.name).toBe("St. Andrews Junior Golf Foundation");
  });

  it("updates charity details and toggles featured status", async () => {
    const list = await getCharities();
    const target = list[0];

    const updated = await updateCharity(target.id, {
      impactMetric: "999 juniors coached",
      isFeatured: false
    });

    expect(updated?.impactMetric).toBe("999 juniors coached");
    expect(updated?.isFeatured).toBe(false);
  });

  it("deletes a charity partner", async () => {
    const created = await createCharity({
      name: "Temporary Golf Cause",
      category: "Test",
      description: "Will be removed immediately",
      impactMetric: "0",
      imageUrl: "",
      isFeatured: false
    });

    const success = await deleteCharity(created.id);
    expect(success).toBe(true);

    const lookup = await getCharity(created.id);
    expect(lookup).toBeNull();
  });
});
