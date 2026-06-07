---
phase: 07-visa-concierge
plan: 04
subsystem: ui
tags: [react, jsx, visa, inline-styles, mint-token-system, offline]

# Dependency graph
requires:
  - phase: 07-03
    provides: selectVisaPathways engine + graded fit logic (computeGradedFit, gradeD8, gradeExpressEntry)
  - phase: 07-02
    provides: Portugal D8 + Canada Express Entry authored pathway data + GENERIC_SKELETON
  - phase: 06-04
    provides: PotentialApp.jsx nav wiring pattern (showRoadmap) + Roadmap.jsx sections.map loop
provides:
  - src/screens/Visa.jsx: Premium visa concierge screen with side-by-side comparison grid, fit badges, checklists, disclaimer, attorney CTA, skeleton
  - Visa screen dual entry: city-detail CTA (setShowVisa) + roadmap visa-section teaser (onVisa prop)
  - Citizenship-key normalization: selectVisaPathways normalizes "US Citizen" → "US" before registry lookup
affects: [phase 08 (tier-gate wraps Visa behind premium lock), phase 09 (visa concierge cited as Premium differentiator)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mint inline-style token system inherited via css spread — no className/tailwind/CSS literal"
    - "anim mount-fade: useState(false) + useEffect setTimeout 60ms setAnim(true)"
    - "auto-fit grid: gridTemplateColumns repeat(auto-fit, minmax(300px, 1fr)) for side-by-side at 720px"
    - "Navigation guard precedence: Visa guard placed before Roadmap guard so roadmap-origin onVisa handler reaches Visa screen"
    - "Sources rendered as <p>/<span> text — never <a href> (D-10 see-not-click discipline)"
    - "Citizenship-key normalization map in selectVisaPathways (quiz emits 'US Citizen', registry keyed 'US')"

key-files:
  created:
    - src/screens/Visa.jsx
  modified:
    - src/screens/PotentialApp.jsx
    - src/screens/Roadmap.jsx
    - shared/engine/visa.ts
    - shared/engine/visa.test.ts

key-decisions:
  - "07-04: Visa guard placed before Roadmap guard in PotentialApp so roadmap-origin onVisa clears roadmap then shows Visa cleanly"
  - "07-04: Long shot badge uses --text2 (neutral grey), never --neg (#F87171) — UPL likelihood signal, not rejection"
  - "07-04: CITIZENSHIP_KEY normalization map in selectVisaPathways mirrors matchEngine.js — quiz label → registry code"

patterns-established:
  - "Visa.jsx: full inline-style component with inherited mint token css spread — model for future Premium screen additions"
  - "onVisa prop threading: PotentialApp passes callback to Roadmap; Roadmap special-cases section.id === 'visa' to append CTA"

requirements-completed: [VISA-02, VISA-03, VISA-04]

# Metrics
duration: 45min
completed: 2026-06-06
---

# Phase 7 Plan 04: Visa Concierge UI Summary

**Visa.jsx Premium screen — side-by-side D8/Express Entry comparison grid with graded fit badges, UPL disclaimer, attorney CTA, document checklists, sources-as-text, and dual nav entry points wired into PotentialApp + Roadmap**

## Performance

- **Duration:** 45 min (Tasks 1-2 prior executor + fix + checkpoint verification)
- **Started:** 2026-06-06
- **Completed:** 2026-06-06
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify — PASSED)
- **Files modified:** 5

## Accomplishments

- Built Visa.jsx as a fully offline, inline-styled Premium screen: auto-fit side-by-side grid, graded fit badges (strong/possible/long-shot), per-pathway document checklists, sources-as-text with "DATA AS OF" stamps, UPL disclaimer banner above all content, attorney-referral CTA, and off-script generic skeleton for unrecognized destinations
- Wired Visa into PotentialApp.jsx (showVisa state + render guard + city-detail entry) and Roadmap.jsx (onVisa prop + visa-section CTA — D-07 second entry point), mirroring the showRoadmap/onBack pattern exactly
- Fixed a hidden bug where the quiz's "US Citizen" label never matched the "US" registry key in selectVisaPathways, causing silent fallback to the GENERIC_SKELETON in the real wired flow (authored pathways never surfaced to users)
- Human-verify PASSED: disclaimer banner, side-by-side Portugal D8 + Canada Express Entry columns, both "Strong fit" badges, document checklists, sources-as-plain-text, "data as of 2026-06-05" stamps, and attorney CTA all confirmed correct

## Task Commits

1. **Task 1: Build Visa.jsx** - `804587a` (feat)
2. **Task 2: Wire Visa into navigation** - `46fc8a9` (feat)
3. **Task 3: Browser human-verify** - PASSED (checkpoint; fix committed separately)
   - **Citizenship-key bug fix** - `08a8d06` (fix — found during checkpoint verification)

