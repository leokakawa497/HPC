-- HPC Supabase schema
-- Safe to run in the Supabase Dashboard SQL Editor.
-- This creates tables, indexes and RLS policies only. It does not add secrets
-- and does not migrate localStorage data yet.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  slept_at time,
  woke_at time,
  sleep_minutes integer,
  note text,
  score integer,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  name text not null,
  kind text not null default 'check' check (kind in ('check', 'text')),
  icon text,
  active boolean not null default true,
  sort_order integer not null default 0,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_id)
);

create table if not exists public.daily_habit_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,
  entry_date date not null,
  done boolean not null default false,
  detail text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_id, entry_date)
);

create table if not exists public.workout_programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  name text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_id)
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.workout_programs(id) on delete cascade,
  name text not null,
  target_sets integer not null default 3,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid references public.workout_programs(id) on delete set null,
  local_id text,
  name text not null,
  session_date date not null,
  started_at timestamptz,
  ended_at timestamptz,
  duration_ms integer,
  prs jsonb not null default '[]'::jsonb,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_id)
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_name text not null,
  set_index integer not null default 0,
  weight numeric(8,2),
  reps integer,
  done boolean not null default false,
  is_pr boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  invite_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  kind text not null default 'activity',
  title text not null,
  stats jsonb not null default '[]'::jsonb,
  photo_url text,
  visibility text not null default 'private' check (visibility in ('private', 'group')),
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, log_date desc);
create index if not exists daily_habit_entries_user_date_idx on public.daily_habit_entries(user_id, entry_date desc);
create index if not exists workout_sessions_user_date_idx on public.workout_sessions(user_id, session_date desc);
create index if not exists workout_sets_session_idx on public.workout_sets(session_id);
create index if not exists feed_posts_user_created_idx on public.feed_posts(user_id, created_at desc);
create index if not exists feed_posts_group_created_idx on public.feed_posts(group_id, created_at desc);
create index if not exists group_members_user_idx on public.group_members(user_id);
create index if not exists group_members_group_idx on public.group_members(group_id);
create index if not exists post_comments_post_idx on public.post_comments(post_id, created_at);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.habits enable row level security;
alter table public.daily_habit_entries enable row level security;
alter table public.workout_programs enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.feed_posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.group_members gm1
      join public.group_members gm2 on gm1.group_id = gm2.group_id
      where gm1.user_id = auth.uid() and gm2.user_id = profiles.id
    )
  );
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

drop policy if exists "daily_logs_own" on public.daily_logs;
create policy "daily_logs_own" on public.daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "habits_own" on public.habits;
create policy "habits_own" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "daily_habit_entries_own" on public.daily_habit_entries;
create policy "daily_habit_entries_own" on public.daily_habit_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "workout_programs_own" on public.workout_programs;
create policy "workout_programs_own" on public.workout_programs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "workout_exercises_own" on public.workout_exercises;
create policy "workout_exercises_own" on public.workout_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "workout_sessions_own" on public.workout_sessions;
create policy "workout_sessions_own" on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "workout_sets_own" on public.workout_sets;
create policy "workout_sets_own" on public.workout_sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "groups_member_select" on public.groups;
create policy "groups_member_select" on public.groups
  for select using (
    owner_user_id = auth.uid()
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id and gm.user_id = auth.uid()
    )
  );
drop policy if exists "groups_owner_insert" on public.groups;
create policy "groups_owner_insert" on public.groups
  for insert with check (owner_user_id = auth.uid());
drop policy if exists "groups_owner_update" on public.groups;
create policy "groups_owner_update" on public.groups
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
drop policy if exists "groups_owner_delete" on public.groups;
create policy "groups_owner_delete" on public.groups
  for delete using (owner_user_id = auth.uid());

drop policy if exists "group_members_select_safe" on public.group_members;
create policy "group_members_select_safe" on public.group_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.groups g
      where g.id = group_members.group_id and g.owner_user_id = auth.uid()
    )
  );
