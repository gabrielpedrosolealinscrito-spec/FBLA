---
phase: 11
slug: deep-profile-expand-the-quiz-with-sourced-life-area-categori
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-02
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Phase 11 ships pure TS logic + a markdown spec — no UI, no network, no DB.
> Validation is unit-level over the quiz-engine extensions, with the Phase 3
> engine suite (`shared/engine/`) acting as the additive-contract regression guard.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run shared/quiz-engine/personality.test.ts shared/quiz-engine/category-modules.test.ts` |
| **Full suite command** | `npx vitest run shared/engine/ shared/quiz-engine/personality.test.ts shared/quiz-engine/category-modules.test.ts && npx tsc --noEmit` |
| **Estimated runtime** | ~15 seconds |

> **Why file-scoped (not `npx vitest run shared/quiz-engine/`):** Phase 2 is mid-TDD on
> this branch. Running the whole `shared/quiz-engine/` dir would collect Phase 11's RED
> scaffolds (and any absent-impl imports) before their implementation lands. Gate on the
> two named Phase 11 test files plus the `shared/engine/` regression guard only.

---

## Sampling Rate

- **After every task commit:** Run quick run command (file-scoped Phase 11 tests)
- **After every plan wave:** Run full suite command (Phase 11 tests + engine regression + tsc)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | MATCH-05 | T-11-01 | Additive Profile/City compile under strict:true; no fixture breakage | unit | `npx tsc --noEmit && npx vitest run shared/engine/` | ✅ | ⬜ pending |
| 11-01-02 | 01 | 1 | QUIZ-06/07/08/09 | — | Shared answer-key constants single-sourced | unit | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 11-01-03 | 01 | 1 | QUIZ-06/09 | — | RED scaffolds file-scoped, import no absent Phase-2 module | unit | file-existence + `grep -c "tension.js"` guard | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 2 | QUIZ-06 | T-11-02 | Trait answers never increment category tallies | unit | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 11-02-02 | 02 | 2 | QUIZ-06/09, MATCH-05 | T-11-02 | synthesizeCategoryWeights returns finite weight for every category; malformed answers → neutral default, never NaN/throw | unit | `npx vitest run shared/quiz-engine/personality.test.ts && npx tsc --noEmit && npx vitest run shared/engine/` | ❌ W0 | ⬜ pending |
| 11-03-01 | 03 | 2 | QUIZ-07/08 | T-11-03 | Module showIf reads only earlier-owned answer keys | unit | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 11-03-02 | 03 | 2 | QUIZ-07/08/09 | T-11-03 | Skipped module never breaks synthesis; Tier-3 absent | unit | `npx vitest run shared/quiz-engine/category-modules.test.ts && npx tsc --noEmit && npx vitest run shared/engine/` | ❌ W0 | ⬜ pending |
| 11-04-01 | 04 | 3 | QUIZ-06/07/08/09, MATCH-05 | T-11-04 | ALL_QUESTIONS append-only; no other Phase-2 logic touched | unit | `npx tsc --noEmit && npx vitest run shared/quiz-engine/personality.test.ts shared/quiz-engine/category-modules.test.ts shared/engine/` | ❌ W0 | ⬜ pending |
| 11-04-02 | 04 | 3 | QUIZ-06, MATCH-05 | — | UI spec carries Phase-12 clamp/BASE_SCORE recalibration as named hard requirement | doc | grep-based existence gate on 11-UI-SPEC.md | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*File Exists: ❌ W0 = the target test file is a Wave-0 RED scaffold (created in 11-01-03) that goes green once its implementation task lands.*

---

## Wave 0 Requirements

- [ ] `shared/quiz-engine/personality.test.ts` — RED scaffold for `detectPersonalityTension`, `synthesizeCategoryWeights`, neutral-skip (QUIZ-06, QUIZ-09); created in 11-01-03, goes green in 11-02
- [ ] `shared/quiz-engine/category-modules.test.ts` — RED scaffold for module `showIf` + module-presence (QUIZ-07, QUIZ-08); created in 11-01-03, goes green in 11-03
- Vitest is already installed (used by Phase 3 `shared/engine/` suite) — no framework install needed.

*These two scaffolds are excluded from any whole-`shared/quiz-engine/` green gate until their impl lands (staggered-green discipline inherited from Phase 2's `tension.test.ts`).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `11-UI-SPEC.md` reads as a complete, collaborator-usable contract+render spec in the gold-cinematic visual language | QUIZ-06, MATCH-05 | Document quality (clarity, completeness, fidelity to the established visual language) is not unit-testable | Read 11-UI-SPEC.md end-to-end; confirm it documents the contract (getVisibleQuestions → QuestionDef[] → synthesizeProfile + synthesizeCategoryWeights; detectTension), the explainability surface, and the Phase-12 clamp/BASE_SCORE + D-02 open items |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
