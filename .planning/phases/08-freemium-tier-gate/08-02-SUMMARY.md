---
phase: 08
plan: 02
subsystem: freemium-tier-gate
tags: [tier-gate, lock-gate, blur, freemium, results-map, city-detail, rank-gate]
dependency_graph:
  requires:
    - 08-01: shared/types.ts canAccess + TIER_FEATURES contract
  provides:
    - src/components/LockGate.jsx dual-mode blur/padlock gate + FrostedSkeleton
    - src/screens/PotentialApp.jsx tier state + 5 LockGate wraps (financials, why, live-AI, roadmap, visa)
    - src/screens/ResultsMap.jsx rank-gate (top-N + blurred-stack-with-count, onUnlock wired)
  affects:
    - tests/lock-gate.test.tsx (Wave 1 gate — now GREEN)
    - tests/runs-badge.test.tsx (Wave 2 gate — still RED, correct)
    - tests/demo-switcher.test.tsx (Wave 2 gate — still RED, correct)
tech_stack:
  added: []
  patterns:
    - filter:blur on content wrapper (NOT backdrop-filter) for section gating
    - Gold-literal hardcoding (never var(--accent) — green host scope hazard)
    - FrostedSkeleton: static-width skeleton for unbuilt content sections
    - Rank-gate owned by ResultsMap; section-gate owned by LockGate
    - canAccess(tier, requiredTier) from shared/types imported extensionless
    - prefers-reduced-motion: snaps transition, blur always present when locked
key_files:
  created:
    - src/components/LockGate.jsx
  modified:
    - src/screens/PotentialApp.jsx
    - src/screens/ResultsMap.jsx
decisions:
  - LockGate uses named imports (not React.useState) — auto-JSX runtime codebase
  - FrostedSkeleton hardcodes gold literals (rgba(255,255,255,.04) not var(--card)) — green host scope
  - Infinity guard: showN === Infinity renders full list (no blurred stack)
  - Roadmap CTA wrapped in LockGate (not canAccess guard) — produces lockedLabel string for grep
  - Visa section is frosted-skeleton (children={null}) — no real inline visa content exists
  - Why section is frosted-skeleton (children={null}) — no real why/match-reasoning block exists
metrics:
  duration: 5min
  completed: 2026-06-06
  tasks: 3
  files: 3
---

# Phase 8 Plan 02: LockGate + City Detail Gating + ResultsMap Rank-Gate Summary

**One-liner:** LockGate dual-mode blur/padlock gate (filter:blur + FrostedSkeleton, gold-literal) wired into PotentialApp with tier state and 5 gated city-detail sections, plus ResultsMap rank-gated to top-N with blurred count-CTA stack.

---

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Build LockGate + FrostedSkeleton (dual-mode, gold-literal) | 12c5294 | src/components/LockGate.jsx |
| 2 | Wire tier state + LockGate into PotentialApp city detail | 843fbfc | src/screens/PotentialApp.jsx |
| 3 | Rank-gate ResultsMap ranked list (top-N + blurred stack) | 60d628a | src/screens/ResultsMap.jsx |

---

## Test Results (Wave 1)

### LockGate tests — GREEN (this plan closes the gate)

```
npm test -- -t "LockGate"

 Test Files  2 failed | 1 passed | 15 skipped (18)
      Tests  3 passed | 160 skipped (163)
```

- `LockGate unlocked`: renders children when tier meets requiredTier — PASS
- `LockGate locked`: renders padlock SVG + blurred wrapper — PASS
- `LockGate skeleton`: renders FrostedSkeleton when children is null — PASS

The 2 failed suites (demo-switcher, runs-badge) are the expected-RED Wave 2 gates.

### Full suite

```
npm test

 Test Files  2 failed | 16 passed (18)
      Tests  163 passed (163)
```

Zero regressions. Only the 2 expected-RED Wave 2 files remain failed.

---

## Contracts Delivered

### LockGate (src/components/LockGate.jsx)

```jsx
export default function LockGate({ tier, requiredTier, lockedLabel, onUnlock, children })
```

