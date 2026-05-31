---
phase: 10-pitch-deck-rehearsal-protocol
reviewed: 2026-05-31T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - pitch/deck/deck-outline.md
  - pitch/qa-bank.md
  - pitch/protocol-checklist.md
findings:
  critical: 2
  warning: 2
  info: 1
  total: 5
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-31
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

All three content deliverables are well-structured and internally consistent on most claims: competition figures, sourcing discipline, LTV/CAC figures, API COGS arithmetic, SOM derivation, Teleport acquisition narrative, and 16Personalities analog are all coherent across documents. The Founder-Verify flags (F1–F7) are reproduced faithfully between deck-outline and protocol-checklist.

Two critical findings require correction before rehearsal and pitch day: the sub-timing table's business arc total is arithmetically wrong (7:45 actual vs. 6:00 stated), which cascades into a hard-cap breach at target demo length; and the "simple formula Month 3 break-even" claim contradicts Q10's own user count data. Both will be challenged by judges and will not survive a 60-second re-derivation by an attentive judge.

---

## Critical Issues

### CR-01: Business Arc Timing Total Is Arithmetically Wrong — Hard Cap Breach at Target Demo Length

**File:** `pitch/deck/deck-outline.md` (Sub-Timing Table, line 383; header time targets, line 6)

**Issue:** The sub-timing table states "Business arc total ~6:00" and "Compressed ~4:35", but the individual slide target times in that same table sum to **7:45** (standard) and **5:15** (compressed):

| Slide | Target | Compressed |
|-------|--------|------------|
| 1 | 0:15 | 0:10 |
| 2 | 0:45 | 0:30 |
| 3 | 1:00 | 0:45 |
| 4 | 0:45 | 0:30 |
| 5 | 0:45 | 0:30 |
| 6 | 0:45 | 0:30 |
| 8 | 0:45 | 0:30 |
| 9–10 | 1:30 | 1:00 |
| 11 | 0:45 | 0:30 |
| 12 | 0:30 | 0:20 |
| **Total** | **7:45** | **5:15** |

The header line derives the rehearsal target directly from the wrong total: "Business arc (~6:00) + Demo target (2:30) = ~8:30." With the real business arc of 7:45, the target demo (2:30) produces **10:15 total — 15 seconds over the 10:00 hard cap**. The expandable demo (3:00) produces 10:45. Only the compressed demo (1:30) keeps the total at 9:15, which is safe.

The compressed total discrepancy (5:15 vs. stated 4:35) is a secondary inconsistency from the same arithmetic error.

**Impact on rehearsal:** The rehearsal "target band 8:30–9:00" is calibrated from the wrong baseline. If presenters rehearse to 8:30–9:00 believing the target demo (2:30) fits, they will enter competition having practiced a pitch that runs 10:15 in real execution — and the hard cap disqualifies over-time presentations.

**Fix:** Correct the Sub-Timing Table bottom row to reflect actual sums:

```
| **Business arc total** | **11 slides** | | **~7:45** | **~5:15** | |
```

Then update the envelope section:

```
Business arc (~7:45) + Demo target (2:30) = ~10:15 — EXCEEDS hard cap.
Maximum allowable demo length = 2:15 (to hit exactly 10:00).
Target demo should be revised to 1:30–2:00 (giving rehearsal band 9:15–9:45).
At compressed demo (1:30): ~9:15 total. At compressed BA + demo (1:30): ~6:45.
Hard cap ≤10:00 requires demo ≤2:15 in all scenarios.
```

The individual per-slide target times are not in dispute — they look reasonable. The error is in the summary row. Updating the summary row and the envelope description is the full fix.

---

### CR-02: Simple Formula Break-Even Stated as Month 3 — Contradicted by Month-3 User Count in Q&A Bank

**File:** `pitch/deck/deck-outline.md` (Slide 9, line 239; speaker notes, line 246) — contradicted by `pitch/qa-bank.md` (Q10, line 135; Q12, line 157)

**Issue:** Slide 9 states two break-even paths:
- Full model: Month 4 (Cumulative_Net = +$9.68)
- Simple formula: Month 3 ($1,000 ÷ ~$9 net per paid user = 112 users needed)

The speaker notes reinforce this: "The simple recovery formula is even faster — $1,000 divided by $9 net per paid user equals 112 users. We hit that in Month 3."

But Q10 (qa-bank.md, line 135) states: "The financial model shows Month 3 = **105 paid users** at 5% conversion on 900 cumulative free users." And Q12 (line 157) confirms: "cumulative paid users reach **160 at Month 4**."