## Files Created/Modified

- `src/screens/Visa.jsx` - Full Premium visa concierge screen (comparison grid, fit badges, checklists, disclaimer, CTA, skeleton, offline)
- `src/screens/PotentialApp.jsx` - showVisa state + render guard + Visa import + city-detail CTA + onVisa prop to Roadmap
- `src/screens/Roadmap.jsx` - onVisa prop in signature + visa-section special-case CTA (D-07 second entry point)
- `shared/engine/visa.ts` - CITIZENSHIP_KEY normalization map in selectVisaPathways
- `shared/engine/visa.test.ts` - Regression test: feed real quiz value "US Citizen", assert authored pathways returned (not GENERIC_SKELETON)

## Decisions Made

- Visa render guard placed BEFORE the Roadmap guard in PotentialApp.jsx — ensures roadmap-origin `onVisa` handler (which calls `setShowRoadmap(false); setShowVisa(true)`) reaches the Visa guard regardless of guard order
- Long shot badge uses `var(--text2)` neutral grey, never `--neg` (#F87171) — per UPL framing: likelihood signal, not rejection
- Citizenship-key normalization map added to `selectVisaPathways` (not at call sites) so the fix is centralized and all consumers get it automatically

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed citizenship label mismatch: "US Citizen" → registry key "US"**
- **Found during:** Task 3 (browser human-verify checkpoint)
- **Issue:** The quiz emits citizenship as `"US Citizen"` but `VISA_PATHWAYS` registry is keyed by `"US"`. `selectVisaPathways` did a direct lookup (`VISA_PATHWAYS[profile.citizenship]`) and missed the registry, silently falling back to `GENERIC_SKELETON`. The authored Portugal D8 and Canada Express Entry pathways never surfaced in the real wired flow. Unit tests passed because they directly used `"US"` (the registry key), not the quiz output value.
- **Fix:** Added a `CITIZENSHIP_KEY` normalization map inside `selectVisaPathways` (shared/engine/visa.ts), mirroring the `countryFor` suffix map pattern in `src/lib/matchEngine.js`. Also added a regression test in `visa.test.ts` that feeds `"US Citizen"` (the real quiz value) and asserts the authored pathways are returned (not GENERIC_SKELETON). Suite: 41 GREEN.
- **Files modified:** `shared/engine/visa.ts`, `shared/engine/visa.test.ts`
- **Verification:** `npx vitest run shared/engine/visa.test.ts shared/data/visa-pathways.test.ts` — 41 passed; browser re-verify confirmed Portugal D8 + Canada Express Entry render in the wired flow
- **Committed in:** `08a8d06` (fix(07): normalize quiz citizenship label to registry code in selectVisaPathways)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug)
**Impact on plan:** Essential correctness fix. Without it, the premium Visa screen always showed the generic skeleton, making the authored pathway content unreachable via the real quiz flow. No scope creep.

## Known Limitations (Deferred — Not Fixed)

**Entry point #1 replaced by Phase 08 tier-gate rework:**
Phase 08's LockGate work replaced the city-detail "View visa pathways" button (Task 2 entry point #1) with `<LockGate tier requiredTier="premium">{null}</LockGate>`. The Visa screen is now reachable **only via the Roadmap's "See full visa pathways →"** (entry point #2, D-07). The Visa concierge is also premium-gated, so this is consistent with the freemium tier model. Entry point #1 is a null-child LockGate — it shows the blur/upgrade prompt but does not navigate to Visa.jsx. This is a known limitation; Gabriel deferred fixing it. The working entry path is: quiz → premium tier → Roadmap → "See full visa pathways".

## Issues Encountered

None beyond the auto-fixed citizenship-key bug.

## User Setup Required

None — no external service configuration required.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes beyond the plan's threat model. All strings render as React text children (auto-escaped). No `dangerouslySetInnerHTML`. Sources rendered as `<p>`/`<span>` text — zero `<a href>` tags. UPL disclaimer rendered on every path including off-script skeleton. T-07-06, T-07-03, T-07-02 all mitigated as planned.

## Next Phase Readiness

- Phase 7 (Visa Concierge) is now complete — all 4 plans done, all VISA-01/02/03/04 requirements met
- Phase 8 (Freemium Tier Gate) is already complete (2026-06-06) and wraps the Visa screen behind the premium tier gate
- The Visa screen is demo-ready via: quiz → premium tier → Roadmap → "See full visa pathways"

---
*Phase: 07-visa-concierge*
*Completed: 2026-06-06*
