import { NextResponse } from "next/server";
import { authenticate, encodeSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await authenticate(email, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. For demo, try ava@example.com or admin@example.com with password123." },
        { status: 401 }
      );
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };

    const token = encodeSession(sessionData);

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      redirectTo: user.role === "admin" ? "/admin" : "/dashboard"
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication failed" },
      { status: 500 }
    );
  }
}
