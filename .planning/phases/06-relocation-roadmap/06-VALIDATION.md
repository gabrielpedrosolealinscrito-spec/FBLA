---
phase: 6
slug: relocation-roadmap
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-05
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 (`^4.1.8`) — VERIFIED in package.json |
| **Config file** | Vitest via Vite; tests co-located `shared/engine/*.test.ts` |
| **Quick run command** | `npx vitest run shared/engine/roadmap.test.ts` |
| **Full suite command** | `npm test` (`vitest run`) |
| **Estimated runtime** | ~5–15 seconds (full suite ~123 existing tests + roadmap) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run shared/engine/roadmap.test.ts`
- **After every plan wave:** Run `npm test` (keep the existing 123 green)
- **Before `/gsd:verify-work`:** Full suite must be green; manual PDF print-preview check recorded
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

RED tests are all authored in Plan 01 (`06-01-01`, Wave 0). The GREEN column names the plan/wave that makes each test pass.

| Test (RED in 06-01-01) | GREEN in | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|------------------------|----------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 06-02 | 1 | ROAD-01 | — | N/A | unit | `npx vitest run shared/engine/roadmap.test.ts -t "covered pair"` | ❌ W0 | ⬜ pending |
| 06-01-01 | 06-02 | 1 | ROAD-01 | — | N/A | unit | `npx vitest run shared/engine/roadmap.test.ts -t "threads numbers"` | ❌ W0 | ⬜ pending |
| 06-01-01 | 06-02 | 1 | ROAD-01 / D-07 | — | N/A | unit | `npx vitest run shared/engine/roadmap.test.ts -t "fallback"` | ❌ W0 | ⬜ pending |
| 06-01-01 | 06-02 | 1 | ROAD-01 / D-02 | — | Honest deficit reframe, no faked timeline | unit | `npx vitest run shared/engine/roadmap.test.ts -t "negative savings"` | ❌ W0 | ⬜ pending |
| 06-01-01 | 06-02 | 1 | ROAD-03 | — | Pure/offline render | unit | `npx vitest run shared/engine/roadmap.test.ts -t "offline deterministic"` | ❌ W0 | ⬜ pending |
| 06-01-01 | 06-02 | 1 | ROAD-02 / D-05 | T-enrich-tamper | Enrich preserves authored label/sourceUrl/order/count | unit | `npx vitest run shared/engine/roadmap.test.ts -t "enrich preserves authored"` | ❌ W0 | ⬜ pending |
| 06-01-01 | 06-03 | 2 | VISA-04 | T-UPL | UPL line + Premium teaser, no legal-advice phrasing | unit | `npx vitest run shared/engine/roadmap.test.ts -t "visa UPL"` | ❌ W0 | ⬜ pending |
| 06-04-04 (manual) | 06-04 | 3 | ROAD-03 (PDF) | — | Print CSS hides chrome; sections don't split | manual | browser print-preview (see Manual-Only below) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. "File Exists ❌ W0" = the test file is created in Wave 0 (Plan 01), not yet on disk at planning time.*

---

## Wave 0 Requirements

- [ ] `shared/engine/roadmap.test.ts` — RED tests covering ROAD-01/02/03 + D-02 + D-05 + D-07 + VISA-04
- [ ] Test fixtures: a covered persona (`citizenship: 'US'`, top city US + London/UK) and an uncovered pair; a negative-savings `MatchResult`
- [ ] No framework install needed (Vitest present)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Print CSS hides chrome; the 6 sections paginate without splitting | ROAD-03 (PDF) | Browser print-preview is not unit-testable | Open the Roadmap surface, trigger `window.print()`, confirm in print preview: nav/app chrome hidden, each of the 6 sections does not break mid-section, output is a clean PDF |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (7 RED tests in 06-01-01)
- [x] No watch-mode flags (`vitest run`, not watch)
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-05 (plan-checker verified Plan 01 authors the 7 canonical RED tests with matching `-t` names; the one manual-only item, PDF print preview, is a blocking human-verify checkpoint in Plan 04 Task 4). `wave_0_complete` flips true once Plan 01 executes.
