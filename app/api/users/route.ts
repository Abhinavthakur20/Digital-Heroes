import { NextResponse } from "next/server";
import { getProfiles, getSubscriptions } from "@/lib/store";

export async function GET() {
  try {
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch users" },
      { status: 500 }
    );
  }
}
