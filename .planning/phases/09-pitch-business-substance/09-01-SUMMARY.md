---
phase: 09-pitch-business-substance
plan: "01"
subsystem: pitch
tags: [market-research, pitch, fbla, documentation]
dependency_graph:
  requires: []
  provides: [pitch/market-research.md]
  affects: [pitch/README.md]
tech_stack:
  added: []
  patterns: [hybrid-format, bottom-up-market-sizing, claim-number-source-tables]
key_files:
  created: []
  modified:
    - pitch/market-research.md
decisions:
  - "Teleport→Topia exit narrative leads the competitive section (not a table footnote) per D-14 and Pitfall 5"
  - "International migration-interest % omitted as a stated percentage — only MBO Partners 17M digital nomad figure used; F1 marker placed in both problem and international sections"
  - "SOM formula exposed verbatim (SAM × 3yr × 1% = 60K paid conversions) so judges can re-derive in 60 seconds"
  - "Macro '$X billion industry' figure explicitly excluded; bottom-up derivation is the entire market-sizing argument"
  - "Both Task 1 and Task 2 executed as a single document write since they modify the same file"
metrics:
  duration: "2 minutes"
  completed: "2026-05-31"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 9 Plan 01: Market Research & Problem Summary

**One-liner:** Bottom-up TAM→SAM→SOM using Census CPS/ACS data + Teleport→Topia competitive exit narrative leading the competitive section, all claims sourced or founder-flagged.

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Author problem statement + bottom-up TAM→SAM→SOM (PITCH-01) | 69f9084 | pitch/market-research.md |
| 2 | Author competitive positioning + three differentiators (PITCH-02, PITCH-03) | 69f9084 | pitch/market-research.md |

*(Tasks 1 and 2 were authored in a single document pass since both modify the same file; committed atomically.)*

---

## What Was Built

`pitch/market-research.md` is a fully authored FBLA-rubric deliverable covering:

**Problem section:** Narrative framing of the fragmented status quo (Numbeo + Reddit + guesswork), target user (22–35, mobile, digital-first), and quantified mobility data. Table includes Census mobility rate (16–18% for 25–34), Pew smartphone stat (99% for 18–34), MBO Partners digital nomad figure (17M), and F1 founder-verify flag for the international migration percentage.

**Market sizing — TAM → SAM → SOM (all bottom-up):**
- TAM: ~11M cross-county/state movers/yr (Census CPS Geographic Mobility, census.gov)
- SAM: ~2M/yr in 22–35 digital-first segment (Census ACS B01001 + CPS historic mobility rates + Pew) — labeled [ASSUMED] arithmetic
- SOM: 1% of 6M cumulative (3-yr) = 60,000 paid conversions → ~$600K–$720K 3-yr revenue at blended $10–$12/user; Truity (35M+ users) as primary analog, 16Personalities (100M+ test-takers) as fallback

**Competitive section:** Teleport→Topia exit LEADS the narrative as required. Competitor table covers Nomad List, WhereNext, Teleport→Topia, Numbeo, SmartAsset, Niche.com — each with what-it-does + what-it-cannot-do + source. Three differentiators (live-AI layer / Plus, personalized roadmap / Plus, immigration concierge / Premium) in a dedicated table.

**Sources section:** 13 URLs enumerated for the scored rubric row.

---

## Verification Results

| Check | Result |
|-------|--------|
| `grep -cE "census\.gov" pitch/market-research.md >= 1` | PASS (9 matches) |
| `grep -ciE "topia\|teleport" pitch/market-research.md >= 1` | PASS (4 matches) |
| Macro "$X billion" figure present without bottom-up derivation | PASS (none found; explicit statement that no macro figure is used) |
| F1 marker present (international migration %) | PASS (lines 19, 62, 128) |
| F2 marker present (exact Census year) | PASS (line 34) |
| F6 marker present (WhereNext pricing) | PASS (line 99) |
| Teleport leads competitive narrative (not only a table row) | PASS (narrative para at line 92 leads Section 3) |
| Three differentiators tier-tagged (Plus/Plus/Premium) | PASS (lines 111–113) |
| Sources section enumerates all URLs | PASS (13 rows: census.gov, pew, mbopartners, gallup, truity, 16personalities, firstpagesage, topia.com, getwherenext.com, nomads.com, niche.com) |

---

## Deviations from Plan

None. Plan executed exactly as written.

Both tasks modified the same file (`pitch/market-research.md`) and were combined into a single document authoring pass and commit — this is expected since Task 2 appends/replaces the competitive section on the same file that Task 1 authored.

---

## Known Stubs

None that prevent the plan's goal. The three founder-verify flags (F1, F2, F6) are intentional and visible:
- **F1:** International migration-interest percentage — no verified primary Gallup/Pew figure available; MBO Partners nomad count used as proxy. Founder must pull citable % before pitch.
- **F2:** Exact Census CPS year and mover count — founder must pull specific table year from census.gov before pitch (data updates annually).
- **F6:** WhereNext pricing tiers ($15/$29/$49/$79) — confirmed May 2026; founder must re-verify within 30 days of pitch.

---

## Threat Surface Scan

No security-relevant surface introduced. This is a markdown documentation deliverable with no executable code, no network endpoints, no auth paths, no schema changes. Pitch-defensibility threats (T-09-01-A through T-09-01-D) all mitigated:
- T-09-01-A (unsourced number): Every numeric row has a source cell or F-flag.
- T-09-01-B (macro TAM figure): No macro figure; explicit bottom-up only.
- T-09-01-C (low-confidence international %): F1-flagged, not stated as fact.
- T-09-01-D (Teleport exit underused): Teleport exit leads Section 3 narrative.

## Self-Check: PASSED

- `pitch/market-research.md` exists and has 134 net new lines (confirmed by git diff)
- Commit `69f9084` exists in git log
- All grep acceptance criteria pass (verified above)
