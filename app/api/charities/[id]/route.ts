import { NextResponse } from "next/server";
import { deleteCharity, updateCharity } from "@/lib/store";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateCharity(id, {
      name: body.name,
      category: body.category,
      description: body.description,
      impactMetric: body.impactMetric,
      imageUrl: body.imageUrl,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined
    });

    if (!updated) {
      return NextResponse.json({ error: "Charity not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, charity: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update charity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteCharity(id);

    if (!deleted) {
      return NextResponse.json({ error: "Charity not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Charity deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete charity" },
      { status: 500 }
    );
  }
}
