import { NextResponse } from "next/server";
import { deleteCharity, updateCharity } from "@/lib/store";
import { errorResponse, requireAdmin } from "@/lib/access";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
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
    return errorResponse(error, "Failed to update charity", 400);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const deleted = await deleteCharity(id);

    if (!deleted) {
      return NextResponse.json({ error: "Charity not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Charity deleted successfully." });
  } catch (error) {
    return errorResponse(error, "Failed to delete charity", 400);
  }
}
