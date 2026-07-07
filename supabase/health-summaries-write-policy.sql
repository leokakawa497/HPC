-- Allow the logged-in user to write their own imported health data.
-- Original design: only the Edge Function (service_role) wrote to
-- health_daily_summaries. The Apple Health XML import runs in the browser
-- with the user's session, so authenticated users need insert/update on
-- their own rows. Manual-data protection stays in the app layer
-- (import never touches rows with source = 'manual').

create policy "own health summaries insert"
  on public.health_daily_summaries for insert
  with check (auth.uid() = user_id);

create policy "own health summaries update"
  on public.health_daily_summaries for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
