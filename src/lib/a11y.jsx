// src/lib/a11y.jsx
// AccessibilityProvider + useA11y() — the ONE site-wide accessibility store
// (wishlist package 03, README §3). Every consumer reads this; no screen keeps
// its own mute/motion state.
//
// Contract (matches src/screens/quiz/_contracts-stub.js exactly so package 04's
// stub→real swap is import-line-only):
//   const { reduceMotion, setReduceMotion, volume, setVolume, muted, setMuted } = useA11y();
//   reduceMotion -> boolean   volume -> 0..1   muted -> boolean
//
// Source-of-truth split (see src/lib/ambientAudio.js header):
//   • ambient singleton = the "device" holding live mute/volume (so audio is
//     correct before React mounts and survives screen changes).
//   • this provider = the settings store. It MIRRORS ambient into React state
//     (via ambient.subscribe, so Landing's imperative toggle stays in sync) and
//     PERSISTS changes — Supabase profiles.prefs when logged in, localStorage
//     otherwise. reduceMotion lives here only (not an audio concern).
//
// Graceful degradation: with no Supabase keys, useAuth supplies user=null and
// only the localStorage path runs — exactly as the app behaved pre-auth.

import {
  createContext, useContext, useEffect, useState, useRef, useCallback,
} from 'react';
import { useAuth } from './auth.jsx';
import { supabase } from './db.js';
import ambient from './ambientAudio.js';

const A11yContext = createContext(null);
const LS_KEY = 'potential.a11y';

function prefersReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch (e) { return false; }
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

export function AccessibilityProvider({ children }) {
  const { user, profile } = useAuth();

  const stored = readLocal();
  const [reduceMotion, setReduceMotionState] = useState(() =>
    stored && typeof stored.reduceMotion === 'boolean'
      ? stored.reduceMotion
      : prefersReducedMotion(),
  );
  // muted/volume are mirrored FROM the ambient singleton (the live source).
  const [muted, setMutedState] = useState(() => ambient.isMuted());
  const [volume, setVolumeState] = useState(() => ambient.getVolume());

  // Mirror ambient → React. Covers both the popup setters (which call ambient)
  // and Landing's imperative speaker toggle — one value, one update path.
  useEffect(() => {
    const unsub = ambient.subscribe(() => {
      setMutedState(ambient.isMuted());
      setVolumeState(ambient.getVolume());
    });
    return unsub;
  }, []);

  // ── Load: adopt the logged-in user's saved prefs, once per user. ──
  // `dbReady` gates the save effect so we never clobber stored prefs with the
  // default/local values before hydration has run (load-before-save race).
  const appliedFor = useRef(null);
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    if (!user || !profile) { appliedFor.current = null; setDbReady(false); return; }
    if (appliedFor.current === user.id) return;
    appliedFor.current = user.id;

    const prefs = profile.prefs;
    if (prefs && typeof prefs === 'object') {
      if (typeof prefs.reduceMotion === 'boolean') setReduceMotionState(prefs.reduceMotion);
      if (typeof prefs.muted === 'boolean') ambient.setMuted(prefs.muted);
      if (typeof prefs.volume === 'number') ambient.setVolume(prefs.volume);
    }
    // If prefs were absent, the save effect now pushes current state up to the
    // DB, initializing the row's prefs for this user.
    setDbReady(true);
  }, [user, profile]);

  // ── Save: localStorage always; DB only once hydrated (debounced). ──
  const persistTimer = useRef(null);
  useEffect(() => {
    const snapshot = { reduceMotion, volume, muted };
    try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot)); } catch (e) {}

    if (user && dbReady && supabase) {
      clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        supabase
          .from('profiles')
          .update({ prefs: snapshot })
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.warn('[a11y] prefs save failed:', error.message);
          });
      }, 400);
    }
    return () => clearTimeout(persistTimer.current);
  }, [reduceMotion, volume, muted, user, dbReady]);

  // Reflect reduced motion onto <html> so imperative / non-React screens
  // (Landing's loader spin, package 02's compass) can gate animation.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', reduceMotion);
    root.setAttribute('data-reduce-motion', reduceMotion ? 'true' : 'false');
  }, [reduceMotion]);

  const setReduceMotion = useCallback((v) => setReduceMotionState(Boolean(v)), []);
  const setMuted = useCallback((v) => ambient.setMuted(Boolean(v)), []);
  const setVolume = useCallback((v) => ambient.setVolume(v), []);

  const value = { reduceMotion, setReduceMotion, volume, setVolume, muted, setMuted };
  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (ctx === null) {
    throw new Error('useA11y() must be used within <AccessibilityProvider>');
  }
  return ctx;
}