Arithmetic: 105 paid users at Month 3 × ~$9 net = ~$945 recovered — the $1,000 startup cost is **not recovered in Month 3**. The simple formula also resolves to Month 4 (160 users × $9 = $1,440 recovered). The "Month 3" claim in the deck is wrong.

**Impact:** A judge who asks Gabriel to walk through the simple formula will hear "112 users, we hit that in Month 3," then in Q10 will hear "Month 3 = 105 paid users." The internal contradiction is self-inflicted and damages credibility on the financials — which Q&A routing identifies as Gabriel's core defense territory.

**Fix:** Correct Slide 9 claim bullet and speaker notes:

```
- Break-even: Month 4 on the full model (Cumulative_Net = +$9.68, per model.csv)
  Simple formula check: $1,000 startup ÷ ~$9 net per paid user = 112 users needed;
  cumulative paid users reach 160 at Month 4 — consistent with full model. [SOURCE: model.csv]
```

Correct speaker notes:

```
"The simple recovery formula confirms: $1,000 divided by $9 net per paid user equals
112 users. We reach that at Month 4 — consistent with the full model."
```

---

## Warnings

### WR-01: Q&A Bank Domain Routing Header Contradicts the Actual Routing Table

**File:** `pitch/qa-bank.md` (line 13–14)

**Issue:** The routing note in the header reads:

> "Domain routing: visa/legal-advice + demo/API-resilience → Gabriel. **Market/financials/CAC-LTV/Teleport** → Luke."

But the actual routing table and individual Q entries assign:
- Q2 (CAC/LTV Defense) → **Gabriel**
- Q11 (Year-1 Revenue Projection) → **Gabriel**
- Q12 (Profitability Timeline) → **Gabriel**

The header domain rule says "financials/CAC-LTV → Luke" but three questions on exactly those topics are routed to Gabriel. During rehearsal, a presenter reading the header will expect to own CAC/LTV and financials questions — then discover the individual entries route them to Gabriel. This is a rehearsal-time confusion risk, especially under mock-judge pressure.

The actual routing is correct (Gabriel presents Slides 9–10 and should own the Q&A territory those slides invite). The header description is the stale text.

**Fix:** Update the routing note header to accurately describe Gabriel's and Luke's actual Q&A domains:

```
Domain routing: visa/legal-advice + demo/API-resilience + financials/CAC-LTV/unit economics → Gabriel.
Market sizing/competitive narrative/pricing rationale/growth/scale → Luke.
Routing reflects primary expertise; both presenters rehearse all 20.
```

---

### WR-02: Slide 8 Handoff Cue References Wrong Slide Number ("Slide 11 Financials")

**File:** `pitch/deck/deck-outline.md` (Slide 8 speaker notes, line 220)

**Issue:** The handoff cue embedded in Slide 8's speaker notes reads:

> "[HANDOFF CUE at close of slide 11 financials, back-reference:] After Gabriel closes financials (Slide 10)..."

The cue label says "slide 11 financials" but Slide 11 is the Marketing slide (Luke's). The financials are Slides 9 and 10. The parenthetical in the same sentence correctly says "Slide 10" — so both the right and wrong slide number appear in the same note, which will cause confusion when Gabriel is reading it aloud in rehearsal.

The protocol-checklist (line 104) correctly identifies this handoff as "Slide 10 → Slide 11 (Gabriel → Luke)" with no conflict, confirming the cue label in deck-outline is the stale text.

**Fix:** Correct the cue label:

```
[HANDOFF CUE at close of Slide 10 (Financials — LTV:CAC):] After Gabriel closes financials (Slide 10),
[GABRIEL → LUKE] "The unit economics work. Now how do we reach those 2 million addressable users?"
→ [LUKE] takes slide control for Slide 11.
```

---

## Info

### IN-01: Break-Even Cumulative Net Value Is Rounded Inconsistently Across Documents

**File:** `pitch/qa-bank.md` (Q12, line 156) vs. `pitch/deck/deck-outline.md` (Slide 9, line 239)

**Issue:** The deck-outline cites the model.csv value precisely: "Cumulative_Net = +$9.68." The Q&A bank Q12 rounds this to "+$10." The rounding is harmless in isolation, but if Gabriel says "+$9.68" on Slide 9 and "+$10" in Q&A, a sharp judge may ask if these refer to the same figure. Aligning both to the model.csv value ($9.68) eliminates any ambiguity.

**Fix:** Update Q12 in qa-bank.md to use the exact figure:

```
Month 4: Cumulative_Net crosses to positive (+$9.68 per model.csv, the full model including
all ongoing marketing spend — not just recovery of the one-time startup cost) [SOURCE: pitch/financials/model.csv Month 4 row]
```

---

_Reviewed: 2026-05-31_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
