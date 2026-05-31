---
phase: "09"
plan: "02"
subsystem: pitch
tags: [business-model, value-prop, pricing, marketing, fbla]
dependency_graph:
  requires: [09-01-SUMMARY.md]
  provides: [pitch/business-model.md]
  affects: [pitch/financials/, pitch/qa-bank.md]
tech_stack:
  added: []
  patterns: [hybrid-format (D-01), run-based-one-time-pricing (D-05), never-expire-credits]
key_files:
  created: []
  modified:
    - pitch/business-model.md
decisions:
  - "Run-based one-time pricing (Free $0 / Basic $0.99 / Plus $9.99 / Premium $29.99) mirrors 16Personalities Reports-for-Pros credit model; no consumer subscription"
  - "Four revenue streams: run purchases (primary), affiliate/referral, future B2B only (subscription context), soft repeat-purchase"
  - "Conversion rate modeled at 8-12% for $0.99 first-purchase; anchored to 2-5% SaaS freemium benchmark with explicit price-friction justification"
  - "Blended CAC ~$8-$12 labeled [ASSUMED] throughout with HubSpot/WordStream benchmark anchors"
metrics:
  duration: "18min"
  completed_date: "2026-05-31"
  tasks: 2
  files: 1
---

# Phase 9 Plan 02: Business Model, Value Prop & Growth Summary

## One-liner

Run-based one-time pricing (Free/$0.99/$9.99/$29.99) modeled on 16Personalities credits, no consumer subscription, with four sourced acquisition channels driving toward Plus as the primary upsell.

## What Was Built

`pitch/business-model.md` was authored from scratch, replacing the stub that held stale pricing (~$9 / ~$29 / "$99 or $9.99/mo" subscription). The deliverable covers PITCH-03 (value proposition), PITCH-04 (business model / pricing), and PITCH-06 (marketing & growth) in hybrid format (D-01): short narrative intro + claim/number/source table per section.

**Six sections authored:**

1. **Value Proposition (PITCH-03)** — "Potential tells you where you'd actually thrive — and hands you the step-by-step plan to get there." Articulates the transformation vs. Numbeo/Reddit (no personalization, no AI, no roadmap, no visa), names the three differentiators (live-AI layer, personalized relocation roadmap, immigration concierge), and anchors the competitive gap with the Teleport → Topia enterprise exit narrative.

2. **Pricing Model (PITCH-04)** — Full run-based one-time table (Free $0 / Basic $0.99 / Plus $9.99 "most popular" / Premium $29.99 unlimited); never-expire credits framing; 16Personalities Reports-for-Pros analog cited at both pricing and UX mechanic levels [FOUNDER-VERIFY: F4]. Explicitly notes no money-back guarantee (D-07).

3. **Revenue Streams (D-06)** — Four streams named: (1) run purchases primary v1; (2) affiliate/referral fees ~10–20% on $150–$500 attorney consults [ASSUMED]; (3) future B2B employer-benefits subscription SaaS — the ONLY subscription context, explicitly labeled v2/future; (4) soft repeat-purchase noting 2–3x relocation frequency [FOUNDER-VERIFY: F7].

4. **Conversion Funnel (D-10, D-13)** — Ladder from free quiz → teaser → $0.99 Basic → $9.99 Plus (primary upsell) → $29.99 Premium. First-purchase rate modeled at 8–12% as a stated, defended assumption anchored to the 2–5% SaaS freemium benchmark (FirstPageSage + Userpilot cited). Basic → Plus upsell framed via sunk-cost + curiosity psychology.

5. **Four Acquisition Channels (D-12)** — SEO ($5–$15 CAC, HubSpot anchor), TikTok/Reels organic ($5–$20, WordStream CPM anchor), Reddit communities ($0–$5, r/IWantOut + r/digitalnomad + r/expats + r/SameGrassButGreener named, [FOUNDER-VERIFY: F5] on member counts), University partnerships ($10–$30). Blended CAC ~$8–$12 [ASSUMED]. All labeled modeled estimates with benchmark sources.

