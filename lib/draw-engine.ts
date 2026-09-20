import { activeSubscriptions, monthlyRecognizedRevenue } from "./subscription";
import type { DrawEntry, DrawType, Profile, Score, Subscription, Winner } from "./types";

const NUMBER_MIN = 1;
const NUMBER_MAX = 49;
const TICKET_SIZE = 5;

export type DrawSimulationInput = {
  drawId?: string;
  month: string;
  drawType: DrawType;
  profiles: Profile[];
  subscriptions: Subscription[];
  scores: Score[];
  prizePoolShare?: number;
  previousRollover?: number;
  winningNumbers?: number[];
  seed?: string;
  now?: Date;
};

export type DrawSimulationResult = {
  drawId: string;
  month: string;
  drawType: DrawType;
  winningNumbers: number[];
  entries: DrawEntry[];
  winners: Winner[];
  pools: {
    totalPool: number;
    pool5: number;
    pool4: number;
    pool3: number;
    nextRollover: number;
  };
  activeSubscriberCount: number;
  recognizedRevenue: number;
};

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (const char of seed) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function range() {
  return Array.from({ length: NUMBER_MAX }, (_, index) => index + NUMBER_MIN);
}

function sampleUnique(pool: number[], count: number, random: () => number) {
  const copy = [...pool];
  const selected: number[] = [];

  while (selected.length < count && copy.length > 0) {
    const index = Math.floor(random() * copy.length);
    const [value] = copy.splice(index, 1);
    selected.push(value);
  }

  return selected.sort((a, b) => a - b);
}

function weightedUnique(weights: Map<number, number>, count: number, random: () => number) {
  const available = range();
  const selected: number[] = [];

  while (selected.length < count && available.length > 0) {
    const totalWeight = available.reduce((total, number) => total + (weights.get(number) ?? 1), 0);
    let cursor = random() * totalWeight;
    const index = available.findIndex((number) => {
      cursor -= weights.get(number) ?? 1;
      return cursor <= 0;
    });
    const pickIndex = index >= 0 ? index : available.length - 1;
    const [value] = available.splice(pickIndex, 1);
    selected.push(value);
  }

  return selected.sort((a, b) => a - b);
}

function scoreWeights(userId: string, scores: Score[]) {
  const weights = new Map<number, number>();
  const recentScores = scores
    .filter((score) => score.userId === userId)
    .sort((a, b) => b.playedOn.localeCompare(a.playedOn))
    .slice(0, 5);

  for (const score of recentScores) {
    const anchors = [score.value, score.value - 1, score.value + 1].filter(
      (value) => value >= NUMBER_MIN && value <= NUMBER_MAX
    );

    for (const value of anchors) {
      weights.set(value, (weights.get(value) ?? 1) + (value === score.value ? 5 : 2));
    }
  }

  return weights;
}

export function generateTicket(
  userId: string,
  drawType: DrawType,
  scores: Score[],
  random: () => number
) {
  if (drawType === "algorithmic") {
    return weightedUnique(scoreWeights(userId, scores), TICKET_SIZE, random);
  }

  return sampleUnique(range(), TICKET_SIZE, random);
}

export function matchCount(numbers: number[], winningNumbers: number[]) {
  const winning = new Set(winningNumbers);
  return numbers.filter((number) => winning.has(number)).length;
}

function createWinner(
  drawId: string,
  userId: string,
  matchTier: 3 | 4 | 5,
  amount: number,
  index: number
): Winner {
  return {
    id: `winner-${drawId}-${userId}-${matchTier}-${index}`,
    drawId,
    userId,
    matchTier,
    amount: Number(amount.toFixed(2)),
    verificationStatus: "pending",
    paymentStatus: "pending",
    createdAt: new Date().toISOString()
  };
}

export function simulateDraw(input: DrawSimulationInput): DrawSimulationResult {
  const prizePoolShare = input.prizePoolShare ?? 0.2;
  const previousRollover = input.previousRollover ?? 0;
  const now = input.now ?? new Date();
  const drawId = input.drawId ?? `draw-${input.month}-${input.drawType}`;
  const random = seededRandom(input.seed ?? `${input.month}:${input.drawType}`);
  const active = activeSubscriptions(input.subscriptions, now);
  const activeUserIds = new Set(active.map((subscription) => subscription.userId));
  const activeProfiles = input.profiles.filter(
    (profile) => profile.role === "subscriber" && activeUserIds.has(profile.id)
  );
  const recognizedRevenue = active.reduce(
    (total, subscription) => total + monthlyRecognizedRevenue(subscription),
    0
  );
  const totalPool = Number((recognizedRevenue * prizePoolShare).toFixed(2));
  const pool5 = Number((totalPool * 0.4 + previousRollover).toFixed(2));
  const pool4 = Number((totalPool * 0.35).toFixed(2));
  const pool3 = Number((totalPool * 0.25).toFixed(2));
  const winningNumbers =
    input.winningNumbers?.slice().sort((a, b) => a - b) ?? sampleUnique(range(), TICKET_SIZE, random);

  const entries: DrawEntry[] = activeProfiles.map((profile) => {
    const ticket = generateTicket(profile.id, input.drawType, input.scores, random);
    return {
      id: `entry-${drawId}-${profile.id}`,
      drawId,
      userId: profile.id,
      numbers: ticket,
      matchCount: matchCount(ticket, winningNumbers),
      createdAt: new Date().toISOString()
    };
  });

  const tiered = {
    5: entries.filter((entry) => entry.matchCount === 5),
    4: entries.filter((entry) => entry.matchCount === 4),
    3: entries.filter((entry) => entry.matchCount === 3)
  };

  const winners = [
    ...tiered[5].map((entry, index) =>
      createWinner(drawId, entry.userId, 5, pool5 / tiered[5].length, index)
    ),
    ...tiered[4].map((entry, index) =>
      createWinner(drawId, entry.userId, 4, pool4 / tiered[4].length, index)
    ),
    ...tiered[3].map((entry, index) =>
      createWinner(drawId, entry.userId, 3, pool3 / tiered[3].length, index)
    )
  ];

  return {
    drawId,
    month: input.month,
    drawType: input.drawType,
    winningNumbers,
    entries,
    winners,
    pools: {
      totalPool,
      pool5,
      pool4,
      pool3,
      nextRollover: tiered[5].length === 0 ? pool5 : 0
    },
    activeSubscriberCount: activeProfiles.length,
    recognizedRevenue: Number(recognizedRevenue.toFixed(2))
  };
}
