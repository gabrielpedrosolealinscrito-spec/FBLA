# Phase 9: Pitch — Business Substance - Context

**Gathered:** 2026-05-30
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase produces the **sourced, defensible business-plan deliverables** that 4 of the 6 scored FBLA rubric dimensions live in — written as documents under `pitch/`, not product code. Specifically: market sizing & problem (PITCH-01), competitive positioning & innovation (PITCH-02/03), business model & pricing (PITCH-04), feasibility & financials (PITCH-05), and marketing/growth (PITCH-06).

Every quantitative claim must be citable from memory in Q&A and traceable to a primary source. Deck-building, rehearsal, and Q&A bank are **Phase 10** (out of scope here).

Runs in parallel with product Phases 5–8; depends only on Phase 1 (concept/architecture locked).
</domain>

<decisions>
## Implementation Decisions

### Document authoring format
- **D-01:** Hybrid format — each section gets a short narrative intro followed by a **claim / number / source** table. Optimizes for the scored Sources row, Q&A memorization, and clean handoff into the Canva deck (Phase 10).

### Market sizing (PITCH-01)
- **D-02:** Bottom-up TAM → SAM → SOM, every layer cited. Source layers: US Census Bureau annual mover data (~8M households), international migration-interest figures, and the 22–35 demographic segment.
- **D-03:** **Moderate** SOM aggressiveness — ~1–2% of SAM over 3 years, benchmarked to a comparable consumer-app penetration analog (the analog must be named and cited so the number survives Q&A). Single point estimate, not a range.

### Business model & pricing (PITCH-04) — REVISED THIS SESSION
- **D-04:** **No consumer subscription.** Relocation is a one-time decision; a recurring consumer charge is indefensible in Q&A. All consumer pricing is one-time.
- **D-05:** **Run-based pricing along a "never-expiring credits" axis** (modeled on 16Personalities "Reports for Pros"):
  - **Free $0** — minimal teaser; deeper results/sections shown blurred/locked to drive curiosity (16Personalities "Your Profile" pattern)
  - **Basic $0.99** — 1 run; the single most optimal city + its core financial snapshot
  - **Plus $9.99** — 3 runs; full ranked list (US + international) + financials + live-AI layer + relocation roadmap. **Primary upsell target, badged "most popular."**
  - **Premium $29.99** — unlimited runs; everything above + the immigration/visa concierge (the moat)
