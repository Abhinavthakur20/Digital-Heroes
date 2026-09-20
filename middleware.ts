import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("dh_session")?.value;

  let session: { userId: string; role: string; email: string } | null = null;
  if (sessionToken) {
    try {
      const decoded = Buffer.from(sessionToken, "base64url").toString("utf-8");
      session = JSON.parse(decoded);
    } catch {
      session = null;
    }
  }

  // Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "admin_required");
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      // In demo mode without explicit login, allow fallback if no session cookie yet
      // but redirect if user explicitly logged out or wants to sign in
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
