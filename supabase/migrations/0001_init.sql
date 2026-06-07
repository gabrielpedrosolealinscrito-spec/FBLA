-- ============================================================================
-- Package 00 — Foundation: Auth + Database + Tier
-- Migration 0001: profiles + quiz_sessions, RLS, and signup trigger.
--
-- Safe to run more than once (idempotent): every object uses IF NOT EXISTS or is
-- dropped before create. Paste into the Supabase dashboard SQL Editor and Run,
-- or apply via `supabase db push` once the CLI is linked.
--
-- Threat model: city scoring is client-side; "premium" is UX feature-gating, NOT
-- a secure paywall. RLS below is defense-in-depth so a user can only read/write
-- their OWN rows — it is not a content paywall.
-- ============================================================================

-- ── profiles ──────────────────────────────────────────────────────────────
-- One row per auth user. tier drives the freemium gates (README §1).
-- prefs holds package-03 accessibility settings (README §3):
--   { "reduceMotion": false, "volume": 0.5, "muted": false }
create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text default '',
  birthday   date,
  tier       text not null default 'free' check (tier in ('free', 'premium', 'global')),
  prefs      jsonb not null default '{"reduceMotion": false, "volume": 0.5, "muted": false}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── quiz_sessions ─────────────────────────────────────────────────────────
-- Save-and-resume for the quiz (package 04). answers serializes the quiz
-- engine's answer map; step is the resume point.
create table if not exists public.quiz_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  answers    jsonb not null default '{}'::jsonb,
  step       integer not null default 0,
  completed  boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists quiz_sessions_user_id_idx on public.quiz_sessions (user_id);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.quiz_sessions enable row level security;

-- profiles: a user may read/insert/update only their own row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- quiz_sessions: full CRUD on own rows only.
drop policy if exists "quiz_sessions_select_own" on public.quiz_sessions;
create policy "quiz_sessions_select_own" on public.quiz_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "quiz_sessions_insert_own" on public.quiz_sessions;
create policy "quiz_sessions_insert_own" on public.quiz_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "quiz_sessions_update_own" on public.quiz_sessions;
create policy "quiz_sessions_update_own" on public.quiz_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "quiz_sessions_delete_own" on public.quiz_sessions;
create policy "quiz_sessions_delete_own" on public.quiz_sessions
  for delete using (auth.uid() = user_id);

-- ── Auto-create the profile row on signup ───────────────────────────────────
-- Reads name + birthday from the user_metadata that auth.signUp() sends
-- (options.data in src/lib/auth.jsx). SECURITY DEFINER so the insert runs as the
-- table owner and bypasses RLS (the new user has no session yet at trigger time);
-- search_path is pinned to '' to prevent search_path-hijack — the standard
-- Supabase footgun. New users always start tier='free'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, name, birthday)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'birthday', '')::date
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
