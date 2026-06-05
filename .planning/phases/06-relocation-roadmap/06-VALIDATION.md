---
phase: 6
slug: relocation-roadmap
status: draft
nyquist_compliant: false
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

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 0 | ROAD-01 | — | N/A | unit | `npx vitest run shared/engine/roadmap.test.ts -t "covered pair"` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | ROAD-01 | — | N/A | unit | `npx vitest run shared/engine/roadmap.test.ts -t "threads numbers"` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | ROAD-01 / D-07 | — | N/A | unit | `npx vitest run shared/engine/roadmap.test.ts -t "fallback"` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | ROAD-01 / D-02 | — | Honest deficit reframe, no faked timeline | unit | `npx vitest run shared/engine/roadmap.test.ts -t "negative savings"` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | ROAD-03 | — | Pure/offline render | unit | `npx vitest run shared/engine/roadmap.test.ts -t "offline deterministic"` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | ROAD-02 / D-05 | T-enrich-tamper | Enrich preserves authored label/sourceUrl/order/count | unit | `npx vitest run shared/engine/roadmap.test.ts -t "enrich preserves authored"` | ❌ W0 | ⬜ pending |
| TBD | TBD | 0 | VISA-04 | T-UPL | UPL line + Premium teaser, no legal-advice phrasing | unit | `npx vitest run shared/engine/roadmap.test.ts -t "visa UPL"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. Task IDs assigned once PLAN.md files are written.*

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
