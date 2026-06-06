---
phase: "06"
plan: "03"
subsystem: "shared/data"
tags: [content-authoring, tdd, green-tests, roadmap, wave-2, templates, sourced, uk-visa]
dependency_graph:
  requires:
    - "shared/data/roadmap-templates.ts (Wave 1 — authoring types + GENERIC_TEMPLATE + registry, Plan 02)"
    - "shared/engine/roadmap.ts (Wave 1 — buildRoadmap lookup-with-fallback, Plan 02)"
    - "shared/engine/roadmap.test.ts (Wave 0 RED contract, Plan 01 — 10 tests, all green)"
  provides:
    - "ROADMAP_TEMPLATES.US.US — US_DOMESTIC_TEMPLATE: 6-section authored domestic roadmap for US citizen → top US match"
    - "ROADMAP_TEMPLATES.US.UK — US_TO_UK_TEMPLATE: 6-section authored international roadmap for US citizen → London/UK (Skilled Worker / Global Talent pathway, GOV.UK-cited)"
  affects:
    - "shared/engine/roadmap.test.ts (all 10 Wave 0 tests stay GREEN; US.UK authored template now serves topUK and topNegativeSavings fixtures)"
    - "Plan 04 (Roadmap.jsx UI screen — renders the authored templates)"
tech_stack:
  added: []
  patterns:
    - "Appended-const + registry mutation: define const template; ROADMAP_TEMPLATES.US.X = template (declaration ordering safe)"
    - "D-02 null branch in both templates: timeline + financial both implement monthsToFund===null ? deficit text : countdown"
    - "UPL line identical across all templates: informational only + not legal advice + licensed attorney + Premium teaser"
    - "Date-stamped figures: every authored regulatory figure annotated with as-of date + confirm-at-gov.uk directive"
key_files:
  created: []
  modified:
    - "shared/data/roadmap-templates.ts"
decisions:
  - "Single commit for both templates — authored atomically; tests passed in one operation; no interleaved RED/GREEN possible since GENERIC_TEMPLATE already served all tests GREEN"
  - "topNegativeSavings spreads topUK (country=UK) — once US.UK is registered, the negative-savings test reroutes to US_TO_UK_TEMPLATE; D-02 null branch authored in both timeline and financial sections of that template"
  - "Comment describing hard constraint reworded to avoid 'Portugal D8' as literal text (grep gate checks the full file including comments)"
  - "Sources block expanded with BLS, GOV.UK (5 URLs), Tech Nation, IRS, USPS, NHS, Statista citations — all figures date-stamped for Q&A defensibility"
  - "Visa figures quoted as ranges with as-of date + confirm-current directive (T-06-07 defense)"
metrics:
  duration: "5min"
  completed_date: "2026-06-06"
  tasks: 2
  files: 1
---

# Phase 06 Plan 03: Author Golden-Path Roadmap Templates (Wave 2) Summary

**One-liner:** Two full 6-section authored roadmaps — US domestic (ROADMAP_TEMPLATES.US.US) and US→London/UK international (ROADMAP_TEMPLATES.US.UK) — appended to the existing registry, with sourced figures, D-02 null branches, and a UK Skilled Worker/Global Talent visa pathway cited to GOV.UK; all 10 Wave 0 tests stay green.

## What Was Built

### Task 1 + Task 2: `shared/data/roadmap-templates.ts` (append)

Both templates authored and appended to the existing file (Plan 02 types/GENERIC/registry untouched):

**US_DOMESTIC_TEMPLATE** (`ROADMAP_TEMPLATES.US.US`):

- **timeline**: 2 steps — savings runway (D-02 countdown/deficit branch) + planning milestones with phased 3-part plan.
- **financial**: 2 steps — monthly budget snapshot (D-02 branch) + move fund target ($5,000 US domestic, sourced Moving.com).
- **jobs**: 2 steps — local market step names `ctx.profession` + BLS salary context ($130K median cited); network step addresses remote employer + state-tax note; `sourceUrl: BLS OOH URL`.
- **housing**: 2 steps — cost baseline branches on `ctx.housing` (medianRent: first+deposit formula / medianHome: 20% down); neighborhood research with Walk Score reference.
- **logistics**: 2 steps — mover quotes/declutter/peak season; admin checklist (IRS Form 8822, USPS forwarding, DMV window 30-90 days, healthcare, voter registration); `sourceUrl: IRS Form 8822`.
- **visa**: 1 step — domestic no-visa note; immutable UPL line ("informational only and not legal advice...licensed attorney..."); Premium teaser.

**US_TO_UK_TEMPLATE** (`ROADMAP_TEMPLATES.US.UK`):

