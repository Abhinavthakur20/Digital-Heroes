export type Role = "subscriber" | "admin";
export type Plan = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "inactive" | "cancelled" | "lapsed";
export type DrawType = "random" | "algorithmic";
export type DrawStatus = "draft" | "simulated" | "published";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "paid";

export type CharityEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
};

export type Charity = {
  id: string;
  name: string;
  category: string;
  description: string;
  impactMetric: string;
  imageUrl: string;
  isFeatured: boolean;
  upcomingEvents?: CharityEvent[];
  createdAt: string;
};

export type Donation = {
  id: string;
  charityId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  createdAt: string;
};

export type Profile = {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  charityId: string;
  charityPct: number;
  createdAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: Plan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd: string;
  createdAt: string;
};

export type Score = {
  id: string;
  userId: string;
  value: number;
  playedOn: string;
  createdAt: string;
};

export type Draw = {
  id: string;
  month: string;
  drawType: DrawType;
  status: DrawStatus;
  winningNumbers: number[];
  pool5Match: number;
  pool4Match: number;
  pool3Match: number;
  jackpotRollover: number;
  createdAt: string;
  publishedAt?: string;
};

export type DrawEntry = {
  id: string;
  drawId: string;
  userId: string;
  numbers: number[];
  matchCount: number;
  createdAt: string;
};

export type Winner = {
  id: string;
  drawId: string;
  userId: string;
  matchTier: 3 | 4 | 5;
  amount: number;
  proofUrl?: string;
  verificationStatus: VerificationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};
