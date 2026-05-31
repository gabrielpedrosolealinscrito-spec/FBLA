# Phase 9: Pitch — Business Substance - Research

**Researched:** 2026-05-30
**Domain:** FBLA Entrepreneurship Pitch — business-plan substance documents (market sizing, competitive positioning, business model, financials, marketing)
**Confidence:** HIGH (competitor facts, 16Personalities mechanics, Anthropic pricing) / MEDIUM (market sizing layers, CAC benchmarks, SOM analog) / LOW (migration-interest percentages — flag below)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01** — Hybrid format: short narrative intro + claim/number/source table per section.

**D-02** — Bottom-up TAM → SAM → SOM, every layer cited. Source layers: US Census Bureau annual mover data (~8M households), international migration-interest figures, 22–35 demographic segment.

**D-03** — Moderate SOM aggressiveness: ~1–2% of SAM over 3 years. The SOM penetration analog must be named and cited. Single point estimate.

**D-04** — No consumer subscription. All consumer pricing is one-time.

**D-05** — Run-based pricing on a never-expiring credits axis:
- Free $0 — minimal teaser; deeper results/sections blurred/locked (16Personalities "Your Profile" pattern)
- Basic $0.99 — 1 run; single most optimal city + core financial snapshot
- Plus $9.99 — 3 runs; full ranked list (US + international) + financials + live-AI layer + relocation roadmap. Primary upsell target, badged "most popular."
- Premium $29.99 — unlimited runs; everything above + immigration/visa concierge (the moat)

**D-06** — Recurring/scaling revenue: (a) affiliate/referral fees (attorney network, relocation services), (b) future B2B employer-benefits scaling story, (c) soft repeat-purchase angle (people in 20s–30s relocate 2–3x).

**D-07** — 16Personalities conversion tactics to adopt: never-expire credits framing, "most popular" badge on Plus, sample-report / preview transparency. Money-back guarantee: declined.

**D-08** — One base case (no scenarios). Spreadsheet as CSV in `pitch/financials/` + markdown summary table. ~24-month horizon focused on break-even month. Every number re-derivable in ~60 seconds.

**D-09** — Model must include: startup costs (API, legal, marketing), per-channel CAC, LTV by tier, and break-even month — all bottom-up from stated assumptions.

**D-10** — High first-purchase rate (the $0.99 entry is near-frictionless) + low re-run/repeat rate (relocation is infrequent). Anchor to freemium/16Personalities benchmarks (~2–5%), but model $0.99 first-purchase higher.

**D-11** — Live-AI cost is per-run. Tier run-caps (1 / 3 / unlimited) are the margin-protection mechanism. Financial model must show live-AI COGS per run and confirm Plus/Premium stay margin-positive.

**D-12** — Four named acquisition channels with per-channel CAC and audience-fit rationale:
- SEO content ("cost of living in X", "how to move to X", "best cities for [profession]")
- TikTok/Reels + YouTube short-form relocation/expat content
- Reddit / niche communities (r/IWantOut, r/expats, r/digitalnomad, r/SameGrassButGreener)
- University & study-abroad / career-center partnerships

**D-13** — Funnel narrative drives users toward Plus ($9.99) as the primary upsell.

**D-14** — Name Nomad List, WhereNext, and the Teleport→Topia enterprise exit explicitly; state what each cannot do; articulate Potential's three differentiators: live-AI layer, personalized relocation roadmap, immigration concierge.

### Claude's Discretion

- Exact section ordering within each pitch doc
- The specific consumer-app analog chosen for the SOM penetration rate (must be named + cited)
- The precise per-channel CAC starting estimates (must be sourced)

### Deferred Ideas (OUT OF SCOPE)

- B2B employer-benefits product (named as future scaling story in pitch, not built in v1)
- Affiliate / attorney-referral network with revenue share (v2)
- Real-time visa-policy-change tracking (future add-on)
- Money-back guarantee (declined)
- Real payment processing / billing (out of scope)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PITCH-01 | Problem identification & market opportunity, with sized, cited market data | Census mover data, SAM demographic filter, SOM penetration analog — all covered in §Market Sizing below |
| PITCH-02 | Business concept & innovation framed against the competitor landscape (incl. Teleport-exited-to-enterprise narrative) | Competitor facts in §Competitive Positioning; differentiators enumerated |
| PITCH-03 | Value proposition & customer benefit articulated for the target user | Transformation framing + tier-benefit ladder in §Business Model |
| PITCH-04 | Business model — run-based one-time pricing, never-expiring credits, no consumer subscription; recurring via affiliate + future B2B | 16Personalities mechanics in §Business Model; D-05/D-06 locked |
| PITCH-05 | Feasibility & financials — startup costs, unit economics, projections, profitability path, defensible in Q&A | §Financials covers Anthropic COGS, startup costs, CAC, LTV, break-even framing |
| PITCH-06 | Marketing & growth strategy, including how users are driven to the Plus upsell | §Marketing Channels covers four named channels with CAC ranges and audience rationale |
</phase_requirements>

---

## Summary

Phase 9 produces the sourced, defensible business-plan documents that four of the six FBLA rubric dimensions live in. The research task is to supply every quantitative claim these documents need with a primary-source citation before the planner authors any prose.

The market opportunity is real and well-bounded: roughly 8 million US households move each year (Census CPS), and a demographically-filtered slice of 22–35-year-olds who are both mobile and digitally-comfortable constitutes the addressable market. Teleport's exit to enterprise B2B confirms there is no well-capitalized consumer incumbent in city-matching; WhereNext ($15–$79 static PDFs) is the closest emerging rival but lacks the live-AI layer and visa concierge that define Potential's moat.

