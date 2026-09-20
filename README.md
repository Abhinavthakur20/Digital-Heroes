# Digital Heroes — Golf Performance & Charity Draw Platform

A complete, production-grade Next.js (App Router) platform combining golf performance tracking, transparent charity giving, and monthly prize draws built per the PRD v1.0 specifications.

---

## Key Features & Implementations

### 1. Robust Auth & Session Management
- **Role-Based Access:** First-class support for `subscriber` and `admin` roles.
- **1-Click Demo Logins:**
  - Subscriber: `ava@example.com` (password: `password123`)
  - Admin: `admin@example.com` (password: `password123`)
- **Interactive Registration:** New users select full name, email, password, giving partner with allocation slider (min 10%), and monthly ($20/mo) or yearly ($200/yr) plan.
- **Role Gating Middleware:** Protects `/admin/*` routes, redirecting unauthorized users to login.
- **Persistent HTTP-Only Session:** Encoded session cookie (`dh_session`) tracked across all routes.

### 2. Score Entry & Rolling-5 Engine
- **Range Validation:** Strictly validates Stableford scores between 1 and 45.
- **Unique Date Constraint:** Enforces one entry per date per user.
- **Automatic Rolling-5 Pruning:** Retains only the 5 most recent rounds in reverse-chronological order. When a 6th round is logged, older scores are automatically dropped.
- **Asynchronous API:** Backed by `POST /api/scores` and `GET /api/scores` with real-time UI feedback.

### 3. Draw Engine, Simulation & Publishing
- **Dual Modes:**
  - **Random Mode:** Uniform random 5-number tickets from a 1–49 range.
  - **Algorithmic Mode:** Biased frequency weighting derived from recent Stableford scores (scoring anchors ±1).
- **Transparent Prize Pool Math:**
  - `total_pool = active_subscribers × monthly_fee × prize_pool_share (default 20%)`
  - 5-Match Tier: 40% of pool (+ any rolled-over jackpot)
  - 4-Match Tier: 35% of pool
  - 3-Match Tier: 25% of pool
- **Equal Tie Splitting:** Prize tier pools are split evenly among winning tickets.
- **Jackpot Rollover:** If no subscriber hits all 5 numbers, Tier 5 pool automatically rolls over into the next month's jackpot.
- **Simulate Dry-Run:** Projects winners, revenue, pools, and rollover without database commits.
- **Official Publish:** Commits draw records, generates subscriber ticket entries, inserts winner records, and updates published draws and dashboard feeds.

### 4. Complete Winner Verification & Payout Workflow
- **Subscriber Upload:** Winners can submit scorecard screenshot proofs via dashboard.
- **Admin Review Modal:**
  - Inspect scorecard proof image.
  - **Approve Proof:** Sets status to `approved`.
  - **Reject Claim:** Sets status to `rejected`.
  - **Mark as Paid:** Authorizes and processes payout (gated on prior proof approval).

### 5. Admin Panel Full CRUD & User Management
- **Charities Directory CRUD:**
  - Add new charity partner modal (name, category, description, impact metric, image, featured flag).
  - Edit existing partner details.
  - Direct toggle for Homepage featured spotlight.
  - Delete charity partner with confirmation.
- **User Management:**
  - View all registered users and their subscriptions.
  - Real-time dropdown to toggle roles between `subscriber` and `admin`.
  - Toggle subscription status between `active`, `lapsed`, `cancelled`, and `inactive`.
  - Edit charity allocation percentage (enforces 10% minimum).

---

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Running Tests

```bash
npm test
```

Executes Vitest covering draw engine math, rolling-5 logic, winner proof state transitions, and charity CRUD operations.

### Production Build

```bash
npm run build
```

---

## Assumptions (PRD Clarifications)

1. **Auto-Assigned Entries:** Each active subscriber receives one 5-number ticket per monthly draw automatically without manual number picking.
2. **Prize Pool Base:** The prize pool is a configurable share of recognized subscription revenue (default 20%).
3. **Charity vs. Prize Pool Independence:** Charity giving (minimum 10%) and prize pool share are independent fee allocations.
4. **Algorithmic Weighting:** Documented as an explainable score-frequency bias anchored around the subscriber's rolling-5 Stableford scores.
