---
phase: 10-pitch-deck-rehearsal-protocol
verified: 2026-05-31T00:00:00Z
status: gaps_found
score: 7/10 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Per-slide timing targets for the eight business-arc sections sum to ~6:00; total stays <=10:00"
    status: failed
    reason: "The individual slide target times in the sub-timing table sum to 7:45, not the stated ~6:00. The deck header and summary row both read '~6:00' and '~8:30 combined envelope', but actual arithmetic: 0:15+0:45+1:00+0:45+0:45+0:45+0:45+1:30+0:45+0:30 = 7:45. At target demo (2:30), total = 10:15 — 15 seconds OVER the 10:00 hard cap. The '~6:00' label is arithmetically wrong; the sub-timing table's summary row and the document header both propagate this error."
    artifacts:
      - path: "pitch/deck/deck-outline.md"
        issue: "Line 6: header says 'Business arc (all non-demo slides) ~6:00 target'. Line 383: summary row says '~6:00 | ~4:35'. Both are wrong. Actual sum: 7:45 target / 5:15 compressed."
      - path: "pitch/deck/deck-outline.md"
        issue: "Line 387: combined envelope note says 'Business arc (~6:00) + Demo target (2:30) = ~8:30 — within the 8:30–9:00 rehearsal target band.' At the real 7:45 arc, target demo (2:30) gives 10:15, which breaches the hard cap."
    missing:
      - "Correct the sub-timing table summary row: '~7:45' target / '~5:15' compressed"
      - "Update the document header time-target line to reflect actual business arc (~7:45)"
      - "Update the combined envelope note: actual arc (7:45) + target demo (2:30) = 10:15, which exceeds the cap. Maximum allowable demo at target arc is 2:15. The rehearsal band must be recalibrated."

  - truth: "The speaker notes on Slide 9 state the simple-formula break-even is Month 3 — this contradicts Q10 in the Q&A bank (Month 3 = 105 paid users, below the 112-user threshold) and the Q12 entry which correctly says Month 4"
    status: failed
    reason: "Slide 9 speaker notes (line 246) say 'We hit that in Month 3.' Q10 (qa-bank.md line 135) states Month 3 = 105 paid users at 5% conversion. 105 < 112, so the $1,000 startup cost is NOT recovered in Month 3. Q12 (line 157) correctly states '160 at Month 4'. The claim bullet (line 239) also says 'Month 3 on the simple formula' — this is wrong. This is the CR-02 finding from 10-REVIEW.md, confirmed present in the file."
    artifacts:
      - path: "pitch/deck/deck-outline.md"
        issue: "Line 239: claim bullet states 'Month 3 on the simple formula ($1,000 startup ÷ ~$9 net per paid user = 112 users)'. Line 246: speaker notes say 'We hit that in Month 3.' Both are factually wrong."
    missing:
      - "Correct Slide 9 claim bullet: remove the Month 3 simple-formula path; state the simple formula resolves to Month 4 (160 users × ~$9 = $1,440, consistent with the full model)"
      - "Correct Slide 9 speaker notes: change 'We hit that in Month 3' to 'We reach that at Month 4 — consistent with the full model'"

  - truth: "Q12 in the Q&A bank uses the exact model.csv figure (+$9.68) consistently"
    status: failed
    reason: "Q12 line 156 states '+$10' as the narrative value ('crosses to positive (+$10)') while the same sentence cites 'Cumulative_Net = +$9.68' in the source tag. A judge who hears Gabriel say '+$10' and then sees the cited value of +$9.68 may note the inconsistency. The review flagged this as IN-01 (info level); it is a consistency gap between spoken talking point and cited evidence."
    artifacts:
      - path: "pitch/qa-bank.md"
        issue: "Line 156: 'Cumulative_Net crosses to positive (+$10)' — the rounded figure in the text contradicts the exact figure cited in the same sentence: '[SOURCE: pitch/financials/model.csv Month 4 row: Cumulative_Net = +$9.68]'"
    missing:
      - "Align Q12 talking-point text to the exact model.csv value: change '+$10' to '+$9.68' (or consistently use '+~$10' with a stated rounding note)"
deferred:
  - truth: "Three timed full run-throughs clock 8:30–9:00 on a phone hotspot"
    addressed_in: "Phase 10 Task 3 (post Phase 8 completion)"
    evidence: "10-03-PLAN.md Task 3 is explicitly a checkpoint:human-action gated on Phase 8 ('GATED — satisfied only after Phase 8 ships'). The rehearse-later spec is fully authored in pitch/protocol-checklist.md. The product track is at Phase 2; Phase 8 has not shipped."
  - truth: "Q&A bank rehearsed aloud (mock-judge drill)"
    addressed_in: "Phase 10 Task 3 (post Phase 8 completion)"
    evidence: "10-03-PLAN.md Task 3 specifies 'mock judge asks at least 15 of the 20 Q&A-bank questions in random order'. This is a human-action checkpoint gated on Phase 8."
  - truth: "Protocol compliance checklist passed with zero violations (live tick-off)"
    addressed_in: "Phase 10 Task 3 (post Phase 8 completion)"
    evidence: "The 'At Rehearsal' section of pitch/protocol-checklist.md explicitly states these items 'do not tick until Phase 8 is Complete'. The authored checklist is complete; execution is Phase 8-gated."
