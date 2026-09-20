import { NextResponse } from "next/server";
import { updateProfile, updateSubscriptionStatus } from "@/lib/store";
import type { Role, SubscriptionStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 400 }
    );
  }
}
