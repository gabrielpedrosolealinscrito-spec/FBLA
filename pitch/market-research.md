# Market Research & Problem (PITCH-01, PITCH-02)

> **Status:** Authored — Phase 9 Plan 01. Every quantitative claim carries a source cell or a visible `[FOUNDER-VERIFY: Fn]` marker. Sources section enumerates every URL used (scored rubric row).

---

## 1. The Problem

Deciding where to live is one of the highest-stakes choices a young adult faces — it shapes career trajectory, cost of living, immigration status, and quality of life simultaneously. Yet the tools available today force users to cobble together five or six disconnected, static resources: Numbeo for cost-of-living estimates, Reddit threads for anecdotal impressions, Google for visa rules, LinkedIn for job-market intuition, and guesswork for everything in between. No single product connects the profile of the person (income, career stage, lifestyle priorities, citizenship) to a ranked, financially-grounded, action-able relocation plan.

**Target user:** 22–35, mobile, digitally native — recent grads weighing first cities, early-career professionals open to relocation, remote workers shopping for arbitrage, and aspiring expats who want to live abroad but don't know where to start or how to navigate the visa layer.

| Claim | Detail | Source |
|-------|--------|--------|
| The status-quo is fragmented | Users manually combine Numbeo, Reddit, SmartAsset, and expat forums — no single product unifies profile → city match → financial reality → relocation roadmap | Product landscape audit (competitive section below) |
| Highest mobility cohort in the US | 25–34-year-olds move at ~16–18% per year — the highest annual mobility rate of any adult age group | Census Bureau, CPS Geographic Mobility historic tables. URL: https://www.census.gov/data/tables/time-series/demo/geographic-mobility/historic.html |
| Smartphone penetration in the target cohort | ~99% of 18–34-year-olds own a smartphone | Pew Research Center, "Mobile Fact Sheet." URL: https://www.pewresearch.org/internet/fact-sheet/mobile/ |
| International relocation interest is expanding | ~17 million Americans identify as digital nomads (2023) | MBO Partners, "The Digital Nomad Search for Flexibility," 2023 State of Independence. URL: https://www.mbopartners.com/state-of-independence/ |
| International migration-interest percentage | Share of US 22–35-year-olds who have actively considered moving abroad | [FOUNDER-VERIFY: F1] — Gallup World Poll "Potential Net Migration" tracks this; founder must pull citable US figure before pitch. URL to check: https://news.gallup.com/poll/migration.aspx |

---

## 2. Market Opportunity — Bottom-Up TAM → SAM → SOM

**Sizing approach:** Every layer is derived from primary government data (Census Bureau) or a named, cited secondary source, then layered arithmetically. No macro "$X billion industry" figure is used; bottom-up derivation is both more defensible in Q&A and more specific to the product's actual addressable population.

### TAM: US Annual Movers

Each year, roughly 28 million Americans relocate. The subset making an *active destination decision* — people crossing county or state lines — numbers approximately 11 million. These are the individuals for whom the question "where should I live?" is live and urgent, not rhetorical.

| Claim | Number | Source |
|-------|--------|--------|
| Americans who moved in the prior year (individuals) | ~27–28 million | US Census Bureau, Current Population Survey / ASEC "Geographic Mobility" table. URL: https://www.census.gov/topics/population/migration/data/tables.html |
| Exact mover count for the most recent published CPS year | Confirm specific year before pitch | [FOUNDER-VERIFY: F2] — pull the specific table and year from https://www.census.gov/topics/population/migration/data/tables.html |
| Share who moved across county or state lines (decision-relevant) | ~40% of all movers → **~11 million individuals** | Census CPS Geographic Mobility, Table A-1. URL: https://www.census.gov/topics/population/migration/data/tables.html |
| Typical annual interstate mover count | ~7–8 million people | Census CPS Geographic Mobility, same table |

**TAM = ~11 million people per year making an active geographic-destination decision.**

### SAM: 22–35 + Digitally Engaged Subset

Not all 11 million cross-county movers are the target user. Applying the demographic filter (22–35, digital-first) and the corresponding mobility rate isolates the addressable segment.

| Claim | Number | Source |
|-------|--------|--------|
| US population aged 22–34 | ~55–57 million | US Census Bureau, American Community Survey 1-Year Estimates, Table B01001. URL: https://data.census.gov/ |
| Annual mobility rate for 25–34-year-olds | ~16–18% per year (highest of any adult cohort) | Census CPS Geographic Mobility historical tables. URL: https://www.census.gov/data/tables/time-series/demo/geographic-mobility/historic.html |
| Smartphone/internet penetration, 18–34 cohort | ~99% own a smartphone | Pew Research Center, "Mobile Fact Sheet." URL: https://www.pewresearch.org/internet/fact-sheet/mobile/ |
| Derived SAM (22–35, digital-first, active mover) | **~2 million people per year** [ASSUMED] | Derivation: 11M cross-county movers × ~18% share aged 22–34 × ~99% smartphone penetration. Inputs are HIGH-confidence Census figures; the arithmetic layer is a stated derivation — not a published figure. |

