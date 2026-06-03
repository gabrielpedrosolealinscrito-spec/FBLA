---
phase: 4
slug: international-destinations-country-models
status: mapped
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-02
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Dimensions V1–V6 are defined in `04-RESEARCH.md` § Validation Architecture; the planner maps them to concrete task IDs below.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (in devDependencies; tests co-located, e.g. `shared/engine/financial.test.ts`) |
| **Config file** | none — vitest uses `vite.config.*` defaults (no `test` script in package.json) |
| **Quick run command** | `npx vitest run shared/engine` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5–15 seconds (engine suite is fast, pure functions) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run shared/engine`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

> Seeded with the V1–V6 validation dimensions from `04-RESEARCH.md`. Task IDs (`04-NN-MM`) are filled by the planner once plans exist; each row maps a dimension to the plan/wave that owns it.

| Dim | Requirement | Validation behavior | Test Type | Automated Command | Status |
|-----|-------------|---------------------|-----------|-------------------|--------|
| V1 (04-01-02, 04-04-01) | FIN-02 | Each country model's worked example → take-home within tolerance band (UK ±3%, DE/CA ±5–7%, PT ±5%); reached via `FINANCIAL_MODELS[id]` not US fallback | unit | `npx vitest run shared/engine/financial` | ⬜ pending |
| V2 (04-01-02, 04-04-01) | FIN-02 | No-US-math invariant: foreign cities never call `computeUSTax`/`computeFederalTax`; non-remote foreign salary from sourced local dataset, NOT `BASE_SALARIES×costIndex`; remote keeps `profile.income` everywhere | unit | `npx vitest run shared/engine` | ⬜ pending |
| V3 (04-02-01, 04-02-02, 04-04-02) | MATCH-02 | Openness soft-multiplier: at openness=0 all 4 intl cities still present (size==CITIES_DATA.length, score>0); full weight at max; monotonic; normalizer handles both 0–100 and 1–5 scales | unit | `npx vitest run shared/engine/index` | ⬜ pending |
| V4 (04-01-03, 04-04-02) | MATCH-02 | Ranking integrity: Lisbon/Berlin/Toronto/London all appear; two-pass D-02 + clamp/sanitizeProfile hold (no NaN, score∈[0,99]) with intl cities present | unit | `npx vitest run shared/engine/index` | ⬜ pending |
| V5 (04-03-02, all model tasks) | FIN-02 | Sourcing: every intl figure has a source ref in code; "data as of [date]" + "FX rate as of [date]" render; dual-currency (local primary, USD parens) | unit + manual | `npx vitest run` / visual | ⬜ pending |
| V6 (04-01-01, 04-03-02) | MATCH-02, FIN-02 | Offline: no new `/api`/network calls introduced (FX hardcoded) | manual/grep | `! grep -rn "fetch(\|/api" shared/engine` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Extend `shared/engine/financial.test.ts` — fixtures for `pt-irs-2026`, `de-2026`, `ca-on-2026`, `uk-2026` worked examples (V1) + no-US-math invariant (V2)
- [x] Extend `shared/engine/index.test.ts` — openness soft-multiplier + scale-defensive normalizer (V3) and ranking integrity with intl cities (V4)
- [x] vitest already present — no framework install needed

*Existing infrastructure (vitest + co-located engine tests) covers the harness; Phase 4 adds fixtures, not new tooling.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dual-currency render + "data as of"/"FX as of" stamps + "i" tooltips on intl CityDetail | FIN-02 (SC#3/#4, D-03/D-04/D-10) | DOM/visual presentation, frontend pass (friend's domain per division of labor) | Open results → an international city detail; confirm local-primary/USD-paren figures, visible dated stamps, and tappable "i" affordances with source text |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags (use `vitest run`, not `vitest`)
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** mapped to plan task IDs 2026-06-02 (planner)
