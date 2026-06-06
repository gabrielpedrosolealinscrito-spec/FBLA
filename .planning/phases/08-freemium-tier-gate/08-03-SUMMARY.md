---
phase: 08
plan: 03
subsystem: freemium-tier-gate
tags: [tier-switcher, presenter-mode, runs-badge, demo-ux, gesture, freemium]
dependency_graph:
  requires:
    - 08-01: shared/types.ts TIER_RUNS_MAP + Tier union
    - 08-02: PotentialApp tier state + LockGate gating already wired
  provides:
    - src/components/DemoTierSwitcher.jsx (hidden floating pill, presenterMode-gated)
    - src/components/RunsBadge.jsx (header chip reading TIER_RUNS_MAP)
    - src/screens/PotentialApp.jsx presenterMode state + corner-triple-tap gesture + overlay mount
  affects:
    - tests/demo-switcher.test.tsx (now GREEN)
    - tests/runs-badge.test.tsx (now GREEN)
tech_stack:
  added: []
  patterns:
    - Gold-literal hardcoding (never var(--accent) — green host scope hazard)
    - Corner triple-tap gesture (bottom-right 80x80px hotspot, 3 taps/600ms) at PotentialApp root
    - renderScreen() inner function wrapping per-step early-returns so overlay sibling renders alongside
    - presenterMode bool state at PotentialApp root (false default — judges see clean consumer app)
key_files:
  created:
    - src/components/DemoTierSwitcher.jsx
    - src/components/RunsBadge.jsx
  modified:
    - src/screens/PotentialApp.jsx
decisions:
  - renderScreen() wrap approach keeps per-step JSX byte-identical; overlay is a sibling in the root return
  - No var(--accent) anywhere in DemoTierSwitcher or RunsBadge — comments rewritten to avoid the string
  - RunsBadge sources labels exclusively from TIER_RUNS_MAP; no re-hardcoded strings
  - Abbreviated labels (Fr|Ba|+|★) for <400px via scoped style tag + CSS class toggle (not second button set)
  - RunsBadge placed in city-detail header alongside "potential" wordmark in a flex row with gap:10
  - tapCount/tapTimer defined inside the useEffect closure (not module scope) for clean isolation
metrics:
  duration: 3min
  completed: 2026-06-06
  tasks: 3
  files: 3
---

# Phase 8 Plan 03: DemoTierSwitcher + RunsBadge + presenterMode Wiring Summary

**One-liner:** Hidden floating tier pill (corner-triple-tap gesture, gold-literal, presenterMode-gated) + runs badge header chip (TIER_RUNS_MAP-sourced, gold-literal) + presenterMode state with root gesture listener wired into PotentialApp.

---

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Build DemoTierSwitcher (hidden floating pill, gold-literal) | a71e39c | src/components/DemoTierSwitcher.jsx |
| 2 | Build RunsBadge (header chip, gold-literal) | affaa18 | src/components/RunsBadge.jsx |
| 3 | Wire presenterMode + corner gesture + mount switcher and badge | b93dfff | src/screens/PotentialApp.jsx |

---

## Test Results (Wave 2)

### DemoTierSwitcher tests — GREEN

```
npm test -- -t "DemoTierSwitcher"

 Test Files  1 passed | 17 skipped (18)
      Tests  2 passed | 163 skipped (165)
```

- `DemoTierSwitcher renders nothing when visible is false` — PASS
- `DemoTierSwitcher renders four tier buttons when visible is true` — PASS

### RunsBadge tests — GREEN

```
npm test -- -t "RunsBadge"

 Test Files  1 passed | 17 skipped (18)
      Tests  4 passed | 165 skipped (169)
```

- `RunsBadge renders nothing for free tier (null label)` — PASS
- `RunsBadge renders correct label for basic tier` — PASS
- `RunsBadge renders correct label for plus tier` — PASS
- `RunsBadge renders correct label for premium tier` — PASS

### Full suite (Wave 2 final)

```
npm test

 Test Files  18 passed (18)
      Tests  169 passed (169)
```

Zero regressions. Both Wave 2 gate files are now GREEN. Full suite went from 2 failed + 16 passed (after 08-02) to 18 passed.

---

## Contracts Delivered

### DemoTierSwitcher (src/components/DemoTierSwitcher.jsx)

```jsx
export default function DemoTierSwitcher({ tier, onTier, visible })
```

**Behavior:**
- `visible=false` → `return null` immediately (hidden from judges)
- `visible=true` → renders a fixed floating pill (bottom center, zIndex 9999) with 4 buttons
- Active button: `#e2b56b` color, `rgba(226,181,107,.13)` bg, `1.5px solid #e2b56b` outline, `fontWeight 600`
- Inactive buttons: `rgba(243,237,225,0.5)` dim, no outline
- Responsive: full labels ("Free/Basic/Plus/Premium") at ≥400px; abbreviated ("Fr/Ba/+/★") at <400px via scoped `<style>` tag + CSS classes (single button set — no button count inflation)
- Pill container: `rgba(13,17,25,0.90)` bg, `backdrop-filter:blur(14px)`, 8px uniform padding, 4px gap

