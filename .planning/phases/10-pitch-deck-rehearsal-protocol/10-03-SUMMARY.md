---
phase: 10-pitch-deck-rehearsal-protocol
plan: "03"
subsystem: pitch
tags: [protocol, checklist, rehearsal, pitch, PITCH-09]
dependency_graph:
  requires: []
  provides: [pitch/protocol-checklist.md]
  affects: [pitch-day-execution]
tech_stack:
  added: []
  patterns: [binary-checkbox-checklist, rehearse-later-spec, founder-verify-flags]
key_files:
  created:
    - pitch/protocol-checklist.md
  modified: []
decisions:
  - "Author-now scope completed: binary protocol checklist + rehearse-later spec + founder-verify risk surface all in pitch/protocol-checklist.md"
  - "Task 2 content co-authored with Task 1 in a single file write (same target file, same author-now authoring pass) — no behavioral difference from the plan's intended output"
  - "Task 3 (rehearsal execution) intentionally not run this pass: gated on Phase 8, which is unbuilt (product track at Phase 2)"
metrics:
  duration: "~10 min"
  completed: "2026-05-31"
  tasks_completed: 2
  tasks_deferred: 1
  files_created: 1
---

# Phase 10 Plan 03: Protocol Checklist and Rehearsal Specification Summary

**One-liner:** Binary 29-item day-of protocol compliance checklist with Phase 8-gated rehearse-later spec (three timed run-throughs + mock-judge Q&A drill) and F1–F7 founder-verify risk surface.

---

## What Was Built

`pitch/protocol-checklist.md` — the PITCH-09 deliverable. Three distinct sections:

1. **Pre-Competition checklist (authored now):** 29 binary YES/NO checkboxes across seven categories — Timing, Device Rules, Links/QR/URLs, Physical Materials, Setup and Conduct, Content Compliance, and Dress Code. Any NO blocks competition entry. Includes the day-of process: non-presenting partner runs the checklist while the other sets up.

2. **At Rehearsal section:** Four items requiring live testing (fallback test, demo timing on laptop+hotspot, both presenters running Q&A bank aloud, three timed run-throughs landing 8:30–9:00). Flagged as Phase 8-gated.

3. **Rehearse-Later Specification (Phase 8-Gated):** Full precondition block, nine-task rehearsal table (Who/Notes columns), and three handoff-cue confirmation moments. Immediately executable once Phase 8 ships — no additional authoring needed at that point.

4. **Founder-Verify Flags (F1–F7):** Table with flag, claim, deck location, priority (F3 and F4 marked HIGH), and action. Risk-mitigation rule stated. Competition-date open question surfaced as the driver for F3/F4 re-check timing.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Author binary protocol compliance checklist | 839f83b | pitch/protocol-checklist.md (created) |
| 2 | Author rehearse-later spec + founder-verify risk surface | 839f83b | pitch/protocol-checklist.md (Task 2 content co-authored in Task 1 write) |

---

## Deferred / Gated

### Task 3 — Rehearsal Execution (Phase 8-Gated Human-Action Checkpoint)

**Type:** checkpoint:human-action, gate="blocking"

**Why not run this pass:** Phase 8 (Freemium Tier Gate / live demo + golden-path fallback) is NOT yet built. The product track is at Phase 2. Task 3 requires a physical live demo, competition laptop, phone hotspot, stopwatch, and both presenters (Luke + Gabriel) — none of which can be automated and none of which exist until Phase 8 ships.

**Per the plan's own verification note:** "Task 3 is a checkpoint:human-action gated on Phase 8 — NOT expected satisfied in this planning pass (verification must not treat it as incomplete-blocking for the author-now scope)."

**What to do when Phase 8 ships:** Open `pitch/protocol-checklist.md`, navigate to the "Rehearse-Later Specification (Phase 8-Gated)" section, and follow the task list in order. The preconditions, task table, and handoff-cue confirmation moments are fully specified — no additional planning is needed.

**Resume signal (when ready):** "rehearsal complete: all three runs 8:30-9:00, Q&A drilled, fallback confirmed, protocol signed off" — or describe which items failed and need re-rehearsal.

---

## Deviations from Plan

### Minor Deviation: Task 1 and Task 2 Co-Authored in One File Write

**Rule:** Not a rule violation — this is an authoring efficiency.

**Detail:** Both tasks target the same file (`pitch/protocol-checklist.md`). Task 1 creates the pre-competition checklist; Task 2 appends the rehearse-later spec and founder-verify flags. Since both sections were planned and their content was fully specified in RESEARCH.md, both were authored in a single Write call and committed in commit `839f83b`.

**Impact:** Zero — the output is identical to what two separate writes would have produced. Both tasks' automated verification checks pass against the committed file. No content was omitted.

---

## Verification Results

```
Checkbox count: 29 (>= 20 required ✓)
Battery keyword: OK ✓
QR keyword: OK ✓
Dress code keyword: OK ✓
Lines: 124 (>= 80 required ✓)
Phase 8 precondition: OK ✓
Rehearse-Later section: OK ✓
Founder-Verify section: OK ✓
NOT-executed-this-pass statement: OK ✓
Task list rows: 9 (>= 8 required ✓)
Handoff cue Slide 6→Demo: OK ✓
Handoff cue Demo→Slide 8: OK ✓
Handoff cue Slide 10→11: OK ✓
F3 HIGH: OK ✓
F4 present: OK ✓
```

---

## Threat Model Coverage

No attack surface introduced. This plan produces a Markdown content document specifying human procedures. STRIDE threats T-10-05 (protocol integrity) and T-10-06 (stale data) addressed as follows:

- T-10-05 (Tampering / protocol integrity): mitigated — every competition rule is a checkbox; binary rubric row addressed by the day-of process where the non-presenting partner runs the full checklist
- T-10-06 (Information disclosure / stale data): mitigated — F1–F7 surfaced with re-verification cadence (F3/F4 HIGH); risk-mitigation rule states what to do if a flag cannot be cleared before pitch day

No new threat surface introduced.

---

## Self-Check: PASSED

- [x] `pitch/protocol-checklist.md` exists at worktree path
- [x] Commit `839f83b` exists in git log
- [x] All plan acceptance criteria verified (29 checkboxes, all required sections, F3/F4 HIGH, handoff cues)
- [x] Task 3 documented as deferred (Phase 8-gated), not run this pass
- [x] SUMMARY.md created and committed before narration
