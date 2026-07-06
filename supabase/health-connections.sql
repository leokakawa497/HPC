-- HPC health_connections + health_daily_summaries
-- Run in Supabase: Dashboard → SQL Editor → New query → Paste → Run

-- ── 1. Connections (one per user per source) ────────────────────────────────
create table if not exists public.health_connections (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  source            text        not null default 'health_auto_export',
  ingest_token_hash text        not null,
  is_active         boolean     not null default true,
  last_sync_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(user_id, source)
);

alter table public.health_connections enable row level security;

-- User manages only their own connections
create policy "own health connections"
  on public.health_connections for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 2. Daily summaries (one per user per day per source) ────────────────────
create table if not exists public.health_daily_summaries (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  summary_date        date        not null,
  source              text        not null default 'health_auto_export',
  steps               integer,
  active_energy_kcal  numeric(7,1),
  sleep_minutes       integer,
  sleep_start         text,
  sleep_end           text,
  resting_heart_rate  integer,
  body_weight_kg      numeric(5,2),
  last_synced_at      timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id, summary_date, source)
);

alter table public.health_daily_summaries enable row level security;

-- User reads only their own summaries; Edge Function writes via service_role
create policy "own health summaries read"
  on public.health_daily_summaries for select
  using (auth.uid() = user_id);

-- Fast lookup by user + date range
create index if not exists health_daily_summaries_user_date
  on public.health_daily_summaries (user_id, summary_date desc);
