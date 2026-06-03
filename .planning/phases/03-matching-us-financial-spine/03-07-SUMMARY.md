---
phase: 03-matching-us-financial-spine
plan: 07
subsystem: results-ui
tags: [results, ranking, sort, contribution-bars, financials, reconfirm, engine-wiring]
dependency_graph:
  requires: [03-06]
  provides: [results-ui, city-detail-ui, reconfirm-overlay-ui, engine-wiring-complete]
  affects: [src/screens/PotentialApp.jsx]
tech_stack:
  added: []
  patterns: [ranked-list-component, section-collapsible, contribution-bars, financial-tile-grid, reconfirm-overlay]
key_files:
  created:
    - src/screens/results/ResultsView.jsx
    - src/screens/results/ResultsView.test.jsx
    - src/screens/results/CityDetail.jsx
    - src/screens/results/ReconfirmOverlay.jsx
  modified:
    - src/screens/PotentialApp.jsx
decisions:
  - AI stub sections (jobs/housing/nightlife/etc.) retained in city detail — removing them was a visible demo regression; they are kept as inline AISection components in PotentialApp.jsx and remain offline/stubbed as before
  - selectedCity state now holds MatchResult (not City) — consumers access city via selectedCity.city
  - aiExpandedSection state moved to component top level to comply with React Rules of Hooks
  - Profile defaults add citizenship/immigrationStatus/opennessToAbroad/moveTimeline so engine sanitizeProfile has the required fields
metrics:
  duration: "~10 min"
  completed_date: "2026-06-02"
  tasks: 3
  files: 5
---

# Phase 3 Plan 7: Results UI + Engine Wiring Summary

Engine-connected results surface: MATCH-04 sort, D-05/D-06 contribution bars, FIN-01 financial breakdown, D-02 re-confirm overlay, and full removal of deprecated inline scoring logic from PotentialApp.jsx.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | ResultsView + sort test | 89a3e35 | ResultsView.jsx, ResultsView.test.jsx |
| 2 | CityDetail + ReconfirmOverlay | a480db4 | CityDetail.jsx, ReconfirmOverlay.jsx |
| 3 | Wire rankCities into PotentialApp | 22a9166 | PotentialApp.jsx |

## What Was Built

### Task 1: ResultsView.jsx + ResultsView.test.jsx

`ResultsView.jsx` is a pure presentational component taking `{ results, sortBy, setSortBy, onSelectCity }`:
- Exports `sortResults(results, sortBy)` — pure helper sorting MatchResult[] by 4 MATCH-04 keys
- Sort keys use typed field names: `r.estSalary`, `r.monthlySavings`, `r.matchScore`, `r.city.costIndex`
- Renders sort pills (match / savings / salary / cost) and a card list with emoji, name, match score, salary/yr, savings/mo
- Savings color: `var(--pos)` green for positive, `var(--neg)` red for negative
- Shared design tokens (css, pill, heading, mono, fmt, fmtFull) exported for sibling components

`ResultsView.test.jsx`: 7 assertions — all 4 sort keys, field-name contract (estSalary not salary, city.costIndex not costIndex), input immutability. Full suite: 26/26 green.

### Task 2: CityDetail.jsx + ReconfirmOverlay.jsx

`CityDetail.jsx` takes `{ result: MatchResult, expandedSection, setExpandedSection, profile }`:
- Always-visible financial tile grid: estSalary, monthlyTakeHome, monthlySavings, rent/home
- Section collapsible "Why this score": `ContributionBars` renders `result.scoreFactors` as signed bars normalized by max absolute contribution (not sum) — positive bars green (`var(--pos)`), negative bars red (`var(--neg)`) including real dealbreaker penalty bars (D-05). Signed number shown.
- Section collapsible "Monthly Expenses": `ExpenseBreakdown` renders stacked bar + itemized rows from `result.expenses` with total (FIN-01)
- Both sections expand on click for D-06 disclosure-on-expand
- Guards empty scoreFactors and null expenses (T-3-14)