---

# Phase 10: Pitch Deck, Rehearsal & Protocol — Verification Report

**Phase Goal:** The pitch deck is built, every quantitative claim has an audible source attribution, three timed full run-throughs clock 8:30–9:00 on a phone hotspot, a 15-question Q&A bank is written and rehearsed aloud, and the protocol compliance checklist is passed with zero violations.
**Author-Now Scope (verified here):** pitch/deck/deck-outline.md (PITCH-07), pitch/qa-bank.md (PITCH-08), pitch/protocol-checklist.md (PITCH-09) — all deliverables that are executable now.
**Rehearse-Later Scope (Phase 8-gated, deferred):** Three timed run-throughs, mock-judge Q&A drill, live checklist sign-off — explicitly gated on Phase 8 shipping (product track at Phase 2).
**Verified:** 2026-05-31
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A reader finds one slide entry per narrative-arc section in fixed order (problem, market, solution, differentiation, demo, business model, financials, marketing, ask) | VERIFIED | 13 slides present; fixed arc order confirmed by reading slides 1–12 in sequence |
| 2 | Every quantitative claim bullet carries a [SOURCE: ...] tag — zero untagged numeric claims | VERIFIED | 37 SOURCE tags counted in deck-outline.md; visual scan of all slides 2–12 confirms no untagged numeric claim bullets |
| 3 | Per-slide timing targets for the eight business-arc sections sum to ~6:00; total stays <=10:00 | FAILED | Individual row times in the sub-timing table sum to 7:45, not ~6:00 (see CR-01 in 10-REVIEW.md). At target demo (2:30), total = 10:15, exceeding the 10:00 hard cap. The summary row and document header both state the wrong total. |
| 4 | Every slide carries a Luke/Gabriel speaker label; cross-presenter slides carry an explicit handoff cue | VERIFIED | 13/13 slides have **Speaker:** label; Slide 6 carries explicit [LUKE → GABRIEL] handoff cue; Slide 7 carries [GABRIEL → LUKE] cue; Slide 8 carries [GABRIEL → LUKE] back-reference cue (minor label error per WR-02 noted below) |
| 5 | Each open founder-verify flag (F1–F7) is surfaced inline on the slide whose claim it affects | VERIFIED | F1 on slide 3 (line 75), F2 on slide 3 (line 71), F3 on slide 9 (line 241), F4 on slide 8 (line 213), F5 on slide 11 (line 296), F6 on slide 4 (line 99), F7 on slide 10 (line 267) — all confirmed present |
| 6 | Q&A bank has at least 15 entries (target 20); all six mandated topics present with routing and source tags | VERIFIED | grep -c '^### Q' returns 21 (20 questions + 1 routing-subheader); all 6 D-06 mandated topics confirmed present (data accuracy, CAC/LTV, legal advice, competitive moat, API resilience, Teleport); 21 "Routed to:" labels present |
| 7 | Routing Summary table present mapping all Q1–Q20 | VERIFIED | "## Routing Summary" section present; 20-row table covering all questions with presenter assignments; both Luke and Gabriel assigned 10 questions each |
| 8 | Every quantitative defense bullet in Q&A bank carries a source tag | VERIFIED | SOURCE:.*financials = 17 hits; SOURCE:.*business-model = 15 hits; all financial figures (Year-1 ~$9,500, Month-12 +$7,965, break-even Month 4) cited to model.csv; founder-verify markers F4, F5, F7 carried inline |
| 9 | Speaker notes in Slide 9 do not contradict the Q&A bank on break-even month | FAILED | Slide 9 speaker notes (line 246) say "We hit that in Month 3." Q10 (qa-bank.md line 135) states Month 3 = 105 paid users — below the 112-user threshold. Q12 correctly states Month 4. The Slide 9 claim is internally contradicted across documents. |
| 10 | Protocol checklist has >= 20 binary checkboxes covering every competition protocol rule; rehearse-later spec present with Phase 8 precondition; F1–F7 risk surface present | VERIFIED | 29 checkboxes (grep -c '^- \[ \]' = 29); all required categories present (timing, device rules, QR/links, physical materials, setup/conduct, content compliance, dress code); "Rehearse-Later Specification (Phase 8-Gated)" present with explicit "PRECONDITION: Phase 8 must be Complete" and "NOT executed in this planning pass" statement; 9-task rehearsal table; 3 handoff-cue confirmations; F1–F7 founder-verify table with F3/F4 marked HIGH |

