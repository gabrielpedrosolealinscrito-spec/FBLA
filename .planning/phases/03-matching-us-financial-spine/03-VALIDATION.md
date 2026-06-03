---
phase: 3
slug: matching-us-financial-spine
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-01
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: 03-RESEARCH.md §Validation Architecture + the 7 phase plans (03-01..03-07).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.8 + @testing-library/react + jest-dom + jsdom (Wave 0 install — Plan 03-01) |
| **Config file** | `vite.config.js` — add `test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.js'] }` |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run` |
| **Typecheck gate** | `npx tsc --noEmit -p tsconfig.json` (runs alongside engine/contract tasks) |
| **Estimated runtime** | ~5 seconds (pure functions; no network, fully offline) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=dot`
- **After every plan wave:** Run `npx vitest run` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | MATCH-01, FIN-01 | — | Dev deps in devDependencies only; no test pkg leak into dependencies | package audit (human-verify gate) | `node -e "…devDeps present & not leaked…"` | ✅ package.json | ⬜ pending |
| 03-01-02 | 01 | 1 | MATCH-01, FIN-01 | — | No watch-mode flags in config | config smoke | `npx vitest run --reporter=dot` (runner launches) | ✅ W0 creates vite.config.js test block + src/test-setup.js | ⬜ pending |
| 03-01-03 | 01 | 1 | MATCH-01, FIN-01 | — | N/A | RED scaffold | `npx vitest run shared/engine --reporter=dot` (expected RED) | ✅ W0 creates 4 engine test files | ⬜ pending |
| 03-02-01 | 02 | 1 | MATCH-01, FIN-01 | — | `allowJs` + `**/*.test.ts` exclude so tsc gate is meaningful | typecheck | `npx tsc --noEmit -p tsconfig.json` (exit 0) | ✅ tsconfig.json | ⬜ pending |
| 03-02-02 | 02 | 1 | MATCH-01, FIN-01 | — | N/A | typecheck + source assert | `npx tsc --noEmit` + `grep summerHighF / weights? shared/types.ts` | ✅ shared/types.ts | ⬜ pending |
| 03-02-03 | 02 | 1 | MATCH-03 | — | All scoring magic numbers centralized (no inline coefficients) | typecheck + source assert | `npx tsc --noEmit` + `grep SCORING_WEIGHTS/penalty/BASE_SCORE` | ✅ shared/engine/scoring-weights.ts | ⬜ pending |
| 03-02-04 | 02 | 1 | MATCH-01, FIN-01 | — | Dataset satisfies City contract; ≥22 cities; no prototype-only fields | typecheck + source assert | `npx tsc --noEmit` + `node -e "…≥22 cities, summerHighF, financialModelId…"` | ✅ shared/data/cities.ts | ⬜ pending |
| 03-03-01 | 03 | 2 | FIN-01 | T-3-01 | NaN/divide-by-zero guard: `costIndex<=0 → 1` in expense chain | unit (tdd) | `npx vitest run shared/engine/financial.test.ts --reporter=dot` | ✅ W0 financial.test.ts | ⬜ pending |
| 03-04-01 | 04 | 2 | MATCH-03 | — | `sum(scoreFactors.contributions)+BASE_SCORE ≈ rawScore` (honest bars) | unit (tdd) | `npx vitest run shared/engine/scoring.test.ts --reporter=dot` | ✅ W0 scoring.test.ts | ⬜ pending |
| 03-05-01 | 05 | 2 | MATCH-01 | — | Dealbreakers penalize, NEVER delete (never-empty floor) | unit (tdd) | `npx vitest run shared/engine/dealbreakers.test.ts --reporter=dot` | ✅ W0 dealbreakers.test.ts | ⬜ pending |
| 03-06-01 | 06 | 3 | MATCH-01 | T-3-02 | Profile sanitized at entry: weights clamped [0,4]; results clamped 0–99; never filters cities | unit/integration (tdd) | `npx vitest run shared/engine --reporter=dot` (full engine suite GREEN) | ✅ W0 index.test.ts | ⬜ pending |
| 03-07-01 | 07 | 4 | MATCH-04, MATCH-03 | — | Sort by savings/salary/cost/match deterministic | component | `npx vitest run src/screens/results/ResultsView.test.jsx --reporter=dot` | ✅ W0 ResultsView.test.jsx | ⬜ pending |
| 03-07-02 | 07 | 4 | MATCH-03, FIN-01 | — | CityDetail renders scoreFactors+expenses; ReconfirmOverlay cites factLabel | source assert | `node -e "…CityDetail has scoreFactors/expenses; ReconfirmOverlay has factLabel…"` | ✅ src/screens/results/*.jsx | ⬜ pending |
| 03-07-03 | 07 | 4 | FIN-01 | — | Prototype getMatchScore + flat-22% tax removed; rankCities wired | build + source assert | `npx vite build` + `grep rankCities` + assert no `getMatchScore` / `* 0.22` | ✅ src/screens/PotentialApp.jsx | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Threat refs (offline single-user demo — small surface): T-3-01 = NaN propagation in financial math (guard `costIndex<=0 → 1`); T-3-02 = malformed Profile weights (clamp to [0,4] at engine entry). Both from RESEARCH §Security Domain.*

---

## Wave 0 Requirements

Created in Plan **03-01** (blocking package-legitimacy human-verify gate) and **03-02** (tsconfig) before any engine implementation in Waves 2–3:

- [ ] `shared/engine/financial.test.ts` — FIN-01 bracket math vs IRS reference (`computeFederalTax(110000)=15370`, edge cases at 0 and 16100)
- [ ] `shared/engine/scoring.test.ts` — MATCH-03 contribution-sum invariant
- [ ] `shared/engine/dealbreakers.test.ts` — MATCH-01/D-02 penalty-not-delete + re-confirm signal
- [ ] `shared/engine/index.test.ts` — MATCH-01 never-empty, clamping, full ranking flow
- [ ] `src/screens/results/ResultsView.test.jsx` — MATCH-04 sort behavior
- [ ] `src/test-setup.js` — vitest + jest-dom setup
- [ ] `vite.config.js` test block (`environment: 'jsdom'`, `globals: true`, `setupFiles`)
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [ ] `tsconfig.json` patch: `allowJs: true` + `exclude: ["**/*.test.ts"]` (Plan 03-02 Task 1)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full quiz → results → city-detail flow on battery with no network (SC5) | MATCH-01, FIN-01 | Physical battery + airplane-mode state is not unit-testable | Disconnect network, unplug power, run the built app, complete the quiz, confirm ranked results + city financial detail render with zero network requests (DevTools Network tab empty) |
| D-02 dealbreaker re-confirm UX reads conversationally and cites the real city fact (SC2) | MATCH-01 | Copy quality / conversational tone is a human judgment (and the friend does a copy pass) | Trigger a dealbreaker that demotes the would-be #1; confirm the overlay cites the specific fact (e.g. "Austin's summer highs are above 100°F") and that answering "No" restores the city's rank |
| Visual polish, images, final microcopy on results/detail surface | MATCH-03, MATCH-04 | Owned by the friend's UI-SPEC + later images/copy pass — out of scope for automated checks this phase | Reviewed during the friend's frontend pass against his UI-SPEC |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (5 test files + setup + config + install)
- [x] No watch-mode flags (all commands `npx vitest run …`)
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-01 (plans satisfy Dimension 8 checks 8a–8e; `wave_0_complete` flips true once Plan 03-01 installs vitest and creates the RED scaffolds during execution)
