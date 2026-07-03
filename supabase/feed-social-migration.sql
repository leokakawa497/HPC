-- Feed Social Migration
-- Run this once in the Supabase SQL Editor.
-- Idempotent: safe to run multiple times.

-- Allow users to see profiles of people in the same group (needed for post author names)
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