`ReconfirmOverlay.jsx` takes `{ signal: ReconfirmSignal, onKeep, onLift }`:
- Full-screen backdrop with amber warning accent (`var(--accent2)`) on dark card
- Renders `signal.city.name` and `signal.factLabel` in D-02 copy
- "Yes, still a dealbreaker" → onKeep; "No, it's fine" → onLift
- Structural only — final copy/styling authored by collaborator in later pass

### Task 3: PotentialApp.jsx wiring

- **Added imports**: `rankCities` from engine, `ResultsView`, `CityDetail`, `ReconfirmOverlay`
- **Engine call**: `nextProfile` now calls `const { results: ranked, reconfirmSignal: signal } = rankCities(profile)` instead of inline map+score
- **New state**: `reconfirmSignal` (MatchResult | null); `aiExpandedSection` moved to top-level
- **Results screen**: renders `<ResultsView>` with sort state + `<ReconfirmOverlay>` when signal present
- **City detail screen**: renders `<CityDetail result={selectedCity}>` for engine data; AI stub sections kept inline (see Deviations)
- **onLift**: re-runs `rankCities({ ...profile, dealBreakers: [...without triggered db] })`, updates results + new signal
- **Profile defaults**: added `citizenship`, `immigrationStatus`, `opennessToAbroad`, `moveTimeline` to default state — required by Profile interface
- **Deleted**: inline `CITIES_DATA` array (12-city), `getSalary`, `getTakeHome`, `getExpenses`, `getSavings`, `getMatchScore` — all superseded by engine
- `npx vite build` succeeds; no new fetch/network calls

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] React Rules of Hooks violation**
- **Found during:** Task 3 implementation review
- **Issue:** `const [aiExpandedSection, setAiExpandedSection] = useState(null)` was placed inside the conditional branch `if (step === 2 && selectedCity)` — a Rules of Hooks violation that would cause React to crash at runtime
- **Fix:** Moved `aiExpandedSection` state declaration to top-level alongside other state hooks
- **Files modified:** `src/screens/PotentialApp.jsx`
- **Commit:** 22a9166

### Scope Decision (documented, not a fix)

**AI stub sections retained in city detail:** The plan scope is "Why this score" + "Financials" for CityDetail.jsx. The existing city detail had additional AI-powered sections (jobs, housing, nightlife, outdoors, food, day-in-life) that were stubbed as offline coming-soon content. Removing them would have been a visible demo regression. Decision: keep AI sections as inline `AISection` components in PotentialApp.jsx's city detail branch — they remain fully offline/stubbed and Phase 5 owns their live data. CityDetail.jsx is scoped to engine data only as specified.

## Verification

- `npx vitest run src/screens/results/ResultsView.test.jsx` — 7/7 GREEN (MATCH-04 sort)
- `npx vitest run` — 26/26 GREEN (19 engine + 7 new)
- `npx vite build` — succeeds, 248 kB bundle
- `grep -c "const getMatchScore" src/screens/PotentialApp.jsx` → 0 (removed)
- `grep -c "= totalSal \* 0.22" src/screens/PotentialApp.jsx` → 0 (removed)
- `grep -c "fetch(" src/screens/results/ResultsView.jsx` → 0 (offline preserved)
- `grep -c "rankCities" src/screens/PotentialApp.jsx` → 5 (wired)

## Known Stubs

- AI sections (jobs/housing/nightlife/outdoors/food/dayinlife) in city detail: all return `"coming_soon"` from `fetchCityAI`. These are intentional offline stubs. Phase 5 owns live data. No stub prevents the plan's goal — the engine results + contribution bars + financial breakdown are fully functional.

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes. All data is in-process. T-3-15 (offline guarantee) confirmed: no new `fetch()` calls in any results file.

## Self-Check

Files exist:
- `src/screens/results/ResultsView.jsx` ✓
- `src/screens/results/ResultsView.test.jsx` ✓
- `src/screens/results/CityDetail.jsx` ✓
- `src/screens/results/ReconfirmOverlay.jsx` ✓

Commits:
- 89a3e35 — Task 1 ✓
- a480db4 — Task 2 ✓
- 22a9166 — Task 3 ✓