**SAM ≈ 2 million addressable movers per year in the target demographic.**

*(The ~2M figure is a researcher's derivation from the cited Census inputs above. Present as "approximately 2 million" and show the derivation formula. Judges follow the logic; precision on the final integer is less important than transparent inputs.)*

### International Market Interest (Supplemental Proof Point)

The US domestic mover figure understates total demand: a meaningful and growing segment of the 22–35 cohort is interested in international relocation, and "digital nomad" as an identity has become mainstream.

| Claim | Number | Source |
|-------|--------|--------|
| Americans self-identifying as digital nomads | ~17 million (2023) | MBO Partners, 2023 State of Independence. URL: https://www.mbopartners.com/state-of-independence/ |
| International migration-interest % for 22–35 cohort | Percentage who have actively considered moving abroad | [FOUNDER-VERIFY: F1] — Use MBO Partners digital nomad count as the proxy if no clean Gallup/Pew figure is found. Do not state an unverified percentage as fact. |

### SOM: 3-Year Penetration (1% of SAM)

**Model (D-03: moderate, single point estimate):**

The SOM analog is Truity — a personality and career-assessment platform with the same free-quiz-to-paid-report funnel — which has crossed 35 million users. 16Personalities (the explicit product analog Potential mirrors) has 100M+ test-takers. Both run the identical mechanism: free quiz, locked/blurred deeper results, one-time unlock purchase. These numbers confirm that the funnel works at scale; the penetration rate is the defensible conservative slice.

| SOM Variable | Value | Basis |
|-------------|-------|-------|
| SAM | ~2 million addressable movers/year | Census-derived (above) |
| 3-year cumulative addressable pool | ~6 million potential users | SAM × 3 years |
| Penetration rate (1%, conservative) | ~60,000 paid conversions over 3 years | 1% of 6M; analog: Truity / 16Personalities funnel benchmarks |
| Blended revenue per paid user | ~$10–$12 | 50% Basic $0.99 / 35% Plus $9.99 / 15% Premium $29.99 mix [ASSUMED] |
| 3-year SOM revenue at 1% penetration | **~$600K–$720K** | 60,000 × $10–$12 [ASSUMED arithmetic] |

| Claim | Number | Source |
|-------|--------|--------|
| SOM penetration analog — Truity | 35M+ users via free-quiz-to-paid-report funnel | Truity "About" page. URL: https://www.truity.com/about |
| SOM penetration analog — 16Personalities (fallback) | 100M+ test-takers via same funnel mechanism | 16Personalities.com home page. URL: https://www.16personalities.com |
| Freemium-to-paid conversion benchmark (SaaS) | 2–5% | FirstPageSage "SaaS Freemium Conversion Rates." URL: https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/ |
| Modeled 1% SOM over 3 years | 60,000 paid conversions / ~$600K–$720K revenue | [ASSUMED] derivation from Census SAM inputs + penetration analog benchmarks above |

**SOM formula (judges can follow and re-derive in ~60 seconds):**
`SAM (2M/yr) × 3 years = 6M cumulative addressable → 1% penetration = 60,000 paid conversions → × blended ~$10–$12/user = ~$600K–$720K 3-year revenue`

---

## 3. Competitive Landscape (PITCH-02)

**The market gap is validated by its most prominent casualty.** Teleport was the most ambitious prior attempt at consumer city-matching — 266 cities, quality-of-life scores, quiz-driven destination discovery — and it was the de facto market leader in the DTC space. In 2022, MOVE Guides acquired Teleport and folded it entirely into Topia's enterprise B2B global-mobility platform. The consumer product no longer exists as a standalone service. No well-capitalized competitor is doing what Potential does for individual consumers. The gap is real, and the market leader's exit validates it.

This is not a market where the consumer product failed for lack of demand. It is a market where the most prominent player *chose to exit* for a better margin profile in enterprise — leaving the 22–35 individual user without a purpose-built solution.

| Competitor | Model / Pricing | What It Does | What It Cannot Do | Source |
|------------|----------------|-------------|-------------------|--------|
| **Nomad List / nomads.com** | One-time $9.99–$19.99 lifetime membership | City scores across 100+ factors; community forum; filter by lifestyle criteria | No personalized roadmap; no visa pathway; no financial projection for the user's actual income; no AI layer — all output is static aggregate data | Live product inspection, nomads.com, May 2026 |
| **WhereNext / getwherenext.com** | Free tools + $15/$29/$49/$79 one-time static PDFs [FOUNDER-VERIFY: F6] | 95 countries, 380 cities; relocation case study + static PDF reports; 90-day action plan | No live-AI layer; no real job/housing listings; no immigration concierge; all output is a pre-generated static document | Live product inspection, getwherenext.com, May 2026. URL: https://getwherenext.com/ |
| **Teleport.org → Topia** | Was free consumer product; acquired 2022, folded into enterprise B2B | Was: city matching across 266 cities, quality-of-life scores, quiz-driven — the most prominent DTC city-matcher | Exited the standalone consumer market entirely — acquired by MOVE Guides, integrated into Topia enterprise global-mobility platform | Topia press release. URL: https://www.topia.com/company/news/press-release-move-guides-acquires-teleport/ |
| **Numbeo** | Free, ad-supported | Crowdsourced cost-of-living data, city comparison | No personalization; no matching algorithm; no roadmap; raw data only | Live product inspection, numbeo.com, May 2026 |
| **SmartAsset** | Free, lead-gen | Cost-of-living calculator, salary comparison | Lead-gen product — sells financial-advisor referrals; not designed for user outcomes | Live product inspection, smartasset.com, May 2026 |
| **Niche.com** | Free, ad-supported | Data-ranked US neighborhoods, resident reviews | US-only; no personalization quiz; no roadmap; no international destinations | Niche.com methodology. URL: https://www.niche.com/places-to-live/rankings/methodology/ |

### Potential's Three Differentiators

The competitive gap is not incremental. Potential occupies the space that Teleport vacated and that no current competitor fills — with three capabilities none of them have:

| Differentiator | What Competitors Offer | What Potential Offers | Tier |
|---------------|----------------------|----------------------|------|
| **Live-AI layer** (real jobs, real housing, day-in-the-life narrative) | None — all competitors output static aggregate data tables | LLM-powered real-time listings fetched at run time via Anthropic API; personalized to user's career, income, and profile | **Plus** |
| **Personalized relocation roadmap** | WhereNext: pre-generated static PDF. All others: nothing. | Dynamic 6-section roadmap generated from user's citizenship, timeline, job situation, and finances; different output for every user | **Plus** |
| **Immigration/visa concierge** | No city-matching competitor offers this feature | Eligibility screener → visa pathway comparison → document checklist → cost/timeline estimate → attorney referral (informational; not legal advice) | **Premium** |

---

## Sources

Every URL used in this document, enumerated for the rubric Sources row:

| # | Source | URL |
|---|--------|-----|
| 1 | US Census Bureau — CPS Geographic Mobility data tables | https://www.census.gov/topics/population/migration/data/tables.html |
| 2 | US Census Bureau — CPS Geographic Mobility historic tables (mobility rates by age) | https://www.census.gov/data/tables/time-series/demo/geographic-mobility/historic.html |
| 3 | US Census Bureau — ACS Table B01001 (population by age) | https://data.census.gov/ |
| 4 | Pew Research Center — Mobile Fact Sheet (smartphone ownership) | https://www.pewresearch.org/internet/fact-sheet/mobile/ |
| 5 | MBO Partners — 2023 State of Independence (digital nomad count) | https://www.mbopartners.com/state-of-independence/ |
| 6 | Gallup World Poll — Potential Net Migration (international migration interest) | https://news.gallup.com/poll/migration.aspx — [FOUNDER-VERIFY: F1] |
| 7 | Truity — About page (35M+ users, free-quiz-to-paid funnel) | https://www.truity.com/about |
| 8 | 16Personalities — Home (100M+ test-takers) | https://www.16personalities.com |
| 9 | FirstPageSage — SaaS Freemium Conversion Rates (2–5% benchmark) | https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/ |
| 10 | Topia press release — MOVE Guides acquires Teleport (2022) | https://www.topia.com/company/news/press-release-move-guides-acquires-teleport/ |
| 11 | WhereNext — Product and pricing inspection | https://getwherenext.com/ |
| 12 | Nomad List — Product inspection | https://nomads.com/ |
| 13 | Niche.com — Methodology page | https://www.niche.com/places-to-live/rankings/methodology/ |

---

*Authored: Phase 9 Plan 01 — 2026-05-31*
*Founder-verify flags: F1 (international migration-interest %), F2 (exact Census CPS year/count), F6 (WhereNext pricing tiers)*
*All other figures: HIGH or MEDIUM confidence from cited primary sources as of May 2026*
