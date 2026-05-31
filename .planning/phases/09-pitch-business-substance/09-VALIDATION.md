---
phase: 9
slug: pitch-business-substance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-30
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
>
> **This is a documentation phase — no application code is produced.** "Validation"
> here means **source verification + Q&A stress-testing** of every quantitative claim,
> not unit tests. The "framework" is a deterministic source-citation audit over the
> authored pitch documents. See RESEARCH.md §Validation Architecture for the full
> Source Verification Protocol and Q&A Stress-Test Map.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — manual source-citation audit + grep-based consistency checks |
| **Config file** | none — pitch docs are the artifacts under audit |
| **Quick run command** | `grep -niE "subscription\|\\$9\.99/mo\|/month" pitch/` (must return only B2B-scoped hits — D-04) |
| **Full suite command** | Source-citation audit: every claim/number row in every pitch doc has a primary-source URL or `[FOUNDER-VERIFY]` flag |
| **Estimated runtime** | manual, ~10 min per doc |

---

## Sampling Rate

- **After every task commit:** Re-read the just-authored claim/number/source table; confirm every numeric cell has a source cell or a `[FOUNDER-VERIFY: Fn]` flag.
- **After every plan wave:** Run the consistency grep (no stray "subscription"/"$9.99/month" outside the named B2B scaling story — D-04, Pitfall 3).
- **Before `/gsd-verify-work`:** All seven founder-verification flags (F1–F7 from RESEARCH.md) are either resolved with a cited source or explicitly listed as outstanding in the doc.
- **Max feedback latency:** N/A (manual review, not automated suite).

---

## Per-Task Verification Map

> Populated by the planner per deliverable slice. Each row asserts that a claim
> table is fully sourced, not that a test passes. "Automated Command" is a grep
> assertion where one exists; otherwise the check is a manual source-audit.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | PITCH-01 | — | N/A | source-audit | `grep -cE "census\.gov" pitch/market-research.md` (≥1) | ❌ W0 | ⬜ pending |
| 9-02-01 | 02 | 1 | PITCH-02/03 | — | N/A | source-audit | manual: Nomad List / WhereNext / Teleport→Topia each named + sourced | ❌ W0 | ⬜ pending |
| 9-03-01 | 03 | 1 | PITCH-04/06 | — | N/A | consistency | `grep -niE "subscription\|/month" pitch/business-model.md` (only B2B scope) | ❌ W0 | ⬜ pending |
| 9-04-01 | 04 | 1 | PITCH-05 | — | N/A | source-audit | manual: every CSV input re-derivable from a stated, sourced assumption | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Threat Ref column is N/A for this phase — no executable attack surface is created.*

---

## Wave 0 Requirements

- [ ] No test framework to install — this is a documentation phase.
- [ ] Confirm RESEARCH.md §Validation Architecture (Source Verification Protocol, Q&A Stress-Test Map, F1–F7 flags) is the source-of-truth the deliverables must satisfy.

*Existing pitch/ stubs (market-research.md, business-model.md, financials/) are the authoring targets — no infrastructure setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Every quantitative claim is citable from memory and traceable to a primary source | PITCH-01…06 | Source credibility and Q&A defensibility are judgment calls, not assertable by a test runner | For each claim/number row, follow its source URL and confirm the number matches; flag mismatches |
| No consumer-subscription framing leaks into pricing (D-04) | PITCH-04 | Semantic check — "subscription" is only valid in the named future-B2B scaling story | grep for "subscription"/"$/month"; confirm each hit is B2B-scoped |
| Financial model is re-derivable from first principles in ~60 seconds (D-08) | PITCH-05 | Defensibility under Q&A pressure is a human judgment | Walk a cold reader through the CSV; confirm each number traces to a stated assumption |
| F1–F7 founder-verification flags resolved or explicitly carried (RESEARCH.md) | PITCH-01/04/05/06 | Some figures (international migration %, exact Census year) require the founder to pull live primary sources | Confirm each flag is either cited or visibly marked outstanding before pitch day |

---

## Validation Sign-Off

- [ ] Every deliverable's claim/number/source table has a source for each number (or a `[FOUNDER-VERIFY]` flag)
- [ ] Sampling continuity: each plan wave ends with the consistency grep + source audit
- [ ] Wave 0 confirms RESEARCH.md Validation Architecture as the contract
- [ ] No consumer-subscription framing outside the named B2B scaling story (D-04)
- [ ] F1–F7 flags resolved or explicitly carried into the docs
- [ ] `nyquist_compliant: true` set in frontmatter once the above hold

**Approval:** pending
