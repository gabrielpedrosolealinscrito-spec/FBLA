# Q&A Bank — Potential (PITCH-08)

**Purpose:** PITCH-08 Q&A bank — 20 anticipated judge questions with domain-routed talking points and source tags.

**Per-entry format:**
```
### Q[n] — [Topic]
"[Question]"
**Routed to:** [Luke | Gabriel]
- Talking-point bullet [SOURCE: doc reference]
```

**Routing note (D-07):** Both presenters must rehearse the full bank — either can field any question.
Domain routing: visa/legal-advice + demo/API-resilience → Gabriel. Market/financials/CAC-LTV/Teleport → Luke.
Routing reflects primary expertise and Q&A ownership; it is not a filter on who may answer.

---

## Mandated Q&A (D-06 Required Topics)

### Q1 — Data Accuracy
"How do you ensure your city data is accurate?"

**Routed to:** Gabriel

- All city financial data (salaries, rents, cost of living) is sourced from named primary sources: BLS OES for US salaries, HUD FMR for US rents, Numbeo for international cost of living — every data point has a documented URL in the codebase [SOURCE: REQUIREMENTS.md PITCH-04; pitch/market-research.md §1]
- International data is scoped to 4 golden-path cities (Lisbon, Berlin, Toronto, London) where sourced data exists — breadth is the scaling story, not v1 [SOURCE: REQUIREMENTS.md VISA-02; pitch/market-research.md §1]
- All data displays "data as of [date]" timestamps; the live-AI layer provides recency via Anthropic web search, so real-time listings are always fresh [SOURCE: REQUIREMENTS.md VISA-03]
- Visa pathway content is traced to official government sources (AIMA for Portugal, IRCC for Canada, BAMF for Germany, USCIS for the US) — not expat blogs or Reddit threads [SOURCE: REQUIREMENTS.md VISA-03]

---

### Q2 — CAC/LTV Defense
"What are your customer acquisition costs and lifetime value? How defensible are those numbers?"

**Routed to:** Gabriel

- Blended CAC is ~$8–$12, modeled bottom-up from four named channels: SEO ($5–$15 per paid user, HubSpot B2C benchmark anchor), Reddit organic ($0–$5), TikTok/Reels organic ($5–$20), university partnerships ($10–$30) — all stated assumptions with benchmark anchors, not measured campaign data [SOURCE: pitch/business-model.md §5; pitch/financials/summary.md §CAC]
- LTV = one-time price × (1 + repeat factor): Plus LTV ~$14 (40% return rate for a second relocation decision), blended LTV ~$13–$15 — driven by the 16–18%/year mobility rate in the 22–35 cohort [SOURCE: pitch/financials/summary.md §LTV; pitch/market-research.md §1 Census CPS mobility data — [FOUNDER-VERIFY: F7]]
- Sensitivity: if CAC doubles to $20, break-even extends from Month 4 to approximately Month 6 — still viable. The model is built so any assumption can be stress-tested in ~60 seconds from the stated inputs [SOURCE: pitch/financials/summary.md §assumptions sensitivity A4]
- These are stated modeled estimates, not live campaign data. The $0.99 near-frictionless entry justifies modeling higher conversion than the standard 2–5% SaaS freemium benchmark [SOURCE: pitch/business-model.md §4; FirstPageSage benchmark cited in pitch/financials/summary.md]

---

### Q3 — Legal Advice Avoidance
"Isn't giving immigration guidance practicing law without a license? How do you avoid unauthorized practice of law?"

**Routed to:** Gabriel (legal + lived expertise)

