import { NextResponse } from "next/server";
import { getProfiles, getSubscriptions } from "@/lib/store";
import { errorResponse, requireAdmin } from "@/lib/access";

export async function GET() {
  try {
    await requireAdmin();
    const [profiles, subscriptions] = await Promise.all([
      getProfiles(),
      getSubscriptions()
    ]);

    const users = profiles.map((profile) => ({
      ...profile,
      subscription: subscriptions.find((s) => s.userId === profile.id)
    }));

    return NextResponse.json({ users });
  } catch (error) {
    return errorResponse(error, "Failed to fetch users");
  }
}
