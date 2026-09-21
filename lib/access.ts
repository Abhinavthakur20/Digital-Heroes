import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { getSubscription } from "./store";
import { isActiveSubscription } from "./subscription";
import type { Profile } from "./types";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorResponse(error: unknown, fallback = "Request failed", status = 500) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status }
  );
}

export async function requireUser(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new HttpError(401, "Authentication required.");
  }
  return user;
}

export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new HttpError(403, "Administrator access required.");
  }
  return user;
}

export async function requireActiveSubscriber(user?: Profile): Promise<Profile> {
  const currentUser = user ?? (await requireUser());
  if (currentUser.role === "admin") {
    return currentUser;
  }

  const subscription = await getSubscription(currentUser.id);
  if (!isActiveSubscription(subscription ?? undefined)) {
    throw new HttpError(402, "An active subscription is required for this feature.");
  }

  return currentUser;
}

export function assertSelfOrAdmin(user: Profile, targetUserId: string) {
  if (user.role !== "admin" && user.id !== targetUserId) {
    throw new HttpError(403, "You are not allowed to access another user's data.");
  }
}