- All immigration content is informational only: a "general information, not legal advice" disclaimer is visible on every visa-concierge screen; every visa page ends with "consult a licensed immigration attorney" framing and an attorney-referral CTA — this is structural, not a footnote [SOURCE: REQUIREMENTS.md VISA-04]
- We surface pathway information and eligibility criteria from official government sources (AIMA, IRCC) — we do not file applications, give case-specific advice, or make representations about individual eligibility outcomes [SOURCE: REQUIREMENTS.md "Out of Scope" — no legal immigration advice]
- The distinction is inform-and-refer versus practice: Boundless and SimpleCitizen charge $459–$989 for guided application filing with attorney review — that is legal practice. We are an information tool that routes users to those services; we do not do what they do [SOURCE: REQUIREMENTS.md Out of Scope]
- Gabriel navigated F-1 → OPT → O-1A/H-1B himself — the content reflects lived expertise informing an information product, not unlicensed legal practice. That credibility is exactly why judges should trust the product's framing [SOURCE: pitch deck notes; 10-CONTEXT.md Specifics]

---

### Q4 — Competitive Moat
"What's your moat? Couldn't a competitor just copy the quiz format?"

**Routed to:** Luke

- The quiz format is not the moat. Three actual moats: (1) the live-AI data layer — real jobs, real housing, real day-in-the-life, personalized at run time — which requires significant technical infrastructure no static competitor has built; (2) the personalized relocation roadmap, dynamic and profile-specific, different output for every user; (3) the immigration/visa concierge, backed by Gabriel's lived F-1 → OPT → O-1A pathway, which a copycat product cannot instantly replicate [SOURCE: pitch/market-research.md §3 differentiators]
- Teleport had 266 cities, quiz-driven matching, and institutional backing — and still did not have the action layer. Our insight: the consumer product did not fail from lack of demand; it lacked the roadmap and visa concierge that convert discovery into willingness to pay [SOURCE: pitch/market-research.md §3 Teleport narrative]
- Data moat: every run enriches our understanding of what users actually ask for, giving a future B2B product (employer relocation benefits) a data foundation competitors cannot quickly replicate [SOURCE: pitch/business-model.md §3 Stream 3]

---

### Q5 — API Failure Resilience
"What happens if your live AI feature fails during the demo — or in production?"

**Routed to:** Gabriel

- Demo has a two-path architecture: live Anthropic API call attempted first; if it fails or exceeds 3 seconds, the bundled golden-path cache renders instantly — identical output, zero spinner, no visible degradation [SOURCE: REQUIREMENTS.md LIVE-04; pitch/financials/summary.md startup costs note on offline operation]
- Golden-path cache is pre-built for the exact scripted demo profile and demo cities — so fallback output is indistinguishable from a live call to a judge watching the screen [SOURCE: REQUIREMENTS.md LIVE-04]
- In production: same fallback architecture, plus Anthropic's documented uptime and per-request timeout. The product never shows a blank or broken state — it degrades gracefully to the last-known-good result [SOURCE: REQUIREMENTS.md LIVE-04]
- The product's core value (quiz → ranked cities → financials → roadmap) runs entirely without the live-AI layer — the live layer is the Plus tier differentiator on top of a fully functional base product [SOURCE: REQUIREMENTS.md MATCH-01 through FIN-01]

---

### Q6 — Teleport Rebuttal
"Wasn't Teleport already doing this? Why did they fail and why won't you?"

**Routed to:** Luke

- Teleport did not fail — they succeeded well enough to be acquired. MOVE Guides acquired Teleport in 2022 specifically to fold Teleport's city-matching intelligence into Topia's enterprise B2B global-mobility platform. That acquisition confirms institutional demand; it does not refute consumer demand [SOURCE: Topia press release — pitch/market-research.md §3]
- Teleport exited the consumer space by choice, for a better margin profile in enterprise — not because individual users stopped needing the answer to "where should I live?" The gap they left behind is the exact gap Potential fills [SOURCE: pitch/market-research.md §3 — "chose to exit for better margin profile in enterprise"]
- The key difference is the action layer: Teleport was a static data product. Potential's live-AI layer + personalized relocation roadmap + visa concierge transforms discovery into a concrete plan — those three layers are what converts a curious user into a paying one. Teleport did not have them [SOURCE: pitch/market-research.md §3 differentiators table]
- Deliberate strategy: build the consumer moat first (brand, data, trust), then offer a B2B layer from a position of demonstrated consumer value — not chase enterprise before proving consumer fit, which is the mistake Teleport corrected by exiting [SOURCE: pitch/business-model.md §3 Stream 3]

