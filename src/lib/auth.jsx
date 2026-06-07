// src/lib/auth.jsx
// AuthProvider + useAuth() — the real Supabase-backed auth context.
// (Replaces the package-01 localStorage stub wholesale; same call shape so
// Login.jsx and every other consumer need no change.)
//
// Contract (README §2) — consumed by 01 (login), 03 (profile popup),
// 04 (pre-quiz account check + save/resume):
//   const { user, profile, signIn, signUp, signInWithGoogle, signOut, loading } = useAuth();
//   user    -> Supabase auth user ({ id, email, ... }) or null
//   profile -> { user_id, name, birthday, tier, prefs } from public.profiles, or null
//   loading -> true until the initial session restore + profile fetch settle
//
// Call shape (kept identical to the stub so package 01's Login doesn't change):
//   signUp(email, password, { name, birthday }) -> { error: string|null, needsConfirmation? }
//   signIn(email, password)                     -> { error: string|null }
//   signInWithGoogle()                          -> { error: string|null }
//   signOut()                                   -> { error: string|null }
// `error` is a STRING (or null) because Login renders it directly as a child.
//
// Threat model (Package 00): city scoring is client-side; "premium" is UX
// feature-gating, NOT a secure paywall. RLS on profiles/quiz_sessions is
// defense-in-depth for user-owned rows, not a content paywall.
//
// Graceful degradation: when Supabase isn't configured (keyless demo build) the
// provider supplies an anonymous context (user/profile null, loading false) and
// every method returns a clear error string. The app runs as it did pre-auth.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './db.js';

const AuthContext = createContext(null);

const NOT_CONFIGURED = { error: 'Auth is not configured (Supabase env vars missing).' };
const errStr = (e) => (e ? (e.message ?? String(e)) : null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the user's profile row. null if absent (e.g. the row-creation trigger
  // hasn't fired yet). prefs is where package 03 persists a11y settings (§3).
  const loadProfile = useCallback(async (uid) => {
    if (!uid || !supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, name, birthday, tier, prefs')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) {
      console.warn('[auth] profile fetch failed:', error.message);
      return null;
    }
    return data;
  }, []);

  // Initial session restore + subscribe to auth changes (login/logout/refresh).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u);
      setProfile(u ? await loadProfile(u.id) : null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u);
      setProfile(u ? await loadProfile(u.id) : null);
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, [loadProfile]);

  // ── Auth methods (positional signatures match the package-01 stub) ──────────

  // Email + password. name + birthday ride along as user_metadata so the
  // handle_new_user DB trigger creates the profiles row from them (birthday, not
  // age — package 04 wants birthday captured at signup).
  //
  // If "Confirm email" is ON in the dashboard, signUp returns NO session — the
  // user isn't logged in until they confirm. We surface { needsConfirmation:true }
  // so package 01 can show a "check your email" state. For the FBLA demo, turn
  // Confirm email OFF (Auth -> Providers -> Email) so sign-up logs in directly.
  const signUp = useCallback(async (email, password, { name, birthday } = {}) => {
    if (!isSupabaseConfigured) return NOT_CONFIGURED;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name ?? '', birthday: birthday || null } },
    });
    if (error) return { error: errStr(error) };
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) return NOT_CONFIGURED;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: errStr(error) };
  }, []);

  // Google OAuth. Requires the Google provider enabled in the Supabase dashboard
  // (Authentication -> Providers -> Google) — until then this errors. Redirects
  // back to the app; detectSessionInUrl (db.js) completes the session on return.
  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) return NOT_CONFIGURED;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error: errStr(error) };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return NOT_CONFIGURED;
    const { error } = await supabase.auth.signOut();
    return { error: errStr(error) };
  }, []);

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    isConfigured: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth() must be used within <AuthProvider>');
  }
  return ctx;
}
