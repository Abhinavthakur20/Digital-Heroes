-- ============================================================
-- Digital Heroes — Supabase schema
-- Run this in a fresh Supabase SQL editor before seeding.
--
-- The app uses signed first-party sessions and string IDs in local/demo mode.
-- If you later migrate fully to Supabase Auth, keep these IDs as auth.uid()::text.
-- ============================================================

create extension if not exists "pgcrypto";

create table public.charities (
  id text primary key default ('charity-' || gen_random_uuid()::text),
  name text not null,
  category text not null default 'Community',
  description text not null default '',
  impact_metric text not null default '',
  image_url text,
  is_featured boolean not null default false,
  upcoming_events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id text primary key,
  role text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  full_name text not null,
  email text not null unique,
  charity_id text references public.charities(id) on delete set null,
  charity_pct numeric(5,2) not null default 10.00 check (charity_pct >= 10.00 and charity_pct <= 100.00),
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

create table public.subscriptions (
  id text primary key default ('sub-' || gen_random_uuid()::text),
  user_id text not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'lapsed')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_status_idx on public.subscriptions(status);

create table public.payments (
  id text primary key default ('pay-' || gen_random_uuid()::text),
  user_id text not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('stripe', 'razorpay', 'manual')),
  provider_order_id text,
  provider_payment_id text,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount numeric(12,2) not null,
  currency text not null,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

create index payments_user_id_idx on public.payments(user_id);
create index payments_status_idx on public.payments(status);

create table public.scores (
  id text primary key default ('score-' || gen_random_uuid()::text),
  user_id text not null references public.profiles(id) on delete cascade,
  value int not null check (value between 1 and 45),
  played_on date not null,
  created_at timestamptz not null default now(),
  unique (user_id, played_on)
);

create index scores_user_played_on_idx on public.scores(user_id, played_on desc);

create table public.draws (
  id text primary key default ('draw-' || gen_random_uuid()::text),
  month date not null,
  draw_type text not null check (draw_type in ('random', 'algorithmic')),
  status text not null default 'draft' check (status in ('draft', 'simulated', 'published')),
  winning_numbers int[] not null default '{}',
  pool_5_match numeric(12,2) not null default 0,
  pool_4_match numeric(12,2) not null default 0,
  pool_3_match numeric(12,2) not null default 0,
  jackpot_rollover numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (month)
);

create table public.draw_entries (
  id text primary key default ('entry-' || gen_random_uuid()::text),
  draw_id text not null references public.draws(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  numbers int[] not null,
  match_count int,
  created_at timestamptz not null default now(),
  unique (draw_id, user_id)
);

create index draw_entries_user_id_idx on public.draw_entries(user_id);

create table public.winners (
  id text primary key default ('winner-' || gen_random_uuid()::text),
  draw_id text not null references public.draws(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  match_tier int not null check (match_tier in (3, 4, 5)),
  amount numeric(12,2) not null,
  proof_url text,
  proof_file_name text,
  proof_mime_type text,
  proof_size int check (proof_size is null or proof_size <= 5242880),
  proof_uploaded_at timestamptz,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create index winners_user_id_idx on public.winners(user_id);
create index winners_status_idx on public.winners(verification_status, payment_status);

create table public.payouts (
  id text primary key default ('payout-' || gen_random_uuid()::text),
  winner_id text not null unique references public.winners(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.donations (
  id text primary key default ('don-' || gen_random_uuid()::text),
  charity_id text not null references public.charities(id) on delete cascade,
  donor_name text not null default 'Anonymous Hero',
  donor_email text,
  amount numeric(12,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index donations_charity_id_idx on public.donations(charity_id);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.scores enable row level security;
alter table public.charities enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winners enable row level security;
alter table public.payouts enable row level security;
alter table public.donations enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()::text and role = 'admin'
  );
$$;

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid()::text = id or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid()::text = id or public.is_admin());

create policy "subs_select_own_or_admin" on public.subscriptions
  for select using (auth.uid()::text = user_id or public.is_admin());
create policy "subs_admin_write" on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

create policy "payments_select_own_or_admin" on public.payments
  for select using (auth.uid()::text = user_id or public.is_admin());
create policy "payments_admin_write" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "scores_owner_or_admin" on public.scores
  for all using (auth.uid()::text = user_id or public.is_admin())
  with check (auth.uid()::text = user_id or public.is_admin());

create policy "charities_public_read" on public.charities
  for select using (true);
create policy "charities_admin_write" on public.charities
  for all using (public.is_admin()) with check (public.is_admin());

create policy "draws_public_read_published" on public.draws
  for select using (status = 'published' or public.is_admin());
create policy "draws_admin_write" on public.draws
  for all using (public.is_admin()) with check (public.is_admin());

create policy "entries_owner_or_admin" on public.draw_entries
  for select using (auth.uid()::text = user_id or public.is_admin());
create policy "entries_admin_write" on public.draw_entries
  for all using (public.is_admin()) with check (public.is_admin());

create policy "winners_owner_read" on public.winners
  for select using (auth.uid()::text = user_id or public.is_admin());
create policy "winners_owner_proof_update" on public.winners
  for update using (auth.uid()::text = user_id or public.is_admin())
  with check (auth.uid()::text = user_id or public.is_admin());
create policy "winners_admin_write" on public.winners
  for all using (public.is_admin()) with check (public.is_admin());

create policy "payouts_owner_or_admin_read" on public.payouts
  for select using (auth.uid()::text = user_id or public.is_admin());
create policy "payouts_admin_write" on public.payouts
  for all using (public.is_admin()) with check (public.is_admin());

create policy "donations_public_insert" on public.donations
  for insert with check (true);
create policy "donations_public_charity_read" on public.donations
  for select using (true);