---

## Rubric-Gap Q&A

### Q7 — Market Sizing Methodology
"How did you arrive at 2 million addressable users?"

**Routed to:** Luke

- Bottom-up derivation from US Census data, not a top-down "industry size" figure: ~11M Americans move across county or state lines annually (Census CPS Table A-1) × ~18% aged 22–34 (Census ACS B01001) × ~99% smartphone penetration (Pew "Mobile Fact Sheet") = ~2M per year [SOURCE: pitch/market-research.md §2 SAM derivation]
- The derivation is presented as transparent arithmetic — judges can follow the formula and re-derive in approximately 60 seconds. The arithmetic layer is labeled [ASSUMED] in our docs; we present it as a stated derivation from HIGH-confidence Census inputs, not a published figure [SOURCE: pitch/market-research.md §2 SAM table note]
- Supplemental validation: ~17M Americans self-identify as digital nomads (2023 MBO Partners), confirming the "living abroad" appetite is not a niche [SOURCE: pitch/market-research.md §1 MBO Partners 2023 State of Independence]

---

### Q8 — Why One-Time Pricing, Not Subscription?
"Why not a subscription? That's usually better for SaaS."

**Routed to:** Luke

- Relocation is a one-time life decision. Charging monthly for a decision that happens once destroys the customer relationship and cannot survive Q&A from judges or customers — this is the core principle behind the pricing design [SOURCE: pitch/business-model.md §2 "Why Run-Based One-Time"]
- The proven analog is 16Personalities (100M+ test-takers): one-time report credits that never expire, no consumer subscription, B2B subscription reserved for Teams. Same funnel, same pricing logic, at demonstrated scale [SOURCE: pitch/business-model.md §2; 16Personalities pricing — [FOUNDER-VERIFY: F4]]
- Recurring revenue comes from natural life recurrence (22–35-year-olds relocate 2–3× in their 20s–30s), affiliate referral fees from the attorney network, and a future B2B employer-benefits subscription — not consumer MRR [SOURCE: pitch/business-model.md §3; pitch/market-research.md §1 Census mobility data — [FOUNDER-VERIFY: F7]]

---

### Q9 — Why $0.99 Entry Point?
"Isn't $0.99 too cheap? Does that devalue your product?"

**Routed to:** Luke

- The $0.99 entry is a deliberate psychological bridge: it reduces purchase friction to near-zero (an impulse buy below the price of a coffee) while crossing the "paid user" threshold that resets the customer's relationship with the product [SOURCE: pitch/business-model.md §4 conversion mechanics]
- After paying $0.99, sunk-cost psychology plus genuine curiosity drives approximately 30–40% of Basic buyers to upgrade to Plus ($9.99) — the primary upsell target and the tier with the highest value delivery [SOURCE: pitch/business-model.md §4 conversion ladder — [ASSUMED]]
- Even at $0.99, API COGS per Basic run are approximately $0.01–$0.03 — the tier is margin-positive from the first sale. The $0.99 price does not erode the business; it feeds the conversion funnel [SOURCE: pitch/financials/summary.md §per-run margin proof]

---

### Q10 — First 1,000 Users
"How do you get your first 1,000 users?"

**Routed to:** Luke