**Score: 7/10 truths verified** (3 deferred items correctly handled; 3 FAILED truths are genuine content errors)

---

### Deferred Items

Items not yet met but correctly gated on Phase 8 — not actionable gaps for this phase.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Three timed full run-throughs clock 8:30–9:00 on a phone hotspot | Phase 10 Task 3 (Phase 8-gated) | 10-03-PLAN.md Task 3: checkpoint:human-action with explicit "GATED ON PHASE 8 — DO NOT RUN THIS PASS" label; rehearse-later task list fully specified in pitch/protocol-checklist.md |
| 2 | Q&A bank rehearsed aloud (mock-judge drill) | Phase 10 Task 3 (Phase 8-gated) | Protocol-checklist "At Rehearsal" section item 3: "Both presenters have run the full Q&A bank aloud"; rehearsal task list row 7 specifies mock-judge drill of >= 15 questions |
| 3 | Protocol compliance checklist passed with zero violations (live execution) | Phase 10 Task 3 (Phase 8-gated) | "At Rehearsal" section explicitly: "do not tick until Phase 8 is Complete"; final protocol sign-off is rehearsal task list row 9 |

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `pitch/deck/deck-outline.md` | 12-14 slide outline with per-slide schema, source-tagged claim bullets, speaker notes, sub-timing table | VERIFIED (with WARNING) | File exists; 411 lines; 13 slides; per-slide schema present on all slides; 37 SOURCE tags; sub-timing table present; WARNING: summary row states wrong total (~6:00 actual is 7:45) |
| `pitch/qa-bank.md` | 20-question Q&A bank with routing, talking points, source tags | VERIFIED | File exists; 284 lines; 21 Q-headings (20 questions + routing subheader); all 6 mandated topics; routing summary table; financials and business-model source tags |
| `pitch/protocol-checklist.md` | Binary day-of protocol checklist + rehearse-later spec + founder-verify risk surface | VERIFIED | File exists; 124 lines; 29 checkboxes; pre-competition and at-rehearsal sections; rehearse-later spec with Phase 8 precondition; 9-task rehearsal table; F1–F7 table |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| pitch/deck/deck-outline.md | pitch/market-research.md | SOURCE tags on market/competition/differentiator claim bullets | VERIFIED | 8 SOURCE tags citing market-research.md confirmed present |
| pitch/deck/deck-outline.md | pitch/financials/summary.md | SOURCE tags on financials claim bullets | VERIFIED | 6 SOURCE tags citing financials/summary.md confirmed present |
| pitch/qa-bank.md | pitch/business-model.md | SOURCE tags on pricing/CAC/conversion defense bullets | VERIFIED | 15 SOURCE tags citing business-model.md confirmed present |
| pitch/qa-bank.md | pitch/financials/summary.md | SOURCE tags on financials defense bullets | VERIFIED | 17 SOURCE tags citing financials documents confirmed present |
| pitch/protocol-checklist.md | pitch/deck/deck-outline.md | Content-compliance items reference audible source attributions | VERIFIED | Line 49: "Every quantitative claim in the deck has an audible source attribution — the source-attribution cue appears in the speaker notes for each claim bullet…(ties to pitch/deck/deck-outline.md speaker notes)" |

---

### Data-Flow Trace (Level 4)

Not applicable. All three deliverables are Markdown content documents with no dynamic data rendering. "Data flow" is the citation chain from claim bullets to source documents, which is verified via key links above.

---

### Behavioral Spot-Checks

Content-only phase. No runnable code was produced. Spot-checks replaced by content-integrity grep checks above.

---

### Probe Execution

No probes declared in PLAN files. No `scripts/*/tests/probe-*.sh` files exist for this phase. Step 7c: SKIPPED (content-authoring phase; no runnable entry points).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PITCH-07 | 10-01-PLAN.md | Pitch deck + <=10-minute presentation built, with every claim sourced/cited | PARTIAL | Deck outline built with all 13 slides and 37 SOURCE tags (claim sourcing satisfied); timing arithmetic error means the stated "~6:00 business arc + 2:30 demo = ~8:30" rehearsal target is wrong — the real total at target demo is 10:15, violating the <=10:00 requirement stated in PITCH-07. The deck content is substantive and complete; the timing metadata is incorrect. |
| PITCH-08 | 10-02-PLAN.md | Q&A preparation — anticipated-question bank with defensible answers | SATISFIED | 20-question bank with all 6 mandated topics, routing, source tags, airtight Q3 and Q6 entries (4 bullets each), routing summary table. One minor consistency issue (Q12 +$10 vs +$9.68 model value, IN-01). |
| PITCH-09 | 10-03-PLAN.md | Protocol checklist passed — within time, no judge-clicked links/QR, no external speakers, nothing left with judges, dress code met | AUTHOR-NOW SATISFIED / EXECUTION GATED | The authored checklist is complete (29 items, all protocol rules covered). "Passed" execution is Phase 8-gated by design — correctly deferred. |

