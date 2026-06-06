---
phase: 06-relocation-roadmap
plan: 05
status: deferred
optional: true
requirements: [ROAD-02]
deferred_at: "Task 0 — checkpoint:human-action pre-flight gate"
deferred_on: 2026-06-06
---

# Plan 06-05 — DEFERRED (not executed)

**Outcome:** Deferred at Task 0's blocking human-action gate. This plan is OPTIONAL and NON-BLOCKING; the phase ships complete without it.

## Why deferred

Task 0 gate required two prerequisites:
1. `scripts/capture-golden-path.ts` present — **met** (exists on this branch).
2. Demo persona pinned (citizenship + #1 US city + international city) — **not pinned**. Per 06-RESEARCH Open Q2 the persona is still provisional. The user explicitly chose to defer (close the phase on Plans 01–04) rather than pin the persona now.

The resume-signal for Task 0 is "defer" → close this plan as not-yet-executable.

## Impact on requirements

- **ROAD-02** is already satisfied independently of this plan. The `acceptEnrichment` preservation validator (Plan 06-02, `shared/engine/roadmap.ts`) enforces the "template-first, LLM-enriched for prose only — no invented procedural/legal steps" boundary (D-05), and is covered by the Wave 0 RED suite ("enrich preserves authored"). ROAD-02 is marked Complete in REQUIREMENTS.md.
- This plan would only have added the D-04 flourish: a build-time prose-enrich bake (`api/enrich-core.ts` + `scripts/enrich-roadmap.ts`) writing polished `detail` prose into the golden-path cache. The authored prose renders directly today — offline and correct (verified live for both US→US Miami and US→UK London).

## Re-enable later

To execute this plan after pinning the demo persona:
`/gsd:execute-phase 6 --gaps-only` is not applicable (this is not a gap plan). Instead, once the persona is pinned, re-run `/gsd:execute-phase 6` — the plan index will surface 06-05 as the remaining incomplete plan, and Task 0's gate can be answered "proceed".

## Files (not created)

- `api/enrich-core.ts` — not created (deferred)
- `scripts/enrich-roadmap.ts` — not created (deferred)
