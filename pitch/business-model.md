# Business Model, Value Proposition & Growth Strategy (PITCH-03, PITCH-04, PITCH-06)

> **Status:** Authored — Phase 9 Plan 02. Every quantitative claim carries a source cell or a visible `[FOUNDER-VERIFY: Fn]` / `[ASSUMED]` marker. Sources section enumerates every URL used (scored rubric row).

---

## 1. Value Proposition (PITCH-03)

**"Potential tells you where you'd actually thrive — and hands you the step-by-step plan to get there."**

Today, a 24-year-old deciding where to build a life opens five browser tabs: Numbeo for rough cost estimates, Reddit threads for anecdotal impressions, Google for visa rules, LinkedIn for job market intuition, and guesswork for the rest. The answer is still nowhere. No single tool takes *who you are* — your career, income, citizenship, lifestyle priorities, timeline — and outputs *exactly what your life and money would look like* in 10 ranked cities, plus the concrete steps to get to the one you choose.

Potential closes that gap. It is the first product to connect a personalized profile to a financially-grounded city match, a real relocation roadmap, and an immigration concierge — all in one run.

| Customer Benefit | The Transformation | Why Not Free Tools (Numbeo, Reddit) |
|------------------|-------------------|--------------------------------------|
| Ranked city matches tailored to the user's actual income and priorities | "I know exactly which city fits my life, not just which cities are popular" | Numbeo is aggregate data, not personalized; Reddit is anecdote, not analysis |
| Financial reality per city: estimated take-home, expenses, monthly savings | "I can see whether I can actually afford to live there on my salary" | No free tool models the user's specific income against destination cost of living |
| Live-AI layer: real jobs, real housing, day-in-the-life narrative (Plus) | "I see what my day would actually look like — not a statistical table" | No competitor has a live-AI layer; all are static data |
| Personalized relocation roadmap: timeline, action steps, cost estimates (Plus) | "I have a concrete plan to get there, not just inspiration" | WhereNext offers a pre-generated static PDF; all others offer nothing |
| Immigration/visa concierge: eligibility → pathway → document checklist → attorney referral (Premium) | "I know if I can actually move internationally and what it takes" | No city-matching competitor offers immigration guidance |

**The competitive validation:** Teleport — the most prominent prior attempt at consumer city-matching (266 cities, quiz-driven, well-capitalized) — exited the standalone consumer market entirely in 2022, acquired by MOVE Guides and folded into Topia's enterprise B2B platform. No well-capitalized player is serving individual consumers today. That gap is what Potential fills.

---

## 2. Pricing Model — Run-Based, One-Time (PITCH-04)

### Why Run-Based One-Time, Not Subscription

Relocation is a one-time life decision. Charging monthly for a decision that happens once destroys the customer relationship and cannot survive judge Q&A. The model instead mirrors **16Personalities** (NERIS Analytics) — a large, profitable consumer assessment business built on exactly this funnel: free quiz → free-but-locked results → one-time purchase, with credits that never expire and no consumer subscription required.

16Personalities' "Reports for Pros" product uses **$9 per report credit** with an explicit "credits never expire" and "no commitment or subscription required" framing. Their **Premium Career Suite is $29 one-time**. Their subscription model ($9/month/seat) is reserved entirely for B2B/Teams. [FOUNDER-VERIFY: F4 — re-verify pricing at 16personalities.com if >30 days before pitch. Last confirmed May 2026.]

Potential mirrors this structure exactly, adapted to relocation "runs" as the value unit.

### Pricing Tiers (D-05 — LOCKED)

| Tier | Price | Runs (Credits) | What Unlocks | Role in Funnel |
|------|-------|---------------|--------------|----------------|
| **Free** | $0 | 0 (teaser only) | Quiz completion + #1 match city + 1 headline financial figure; all deeper sections shown blurred/locked | Top-of-funnel hook; drives curiosity toward purchase |
| **Basic** | $0.99 | 1 run | Single most optimal city + complete financial snapshot (expenses, take-home, savings estimate) | Near-frictionless entry — anchors the price ladder; impulse-buy accessible |
| **Plus** | **$9.99** | **3 runs** | Full ranked list (US + international) + complete financials for all cities + live-AI layer (real jobs, housing, day-in-the-life) + personalized relocation roadmap | **Primary upsell target — "most popular" badge** |
| **Premium** | $29.99 | Unlimited runs | Everything in Plus + immigration/visa concierge (eligibility screener → pathway comparison → document checklist → cost/timeline → attorney referral) | High-value international-bound user; the moat |

