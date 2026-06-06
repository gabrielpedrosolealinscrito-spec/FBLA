---
phase: 07-visa-concierge
verified: 2026-06-06T18:00:00Z
status: human_needed
score: 4/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Roadmap → Visa flow end-to-end (entry point #2 — the only working entry)"
    expected: "plus/premium tier user sees city detail, opens Roadmap, sees visa section with 'See full visa pathways →' CTA, clicks it, and Visa screen renders with Portugal D8 and Canada Express Entry side-by-side"
    why_human: "Phase 08 rework replaced entry point #1 with a null LockGate. The prior PASSED human-verify checkpoint was before Phase 08 landed. Need re-confirmation that the Roadmap→Visa handoff is still clean with the Phase 08 tier-gate in place."
  - test: "UPL disclaimer renders above pathway columns"
    expected: "The disclaimer banner ('Not legal advice') appears above the comparison grid, not below it or hidden by scroll"
    why_human: "Disclaimer position relative to comparison grid is a visual ordering assertion that grep cannot confirm."
  - test: "Long-shot fit badge is visually neutral (grey), not red"
    expected: "A profile with hasRemote=false shows a grey 'Long shot' badge next to the D8 column — not a red/negative colour"
    why_human: "Colour rendering cannot be confirmed by code grep alone; --text2 value in the mint token system needs visual confirmation."
  - test: "Off-script skeleton renders gracefully"
    expected: "A user with an unlisted citizenship sees the GENERIC_SKELETON card with 'Verify at official source' fields and the UPL disclaimer, with no empty/crash state"
    why_human: "Skeleton branch requires a profile with citizenship not in CITIZENSHIP_KEY. Needs visual confirmation of the rendered output."
gaps:
  - truth: "The Visa screen is reachable in the running app (CTA from city detail / roadmap teaser) and renders offline with no network calls"
    status: partial
    reason: "City-detail entry point (entry point #1) is dead: Phase 08 replaced the 'View visa pathways' button with <LockGate requiredTier='premium'>{null}</LockGate>. Null children means LockGate renders nothing when tier is met — no CTA, no navigation. Roadmap entry point (entry point #2) is live for plus/premium tier. Deferred by Gabriel."
    artifacts:
      - path: "src/screens/PotentialApp.jsx"
        issue: "Lines 451-454: <LockGate requiredTier='premium' lockedLabel='Unlock Visa Concierge' onUnlock={() => setModalOpen(true)}>{null}</LockGate> — null children, no navigation even for premium users"
    missing:
      - "Replace null children in the city-detail LockGate with a real CTA button that calls setShowVisa(true) when tier is met, restoring entry point #1"
---

# Phase 07: Visa Concierge Verification Report

**Phase Goal:** Build a fully-offline Premium visa concierge screen that takes a quiz profile, screens it against authored flagship visa pathways (Portugal D8, Canada Express Entry), renders a side-by-side comparison grid with graded fit badges, per-pathway document checklists, sources-as-text, a UPL disclaimer banner, and an attorney-referral CTA — wired into the app via two entry points.
**Verified:** 2026-06-06
**Status:** human_needed (4/5 truths verified; 1 entry-point partial; human re-verification required after Phase 08 navigation rework)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visa screen renders Portugal D8 and Canada EE side-by-side with graded fit badge per column | VERIFIED | Visa.jsx L131-165: `repeat(auto-fit, minmax(300px, 1fr))` grid; FIT_STYLES map; selectVisaPathways returns both pathways for US citizens; all 15 visa.test.ts tests GREEN |
| 2 | Each pathway shows document checklist, fee/timeline, officialSources as text (never `<a>`), and 'data as of' label | VERIFIED | Visa.jsx: SourceBlock renders `<p>` text (grep confirms 0 `<a ` tags); visa-pathways.ts: PORTUGAL_D8 has 12-item checklist, CANADA_EXPRESS_ENTRY has 10-item checklist; 26 visa-pathways.test.ts tests GREEN including data-as-of assertions |
| 3 | 'Not legal advice' disclaimer banner and attorney-referral CTA render on all immigration content | VERIFIED | Visa.jsx: DisclaimerBanner component renders unconditionally; AttorneyCTA component present; "not legal advice" confirmed 3 times (case-insensitive grep); no `--neg` colour on long-shot badge (FIT_STYLES maps long-shot to `var(--text2)`) |
| 4 | Visa screen is reachable in the running app and renders offline (no network calls) | PARTIAL | Roadmap entry point live: PotentialApp.jsx L215 passes `onVisa` prop; Roadmap.jsx L178-186 renders CTA; LockGate at L318 uses `requiredTier="plus"` so roadmap is reachable for plus/premium. City-detail entry point DEAD: L451-454 `<LockGate requiredTier="premium">{null}</LockGate>` — null children, no CTA. No fetch/await in Visa.jsx (grep 0). Deferred by Gabriel. |
| 5 | Off-script destination renders generic honest skeleton, never a dead-end | VERIFIED | selectVisaPathways falls back to GENERIC_SKELETON when citizenship not in VISA_PATHWAYS; isSkeleton detection in Visa.jsx routes to skeleton branch; GENERIC_SKELETON has `processingTime: 'Verify at official source'`; test for `citizenship: 'XX'` returns length-1 skeleton result |

**Score:** 4/5 truths verified (truth #4 partial — one of two entry points is dead)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/screens/Visa.jsx` | Premium visa concierge screen | VERIFIED | 353 lines, full implementation: comparison grid, fit badges, checklists, disclaimer, CTA, skeleton branch, mount-fade animation |
| `src/screens/PotentialApp.jsx` | showVisa state + render guard + Visa wiring | VERIFIED (partial caveat) | Visa imported (L8), showVisa state (L57), render guard before Roadmap guard (L193), onVisa prop passed to Roadmap (L215). City-detail entry point null (L451-454). |
| `src/screens/Roadmap.jsx` | onVisa prop + visa-section CTA (D-07 second entry point) | VERIFIED | L122 signature includes `onVisa`, L178-186 renders CTA when `section.id === 'visa' && onVisa` |
| `shared/engine/visa.ts` | selectVisaPathways + CITIZENSHIP_KEY normalization | VERIFIED | 194 lines; CITIZENSHIP_KEY map; gradeD8/gradeExpressEntry/computeGradedFit; D8_MIN_ANNUAL_USD = 48,576; zero async/network |
| `shared/data/visa-pathways.ts` | PORTUGAL_D8, CANADA_EXPRESS_ENTRY, GENERIC_SKELETON, VISA_PATHWAYS | VERIFIED | 179 lines; flat registry `{ US: [PORTUGAL_D8, CANADA_EXPRESS_ENTRY] }`; all fields populated |
| `shared/engine/visa.test.ts` | 15 engine tests (citizenship normalization regression included) | VERIFIED | 15 tests GREEN; includes `realQuizUSProfile` fixture with `citizenship: 'US Citizen'` |
| `shared/data/visa-pathways.test.ts` | 26 data-integrity tests | VERIFIED | 26 tests GREEN; covers required fields, data-as-of strings, no CRS job-offer bonus, GENERIC_SKELETON discipline |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/screens/Visa.jsx` | `shared/engine/visa.ts selectVisaPathways` | import + call with profile + matchedCountry | WIRED | L1-2: import confirmed; L131: `selectVisaPathways(profile, matchedCountry ?? "")` called; result rendered in comparison grid |
| `src/screens/PotentialApp.jsx` | `src/screens/Visa.jsx` | `<Visa profile={profile} ... />` under showVisa guard | WIRED | L8: import; L193: render guard; L57: showVisa state; guard placed before Roadmap guard |
| `src/screens/Roadmap.jsx` | `PotentialApp.jsx setShowVisa` | onVisa prop threaded; visa-section CTA onClick={onVisa} | WIRED | L122: onVisa in signature; L178-186: CTA renders; PotentialApp L215: `onVisa={() => { setShowRoadmap(false); setShowVisa(true); }}` |
| `src/screens/PotentialApp.jsx` | `src/screens/Roadmap.jsx` | `<LockGate requiredTier="plus">` renders CTA that calls setShowRoadmap(true) | WIRED | L318 LockGate requiredTier="plus" — Roadmap reachable for plus/premium tier |
| City-detail → `src/screens/Visa.jsx` | entry point #1 | LockGate children trigger setShowVisa | NOT_WIRED | L451-454: `{null}` children — LockGate cannot navigate even for premium users |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `src/screens/Visa.jsx` | `results` | `selectVisaPathways(profile, matchedCountry)` | Yes — reads VISA_PATHWAYS registry populated from authored visa-pathways.ts | FLOWING |
| `src/screens/Visa.jsx` | `results[n].fit` | `computeGradedFit(pathway, profile)` inside selectVisaPathways | Yes — deterministic grading from profile.hasRemote, profile.income, profile.age, profile.education | FLOWING |
| `src/screens/Visa.jsx` | `profile` | Passed as prop from PotentialApp, sourced from quiz answers | Yes — real quiz profile (citizenship normalization via CITIZENSHIP_KEY) | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All visa engine tests GREEN | `npx vitest run shared/engine/visa.test.ts` | 15/15 passed | PASS |
| All visa data-integrity tests GREEN | `npx vitest run shared/data/visa-pathways.test.ts` | 26/26 passed | PASS |
| Full suite passes (no Phase 07 regressions) | `npx vitest run` | 170/170 passed, 18 files | PASS |
| Build succeeds | `npm run build` | dist built in 333ms, no errors | PASS |
| TypeScript clean | `npx tsc --noEmit` | exit 0 | PASS |
| No `<a href>` in Visa.jsx | `grep -c '<a ' src/screens/Visa.jsx` | 0 | PASS |
| No fetch/network in Visa.jsx | `grep -c 'fetch(' src/screens/Visa.jsx` | 0 | PASS |
| Citizenship normalization: "US Citizen" → authored pathways (not skeleton) | visa.test.ts `realQuizUSProfile` test | length 2, contains Portugal + Canada | PASS |
| Long-shot badge not using --neg | `grep 'long-shot' src/screens/Visa.jsx` | `var(--text2)` (neutral grey) | PASS |
| Disclaimer renders | `grep -ic 'not legal advice' src/screens/Visa.jsx` | 3 | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| VISA-01 | 07-03 | Pure offline screener engine: selectVisaPathways, gradeD8, gradeExpressEntry, citizenship normalization | SATISFIED | visa.ts 194 lines, 15 tests GREEN, CITIZENSHIP_KEY map, zero network calls |
| VISA-02 | 07-04 | Side-by-side comparison surface: auto-fit grid, graded fit badge per column, both flagship pathways | SATISFIED | Visa.jsx grid + FIT_STYLES; both pathways returned for US citizens |
| VISA-03 | 07-04 | Data integrity: checklist, cited figures, fee/timeline, data-as-of, no invented facts | SATISFIED | 26 data tests GREEN; both pathways have non-empty checklists, processingTime, feeRangeUSD, officialSources with data-as-of; GENERIC_SKELETON uses 'Verify at official source' |
| VISA-04 | 07-04 | UPL safety: visible disclaimer banner + attorney CTA on all immigration content, no legal conclusions | SATISFIED | DisclaimerBanner renders unconditionally; AttorneyCTA present; no --neg for long-shot; no `<a>` tags; sources as text |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/screens/PotentialApp.jsx` | 451-454 | `<LockGate requiredTier="premium">{null}</LockGate>` — null children, no city-detail navigation | WARNING | City-detail entry point #1 dead. Visa screen only reachable via Roadmap. Deferred by Gabriel. Not a Phase 08 regression introduced in error — it was an explicit Phase 08 design decision. |
| `src/screens/Visa.jsx` | AttorneyCTA | `onClick={() => {}}` — attorney CTA click handler is a no-op | INFO | Attorney referral CTA has no destination. Expected for MVP (no directory integration). UPL safety not affected; disclaimer is visual, not functional. |

No TBD/FIXME/XXX markers found in Phase 07 files. No `dangerouslySetInnerHTML`. No `console.log`-only implementations. No hardcoded empty state that blocks rendering.

---

## Human Verification Required

### 1. Roadmap → Visa flow (post Phase 08 rework)

**Test:** As a plus or premium tier user, complete the quiz, open city detail, click the Roadmap button, scroll to the visa section, click "See full visa pathways →", and confirm the Visa screen opens.
**Expected:** Portugal D8 and Canada Express Entry appear side-by-side (or stacked on mobile). Graded fit badges visible. Disclaimer banner visible above pathway columns.
**Why human:** Prior PASSED checkpoint was pre-Phase 08. Phase 08 tier-gate rework altered navigation. The Roadmap entry point is structurally wired but needs visual re-confirmation that the onClick chain (onVisa → setShowRoadmap(false) + setShowVisa(true)) still renders the Visa screen cleanly without routing artefacts from the Phase 08 LockGate layer.

### 2. UPL disclaimer banner position

**Test:** Open the Visa screen with any profile and verify the disclaimer banner appears above the pathway comparison grid.
**Expected:** "Not legal advice" / disclaimer text is the first content element visible after the screen header — it precedes the pathway columns, not follows them.
**Why human:** Vertical ordering of DisclaimerBanner relative to the grid is a visual assertion. grep confirms the component renders but cannot confirm DOM order is always above-fold before the grid.

### 3. Long-shot badge colour (neutral grey, not red)

**Test:** Use a profile with `hasRemote: false` (e.g. a teacher). Navigate to Visa screen. Observe the fit badge on the Portugal D8 column.
**Expected:** "Long shot" badge renders in a neutral grey colour — not red, not orange.
**Why human:** FIT_STYLES maps long-shot to `var(--text2)` but the actual rendered colour depends on the mint token system's CSS variable values. Cannot confirm visual neutrality by reading the variable name alone.

### 4. Off-script skeleton graceful render

**Test:** Temporarily set a test profile's citizenship to a value not in CITIZENSHIP_KEY (e.g. "Kenyan") and open the Visa screen.
**Expected:** Single generic skeleton card renders with "Verify at official source" text in fee/timeline fields, disclaimer banner present, no crash or empty white screen.
**Why human:** Skeleton branch is code-verified via unit tests but needs visual confirmation that the single-column layout and GENERIC_SKELETON field values render cleanly (no overflow, no missing fields visible to the user).

---

## Gaps Summary

One partial gap: the city-detail entry point (#1) was replaced by Phase 08 with a null-children LockGate, making it visually absent for all tier levels. The Visa screen is still reachable via the Roadmap visa-section CTA (entry point #2), which is live for plus/premium tier users. Gabriel explicitly deferred restoring entry point #1.

The fix is straightforward: replace `{null}` with a real CTA button (`<button onClick={() => setShowVisa(true)}>View visa pathways</button>`) inside the premium LockGate, making it the unlock action. This is a 1-line change but was out of Phase 07 scope.

All other Phase 07 deliverables (engine, data, UI component, UPL safety, data integrity) are fully verified. The test suite (170 tests, 18 files) is GREEN. The build is clean.

---

_Verified: 2026-06-06_
_Verifier: Claude (gsd-verifier)_