The business model mirrors 16Personalities exactly in mechanism: free quiz → free-but-locked results → one-time purchase, with credits that never expire and no consumer subscription. This is citable, recognizable, and directly answers the "will people pay one-time?" Q&A challenge. The financial model must show that Plus ($9.99 / 3 runs) and Premium ($29.99 / unlimited runs) both stay margin-positive after Anthropic API COGS — the primary margin risk at unlimited runs.

**Primary recommendation:** Build every number from the bottom up, state every assumption explicitly in the document, and attach a primary-source URL to every figure. The Sources row is a directly-scored rubric dimension; unsourced claims score zero and can collapse the pitch in Q&A.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Market sizing document (PITCH-01) | `pitch/market-research.md` | `.planning/phases/09-*/` | Static doc; no app code |
| Competitive positioning (PITCH-02) | `pitch/market-research.md` | — | Static doc |
| Value prop narrative (PITCH-03) | `pitch/business-model.md` | — | Static doc |
| Business model / pricing table (PITCH-04) | `pitch/business-model.md` | — | Static doc; must match TIER-02 in product |
| Financials model (PITCH-05) | `pitch/financials/model.csv` + `pitch/financials/summary.md` | — | CSV for re-derivability; MD for deck handoff |
| Marketing channels (PITCH-06) | `pitch/business-model.md` | — | Co-located with model |
| Source provenance | All `pitch/*.md` inline | `pitch/README.md` | Every number needs inline URL |

---

## PITCH-01: Market Sizing — Research Findings

### TAM Layer: US Annual Movers

