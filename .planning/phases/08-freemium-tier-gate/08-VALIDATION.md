---
phase: 8
slug: freemium-tier-gate
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-06
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.8 (jsdom environment) |
| **Config file** | `vite.config.js` (test block) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green + manual checklist passed
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists |
|--------|----------|-----------|-------------------|-------------|
| TIER-01, TIER-02 | `canAccess(active, required)` returns correct bool for all 16 tier pairs | unit | `npm test -- --grep "canAccess"` | ❌ W0 |
| TIER-02 | Rank-gate `showUpTo(results, tier)` returns correct N cities per tier (Basic=3, Plus/Premium=all) | unit | `npm test -- --grep "rankGate"` | ❌ W0 |
| TIER-01, TIER-03 | `<LockGate>` renders children when unlocked | component | `npm test -- --grep "LockGate unlocked"` | ❌ W0 |
| TIER-01, TIER-03 | `<LockGate>` renders padlock + blur wrapper when locked | component | `npm test -- --grep "LockGate locked"` | ❌ W0 |
| TIER-01, TIER-03 | `<LockGate>` renders FrostedSkeleton when locked and children is null | component | `npm test -- --grep "LockGate skeleton"` | ❌ W0 |
| TIER-02 | `<DemoTierSwitcher>` does not render when presenterMode=false | component | `npm test -- --grep "DemoTierSwitcher"` | ❌ W0 |
| D-06 | `<RunsBadge>` displays correct string per tier | component | `npm test -- --grep "RunsBadge"` | ❌ W0 |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `shared/tierGate.test.ts` — stubs for `canAccess` (16 tier-pair assertions) + `rankGate` (4 tier assertions) — TIER-01, TIER-02
- [ ] `tests/lock-gate.test.tsx` — LockGate renders children / padlock / FrostedSkeleton when children null — TIER-01, TIER-03
- [ ] `tests/demo-switcher.test.tsx` — DemoTierSwitcher visibility + tier selection — TIER-02
- [ ] `tests/runs-badge.test.tsx` — RunsBadge output per tier — D-06
- [ ] Vitest config present in `vite.config.js` (jsdom env) — if absent, Wave 0 installs

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Blur-dissolve animation smoothness on demo device | D-09 | Visual/perf judgment on battery hardware | Switch a locked→unlocked tier, observe padlock fade + blur resolve; no layout shift, smooth on battery |
| Corner triple-tap gesture activates switcher | D-05 | Gesture timing not deterministically testable in jsdom | Triple-tap the designated corner; DemoTierSwitcher pill appears |
| Pricing modal body-lock + responsive layout | D-13 | Cross-device visual layout | Open modal at mobile + desktop widths; background scroll locked, all 4 tiers legible |
| Blur + padlock render visually correct per tier | TIER-01 | Pixel-level visual fidelity | Cycle tiers, confirm correct sections blurred/unblurred at each |
| Full demo cycle Free→Basic→Plus→Premium in < 60s | SC-4 | Live timed presenter flow | Run full tier cycle on demo device, stopwatch < 60s |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
