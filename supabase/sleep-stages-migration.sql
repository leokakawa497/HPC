-- Sleep stages detail (Huawei-style full sleep review)
-- Adds per-stage minutes and the night's stage timeline for the hypnogram.
-- sleep_segments: array of [offset_min_from_sleep_start, duration_min, stage]
-- where stage is 'd' (deep), 'c' (core/light), 'r' (REM), 'w' (awake).

alter table public.health_daily_summaries
  add column if not exists sleep_deep_minutes  integer,
  add column if not exists sleep_core_minutes  integer,
  add column if not exists sleep_rem_minutes   integer,
  add column if not exists sleep_awake_minutes integer,
  add column if not exists sleep_segments      jsonb;
