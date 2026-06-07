---
phase: 08-freemium-tier-gate
reviewed: 2026-06-06T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - shared/types.ts
  - src/components/LockGate.jsx
  - src/components/DemoTierSwitcher.jsx
  - src/components/RunsBadge.jsx
  - src/components/PricingModal.jsx
  - src/screens/PotentialApp.jsx
  - src/screens/ResultsMap.jsx
  - src/screens/Roadmap.jsx
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 08: Code Review Report

**Reviewed:** 2026-06-06
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Phase 08 delivers a presentation-layer freemium tier-gate: `canAccess`/`TIER_FEATURES`/`TIER_RUNS_MAP` contract in `shared/types.ts`, `LockGate` (blur/padlock dual-mode), `DemoTierSwitcher` (hidden gesture-revealed pill), `RunsBadge` (header chip), `PricingModal` (4-tier upsell overlay), wiring in `PotentialApp`, and rank-gate in `ResultsMap`. The threat model explicitly accepts DevTools bypass and gesture obscurity for the demo scope; those are not flagged here.

The contract logic (`canAccess`, `TIER_FEATURES`) is correct and well-tested. Body scroll-lock cleanup, gesure listener cleanup, and gold-literal theme isolation are correctly implemented. No data loss, injection, or auth-bypass risks exist.

Four warnings are filed: an invisible-overlay click interceptor during the LockGate dissolve animation, an unused `currentTier` prop that causes a misleading "Current plan" label regardless of actual tier, an uncleared `tapTimer` timeout on component unmount, and `window.matchMedia` called unconditionally at render time (SSR/test-environment crash risk). Three info items cover unused imports, map pins bypassing the rank gate, and dead prop documentation.

## Warnings

### WR-01: Invisible overlay intercepts clicks during LockGate dissolve animation

**File:** `src/components/LockGate.jsx:71-108`

**Issue:** When a section unlocks (tier upgraded), `animating` becomes `true` for 450 ms. During this window the component does NOT return early — it falls through to the overlay render path with `overlayOpacity = 0` and `blurAmount = "0px"`. The overlay `<div>` retains `onClick={onUnlock}` and `cursor: "pointer"` while having `opacity: 0`. In all major browsers, an element with `opacity: 0` still receives pointer events (default `pointer-events: auto`). A user who clicks in the content area during the 450 ms dissolve will fire `onUnlock` — silently re-opening the PricingModal on a section that already appears unlocked. This is observable on slower devices where the transition is longer in practice.

**Fix:**
```jsx
// Add pointerEvents: "none" to the overlay when not locked
<div
  onClick={locked ? onUnlock : undefined}
  style={{
    ...
    opacity: overlayOpacity,
    pointerEvents: locked ? "auto" : "none",  // <-- add this
    cursor: locked ? "pointer" : "default",
    ...
  }}
>
```

---

### WR-02: `currentTier` prop is received but never used — "Current plan" label is always on Free

**File:** `src/components/PricingModal.jsx:68, 12-50`

**Issue:** `PricingModal` accepts a `currentTier` prop but never reads it. The `TIERS_CONFIG` array hardcodes `ctaClickable: false` and `cta: "Current plan"` only on the `free` entry. This means:
- A Basic user opens the modal → Free shows "Current plan", Basic shows "Get Basic" (wrong — Basic IS their current plan and they should not be prompted to "Get" it again).
- A Plus user opens the modal → Free shows "Current plan" (wrong).
- Only a Free user sees a correct state.

In a pitch demo where the presenter cycles through tiers and repeatedly opens the modal, this is visually incorrect and could confuse judges evaluating the product UX.

**Fix:**
```jsx
// In PricingModal, replace the hardcoded ctaClickable check with a dynamic comparison:
{tier.ctaClickable && tier.key !== currentTier ? (
  <button onClick={() => { onTier(tier.key); onClose(); }}>
    {tier.key === "free" ? "Downgrade" : tier.cta}
  </button>
) : (
  <div style={{ ... }}>
    {tier.key === currentTier ? "Current plan" : tier.cta}
  </div>
)}
```
And remove `ctaClickable` from `TIERS_CONFIG` (derive it from `tier.key !== currentTier`), or update each entry's `cta` dynamically based on `currentTier`.

---

### WR-03: `tapTimer` is not cleared in the gesture `useEffect` cleanup

**File:** `src/screens/PotentialApp.jsx:70-91`

