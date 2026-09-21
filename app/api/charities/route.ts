import { NextResponse } from "next/server";
import { createCharity, getCharities } from "@/lib/store";
import { errorResponse, requireAdmin } from "@/lib/access";

export async function GET() {
  try {
    const charities = await getCharities();
    return NextResponse.json(
      { charities },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch charities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const name = String(body.name || "").trim();
    const category = String(body.category || "General").trim();
    const description = String(body.description || "").trim();
    const impactMetric = String(body.impactMetric || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const isFeatured = Boolean(body.isFeatured);

    if (!name) {
      return NextResponse.json({ error: "Charity name is required." }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }

    const newCharity = await createCharity({
      name,
      category,
      description,
      impactMetric: impactMetric || "Direct community impact",
      imageUrl:
        imageUrl ||
        "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
      isFeatured
    });

    return NextResponse.json({ success: true, charity: newCharity });
  } catch (error) {
    return errorResponse(error, "Failed to create charity", 400);
  }
}
