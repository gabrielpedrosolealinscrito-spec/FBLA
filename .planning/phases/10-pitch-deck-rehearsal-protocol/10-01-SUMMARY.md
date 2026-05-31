---
phase: 10-pitch-deck-rehearsal-protocol
plan: "01"
subsystem: pitch
tags: [pitch-deck, speaker-notes, source-tags, timing, handoff-cues, founder-verify]
dependency_graph:
  requires:
    - pitch/market-research.md
    - pitch/business-model.md
    - pitch/financials/summary.md
    - pitch/financials/model.csv
  provides:
    - pitch/deck/deck-outline.md
  affects: []
tech_stack:
  added: []
  patterns:
    - per-slide schema (Speaker / Target time / Headline / Key visuals / Claim bullets / Speaker notes / Source-attribution cue)
    - source-tag-only attribution on every quantitative claim bullet
    - floating demo slot with compressible/target/expandable timing
    - Luke/Gabriel speaker labels with explicit [HANDOFF CUE:] inline markers
key_files:
  created:
    - pitch/deck/deck-outline.md
  modified: []
decisions:
  - Floating demo slot (Slide 7) carries compressible 1:30 / target 2:30 / expandable 3:00 timing with an 8:00-on-clock hard-cut rule
  - F1 inline marker added to Slide 3 international-migration bullet alongside the sourced 17M digital-nomads figure
  - Slide 13 (Sources) is a backup-only slide not part of the narrated arc — it lists all citations for judge reference
metrics:
  duration: "~20min"
  completed: "2026-05-31T12:28:08Z"
  tasks_completed: 2
  files_created: 1
  files_modified: 0
---

# Phase 10 Plan 01: Pitch Deck Outline Summary

## One-liner

13-slide deck outline with per-slide schema, source-tagged claim bullets, Luke/Gabriel speaker labels and handoff cues, floating demo slot, sub-timing table proving ~6:00 business arc, and F1–F7 founder-verify risk table.

## What Was Built

`pitch/deck/deck-outline.md` — the source-of-truth content layer for the Canva deck build. Covers all 12–14 content slides following the fixed narrative arc (Problem → Market → Solution → Differentiation → Demo → Business Model → Financials → Marketing → Ask) plus a backup Sources slide, a Sub-Timing Table, and a Founder-Verify Flags risk table.

### Task 1 (Slides 1–7)

- Slide 1: Title + team (Luke, 0:15)
- Slide 2: Problem — fragmented tools, ~16–18%/year mobility rate, target user 22–35 (Luke, 0:45)
- Slide 3: Market Opportunity — TAM 11M / SAM ~2M derivation / SOM 60K at 1% penetration / 17M digital nomads; F1 and F2 founder-verify markers inline (Luke, 1:00)
- Slide 4: Competitive Landscape — Nomad List, WhereNext, Teleport-to-Topia exit narrative; F6 inline (Luke, 0:45)
- Slide 5: Solution + Value Prop — transformation before/after frame; four pricing tiers (Luke, 0:45)
- Slide 6: Three Differentiators — live-AI, roadmap, visa concierge with [LUKE → GABRIEL] explicit handoff cue (Luke → Gabriel, 0:45)
- Slide 7: Demo [FLOATING SLOT] — compressible 1:30 / target 2:30 / expandable 3:00; 8:00 hard-cut rule and golden-path fallback cue in speaker notes (Gabriel assumed, floating)

### Task 2 (Slides 8–13 + Closing Sections)

- Slide 8: Business Model + Pricing — Free / Basic $0.99 / Plus $9.99 ("most popular") / Premium $29.99; 16Personalities analog with F4 HIGH flag (Luke, 0:45)
- Slide 9: Financials Model + Unit Economics — break-even Month 4 (Cumulative_Net +$9.68 from model.csv), API COGS ~$0.06/run ~98% margin, $1,000 startup, 24-month chart; F3 HIGH flag (Gabriel, 1:00)
- Slide 10: Financials Break-Even + LTV:CAC — blended CAC ~$8–$12, LTV by tier, Gabriel's "1.4:1 ratio is intentional" speaker note; F7 inline; [GABRIEL → LUKE] handoff cue (Gabriel, 0:30)
- Slide 11: Marketing + Channels — four named channels with per-channel CAC + Reddit member counts with F5 inline (Luke, 0:45)
- Slide 12: The Ask + Vision — specific ask, close on eye contact (Luke, 0:30)
- Slide 13: Sources — backup only, not narrated; full citation list for judge reference
- Sub-Timing Table: business-arc target column sums to ~6:00; combined envelope with 2:30 demo = ~8:30; cut rule documented; financials never-rush note
- Founder-Verify Flags table: F1–F7, slide references, priority ratings (F3 and F4 **HIGH**), risk-mitigation rule

## Verification Results

| Check | Result |
|-------|--------|
| `grep -c '^## Slide'` returns >= 12 | 13 slides — PASS |
| Every quantitative claim bullet carries [SOURCE:] tag | 37 SOURCE tags total — PASS (visual scan: all claim bullets in slides 2–12 are tagged) |
| Sub-Timing Table present with ~6:00 business arc total | PASS |
| Sub-timing combined envelope note: demo + arc = ~8:30 within ≤10:00 cap | PASS |
| Founder-Verify Flags table with F1–F7 | PASS |
| F3 and F4 marked HIGH | PASS |
| Every slide has Speaker label | 13/13 — PASS |
| Slide 6 has [LUKE → GABRIEL] handoff cue | PASS |
| Slide 7 marked FLOATING SLOT with 1:30/2:30/3:00 and 8:00 hard-cut rule | PASS |
| F1 inline on Slide 3 | PASS |
| F2 inline on Slide 3 | PASS |
| F3 inline on Slide 9 | PASS |
| F4 inline on Slide 8 | PASS |
| F5 inline on Slide 11 | PASS |
| F6 inline on Slide 4 | PASS |
| F7 inline on Slide 10 | PASS |

## Deviations from Plan

### Auto-added: F1 inline marker on Slide 3

**Found during:** Task 2 acceptance-criteria scan
**Issue:** F1 (international migration-interest %) was present in the Founder-Verify Flags closing table but not inline on the Slide 3 claim bullet that the plan required it on.
**Fix:** Added a dedicated Slide 3 bullet for the international migration-interest % with inline [FOUNDER-VERIFY: F1] marker and an explicit "if not verified by pitch day, use 17M digital-nomads figure instead" fallback note.
**Files modified:** pitch/deck/deck-outline.md
**Rule:** Rule 2 — auto-added missing correctness requirement (threat model T-10-02 requires inline flag surface)

No other deviations — plan executed as written.

## Known Stubs

- `Luke [Last Name]` and `Gabriel [Last Name]` on Slide 1 are intentional presenters-fill-in placeholders — the team knows their own names; these are not data stubs preventing the plan's goal.
- Demo golden-path script bullet points on Slide 7 are placeholders ("profile inputs → city results → Plus unlock → ...") — the specific golden-path content is authored when Phase 8 (live demo) is complete. This is the documented rehearse-later split and does not prevent PITCH-07 completion.

## Threat Flags

No new threat surface introduced. This plan produces a Markdown content document only. The two threat model items (T-10-01 claim integrity, T-10-02 stale data) are mitigated: every numeric claim bullet carries a [SOURCE:] tag, and every open founder-verify flag is surfaced inline on the affected slide and in the dedicated risk table.

## Self-Check: PASSED

- `pitch/deck/deck-outline.md` exists and contains 13 slide headings (verified)
- Task 1 commit: ecf4ffc
- Task 2 commit: d5f2972
- Both commits verified in git log
