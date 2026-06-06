---
phase: 06-relocation-roadmap
verified: 2026-06-06T00:45:00Z
status: passed
score: 4/4
overrides_applied: 0
---

# Phase 6: Relocation Roadmap — Verification Report

**Phase Goal:** Plus-tier users get a step-by-step relocation roadmap for their top city covering all 6 sections (timeline, financial, jobs, housing, logistics, visa), authored from template (not raw LLM), readable offline, and exportable as PDF.
**Verified:** 2026-06-06T00:45:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can view a relocation roadmap covering all 6 sections (timeline, financial, jobs, housing, logistics, visa) | VERIFIED | `buildRoadmap` returns exactly 6 sections in canonical order, locked by type contract (`RoadmapSection['id']`). `roadmap.test.ts` "covered pair" test asserts `sections.length === 6` and `sections.map(s => s.id)` equals the 6-element canonical array. 10/10 roadmap contract tests pass. `Roadmap.jsx` maps all sections to the screen. Live in-browser session (Task 4, blocking human-verify) confirmed all 6 sections rendered with personalized numbers for both US→US (Miami) and US→UK (London). |
| 2 | Roadmap content is generated from a pre-authored `ROADMAP_TEMPLATES[citizenship][destination_country]` structure; no structural visa or procedural steps are invented by the LLM | VERIFIED | `ROADMAP_TEMPLATES.US.US` and `ROADMAP_TEMPLATES.US.UK` are authored `RoadmapTemplate` arrays in `shared/data/roadmap-templates.ts`. `buildRoadmap` resolves via `ROADMAP_TEMPLATES[profile.citizenship]?.[top.city.country] ?? GENERIC_TEMPLATE` — no LLM call on the render path. `acceptEnrichment` validator (tested by "enrich preserves authored") throws on any count/label/sourceUrl mutation; the LLM may only polish `detail` prose at build time. Grep confirms no `fetch`/`/api`/network reference in `shared/engine/roadmap.ts` or `Roadmap.jsx`. No "Portugal" or "D8" anywhere in `roadmap-templates.ts`. UK visa section cites `gov.uk/skilled-worker-visa` and `gov.uk/global-talent`. |
| 3 | The roadmap renders without any network connection (offline-readable) | VERIFIED | `buildRoadmap` and `buildRoadmapForRow` are pure functions with zero network calls. Grep of `roadmap.ts` and `Roadmap.jsx` returns nothing for `fetch`, `/api`, or `http`. "offline deterministic" test asserts two consecutive calls with identical inputs produce deeply-equal output without any network call. Task 4 human-verify checkpoint (blocking, completed in-phase): Wi-Fi disabled, roadmap reloaded — rendered fully. |
| 4 | User can export or print the roadmap as a PDF from the browser | VERIFIED | `Roadmap.jsx` line 145: `onClick={() => window.print()}` on the Export PDF button. Inline `@media print` block (lines 78–111) hides `.rdm-top`, `.rdm-actions`, `.no-print` (`display:none !important`); applies `break-inside:avoid; page-break-inside:avoid` per section; drops dark theme to `background:#fff; color:#000`. Confirmed by Task 4 human-verify: app chrome hidden, sections did not split awkwardly, white/black ink output. |

