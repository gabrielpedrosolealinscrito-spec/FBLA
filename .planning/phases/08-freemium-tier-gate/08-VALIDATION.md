---
phase: 8
slug: freemium-tier-gate
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-06
audited: 2026-06-06
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
| TIER-01, TIER-02 | `canAccess(active, required)` returns correct bool for all 16 tier pairs | unit | `npm test -- -t "canAccess"` | ✅ |
| TIER-02 | Rank-gate `showUpTo(results, tier)` returns correct N cities per tier (Basic=3, Plus/Premium=all) | unit | `npm test -- -t "rankGate"` | ✅ |
| TIER-01, TIER-03 | `<LockGate>` renders children when unlocked | component | `npm test -- -t "LockGate unlocked"` | ✅ |
| TIER-01, TIER-03 | `<LockGate>` renders padlock + blur wrapper when locked | component | `npm test -- -t "LockGate locked"` | ✅ |
| TIER-01, TIER-03 | `<LockGate>` renders FrostedSkeleton when locked and children is null | component | `npm test -- -t "LockGate skeleton"` | ✅ |
| TIER-02 | `<DemoTierSwitcher>` does not render when presenterMode=false | component | `npm test -- -t "DemoTierSwitcher"` | ✅ |
| D-06 | `<RunsBadge>` displays correct string per tier | component | `npm test -- -t "RunsBadge"` | ✅ |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `shared/tierGate.test.ts` — `canAccess` (16 tier-pair assertions) + `rankGate` (4 tier assertions) — TIER-01, TIER-02 — **20 tests GREEN**
- [x] `tests/lock-gate.test.tsx` — LockGate renders children / padlock / FrostedSkeleton when children null — TIER-01, TIER-03 — **3 tests GREEN**
- [x] `tests/demo-switcher.test.tsx` — DemoTierSwitcher visibility + tier selection — TIER-02 — **2 tests GREEN**
- [x] `tests/runs-badge.test.tsx` — RunsBadge output per tier — D-06 — **4 tests GREEN**
- [x] Vitest config present in `vite.config.js` (jsdom env) — confirmed present

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

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (audit 2026-06-06)

---

## Validation Audit 2026-06-06

Reconciled the pre-execution validation strategy against executed reality. All 7 mapped
requirement rows (authored as `❌ W0` placeholders) were resolved during execution: the
four Wave-0 test files were created in 08-01 and driven GREEN through Waves 1–2 (08-02/08-03).

**Evidence:** `npx vitest run` on the four phase-8 test files → **4 files / 29 tests passed**
(20 logic + 3 LockGate + 2 DemoTierSwitcher + 4 RunsBadge). Full suite → **18 files / 170 tests passed**, zero regressions.

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 7 (all during execution) |
| Escalated | 0 |

No gsd-nyquist-auditor spawn required — no MISSING/PARTIAL gaps to fill. Phase 8 is Nyquist-compliant.
