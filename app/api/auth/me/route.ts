import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSubscription } from "@/lib/store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const subscription = await getSubscription(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      charityId: user.charityId,
      charityPct: user.charityPct
    },
    subscription
  });
}
