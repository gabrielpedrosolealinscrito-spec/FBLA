# Supabase setup — Package 00 (Auth + DB + Tier)

Auth + Postgres for Potential. City scoring stays client-side; this layer adds
accounts, a `tier` per user, and save/resume — **not** a secure paywall.

## 1. Environment variables

In `.env.local` (gitignored) — and mirror in Vercel (Project → Settings → Env Vars):

```
VITE_SUPABASE_URL=https://ycnwcaqhasecqwkbyjvk.supabase.co
VITE_SUPABASE_ANON_KEY=<anon / public key from Settings → API>
```

`VITE_`-prefixed vars ship to the browser bundle. The **anon key is safe to
expose** — Row Level Security protects the rows, not key secrecy. **Never** put
the `service_role` key in a `VITE_` var.

For CLI / migration pushes only (not bundled):

```
SUPABASE_ACCESS_TOKEN=<personal access token, dashboard → Account → Access Tokens>
```

If the env vars are absent the app still runs — `db.js` degrades to anonymous
mode (auth + persistence disabled), so the keyless demo never crashes.

## 2. Apply the schema

Either path creates `profiles` + `quiz_sessions` with RLS and the signup trigger:

- **SQL Editor (no CLI):** paste `supabase/migrations/0001_init.sql` into the
  dashboard SQL Editor → Run. It's idempotent — safe to run twice.
- **CLI:** `supabase link --project-ref ycnwcaqhasecqwkbyjvk` then
  `supabase db push` (needs `SUPABASE_ACCESS_TOKEN`).

## 3. Dashboard auth settings (only the dashboard can do these)

- **Email confirmation OFF for the demo:** Authentication → Providers → Email →
  turn off **Confirm email**. With it on, sign-up returns no session and the user
  isn't logged in until they click an email link — breaking "stays logged in
  across reload." (`signUp` reports `needsConfirmation` if you leave it on.)
- **Google OAuth (optional):** Authentication → Providers → Google → enable with
  a Google client ID/secret. Until then the "Continue with Google" button errors;
  email/password works with zero config.

## 4. Verify

- Sign up a new user → a `profiles` row appears with `tier='free'`.
- Reload the page → still logged in.
- Flip that row's `tier` to `premium` in the dashboard → the `LockGate`-gated UI
  unlocks with no code change (via `useTier()` → `PotentialApp`).