**Score:** 4/4 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `shared/engine/roadmap.test.ts` | Wave 0 RED contract suite for all 7 canonical behaviors | VERIFIED | Exists, 10 test cases (including multi-sub-it enrich tests), all passing. Imports from `./roadmap.js` with `.js` suffix; no vitest import (globals:true). |
| `shared/data/roadmap-templates.ts` | Authoring types + GENERIC_TEMPLATE + TARGET_FUND_USD + US.US + US.UK templates | VERIFIED | Exists, 518 lines. Exports `RoadmapContext`, `SectionId`, `TemplateStep`, `TemplateSection`, `RoadmapTemplate`, `ROADMAP_TEMPLATES`, `GENERIC_TEMPLATE`, `TARGET_FUND_USD`. ROADMAP_TEMPLATES.US.US and .US.UK both assigned. 19 source URLs in `Sources:` header block. |
| `shared/engine/roadmap.ts` | `buildRoadmap` + `buildContext` + `monthsToFund` + `acceptEnrichment` | VERIFIED | Exists, 147 lines. Exports `buildRoadmap` and `acceptEnrichment`. No `fetch`/`/api`/network. Reads `top.monthlySavings` directly, no recompute. D-07 fallback via `?? GENERIC_TEMPLATE`. |
| `src/lib/matchEngine.js` | `buildRoadmapForRow` adapter + `CITIZENSHIP_KEY` normalization | VERIFIED | Exports `buildRoadmapForRow`. Imports `buildRoadmap` from `../../shared/engine/roadmap.js`. Reconstructs MatchResult from flat UI row. Normalizes `profile.citizenship` via `CITIZENSHIP_KEY` map so "US Citizen" → "US" hits the authored template (not GENERIC_TEMPLATE). |
| `src/screens/Roadmap.jsx` | Offline render of 6 sections + inline @media print CSS + window.print() | VERIFIED | 182 lines. Default-exports `Roadmap({ row, profile, onBack })`. Calls `buildRoadmapForRow(profile, row)`. `@media print` block inside `const CSS` template literal — not a separate `.css` file. `window.print()` on Export button. No `<a>` or `href=` anywhere. No `fetch`/network. |
| `src/screens/PotentialApp.jsx` | Navigation wiring from city-detail to Roadmap screen | VERIFIED | Imports `Roadmap from './Roadmap.jsx'`. `showRoadmap` state (line 50). Renders `<Roadmap row={roadmapRow} profile={profile} onBack={...} />` where `roadmapRow = selectedCity ?? results[0]` (line 154). "View relocation roadmap" button in city-detail surface (line 265). |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `shared/engine/roadmap.ts` | `shared/data/roadmap-templates.ts` | `import { ROADMAP_TEMPLATES, GENERIC_TEMPLATE, TARGET_FUND_USD }` with `.js` suffix | WIRED | Line 16–21: `from '../data/roadmap-templates.js'` |
| `shared/engine/roadmap.ts` | `top.monthlySavings` | reads MatchResult directly, never recomputes | WIRED | Line 50: `monthlySavings: top.monthlySavings`; no computeExpenses/computeTax calls |
| `src/lib/matchEngine.js` | `shared/engine/roadmap.ts buildRoadmap` | `import { buildRoadmap }` + adapter reconstructs MatchResult | WIRED | Line 15: `import { buildRoadmap } from '../../shared/engine/roadmap.js'`; line 83: `return buildRoadmap(normalizedProfile, top)` |
| `src/screens/Roadmap.jsx` | `src/lib/matchEngine.js buildRoadmapForRow` | `buildRoadmapForRow(profile, row)` in component body | WIRED | Line 13: `import { buildRoadmapForRow } from '../lib/matchEngine.js'`; line 124: `const roadmap = buildRoadmapForRow(profile, row)` |
| `src/screens/PotentialApp.jsx` | `src/screens/Roadmap.jsx` | `row={selectedCity ?? results[0]}`, `profile={profile}`, `onBack` | WIRED | Lines 153–162: `if (step === 2 && showRoadmap)` block renders `<Roadmap row={roadmapRow} profile={profile} onBack={...} />`; `roadmapRow = selectedCity ?? results[0]` — real scored result row from engine |
| `ROADMAP_TEMPLATES.US.UK` | GOV.UK visa pathway facts | authored visa section with `sourceUrl: 'https://www.gov.uk/skilled-worker-visa'` | WIRED | Line 510: `sourceUrl: 'https://www.gov.uk/skilled-worker-visa'`. Skilled Worker / Global Talent pathway only — no Portugal D8. |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `Roadmap.jsx` | `roadmap` (sections/steps) | `buildRoadmapForRow(profile, row)` → `buildRoadmap` → template `detail(ctx)` | Yes — compiled from authored template functions interpolating `MatchResult` numbers (savings, salary, rent, home price, profession). No static fallback, no hardcoded empty array. | FLOWING |
| `src/screens/PotentialApp.jsx` → `<Roadmap>` | `row` prop | `selectedCity ?? results[0]` — a real scored result row from `scoreProfile()` (engine call in `handleComplete`) | Yes — real `MatchResult`-derived data (monthlySavings, salary, medianRent, country, etc.) | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 10 roadmap contract tests pass | `npx vitest run shared/engine/roadmap.test.ts` | 1 test file, 10 tests, 0 failures | PASS |
| Full test suite green (100 tests, 12 files) | `npx vitest run` | 12 test files, 100 passed | PASS |
| matchEngine adapter passes | `npx vitest run src/lib/matchEngine.test.js` | 7 tests, 0 failures | PASS |
| Production build succeeds | `npm run build` | Built in 348ms, no errors | PASS |
| No Portugal/D8 in templates | `grep -iE "portugal\|d8" shared/data/roadmap-templates.ts` | No matches | PASS |
| No network calls in engine | `grep -n "fetch\|/api\|http" shared/engine/roadmap.ts` | No matches | PASS |
| No anchor links in Roadmap.jsx | `grep -n "<a \|href=" src/screens/Roadmap.jsx` | No matches | PASS |
| window.print() present | `grep -n "window.print()" src/screens/Roadmap.jsx` | Line 145: confirmed | PASS |
| @media print inline (not separate CSS file) | `grep -n "@media print" src/screens/Roadmap.jsx` | Lines 8, 78: present in CSS template literal | PASS |
| break-inside:avoid per section | `grep -n "break-inside\|page-break-inside" src/screens/Roadmap.jsx` | Lines 97–98: both present | PASS |
| UPL line in all 3 visa sections | `grep -c "informational only\|not legal advice\|licensed attorney" shared/data/roadmap-templates.ts` | 3 matches (GENERIC, US.US, US.UK) | PASS |
| gov.uk citations in UK template | `grep -c "gov\.uk" shared/data/roadmap-templates.ts` | 9 matches | PASS |
| No debt markers (TBD/FIXME/XXX) | grep across all 5 phase-modified files | No matches | PASS |