6. **Unit Economics Summary** — Break-even at ~112 paid users / ~month 3. Full derivation traceable to `pitch/financials/`.

## Verification Results

```
grep -niE "subscription|/month|/mo\b" pitch/business-model.md
→ All hits scoped to: (a) why NOT consumer subscription, (b) 16P B2B Teams context, (c) Stream 3 future B2B explicitly labeled v2, (d) TikTok content title ("what $3K/month looks like"), (e) "users/mo" in break-even math. ZERO consumer-subscription pricing framing. ✓

grep -F "9.99" pitch/business-model.md → present ✓
grep -F "0.99" pitch/business-model.md → present ✓
grep -ciE "r/IWantOut|r/expats|r/digitalnomad" pitch/business-model.md → 6 ✓ (>= 1 required)
grep "money.back\|guarantee" → only the note that it was explicitly declined (D-07) ✓
```

## Deviations from Plan

None — plan executed exactly as written. Both tasks were authored in a single pass of `pitch/business-model.md` since they target the same file sequentially.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. This is a markdown document.

**Threat mitigations verified:**

| Threat | Status |
|--------|--------|
| T-09-02-A: Consumer-subscription framing | Mitigated — grep clean; all subscription hits scoped to future B2B or explanatory context |
| T-09-02-B: Conversion/CAC numbers cave in Q&A | Mitigated — every rate/CAC labeled [ASSUMED] with cited benchmark anchor |
| T-09-02-C: Money-back guarantee re-introduced | Mitigated — no money-back guarantee; the note that it was declined is the only mention |
| T-09-02-D: Unsourced channel/conversion figure | Mitigated — Sources section lists 14 URLs; F3/F4/F5/F7 flags carried |

## Founder-Verify Flags Active

| Flag | Claim | Action |
|------|-------|--------|
| F3 | Anthropic per-token pricing at pitch time | Screenshot https://www.anthropic.com/pricing within 2 weeks of pitch |
| F4 | 16Personalities pricing ($29 Career Suite, $9/report) | Re-verify if >30 days before pitch |
| F5 | Reddit community member counts (r/IWantOut 476K, r/digitalnomad 2.3M, etc.) | Check reddit.com/r/[name] day before competition |
| F7 | "People relocate 2–3× in their 20s–30s" — LTV rationale | Search Census ACS lifetime mobility or BLS migration tables |

## Cross-Document Consistency

Verified consistent with `pitch/market-research.md`:
- Blended revenue per paid user ~$10–$12 (50/35/15 Basic/Plus/Premium mix) — consistent
- Three differentiators (live-AI, roadmap, visa concierge) — consistent tier assignments
- Teleport → Topia exit narrative — consistent framing
- Freemium benchmark 2–5% (FirstPageSage + Userpilot) — consistent source citations
- SOM revenue figure $600K–$720K traceable to same blended ~$10–$12 figure — consistent

The financial model (plan 09-03) will consume: Plus $9.99 / Premium $29.99 pricing; blended CAC ~$8–$12; four channel CAC ranges; API COGS ~$0.05–$0.07 per Plus run; 8–12% first-purchase conversion assumption; 50/35/15 tier mix.

## Commits

| Task | Commit | Files |
|------|--------|-------|
| Task 1+2: Author complete business-model deliverable | 488957f | pitch/business-model.md |

## Self-Check: PASSED

- [x] `pitch/business-model.md` exists and is authored (259 net insertions from stub)
- [x] Commit 488957f exists: `git log --oneline | grep 488957f` → confirmed
- [x] Pricing table matches D-05 exactly (Free $0 / Basic $0.99 / Plus $9.99 / Premium $29.99)
- [x] No stale "~$9 / ~$29 / $9.99/mo subscription" pricing anywhere
- [x] No money-back guarantee
- [x] Never-expire framing present with 16P citation
- [x] Four revenue streams named with F7 flag
- [x] Four channels named with CAC ranges and benchmark sources
- [x] Reddit subreddits named with F5 flag
- [x] Sources section enumerates 14 URLs
- [x] D-04 grep clean
