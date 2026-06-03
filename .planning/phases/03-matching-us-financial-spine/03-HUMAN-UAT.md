---
status: partial
phase: 03-matching-us-financial-spine
source: [03-VERIFICATION.md]
started: 2026-06-02T14:30:00Z
updated: 2026-06-02T14:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Offline-on-battery end-to-end run
expected: Run the app on battery (no network), complete the 5-step quiz for a Software Engineer. A non-empty ranked list of 22 US cities loads instantly with personalized scores; scores differ by profile and the #1 city is not always Austin.
result: [pending]

### 2. Contribution bars visual rendering
expected: Click any city card and expand "Why this score". Signed contribution bars appear for Cost, Career, Lifestyle, Safety and sum visually to the displayed match-score badge. Dealbreaker penalties (if any) appear as red negative bars.
result: [pending]

### 3. D-02 re-confirm overlay interaction
expected: Set "No extreme heat" as a dealbreaker with a profile where Phoenix (summerHighF 107) would otherwise rank high. A "Dealbreaker alert" overlay cites Phoenix's heat fact; "No, it's fine" re-ranks and promotes Phoenix; "Yes, still a dealbreaker" keeps it demoted.
result: [pending]

### 4. MATCH-04 sort cycling
expected: Sort pills reorder the ranked list correctly (by match, cost, career, etc.) with a visible list reorder.
result: [pending]

### 5. WR-02 lifestyle-tag coverage (product judgment)
expected: Decide whether a user selecting only foodie/fitness/lgbtq/quiet getting a 0 lifestyle contribution is acceptable demo behavior or needs a scoring branch (WR-02 fix). Product call, not a code bug.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