**"Your runs never expire. Use them when you're ready."** — This framing removes the "use it or lose it" objection entirely. Modeled directly on 16Personalities Reports for Pros: "credits never expire," "no commitment or subscription required." [VERIFIED: https://www.16personalities.com/premium/reports — confirmed May 2026. [FOUNDER-VERIFY: F4]]

**Note:** No money-back guarantee at launch (16Personalities offers one; Potential has elected not to include it — see Project decision D-07).

### Conversion Mechanics (D-07)

- **"Most popular" badge** on Plus ($9.99) — anchors judgment to the tier that delivers the highest value for most users.
- **Sample-report / preview transparency** — the free blurred results let users see exactly what they're unlocking before paying; reduces purchase uncertainty.
- **Never-expire credit framing** — eliminates urgency-to-use-before-it-expires objections; makes the purchase feel safe.

---

## 3. Revenue Streams (D-06)

Recurring and scaling revenue comes from three non-subscription sources. Consumer pricing is always one-time.

### Stream 1: One-Time Run Purchases (Primary, v1)

Direct product sales — Basic ($0.99), Plus ($9.99), Premium ($29.99). The primary revenue engine at launch. All pricing is one-time; no consumer MRR.

| Revenue Variable | Value | Basis |
|-----------------|-------|-------|
| Basic purchase | $0.99 | Near-frictionless entry; impulse-accessible |
| Plus purchase | $9.99 | Primary upsell; 3 runs |
| Premium purchase | $29.99 | Unlimited runs + visa concierge |
| Blended revenue per paid user | ~$10–$12 | 50% Basic / 35% Plus / 15% Premium mix [ASSUMED] |
| API COGS per Plus run (Haiku + 3 web searches) | ~$0.05–$0.07 | $0.04 Haiku generation + $0.03 web search tool [CITED: Anthropic pricing, https://www.anthropic.com/pricing — confirmed May 2026] |
| Gross margin per Plus run | ~97–98% | Revenue $3.33/run vs COGS ~$0.06/run [ASSUMED arithmetic from confirmed per-token pricing] |

**Why the economics work even at $0.99:** Claude 3.5 Haiku COGS per Basic run ≈ $0.01–$0.03. Revenue: $0.99. Even the lowest-value tier is margin-positive from the first sale.

### Stream 2: Affiliate / Referral Fees (v1 soft, v2 formal)

At checkout for Premium and at the end of the visa concierge flow, Potential refers users to licensed immigration attorneys and relocation services. Revenue: 10–20% referral fee on attorney consultations (~$150–$500 per referral) [ASSUMED — no published affiliate rate data; modeled from typical legal-referral norms].

| Claim | Detail | Source |
|-------|--------|--------|
| Attorney consultation cost range | $150–$500 per consultation | [ASSUMED — typical range for immigration attorney initial consultation; founder's immigration background makes this network authentic] |
| Referral fee range | ~10–20% | [ASSUMED — standard affiliate/referral fee range; no published benchmark specific to immigration attorney referrals] |
| CAC for this stream | ~$0 | Referral triggered at checkout of an existing paid user — no incremental acquisition cost |

**Why it works:** The founder has lived the F-1 → OPT → O-1A immigration path. The attorney-referral network is not a bolt-on; it is a natural extension of the founder's existing credibility and relationships. This is the most defensible affiliate play in the category.

### Stream 3: Future B2B Employer-Benefits Product (v2 Scaling Story)

*This stream is explicitly future scope — not built in v1. It is named here as the answer to the judge question: "Teleport pivoted to enterprise B2B; why won't you?"*

The answer: we will — deliberately, as a second product line, after establishing the consumer foundation. Employer HR portals benefit from Potential's city-matching engine to support employee relocation decisions and global-mobility programs. **Revenue model: subscription SaaS at $50–$200/seat/month [ASSUMED].** This is the only context in which subscription framing appears — it is a future B2B product, not consumer pricing.

Teleport's exit to enterprise B2B confirms there is institutional demand. Potential's strategy is to build the consumer moat first (brand, data, trust) and then offer the B2B layer from a position of demonstrated consumer value — not to chase enterprise before proving consumer fit.

### Stream 4: Soft Repeat-Purchase (Demand-Side Recurrence)

No subscription is needed because demand recurs naturally. Young adults in their 20s–30s relocate multiple times — each new move-decision is a new run purchase. The one-time model captures this organically.

| Claim | Detail | Source |
|-------|--------|--------|
| Relocation frequency in the 22–35 cohort | People relocate 2–3× during their 20s–30s | [FOUNDER-VERIFY: F7] — Census ACS lifetime mobility data or BLS migration tables; founder to confirm before pitch |
| Implication for LTV | Each relocation decision is an independent purchase event; no subscription required for recurring revenue | Consistent with the 16–18% annual mobility rate cited in market-research.md (Census CPS) |

---

## 4. Conversion Funnel Driving Toward Plus (D-13)

### The Conversion Ladder

The funnel is designed to make each step feel like the obvious next move. The critical gate is not Free → Basic; it is Basic → Plus, because that is where the product delivers its maximum value jump.

```
Free quiz completion
    ↓ (100% — the quiz is engaging; users see it through)
Free results: #1 match city + 1 headline financial figure
All other results are blurred/locked (16Personalities "Your Profile" pattern)
    ↓ (~10–15% want the full ranked list immediately)
$0.99 Basic — full financial snapshot for the #1 city
    ↓ (after paying $0.99, sunk-cost + curiosity: "I already paid — let me see everything")
$9.99 Plus — full ranked list (US + intl) + live-AI + relocation roadmap  ← PRIMARY UPSELL
    ↓ (international-bound users only: "How do I actually get there legally?")
$29.99 Premium — unlimited runs + immigration/visa concierge
```

**The $0.99 → $9.99 step is the most important upsell in the model.** After a user pays $0.99, the psychology of sunk cost plus genuine curiosity — "I already invested, let me see the full picture" — makes the $9.99 Plus upgrade feel like a small, logical addition. The price jump is 10x but the perceived value jump is greater: from one city to a full ranked list, plus the live-AI and roadmap that no competitor offers.

### Conversion-Rate Assumptions

| Conversion Stage | Modeled Rate | Basis | Confidence |
|-----------------|-------------|-------|------------|
| Visitor → quiz completion (free) | ~30–50% | Estimate based on interactive-quiz completion norms; high for a quiz format | [ASSUMED] |
| Free → any paid purchase | ~8–12% | **Stated assumption, defended:** standard SaaS freemium-to-paid is 2–5% (cited below). The $0.99 entry price reduces decision friction to near-zero — an impulse purchase below the price of a coffee. Modeling 2–3x the standard benchmark is a stated, explicit assumption, not a claimed measured fact. | [ASSUMED — anchor: FirstPageSage 2–5% benchmark. URL: https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/] |
| Basic → Plus upsell (among Basic buyers) | ~30–40% | Sunk-cost + curiosity psychology after the initial $0.99 payment; the upsell CTA is shown immediately after the Basic result | [ASSUMED] |
| Plus → Premium upsell (among Plus buyers) | ~10–15% | Only relevant for users with international intent; targeted contextually | [ASSUMED] |

**Benchmark anchor:** Industry freemium-to-paid conversion for SaaS products is consistently reported at **2–5%** across two independent sources:
- FirstPageSage, "SaaS Freemium Conversion Rates." URL: https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/
- Userpilot, "Freemium Conversion Rate." URL: https://userpilot.com/blog/freemium-conversion-rate/

16Personalities and Truity do not publicly disclose their conversion rates [ASSUMED — NERIS Analytics does not publish a conversion figure; modeled from the 2–5% benchmark range]. The $0.99 near-frictionless price point is the explicit justification for modeling higher than the standard SaaS benchmark.

---

## 5. Marketing & Acquisition Channels (PITCH-06, D-12)

Four named channels, each with an audience-fit rationale and a per-channel CAC derived from industry benchmarks. All CAC figures are **modeled estimates with benchmark anchors — stated assumptions, not measured campaign data** (Pitfall 2 mitigation).

### Channel 1: SEO Content

**Target queries:** "cost of living in [city]", "how to move to [city]", "best cities for [profession] salary", "is [city] affordable on [salary]", "moving to [country] from USA guide"

**Audience fit:** Highest-intent audience of any digital channel. Users actively searching these queries have already identified the problem Potential solves. Search intent is purchase-proximal.

**Content playbook:** 12 city-comparison landing pages (Lisbon, Berlin, Toronto, London, and top 8 US cities). Each page answers the "cost of living + my salary" question and funnels to the free quiz. Zero cash cost; entirely time-investment.

| Metric | Value | Source |
|--------|-------|--------|
| Estimated CAC (SEO) | $5–$15 per paid user | Time-valued content creation amortized over organic traffic. B2C content-driven acquisition benchmark: $5–$30. [ASSUMED — anchor: HubSpot CAC benchmarks. URL: https://blog.hubspot.com/marketing/customer-acquisition-cost] |
| Cash cost | ~$0 | Content is founder-created; no paid distribution |
| Time horizon to meaningful traffic | 3–6 months | Standard SEO ramp; not a Day 1 channel |

### Channel 2: TikTok / Reels / YouTube Shorts

**Target content:** "I made a quiz to find your perfect city" (demo format), "what $3K/month looks like in Lisbon vs. Austin", "as someone who navigated O-1A, here's what most people get wrong about moving abroad"

**Audience fit:** 18–30 demographic; relocation content (#movingabroad, #digitalnomad, #expat) is a high-engagement niche on short-form video. The product itself is screencast-able — the quiz flow and results page are inherently compelling visual content. No production budget required.

**Why this channel is founder-authentic:** The founder's F-1 → OPT → O-1A immigration journey is the content. Authentic, credible, defensible in Q&A.

| Metric | Value | Source |
|--------|-------|--------|
| Estimated CAC (organic TikTok/Reels) | $5–$20 per paid user | Organic: high variance, founder-content-dependent. $0 cash cost; time cost of video creation. [ASSUMED] |
| TikTok CPM benchmark (if paid) | ~$10 CPM | WordStream TikTok Ads benchmark. URL: https://www.wordstream.com/blog/ws/2021/02/08/tiktok-ads |
| Implied paid-ads CAC | ~$200 (paid ads only) | $10 CPM × 1% landing → 5% free-to-paid = ~$200 CAC — organic model is clearly preferred [ASSUMED arithmetic from WordStream CPM] |

**Strategy:** Organic-first. Paid amplification reserved for a proven organic piece only after organic testing.

### Channel 3: Reddit / Niche Communities

**Target communities:** r/IWantOut (476K members), r/digitalnomad (2.3M members), r/SameGrassButGreener (290K members), r/expats (262K members), r/cscareerquestions (823K members — career-change angle) [FOUNDER-VERIFY: F5 — member counts fluctuate; verify at reddit.com/r/[name] day before competition]

**Audience fit:** The highest-intent audience of any channel. These communities exist specifically because people are actively planning or executing relocations. One search confirms it: the top posts in r/IWantOut and r/SameGrassButGreener are exactly the question Potential answers. The founder's immigration background gives authentic credibility, not marketing-account credibility.

**Engagement rule:** Never post promotional content. Share the quiz as a resource when someone asks "how do I decide where to move?" — build trust first, mention the product second. Reddit is hostile to obvious marketing; authentic participation converts.

| Metric | Value | Source |
|--------|-------|--------|
| Estimated CAC (Reddit organic) | $0–$5 per paid user | Near-zero cash cost; time cost of authentic community participation. Modeled at $2 avg (time-valued). [ASSUMED] |
| Audience intent level | Highest of any channel | By definition: users in r/IWantOut are actively planning a move — the exact purchase moment |

### Channel 4: University / Study-Abroad / Career-Center Partnerships

**Target:** University career centers, study-abroad offices, international student offices

**Audience fit:** 20–24-year-olds facing the "where next?" question immediately post-graduation. International students on F-1/OPT weighing post-US options. Study-abroad returnees with international appetite already primed. The founder's F-1 → OPT → O-1A path is directly relatable to this audience — not a brand talking to students, but a peer who navigated the same decision.

**Partnership model (v1):** Free access / revenue-share via career-center affiliate link. The career center earns a percentage of conversions their students make; the founder gets a warm, high-intent acquisition channel with institutional endorsement.

| Metric | Value | Source |
|--------|-------|--------|
| Estimated CAC (university partnerships) | $10–$30 per paid user | Longer outreach cycle; higher audience intent. Modeled as time cost of outreach + potential rev-share. [ASSUMED] |
| Cash cost | ~$0–$50 | Email + demo; no paid placement |
| Audience intent | High — post-grad "where next" cohort is the exact target user |

### Blended CAC and Channel Mix

| Channel | Estimated CAC | Modeled Weight | Weighted CAC |
|---------|-------------|----------------|-------------|
| SEO content | $5–$15 | 50% | $5–$7.50 |
| Reddit / communities | $0–$5 | 30% | $0–$1.50 |
| TikTok / Reels (organic) | $5–$20 | 15% | $0.75–$3 |
| University partnerships | $10–$30 | 5% | $0.50–$1.50 |
| **Blended CAC** | **~$8–$12** | 100% | [ASSUMED — all inputs are stated modeled estimates with benchmark anchors] |

**Defense for Q&A:** "Our blended CAC of $8–$12 is a modeled assumption anchored to HubSpot's B2C content-marketing benchmark ($5–$30) and WordStream's TikTok CPM data. We have no live campaign data yet. The model is built bottom-up so any assumption can be stress-tested: if CAC is $20 instead of $10, break-even extends from month 3 to month 5–6 — still viable."

---

## 6. Unit Economics Summary

| Metric | Value | Basis |
|--------|-------|-------|
| Blended revenue per paid user | ~$10–$12 | 50/35/15 Basic/Plus/Premium mix [ASSUMED] |
| Blended CAC | ~$8–$12 | Modeled from benchmark anchors above [ASSUMED] |
| API COGS per Plus run | ~$0.05–$0.07 | Haiku ($0.01–$0.03) + web search tool ($0.03) [CITED: Anthropic pricing, https://www.anthropic.com/pricing] |
| Gross margin (Plus run) | ~97–98% | $3.33 revenue / $0.06 COGS [ASSUMED arithmetic] |
| LTV (Basic) | ~$1.30 | $0.99 + 30% chance of repurchase within 3 years [ASSUMED] |
| LTV (Plus) | ~$14 | $9.99 + 40% repurchase [ASSUMED] |
| LTV (Premium) | ~$45 | $29.99 + 50% repurchase [ASSUMED] |
| Blended LTV | ~$13–$15 | [ASSUMED — reflects 2–3× relocation frequency in the 22–35 cohort; [FOUNDER-VERIFY: F7]] |
| Break-even (paid users needed) | ~112 | $1,000 total startup costs ÷ ~$9 net margin per paid user [ASSUMED] |
| Break-even (time estimate) | ~Month 3 | 1,000 free users/mo × 5% conversion = 50 paid/mo [ASSUMED] |

*Full derivable financial model in `pitch/financials/` — every input is a stated assumption, re-derivable in ~60 seconds.*

---

## Sources

Every URL used in this document, enumerated for the rubric Sources row:

| # | Source | URL |
|---|--------|-----|
| 1 | 16Personalities Premium Career Suite ($29 one-time) — pricing analog | https://www.16personalities.com/premium/career-suite — [FOUNDER-VERIFY: F4] |
| 2 | 16Personalities Reports for Pros ($9/credit, credits never expire, no subscription) | https://www.16personalities.com/premium/reports — [FOUNDER-VERIFY: F4] |
| 3 | 16Personalities Teams ($9/mo/seat, B2B subscription) | https://www.16personalities.com/premium/teams — [FOUNDER-VERIFY: F4] |
| 4 | Topia press release — MOVE Guides acquires Teleport (Teleport DTC exit narrative) | https://www.topia.com/company/news/press-release-move-guides-acquires-teleport/ |
| 5 | Anthropic API pricing (per-token rates: Haiku, Sonnet, Opus; web search tool cost) | https://www.anthropic.com/pricing — [FOUNDER-VERIFY: F3] |
| 6 | FirstPageSage — SaaS Freemium Conversion Rates (2–5% benchmark) | https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/ |
| 7 | Userpilot — Freemium Conversion Rate analysis (2–5% benchmark) | https://userpilot.com/blog/freemium-conversion-rate/ |
| 8 | HubSpot — Customer Acquisition Cost benchmarks (content-driven B2C CAC) | https://blog.hubspot.com/marketing/customer-acquisition-cost |
| 9 | WordStream — TikTok Ads CPM benchmark (~$10 CPM) | https://www.wordstream.com/blog/ws/2021/02/08/tiktok-ads |
| 10 | Reddit — r/IWantOut community (476K members) | https://reddit.com/r/IWantOut — [FOUNDER-VERIFY: F5] |
| 11 | Reddit — r/digitalnomad community (2.3M members) | https://reddit.com/r/digitalnomad — [FOUNDER-VERIFY: F5] |
| 12 | Reddit — r/SameGrassButGreener community (290K members) | https://reddit.com/r/SameGrassButGreener — [FOUNDER-VERIFY: F5] |
| 13 | Reddit — r/expats community (262K members) | https://reddit.com/r/expats — [FOUNDER-VERIFY: F5] |
| 14 | Truity — About page (35M+ users via free-quiz-to-paid funnel) | https://www.truity.com/about |

---

*Authored: Phase 9 Plan 02 — 2026-05-31*
*Founder-verify flags: F3 (Anthropic pricing at pitch time), F4 (16Personalities pricing re-verify if >30 days), F5 (Reddit member counts — check day before competition), F7 (relocation frequency 2–3× claim)*
*All other figures: HIGH or MEDIUM confidence from cited primary sources, or explicitly labeled [ASSUMED] with benchmark anchors*
*No consumer subscription framing in this document except Stream 3 (future B2B employer-benefits product, explicitly labeled v2/future)*
