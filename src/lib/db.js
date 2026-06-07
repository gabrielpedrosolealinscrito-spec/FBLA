// src/lib/db.js
// Supabase browser client — single shared instance for auth + Postgres access.
//
// Env discipline (mirrors api/live.ts): keys come from env, never hardcoded.
// Vite only exposes VITE_-prefixed vars to the client bundle, and the Supabase
// ANON key is SAFE to ship there by design — Row Level Security protects the
// rows, not key secrecy. The service_role key must NEVER appear in a VITE_ var.
//
// Threat model (Package 00): city scoring is client-side (src/lib/matchEngine.js
// + bundled golden-path). "Premium" is UX feature-gating, NOT a secure paywall.
// RLS here is defense-in-depth for user-owned rows (profiles/quiz_sessions), not
// a content paywall. A real paywall = move premium compute behind api/ later.
//
// Graceful degradation: if the env vars are absent (e.g. the keyless FBLA demo
// build), we export `supabase = null` and `isSupabaseConfigured = false` instead
// of throwing. AuthProvider then runs in anonymous mode and the app behaves
// exactly as it did before auth existed. This is what lets packages 01/02/04
// build against the contracts before keys land.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // One-time warning — not an error. The app still runs without auth.
  console.warn(
    '[db] Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
    'Running in anonymous mode; auth + persistence are disabled.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,    // survive reload (acceptance: "stays logged in across reload")
        autoRefreshToken: true,
        detectSessionInUrl: true, // needed for the Google OAuth redirect callback
      },
    })
  : null;

// ── Waitlist ────────────────────────────────────────────────────────────────
// Paid plans aren't open for purchase yet (checkout = Phase 8). The pricing page
// collects emails into public.waitlist (insert-only via RLS — the anon key can
// add a row but cannot read the list back). Returns { error: string|null }.
// A duplicate email is treated as success (you're already on the list).
export async function joinWaitlist(email) {
  if (!isSupabaseConfigured) {
    return { error: 'The waitlist is offline right now. Please try again later.' };
  }
  const { error } = await supabase.from('waitlist').insert({ email: email.trim().toLowerCase() });
  if (error) {
    if (error.code === '23505') return { error: null }; // unique violation = already joined
    return { error: error.message };
  }
  return { error: null };
}
