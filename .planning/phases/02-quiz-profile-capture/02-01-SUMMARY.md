---
phase: 02-quiz-profile-capture
plan: 01
subsystem: testing
tags: [framer-motion, pixelarticons, vitest, typescript, react, quiz-engine]

requires:
  - phase: 01-scaffold-port
    provides: shared/types.ts Profile contract, vitest test infrastructure, vite build config

provides:
  - framer-motion and pixelarticons installed as runtime dependencies
  - Profile interface extended with 6 optional Phase-2 dimension fields (D-05)
  - 28px slider-thumb CSS rule in src/index.css for quiz sliders
  - RED test stubs for resolver, synthesizer, tension, and QuizShell (Wave 0 baseline)
  - window.matchMedia jsdom mock in src/test-setup.js

affects: [02-02, 02-03, 02-04, 03-all, 11-deep-profile]

tech-stack:
  added: [framer-motion@12.40.0, pixelarticons@2.1.2]
  patterns:
    - "SP-1: .js import extensions in TS files (ESM bundler resolution)"
    - "Staggered-green discipline: tension.test.ts is import-RED by design through Plans 02-01/02/03"
    - "Optional Profile fields pattern (mirrors weights?) for zero fixture ripple under strict:true"
    - "Phase 2 emits raw 1-4 weights; Phase 3 normalizes to [0,1] via PERSONAL_WEIGHT_SCALE"

key-files:
  created:
    - shared/quiz-engine/resolver.test.ts
    - shared/quiz-engine/synthesizer.test.ts
    - shared/quiz-engine/tension.test.ts
    - src/screens/quiz/QuizShell.test.jsx
  modified:
    - shared/types.ts
    - src/index.css
    - src/test-setup.js
    - package.json
    - package-lock.json

key-decisions:
  - "pixelarticons exposes React icons via pixelarticons/react/ subpath (no top-level CJS entry) — verified legitimate, imported as pixelarticons/react/IconName.js"
  - "6 new Profile fields all optional (D-05): motivationToMove, workStyle, communityNeeds, paceOfLife, riskTolerance, tradeoffTolerance — mirrors weights? pattern"
  - "tension.test.ts is intentionally import-RED through Wave 3; Plans 02-01/02/03 verify gates use file-scoped commands excluding tension.test.ts"
  - "resolver.test.ts tension-injection case and synthesizer.test.ts tradeoffTolerance case are it.skip until Plan 04"
  - "slider-thumb CSS lives in src/index.css (not index.css at root — root CSS does not exist)"

patterns-established:
  - "Staggered-RED gate: write test stubs referencing future modules as RED; exclude import-RED files from per-wave verify commands"
  - "No top-level import of later-plan modules in earlier-wave test files — it.skip cannot save a missing top-level import"
  - "Raw 1-4 weight scale from synthesizeProfile; Phase 3 normalizes downstream"

requirements-completed: [QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05]

duration: 18min
completed: 2026-06-02
---

# Phase 2 Plan 01: Quiz Scaffolding — Contract Extension + RED Test Stubs Summary

**framer-motion + pixelarticons installed, Profile extended with 6 optional Phase-2 dimension fields, and four colocated RED test stubs written covering QUIZ-01/02/03/04/05 (Wave 0 baseline for Plans 02-04)**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-02T19:48:00Z
- **Completed:** 2026-06-02T19:58:00Z
- **Tasks:** 4 (Task 1 satisfied by user approval; Tasks 2-4 executed)
- **Files modified:** 9

## Accomplishments

- framer-motion@12.40.0 and pixelarticons@2.1.2 installed (both verified legitimate on npmjs.com before install per T-02-SC threat mitigation)
- Profile interface extended with 6 optional dimension fields — motivationToMove, workStyle, communityNeeds, paceOfLife, riskTolerance, tradeoffTolerance — all optional under `strict:true` tsconfig, zero fixture ripple (25 existing engine tests remain green)
- 28px slider-thumb CSS appended to src/index.css per 02-UI-SPEC §6
- Four RED test stubs created covering QUIZ-01/02/03/04/05; staggered-green discipline enforced (no forward top-level import of tension.js in earlier-wave files)
- window.matchMedia jsdom mock appended to src/test-setup.js for Framer Motion prefers-reduced-motion support

## Task Commits

1. **Task 1: Legitimacy gate** — satisfied by user "approved" signal; no commit (checkpoint)
2. **Task 2: Install packages** — `c67f0dc` (chore)
3. **Task 3: Profile contract + slider CSS** — `4062a67` (feat)
4. **Task 4: RED test stubs + matchMedia mock** — `ca62600` (test)

## Files Created/Modified

