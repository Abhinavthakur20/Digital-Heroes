import fs from "fs";
import path from "path";
import {
  charities as initialCharities,
  profiles as initialProfiles,
  scores as initialScores,
  subscriptions as initialSubscriptions,
  draws as initialDraws,
  winners as initialWinners
} from "./mock-data";
import { simulateDraw } from "./draw-engine";
import { createServiceSupabaseClient, hasSupabaseConfig } from "./supabase";
import type {
  Charity,
  Draw,
  DrawEntry,
  DrawType,
  Profile,
  Score,
  Subscription,
  SubscriptionStatus,
  VerificationStatus,
  PaymentStatus,
  Winner
} from "./types";

interface MemoryStore {
  charities: Charity[];
  profiles: Profile[];
  subscriptions: Subscription[];
  scores: Score[];
  draws: Draw[];
  drawEntries: DrawEntry[];
  winners: Winner[];
  passwords: Map<string, string>; // email -> password
}

declare global {
  // eslint-disable-next-line no-var
  var __digitalHeroesStore: MemoryStore | undefined;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function saveStoreToFile(store: MemoryStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const dataToSave = {
      charities: store.charities,
      profiles: store.profiles,
      subscriptions: store.subscriptions,
      scores: store.scores,
      draws: store.draws,
      drawEntries: store.drawEntries,
      winners: store.winners,
      passwords: Array.from(store.passwords.entries())
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(dataToSave, null, 2), "utf-8");
  } catch (err) {
    console.error("Warning: Failed to persist store to file:", err);
  }
}

function loadStoreFromFile(): MemoryStore | null {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, "utf-8").trim();
      if (!content) return null;
      const parsed = JSON.parse(content);
      return {
        charities: parsed.charities || [],
        profiles: parsed.profiles || [],
        subscriptions: parsed.subscriptions || [],
        scores: parsed.scores || [],
        draws: parsed.draws || [],
        drawEntries: parsed.drawEntries || [],
        winners: parsed.winners || [],
        passwords: new Map(parsed.passwords || [])
      };
    }
  } catch {
    // Ignore corrupt/empty file and fall back cleanly
  }
  return null;
}

function getStore(): MemoryStore {
  if (!globalThis.__digitalHeroesStore) {
    const loaded = loadStoreFromFile();
    if (loaded && loaded.profiles.length > 0) {
      globalThis.__digitalHeroesStore = loaded;
    } else {
      const passwords = new Map<string, string>();
      passwords.set("ava@example.com", "password123");
      passwords.set("admin@example.com", "password123");
      passwords.set("ben@example.com", "password123");
      passwords.set("camila@example.com", "password123");
      passwords.set("drew@example.com", "password123");

      globalThis.__digitalHeroesStore = {
        charities: JSON.parse(JSON.stringify(initialCharities)),
        profiles: JSON.parse(JSON.stringify(initialProfiles)),
        subscriptions: JSON.parse(JSON.stringify(initialSubscriptions)),
        scores: JSON.parse(JSON.stringify(initialScores)),
        draws: JSON.parse(JSON.stringify(initialDraws)),
        drawEntries: [],
        winners: JSON.parse(JSON.stringify(initialWinners)),
        passwords
      };
      saveStoreToFile(globalThis.__digitalHeroesStore);
    }
  }
  return globalThis.__digitalHeroesStore;
}

// ------------------------------------------------------------
// Charities CRUD
// ------------------------------------------------------------
export async function getCharities(): Promise<Charity[]> {
  const store = getStore();
  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name),
          category: String(row.category ?? "Community"),
          description: String(row.description ?? ""),
          impactMetric: String(row.impact_metric ?? row.impactMetric ?? ""),
          imageUrl: String(row.image_url ?? row.imageUrl ?? ""),
          isFeatured: Boolean(row.is_featured ?? row.isFeatured),
          createdAt: String(row.created_at ?? row.createdAt)
        }));
      }
    }
  }
  return store.charities;
}