**Theme compliance:** all gold values hardcoded; zero CSS custom properties. The comment referencing var(--accent) was rewritten to avoid the literal string (same pattern as 08-02 LockGate deviation).

### RunsBadge (src/components/RunsBadge.jsx)

```jsx
export default function RunsBadge({ tier })
```

**Behavior:**
- Reads `const label = TIER_RUNS_MAP[tier]`
- `free` → TIER_RUNS_MAP returns `null` → `return null` (no badge rendered)
- `basic` → "Basic · 1 of 1 run"
- `plus` → "Plus · 2 of 3 runs left"
- `premium` → "Premium · unlimited"
- Chip style: JetBrains Mono 11px, `#e2b56b` text, `rgba(226,181,107,.13)` bg, 3px/10px padding, radius 6, letterSpacing .03em

**Theme compliance:** all gold values hardcoded; zero CSS custom properties. Labels sourced from the TIER_RUNS_MAP contract, not re-hardcoded.

### PotentialApp wiring (src/screens/PotentialApp.jsx additions)

**New state:**
```jsx
const [presenterMode, setPresenterMode] = useState(false);
```

**Gesture listener (mount-only useEffect):**
```jsx
useEffect(() => {
  let tapCount = 0, tapTimer = null;
  function onPresenterGesture(e) { ... }
  window.addEventListener("click", onPresenterGesture);
  window.addEventListener("touchstart", onPresenterGesture, { passive: true });
  return () => {
    window.removeEventListener("click", onPresenterGesture);
    window.removeEventListener("touchstart", onPresenterGesture);
  };
}, []);
```

Gesture: bottom-right corner 80×80px hotspot, 3 taps within 600ms → toggle presenterMode. `tapCount`/`tapTimer` defined inside the closure (not module scope).

**Root return:**
```jsx
return (
  <>
    {renderScreen()}
    <DemoTierSwitcher tier={tier} onTier={setTier} visible={presenterMode} />
  </>
);
```

`renderScreen()` wraps all per-step early-returns so DemoTierSwitcher renders on top of every screen. RunsBadge mounted in the city-detail header flex row.

---

## Presenter Rehearsal Notes

**Gesture:** Triple-tap the bottom-right corner of the screen (80×80px hotspot). Three taps within 600ms toggles the floating pill on/off. Works for both mouse click and finger tap.

**Cycling tiers:** Once the pill appears, tap Free → Basic → Plus → Premium to cycle all four tiers. The Wave-1 LockGate sections lock/unlock live. The RunsBadge in the header updates per tier.

**Estimated cycle time:** < 60s for the full Free→Premium demo sweep.

---

## SC4 End-to-End Verification

- **Judges:** see clean consumer app. DemoTierSwitcher hidden by default. No presenter controls visible.
- **Presenter:** corner triple-tap reveals the floating pill. One tap per tier re-renders the current screen.
- **RunsBadge:** visible in city-detail header for basic/plus/premium; absent for free.
- **Tier cycling live:** Wave-1 LockGate sections (financials, why, live-AI, roadmap, visa) lock/unlock per tier switch.
- **Full suite green:** 18 passed / 169 tests / 0 failed.

---

## Deviations from Plan

**1. [Rule 1 - Bug] Removed var(--accent) from comment in DemoTierSwitcher.jsx**
- **Found during:** Task 1 acceptance criteria grep (`grep -c "var(--accent)" === 0`)
- **Issue:** Comment on header line contained `var(--accent)` as explanatory text — same pattern as 08-02 LockGate deviation
- **Fix:** Rewrote comment to "never CSS custom properties from the host scope"
- **Files modified:** src/components/DemoTierSwitcher.jsx

No other deviations.

---

## Known Stubs

None introduced in this plan. The stubs from 08-02 (modalOpen wired but no PricingModal, why/visa frosted-skeleton placeholders) carry forward — they are Wave 3 (08-04) scope.

---

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes. The corner triple-tap gesture is security-by-obscurity as documented in the plan's threat model (T-08-02 accepted). T-08-05 (setTier input validation): only the four hardcoded tier keys in TIERS array ever reach onTier/setTier — no free-text input path exists.

---

## Self-Check

### Files exist

- src/components/DemoTierSwitcher.jsx: FOUND
- src/components/RunsBadge.jsx: FOUND
- src/screens/PotentialApp.jsx: FOUND (modified)

### Commits exist

- a71e39c (feat(08-03): build DemoTierSwitcher): FOUND
- affaa18 (feat(08-03): build RunsBadge): FOUND
- b93dfff (feat(08-03): wire presenterMode): FOUND

## Self-Check: PASSED