- Reddit: r/IWantOut (476K members), r/digitalnomad (2.3M members), r/SameGrassButGreener (290K members) — Gabriel posts authentic responses to "where should I move?" threads; at 5% free-to-paid conversion, 1,000 free users → 50 paid users [SOURCE: pitch/business-model.md §5 Channel 3 — [FOUNDER-VERIFY: F5] member counts]
- Personal network and founder-story content: Gabriel's F-1 → OPT → O-1A immigration journey is authentic TikTok/Reels content that speaks directly to the F-1/OPT audience — the same audience the product serves [SOURCE: pitch/business-model.md §5 Channel 2]
- University outreach: career centers and international student offices get free access and a revenue-share referral; the audience is post-grad "where next" — near-zero CAC and high intent [SOURCE: pitch/business-model.md §5 Channel 4]
- The financial model shows Month 3 = 105 paid users at 5% conversion on 900 cumulative free users — consistent with the stated acquisition model [SOURCE: pitch/financials/summary.md break-even table Month 3]

---

### Q11 — Year-1 Revenue Projection
"What do you project in year-1 revenue?"

**Routed to:** Gabriel

- Year-1 (Months 1–12) total revenue from model.csv: approximately $9,500 (sum of Total_Rev column across all twelve months) [SOURCE: pitch/financials/model.csv]
- Year-1 Cumulative_Net: +$7,965 (profitable from Month 4 forward; cumulative net income Month 12 row) [SOURCE: pitch/financials/model.csv Month 12 row]
- Growth path: approximately 1,034 cumulative paid users in 12 months at modeled conversion rates (Paid_Users column sum M1–M12) [SOURCE: pitch/financials/model.csv — Paid_Users column]
- All projections are re-derivable from stated assumptions — if any input is challenged: "If CAC doubles, break-even extends to Month 6. If conversion drops to 3%, break-even extends to Month 5–7 — still viable." [SOURCE: pitch/financials/summary.md §assumptions log A3–A4]

---

### Q12 — Profitability Timeline
"When do you become profitable?"

**Routed to:** Gabriel

- Month 4: Cumulative_Net crosses to positive (+$10) on the full model including all ongoing marketing spend — not just recovery of the one-time startup cost [SOURCE: pitch/financials/model.csv Month 4 row: Cumulative_Net = +$9.68]
- Simple formula check: $1,000 startup cost ÷ approximately $9 net revenue per paid user = approximately 112 users needed; cumulative paid users reach 160 at Month 4 [SOURCE: pitch/financials/summary.md §break-even analysis]
- Month 6: firmly profitable (+$942 cumulative); Month 12: +$7,965; Month 24: +$34,588 — the model is available for any judge who wants to re-derive any row [SOURCE: pitch/financials/model.csv]

---

### Q13 — Visa Content Accuracy
"How do you keep visa information current when immigration rules change constantly?"

**Routed to:** Gabriel

- v1 is intentionally scoped to two fully-built pathways: Portugal D8 (Digital Nomad Visa) and Canada Express Entry — where we can maintain accurate, sourced, dated content at manageable overhead [SOURCE: REQUIREMENTS.md VISA-02]
- Every visa step traces to the official government source (AIMA for Portugal, IRCC for Canada) with a "data as of [date]" label — never expat blogs, never Reddit, never unofficial guides [SOURCE: REQUIREMENTS.md VISA-03]
- The disclaimer is structural, not a footnote: "Immigration rules change. Verify all information against current official sources and consult a licensed immigration attorney before acting." [SOURCE: REQUIREMENTS.md VISA-04]
- Breadth is explicitly the scaling story — we add pathways as we can maintain them accurately, not as fast as we can ship them [SOURCE: REQUIREMENTS.md Out of Scope — exhaustive worldwide data]

---

### Q14 — Why Not Free?
"Why should someone pay when Numbeo and Nomad List are free?"

**Routed to:** Luke

- Free tools give you data; Potential gives you decisions. The gap: no free tool takes who you are (income, career, citizenship, lifestyle priorities) and outputs exactly what your life would look like in 10 ranked cities — plus the concrete steps to get to the one you choose [SOURCE: pitch/business-model.md §1 value proposition]
- Numbeo is aggregate data, not personalized. Nomad List is city scores with no financial projection for your income, no relocation roadmap, no visa concierge. The transformation — "I know where I should live AND how to get there" — is what people pay for [SOURCE: pitch/market-research.md §3 competitor table]
- 16Personalities and Truity prove people pay for personalized insight generated from their own profile — they've done it a combined 100M+ times on the identical funnel model [SOURCE: pitch/market-research.md §2 SOM — 16Personalities and Truity analogs]