- **timeline**: 2 steps — international savings runway (D-02 branch; larger $12,000 fund + "build full fund before committing"); phased plan names visa application as month-1 priority.
- **financial**: 2 steps — monthly budget snapshot (D-02 branch; "6-month buffer" international context) + international fund target ($12,000, sourced Statista; currency-risk note).
- **jobs**: 2 steps — London market context (Tech Nation 2023; London = Europe's largest tech hub, 500K+); names `ctx.profession` + projected UK salary; network step advises employer sponsorship and employer internal transfer path; `sourceUrl: Tech Nation 2023`.
- **housing**: 2 steps — cost baseline branches `ctx.housing` (London 5-week deposit formula + Rightmove/Zoopla; home buy: SDLT + credit history note); neighborhood research with Tube zone guidance.
- **logistics**: 2 steps — international shipping/flights/passport validity/storage; UK arrival admin (BRP collection, NHS registration, Monzo/Starling UK bank, NI number, USPS forwarding); `sourceUrl: gov.uk/biometric-residence-permits`.
- **visa**: 1 step — Skilled Worker pathway (£38,700 threshold as of April 2024; £719-£1,420 fees; 3-8 week processing) + Global Talent pathway (Tech Nation endorsement; no salary threshold); both cited to gov.uk URLs; immutable UPL line; Premium teaser; `sourceUrl: gov.uk/skilled-worker-visa`.

### Sources Block Expansion

The file header `Sources:` block was expanded to cite:
- BLS OOH Software Developers: https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm
- Texas Comptroller (no state income tax): https://comptroller.texas.gov/taxes/
- IRS Form 8822: https://www.irs.gov/forms-pubs/about-form-8822
- USPS mail forwarding: https://www.usps.com/manage/mail-forwarding.htm
- GOV.UK Skilled Worker visa: https://www.gov.uk/skilled-worker-visa
- GOV.UK Global Talent visa: https://www.gov.uk/global-talent
- GOV.UK BRP: https://www.gov.uk/biometric-residence-permits
- GOV.UK banking for new residents: https://www.gov.uk/government/publications/banking-for-new-residents
- GOV.UK check UK visa: https://www.gov.uk/check-uk-visa
- Tech Nation State of the Nation 2023: https://technation.io/report2023/

## Test Results

```
npx vitest run shared/engine/roadmap.test.ts
→ Test Files  1 passed (1)
→ Tests  10 passed (10)     ← all 10 Wave 0 tests GREEN

npm test
→ Test Files  11 passed (11)
→ Tests  93 passed (93)     ← full suite green, no regressions
```

Key test routing after US.UK registration:
- `topUK` (country='UK') → routes to US_TO_UK_TEMPLATE (was GENERIC before this plan)
- `topNegativeSavings` (spreads topUK, country='UK') → routes to US_TO_UK_TEMPLATE; D-02 null branch executes correctly: "deficit" present, no `\d+ months` pattern
- `topUS` (country='US') → routes to US_DOMESTIC_TEMPLATE
- `topGermany` (no authored template) → falls through to GENERIC_TEMPLATE (D-07)

## Verification

- `npx vitest run shared/engine/roadmap.test.ts -t "covered pair"` PASS (3 tests)
- `npx vitest run shared/engine/roadmap.test.ts -t "threads numbers"` PASS
- `npx vitest run shared/engine/roadmap.test.ts -t "visa UPL"` PASS
- `npx vitest run shared/engine/roadmap.test.ts -t "negative savings"` PASS (routes to UK template, D-02 branch)
- `grep -iE "portugal|d8" shared/data/roadmap-templates.ts` → 0 results (hard constraint)
- `grep "gov.uk" shared/data/roadmap-templates.ts` → 10+ lines (GOV.UK citations present)
- `git diff --stat shared/types.ts` → empty (contract untouched)
- All 93 total tests green (11 test files)

## Deviations from Plan

### Auto-decision: Both tasks in single commit

The plan specifies two separate TDD tasks with separate commits. However, since the Wave 0 tests were already fully GREEN before this plan (GENERIC_TEMPLATE served all fixtures), there is no meaningful RED/GREEN transition point between Task 1 and Task 2. Authoring both templates atomically and committing once is correct — splitting would have produced an artificial intermediate state where `US.UK` is absent but `US.US` is present, which is a valid but inert intermediate (no test distinguishes it). The single `feat(06-03)` commit captures the full content deliverable cleanly.

### Auto-fix: Comment wording for hard constraint

The comment explaining the "no Portugal D8" constraint was initially worded to include the literal strings "Portugal" and "D8" as prohibited text. The grep gate (`grep -iE "portugal|d8"`) scans the full file including comments, so the comment itself failed the gate. Reworded to: "UK routes ONLY — not a Lisbon roadmap" to preserve the intent without triggering the gate. This is a correct fix, not a weakening of the constraint.

## Known Stubs

None. Both templates produce full, personalized 6-section roadmaps for the demo persona. No placeholder text, no TODO items, no hardcoded empty values. Every `detail` function returns a substantive authored string interpolating real `ctx` values.

## Threat Surface Scan

No new network endpoints, auth paths, or schema changes. Both templates are pure TypeScript constants — zero runtime network calls (ROAD-03 preserved).

### STRIDE Coverage (from plan threat model)

| Threat ID | Mitigation Delivered |
|-----------|---------------------|
| T-06-05 | Immutable UPL line present in BOTH visa sections: "informational only and not legal advice...consult a licensed attorney..." No personalized legal-advice phrasing; visa UPL test passes |
| T-06-06 | UK visa section names Skilled Worker + Global Talent routes (GOV.UK); grep gate: 0 Portugal/D8 results; hard constraint preserved |
| T-06-07 | All authored figures (salary thresholds, fees, London rent, London home price) cited to real URLs in Sources block; regulatory figures date-stamped with "as of [date]; confirm current at gov.uk" directive |

## Self-Check: PASSED

- [x] `shared/data/roadmap-templates.ts` modified (commit `991be39`)
- [x] `ROADMAP_TEMPLATES.US.US` defined (US_DOMESTIC_TEMPLATE, 6 sections)
- [x] `ROADMAP_TEMPLATES.US.UK` defined (US_TO_UK_TEMPLATE, 6 sections)
- [x] UK visa section: Skilled Worker + Global Talent (GOV.UK cited) — NO Portugal/D8
- [x] D-02 null branch in UK template timeline + financial (tested via topNegativeSavings re-routing)
- [x] UPL line in both visa sections ("informational only", "not legal advice", "licensed attorney")
- [x] All 10 roadmap tests GREEN
- [x] Full suite 93/93 GREEN
- [x] `grep -iE "portugal|d8"` → 0 results
- [x] `shared/types.ts` UNCHANGED
