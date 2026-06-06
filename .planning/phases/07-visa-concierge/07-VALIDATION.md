---
phase: 7
slug: visa-concierge
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-05
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.8 |
| **Config file** | vite.config.js (inline `test:` block) |
| **Quick run command** | `npm test` (vitest run) |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` + `npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green AND `checkpoint:human-verify` visa-figures check passed
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-engine | engine | 1 | VISA-01 | — | `selectVisaPathways` returns BOTH D8 + Canada EE for US citizen | unit | `npm test` | ❌ W0 | ⬜ pending |
| 07-engine | engine | 1 | VISA-01 | — | Generic honest skeleton returned for unlisted citizenship (no authored flagships) | unit | `npm test` | ❌ W0 | ⬜ pending |
| 07-engine | engine | 1 | VISA-01 | — | `matchedCountry` does not filter results — both pathways returned for any matched city | unit | `npm test` | ❌ W0 | ⬜ pending |
| 07-engine | engine | 1 | VISA-01 | — | `gradeD8`: Strong fit when hasRemote=true AND income≥threshold | unit | `npm test` | ❌ W0 | ⬜ pending |
| 07-engine | engine | 1 | VISA-01 | — | `gradeD8`: Long shot when hasRemote=false | unit | `npm test` | ❌ W0 | ⬜ pending |
| 07-engine | engine | 1 | VISA-01 | — | `gradeExpressEntry`: Strong fit for age≤35 + post-secondary | unit | `npm test` | ❌ W0 | ⬜ pending |
| 07-data | data | 1 | VISA-02 | — | `VisaPathway` objects satisfy `shared/types.ts` interface | type-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 07-data | data | 1 | VISA-03 | — | Every authored figure has `officialSources[]` non-empty + "data as of" date | unit | `npm test` | ❌ W0 | ⬜ pending |
| 07-ui | ui | 3 | VISA-04 | — | `Visa.jsx` renders "not legal advice" disclaimer banner + attorney CTA | manual | n/a (browser) | ❌ W3 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `shared/engine/visa.test.ts` — RED tests for VISA-01 `selectVisaPathways` + graded-fit (`gradeD8`, `gradeExpressEntry`) + skeleton fallback + non-filtering invariant
- [ ] `shared/engine/visa.ts` — stub so tests compile (all tests start RED)
- [ ] `checkpoint:human-verify` — verify Portugal D8 figures at AIMA / vistos.mne.gov.pt and Canada Express Entry figures at IRCC before green-lighting authored content (all figures currently MEDIUM confidence)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Disclaimer banner + attorney-referral CTA visible on all immigration content | VISA-04 | Rendered JSX / visual placement; not unit-assertable | Open the Visa screen, confirm the "not legal advice — consult a licensed immigration attorney" disclaimer and the attorney-referral CTA are visible above/around the pathway comparison |
| Side-by-side comparison renders as true columns (not stacked cards) on laptop-width screen | VISA-02 | Responsive visual layout | Open Visa screen at demo laptop width; confirm Portugal D8 + Canada EE render side-by-side with graded fit badge per column |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
