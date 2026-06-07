// ═══════════════════════════════════════════════════════════════════════════
// _contracts-stub.js — Package 04 (Quiz UX) local stubs for unmerged contracts
//
// WHY THIS EXISTS: package 04 depends on contracts owned by packages 00 (auth +
// tier + quiz_sessions DB) and 03 (accessibility), which had not merged when 04
// was built. Per wishlist/README.md ("stub against the contracts where a
// dependency hasn't merged, and mark each stub"), the quiz wires to these local
// stubs so all 18 tasks function end-to-end now.
//
// ┌─ SWAP-ON-MERGE ───────────────────────────────────────────────────────────┐
// │ When package 00 lands, replace the imports in CenteredQuiz.jsx:            │
// │    useAuth → '../../lib/auth'         (00, src/lib/auth.jsx)               │
// │    useTier → '../../lib/tier'         (00, src/lib/tier.js)                │
// │    saveQuizSession/loadQuizSession → '../../lib/db' (00, quiz_sessions)    │
// │ When package 03 lands, replace:                                            │
// │    useA11y → '../../lib/a11y'         (03, src/lib/a11y.jsx)               │
// │ Shapes here match README §1–3 exactly, so the swap is import-line-only.    │
// └────────────────────────────────────────────────────────────────────────────┘
//
// These stubs are localStorage-backed (no Supabase, no network) so the quiz is
// fully demoable standalone. They are NOT a security boundary — see the threat
// model in wishlist/README.md (premium is client-side UX gating, not a paywall).
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

const LS = {
  auth: 'potential.stub.auth',     // serialized { user, profile }
  tier: 'potential.stub.tier',     // 'free' | 'premium' | 'global'
  a11y: 'potential.stub.a11y',     // { reduceMotion, volume, muted }
  session: 'potential.stub.quizSession', // { answers, step, completed, updated_at }
};

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode */ }
};

// ── useAuth (contract: README §2 / package 00) ───────────────────────────────
// { user, profile, signIn, signOut, signUp, loading }
export function useAuth() {
  const [state, setState] = useState(() => readJSON(LS.auth, { user: null, profile: null }));

  const signUp = useCallback(({ email, name, birthday } = {}) => {
    const user = { id: 'stub-' + (email || 'user'), email: email || null };
    const profile = { name: name || '', birthday: birthday || null, tier: 'free', prefs: {} };
    const next = { user, profile };
    writeJSON(LS.auth, next);
    setState(next);
    return next;
  }, []);

  const signIn = useCallback(({ email, name, birthday } = {}) => {
    // Stub: a sign-in with no prior row behaves like sign-up.
    const existing = readJSON(LS.auth, null);
    if (existing?.user) { setState(existing); return existing; }
    return signUp({ email, name, birthday });
  }, [signUp]);

  const signOut = useCallback(() => {
    const next = { user: null, profile: null };
    writeJSON(LS.auth, next);
    setState(next);
  }, []);

  return {
    user: state.user,
    profile: state.profile,
    signIn,
    signUp,
    signOut,
    loading: false, // stub resolves synchronously
  };
}

// ── useTier (contract: README §1 / package 00) ───────────────────────────────
// { tier, isPremium, isGlobal }. Real impl reads profile.tier; stub reads
// localStorage so the Going-Global gate is demoable (default 'free' → locked).
export function useTier() {
  const tier = readJSON(LS.tier, 'free');
  return {
    tier,
    isPremium: tier === 'premium' || tier === 'global',
    isGlobal: tier === 'global',
  };
}

// ── useA11y (contract: README §3 / package 03) ───────────────────────────────
// { reduceMotion, setReduceMotion, volume, setVolume, muted, setMuted }
export function useA11y() {
  const [prefs, setPrefs] = useState(() =>
    readJSON(LS.a11y, { reduceMotion: false, volume: 0.5, muted: false }),
  );
  const update = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      writeJSON(LS.a11y, next);
      return next;
    });
  }, []);
  return {
    reduceMotion: prefs.reduceMotion,
    setReduceMotion: (v) => update({ reduceMotion: v }),
    volume: prefs.volume,
    setVolume: (v) => update({ volume: v }),
    muted: prefs.muted,
    setMuted: (v) => update({ muted: v }),
  };
}

// ── quiz_sessions DB (contract: README / package 00 db.js) ───────────────────
// Persists the answer map + current step for save-and-resume.
export function saveQuizSession({ answers, step, completed = false }) {
  const row = { answers, step, completed, updated_at: new Date().toISOString() };
  writeJSON(LS.session, row);
  return row;
}
export function loadQuizSession() {
  return readJSON(LS.session, null);
}
export function clearQuizSession() {
  try { localStorage.removeItem(LS.session); } catch { /* noop */ }
}
