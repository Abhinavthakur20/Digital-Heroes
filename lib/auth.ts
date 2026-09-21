import { cookies } from "next/headers";
import crypto from "crypto";
import { getProfile, verifyUserPassword } from "./store";
import type { Profile, Role } from "./types";

export const SESSION_COOKIE_NAME = "dh_session";

export interface SessionData {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}

function sessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "digital-heroes-local-dev-session-secret"
  );
}

function sign(value: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function encodeSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string): SessionData | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = sign(payload);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const json = Buffer.from(payload, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (
      parsed &&
      typeof parsed.userId === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.fullName === "string" &&
      (parsed.role === "subscriber" || parsed.role === "admin")
    ) {
      return parsed as SessionData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Gets the current user from cookies in Server Components or Route Handlers.
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = decodeSession(token);
  if (!session) {
    return null;
  }

  return getProfile(session.userId);
}

export async function authenticate(email: string, password?: string): Promise<Profile | null> {
  const user = await verifyUserPassword(email, password ?? "");
  return user;
}