- `package.json` / `package-lock.json` — framer-motion + pixelarticons added to dependencies
- `shared/types.ts` — Profile extended with 6 optional Phase-2 dimension fields (D-05); header comment updated
- `src/index.css` — 28px slider-thumb CSS override for webkit + moz
- `shared/quiz-engine/resolver.test.ts` — RED stub: getVisibleQuestions showIf + clearHiddenAnswers; tension-injection as it.skip
- `shared/quiz-engine/synthesizer.test.ts` — RED stub: synthesizeProfile full coverage (immigration auto-derive, raw weights, dimension fields); tradeoffTolerance as it.skip
- `shared/quiz-engine/tension.test.ts` — RED stub: detectTension signal-or-null cases (import-RED by design until Plan 04)
- `src/screens/quiz/QuizShell.test.jsx` — RED stub: render, forward nav, back nav, onComplete callback
- `src/test-setup.js` — window.matchMedia mock appended

## Decisions Made

- pixelarticons uses subpath imports (pixelarticons/react/IconName.js), not a root CJS entry. The plan's verify command `require.resolve('pixelarticons')` fails for this reason, but the package is correctly installed — verified via `require.resolve('pixelarticons/react/AArrowDown.js')`. Deviation documented.
- CSS file is `src/index.css` (not `index.css` at root — no root CSS exists). 28px slider-thumb rules appended to `src/index.css`.
- All 6 new Profile fields made optional (D-05 decision implemented). synthesizeProfile in Plan 02 will always populate them; Phase 3 engine defends with ?? defaults.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] index.css path correction**
- **Found during:** Task 3 (slider-thumb CSS)
- **Issue:** Plan specified `index.css` (root); actual file is `src/index.css`; no root CSS exists
- **Fix:** Appended 28px thumb rules to `src/index.css`
- **Files modified:** src/index.css
- **Verification:** File exists with rules appended; existing engine tests unaffected
- **Committed in:** 4062a67 (Task 3 commit)

**2. [Rule 1 - Verify Mismatch] pixelarticons require.resolve verify adjusted**
- **Found during:** Task 2 (package verify)
- **Issue:** Plan's verify `require.resolve('pixelarticons')` fails — pixelarticons has no top-level CJS entry (main: "index.js" points to a publish-time generated file); icons are accessed via `pixelarticons/react/` subpath
- **Fix:** Verified via `require.resolve('pixelarticons/react/AArrowDown.js')` which succeeds; package is correctly installed; this is a package design choice, not a slopsquat
- **Files modified:** None
- **Committed in:** c67f0dc (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — factual corrections, zero scope change)
**Impact on plan:** Both corrections necessary for accuracy. No scope creep.

## Verification State (Wave 0)

- `npx tsc --noEmit`: passes (zero errors)
- `npx vitest run shared/engine/`: 25 tests, all green (zero fixture ripple)
- `npx vitest run shared/quiz-engine/synthesizer.test.ts`: RED (synthesizer.js absent) — correct Wave 0 state
- `npx vitest run shared/quiz-engine/resolver.test.ts`: RED (resolver.js absent) — correct Wave 0 state
- `npx vitest run shared/quiz-engine/tension.test.ts`: import-RED (tension.js absent) — correct Wave 0 state, excluded from Plans 02-01/02/03 gates
- `npx vitest run src/screens/quiz/QuizShell.test.jsx`: RED (QuizShell.jsx absent) — correct Wave 0 state

## Known Stubs

None — this plan intentionally writes RED stubs (Wave 0 baseline). The stubs are not product stubs; they are test stubs that become GREEN as Plans 02-04 implement the source modules.

## Threat Flags

None — framer-motion and pixelarticons verified on npmjs.com before install (T-02-SC mitigated). No new network endpoints or auth paths introduced.

## Next Phase Readiness

- Plan 02-02: Ready to implement shared/quiz-engine/questions.ts + resolver.ts + synthesizer.ts; RED stubs define the target contract
- Plan 02-03: Ready to implement QuizShell.jsx + QuestionCard.jsx + input components
- Plan 02-04: Ready to implement tension.ts (un-skip tension-injection + tradeoffTolerance it.skip cases)
- All downstream plans can import from shared/types.ts with the extended Profile contract

## Self-Check

- `[ -f /Users/leal/FBLA/FBLA/shared/quiz-engine/resolver.test.ts ]` — FOUND
- `[ -f /Users/leal/FBLA/FBLA/shared/quiz-engine/synthesizer.test.ts ]` — FOUND
- `[ -f /Users/leal/FBLA/FBLA/shared/quiz-engine/tension.test.ts ]` — FOUND
- `[ -f /Users/leal/FBLA/FBLA/src/screens/quiz/QuizShell.test.jsx ]` — FOUND
- `[ -f /Users/leal/FBLA/FBLA/shared/types.ts ]` — FOUND (extended)
- `[ -f /Users/leal/FBLA/FBLA/src/index.css ]` — FOUND (slider CSS appended)
- Commits c67f0dc, 4062a67, ca62600 — all present in git log

---
*Phase: 02-quiz-profile-capture*
*Completed: 2026-06-02*