- **D-06:** Recurring/scaling revenue does NOT come from consumer MRR. It comes from: (a) affiliate/referral fees (attorney network, relocation services — ties to founder's immigration edge), (b) a future **B2B employer-benefits** "scaling story" (directly answers the "Teleport went B2B / failed at consumer" question), and (c) a soft repeat-purchase angle (people in their 20s–30s relocate 2–3×).
- **D-07:** 16Personalities conversion tactics to adopt: **never-expire credits framing**, **"most popular" badge on Plus**, **sample-report / preview transparency**. (Money-back guarantee was considered and **declined** — do not include it.)

### Feasibility & financials (PITCH-05)
- **D-08:** One **base case** (no conservative/optimistic scenarios). Spreadsheet as **CSV in `pitch/financials/`** + a markdown summary table. ~24-month horizon focused on break-even month. Every number re-derivable from first principles in ~60 seconds.
- **D-09:** Model must include: startup costs (API, legal, marketing), **per-channel CAC**, LTV by tier, and break-even month — all bottom-up from stated assumptions.
- **D-10:** Conversion modeling reflects the funnel shape: a **high first-purchase rate** (the $0.99 entry is near-frictionless) and a **low re-run/repeat rate** (relocation is infrequent). Anchor to freemium/16Personalities benchmarks (~2–5% range cited), but model the $0.99 first-purchase higher than a standard SaaS-trial rate.
- **D-11:** **Live-AI cost is per-run** (each run hits the Anthropic API). Tier run-caps (1 / 3 / unlimited) are the margin-protection mechanism; the financial model must show live-AI COGS per run and confirm Plus/Premium stay margin-positive.

### Marketing & growth (PITCH-06)
- **D-12:** Four named acquisition channels, each with a per-channel CAC in the financial model and an audience-fit rationale:
  - SEO content ("cost of living in X", "how to move to X", "best cities for [profession]")
  - TikTok/Reels + YouTube short-form relocation/expat content
  - Reddit / niche communities (r/IWantOut, r/expats, r/digitalnomad, r/SameGrassButGreener) — founder-credible
  - University & study-abroad / career-center partnerships
- **D-13:** The funnel narrative drives users toward **Plus ($9.99)** as the primary upsell.

### Competitive positioning (PITCH-02/03)
- **D-14:** Name Nomad List, WhereNext, and the Teleport→Topia enterprise exit explicitly; state what each cannot do; articulate Potential's three differentiators: live-AI layer, personalized relocation roadmap, immigration concierge. (Carried forward — locked in research/PROJECT.)

### Claude's Discretion
- Exact section ordering within each pitch doc, the specific consumer-app analog chosen for the SOM penetration rate (must be named + cited), and the precise per-channel CAC starting estimates (must be sourced) are left to the researcher/planner — provided every figure is primary-source-cited.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Business model / pricing analog (chosen by founder — highest priority)
- `.planning/research/competitors/16personalities/NOTES.md` — pricing/packaging teardown; THE model to mirror. Read first.
- `.planning/research/competitors/16personalities/reports-for-pros.pdf` — the credit/"runs", never-expire, no-subscription model (Basic/Plus/Premium runs analog).
- `.planning/research/competitors/16personalities/your-profile.pdf` — the free-but-locked/blurred results teaser pattern.
- `.planning/research/competitors/16personalities/premium-career-suite.pdf` — $29 one-time premium bundle + AI-feature-as-hook analog.
- `.planning/research/competitors/16personalities/teams.pdf` — subscription reserved for B2B (confirms recurring belongs to future B2B line).
- `.planning/research/competitors/16personalities/testimonials.pdf` — trust/conversion mechanics.

### Project decisions & requirements
- `.planning/PROJECT.md` §Key Decisions — revised pricing model, 16P decision, visa-concierge moat, Plus-as-upsell.
- `.planning/REQUIREMENTS.md` — PITCH-01…06 (this phase), PITCH-07…09 (Phase 10), TIER-01/02/03 (revised pricing).
- `.planning/ROADMAP.md` §Phase 9 — success criteria; §Phase 8 — revised tier feature mapping (downstream consistency).

### Prior research head-start
- `.planning/research/FEATURES.md` — competitor map, pricing analogs, tier feature ladder, sources.
- `.planning/research/SUMMARY.md` — pitch narrative + open questions.

### Pitch track scaffolding (where deliverables are authored)
- `pitch/README.md` — rubric→doc mapping + non-negotiables (cite everything; verify visa figures against official gov sources).
- `pitch/market-research.md` — PITCH-01/02 (stub to fill).
- `pitch/business-model.md` — PITCH-03/04/06 (stub to fill; pricing table must be updated to the revised model).
- `pitch/financials/` — PITCH-05 (CSV + markdown summary go here).

### Competition rules (source-citation requirement)
- `Entrepreneurship Pitch Competition.pdf` (repo root) — rubric, sources scored directly, protocol.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- This is a documentation phase — no code is produced. The `pitch/` directory and its stub files already exist and are the authoring targets.

### Established Patterns
- The repo's three-track structure (`src/` `shared/` `api/` `pitch/`) gives the pitch track its own folder; Phase 9 commits land in `pitch/` and `.planning/`.
- The revised pricing/packaging (this CONTEXT) must stay consistent with the product tier gate (Phase 8) and results UX (free-locked teaser) — already reconciled in ROADMAP/PROJECT/REQUIREMENTS this session.

### Integration Points
- Phase 9 outputs feed **Phase 10** (deck, Q&A bank, rehearsal). Hybrid doc format (D-01) is chosen specifically so claim/number/source tables drop straight into Canva slides and the Q&A bank.
</code_context>

<specifics>
## Specific Ideas

- **16Personalities is the explicit north star** for pricing, packaging, and the free-locked teaser. Mirror its mechanics (credits never expire, "most popular" badge, sample-report preview) and cite it as the proof point that a one-time, quiz-driven report business works at scale.
- Founder (Gabriel) has lived immigration expertise (F-1 → OPT → O-1A/H-1B) — the visa concierge as the Premium moat is authentic and Q&A-defensible.
</specifics>

<deferred>
## Deferred Ideas

- **B2B employer-benefits product** — named as the future "scaling story" in the pitch (answers the Teleport question) but NOT built in v1. (Already in REQUIREMENTS v2.)
- **Affiliate / attorney-referral network with revenue share** — named as a revenue stream in the model; full build is v2.
- **Real-time visa-policy-change tracking** — reframed as a future Premium add-on / B2B value, no longer tied to a consumer subscription.
- **Money-back guarantee** — considered (16P uses one) and declined for now.
- **Real payment processing / billing** — out of scope; tiers are demonstrable via UI state (DemoTierSwitcher, Phase 8).

None of the above expand Phase 9 scope — discussion stayed within business-substance authoring.
</deferred>

---

*Phase: 9-pitch-business-substance*
*Context gathered: 2026-05-30*