**Modes:**
- `canAccess(tier, requiredTier)` true + `!animating` → returns `children ?? null` directly
- `locked = true`, children present → `filter:blur(8px)` wrapper over children + padlock SVG overlay + CTA
- `locked = true`, children null → `filter:blur(8px)` wrapper over `<FrostedSkeleton />` + padlock SVG overlay + CTA
- `prefers-reduced-motion` → snaps transition (blur always present when locked)

**Theme compliance:** all gold/ivory values hardcoded (#e2b56b, rgba(226,181,107,0.9), rgba(8,9,12,0.35), rgba(243,237,225,0.8)); no var(--accent).

### ResultsMap rank-gate (src/screens/ResultsMap.jsx)

```jsx
const showN = TIER_FEATURES.rankShowUpTo[tier]; // free:1, basic:3, plus/premium:Infinity
const visibleRows = showN === Infinity ? sorted : sorted.slice(0, showN);
const hiddenRows  = showN === Infinity ? [] : sorted.slice(showN);
```

The blurred stack renders ONE element with count CTA: `"{N} more cities matched — unlock your full ranking"`. CTA onClick calls `onUnlock` (not `onSelect`) — this is an upsell trigger, not city navigation.

### PotentialApp tier state (src/screens/PotentialApp.jsx)

```jsx
const [tier, setTier] = useState("free");
const [modalOpen, setModalOpen] = useState(false);
```

**5 LockGate wraps in city detail:**
1. `requiredTier="basic"` — Financial Summary + Expense Breakdown (blur-real)
2. `requiredTier="basic"` — Why this city (frosted-skeleton, children={null})
3. `requiredTier="plus"` — Live AI Data sections (blur-real)
4. `requiredTier="plus"` — Roadmap CTA (LockGate wrapper)
5. `requiredTier="premium"` — Visa Concierge (frosted-skeleton, children={null})

---

## SC1 End-to-End Verification

- **Free tier:** #1 city name + match% visible unblurred in ResultsMap. All city-detail sections locked. Ranked list cut to top 1 + blurred upgrade stack.
- **Basic tier:** Financials + why unlocked; live-AI, roadmap, visa still locked. Ranked list shows top 3.
- **Plus tier:** Financials + why + live-AI + roadmap unlocked; visa still locked. Full ranked list.
- **Premium tier:** All sections unlocked. Full ranked list.

---

## Deviations from Plan

**1. [Rule 2 - Auto-fix] Removed var(--accent) from LockGate comment**
- **Found during:** Task 1 acceptance criteria grep (`grep -c "var(--accent)"` must be 0)
- **Issue:** Comment on line 47 contained `never var(--accent)` which the literal grep caught
- **Fix:** Replaced comment with `never CSS vars from host scope`
- **Files modified:** src/components/LockGate.jsx

No other deviations.

---

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| `modalOpen` state set but never renders a modal | src/screens/PotentialApp.jsx | PricingModal lands in Wave 3 (08-04). `onUnlock={() => setModalOpen(true)}` is wired; the modal renders nothing until Wave 3. This is intentional — the gate layer works correctly now; the modal is the next wave. |
| Why/match-reasoning gate has children={null} | src/screens/PotentialApp.jsx | No real "why this city" content exists in the codebase (confirmed in 08-PATTERNS.md Reality Corrections). FrostedSkeleton is the decided graceful-degradation state, not a bug. Real content blocked on Phase 3 scoring engine. |
| Visa gate inside city detail has children={null} | src/screens/PotentialApp.jsx | The Visa screen is a full-screen takeover (entered via the existing "View visa pathways" CTA). The inline city-detail visa gate is a frosted-skeleton placeholder per the plan decision. |

---

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes introduced. LockGate is a pure presentation-layer gate — it hides/blurs UI but protects no server resource. Tier state is in-memory React state. Consistent with T-08-01 (accepted) in the plan's threat model.

---

## Self-Check

### Files exist

- src/components/LockGate.jsx: FOUND
- src/screens/PotentialApp.jsx: FOUND (modified)
- src/screens/ResultsMap.jsx: FOUND (modified)

### Commits exist

- 12c5294 (feat(08-02): build LockGate): FOUND
- 843fbfc (feat(08-02): wire tier state): FOUND
- 60d628a (feat(08-02): rank-gate ResultsMap): FOUND

## Self-Check: PASSED