---

### Anti-Patterns Found

| File | Location | Pattern | Severity | Impact |
|------|----------|---------|----------|--------|
| pitch/deck/deck-outline.md | Line 6 (header) | "~6:00" business arc total — arithmetically wrong | BLOCKER | Rehearsal calibrated on wrong baseline; target demo (2:30) at real arc (7:45) exceeds hard cap by 15 seconds |
| pitch/deck/deck-outline.md | Line 383 (sub-timing table summary row) | "~6:00 | ~4:35" — wrong totals | BLOCKER | Same root cause as line 6; this is where the wrong total is stated explicitly |
| pitch/deck/deck-outline.md | Line 387 (combined envelope note) | "Business arc (~6:00) + Demo target (2:30) = ~8:30" — derived from wrong base | BLOCKER | Presenters rehearsing to 8:30–9:00 under this assumption will enter competition running 10:15 at target demo length |
| pitch/deck/deck-outline.md | Line 246 (Slide 9 speaker notes) | "We hit that in Month 3" — contradicted by Q10 (105 users < 112 threshold) | BLOCKER | Self-inflicted contradiction between deck and Q&A bank; will surface under judge questioning |
| pitch/deck/deck-outline.md | Line 239 (Slide 9 claim bullet) | "Month 3 on the simple formula" — wrong; should be Month 4 | BLOCKER | Claim bullet is wrong and contradicts the Q&A bank |
| pitch/qa-bank.md | Line 156 (Q12) | "+$10" stated vs. "+$9.68" in cited source on the same line | WARNING | Minor inconsistency between spoken talking-point and cited figure; low credibility risk but avoidable |
| pitch/qa-bank.md | Line 14 (header routing note) | "Market/financials/CAC-LTV/Teleport → Luke" — wrong; Q2, Q11, Q12 (financials/CAC-LTV) are routed to Gabriel | WARNING | Presenters reading the header will expect Luke to own CAC/LTV and financials Q&A, but the routing table correctly assigns these to Gabriel; rehearsal-time confusion risk |
| pitch/deck/deck-outline.md | Line 220 (Slide 8 speaker notes) | "[HANDOFF CUE at close of slide 11 financials]" — slide 11 is Marketing (Luke), not Financials; should say "Slide 10" | WARNING | Minor label error; the parenthetical in the same sentence correctly says "Slide 10"; inconsistency resolved in protocol-checklist which correctly states "Slide 10 → 11" |

**Debt marker check:** No TBD, FIXME, or XXX markers found in the three deliverable files. No unresolved debt markers.

---

### Human Verification Required

None beyond the Phase 8-gated deferred items already documented above. All author-now verification is programmatically completable.

---

### Gaps Summary

**Three BLOCKER issues** were identified, all arising from CR-01 and CR-02 in the existing 10-REVIEW.md. The review correctly diagnosed these issues; they were not corrected before this verification pass.

**Root cause 1 (CR-01 — timing arithmetic):** The sub-timing table's individual slide rows sum to 7:45, but the summary row and all derived text say ~6:00. This propagates into a false "8:30 combined envelope" and creates a real 10:15 total at target demo length — 15 seconds over the hard cap. The fix is purely mechanical: update the summary row and two derived sentences. The individual per-slide times are not in dispute.

**Root cause 2 (CR-02 — Month 3 break-even):** The Slide 9 claim bullet and speaker notes assert the simple-formula break-even is Month 3. Q10 in the Q&A bank states Month 3 = 105 paid users, which is below the 112-user threshold derived by the same formula. Q12 correctly states Month 4 with 160 users. The Slide 9 text must be corrected to remove the Month 3 claim and align with Q12 and the full model (both point to Month 4).

**Two WARNING issues** (WR-01 routing header, WR-02 Slide 8 cue label, IN-01 Q12 rounding) are lower severity — they will cause rehearsal confusion but do not affect the mathematical validity of pitch claims. These should be fixed before first rehearsal.

**Author-now scope is otherwise complete and well-formed.** All three deliverable files exist, are substantive, carry consistent source attribution, and are correctly gated. The gaps are localized content corrections, not structural failures of the authoring work.

---

_Verified: 2026-05-31_
_Verifier: Claude (gsd-verifier)_
