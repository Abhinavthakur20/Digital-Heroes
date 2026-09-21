import { NextResponse } from "next/server";
import { updateProfile, updateSubscriptionStatus } from "@/lib/store";
import { errorResponse, HttpError, requireAdmin } from "@/lib/access";
import type { Role, SubscriptionStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const role = body.role as Role | undefined;
    const charityPct = body.charityPct !== undefined ? Number(body.charityPct) : undefined;
    const subscriptionStatus = body.subscriptionStatus as SubscriptionStatus | undefined;

    let updatedProfile = null;
    if (role || charityPct !== undefined) {
      updatedProfile = await updateProfile(id, {
        role,
        charityPct
      });
    }

    let updatedSubscription = null;
    if (subscriptionStatus) {
      updatedSubscription = await updateSubscriptionStatus(id, subscriptionStatus);
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      subscription: updatedSubscription
    });
  } catch (error) {
    return errorResponse(error, "Failed to update user", 400);
  }
}
    if (role && role !== "subscriber" && role !== "admin") {
      throw new HttpError(400, "Invalid role.");
    }
    if (
      subscriptionStatus &&
      !["active", "inactive", "cancelled", "lapsed"].includes(subscriptionStatus)
    ) {
      throw new HttpError(400, "Invalid subscription status.");
    }
