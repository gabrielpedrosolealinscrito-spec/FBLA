# `pitch/` — Pitch track (the business case the judges score)

**Owned by the pitch track.** This is where everything *except the code* lives — and it's where most of the competition points are. Four of the six scored content dimensions are business-plan substance, not app features.

```
pitch/
├── market-research.md     PITCH-01: problem + sized, cited market opportunity
├── business-model.md      PITCH-04: tiers, pricing, sales, distribution, revenue
├── financials/            PITCH-05: startup costs, unit economics, projections
├── deck/                  PITCH-07: slide assets / exports (slides built in Canva)
└── qa-bank.md             PITCH-08: anticipated questions + defensible answers
```

## Rubric → where it's answered (120 pts)

| Rubric dimension | Req | Lives in |
|------------------|-----|----------|
| Problem ID & Market Opportunity | PITCH-01 | `market-research.md` |
| Business Concept & Innovation | PITCH-02 | `market-research.md` (competitive positioning) |
| Value Proposition & Customer Benefit | PITCH-03 | `business-model.md` |
| Business Model (pricing/sales/distribution) | PITCH-04 | `business-model.md` |
| Feasibility & Financial Thinking | PITCH-05 | `financials/` |
| Marketing & Growth Strategy | PITCH-06 | `business-model.md` |
| Persuasiveness / Delivery / Confidence / Q&A | PITCH-07/08 | `deck/`, `qa-bank.md` |
| Sources cited (scored directly!) | all | every doc — cite every number |
| Protocol adherence | PITCH-09 | rehearsal checklist (Phase 10) |

## Head start — read these first
The research already did a lot of this work. Don't start from scratch:
- `.planning/research/FEATURES.md` — competitor map (Nomad List, WhereNext, **Teleport's exit to enterprise**), validated pricing analogs ($9/$29/$99 vs 16Personalities/Truity), full tier feature ladder, sources.
- `.planning/research/SUMMARY.md` — the pitch narrative + open questions.
- `.planning/research/competitors/16personalities/` — pricing/packaging teardown + source PDFs. The chosen monetization + free-locked-teaser analog; read `NOTES.md` first.
- `.planning/PROJECT.md` — the locked business decisions (freemium teaser, hybrid pricing, visa concierge moat).

## Non-negotiables
- **Cite every quantitative claim.** The Sources row is scored, and a fact-checkable wrong number can collapse the pitch in Q&A.
- **Verify visa figures against official government sources** (USCIS, IRCC, AIMA Portugal, BAMF) before they hit a slide. Secondary expat blogs are not pitch-citable.
- Slides are built in **Canva**; keep exports/screenshots here so the repo has the source of truth.

This is ROADMAP Phase 9 (business substance) + Phase 10 (deck, rehearsal, protocol).