| Claim | Number | Primary Source | Confidence |
|-------|--------|----------------|------------|
| US households that moved in the prior year (CPS ASEC, most recent available annual) | ~8 million households / ~27–28 million individuals | [CITED: US Census Bureau, Current Population Survey / Annual Social and Economic Supplement — "Geographic Mobility" table, released ~Nov each year. URL: https://www.census.gov/topics/population/migration/data/tables.html] | HIGH |
| Share of movers who moved to a different county or state (long-distance, decision-relevant) | ~40% of all movers (~11M individuals) cross-county or cross-state | [CITED: Census CPS Geographic Mobility, Table A-1] | HIGH |
| Typical annual interstate mover total | ~7–8 million people | [CITED: Census CPS, same table] | HIGH |

**TAM framing for pitch:** "Each year, roughly 28 million Americans relocate. The subset who move across county or state lines — the people making an active destination decision — numbers ~11 million." TAM = 11M individuals per year making a meaningful geographic choice.

> **FOUNDER MUST VERIFY:** Pull the specific CPS table year and confirm the exact household vs. individual count for the year the pitch is given (2025–2026 data may be released by competition date). URL: https://www.census.gov/topics/population/migration/data/tables.html

---

### SAM Layer: 22–35 + Digitally Engaged Subset

| Claim | Number | Primary Source | Confidence |
|-------|--------|----------------|------------|
| US population aged 22–34 (approximate) | ~55–57 million | [CITED: Census Bureau, American Community Survey 1-Year Estimates, Table B01001. URL: https://data.census.gov/] | HIGH |
| Annual mobility rate for 25–34 age group (highest of any adult cohort) | ~16–18% move per year vs. ~9% population average | [CITED: Census CPS Geographic Mobility historical tables. URL: https://www.census.gov/data/tables/time-series/demo/geographic-mobility/historic.html] | HIGH |
| Smartphone/internet penetration for 18–34 cohort | ~99% own a smartphone | [CITED: Pew Research Center, "Mobile Fact Sheet." URL: https://www.pewresearch.org/internet/fact-sheet/mobile/] | HIGH |

**SAM framing for pitch:** Apply the 22–35 demographic filter to the cross-county/state mover pool (~11M/yr), weight by age-group share of total population (~18%), and narrow further to the digital-first segment. Conservative SAM = ~2 million people per year who are both mobile and digital-first.

> **ASSUMPTION NOTE [ASSUMED]:** The exact SAM number (2M) is derived from layering Census proportions. The inputs are HIGH confidence; the arithmetic layer is the researcher's derivation. Present as "approximately 2 million addressable movers per year in our target demographic" and show the derivation in the financials CSV.

---

### International Migration Interest

| Claim | Number | Primary Source | Confidence |
|-------|--------|----------------|------------|
| Share of Americans who have seriously considered moving abroad | ~15–20% say they have considered it | [ASSUMED — sourced from Gallup World Poll "Potential Net Migration" surveys, but specific US % for 22–35 subgroup not confirmed from official Gallup release in this session. VERIFY: https://news.gallup.com/poll/245789/750-million-worldwide-migrate.aspx] | LOW |
| "Digital nomad" workers (remote + location-independent, US-based) | ~17 million Americans identify as digital nomads (2023 MBO Partners) | [CITED: MBO Partners, "The Digital Nomad Search for Flexibility," 2023 State of Independence report. URL: https://www.mbopartners.com/state-of-independence/] | MEDIUM |

**Usage note:** Use the MBO Partners digital nomad figure as an "expanding international interest" proof point, not a precision market number. Flag the Gallup international-migration-interest figure as requiring founder verification before the pitch — it needs a current, citable Gallup release.

---

### SOM Layer: 3-Year Penetration

**Locked (D-03):** 1–2% of SAM over 3 years. Single point estimate.

**Recommended SOM analog for citation:** Truity (personality/career assessment platform, same free-quiz-to-paid-report funnel, direct consumer market). Truity has published user counts; as of available data, crossed 35 million users from a comparable free-test-to-paid funnel. [CITED: Truity "About" page, https://www.truity.com/about] MEDIUM confidence.

Alternative SOM analog if Truity data is insufficient for Q&A: **16Personalities** — NERIS Analytics states 100M+ test-takers. [CITED: 16personalities.com home page] HIGH confidence for the brand; the penetration rate derivation is still [ASSUMED].

**SOM calculation (for financials CSV):**
- SAM = ~2 million movers per year in target demo
- 3-year cumulative addressable = 6 million potential users
- 1% SOM = 60,000 paid conversions over 3 years
- At 50/30/20 mix of Basic/Plus/Premium, blended revenue per paid user ≈ $10–$12
- 3-year revenue from SOM at 1% = $600K–$720K

> SOM derivation is [ASSUMED] arithmetic. Present the formula openly so judges can follow it; this is the standard expected approach in FBLA feasibility sections.

---

## PITCH-02/03: Competitive Positioning — Research Findings

### Competitor Facts (all confirmed from live product inspection May 2026 or official press release)

| Competitor | Model | What It Does | What It Cannot Do | Source |
|------------|-------|-------------|-------------------|--------|
| **Nomad List / nomads.com** | One-time $9.99–$19.99 lifetime membership | City scores across 100+ factors, community forum, filter by lifestyle criteria | No personalized roadmap; no visa pathway; no financial projection for the user's actual income; no AI layer | [VERIFIED: live product inspection, nomads.com, May 2026] |
| **WhereNext (getwherenext.com)** | Free tools + $15/$29/$49/$79 one-time PDFs | 95 countries, 380 cities; relocation case + static PDF reports; 90-day action plan | No live-AI layer; no real job/housing listings; no immigration concierge; static output only | [VERIFIED: live product inspection, getwherenext.com, May 2026. URL: https://getwherenext.com/] |
| **Teleport.org → Topia** | Was free consumer product; acquired and folded into enterprise B2B | City matching across 266 cities, quality-of-life scores — was the most prominent DTC city-matcher | Exited the standalone consumer market entirely; Teleport acquired by MOVE Guides in 2022, folded into Topia's enterprise global-mobility platform | [VERIFIED: Topia press release. URL: https://www.topia.com/company/news/press-release-move-guides-acquires-teleport/] |
| **Numbeo** | Free, ad-supported | Crowdsourced cost-of-living data, city comparison | No personalization, no matching algorithm, no roadmap | [VERIFIED: live product inspection, numbeo.com, May 2026] |
| **SmartAsset** | Free, lead-gen | Cost-of-living calculator, salary comparison | Lead-gen product — sells financial advisor referrals; not designed for user outcomes | [VERIFIED: live product inspection, smartasset.com, May 2026] |
| **Niche.com** | Free, ad-supported | Data-ranked US neighborhoods, resident reviews | US-only; no personalization quiz; no roadmap; no international | [CITED: Niche.com methodology page. URL: https://www.niche.com/places-to-live/rankings/methodology/] |

### Teleport Exit Narrative (the moat proof point)

**Claim:** Teleport was the most ambitious prior attempt at consumer city-matching (266 cities, quality-of-life scores, quiz-driven). It was acquired by MOVE Guides and folded into Topia's enterprise B2B global-mobility platform. The consumer product is no longer available as a standalone DTC service.

**Why this matters for the pitch:** It proves the consumer market was not won — it was abandoned. No well-capitalized player is doing what Potential does for individual consumers. The gap is real and validated by the market leader's exit.

[VERIFIED: Topia.com press release. URL: https://www.topia.com/company/news/press-release-move-guides-acquires-teleport/]

### Potential's Three Differentiators

| Differentiator | What Competitors Offer | What Potential Offers | Tier |
|---------------|----------------------|----------------------|------|
| **Live-AI layer** (real jobs, real housing, day-in-the-life narrative) | None — all competitors show static data tables | LLM-powered real-time listings fetched at run time via Anthropic API; personalized to user's career + income profile | Plus |
| **Personalized relocation roadmap** | WhereNext: static PDF. All others: nothing. | Dynamic 6-section roadmap generated from user's citizenship, timeline, job situation, and finances | Plus |
| **Immigration/visa concierge** | No city-matching competitor has this feature | Eligibility screener → pathway comparison → document checklist → cost/timeline → attorney referral; scoped as informational + disclaimer | Premium |

---

## PITCH-04: Business Model & 16Personalities Mechanics — Research Findings

### 16Personalities Pricing Facts (confirmed from official product pages)

| 16Personalities Product | Price | Mechanics | Source |
|------------------------|-------|-----------|--------|
| Premium Career Suite | **$29 one-time** | AI career mentors as the hook; 30-day money-back guarantee (DECLINED for Potential — D-07); single purchase, not subscription | [VERIFIED: https://www.16personalities.com/premium/career-suite — live product page, May 2026] |
| Reports for Pros (credit model) | **$9 per report credit**; bulk pricing available | "Credits never expire," "no commitment or subscription required," pricing calculator for volume | [VERIFIED: https://www.16personalities.com/premium/reports — live product page, May 2026] |
| Teams (B2B) | **$9/month per seat**; save 50% annually | Subscription reserved for B2B/Teams — confirms recurring revenue belongs to future B2B line, not individual consumer | [VERIFIED: https://www.16personalities.com/premium/teams — live product page, May 2026] |

### Freemium Conversion Benchmarks

| Benchmark | Number | Source | Confidence |
|-----------|--------|--------|------------|
| Typical SaaS freemium-to-paid conversion rate | 2–5% | [CITED: FirstPageSage, "SaaS Freemium Conversion Rates." URL: https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/ AND Userpilot, "Freemium Conversion Rate." URL: https://userpilot.com/blog/freemium-conversion-rate/] | MEDIUM |
| 16Personalities (outlier) — estimated conversion | Not publicly disclosed by NERIS Analytics | [ASSUMED — company does not publish a conversion rate. Use the 2–5% benchmark range, then argue $0.99 entry price justifies modeling first-purchase rate higher (8–12%) due to near-frictionless micro-price.] | LOW — flag for founder verification |
| Truity conversion range (personality reports $9–$19) | Not publicly disclosed | [ASSUMED — use same benchmark range] | LOW |

**Modeling guidance (D-10):** The $0.99 Basic tier is priced explicitly to be impulse-buy frictionless (less than a coffee). Model first-purchase conversion at 8–12% (2–3x the standard freemium benchmark) with the justification that the price point reduces decision friction to near-zero. This is a stated, defended assumption — not a claim from published data.

### Run-Based Pricing Table (locked by D-05)

| Tier | Price | Runs (Credits) | Key Feature Unlocks | Role in Funnel |
|------|-------|---------------|--------------------|----|
| Free | $0 | 0 (teaser only) | Quiz + #1 match + 1 headline financial figure; all deeper sections blurred/locked | Top-of-funnel hook; drives curiosity |
| Basic | $0.99 | 1 run | Single most optimal city + core financial snapshot (full breakdown) | Near-frictionless entry; anchors price ladder |
| **Plus** | **$9.99** | **3 runs** | Full ranked list (US + international) + financials + live-AI layer + relocation roadmap | **Primary upsell target; "most popular" badge** |
| Premium | $29.99 | Unlimited runs | Everything + immigration/visa concierge (the moat) | High-value international-bound user |

**Never-expire framing (from 16Personalities Reports for Pros):** "Your runs never expire. Use them when you're ready." Removes "use it or lose it" objection entirely. [VERIFIED: 16personalities.com/premium/reports]

### Revenue Streams (D-06)

1. **One-time run purchases** (primary, v1) — Basic / Plus / Premium.
2. **Affiliate / referral fees** (v1 soft launch, v2 formal) — immigration attorney referrals, relocation service referrals. Tie to founder's immigration expertise. No published CAC data for this channel — [ASSUMED] at $0 CAC (organic referral at checkout). Revenue: 10–20% referral fee on attorney consultations (~$150–$500 per referral).
3. **Future B2B employer-benefits product** (scaling story for pitch, not built in v1) — the answer to "Teleport pivoted to enterprise; why won't you?" Subscription SaaS model for employer HR portals. Revenue: $50–$200/seat/month [ASSUMED].
4. **Soft repeat-purchase** (demand-side natural recurrence) — people in their 20s–30s relocate 2–3x; each new move-decision is a new run purchase. No subscription needed; demand recurs naturally.

---

## PITCH-05: Financials — Research Findings

### Anthropic API Cost Per Run (the critical COGS input)

| Model | Input token cost | Output token cost | Typical run COGS | Source |
|-------|-----------------|-------------------|-----------------|--------|
| claude-3-5-haiku-20241022 | $0.80 / 1M input tokens | $4.00 / 1M output tokens | ~$0.01–$0.03 per run | [CITED: Anthropic pricing page. URL: https://www.anthropic.com/pricing — confirmed May 2026] |
| claude-3-5-sonnet-20241022 | $3.00 / 1M input tokens | $15.00 / 1M output tokens | ~$0.05–$0.15 per run | [CITED: Anthropic pricing page. URL: https://www.anthropic.com/pricing] |
| claude-opus-4 (if used) | $15.00 / 1M input tokens | $75.00 / 1M output tokens | ~$0.30–$1.00 per run | [CITED: Anthropic pricing page. URL: https://www.anthropic.com/pricing] |

**Recommended model for production:** claude-3-5-haiku for the live-AI listing generation (low-stakes, high-frequency). Reserve Sonnet or Opus only if roadmap/visa quality requires richer generation. At Haiku: COGS per Plus run ≈ $0.02–$0.04. Plus revenue = $9.99 for 3 runs = $3.33 per run. Gross margin per Plus run ≈ 99%+ (Haiku) even after hosting costs.

**Web search tool (web_search_20250305):** $10 per 1,000 searches, capped at `max_uses: 3` per run = $0.03 per run in search costs. [CITED: Anthropic tool pricing, https://www.anthropic.com/pricing]

**Total COGS per Plus run (Haiku + 3 web searches):** ~$0.05–$0.07. Revenue per Plus run: $3.33. Gross margin: ~97–98%. [ASSUMED arithmetic from confirmed per-token pricing]

**Premium unlimited-run margin risk:** Must show in the financial model. At 10 runs/month per Premium user, COGS ≈ $0.50–$0.70/month. Premium revenue = $29.99 one-time (not monthly). Break-even on Premium requires the user not to run >600 times total (extreme outlier). Model shows margin-positive at any realistic use pattern. [ASSUMED arithmetic]

> **FOUNDER MUST VERIFY:** Pull current Anthropic pricing from https://www.anthropic.com/pricing before the pitch. Prices change; the model you use in the demo may differ from the above.

### Startup Costs

| Item | Estimated Cost | Notes | Confidence |
|------|---------------|-------|------------|
| Anthropic API (first 6 months, demo + early users) | $50–$200 | At Haiku rates; heavy demo use + small user base | [ASSUMED] — derive from run estimate |
| Domain registration (1 year) | $12–$15 | Namecheap / Google Domains | [ASSUMED] |
| Hosting — Vercel Hobby (non-commercial, free) or Vercel Pro ($20/mo) | $0–$240/yr | Hobby ToS: non-commercial; Pro for commercial use. Verify ToS before pitch claim. | [CITED: vercel.com/pricing — May 2026] MEDIUM |
| Legal / business registration (LLC or sole prop) | $50–$500 | Varies by state; [ASSUMED] — founder to confirm jurisdiction and entity type | LOW |
| Marketing / content (first 6 months) | $0–$500 | Reddit posts = $0; TikTok content = time, not cash; SEO = time; paid ads if any | [ASSUMED] |
| Total startup cost (conservative) | **$200–$1,500** | Lean startup; majority is time, not cash | [ASSUMED] |

**Key pitch point:** The startup cost is extremely low because the product is AI-native (no data pipeline to maintain, no team to hire day one, no server farm). Marginal cost of serving an additional user is near-zero (API call + Vercel edge function). This is a true software-margin business from day one.

### Per-Channel CAC Estimates

> All per-channel CAC figures are [ASSUMED] estimates based on industry benchmarks. They are stated assumptions in the model, not verified campaign data. Present them as "modeled assumptions" and show sensitivity in Q&A.

| Channel | Estimated CAC | Basis | Confidence |
|---------|-------------|-------|------------|
| SEO content (organic) | $5–$15 per paid user | Time investment amortized over traffic. Typical B2C content CAC from HubSpot / FirstPageSage benchmarks: $5–$30 for content-driven acquisition | [ASSUMED — cite: HubSpot "Customer Acquisition Cost" benchmarks. URL: https://blog.hubspot.com/marketing/customer-acquisition-cost] |
| Reddit / community (organic) | $0–$5 per paid user | Near-zero cash cost; founder credibility in expat/nomad communities makes authentic posts convert well. Modeled as $2 avg (time-valued) | [ASSUMED] |
| TikTok/Reels (organic content) | $5–$20 per paid user | Organic short-form; high variance. Low cost if founder creates content; $0 cash but significant time. If boosted: TikTok CPM ~$10 → with 1% conversion on landing → CAC ~$20 | [ASSUMED — cite: social media CPM benchmarks; e.g., Sprout Social or WordStream published benchmarks. URL: https://www.wordstream.com/blog/ws/2021/02/08/tiktok-ads] |
| University / career-center partnerships | $10–$30 per paid user | Longer cycle; higher intent audience. Modeled as time cost of outreach + potential rev-share. Excludes any licensing fee (v2). | [ASSUMED] |
| **Blended CAC (weighted avg)** | **~$8–$12** | Assumes 50% SEO, 30% Reddit, 15% TikTok, 5% university | [ASSUMED] |

### LTV by Tier

| Tier | One-Time Revenue | Expected Repeat Purchases (3-yr) | Estimated LTV | Notes |
|------|-----------------|----------------------------------|--------------|-------|
| Basic | $0.99 | 0.3× (30% buy again within 3 yrs) | ~$1.30 | Likely upsells to Plus on next move |
| Plus | $9.99 | 0.4× | ~$14 | Primary upsell; most users stop here |
| Premium | $29.99 | 0.5× | ~$45 | International movers; visa policy may change |
| **Blended** (50/30/20 mix) | ~$10 avg | — | **~$13–$15** | [ASSUMED mix; model sensitivity] |

> The "no subscription" model means LTV is lower than a SaaS product. **This is the intended trade-off.** The pitch must defend it: "Our market is defined by a one-time life decision. Trying to charge monthly for a decision that happens once would destroy the customer relationship. Instead, we earn repeat business by being genuinely useful — and the data shows young adults relocate 2–3× in their 20s–30s." [ASSUMED claim about 2–3x relocations — verify against Census mobility data for 25–34 cohort.]

### Break-Even Framing

**Break-even formula:** Total startup costs ÷ Blended margin per paid user

At startup costs of $1,000 and blended net revenue of ~$9 per paid user (after Anthropic COGS):
- Break-even = **~112 paid users**

At 1,000 free users/month with 5% conversion = 50 paid users/month → break-even at **month 3** (conservative).

> These are [ASSUMED] projections built from stated assumptions. The model CSV must show the math line-by-line so judges can audit it in Q&A. The goal is not to have perfect numbers — it is to have numbers that are 100% re-derivable from transparent inputs.

### Financial Model Structure (for the CSV)

The `pitch/financials/model.csv` should have one row per month for 24 months with these columns:

```
Month | Free_Users | Paid_Users | Basic_Rev | Plus_Rev | Premium_Rev | Total_Rev | API_COGS | Hosting | Marketing_Spend | Net_Income | Cumulative_Net
```

Assumptions tab (separate sheet or header rows):
- Free-to-any-paid conversion rate: 5% (month 1–6), 7% (month 7–12), 8% (month 13–24)
- Basic/Plus/Premium mix: 50%/35%/15%
- Blended CAC: $10
- API COGS per run: $0.06 (Haiku + web search)
- Hosting: $0 (Vercel Hobby) or $20/mo (Vercel Pro after revenue)
- Monthly free user growth: 500 (month 1) → 1,500 (month 6) → 3,000 (month 12)

---

## PITCH-06: Marketing Channels — Research Findings

### Channel 1: SEO Content

**Target queries:** "cost of living in [city]", "how to move to [city]", "best cities for [profession] salary", "is [city] affordable for [income]", "moving to [country] from USA guide"

**Audience fit:** High-intent users already in the consideration phase. SEO traffic converts at higher rates than social because users are actively searching the problem Potential solves.

**CAC:** $5–$15 (time-valued content creation). Cash cost near zero.

**Cited benchmark:** HubSpot CMO Survey data; organic search CAC is consistently the lowest of any digital channel for consumer SaaS. [ASSUMED — cite HubSpot or similar. Founder to confirm specific figure before pitch.]

**Content playbook:** 12 city-comparison landing pages (one per city in the golden path: Lisbon, Berlin, Toronto, London, plus top 8 US cities). Each page answers the "cost of living + my salary" question and funnels to the free quiz.

### Channel 2: TikTok / Reels / YouTube Shorts

**Target content:** "I made a quiz to find your perfect city" (demo format), "what $3K/month looks like in Lisbon vs Austin", "as someone who navigated O-1A, here's what most people get wrong about moving abroad"

**Audience fit:** 18–30 demographic. Relocation content is a documented high-engagement niche on TikTok (#movingabroad, #digitalnomad, #expat). Founder's immigration background makes this content authentic and defensible.

**CAC:** $5–$20 (organic). If paid: TikTok CPM ~$10, assumed 1% click-to-free-user conversion, 5% free-to-paid → implied paid CAC ~$200 (paid ads only). Model organic-first. [ASSUMED — WordStream TikTok Ads benchmark for CPM: https://www.wordstream.com/blog/ws/2021/02/08/tiktok-ads]

**Why it works for this product:** The product IS the content — the quiz flow and results page are inherently screen-recordable demos. No production budget needed; screen recording of the demo converts.

### Channel 3: Reddit / Niche Communities

**Target subreddits:** r/IWantOut (476K members), r/digitalnomad (2.3M members), r/SameGrassButGreener (290K members), r/expats (262K members), r/cscareerquestions (823K members — career-change angle)

**Audience fit:** Highest-intent audience of any channel. These communities exist specifically because people are actively considering or executing relocations. Founder's F-1→OPT→O-1A experience gives authentic credibility.

**CAC:** $0–$5 (effectively zero cash; time cost of authentic participation). Reddit is hostile to marketing spam but welcoming to genuine product shares from members of the community.

**Rule:** Never post promotional content. Share the quiz as a resource when someone asks "how do I decide where to move?". Build trust first, mention the product second.

> [ASSUMED subreddit member counts — these fluctuate. Verify before pitch at reddit.com/r/[subredditname]]

### Channel 4: University / Study-Abroad / Career-Center Partnerships

**Target institutions:** University career centers, study-abroad offices, international student offices

**Audience fit:** 20–24 demographic facing the "where next?" question immediately post-graduation. Study-abroad students returning with international appetite. International students on F-1/OPT weighing where to go after US degree.

**CAC:** $10–$30 (longer sales cycle; email outreach + demo meeting). Lower cash cost; higher time cost.

**Partnership model (v1):** Free access / revenue share for students via a career-center affiliate link. Career center gets a % of conversions their students make; founder gets a warm, high-intent channel.

**Why universities:** Aligns with Gabriel's background (F-1 student → OPT → O-1A). The founder's credibility is strongest here — speaking directly to international students navigating the same path.

### Funnel Narrative Toward Plus

**The conversion ladder:**

```
Free quiz completion
    ↓ (100% — quiz is compelling, completes itself)
See #1 match city + 1 headline number (free teaser)
    ↓ (~10–15% immediately want full list)
$0.99 Basic purchase — full ranked list + financials
    ↓ (show Plus upsell: "See how to actually get there")
$9.99 Plus purchase — live-AI + full roadmap [PRIMARY UPSELL]
    ↓ (show Premium upsell for international movers only)
$29.99 Premium purchase — visa concierge
```

**Key insight:** The $0.99 → $9.99 step is the most important upsell in the model. After a user pays $0.99, the psychology of sunk cost + curiosity ("I already paid, let me see the full picture") makes the $9.99 Plus upgrade feel like the obvious next step.

---

## Validation Architecture

This section frames how each PITCH deliverable's quantitative claims get source-verified and stress-tested for Q&A before the pitch goes live.

### Source Verification Protocol

| Claim Category | Verification Method | Who Verifies | Timing |
|---------------|--------------------|----|--------|
| Census mover numbers | Pull current CPS Geographic Mobility table from census.gov/topics/population/migration/data/tables.html | Founder (Gabriel) | Before Phase 9 docs are finalized |
| Anthropic API pricing | Load https://www.anthropic.com/pricing; capture exact per-token rates for model used in demo | Developer | At Phase 5 (proxy build) and again at Phase 9 authoring |
| 16Personalities pricing ($29 Career Suite, $9/report) | Load each product page; screenshot with date | Researcher / Founder | Confirmed May 2026 — re-verify if >30 days elapsed before pitch |
| WhereNext pricing ($15/$29/$49/$79) | Load getwherenext.com pricing page | Researcher / Founder | Confirmed May 2026 — re-verify |
| Teleport → Topia acquisition | Load Topia press release URL | Researcher / Founder | Confirmed May 2026 |
| Freemium conversion benchmarks (2–5%) | Load firstpagesage.com and userpilot.com articles; screenshot | Researcher | Confirmed May 2026 |
| Subreddit member counts | Load each reddit.com/r/[name] page day of pitch | Founder | Day before competition |
| MBO Partners digital nomad figure | Load mbopartners.com/state-of-independence | Researcher | Confirm year of report used |
| International migration-interest % | **FLAGGED LOW CONFIDENCE** — founder must find a citable Gallup or Pew source | Founder | Before market-research.md is finalized |

### Q&A Stress-Test Map

| Likely Judge Question | The Answer (from this research) | Source to Cite Aloud |
|----------------------|--------------------------------|---------------------|
| "How big is your market, really?" | ~11M cross-county/state movers annually; 22–35 cohort at 16–18% annual mobility rate = ~2M addressable | Census CPS Geographic Mobility |
| "Why won't people just use Nomad List?" | Nomad List is static data; no personalized roadmap, no financial projection for YOUR income, no visa pathway | Live product comparison |
| "Teleport tried this — what happened?" | Teleport exited DTC and was acquired into enterprise B2B (Topia). No consumer incumbent exists. | Topia press release |
| "Will people pay one-time for a quiz result?" | 16Personalities built a large profitable business on exactly this funnel ($29 one-time, $9/report credits that never expire). | 16personalities.com product pages |
| "What's your API cost per user?" | ~$0.06 per Plus run (Haiku + 3 web searches). Revenue per run: $3.33. Gross margin 98%. | Anthropic pricing page |
| "What's your CAC?" | Blended $8–$12, assumed from content marketing and organic community channels. Organic-first keeps CAC near zero in year 1. | Stated assumption; HubSpot benchmarks |
| "How do you break even?" | ~112 paid users covers startup costs. At 5% conversion on 1,000 monthly free users = 50 paid/month → break-even month 3. | Model CSV (derivable in 60 seconds) |
| "Isn't giving visa advice practicing law?" | No — we provide general information and refer to licensed attorneys. UPL boundary is clearly defined: we never prepare forms, advise on specific merits, or represent users. | ILRC screening methodology; Boundless model |
| "How do you prevent someone from running Premium forever?" | Premium runs are unlimited but per-profile. Each run is a fresh city-matching decision. Real use pattern: 5–10 runs total. Even at 100 runs, COGS = $6. Premium revenue = $29.99. Still margin-positive. | Anthropic per-token pricing |
| "Why no subscription?" | Relocation is a one-time life decision. Charging monthly for a one-time decision destroys the customer relationship. We earn repeat revenue from natural life recurrence (people move 2–3× in their 20s–30s) and future B2B. | 16Personalities Teams (B2B sub), $9/mo/seat — confirms subscription belongs to B2B |

### Claims That Require Founder Verification Before Pitch Day

| # | Claim | Why Flagged | Action Required |
|---|-------|-------------|-----------------|
| F1 | "X% of Americans have considered moving abroad" | LOW confidence; no verified current Gallup/Pew release found | Founder: search Gallup World Poll or Pew Global for US "willing to migrate" or "considered moving abroad" data. URL to check: https://news.gallup.com/poll/migration.aspx |
| F2 | Exact Census mover count for most recent year | CPS data updates annually; confirm the specific table number and year | Founder: pull from https://www.census.gov/topics/population/migration/data/tables.html |
| F3 | Exact Anthropic per-token costs at pitch time | API pricing changes; the model used in the demo may differ from above | Developer: screenshot pricing page within 2 weeks of pitch |
| F4 | 16Personalities current pricing ($29 Career Suite, $9/report) | Pricing can change; confirmed May 2026 but could update | Founder: re-verify if >30 days before pitch |
| F5 | Reddit community member counts | Fluctuate daily | Founder: check day before competition |
| F6 | WhereNext pricing tiers | Small company; pricing can change | Founder: verify week before pitch |
| F7 | "People relocate 2–3× in their 20s–30s" claim | Used as LTV rationale; needs a Census or BLS source | Founder: search Census ACS lifetime mobility data or BLS migration tables |

---

## Standard Stack (for pitch-document authoring — no app code)

| Tool | Purpose | Notes |
|------|---------|-------|
| Markdown (this repo) | Source of truth for all pitch docs | `pitch/market-research.md`, `pitch/business-model.md`, `pitch/financials/summary.md` |
| CSV (spreadsheet) | Financial model | `pitch/financials/model.csv` — one row per month, 24 months; must be derivable from stated assumptions |
| Canva | Slide deck (Phase 10) | Phase 9 outputs feed Canva in Phase 10 — keep claim/source tables clean for copy-paste |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Market sizing | Custom "proprietary" survey | Cite Census CPS and BLS — authoritative, free, defensible |
| API cost estimates | Estimates from memory | Pull from Anthropic pricing page; screenshot; cite URL |
| Competitor pricing | Claim from memory | Load each competitor's pricing page; screenshot; date it |
| Conversion rate benchmarks | Make up a number | Cite FirstPageSage / Userpilot freemium benchmarks (confirmed sources) |
| SOM penetration defense | Unsupported % | Name and cite an analog (Truity / 16Personalities funnel size) |

---

## Common Pitfalls

### Pitfall 1: Unsourced Numbers Score Zero
**What goes wrong:** Presenter states "the relocation market is $X billion" without a URL.
**Why it happens:** Macro market-size figures (TAM stated as "$X billion industry") are hard to source credibly for a niche product. Bottom-up derivation is both easier to source and more defensible.
**How to avoid:** Never state a macro figure without a primary source. Use the bottom-up derivation (Census movers × demographic filter) instead. Every number has a URL. Present the formula, not just the answer.

### Pitfall 2: Financial Model Caves in Q&A
**What goes wrong:** Judges ask "how did you get that CAC?" and the answer is "it seemed reasonable."
**Why it happens:** CAC is estimated, not measured (no product is live yet). The defensible response is to present it openly as a stated assumption with an industry benchmark anchor, not as a measured fact.
**How to avoid:** Label every assumption as an assumption in the CSV. Know the benchmark source. Be ready to say "our blended CAC of $10 is modeled; the SEO anchor is the HubSpot B2C content marketing CAC benchmark of $5–$30."

### Pitfall 3: Subscription Framing Slips Back In
**What goes wrong:** Old docs still say "Premium ~$99 or $9.99/month subscription." D-04 locked out consumer subscriptions.
**How to avoid:** Search all pitch docs for "subscription" and "$9.99/month" before finalizing. The only subscription-like framing that should exist is the future B2B employer-benefits scaling story — explicitly named as v2, not v1.

### Pitfall 4: UPL Overclaim on Visa Concierge
**What goes wrong:** Pitch copy says "we give you immigration advice" or "we'll help you get your visa."
**Why it happens:** It sounds more valuable. But it exposes the founder to Unauthorized Practice of Law liability and is a credibility bomb in judge Q&A.
**How to avoid:** All visa copy: "We map published visa requirements to your profile. For legal advice on your specific situation, consult a licensed immigration attorney." Keep the attorney-referral CTA as the bridge.

### Pitfall 5: Teleport Narrative Underused
**What goes wrong:** The Teleport → Topia exit is the strongest market-gap proof point in the pitch and is often left as a footnote.
**How to avoid:** Lead the competitive positioning section with it. "The most serious prior attempt at consumer city-matching — Teleport, with 266 cities — exited the consumer market entirely and was absorbed into enterprise B2B. No well-capitalized player is doing this for individual consumers. That gap is what Potential fills."

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | SAM = ~2M movers/year (22–35, digital-first) | Market Sizing | If the Census-derived number is materially different, the SOM calculation changes. Low impact if the formula is shown transparently — judges follow the logic, not the exact number. |
| A2 | International migration interest % (15–20% of Americans) | Market Sizing | [F1 flagged] — if no credible source found, drop this figure entirely and use MBO Partners digital nomad count instead. |
| A3 | $0.99 first-purchase conversion rate ~8–12% | Business Model | If lower (5%), break-even extends to month 5–6, not month 3. Model is still viable; just show sensitivity. |
| A4 | Blended CAC = $8–$12 | Marketing | If organic channels underperform, real CAC could be $20–$40. This extends break-even but does not change the fundamental model. |
| A5 | Basic/Plus/Premium revenue mix = 50%/35%/15% | Financials | Mix could skew toward Basic (lower LTV). Model sensitivity: even 70% Basic, $9 blended LTV, still break-even at ~150 paid users. |
| A6 | People relocate 2–3× in their 20s–30s | LTV rationale | If 1× is more accurate, LTV is lower. However, the one-time pricing model is already calibrated to 1× — repeat is upside, not the base case. |
| A7 | 16Personalities has not changed pricing since May 2026 | Business Model | If prices changed, the analog shifts. Truity ($9–$19 reports) is the fallback analog. |

---

## Open Questions

1. **International migration-interest primary source (F1)**
   - What we know: MBO Partners says 17M digital nomads; Gallup World Poll tracks potential migration interest globally
   - What's unclear: A specific, citable US percentage for the 22–35 cohort considering international relocation
   - Recommendation: If no clean Gallup/Pew figure is found, omit the percentage and use the MBO Partners digital nomad count as the international-interest proxy. Do not use an unverifiable statistic in a scored pitch.

2. **Exact Census CPS table for current year (F2)**
   - What we know: CPS ASEC "Geographic Mobility" table; URL confirmed; ~28M individual movers annually
   - What's unclear: Exact year-release available at pitch time
   - Recommendation: Founder pulls the table, records the year, and uses the specific published number. Do not use "approximately" without a year anchor.

3. **Vercel ToS for commercial use**
   - What we know: Vercel Hobby is "non-commercial only"; Vercel Pro is $20/month and commercial-OK
   - What's unclear: Whether the competition demo running on Hobby violates ToS (demo is not a commercial transaction)
   - Recommendation: Use Vercel Pro ($20/mo) in the financial model's startup costs for cleanliness. Do not build a pitch narrative around Hobby-plan hosting for a commercial product.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 9 produces only documentation (markdown + CSV). No external tools, databases, or CLIs are required beyond a text editor and a spreadsheet application.

---

## Sources

### Primary (HIGH confidence)
- US Census Bureau, CPS Geographic Mobility tables — https://www.census.gov/topics/population/migration/data/tables.html
- 16Personalities Premium Career Suite ($29) — https://www.16personalities.com/premium/career-suite (confirmed May 2026)
- 16Personalities Reports for Pros ($9/credit, never expire) — https://www.16personalities.com/premium/reports (confirmed May 2026)
- 16Personalities Teams ($9/mo/seat, B2B) — https://www.16personalities.com/premium/teams (confirmed May 2026)
- Topia press release (Teleport acquisition) — https://www.topia.com/company/news/press-release-move-guides-acquires-teleport/ (confirmed May 2026)
- WhereNext pricing and feature inspection — https://getwherenext.com/ (confirmed May 2026)
- Anthropic API pricing (per-token rates for Haiku, Sonnet, Opus) — https://www.anthropic.com/pricing (confirmed May 2026)
- Vercel pricing — https://vercel.com/pricing (confirmed May 2026)

### Secondary (MEDIUM confidence)
- MBO Partners 2023 State of Independence — digital nomad count — https://www.mbopartners.com/state-of-independence/
- Pew Research Center Mobile Fact Sheet (99% smartphone ownership, 18–34) — https://www.pewresearch.org/internet/fact-sheet/mobile/
- FirstPageSage freemium SaaS conversion rates (2–5%) — https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/
- Userpilot freemium conversion rate analysis — https://userpilot.com/blog/freemium-conversion-rate/
- HubSpot CAC benchmarks — https://blog.hubspot.com/marketing/customer-acquisition-cost
- WordStream TikTok Ads CPM — https://www.wordstream.com/blog/ws/2021/02/08/tiktok-ads
- Niche.com methodology — https://www.niche.com/places-to-live/rankings/methodology/
- Truity pricing ($9–$19 reports) — https://www.truity.com/about (confirmed May 2026)

### Tertiary (LOW confidence — verify before use in pitch)
- Gallup World Poll "Potential Net Migration" — https://news.gallup.com/poll/245789/750-million-worldwide-migrate.aspx (international migration interest % for 22–35 US cohort NOT confirmed from this source — founder must verify)

---

## Metadata

**Confidence breakdown:**
- Market sizing (TAM/SAM layers): HIGH — Census CPS URL confirmed
- Market sizing (SOM analog, migration interest %): MEDIUM/LOW — derivation is researcher's arithmetic; international % flagged for founder verification
- Competitor facts: HIGH — live product inspection May 2026 for all named competitors
- 16Personalities mechanics: HIGH — confirmed from official product pages May 2026
- Anthropic COGS: HIGH — confirmed from official pricing page May 2026
- CAC estimates: LOW/ASSUMED — no live campaign data; stated as modeled assumptions
- Conversion rates: MEDIUM — secondary sources (FirstPageSage, Userpilot) with consistent findings
- Financial model structure: HIGH — model shape is sound; inputs are assumptions

**Research date:** 2026-05-30
**Valid until:** 2026-06-30 (30 days; Anthropic pricing and competitor pricing can change — re-verify before pitch)
