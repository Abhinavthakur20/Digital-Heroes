import { NextResponse } from "next/server";
import { createProfile } from "@/lib/store";
import { encodeSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    const charityId = String(body.charityId || "").trim();
    const charityPct = Number(body.charityPct || 10);
    const plan = body.plan === "yearly" ? "yearly" : "monthly";

    if (!fullName) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!charityId) {
      return NextResponse.json({ error: "Please select a charity to support." }, { status: 400 });
    }
    if (charityPct < 10 || charityPct > 100) {
      return NextResponse.json({ error: "Charity allocation must be between 10% and 100%." }, { status: 400 });
    }

    const { profile, subscription } = await createProfile({
      fullName,
      email,
      password: password || "password123",
      charityId,
      charityPct,
      role: "subscriber",
      plan
    });

    const sessionData = {
      userId: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role
    };

    const token = encodeSession(sessionData);

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      subscription,
      redirectTo: "/dashboard?checkout=success"
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed" },
      { status: 400 }
    );
  }
}
