-- ============================================================================
-- Migration 0002: waitlist
-- Paid plans aren't open for purchase yet (checkout = Phase 8). The pricing page
-- collects emails here. Insert-only by RLS: the anon key can add a row but has
-- no SELECT policy, so the list can't be read back from the client.
-- Idempotent — safe to run more than once.
-- ============================================================================

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Anyone (anon or authenticated) may join. No select/update/delete policy, so
-- rows are write-only from the client; read the list from the dashboard/service role.
drop policy if exists "waitlist_insert_any" on public.waitlist;
create policy "waitlist_insert_any" on public.waitlist
  for insert with check (true);