---

### Probe Execution

No `scripts/*/tests/probe-*.sh` probes exist for Phase 6. No probe-based verification was declared in any PLAN frontmatter. Section skipped.

---

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| ROAD-01 | 06-01, 06-02, 06-03, 06-04 | User gets a step-by-step relocation roadmap for their top city covering timeline, financial prep, job-search path, housing path, and logistics checklist | SATISFIED | `buildRoadmap` produces all 6 sections. `ROADMAP_TEMPLATES.US.US` and `.US.UK` are full authored templates. Navigation wired in PotentialApp.jsx. All 10 roadmap tests green. Live human-verify confirmed personalized numbers for both demo pairs. |
| ROAD-02 | 06-01, 06-02, 06-03, 06-05 | Roadmap content is template-first (authored from real knowledge) and only LLM-enriched for prose — no invented procedural/legal steps | SATISFIED | Templates are authored TypeScript functions with cited sources. `acceptEnrichment` throws on any step-count/label/sourceUrl mutation (4 sub-tests green). No LLM call on render path. `acceptEnrichment` is the build-time gate; 06-05 (prose enrich bake) was optionally deferred — ROAD-02 is independently satisfied by the authored template + validator (documented in 06-05-SUMMARY.md). |
| ROAD-03 | 06-01, 06-02, 06-04 | Roadmap is readable offline and exportable (e.g., PDF) for the demo | SATISFIED | Zero network calls on render path (grep clean). "offline deterministic" test confirms pure function. Task 4 human-verify: Wi-Fi-off reload confirmed. `window.print()` + inline `@media print` CSS confirmed by grep and human-verify. |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | — | — | — |

No TBD, FIXME, or XXX markers found in any phase-modified file. No stub returns (`return null`, `return {}`, `return []`). No hardcoded empty data. No `<a href>` link in Roadmap.jsx. All implementations substantive.

---

### Human Verification Required

**Task 4 (06-04-PLAN.md) was a blocking `checkpoint:human-verify` gate — already completed in-phase.**

The following verification was performed by the user during Plan 06-04 execution and marked APPROVED:

1. **All 6 sections rendered with personalized numbers** — Confirmed for US→US (Miami) and US→UK (London). Profession string, savings figures, and rent/home prices threaded correctly into section detail text. No clickable links (all source URLs rendered as plain text).

2. **Offline render** — Wi-Fi disabled, roadmap reloaded; rendered fully from authored template with no network dependency.

3. **VISA-04 UPL line present** — "informational only", "not legal advice", "licensed attorney" phrasing confirmed in rendered visa section.

4. **UK visa pathway correct** — Real UK Skilled Worker/Global Talent pathway (no Portugal D8). London-specific content confirmed.

5. **PDF export via window.print()** — Print preview: app chrome/nav/buttons hidden (`no-print` class), sections did not split across pages (`break-inside:avoid`), white/black ink (dark theme dropped), clean readable PDF output.

**Outcome: All human verification items SATISFIED (in-phase, blocking gate passed).**

No outstanding human verification items remain.

---

### Scope Note (Not a Gap)

SC1 uses "Plus-tier user" phrasing, but per 06-04-PLAN.md Task 3 the roadmap is currently ungated — all users with quiz results can reach it via "View relocation roadmap" in city-detail. Tier-gating is explicitly deferred to Phase 8 (TIER-01/02/03). This is intentional and documented, not a gap.

---

### Plan 06-05 Deferral Note (Not a Gap)

Plan 06-05 (optional build-time prose-enrich bake) was deferred at its Task 0 pre-flight gate because the demo persona is still provisional (06-RESEARCH Open Q2). This plan is marked `optional: true` and `status: deferred` in 06-05-SUMMARY.md. ROAD-02 is satisfied independently by the `acceptEnrichment` validator and authored templates. The files `api/enrich-core.ts` and `scripts/enrich-roadmap.ts` are intentionally absent.

---

### Gaps Summary

No gaps. All 4 roadmap success criteria are verified. All 3 requirements (ROAD-01, ROAD-02, ROAD-03) are satisfied. The test suite is green (100 tests, 12 files). Build succeeds. Anti-patterns clean. Human verification checkpoint completed in-phase.

---

_Verified: 2026-06-06T00:45:00Z_
_Verifier: Claude (gsd-verifier)_
