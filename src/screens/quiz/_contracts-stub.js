// ═══════════════════════════════════════════════════════════════════════════
// _contracts-stub.js — Package 04 (Quiz UX) local stubs for still-unmerged contracts
//
// WHY THIS EXISTS: package 04 depends on contracts owned by other packages. As of
// this PR, package 00 (auth + tier) is merged, so the quiz imports the REAL
// useAuth/useTier from ../lib directly. What remains stubbed here:
//   • useA11y       — package 03 (accessibility) not yet merged (no src/lib/a11y).
//   • quiz_sessions — package-00 db.js exposes the `supabase` client but no
//                     save/load helper for the quiz_sessions table yet.
//
// ┌─ SWAP-ON-MERGE ───────────────────────────────────────────────────────────┐
// │ When package 03 lands:  useA11y → '../../lib/a11y' (src/lib/a11y.jsx).     │
// │ When a quiz_sessions helper lands (or wire supabase directly here):        │
// │   saveQuizSession/loadQuizSession/clearQuizSession → '../../lib/db'.        │
// │ Shapes here match README §1, §3, so the swap is import-line-only.          │
// └────────────────────────────────────────────────────────────────────────────┘
//
// These stubs are localStorage-backed (no network). They are NOT a security
// boundary — see the threat model in wishlist/README.md (premium is client-side
// UX gating, not a paywall).
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

const LS = {
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
