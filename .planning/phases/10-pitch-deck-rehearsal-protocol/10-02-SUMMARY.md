---
phase: 10-pitch-deck-rehearsal-protocol
plan: 02
subsystem: pitch
tags: [qa-bank, pitch, fbla, competition, content-authoring]
dependency_graph:
  requires: [pitch/market-research.md, pitch/business-model.md, pitch/financials/summary.md, pitch/financials/model.csv, .planning/REQUIREMENTS.md]
  provides: [pitch/qa-bank.md]
  affects: []
tech_stack:
  added: []
  patterns: [source-tag-only attribution (D-02), domain routing by presenter (D-07/D-09), talking-point format (not word-for-word script)]
key_files:
  created: [pitch/qa-bank.md]
  modified: []
decisions:
  - "20 questions (6 mandated + 14 rubric-gap) authored in one file — the PITCH-08 Q&A deliverable"
  - "Q3 (legal advice) and Q6 (Teleport) given 4-bullet airtight treatment per highest-stakes designation in 10-CONTEXT.md Specifics"
  - "Routing Summary table added at end of bank — bank now doubles as the D-07 routing system"
  - "Founder-verify markers F4, F5, F7 carried inline exactly as they appear in Phase 9 source docs"
  - "Financial figures (Year-1 ~$9,500, Month-12 Cumulative_Net +$7,965, break-even Month 4) pulled directly from model.csv values in financials/summary.md break-even table"
metrics:
  duration: "~25 minutes"
  completed: "2026-05-31"
  tasks_completed: 2
  files_created: 1
  files_modified: 0
---

# Phase 10 Plan 02: Q&A Bank (PITCH-08) Summary

**One-liner:** 20-question Q&A bank with domain routing (Luke/Gabriel), 2-4 source-tagged talking-point bullets per entry, and a routing-summary table — covering all 6 D-06 mandated topics plus 14 rubric-gap questions derived from the 120-point rubric.

---

## What Was Built

`pitch/qa-bank.md` — the PITCH-08 deliverable. A 284-line, 20-question bank authored entirely from Phase 9 source documents (`pitch/market-research.md`, `pitch/business-model.md`, `pitch/financials/summary.md`, `pitch/financials/model.csv`, `.planning/REQUIREMENTS.md`).

### Mandated Topics (D-06) — All 6 Present

| Q# | Topic | Routed to | Notes |
|----|-------|-----------|-------|
| Q1 | Data Accuracy | Gabriel | 4 bullets covering BLS/HUD/Numbeo sourcing and official visa sources |
| Q2 | CAC/LTV Defense | Gabriel | 4 bullets; F7 marker carried inline |
| Q3 | Legal Advice Avoidance | Gabriel | 4 airtight bullets; "inform and refer" framing; Gabriel's lived F-1/OPT/O-1A expertise |
| Q4 | Competitive Moat | Luke | 3 bullets; three moats named explicitly |
| Q5 | API Failure Resilience | Gabriel | 4 bullets; two-path architecture explained |
| Q6 | Teleport Rebuttal | Luke | 4 airtight bullets; acquisition-not-failure framing; action-layer differentiator |

### Rubric-Gap Questions (Q7-Q20) — 14 Additional

Q7 (market sizing), Q8 (why one-time pricing), Q9 (why $0.99), Q10 (first 1,000 users), Q11 (Year-1 revenue), Q12 (profitability timeline), Q13 (visa content accuracy), Q14 (why not free), Q15 (two-person presentation), Q16 (demo failure contingency), Q17 (TAM credibility), Q18 (startup cost credibility), Q19 (regulatory risk), Q20 (how does this scale).

### Key Verification Results

```
grep -c '^### Q' pitch/qa-bank.md  → 21 (20 questions + 1 routing table subheader)
grep -c 'Routed to:' pitch/qa-bank.md  → 21
grep -c 'SOURCE:.*financials' pitch/qa-bank.md  → 17
grep -c 'SOURCE:.*business-model' pitch/qa-bank.md  → 15
grep -q 'Routing Summary' pitch/qa-bank.md  → YES
wc -l pitch/qa-bank.md  → 284 (> 150 minimum)
```

---

## Commits

| Task | Commit | Files | Description |
|------|--------|-------|-------------|
| Tasks 1+2 | `589f49d` | `pitch/qa-bank.md` | Full 20-question Q&A bank (Q1-Q6 mandated + Q7-Q20 rubric-gap + routing summary table) |

---

## Deviations from Plan

None — plan executed exactly as written. Both tasks (Q1-Q6 and Q7-Q20 + routing table) were authored in one file creation since the per-task content divisions were additive to the same file. All mandated topics, routing labels, source tags, and founder-verify markers are present as specified.

---

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes were introduced. This plan produced a Markdown content document only. T-10-03 (quantitative claim integrity) and T-10-04 (UPL/legal advice boundary) from the plan's threat register are addressed:
- T-10-03: Every quantitative bullet in the bank carries a [SOURCE:] tag
- T-10-04: Q3 explicitly frames "inform and refer, never practice law" + attorney-referral CTA

---

## Known Stubs

None — all source tags point to authored Phase 9 documents that exist in the repo. No placeholder text, no hardcoded empty values. Founder-verify markers (F4, F5, F7) are open flags inherited from Phase 9, not stubs introduced here; they are carried inline exactly as designed.

---

## Self-Check: PASSED

- [x] `pitch/qa-bank.md` exists (confirmed at `$WT_ROOT/pitch/qa-bank.md`)
- [x] Commit `589f49d` exists (confirmed via `git log --oneline -3`)
- [x] `grep -c '^### Q' pitch/qa-bank.md` returns 21 (>= 20)
- [x] "Routing Summary" section present
- [x] All 6 mandated topics in Q1-Q6 with correct routing
- [x] Q3 and Q6 each have 4 airtight bullets
- [x] Founder-verify markers F4, F5, F7 carried inline
- [x] Financial figures (Year-1 ~$9,500, Month-12 +$7,965, break-even Month 4) cited to model.csv