---

### Q15 — Two-Person Presentation
"How do you divide the presentation? What if one of you isn't available on competition day?"

**Routed to:** Luke

- Luke owns the narrative arc (problem, market, solution, business model, marketing, the ask). Gabriel owns hard numbers and legalities (financials, visa concierge, legal-advice defense, data accuracy in Q&A) — each presenter plays to their authentic domain strengths [SOURCE: 10-CONTEXT.md D-08, D-09]
- Both presenters have rehearsed the full Q&A bank — either can field any question that comes in. The routing designations are primary-ownership labels, not exclusive lanes [SOURCE: 10-CONTEXT.md D-07]
- If one presenter is unavailable, the other can carry the full presentation — the deck is structured so each section is self-contained and any slide's speaking points can be delivered by either person [ASSUMED — contingency designed into rehearsal plan per 10-CONTEXT.md D-10]

---

### Q16 — Demo Failure Contingency
"What if your demo doesn't work on stage?"

**Routed to:** Gabriel

- Same two-path architecture as Q5: live API call attempted first; if it fails or exceeds the timeout threshold, the golden-path cache renders instantly — zero spinner, zero apology, indistinguishable output [SOURCE: REQUIREMENTS.md LIVE-04]
- If the entire device fails: the pitch deck carries the complete story. The demo proves the product is real; it does not carry the score. Four of six rubric dimensions are business substance that is fully covered by the deck slides [SOURCE: 10-CONTEXT.md D-04 rationale — "4 of 6 scored rubric dimensions are business substance"]
- Golden-path cache covers the scripted demo profile for at least two cities — it looks and behaves identically to a live run, because the data is real data, not placeholder text [SOURCE: REQUIREMENTS.md LIVE-04]

---

### Q17 — TAM Credibility
"Your TAM of 11 million seems low compared to what you could potentially serve."

**Routed to:** Luke

- The TAM is intentionally scoped to the active decision-maker — someone who moved across county or state lines in the past year — not everyone who might someday think about moving. Scoping the TAM tightly makes it more credible and more defensible than a large vague number [SOURCE: pitch/market-research.md §2 TAM definition, Census CPS Table A-1]
- A larger TAM number ("the $X billion relocation industry") could be quoted, but bottom-up derivation from Census data is more impressive to judges who understand business — it shows we know our actual customer, not just a market category [SOURCE: pitch/market-research.md §2 "sizing approach" note]
- The digital nomad supplemental figure (17M self-identified Americans, 2023 MBO Partners) shows the international demand layer expands the relevant market meaningfully beyond domestic movers — so the real addressable market is larger, not smaller, than the conservative TAM figure [SOURCE: pitch/market-research.md §2 international market interest supplement]

---

### Q18 — Startup Cost Credibility
"$1,000 startup cost seems very low. What are you leaving out?"

**Routed to:** Gabriel

- Breakdown: ~$50–$200 Anthropic API deposit, ~$12–$15 domain, ~$240/year Vercel Pro hosting, ~$50–$500 legal/business registration — total range $200–$1,500; model uses the $1,000 midpoint [SOURCE: pitch/financials/summary.md §startup costs breakdown]
- Genuinely low because the product is AI-native: no custom data pipeline, no proprietary server infrastructure, no day-one team. Marginal cost of serving one additional user is one API call plus one Vercel edge function [SOURCE: pitch/financials/summary.md §startup costs key pitch point]
- Hosting scales linearly with usage (Vercel Pro $20/month fixed cost); API cost is ~$0.06 per Plus run. Serving 10,000 users in a month costs approximately $600 in API COGS — still 97%+ gross margin at any reasonable scale [SOURCE: pitch/financials/summary.md §per-run margin proof; pitch/financials/summary.md §startup costs]