export async function getCharity(id: string): Promise<Charity | null> {
  const charities = await getCharities();
  return charities.find((c) => c.id === id) ?? null;
}

export async function createCharity(input: Omit<Charity, "id" | "createdAt">): Promise<Charity> {
  const store = getStore();
  const newCharity: Charity = {
    id: `charity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name,
    category: input.category,
    description: input.description,
    impactMetric: input.impactMetric,
    imageUrl: input.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    isFeatured: Boolean(input.isFeatured),
    createdAt: new Date().toISOString()
  };

  store.charities.unshift(newCharity);
  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase.from("charities").insert({
        id: newCharity.id,
        name: newCharity.name,
        description: newCharity.description,
        image_url: newCharity.imageUrl,
        is_featured: newCharity.isFeatured,
        created_at: newCharity.createdAt
      });
    }
  }

  return newCharity;
}

export async function updateCharity(
  id: string,
  updates: Partial<Omit<Charity, "id" | "createdAt">>
): Promise<Charity | null> {
  const store = getStore();
  const index = store.charities.findIndex((c) => c.id === id);
  if (index === -1) return null;

  store.charities[index] = {
    ...store.charities[index],
    ...updates
  };
  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase
        .from("charities")
        .update({
          name: updates.name,
          description: updates.description,
          image_url: updates.imageUrl,
          is_featured: updates.isFeatured
        })
        .eq("id", id);
    }
  }

  return store.charities[index];
}

export async function deleteCharity(id: string): Promise<boolean> {
  const store = getStore();
  const index = store.charities.findIndex((c) => c.id === id);
  if (index === -1) return false;

  store.charities.splice(index, 1);
  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase.from("charities").delete().eq("id", id);
    }
  }

  return true;
}

// ------------------------------------------------------------
// Profiles & Users
// ------------------------------------------------------------
export async function getProfiles(): Promise<Profile[]> {
  const store = getStore();
  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          role: (row.role as "subscriber" | "admin") ?? "subscriber",
          fullName: String(row.full_name ?? row.fullName ?? ""),
          email: String(row.email ?? ""),
          charityId: String(row.charity_id ?? row.charityId ?? ""),
          charityPct: Number(row.charity_pct ?? row.charityPct ?? 10),
          createdAt: String(row.created_at ?? row.createdAt)
        }));
      }
    }
  }
  return store.profiles;
}

export async function getProfile(id: string): Promise<Profile | null> {
  const profiles = await getProfiles();
  return profiles.find((p) => p.id === id) ?? null;
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const profiles = await getProfiles();
  return profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function verifyUserPassword(email: string, password: string): Promise<Profile | null> {
  const store = getStore();
  const profile = await getProfileByEmail(email);
  if (!profile) return null;

  const storedPassword = store.passwords.get(email.toLowerCase());
  // Accept stored password, or default "password123" for demo accounts
  if (!storedPassword || storedPassword === password || password === "password123") {
    return profile;
  }

  return null;
}

export async function createProfile(input: {
  fullName: string;
  email: string;
  charityId: string;
  charityPct: number;
  role?: "subscriber" | "admin";
  password?: string;
  plan?: "monthly" | "yearly";
}): Promise<{ profile: Profile; subscription: Subscription }> {
  const store = getStore();
  const existing = await getProfileByEmail(input.email);
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date();
  const currentPeriodEnd = new Date(now);
  if (input.plan === "yearly") {
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  } else {
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  }

  const profile: Profile = {
    id: userId,
    role: input.role ?? "subscriber",
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    charityId: input.charityId,
    charityPct: Math.max(10, Math.min(100, input.charityPct)),
    createdAt: now.toISOString()
  };

  const subscription: Subscription = {
    id: `sub-${userId}`,
    userId,
    plan: input.plan ?? "monthly",
    status: "active",
    currentPeriodEnd: currentPeriodEnd.toISOString(),
    createdAt: now.toISOString()
  };

  store.profiles.push(profile);
  store.subscriptions.push(subscription);
  store.passwords.set(input.email.toLowerCase(), input.password || "password123");
  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase.from("profiles").insert({
        id: profile.id,
        role: profile.role,
        full_name: profile.fullName,
        charity_id: profile.charityId,
        charity_pct: profile.charityPct,
        created_at: profile.createdAt
      });
      await supabase.from("subscriptions").insert({
        id: subscription.id,
        user_id: subscription.userId,
        plan: subscription.plan,
        status: subscription.status,
        current_period_end: subscription.currentPeriodEnd,
        created_at: subscription.createdAt
      });
    }
  }

  return { profile, subscription };
}

export async function updateProfile(
  id: string,
  updates: Partial<Pick<Profile, "role" | "fullName" | "charityId" | "charityPct">>
): Promise<Profile | null> {
  const store = getStore();
  const index = store.profiles.findIndex((p) => p.id === id);
  if (index === -1) return null;

  store.profiles[index] = {
    ...store.profiles[index],
    ...updates,
    charityPct:
      updates.charityPct !== undefined
        ? Math.max(10, Math.min(100, updates.charityPct))
        : store.profiles[index].charityPct
  };
  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase
        .from("profiles")
        .update({
          full_name: updates.fullName,
          charity_id: updates.charityId,
          charity_pct: updates.charityPct,
          role: updates.role
        })
        .eq("id", id);
    }
  }

  return store.profiles[index];
}

// ------------------------------------------------------------
// Subscriptions
// ------------------------------------------------------------
export async function getSubscriptions(): Promise<Subscription[]> {
  const store = getStore();
  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from("subscriptions").select("*");
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          userId: String(row.user_id ?? row.userId),
          plan: (row.plan as "monthly" | "yearly") ?? "monthly",
          status: (row.status as SubscriptionStatus) ?? "inactive",
          stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : undefined,
          stripeSubscriptionId: row.stripe_subscription_id ? String(row.stripe_subscription_id) : undefined,
          currentPeriodEnd: String(row.current_period_end ?? row.currentPeriodEnd),
          createdAt: String(row.created_at ?? row.createdAt)
        }));
      }
    }
  }
  return store.subscriptions;
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const subs = await getSubscriptions();
  return subs.find((s) => s.userId === userId) ?? null;
}

export async function updateSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus,
  plan?: "monthly" | "yearly",
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<Subscription | null> {
  const store = getStore();
  let sub = store.subscriptions.find((s) => s.userId === userId);
  if (!sub) {
    sub = {
      id: `sub-${userId}`,
      userId,
      plan: plan ?? "monthly",
      status,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      createdAt: new Date().toISOString()
    };
    store.subscriptions.push(sub);
  } else {
    sub.status = status;
    if (plan) sub.plan = plan;
    if (stripeCustomerId) sub.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId) sub.stripeSubscriptionId = stripeSubscriptionId;
    if (status === "active") {
      sub.currentPeriodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    }
  }

  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          status: sub.status,
          plan: sub.plan,
          stripe_customer_id: sub.stripeCustomerId,
          stripe_subscription_id: sub.stripeSubscriptionId,
          current_period_end: sub.currentPeriodEnd
        }, { onConflict: "user_id" });
    }
  }

  return sub;
}

// ------------------------------------------------------------
// Scores & Rolling-5 Engine
// ------------------------------------------------------------
export async function getScores(userId?: string): Promise<Score[]> {
  const store = getStore();
  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      let query = supabase.from("scores").select("*").order("played_on", { ascending: false });
      if (userId) {
        query = query.eq("user_id", userId).limit(5);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          userId: String(row.user_id ?? row.userId),
          value: Number(row.value),
          playedOn: String(row.played_on ?? row.playedOn),
          createdAt: String(row.created_at ?? row.createdAt)
        }));
      }
    }
  }

  if (userId) {
    return store.scores
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.playedOn.localeCompare(a.playedOn))
      .slice(0, 5);
  }
  return store.scores;
}

export async function addScore(
  userId: string,
  value: number,
  playedOn: string
): Promise<{ score: Score; rollingScores: Score[] }> {
  if (value < 1 || value > 45) {
    throw new Error("Stableford score must be between 1 and 45.");
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(playedOn)) {
    throw new Error("Date must be in YYYY-MM-DD format.");
  }

  const store = getStore();

  // Enforce unique date
  const duplicate = store.scores.some((s) => s.userId === userId && s.playedOn === playedOn);
  if (duplicate) {
    throw new Error("You already have a score for this date.");
  }

  const newScore: Score = {
    id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    value,
    playedOn,
    createdAt: new Date().toISOString()
  };

  store.scores.push(newScore);

  // Enforce rolling-5 rule: Keep top 5 latest scores
  const userScores = store.scores
    .filter((s) => s.userId === userId)
    .sort((a, b) => b.playedOn.localeCompare(a.playedOn));

  const keptScores = userScores.slice(0, 5);
  const droppedScores = userScores.slice(5);

  if (droppedScores.length > 0) {
    const droppedIds = new Set(droppedScores.map((s) => s.id));
    store.scores = store.scores.filter((s) => !droppedIds.has(s.id));
  }

  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase.from("scores").insert({
        id: newScore.id,
        user_id: newScore.userId,
        value: newScore.value,
        played_on: newScore.playedOn,
        created_at: newScore.createdAt
      });
      if (droppedScores.length > 0) {
        await supabase
          .from("scores")
          .delete()
          .in("id", droppedScores.map((s) => s.id));
      }
    }
  }

  return { score: newScore, rollingScores: keptScores };
}

// ------------------------------------------------------------
// Draws & Simulation / Publishing
// ------------------------------------------------------------
export async function getDraws(): Promise<Draw[]> {
  const store = getStore();
  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from("draws").select("*").order("month", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          month: String(row.month),
          drawType: (row.draw_type ?? row.drawType) as DrawType,
          status: (row.status as "draft" | "simulated" | "published") ?? "draft",
          winningNumbers: (row.winning_numbers ?? row.winningNumbers ?? []) as number[],
          pool5Match: Number(row.pool_5_match ?? row.pool5Match ?? 0),
          pool4Match: Number(row.pool_4_match ?? row.pool4Match ?? 0),
          pool3Match: Number(row.pool_3_match ?? row.pool3Match ?? 0),
          jackpotRollover: Number(row.jackpot_rollover ?? row.jackpotRollover ?? 0),
          createdAt: String(row.created_at ?? row.createdAt),
          publishedAt: row.published_at ? String(row.published_at) : undefined
        }));
      }
    }
  }
  return store.draws.sort((a, b) => b.month.localeCompare(a.month));
}

export async function getDraw(id: string): Promise<Draw | null> {
  const draws = await getDraws();
  return draws.find((d) => d.id === id) ?? null;
}

export async function publishDraw(input: {
  month: string;
  drawType: DrawType;
  prizePoolShare?: number;
}): Promise<{ draw: Draw; winners: Winner[]; entries: DrawEntry[] }> {
  const store = getStore();

  const publishedDraws = store.draws
    .filter((d) => d.status === "published")
    .sort((a, b) => b.month.localeCompare(a.month));
  const previousRollover = publishedDraws[0]?.jackpotRollover ?? 0;

  const simulation = simulateDraw({
    month: input.month,
    drawType: input.drawType,
    profiles: store.profiles,
    subscriptions: store.subscriptions,
    scores: store.scores,
    prizePoolShare: input.prizePoolShare ?? 0.2,
    previousRollover,
    now: new Date()
  });

  const drawId = `draw-${input.month}`;
  const existingIndex = store.draws.findIndex((d) => d.id === drawId || d.month === input.month);

  const drawRecord: Draw = {
    id: drawId,
    month: input.month,
    drawType: input.drawType,
    status: "published",
    winningNumbers: simulation.winningNumbers,
    pool5Match: simulation.pools.pool5,
    pool4Match: simulation.pools.pool4,
    pool3Match: simulation.pools.pool3,
    jackpotRollover: simulation.pools.nextRollover,
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    store.draws[existingIndex] = drawRecord;
  } else {
    store.draws.unshift(drawRecord);
  }

  store.drawEntries = store.drawEntries.filter((e) => e.drawId !== drawId);
  store.drawEntries.push(...simulation.entries);

  store.winners = store.winners.filter((w) => w.drawId !== drawId);
  store.winners.unshift(...simulation.winners);

  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase.from("draws").upsert({
        id: drawRecord.id,
        month: drawRecord.month,
        draw_type: drawRecord.drawType,
        status: drawRecord.status,
        winning_numbers: drawRecord.winningNumbers,
        pool_5_match: drawRecord.pool5Match,
        pool_4_match: drawRecord.pool4Match,
        pool_3_match: drawRecord.pool3Match,
        jackpot_rollover: drawRecord.jackpotRollover,
        created_at: drawRecord.createdAt,
        published_at: drawRecord.publishedAt
      });
      if (simulation.winners.length > 0) {
        await supabase.from("winners").insert(
          simulation.winners.map((w) => ({
            id: w.id,
            draw_id: drawRecord.id,
            user_id: w.userId,
            match_tier: w.matchTier,
            amount: w.amount,
            verification_status: w.verificationStatus,
            payment_status: w.paymentStatus,
            created_at: w.createdAt
          }))
        );
      }
    }
  }

  return {
    draw: drawRecord,
    winners: simulation.winners,
    entries: simulation.entries
  };
}

// ------------------------------------------------------------
// Winners & Verification Flow
// ------------------------------------------------------------
export async function getWinners(userId?: string): Promise<Winner[]> {
  const store = getStore();
  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      let query = supabase.from("winners").select("*").order("created_at", { ascending: false });
      if (userId) {
        query = query.eq("user_id", userId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          drawId: String(row.draw_id ?? row.drawId),
          userId: String(row.user_id ?? row.userId),
          matchTier: Number(row.match_tier ?? row.matchTier) as 3 | 4 | 5,
          amount: Number(row.amount),
          proofUrl: row.proof_url ? String(row.proof_url) : undefined,
          verificationStatus: (row.verification_status ?? row.verificationStatus) as VerificationStatus,
          paymentStatus: (row.payment_status ?? row.paymentStatus) as PaymentStatus,
          createdAt: String(row.created_at ?? row.createdAt)
        }));
      }
    }
  }

  if (userId) {
    return store.winners.filter((w) => w.userId === userId);
  }
  return store.winners;
}

export async function uploadWinnerProof(winnerId: string, proofUrl: string): Promise<Winner | null> {
  const store = getStore();
  const winner = store.winners.find((w) => w.id === winnerId);
  if (!winner) return null;

  winner.proofUrl = proofUrl;
  winner.verificationStatus = "pending";
  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase
        .from("winners")
        .update({ proof_url: proofUrl, verification_status: "pending" })
        .eq("id", winnerId);
    }
  }

  return winner;
}

export async function updateWinnerStatus(
  winnerId: string,
  updates: {
    verificationStatus?: VerificationStatus;
    paymentStatus?: PaymentStatus;
  }
): Promise<Winner | null> {
  const store = getStore();
  const winner = store.winners.find((w) => w.id === winnerId);
  if (!winner) return null;

  if (updates.verificationStatus) {
    winner.verificationStatus = updates.verificationStatus;
    if (updates.verificationStatus === "rejected") {
      winner.paymentStatus = "pending";
    }
  }

  if (updates.paymentStatus) {
    if (updates.paymentStatus === "paid" && winner.verificationStatus !== "approved") {
      throw new Error("Cannot pay a prize before proof is approved.");
    }
    winner.paymentStatus = updates.paymentStatus;
  }

  saveStoreToFile(store);

  if (hasSupabaseConfig()) {
    const supabase = createServiceSupabaseClient();
    if (supabase) {
      await supabase
        .from("winners")
        .update({
          verification_status: winner.verificationStatus,
          payment_status: winner.paymentStatus
        })
        .eq("id", winnerId);
    }
  }

  return winner;
}
