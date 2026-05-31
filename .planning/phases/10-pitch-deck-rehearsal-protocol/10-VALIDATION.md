---
phase: 10
slug: pitch-deck-rehearsal-protocol
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-31
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

This is a **content-authoring** phase (pitch deck outline + speaker notes, Q&A bank, protocol checklist). No application code is produced, so there is **no automated test framework**. Validation is human review + checklist verification against the authored Markdown artifacts and the competition rubric/protocol. Sampling is per-artifact (run the review checks the moment each artifact is authored) rather than per-test-run.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — content phase (manual + checklist verification) |
| **Config file** | none |
| **Quick run command** | `grep`/manual scan of authored artifact (see Per-Task Verification Map) |
| **Full suite command** | Verbal run-through of every artifact against the competition PDF rubric + protocol list |
| **Estimated runtime** | ~5 min per artifact review |

---

## Sampling Rate

- **After every task commit:** Run the grep/count check for that artifact (source-tag scan, entry count, checklist completeness).
- **After every plan wave:** Re-read the artifact end-to-end against its requirement (PITCH-07/08/09).
- **Before `/gsd-verify-work`:** All author-now artifacts complete and self-consistent; founder-verify flags (F1–F7) surfaced as open risks.
- **Max feedback latency:** authored artifact is checkable immediately (no build step).

---

## Per-Task Verification Map

> Plans not yet written — this map is seeded from the RESEARCH.md Validation Architecture and will be finalized against the actual task IDs after planning.

| Check | Requirement | Verification | Automated Command | Status |
|-------|-------------|--------------|-------------------|--------|
| Every deck claim bullet carries a `[SOURCE:]` tag | PITCH-07 | Scan deck-outline.md; zero claim bullets without a source tag | `grep -n 'claim' pitch/deck/deck-outline.md` then visual scan for `[SOURCE:]` | ⬜ pending |
| Per-slide timing targets sum to ~6:00 business arc (≤10:00 hard cap incl. demo) | PITCH-07 | Sum the per-slide target column | manual sum of target column | ⬜ pending |
| Q&A bank has ≥15 entries (target 20) | PITCH-08 | Count entries in qa-bank.md | `grep -c '^### Q' pitch/qa-bank.md` | ⬜ pending |
| 6 mandated Q&A topics present | PITCH-08 | Verify data-accuracy, CAC/LTV, legal-advice avoidance, competitive moat, API-failure resilience, Teleport rebuttal each have an entry | visual scan by topic name | ⬜ pending |
| Protocol checklist items all present, none skipped | PITCH-09 | Every protocol rule from the competition PDF appears as a checkbox | visual scan vs. competition PDF | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] None — no test framework to install. Source material (Phase 9 `pitch/` docs) already exists in the repo.

*Existing repo content covers all source-of-truth inputs for this phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Every quantitative claim is audibly attributable | PITCH-07 | "Audible" is a delivery property, not a file property — can only be confirmed by a presenter speaking it | At rehearsal: each claim bullet's `[SOURCE:]` tag must be spoken aloud (e.g., "According to the US Census Bureau…") |
| Three timed run-throughs land 8:30–9:00 on a phone hotspot | PITCH-07 (timing), ROADMAP success criterion 3 | Requires the live demo (Phase 8) + a stopwatch + a phone hotspot — physical/temporal | **Gated on Phase 8.** Solo + paired timed runs; record each clock time; mock-judge Q&A drill; hotspot kill test |
| Q&A answers are fluent, not read | PITCH-08 | Fluency under pressure can only be checked by speaking under mock-judge questioning | Mock-judge drills the full bank aloud; flag any answer that fumbles for a per-slide script revisit |
| Zero protocol violations | PITCH-09 | Protocol is a physical/behavioral state (no QR on screen, ≤2 devices, on battery, nothing left with judges, dress code) | Walk the checklist verbally against the actual device setup at rehearsal |
| Founder-verify flags F1–F7 cleared | PITCH-07 (claim accuracy) | Requires re-checking live external sources (pricing pages, gov figures) close to pitch day | Re-verify each flag; F3 (Anthropic pricing) within 2 weeks of pitch, F4 (16Personalities) if >30 days since May 2026 check |

---

## Validation Sign-Off

- [ ] Every deck claim bullet has a `[SOURCE:]` tag (PITCH-07)
- [ ] Q&A bank ≥15 entries with all 6 mandated topics (PITCH-08)
- [ ] Protocol checklist mirrors every rule in the competition PDF (PITCH-09)
- [ ] Rehearse-later task list is fully specified and executable the moment Phase 8 completes
- [ ] Founder-verify flags F1–F7 surfaced as open risks for pitch-day accuracy
- [ ] `nyquist_compliant: true` set in frontmatter once the above are confirmed at plan-check

**Approval:** pending
