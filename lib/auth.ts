import { cookies } from "next/headers";
import { getProfile, getProfileByEmail, verifyUserPassword } from "./store";
import type { Profile, Role } from "./types";

export const SESSION_COOKIE_NAME = "dh_session";

export interface SessionData {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}

export function encodeSession(data: SessionData): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}

export function decodeSession(token: string): SessionData | null {
  try {
    const json = Buffer.from(token, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.userId === "string" && typeof parsed.role === "string") {
      return parsed as SessionData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Gets the current user from cookies in Server Components or Route Handlers.
 * Defaults to demoUser (Ava Mitchell) if no session cookie exists yet, ensuring
 * seamless out-of-the-box demo functionality while fully supporting explicit logins.
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const session = decodeSession(token);
    if (session) {
      const profile = await getProfile(session.userId);
      if (profile) return profile;
    }
  }

  // Fallback to default demo user if unauthenticated
  const defaultUser = await getProfileByEmail("ava@example.com");
  return defaultUser;
}

export async function authenticate(email: string, password?: string): Promise<Profile | null> {
  const user = await verifyUserPassword(email, password ?? "password123");
  return user;
}
