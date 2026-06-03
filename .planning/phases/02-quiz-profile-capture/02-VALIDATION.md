---
phase: 02
slug: quiz-profile-capture
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-02
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Derived from `02-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.8 (ALREADY INSTALLED — see note below; original draft said "not yet installed", which is stale) |
| **Config file** | `vite.config.js` (test block ALREADY present) |
| **Quick run command** | `npx vitest run shared/quiz-engine/ --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

> **STALE-DOC CORRECTION (planner, 2026-06-02):** vitest@4.1.8, @testing-library/react,
> @testing-library/jest-dom, and jsdom are ALL already in package.json and node_modules,
> and `vite.config.js` already has the `test` block + `src/test-setup.js`. Plan 02-01 does
> NOT reinstall the runner; it installs only framer-motion + pixelarticons and appends a
> `window.matchMedia` mock to the existing `src/test-setup.js`.

---

## Sampling Rate

- **After every task commit:** Run the plan's scoped `<verify>` command (NOT the whole `shared/quiz-engine/` dir until Plan 04 — see staggered-green note below).
- **After every plan wave:** Run the plan's `<verification>` block commands.
- **Before `/gsd:verify-work`:** Full suite must be green (achievable only from Plan 04 onward).
- **Max feedback latency:** 15 seconds

> **STAGGERED-GREEN NOTE (load-bearing):** `shared/quiz-engine/tension.test.ts` has a top-level
> `import { detectTension } from './tension.js'`. `tension.js` is not created until Plan 02-04, so
> this file IMPORT-ERRORS (fails to collect) through Waves 1–3 — a `.skip` cannot save a missing
> top-level import. Therefore **whole-dir / full-suite sampling is deferred to Plan 02-04 for this
> phase.** Plans 02-01/02/03 use file-scoped verify commands that exclude `tension.test.ts`. Do NOT
> run `npx vitest run` (full suite) as a per-wave gate before Wave 4 — it is import-RED by design.
> Forward-referencing test files (`resolver.test.ts`, `synthesizer.test.ts`) must NOT top-level-import
> a later-plan module; their skipped cases assert only against functions that exist at their wave.

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists | Status |
|--------|----------|-----------|-------------------|-------------|--------|
| QUIZ-01 | `getVisibleQuestions` returns correct question sequence | unit | `npx vitest run shared/quiz-engine/resolver.test.ts` | ❌ W0 | ⬜ pending |
| QUIZ-01 | `synthesizeProfile` maps answers to Profile correctly | unit | `npx vitest run shared/quiz-engine/synthesizer.test.ts` | ❌ W0 | ⬜ pending |
| QUIZ-01 | QuizShell renders first question on mount | component | `npx vitest run src/screens/quiz/QuizShell.test.jsx` | ❌ W0 | ⬜ pending |
| QUIZ-01 | QuizShell advances to next question on answer + Continue | component | `npx vitest run src/screens/quiz/QuizShell.test.jsx` | ❌ W0 | ⬜ pending |
| QUIZ-01 | Back navigation goes to previous question | component | `npx vitest run src/screens/quiz/QuizShell.test.jsx` | ❌ W0 | ⬜ pending |
| QUIZ-02 | `opennessToAbroad` slider captured in synthesized Profile | unit | `npx vitest run shared/quiz-engine/synthesizer.test.ts` | ❌ W0 | ⬜ pending |
| QUIZ-03 | US citizen → `immigrationStatus` auto-set to "citizen" | unit | `npx vitest run shared/quiz-engine/synthesizer.test.ts` | ❌ W0 | ⬜ pending |
| QUIZ-03 | Non-US citizen → `immigrationStatus` question shown (showIf) | unit | `npx vitest run shared/quiz-engine/resolver.test.ts` | ❌ W0 | ⬜ pending |
| QUIZ-04 | Dealbreaker selections captured in `Profile.dealBreakers` | unit | `npx vitest run shared/quiz-engine/synthesizer.test.ts` | ❌ W0 | ⬜ pending |
| QUIZ-05 | `moveTimeline` captured in synthesized Profile | unit | `npx vitest run shared/quiz-engine/synthesizer.test.ts` | ❌ W0 | ⬜ pending |
| QUIZ-01 | `detectTension` fires on nature+career combination | unit | `npx vitest run shared/quiz-engine/tension.test.ts` (Wave 4) | ❌ W0 | ⬜ pending |
| QUIZ-01 | Tension question injected at correct position | unit | `npx vitest run shared/quiz-engine/resolver.test.ts` (un-skip Wave 4) | ❌ W0 | ⬜ pending |
| QUIZ-01 | Stale hidden answers cleared on back+change (clearHiddenAnswers) | unit | `npx vitest run shared/quiz-engine/resolver.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `shared/quiz-engine/resolver.test.ts` — covers QUIZ-01/03 showIf + clearHiddenAnswers (tension-injection case `it.skip`, no top-level `./tension.js` import)
- [ ] `shared/quiz-engine/synthesizer.test.ts` — covers QUIZ-01/02/03/04/05 Profile output (tradeoffTolerance case `it.skip`)
- [ ] `shared/quiz-engine/tension.test.ts` — covers tension detection pairs (import-RED until Plan 04; excluded from Wave 1–3 gates)
- [ ] `src/screens/quiz/QuizShell.test.jsx` — covers navigation, direction, submit callback
- [ ] `src/test-setup.js` — APPEND `window.matchMedia` mock (file already exists; do NOT recreate)
- [ ] Framework install: NOT NEEDED — vitest/@testing-library/*/jsdom already installed. Install only framer-motion + pixelarticons (gated).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Quiz visually adapts/branches in browser (perceived flow, animation/direction) | QUIZ-01 | Visual/perceptual — automated component tests assert state transitions, not perceived UX | Run `npm run dev`, complete quiz as (a) US citizen and (b) non-US citizen; confirm immigration-status step appears only in (b) and tension follow-up surfaces on conflicting answers |
| Profile fields visible in browser state | QUIZ-03 | Success criterion is "visible in browser state" — manual devtools/state inspection | Complete quiz, inspect persisted Profile (devtools/console/state) and confirm `citizenship`, `immigrationStatus`, `opennessToAbroad`, `dealBreakers`, `moveTimeline` are present |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-02 (plan-check, 0 blockers)