---

### Q19 — Regulatory Risk
"What happens if immigration policy changes and your visa concierge is suddenly wrong?"

**Routed to:** Gabriel

- Structural safeguard: every visa content page carries a "data as of [date]" label and directs users explicitly to verify against current official government sources before acting [SOURCE: REQUIREMENTS.md VISA-03]
- We scope v1 to two pathways (Portugal D8, Canada Express Entry) precisely because we can maintain them accurately; we do not claim exhaustive coverage, and we do not add new pathways until we can maintain them at the same standard [SOURCE: REQUIREMENTS.md VISA-02]
- The "not legal advice" framing is structural — we are an information tool that connects users to qualified attorneys, not a legal service. Policy changes affect our information content, not our legal exposure, because we never made legal representations to begin with [SOURCE: REQUIREMENTS.md VISA-04; pitch/business-model.md §3 Stream 2]

---

### Q20 — How Does This Scale?
"This seems like a one-person project. How does it scale beyond a competition prototype?"

**Routed to:** Luke

- The product is AI-native — scaling content depth (more cities, more visa pathways) is primarily a content and template authoring effort, not infrastructure build-out. Each new city adds a data configuration file and a roadmap template, not a new microservice or engineering hire [SOURCE: REQUIREMENTS.md v2 requirements list]
- Three scaling vectors already specified: (1) more cities/pathways via content authoring and community contributions; (2) formal affiliate/attorney referral network (v2); (3) B2B employer-benefits product (v2 scaling story — deliberate, after the consumer moat is established) [SOURCE: pitch/business-model.md §3 Streams 2–3; REQUIREMENTS.md v2]
- The 16Personalities analog (NERIS Analytics) is a small team serving 100M+ test-takers profitably on the identical funnel structure — this is a proven, scalable model for a two-person team [SOURCE: pitch/market-research.md §2 SOM — 16Personalities analog]

---

## Routing Summary

| Q# | Topic | Routed to |
|----|-------|-----------|
| Q1 | Data Accuracy | Gabriel |
| Q2 | CAC/LTV Defense | Gabriel |
| Q3 | Legal Advice Avoidance | Gabriel |
| Q4 | Competitive Moat | Luke |
| Q5 | API Failure Resilience | Gabriel |
| Q6 | Teleport Rebuttal | Luke |
| Q7 | Market Sizing Methodology | Luke |
| Q8 | Why One-Time Pricing, Not Subscription | Luke |
| Q9 | Why $0.99 Entry Point | Luke |
| Q10 | First 1,000 Users | Luke |
| Q11 | Year-1 Revenue Projection | Gabriel |
| Q12 | Profitability Timeline | Gabriel |
| Q13 | Visa Content Accuracy | Gabriel |
| Q14 | Why Not Free | Luke |
| Q15 | Two-Person Presentation | Luke |
| Q16 | Demo Failure Contingency | Gabriel |
| Q17 | TAM Credibility | Luke |
| Q18 | Startup Cost Credibility | Gabriel |
| Q19 | Regulatory Risk | Gabriel |
| Q20 | How Does This Scale | Luke |

**Gabriel:** Q1, Q2, Q3, Q5, Q11, Q12, Q13, Q16, Q18, Q19 (10 questions — financials, legalities, technical defense, visa)
**Luke:** Q4, Q6, Q7, Q8, Q9, Q10, Q14, Q15, Q17, Q20 (10 questions — market, business model, growth, narrative)

---

*Authored: Phase 10 Plan 02 — 2026-05-31*
*PITCH-08 Q&A bank — 20 questions (6 mandated D-06 topics + 14 rubric-gap questions)*
*Routing per D-07/D-09 — both presenters rehearse all 20*
*Source tags cite Phase 9 documents; founder-verify flags F4, F5, F7 carried inline*
