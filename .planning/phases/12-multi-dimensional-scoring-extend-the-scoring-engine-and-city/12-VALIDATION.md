---
phase: 12
slug: multi-dimensional-scoring-extend-the-scoring-engine-and-city
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-03
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: `12-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest v4.x |
| **Config file** | none — Vitest auto-discovers `*.test.ts` (package.json `type=module`) |
| **Quick run command** | `npm test -- --reporter=dot shared/engine/scoring.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds (engine tests are pure, no I/O) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --reporter=dot shared/engine/scoring.test.ts`
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

> Task IDs are assigned by the planner. Rows below map the **phase invariants** (CONTEXT D-01..D-09 + MATCH-01/03) to their authoritative tests; the planner's `<automated>` blocks must satisfy each. Fill `Task ID` once PLAN.md files exist.

| Invariant | Behavior | Test File | Test Type | Automated Command | File Exists | Status |
|-----------|----------|-----------|-----------|-------------------|-------------|--------|
| **D-05 (BLOCKER)** | Displayed `matchScore` < 99 for strongest profile (max `weights` AND max `categoryWeights`) across all 22 cities — asserted on `rankCities()` output, NOT pre-clamp `computeRawScore` | `shared/engine/index.test.ts` | integration | `npm test -- shared/engine/index.test.ts` | ❌ W0 (existing test doesn't exercise categoryWeights) | ⬜ pending |
| MATCH-01 | `rankCities` returns all 22 cities with new multi-dimensional scores | `shared/engine/index.test.ts` | smoke | `npm test -- shared/engine/index.test.ts` | ❌ W0 | ⬜ pending |
| MATCH-03 | Honest-contribution invariant: `BASE_SCORE + Σ(scoreFactors.contribution) === rawScore` after new factors | `shared/engine/scoring.test.ts` | unit | `npm test -- shared/engine/scoring.test.ts` | ❌ W0 | ⬜ pending |
| MATCH-03 | `scoreFactors` entries carry correct `dataLevel` ('city'/'state'/'proxy') | `shared/engine/scoring.test.ts` | unit | `npm test -- shared/engine/scoring.test.ts` | ❌ W0 | ⬜ pending |
| D-02 | Schools/childcare contribution ≈ 0 when `categoryWeights` absent (childless user) | `shared/engine/scoring.test.ts` | unit | `npm test -- shared/engine/scoring.test.ts` | ❌ W0 | ⬜ pending |
| D-02 | Schools/childcare contribution >> 0 when family user sets high `categoryWeight` | `shared/engine/scoring.test.ts` | unit | `npm test -- shared/engine/scoring.test.ts` | ❌ W0 | ⬜ pending |
| D-07 | Parks proxy fallback: contribution > 0 and < max when `parkScore` absent | `shared/engine/scoring.test.ts` | unit | `npm test -- shared/engine/scoring.test.ts` | ❌ W0 | ⬜ pending |
| D-07 | Genuine neutral exclusion: a no-cited-data, no-proxy category (the 7 anchor cities) yields `contribution === 0` + `dataLevel === 'none'` — NOT a nonzero midpoint; rawScore === BASE + only-applicable factors | `shared/engine/scoring.test.ts` | unit | `npm test -- shared/engine/scoring.test.ts` | ❌ W0 | ⬜ pending |
| D-08 | Schools/childcare entries carry `dataLevel='state'` (state-average label) | `shared/engine/scoring.test.ts` | unit | `npm test -- shared/engine/scoring.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Additive test cases in **existing** files (infrastructure is already complete — no new framework, no new config):

- [ ] `shared/engine/index.test.ts` — **clamp BLOCKER test** with `maxProfile` exercising both existing `weights` AND new `categoryWeights` at maximum; asserts displayed `matchScore < 99` on `rankCities()` output for all 22 cities
- [ ] `shared/engine/scoring.test.ts` — new test cases for all 5 new factor functions (healthcare, schools, childcare, connectivity, parks), including proxy fallback + neutral exclusion + `dataLevel` label assertions
- [ ] `shared/engine/scoring.test.ts` — weight-gating tests (absent `categoryWeights` → neutral/≈0 contribution; max `categoryWeights` → proportional contribution)
- [ ] `shared/engine/scoring.test.ts` — state-average label propagation: schools/childcare entries carry `dataLevel: 'state'`

*Keep the existing `scoring.test.ts` CR-01 tests (`rawScore in [0,99]`) as contribution-invariant guards — they are NOT the clamp gate.*

---

## Manual-Only Verifications

| Behavior | Invariant | Why Manual | Test Instructions |
|----------|-----------|------------|-------------------|
| Demo-narrative sanity after ranking shifts | D-06 | Rankings may shift freely (honesty over demo-stability); the demo story is a human judgment call, not an asserted invariant | Gabriel re-runs the demo profile, confirms the surfaced "why this city" contributions read honestly and the narrative still lands |

*All scoring invariants have automated verification; only the subjective demo-narrative check is manual.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (clamp test + 5 factor tests)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
