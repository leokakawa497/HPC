-- HPC health_metrics table
-- Run this in Supabase: Dashboard → SQL Editor → New query → Paste → Run
--
-- Stores one row per user per day, synced from Apple Health via iOS Shortcut.
-- Sources: Renpho → Apple Health (weight, body fat)
--          Huawei  → Apple Health (sleep, steps, HR)
--          Apple Watch (workouts, active cal, HRV, VO2max)

create table if not exists public.health_metrics (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  date         date        not null,

  -- Sleep (Huawei via Apple Health)
  sleep_min    integer,          -- total sleep in minutes
  sleep_bed    text,             -- bedtime  e.g. "23:05"
  sleep_wake   text,             -- wake time e.g. "06:57"

  -- Body (Renpho via Apple Health)
  weight_kg    numeric(5,2),
  body_fat_pct numeric(4,1),

  -- Cardio
  resting_hr   integer,          -- bpm
  hrv          integer,          -- ms (HRV SDNN)
  vo2max       numeric(4,1),

  -- Activity
  steps        integer,
  active_cal   integer,
  stand_hours  integer,

  -- Workouts: [{type, duration_min, cal, source}]
  workouts     jsonb  default '[]'::jsonb,

  -- Meta
  source       text   default 'shortcut',   -- 'shortcut' | 'capacitor'
  synced_at    timestamptz default now(),

  unique(user_id, date)
);

-- Row Level Security: each user sees and edits only their own rows
alter table public.health_metrics enable row level security;

create policy "Users manage own health metrics"
  on public.health_metrics
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast date lookups
create index if not exists health_metrics_user_date
  on public.health_metrics (user_id, date desc);
