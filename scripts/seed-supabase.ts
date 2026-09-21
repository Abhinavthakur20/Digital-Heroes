import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { charities, profiles, scores, subscriptions, draws, winners } from "../lib/mock-data";

// Load .env.local if present
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function seed() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("Connecting to Supabase at", supabaseUrl);

  // 1. Seed Charities
  console.log("Seeding charities...");
  for (const charity of charities) {
    const { error } = await supabase.from("charities").upsert({
      id: charity.id,
      name: charity.name,
      category: charity.category,
      description: charity.description,
      impact_metric: charity.impactMetric,
      image_url: charity.imageUrl,
      is_featured: charity.isFeatured,
      upcoming_events: charity.upcomingEvents || [],
      created_at: charity.createdAt
    });
    if (error) console.warn("Charity upsert error:", error.message);
  }

  // 2. Seed Profiles
  console.log("Seeding profiles...");
  for (const profile of profiles) {
    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      role: profile.role,
      full_name: profile.fullName,
      email: profile.email,
      charity_id: profile.charityId,
      charity_pct: profile.charityPct,
      created_at: profile.createdAt
    });
    if (error) console.warn("Profile upsert error:", error.message);
  }

  // 3. Seed Subscriptions
  console.log("Seeding subscriptions...");
  for (const sub of subscriptions) {
    const { error } = await supabase.from("subscriptions").upsert({
      id: sub.id,
      user_id: sub.userId,
      plan: sub.plan,
      status: sub.status,
      current_period_end: sub.currentPeriodEnd,
      created_at: sub.createdAt
    });
    if (error) console.warn("Subscription upsert error:", error.message);
  }

  // 4. Seed Scores
  console.log("Seeding scores...");
  for (const score of scores) {
    const { error } = await supabase.from("scores").upsert({
      id: score.id,
      user_id: score.userId,
      value: score.value,
      played_on: score.playedOn,
      created_at: score.createdAt
    });
    if (error) console.warn("Score upsert error:", score.id, error.message);
  }

  // 5. Seed Draws
  console.log("Seeding draws...");
  for (const draw of draws) {
    const { error } = await supabase.from("draws").upsert({
      id: draw.id,
      month: draw.month,
      draw_type: draw.drawType,
      status: draw.status,
      winning_numbers: draw.winningNumbers,
      pool_5_match: draw.pool5Match,
      pool_4_match: draw.pool4Match,
      pool_3_match: draw.pool3Match,
      jackpot_rollover: draw.jackpotRollover,
      created_at: draw.createdAt,
      published_at: draw.publishedAt
    });
    if (error) console.warn("Draw upsert error:", error.message);
  }

  // 6. Seed Winners
  console.log("Seeding winners...");
  for (const winner of winners) {
    const { error } = await supabase.from("winners").upsert({
      id: winner.id,
      draw_id: winner.drawId,
      user_id: winner.userId,
      match_tier: winner.matchTier,
      amount: winner.amount,
      proof_url: winner.proofUrl,
      verification_status: winner.verificationStatus,
      payment_status: winner.paymentStatus,
      created_at: winner.createdAt
    });
    if (error) console.warn("Winner upsert error:", error.message);
  }

  console.log("Supabase seeding completed successfully!");
}

seed().catch(console.error);
