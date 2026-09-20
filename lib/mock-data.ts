import type { Charity, Draw, Profile, Score, Subscription, Winner } from "./types";

export const charities: Charity[] = [
  {
    id: "charity-junior-golf",
    name: "Fairway Futures",
    category: "Youth sport",
    description:
      "Funds coaching, safe equipment, and transport for young golfers from low-income communities.",
    impactMetric: "128 juniors coached this season",
    imageUrl:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    createdAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "charity-veterans",
    name: "Links for Recovery",
    category: "Veterans",
    description:
      "Supports adaptive golf sessions and peer recovery programs for injured veterans.",
    impactMetric: "42 adaptive sessions funded",
    imageUrl:
      "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    createdAt: "2026-03-02T10:00:00Z"
  },
  {
    id: "charity-climate",
    name: "Green Course Trust",
    category: "Environment",
    description:
      "Helps local clubs restore native habitats, reduce water use, and protect public green space.",
    impactMetric: "19 acres restored",
    imageUrl:
      "https://images.unsplash.com/photo-1530028828-25e8270793c5?auto=format&fit=crop&w=1200&q=80",
    isFeatured: false,
    createdAt: "2026-03-03T10:00:00Z"
  },
  {
    id: "charity-health",
    name: "Round for Relief",
    category: "Health",
    description:
      "Provides emergency grants for golf community workers facing medical hardship.",
    impactMetric: "$36k in grants distributed",
    imageUrl:
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1200&q=80",
    isFeatured: false,
    createdAt: "2026-03-04T10:00:00Z"
  }
];

export const profiles: Profile[] = [
  {
    id: "user-ava",
    role: "subscriber",
    fullName: "Ava Mitchell",
    email: "ava@example.com",
    charityId: "charity-junior-golf",
    charityPct: 15,
    createdAt: "2026-04-03T12:00:00Z"
  },
  {
    id: "user-ben",
    role: "subscriber",
    fullName: "Ben Carter",
    email: "ben@example.com",
    charityId: "charity-veterans",
    charityPct: 10,
    createdAt: "2026-04-08T12:00:00Z"
  },
  {
    id: "user-camila",
    role: "subscriber",
    fullName: "Camila Ortiz",
    email: "camila@example.com",
    charityId: "charity-climate",
    charityPct: 20,
    createdAt: "2026-05-09T12:00:00Z"
  },
  {
    id: "user-drew",
    role: "subscriber",
    fullName: "Drew Singh",
    email: "drew@example.com",
    charityId: "charity-health",
    charityPct: 12.5,
    createdAt: "2026-05-14T12:00:00Z"
  },
  {
    id: "admin-morgan",
    role: "admin",
    fullName: "Morgan Admin",
    email: "admin@example.com",
    charityId: "charity-junior-golf",
    charityPct: 10,
    createdAt: "2026-03-20T12:00:00Z"
  }
];

export const subscriptions: Subscription[] = [
  {
    id: "sub-ava",
    userId: "user-ava",
    plan: "monthly",
    status: "active",
    currentPeriodEnd: "2026-10-03T12:00:00Z",
    createdAt: "2026-04-03T12:00:00Z"
  },
  {
    id: "sub-ben",
    userId: "user-ben",
    plan: "yearly",
    status: "active",
    currentPeriodEnd: "2027-04-08T12:00:00Z",
    createdAt: "2026-04-08T12:00:00Z"
  },
  {
    id: "sub-camila",
    userId: "user-camila",
    plan: "monthly",
    status: "active",
    currentPeriodEnd: "2026-10-09T12:00:00Z",
    createdAt: "2026-05-09T12:00:00Z"
  },
  {
    id: "sub-drew",
    userId: "user-drew",
    plan: "monthly",
    status: "lapsed",
    currentPeriodEnd: "2026-08-14T12:00:00Z",
    createdAt: "2026-05-14T12:00:00Z"
  }
];

export const scores: Score[] = [
  { id: "score-1", userId: "user-ava", value: 36, playedOn: "2026-09-18", createdAt: "2026-09-18T18:00:00Z" },
  { id: "score-2", userId: "user-ava", value: 33, playedOn: "2026-09-14", createdAt: "2026-09-14T18:00:00Z" },
  { id: "score-3", userId: "user-ava", value: 38, playedOn: "2026-09-09", createdAt: "2026-09-09T18:00:00Z" },
  { id: "score-4", userId: "user-ava", value: 31, playedOn: "2026-09-01", createdAt: "2026-09-01T18:00:00Z" },
  { id: "score-5", userId: "user-ava", value: 34, playedOn: "2026-08-25", createdAt: "2026-08-25T18:00:00Z" },
  { id: "score-6", userId: "user-ben", value: 29, playedOn: "2026-09-16", createdAt: "2026-09-16T18:00:00Z" },
  { id: "score-7", userId: "user-ben", value: 41, playedOn: "2026-09-02", createdAt: "2026-09-02T18:00:00Z" },
  { id: "score-8", userId: "user-camila", value: 37, playedOn: "2026-09-15", createdAt: "2026-09-15T18:00:00Z" },
  { id: "score-9", userId: "user-camila", value: 37, playedOn: "2026-09-06", createdAt: "2026-09-06T18:00:00Z" },
  { id: "score-10", userId: "user-drew", value: 26, playedOn: "2026-08-12", createdAt: "2026-08-12T18:00:00Z" }
];

export const draws: Draw[] = [
  {
    id: "draw-august",
    month: "2026-08-01",
    drawType: "algorithmic",
    status: "published",
    winningNumbers: [7, 18, 29, 36, 41],
    pool5Match: 320,
    pool4Match: 280,
    pool3Match: 200,
    jackpotRollover: 320,
    createdAt: "2026-08-01T09:00:00Z",
    publishedAt: "2026-08-31T20:00:00Z"
  }
];

export const winners: Winner[] = [
  {
    id: "winner-1",
    drawId: "draw-august",
    userId: "user-ben",
    matchTier: 4,
    amount: 280,
    proofUrl: "/proofs/ben-august.png",
    verificationStatus: "approved",
    paymentStatus: "paid",
    createdAt: "2026-08-31T20:05:00Z"
  },
  {
    id: "winner-2",
    drawId: "draw-august",
    userId: "user-ava",
    matchTier: 3,
    amount: 100,
    verificationStatus: "pending",
    paymentStatus: "pending",
    createdAt: "2026-08-31T20:05:00Z"
  }
];

export const demoUser = profiles[0];
