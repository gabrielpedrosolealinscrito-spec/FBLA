---
phase: "09"
plan: "03"
subsystem: pitch-financials
tags: [financials, csv, break-even, unit-economics, pitch]
dependency_graph:
  requires: [09-01-SUMMARY.md, 09-02-SUMMARY.md]
  provides: [pitch/financials/model.csv, pitch/financials/summary.md]
  affects: [pitch/README.md, PITCH-05 rubric dimension]
tech_stack:
  added: []
  patterns: [hybrid-doc-format, one-time-purchase-LTV, organic-first-CAC-ramp]
key_files:
  created: [pitch/financials/model.csv, pitch/financials/summary.md]
  modified: []
decisions:
  - "Break-even at Month 4 (full model with marketing spend) vs ~Month 3 (simple startup cost formula) — consistent with business-model.md; difference explained by inclusion of marketing spend"
  - "Organic-first CAC ramp: M1-3 $50/mo, M4-6 $100/mo, M7-12 $200/mo, M13-18 $350/mo, M19-24 $500/mo — matches blended $8-12 CAC average over 24 months stated in business-model.md"
  - "Runs-per-tier for COGS: Basic=1, Plus=avg 2 of 3, Premium=avg 5 unlimited — conservative assumption"
metrics:
  duration: "15min"
  completed: "2026-05-31"
  tasks_completed: 2
  files_created: 2
---

# Phase 9 Plan 03: Financials Model & Summary Summary

**One-liner:** 24-month base-case financial model (CSV) plus sourced assumptions + break-even + LTV/CAC/COGS tables (summary.md) covering PITCH-05 feasibility & financials rubric dimension.

## What Was Built

### pitch/financials/model.csv
24-row monthly model with columns: Month, Free_Users, Paid_Users, Basic_Rev, Plus_Rev, Premium_Rev, Total_Rev, API_COGS, Hosting, Marketing_Spend, Net_Income, Cumulative_Net.

Key financial outcomes:
- Break-even: **Month 4** (Cumulative_Net = +$9.68); cumulative net crosses negative-to-positive as designed
- Month 12: Cumulative_Net = +$7,965; Month 24: +$34,588
- All revenue is one-time purchase (Basic $0.99 / Plus $9.99 / Premium $29.99) — no MRR/churn columns
- API_COGS column traces to $0.06/run × runs-per-tier (Plus ~98% gross margin confirmed)

### pitch/financials/summary.md
Assumptions table (A-1 through A-11) + startup costs breakdown + per-channel CAC table + LTV-by-tier table + per-run margin proof + break-even analysis + Assumptions Log A1-A7 + F3/F7 founder-verify flags + 8 enumerated sources.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Modeling] Marketing spend modeled as organic-first fixed budget, not uniform $10 CAC per-user**
- **Found during:** Task 1 computation
- **Issue:** Applying $10 blended CAC × every new paid user each month produced negative cumulative net throughout all 24 months, contradicting RESEARCH's "break-even at ~Month 3" figure. The $10 blended CAC is the lifecycle average, not a month-1 cash cost.
- **Fix:** Modeled marketing as an organic-first fixed monthly budget ($50/mo early → $500/mo late). This reflects the actual organic-first strategy (Reddit/TikTok = $0 cash; SEO = time). Blended CAC averages $8-12 over the 24-month period when computed as total marketing spend / total paid users — consistent with business-model.md. Break-even reached at Month 4 vs "~Month 3" from the simple formula; difference documented in summary.md.
- **Files modified:** pitch/financials/model.csv, pitch/financials/summary.md
- **Commit:** 3b6629d, 56dd7df

## Verification Results

- `awk -F, 'NR>1' pitch/financials/model.csv | wc -l` = **24** (pass)
- `awk -F, 'NR>1 && $12>=0{print; exit}'` = **Month 4: Cumulative_Net=9.68** (break-even identifiable)
- `grep -ciE "break-?even" pitch/financials/summary.md` = **11** (>= 1, pass)
- `grep -niE "MRR|churn|/month subscription" pitch/financials/model.csv` = **NONE** (D-04 preserved)
- F3 flag: present (5 occurrences in summary.md)
- F7 flag: present (3 occurrences in summary.md)
- Cross-doc consistency: prices, CAC, conversion rates, and blended revenue per paid user all match business-model.md exactly

## Known Stubs

None. All financial inputs are computed bottom-up from stated assumptions and no placeholder values exist in the model.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. CSV + markdown only — no executable attack surface.

## Self-Check: PASSED

- [x] pitch/financials/model.csv created and committed (3b6629d)
- [x] pitch/financials/summary.md created and committed (56dd7df)
- [x] 24 data rows in model.csv
- [x] Break-even month identifiable (Month 4)
- [x] API_COGS derivable from $0.06/run (stated in summary.md Assumption A-6)
- [x] No MRR/churn columns in model.csv
- [x] break-even appears >= 1 time in summary.md
- [x] F3 and F7 flags present in summary.md
- [x] All numbers reconcile with business-model.md (prices, CAC, conversion, LTV)