**Issue:** The gesture `useEffect` cleanup removes both event listeners but does not call `clearTimeout(tapTimer)`. If the component unmounts while a 600 ms reset timer is pending (e.g., a rapid triple-tap triggers unmount through navigation), the stale timeout fires after unmount and attempts `setPresenterMode` on an unmounted component. In React 18 strict-mode (double-invoke) or fast navigation, this produces the "Can't perform a React state update on an unmounted component" warning and can cause a no-op state leak in the timer queue.

**Fix:**
```jsx
return () => {
  window.removeEventListener("click", onPresenterGesture);
  window.removeEventListener("touchstart", onPresenterGesture);
  clearTimeout(tapTimer);  // <-- add this line
};
```

---

### WR-04: `window.matchMedia` called unconditionally at render time — crashes in SSR or jsdom without matchMedia

**File:** `src/components/LockGate.jsx:68`

**Issue:** `const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;` executes on every render at the module function body level (not inside a `useEffect` or a guard). In jsdom (the test environment used by this project's Vitest suite), `window.matchMedia` is not implemented and returns `undefined`, causing `TypeError: window.matchMedia is not a function`. The existing `tests/lock-gate.test.tsx` passes currently only because the three LockGate tests happen to not trigger this path — but any test that renders a locked LockGate and checks the resulting DOM will fail. Additionally, this reads the media query once at render time rather than subscribing to changes, so a user who enables reduced motion after page load will not see the snap transition until a re-render is triggered.

**Fix:**
```jsx
// Replace the bare call with a safe guard:
const reduced =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Or move into a useEffect + useState to subscribe to changes:
const [reduced, setReduced] = useState(false);
useEffect(() => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  setReduced(mq.matches);
  const handler = (e) => setReduced(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}, []);
```

---

## Info

### IN-01: `DemoTierSwitcher.jsx` imports `useState` and `useEffect` but uses neither

**File:** `src/components/DemoTierSwitcher.jsx:1`

**Issue:** `import { useState, useEffect } from "react";` — neither hook is called anywhere in the component body. These are dead imports, likely left over from a scaffolding template. They add noise and could confuse future readers into expecting stateful behavior.

**Fix:** Remove the import line and replace with `import React from "react";` only if needed (or omit entirely if the project uses the auto-JSX runtime, which it does per the 08-02-SUMMARY.md note).

```jsx
// Remove line 1 entirely or replace with:
// (no import needed with auto-JSX runtime)
```

---

### IN-02: Map pins in `ResultsMap` bypass the rank gate — all cities clickable regardless of tier

**File:** `src/screens/ResultsMap.jsx:137`

**Issue:** `{results.map(c => <Pin key={c.name} c={c} />)}` renders a clickable map pin for every city in `results`, not just `visibleRows`. At Free tier (rank cutoff = 1), a user can click any pin on the map to navigate to any city detail — completely bypassing the rank gate that hides the list rows. The city detail then renders fully (financials gated, but the city name, match score, and hero data are visible). This inconsistency means the rank gate is enforced on the list but not on the map.

This may be an accepted design decision (the map is a teaser, only the list is gated). If intentional, it should be documented. If not, pins for hidden cities should either be removed or rendered non-clickable.

**Fix (if gating is intended on the map):**
```jsx
// Replace results.map with visibleRows.map for pins, and render non-interactive
// ghost pins for hiddenRows:
{visibleRows.map(c => <Pin key={c.name} c={c} />)}
{hiddenRows.map(c => (
  <div key={c.name} className="pin"
    style={{ left: pctL(c.lng) + "%", top: pctT(c.lat) + "%", opacity: 0.25, cursor: "default" }}
  />
))}
```

---

### IN-03: `currentTier` prop is documented in `PotentialApp` key-link but produces no observable behavior in the modal

**File:** `src/components/PricingModal.jsx:68` / `src/screens/PotentialApp.jsx:469-474`

**Issue:** The `currentTier={tier}` prop is wired in `PotentialApp` and documented in the 08-04 plan key-links, implying it drives per-tier state display in the modal. Because it is unused (covered in WR-02), the prop wiring is dead at the `PricingModal` end. This creates a mismatch between the interface contract and implementation — a reader of `PotentialApp` would reasonably expect the modal to render the user's current tier differently.

**Fix:** Either implement the dynamic CTA logic described in WR-02, or remove `currentTier` from the prop interface if the "Free always shows Current plan" design is acceptable.

---

_Reviewed: 2026-06-06_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