drop policy if exists "group_members_insert_self_or_owner" on public.group_members;
create policy "group_members_insert_self_or_owner" on public.group_members
  for insert with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.groups g
      where g.id = group_id and g.owner_user_id = auth.uid()
    )
  );
drop policy if exists "group_members_owner_update" on public.group_members;
create policy "group_members_owner_update" on public.group_members
  for update using (
    exists (select 1 from public.groups g where g.id = group_id and g.owner_user_id = auth.uid())
  ) with check (
    exists (select 1 from public.groups g where g.id = group_id and g.owner_user_id = auth.uid())
  );
drop policy if exists "group_members_self_or_owner_delete" on public.group_members;
create policy "group_members_self_or_owner_delete" on public.group_members
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.groups g where g.id = group_id and g.owner_user_id = auth.uid())
  );

drop policy if exists "feed_posts_select_safe" on public.feed_posts;
create policy "feed_posts_select_safe" on public.feed_posts
  for select using (
    user_id = auth.uid()
    or (
      visibility = 'group'
      and group_id is not null
      and exists (
        select 1 from public.group_members gm
        where gm.group_id = feed_posts.group_id and gm.user_id = auth.uid()
      )
    )
  );
drop policy if exists "feed_posts_insert_own" on public.feed_posts;
create policy "feed_posts_insert_own" on public.feed_posts
  for insert with check (
    user_id = auth.uid()
    and (
      visibility = 'private'
      or exists (
        select 1 from public.group_members gm
        where gm.group_id = feed_posts.group_id and gm.user_id = auth.uid()
      )
    )
  );
drop policy if exists "feed_posts_update_own" on public.feed_posts;
create policy "feed_posts_update_own" on public.feed_posts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "feed_posts_delete_own" on public.feed_posts;
create policy "feed_posts_delete_own" on public.feed_posts
  for delete using (user_id = auth.uid());

drop policy if exists "post_likes_select_visible" on public.post_likes;
create policy "post_likes_select_visible" on public.post_likes
  for select using (
    exists (
      select 1 from public.feed_posts fp
      where fp.id = post_id
      and (
        fp.user_id = auth.uid()
        or (
          fp.visibility = 'group'
          and exists (
            select 1 from public.group_members gm
            where gm.group_id = fp.group_id and gm.user_id = auth.uid()
          )
        )
      )
    )
  );
drop policy if exists "post_likes_insert_own_visible" on public.post_likes;
create policy "post_likes_insert_own_visible" on public.post_likes
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.feed_posts fp
      where fp.id = post_id
      and (
        fp.user_id = auth.uid()
        or (
          fp.visibility = 'group'
          and exists (
            select 1 from public.group_members gm
            where gm.group_id = fp.group_id and gm.user_id = auth.uid()
          )
        )
      )
    )
  );
drop policy if exists "post_likes_delete_own" on public.post_likes;
create policy "post_likes_delete_own" on public.post_likes
  for delete using (user_id = auth.uid());

drop policy if exists "post_comments_select_visible" on public.post_comments;
create policy "post_comments_select_visible" on public.post_comments
  for select using (
    exists (
      select 1 from public.feed_posts fp
      where fp.id = post_id
      and (
        fp.user_id = auth.uid()
        or (
          fp.visibility = 'group'
          and exists (
            select 1 from public.group_members gm
            where gm.group_id = fp.group_id and gm.user_id = auth.uid()
          )
        )
      )
    )
  );
drop policy if exists "post_comments_insert_own" on public.post_comments;
create policy "post_comments_insert_own" on public.post_comments
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.feed_posts fp
      where fp.id = post_id
      and (
        fp.user_id = auth.uid()
        or (
          fp.visibility = 'group'
          and exists (
            select 1 from public.group_members gm
            where gm.group_id = fp.group_id and gm.user_id = auth.uid()
          )
        )
      )
    )
  );
drop policy if exists "post_comments_update_own" on public.post_comments;
create policy "post_comments_update_own" on public.post_comments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "post_comments_delete_own" on public.post_comments;
create policy "post_comments_delete_own" on public.post_comments
  for delete using (user_id = auth.uid());
