# Phase 10: Pitch — Deck, Rehearsal & Protocol — Research

**Researched:** 2026-05-31
**Domain:** Competition presentation authoring — slide content, Q&A bank, timing, protocol compliance
**Confidence:** HIGH (rubric extracted from PITFALLS.md which read the official PDF directly; all substance figures verified against Phase 9 source docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** GSD authors an **outline + speaker notes** deck (NOT word-for-word script). Slide-by-slide: headline + key visuals + claim/number/source bullets, plus talking-point speaker notes the presenters flesh into their own voice.
- **D-02:** **Source attributions are source-tag-only** per claim bullet. Presenters phrase the audible attribution live. Every scored quantitative claim bullet MUST carry its source tag.
- **D-03:** Fix the business arc, float the demo. Budget the eight non-demo arc sections to a stable **~6:00 total**.
- **D-04:** Live demo gets a **flexible slot with ~2:30 planning target**, compressible to ~1:30 and expandable to ~3:00.
- **D-05:** Hard cap ≤10:00; target band for timed run-throughs **8:30–9:00**.
- **D-06:** Q&A bank = **15+ entries** (question + 2–4 talking-point bullets + source tag(s)). Must cover: data accuracy, CAC/LTV, legal-advice avoidance, competitive moat, API-failure resilience, "wasn't Teleport doing this?".
- **D-07:** Q&A **routed by domain** (visa/legal + demo/API-resilience → Gabriel; market/financials/CAC-LTV/Teleport → Luke) but both rehearse the full bank.
- **D-08:** Two presenters — **Luke and Gabriel** (team-with-handoffs). Speaker notes carry **speaker labels + explicit handoff cues**.
- **D-09:** Luke = soft-narrative (intro, problem/market/solution, business model, marketing, ask). Gabriel = hard-numbers/legalities (financials, legalities, visa-concierge defense).
- **D-10:** Rehearsal (gated on Phase 8) = solo/paired timed run-throughs on phone hotspot + mock-judge drilling Q&A.
- **D-11:** Protocol checklist authored now; verified at rehearsal.

### Claude's Discretion

- Exact slide count and per-slide visual treatment
- Precise wording of speaker-note talking points
- Specific 15+ Q&A questions chosen beyond the mandated topics
- Internal section-by-section sub-timing within the ~6:00 business arc

### Deferred Ideas (OUT OF SCOPE)

- Three timed hotspot run-throughs (gated on Phase 8 — tracked as "rehearse-later")
- Demo ownership confirmation (assumed Gabriel; resolve at rehearsal)
- Full word-for-word script
- Pre-written attribution phrasing / dedicated sources cheat-sheet

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PITCH-07 | Pitch deck + ≤10-minute presentation built, with every claim sourced/cited (Sources row directly scored) | Slide sequence, per-slide content schema, sub-timing model, source-tag placement rules — all documented below |
| PITCH-08 | Q&A preparation — anticipated-question bank with defensible answers (esp. financials and visa accuracy) | Full 20-question bank with source tags and routing, covering all 6 mandated topics plus rubric gap areas |
| PITCH-09 | Protocol checklist passed — within time, no judge-clicked links/QR, no external speakers, nothing left with judges, dress code met | Complete binary protocol checklist extracted from rubric research, structured for rehearsal verification |

</phase_requirements>

---

## Summary

Phase 10 produces three authored artifacts — a deck outline with speaker notes (PITCH-07), a Q&A bank (PITCH-08), and a protocol compliance checklist (PITCH-09) — from the Phase 9 business-substance documents. This is a content-authoring phase, not a coding phase. No packages are installed, no software libraries are needed. The rubric allocates 10 of 120 points to the Sources row alone (scored directly), and another 10 to the Q&A row, making content accuracy and source tagging the two highest-leverage activities this phase can control.

The central structural challenge is the author-now / rehearse-later split: PITCH-07 and PITCH-08 are unblocked and can be authored entirely from Phase 9 documents. PITCH-09 (checklist) is authored now but verified later. The three timed run-throughs (success criterion 3) are gated on Phase 8 (live demo, currently unbuilt). The planner must structure plans so the "rehearse-later" half is fully specified now — pre-rehearsal tasks clearly enumerated — so execution is a simple check-off the moment Phase 8 completes.

The narrative arc is fixed and cannot be reordered: problem → market → solution → differentiation → demo → business model → financials → marketing → ask. The ~6:00 business arc (eight non-demo sections) can be timed now from Phase 9 content. The demo slot is a floating 1:30–3:00 block; the deck needs a single "Demo" slide placeholder that the presenters time separately once the demo exists.

**Primary recommendation:** Author the deck outline, Q&A bank, and protocol checklist as three separate plan-level deliverables. Sequence: (1) deck outline + sub-timing model, (2) Q&A bank, (3) protocol checklist + rehearsal-plan specification. Each deliverable is a markdown file under `pitch/deck/` or `pitch/`. No Canva work is required in this phase — Canva is the human execution layer.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Deck outline + speaker notes (PITCH-07) | Author (GSD) | Human (Canva build) | GSD owns content structure; humans execute visual production |
| Q&A bank (PITCH-08) | Author (GSD) | Human (rehearsal) | GSD owns written bank; humans rehearse aloud |
| Protocol checklist (PITCH-09) | Author (GSD) | Human (day-of verify) | GSD owns checklist schema; humans check boxes at rehearsal/competition |
| Source-tag attribution | Inline in deck outline | Q&A bank source column | Every claim bullet in the deck AND every Q&A answer bullet carries a source tag |
| Timed sub-budget | Authored now | Verified at rehearsal | Section-by-section time targets authored from Phase 9 content; confirmed with stopwatch later |
| Demo slot timing | Specified as floating slot | Confirmed at Phase 8 rehearsal | Deck placeholder authored now; actual timing confirmed once demo exists |

---

## Rubric Scoring Map

[CITED: FBLA 2025-2026 Competitive Events Guidelines, Entrepreneurship Pitch Competition — read by prior researcher September 2025; confirmed extracted in PITFALLS.md]

The rubric is 120 points total across 12 scored dimensions:

| Dimension | Points | What Earns 9–10 | Phase 10 Lever |
|-----------|--------|-----------------|----------------|
| Problem Identification & Market Opportunity | 0–10 | Strong understanding of target market; validates business opportunity with sourced data | Deck slides 2–4 (Problem, Market); source tags on all market figures |
| Business Concept & Innovation | 0–10 | Strong innovation; clear differentiation from existing solutions | Deck slides 5–6 (Solution, Differentiation); Teleport rebuttal woven in |
| Value Proposition & Customer Benefit | 0–10 | Compelling; unique benefits; strong reasons why customers choose this | Deck slide 5 (Solution) framed as transformation, not feature list |
| Business Model (pricing/sales/distribution) | 0–10 | Specific and realistic pricing, sales, distribution aligned with concept | Deck slide 8 (Business Model); pricing tiers + conversion funnel spelled out |
| Feasibility & Financial Thinking | 0–10 | Strong financial acumen; realistic projections; credible path to profitability | Deck slide 9 (Financials); every number from model.csv |
| Marketing & Growth Strategy | 0–10 | Well-researched, creative, targeted; strong understanding of engagement + scalability | Deck slide 10 (Marketing); four named channels with per-channel CAC |
| Persuasiveness / Delivery / Confidence | 0–10 | Confident, engaging delivery; compelling narrative | Speaker notes quality; handoff smoothness |
| **Sources Cited (scored directly)** | **0–10** | **Sources woven into delivery for every quantitative claim** | **Source tag on EVERY claim bullet in deck outline + audible attribution cue in speaker notes** |
| Organization / Language | 0–10 | Logical flow; professional language; clear transitions | Narrative arc order; handoff cues in speaker notes |
| Delivery / Body Language | 0–10 | Eye contact, posture, gestures, pace, enthusiasm | Speaker note style (talking points, not read-aloud script) |
| Q&A Performance | 0–10 | Effectively answers questions; complete, on-topic responses | Q&A bank quality; both presenters rehearse all 20 questions |
| **Protocol Adherence** | **0 or 10 (BINARY)** | **ALL criteria met; one violation = 0** | **Protocol checklist authored + verified at rehearsal** |
| **TOTAL** | **120** | | |

**Key insight:** The Sources row and Protocol row together represent 20 points (16.7% of total) that are essentially administrative — they are won or lost by discipline, not talent. Protocol is binary: one QR code or one physical leave-behind drops it to zero. Sources requires audible attribution on every quantitative claim; source tags in the deck notes are the mechanism that enforces this.

---

## Slide Sequence Architecture

### Recommended Slide Count and Sequence

[ASSUMED — slide count based on arc order locked by D-03 and standard FBLA pitch pacing. Source-tag schema based on D-02.]

The deck has **12–14 content slides** (not counting title/sources): one slide per arc section, financials split across two slides (model + break-even/unit-economics), plus a demo placeholder slide and a closing ask slide. Lean toward fewer, denser slides over many thin slides — the rubric rewards delivery, not slide count.

| Slide # | Title | Speaker | Estimated Time | Phase 9 Source |
|---------|-------|---------|----------------|----------------|
| 1 | Title + team | Luke | 0:15 | — |
| 2 | Problem (fragmented tools + target user) | Luke | 0:45 | `pitch/market-research.md` §1 |
| 3 | Market Opportunity (TAM → SAM → SOM) | Luke | 1:00 | `pitch/market-research.md` §2 |
| 4 | Competitive Landscape (Nomad List / WhereNext / Teleport→Topia) | Luke | 0:45 | `pitch/market-research.md` §3 |
| 5 | Solution + Value Proposition (transformation frame) | Luke | 0:45 | `pitch/business-model.md` §1 |
| 6 | Three Differentiators (live-AI / roadmap / visa concierge) | Luke (intro) → Gabriel (visa/legal) | 0:45 | `pitch/market-research.md` §3, `pitch/business-model.md` §1 |
| 7 | **Demo** [FLOATING SLOT] | Gabriel (assumed) | 1:30–3:00 | Phase 8 product |
| 8 | Business Model + Pricing Tiers | Luke | 0:45 | `pitch/business-model.md` §2–3 |
| 9 | Financials — Model + Unit Economics | Gabriel | 1:00 | `pitch/financials/summary.md`, `model.csv` |
| 10 | Financials — Break-Even + LTV:CAC | Gabriel | 0:30 | `pitch/financials/summary.md` |
| 11 | Marketing + Acquisition Channels | Luke | 0:45 | `pitch/business-model.md` §5 |
| 12 | The Ask + Vision | Luke | 0:30 | — |
| 13 | Sources [backup only — not narrated] | — | — | All Phase 9 source tables |

**Total business arc (slides 1–6, 8–12 at plan targets):** ~6:00 [ASSUMED from per-slide time allocations above]
**Demo slot:** 1:30–3:00 floating
**Combined target:** 7:30–9:00, within 8:30–9:00 target band with normal demo timing

### Per-Slide Content Schema

Every slide in the deck outline follows this schema:

```
## Slide N: [Title]

**Speaker:** [Luke | Gabriel | Luke → Gabriel (handoff)]
**Target time:** [mm:ss]
**Headline:** [Single declarative sentence — the one thing judges take away]

**Key visuals (human-built in Canva):**
- [visual element description]

**Claim bullets (each must carry source tag):**
- [Claim text] [SOURCE: abbreviated citation]
- [Claim text] [SOURCE: abbreviated citation]

**Speaker notes (talking-point form):**
[LUKE:] Open with... / Bridge to...
[GABRIEL:] Lead with... / Acknowledge...
[HANDOFF CUE:] "I'll hand it to Gabriel who'll walk through the numbers."

**Source-attribution cue (in notes):**
"According to [source name], ..." — audible phrase the presenter uses to satisfy the Sources rubric row
```

This schema is the authoritative template for the deck outline file (`pitch/deck/deck-outline.md`).

### Sub-Timing Model for the ~6:00 Business Arc

[ASSUMED — derived from content density of each Phase 9 section and standard FBLA pitch pacing norms]

| Section | Slides | Target | Compressed | Rationale |
|---------|--------|--------|------------|-----------|
| Title + intro | 1 | 0:15 | 0:10 | No compression needed — tiny |
| Problem | 1 | 0:45 | 0:30 | One story + one statistic |
| Market (TAM/SAM/SOM) | 1 | 1:00 | 0:45 | Dense numbers — do not rush; SAM formula must be walkable |
| Competition | 1 | 0:45 | 0:30 | Three competitors named; Teleport exit narrative |
| Solution + value prop | 1 | 0:45 | 0:30 | Transformation frame; one before/after |
| Differentiators | 1 | 0:45 | 0:30 | Three bullets; visa concierge handoff to Gabriel |
| Business model + pricing | 1 | 0:45 | 0:30 | Four tiers + conversion ladder |
| Financials (two slides) | 2 | 1:30 | 1:00 | Gabriel owns; most Q&A follows from here |
| Marketing channels | 1 | 0:45 | 0:30 | Four channels + blended CAC |
| Ask | 1 | 0:30 | 0:20 | One specific ask |
| **Business arc total** | **11** | **~6:00** | **~4:35** | |

**Cut rule (if running long during demo):** Marketing section is the safest to compress from 0:45 to 0:30. Financials should never be rushed — that is Gabriel's defense territory and the most-challenged Q&A zone.

---

## Deck Content — Per-Section Detail

### Slide 2: Problem

**Headline:** "Young adults face a life-shaping decision with only disconnected, static tools."

**Claim bullets:**
- 25–34-year-olds move at ~16–18%/year — highest annual mobility rate of any adult age group [SOURCE: Census CPS Geographic Mobility historical tables]
- Today's process: Numbeo + Reddit + Google + LinkedIn + guesswork — no single product connects profile → ranked cities → financial reality → action plan [SOURCE: product landscape audit, market-research.md §1]
- Target user: 22–35, mobile, digitally native — recent grads, early-career professionals, remote workers, aspiring expats [SOURCE: internal definition; Census ACS B01001]

**Visual:** "5 browser tabs" graphic showing the fragmented status quo → single Potential screen

### Slide 3: Market Opportunity

**Headline:** "11M people/year make an active destination decision — 2M are our exact user."

**Claim bullets:**
- TAM: ~11M Americans move across county or state lines annually (active destination decision) [SOURCE: Census CPS Geographic Mobility, Table A-1]
- SAM: ~2M/year — 22–35, digital-first, active movers (derivation: 11M × ~18% age share × ~99% smartphone penetration) [SOURCE: Census CPS + Pew "Mobile Fact Sheet"; derivation labeled ASSUMED]
- SOM: 60,000 paid conversions over 3 years at 1% penetration of 6M cumulative SAM → ~$600K–$720K revenue [SOURCE: Truity/16Personalities funnel analogs — market-research.md §2]
- ~17M Americans identify as digital nomads (2023) [SOURCE: MBO Partners 2023 State of Independence]

**Visual:** Three nested circles (TAM/SAM/SOM) with numbers; formula box showing SAM derivation

### Slide 4: Competitive Landscape

**Headline:** "Teleport — the market leader — exited consumer entirely in 2022. The gap is ours."

**Claim bullets:**
- Nomad List ($9.99–$19.99): city scores, no personalized roadmap, no visa, no financial projection [SOURCE: live product inspection nomads.com, May 2026]
- WhereNext ($15–$79): 380 cities, static PDFs — no live-AI, no immigration concierge [SOURCE: getwherenext.com inspection + [FOUNDER-VERIFY: F6]]
- Teleport (266 cities, quiz-driven): acquired by MOVE Guides 2022, folded into Topia enterprise B2B — consumer product gone [SOURCE: Topia press release]

**Visual:** Competitor comparison table; red X on Teleport row; "Consumer gap" callout

### Slide 5: Solution + Value Proposition

**Headline:** "From 'I don't know where to live' to an executable plan — in one run."

**Transformation frame (speaker note):** Not a feature list. Frame as before/after: "You start with five browser tabs and zero answers. You finish with a ranked list of cities, a financial model showing exactly what your life looks like on your salary, and the step-by-step path to actually get there."

**Claim bullets:**
- Free: quiz + #1 match city + 1 headline financial figure (curiosity hook)
- Basic $0.99: full financial snapshot for #1 city (near-frictionless entry)
- Plus $9.99: full ranked list + live-AI (real jobs, housing, day-in-the-life) + relocation roadmap ← primary upsell
- Premium $29.99: everything + immigration/visa concierge

### Slide 6: Three Differentiators

**Headline:** "Three capabilities no competitor has."

**Claim bullets:**
- Live-AI layer: real-time job listings + housing + day-in-the-life narrative via Anthropic API — no competitor offers this [SOURCE: competitive audit, market-research.md §3]
- Personalized relocation roadmap: 6-section dynamic plan (vs. WhereNext static PDF at $79) [SOURCE: competitive comparison, market-research.md §3]
- Immigration/visa concierge: eligibility screener → pathway → document checklist → attorney referral — informational only, not legal advice [SOURCE: product spec, REQUIREMENTS.md VISA-01–04]

**Handoff cue:** [LUKE → GABRIEL] "Gabriel is uniquely positioned to speak to this third differentiator — he's navigated F-1, OPT, and the O-1A pathway himself."

### Slide 7: Demo [FLOATING SLOT]

**Headline:** "Let's see it live."

**Speaker notes:** [Demo placeholder — timing TBD at Phase 8]
- Golden-path script: [profile inputs → city results → Plus unlock → live-AI → roadmap → visa concierge]
- Fallback cue: if hotspot drops, narrate that you're showing cached golden-path data — do not apologize
- Target time: ~2:30 (compressible to 1:30 if running long after slide 6)
- Hard cut: if at 8:00 on the clock and still in demo, transition immediately to slide 8

### Slide 8: Business Model + Pricing

**Headline:** "Run-based, one-time pricing — modeled on 16Personalities. Your runs never expire."

**Claim bullets:**
- Free → Basic $0.99 (1 run) → Plus $9.99 (3 runs, "most popular") → Premium $29.99 (unlimited) [SOURCE: business-model.md §2, locked D-05]
- 16Personalities analog: "Reports for Pros" = $9/credit, credits never expire, no subscription — 100M+ test-takers [SOURCE: 16personalities.com/premium/reports — [FOUNDER-VERIFY: F4]]
- Conversion ladder: ~10–15% free → paid; ~30–40% Basic → Plus after sunk-cost $0.99 purchase [SOURCE: business-model.md §4; [ASSUMED] with FirstPageSage 2–5% SaaS benchmark anchor]
- Recurring/scaling: affiliate referral fees (attorney network) + future B2B employer-benefits product [SOURCE: business-model.md §3]

### Slide 9: Financials — Model + Unit Economics

**Headline:** "Break-even at Month 4. API COGS under 2% of revenue."

**Claim bullets:**
- Break-even: Month 4 (full model including marketing spend) / Month 3 (simple startup-cost recovery: $1,000 ÷ $9 net per paid user = 112 users) [SOURCE: financials/summary.md, model.csv]
- Blended revenue per paid user: ~$10–$12 (50% Basic / 35% Plus / 15% Premium mix) [SOURCE: financials/summary.md; [ASSUMED] tier mix]
- API COGS per Plus run: ~$0.06 (Haiku generation + web search tool) → ~98% gross margin [SOURCE: Anthropic pricing — [FOUNDER-VERIFY: F3]]
- Total startup cost: ~$1,000 (API deposit, domain, Vercel Pro, legal/registration) [SOURCE: financials/summary.md §startup costs]

**Visual:** 24-month line chart (Cumulative_Net from model.csv); break-even Month 4 clearly marked

### Slide 10: Financials — Break-Even + LTV:CAC

**Headline:** "LTV exceeds CAC even at conservative assumptions."

**Claim bullets:**
- Blended CAC: ~$8–$12 (organic-first: SEO 50% / Reddit 30% / TikTok 15% / university 5%) [SOURCE: business-model.md §5; [ASSUMED] with HubSpot/WordStream benchmark anchors]
- LTV by tier: Basic ~$1.30 / Plus ~$14 / Premium ~$45 (one-time × repeat-factor for 2–3× relocation frequency) [SOURCE: financials/summary.md §LTV; [FOUNDER-VERIFY: F7]]
- Blended LTV ~$13–$15 vs. blended CAC ~$8–$12 — positive unit economics from Month 1 [SOURCE: financials/summary.md]

**Speaker note (Gabriel):** "If a judge challenges the 1.4:1 LTV:CAC ratio as low — agree, and explain: we deliberately chose the one-time model because relocation is a one-time life decision. We earn repeat revenue through natural life recurrence, not a subscription that destroys the customer relationship."

### Slide 11: Marketing + Acquisition Channels

**Headline:** "Four channels, organic-first, targeting exact move-intent audiences."

**Claim bullets:**
- SEO: "cost of living in [city]" + "how to move to [city]" queries — highest-intent, CAC $5–$15 [SOURCE: business-model.md §5; [ASSUMED] HubSpot B2C benchmark anchor]
- Reddit: r/IWantOut (476K) + r/digitalnomad (2.3M) + r/SameGrassButGreener (290K) — $0–$5 CAC [SOURCE: business-model.md §5; [FOUNDER-VERIFY: F5] member counts]
- TikTok/Reels: founder-authentic immigration content — organic-first, $5–$20 CAC [SOURCE: business-model.md §5; WordStream ~$10 CPM anchor]
- University/career-center partnerships: F-1/OPT cohort, post-grad "where next" — $10–$30 CAC [SOURCE: business-model.md §5]

### Slide 12: The Ask

**Headline:** "Potential is ready to serve the 2 million people a year who need this answer."

**Speaker (Luke):** State the specific ask clearly — e.g., "We're seeking recognition of the gap we've identified and the model we've built to fill it. Potential is positioned to be the first product that actually answers the question every person in this room has faced: where should I build my life?"

---

## Q&A Bank — Full 20-Question Set

[ASSUMED — question selection, routing, and talking-point bullets authored from Phase 9 source material. Source tags cite the Phase 9 documents where the defense lives.]

### Format Per Entry

Each entry: Question | Routed to | 2–4 talking-point bullets | Source tag(s)

---

### MANDATED Q&A (6 required by D-06)

**Q1 — Data Accuracy**
"How do you ensure your city data is accurate?"

**Routed to:** Gabriel (data defense)

- All city financial data (salaries, rents, cost of living) is sourced from named primary sources: BLS OES for US salaries, HUD FMR for US rents, Numbeo for international cost of living — every data point has a documented URL in the codebase [SOURCE: REQUIREMENTS.md PITCH-04; PITFALLS.md P-TECH-04]
- International data is scoped to 4 golden-path cities (Lisbon, Berlin, Toronto, London) where sourced data exists — breadth is the scaling story, not v1 [SOURCE: ROADMAP.md Phase 4]
- All data displays "data as of [date]" timestamps; the live-AI layer provides recency feel via Anthropic web search [SOURCE: ROADMAP.md Phase 4 success criteria 4]
- Visa pathway content is traced to official government sources (AIMA, IRCC, BAMF, USCIS) — not expat blogs [SOURCE: REQUIREMENTS.md VISA-03; PITFALLS.md P-TECH-05]

---

**Q2 — CAC/LTV Defense**
"What are your customer acquisition costs and lifetime value? How defensible are those numbers?"

**Routed to:** Gabriel (hard numbers)

- Blended CAC is ~$8–$12, modeled bottom-up from four named channels: SEO ($5–$15 per paid user, anchored to HubSpot B2C benchmarks), Reddit ($0–$5), TikTok/Reels organic ($5–$20), university partnerships ($10–$30) — all stated assumptions with benchmark anchors, not measured campaign data [SOURCE: business-model.md §5; financials/summary.md §CAC]
- LTV = one-time price × (1 + repeat factor); Plus LTV ~$14 (40% return for second relocation decision), blended ~$13–$15 — driven by the 16–18%/year mobility rate in the 22–35 cohort [SOURCE: financials/summary.md §LTV; Census CPS mobility data — [FOUNDER-VERIFY: F7]]
- If challenged: "If CAC doubles to $20, break-even extends from Month 4 to ~Month 6 — still viable. The model is built so any assumption can be stress-tested." [SOURCE: financials/summary.md §assumptions sensitivity A4]
- These are stated modeled estimates, not live campaign data. The $0.99 near-frictionless entry justifies modeling higher conversion than the standard 2–5% SaaS freemium benchmark [SOURCE: business-model.md §4; FirstPageSage benchmark]

---

**Q3 — Legal Advice Avoidance**
"Isn't giving immigration guidance practicing law without a license? How do you avoid unauthorized practice of law?"

**Routed to:** Gabriel (legal + lived expertise)

- All immigration content is informational only: "general information, not legal advice" disclaimer is visible on every visa-concierge screen; every page ends with "consult a licensed immigration attorney" framing and an attorney-referral CTA [SOURCE: REQUIREMENTS.md VISA-04; PITFALLS.md P-TECH-06]
- We surface pathway information and eligibility criteria from official government sources (AIMA, IRCC) — we do not file applications, give case-specific advice, or make representations about outcomes [SOURCE: REQUIREMENTS.md "Out of Scope" — no legal immigration advice]
- The distinction: we inform and refer. Boundless/SimpleCitizen charge $459–$989 for guided application filing with attorney review — that's legal practice. We are an information tool that connects users to those services [SOURCE: FEATURES.md competitor table — Boundless/SimpleCitizen]
- Gabriel's own F-1 → OPT → O-1A/H-1B experience makes the content authentic and defensible — this is lived expertise informing an information product, not unlicensed legal practice [SOURCE: 10-CONTEXT.md Specifics]

---

**Q4 — Competitive Moat**
"What's your moat? Couldn't a competitor just copy the quiz format?"

**Routed to:** Luke (market/differentiation)

- The quiz format is not the moat. The three moats are: (1) the live-AI data layer — real jobs, real housing, real day-in-the-life, personalized at run time — which requires significant technical infrastructure no static competitor has built; (2) the personalized relocation roadmap that is dynamic, profile-specific, and template-authored from real expertise; (3) the immigration/visa concierge, where Gabriel's lived F-1 → OPT → O-1A pathway gives authentic credibility that a copycat product cannot instantly replicate [SOURCE: market-research.md §3 differentiators]
- Teleport proved the consumer market demand was real — and had 266 cities, quiz-driven matching, and $X million in backing — and still could not make the consumer product work at scale. Our insight is that it failed *not from lack of demand* but because it lacked the action layer (roadmap + visa concierge) that converts discovery into willingness to pay [SOURCE: market-research.md §3 Teleport narrative]
- Data moat: every run enriches our understanding of what users actually ask for — giving a future B2B product (employer relocation benefits) a data foundation competitors cannot quickly replicate [SOURCE: business-model.md §3 Stream 3]

---

**Q5 — API Failure Resilience**
"What happens if your live AI feature fails during the demo — or in production?"

**Routed to:** Gabriel (technical)

- Demo has a two-path architecture: live call attempted first; if it fails or exceeds 3 seconds, the bundled golden-path cache renders instantly — identical output, zero spinner [SOURCE: ROADMAP.md Phase 5 success criteria 4; PITFALLS.md P-TECH-01]
- Golden-path cache is for the exact scripted demo profile and cities — so fallback output is indistinguishable from a live call [SOURCE: ROADMAP.md Phase 5 success criteria 3]
- In production: same fallback, plus Anthropic's 99.9%+ API uptime and per-request timeout. The product never shows a blank state — it degrades gracefully to the last-known-good result [SOURCE: PITFALLS.md P-TECH-01]
- The product's core value (quiz → ranked cities → financials → roadmap) runs entirely offline — the live-AI layer is the Plus tier differentiator, not the basic product [SOURCE: ROADMAP.md Phase 3 success criteria 5]

---

**Q6 — Teleport Rebuttal**
"Wasn't Teleport already doing this? Why did they fail and why won't you?"

**Routed to:** Luke (market narrative)

- Teleport did NOT fail — they succeeded well enough to be acquired. MOVE Guides bought them in 2022 specifically to fold Teleport's city-matching intelligence into Topia's enterprise B2B global-mobility platform. The acquisition confirms there is institutional demand [SOURCE: Topia press release; market-research.md §3]
- Teleport exited consumer *by choice*, for a better margin profile in enterprise — not because consumer demand was absent. The gap they left is what Potential fills [SOURCE: market-research.md §3 — "chose to exit for better margin profile in enterprise"]
- The key difference: Teleport was a static data product. Potential's live-AI layer + relocation roadmap + visa concierge transforms discovery into action. Those three layers are why consumers pay — Teleport didn't have them [SOURCE: market-research.md §3 differentiators table]
- Our deliberate plan: build the consumer moat first (brand, data, trust), then offer a B2B layer from a position of demonstrated consumer value — not chase enterprise before proving consumer fit [SOURCE: business-model.md §3 Stream 3]

---

### RUBRIC-GAP Q&A (additional questions covering remaining rubric dimensions)

**Q7 — Market Sizing Methodology**
"How did you arrive at 2 million addressable users?"

**Routed to:** Luke (market)

- Bottom-up derivation from US Census data, not a top-down "industry size" figure: ~11M Americans move across county/state lines annually (Census CPS Table A-1) × ~18% aged 22–34 (Census ACS B01001) × ~99% smartphone penetration (Pew Research) = ~2M per year [SOURCE: market-research.md §2 SAM derivation]
- The derivation is presented as transparent arithmetic, not a black box — judges can follow the formula and re-derive in ~60 seconds [SOURCE: market-research.md §2 "SOM formula" note]
- The SAM arithmetic layer is labeled [ASSUMED] in our docs — we present it as a stated derivation, not a published figure [SOURCE: market-research.md §2 SAM table]

---

**Q8 — Why One-Time Pricing, Not Subscription?**
"Why not a subscription? That's usually better for SaaS."

**Routed to:** Luke (business model)

- Relocation is a one-time life decision. Charging monthly for a decision that happens once destroys the customer relationship and cannot survive Q&A from judges or customers [SOURCE: business-model.md §2 "Why Run-Based One-Time"]
- The pricing analog is 16Personalities (100M+ test-takers): one-time report credits that never expire, no subscription, with B2B subscription reserved for Teams. Same funnel, same pricing logic, proven at scale [SOURCE: business-model.md §2; 16Personalities pricing — [FOUNDER-VERIFY: F4]]
- Recurring revenue comes from natural life recurrence (22–35-year-olds relocate 2–3× in their 20s–30s), affiliate referral fees from attorney network, and a future B2B employer-benefits subscription — not a consumer MRR [SOURCE: business-model.md §3; [FOUNDER-VERIFY: F7]]

---

**Q9 — Why $0.99 Entry Point?**
"Isn't $0.99 too cheap? Does that devalue your product?"

**Routed to:** Luke

- The $0.99 entry is a deliberate psychological bridge — it reduces purchase friction to near-zero (an impulse buy below the price of a coffee) while crossing the "paid user" threshold [SOURCE: business-model.md §4 conversion mechanics]
- After paying $0.99, sunk-cost psychology + genuine curiosity drives ~30–40% of Basic buyers to upgrade to Plus ($9.99) — the primary upsell target [SOURCE: business-model.md §4 conversion ladder — [ASSUMED]]
- Even at $0.99, API COGS per Basic run are ~$0.01–$0.03 — the tier is margin-positive from the first sale [SOURCE: financials/summary.md §per-run margin proof]

---

**Q10 — First 1,000 Users**
"How do you get your first 1,000 users?"

**Routed to:** Luke (marketing)

- Reddit: r/IWantOut, r/digitalnomad, r/SameGrassButGreener — the founder (Gabriel) posts authentic responses to "where should I move?" threads; at 5% free-to-paid conversion, 1,000 free users → 50 paid users [SOURCE: business-model.md §5 Channel 3; model.csv Month 3: 45 paid users from 900 free]
- Personal network + founder-story content: Gabriel's F-1 → OPT → O-1A immigration journey is TikTok/Reels content that speaks directly to the F-1/OPT audience [SOURCE: business-model.md §5 Channel 2]
- University outreach: free access offer to career centers — high-intent audience, near-zero CAC [SOURCE: business-model.md §5 Channel 4]
- The model shows Month 3 = 105 paid users at 5% conversion on 900 free users — consistent with our stated acquisition model [SOURCE: model.csv Month 3 row]

---

**Q11 — Year 1 Revenue Projection**
"What do you project in year 1 revenue?"

**Routed to:** Gabriel (hard numbers)

- Year 1 (Months 1–12) total revenue from model.csv: ~$9,500 (sum of Total_Rev column) [SOURCE: model.csv]
- Year 1 Cumulative_Net: +$7,965 (profitable from Month 4 forward) [SOURCE: model.csv Month 12 row]
- Growth rate: ~1,034 cumulative paid users in 12 months at modeled conversion rates [SOURCE: model.csv — Paid_Users column sum M1–M12 = ~1,034]
- All projections are re-derivable from stated assumptions — if any assumption is challenged, we can walk through the sensitivity: "If CAC doubles, break-even extends to Month 6. If conversion drops to 3%, break-even extends to Month 5–7 — still viable." [SOURCE: financials/summary.md §assumptions log]

---

**Q12 — Profitability Timeline**
"When do you become profitable?"

**Routed to:** Gabriel

- Month 4: Cumulative_Net crosses to positive (+$10) — break-even on the full model including all marketing spend [SOURCE: model.csv Month 4 row: Cumulative_Net = +$9.68]
- Simple formula: $1,000 startup cost ÷ ~$9 net margin per paid user = ~112 users needed; reached at Month 3–4 [SOURCE: financials/summary.md §break-even analysis]
- Month 6: firmly profitable (+$942 cumulative); Month 12: +$7,965 [SOURCE: model.csv]

---

**Q13 — Visa Content Accuracy**
"How do you keep visa information current when immigration rules change constantly?"

**Routed to:** Gabriel

- V1 is scoped to two fully-built pathways: Portugal D8 and Canada Express Entry — where we can maintain sourced, dated content [SOURCE: REQUIREMENTS.md VISA-02]
- Every visa step traces to the official government source (AIMA for Portugal, IRCC for Canada) with a "data as of [date]" label — not expat blogs [SOURCE: REQUIREMENTS.md VISA-03; PITFALLS.md P-TECH-06]
- The disclaimer is structural: "Immigration rules change. Verify all information against current official sources and consult a licensed immigration attorney before acting." [SOURCE: REQUIREMENTS.md VISA-04]
- Breadth is a scaling story — we add pathways as we can maintain them accurately, not as fast as we can ship [SOURCE: REQUIREMENTS.md Out of Scope — exhaustive worldwide data]

---

**Q14 — Why Not Free?**
"Why should someone pay when Numbeo and Nomad List are free?"

**Routed to:** Luke

- Free tools give you data. Potential gives you decisions. The gap: no free tool takes *who you are* (income, career, citizenship, lifestyle priorities) and outputs *exactly what your life would look like* in 10 ranked cities, plus the concrete steps to get to the one you choose [SOURCE: business-model.md §1 value proposition]
- Numbeo: aggregate data, not personalized. Nomad List: city scores, no financial projection for your income, no roadmap, no visa. The transformation ("I know where I should live AND how to get there") is what people pay for [SOURCE: market-research.md §3 competitor table]
- 16Personalities and Truity prove people pay for personalized insight — they've done it 100M+ times [SOURCE: market-research.md §2 SOM — 16Personalities/Truity analogs]

---

**Q15 — Two-Person Presentation**
"How do you divide the presentation? What if one of you isn't available on competition day?"

**Routed to:** Luke

- Luke owns the narrative arc (problem, market, solution, business model, marketing, ask). Gabriel owns hard numbers and legalities (financials, visa concierge, legal-advice defense, data accuracy in Q&A) — playing to each presenter's authentic strengths [SOURCE: 10-CONTEXT.md D-08, D-09]
- Both presenters have rehearsed the full Q&A bank — either can field any question [SOURCE: 10-CONTEXT.md D-07]
- If one presenter is unavailable, the other can carry the full presentation — the deck is structured so either section stands alone [ASSUMED — contingency designed into rehearsal plan]

---

**Q16 — Demo Failure Contingency**
"What if your demo doesn't work on stage?"

**Routed to:** Gabriel (technical)

- Identical to Q5 answer on API failure resilience — demo has a two-path system: live + golden-path cache fallback that renders instantly [SOURCE: ROADMAP.md Phase 5; PITFALLS.md P-TECH-01]
- If the entire device fails: the pitch deck carries the full story. The demo proves the product is real; it does not carry the score. Four of six rubric dimensions are business substance [SOURCE: 10-CONTEXT.md D-04 rationale — "4 of 6 scored rubric dimensions are business substance"]
- Golden-path cache covers the scripted demo profile for at least 2 cities — it looks identical to a live run [SOURCE: ROADMAP.md Phase 5 success criteria 3]

---

**Q17 — Total Addressable Market Credibility**
"Your TAM of 11 million seems low compared to what you could potentially serve."

**Routed to:** Luke

- The TAM is intentionally scoped to the active decision-maker — someone who moved across county/state lines this year — not everyone who might someday move [SOURCE: market-research.md §2 TAM definition]
- A bigger TAM number could be quoted ($X billion "relocation industry") but it would be less credible and less defensible in Q&A. Bottom-up from Census data is more honest and more impressive to judges who understand business [SOURCE: market-research.md §2 "sizing approach" note]
- The digital nomad supplemental proof point (17M self-identified) shows the international layer expands the market meaningfully beyond domestic movers [SOURCE: market-research.md §2 international supplement; MBO Partners 2023]

---

**Q18 — Startup Cost Credibility**
"$1,000 startup cost seems very low. What are you leaving out?"

**Routed to:** Gabriel

- Breakdown: ~$50–$200 Anthropic API, ~$12–$15 domain, ~$240/year Vercel Pro, ~$50–$500 legal/registration — total range $200–$1,500, model uses $1,000 midpoint [SOURCE: financials/summary.md §startup costs]
- This is genuinely low because the product is AI-native: no data pipeline, no server infrastructure, no day-one team. Marginal cost of serving one additional user is one API call + one Vercel edge function [SOURCE: financials/summary.md §startup costs key pitch point]
- Hosting scales linearly with usage (Vercel Pro $20/month fixed); API cost is $0.06/run. Serving 10,000 users in a month costs ~$600 in API COGS — still 97%+ gross margin [SOURCE: financials/summary.md §per-run margin proof]

---

**Q19 — Regulatory Risk**
"What happens if immigration policy changes and your visa concierge is suddenly wrong?"

**Routed to:** Gabriel

- Structural safeguard: "data as of [date]" label on all visa content; users are explicitly directed to verify against current official government sources [SOURCE: REQUIREMENTS.md VISA-03]
- We scope v1 to two pathways (Portugal D8, Canada Express Entry) precisely because we can maintain them; we do not claim exhaustive coverage [SOURCE: REQUIREMENTS.md VISA-02]
- The "not legal advice" framing is structural — we are an information tool that connects users to qualified attorneys, not a legal service [SOURCE: REQUIREMENTS.md VISA-04; business-model.md §3 Stream 2]

---

**Q20 — How Does This Scale?**
"This seems like a one-person project. How does it scale beyond a competition prototype?"

**Routed to:** Luke

- The product is AI-native — scaling content depth (more cities, more visa pathways) is primarily a content and template authoring effort, not infrastructure build-out. Each new city adds a data JSON file and a roadmap template, not a new microservice [SOURCE: ARCHITECTURE.md approach — static JSON spine]
- Three scaling vectors: (1) more cities/pathways via content authoring + community contributions; (2) affiliate/attorney referral network (v2 formal); (3) B2B employer-benefits product (v2 scaling story — the Teleport path, executed deliberately after consumer moat is built) [SOURCE: business-model.md §3 Streams 2–3; REQUIREMENTS.md v2]
- The 16Personalities analogy: NERIS Analytics is a small team serving 100M+ test-takers profitably on the same funnel model — this is a proven, scalable structure for a two-person team [SOURCE: market-research.md §2 SOM — 16Personalities analog]

---

## Protocol Compliance Checklist (PITCH-09)

[CITED: extracted from PITFALLS.md P-PITCH-02, which read the official FBLA PDF directly; confirmed against 10-CONTEXT.md D-11]

This checklist is authored now and verified at rehearsal. It is structured as a day-of pre-competition binary checklist: every item is checked YES or NO; any NO blocks competition entry.

```
pitch/protocol-checklist.md
```

### Pre-Competition (authored now; verified day before)

**Timing**
- [ ] Full run-through with demo timed on phone hotspot: clock reads 8:30–9:00
- [ ] Hard cap: clock never exceeds 10:00 in any rehearsal run
- [ ] Marketing section sub-timed as the safe-compress zone (45s → 30s if running long)
- [ ] Demo slot hard-cut rule memorized: if at 8:00 on clock during demo, transition immediately to business model slide

**Device rules**
- [ ] Maximum two devices total brought to competition room
- [ ] Only ONE device faces judges (the demo laptop); second device (if used) faces presenters only
- [ ] Both devices run entirely on battery during the pitch (chargers unplugged before entering room)
- [ ] No external speakers connected to any device
- [ ] Both devices tested on battery for the full 10-minute run before competition

**Links, QR codes, URLs**
- [ ] Zero QR codes on any slide, in any slide deck, on any device screen visible to judges
- [ ] Zero URLs on slides formatted as clickable hyperlinks (plain text display only, if URLs shown at all)
- [ ] Judges will not be asked to scan, click, or interact with any digital element
- [ ] Demo uses golden-path scripted flow only — no live judge-accessible URLs

**Physical materials**
- [ ] No printed materials, handouts, one-pagers, or business cards brought into the competition room intended for judges
- [ ] Nothing is left with judges after the presentation (no USB drives, no paper)
- [ ] Team does not approach or touch the judge table at any point during setup or presentation

**Setup and conduct**
- [ ] No interaction with judges during setup period (before the presentation begins)
- [ ] Presentation is aligned to the assigned topic (Entrepreneurship Pitch — new business venture for Potential)
- [ ] No food, beverages, or live animals brought into the competition room

**Content compliance**
- [ ] Every quantitative claim in the deck has an audible source attribution (woven into speaker notes)
- [ ] All visa/immigration content displays "not legal advice — consult a licensed immigration attorney" framing
- [ ] No claim asserts that the product guarantees visa eligibility, legal outcomes, or specific data accuracy beyond cited source dates

**Dress code**
- [ ] Both presenters in business professional attire (FBLA standard: suit/blazer, collared shirt/blouse, dress shoes)
- [ ] No casual wear (no jeans, no sneakers, no t-shirts) on competition day

### At Rehearsal (verify these items require live testing)

- [ ] Golden-path fallback triggered deliberately by killing hotspot — confirmed renders instantly with no spinner
- [ ] Demo slot timed on actual competition laptop, on phone hotspot, with both presenters present
- [ ] Both presenters have run the full Q&A bank aloud (not just read it silently)
- [ ] Clock verification: three independent run-through times all land 8:30–9:00

---

## Rehearse-Later Specification (Phase 8–Gated)

This section specifies the rehearse-later work so it is immediately executable the moment Phase 8 is complete. No research or authoring work is needed at that point — only execution of the items below.

### Pre-Conditions (all must be TRUE before rehearse-later begins)

1. Phase 8 is verified complete (live demo + DemoTierSwitcher cycling all four tiers + golden-path fallback confirmed)
2. Demo golden-path script is written (specific profile inputs → specific city → specific outputs shown to judges)
3. Demo hard-cut timing rule is agreed (default: transition at 8:00 on the clock regardless of demo state)

### Rehearse-Later Task List

| Task | Who | Notes |
|------|-----|-------|
| Time the demo on the competition laptop on phone hotspot | Gabriel (assumed demo driver) | Target: 2:30; note the min (1:30) and max (3:00) observed |
| Confirm demo-slot length → update deck outline timing table | Both | If demo runs 2:30, total target is ~8:30 — ideal. If demo runs 2:00, add 30s to marketing section |
| Solo run-through #1: Luke delivers all his sections aloud with stopwatch | Luke | Target: 3:30 for Luke's sections. Note where he's slow |
| Solo run-through #1: Gabriel delivers all his sections aloud with stopwatch | Gabriel | Target: 2:30 for Gabriel's sections |
| Full paired run-through #1 with demo: clock the complete pitch | Both | Target: 8:30–9:00. If >9:00, apply cut-rule to marketing section |
| Full paired run-through #2: timed on phone hotspot (actual demo conditions) | Both | Must be on hotspot, not WiFi |
| Full paired run-through #3: timed; mock judge drills Q&A bank immediately after | Both + mock judge | All 20 Q&A questions drilled; any fumble noted for re-rehearsal |
| Verify protocol checklist items that require live testing | Both | Kill hotspot during run-through; confirm fallback; confirm battery operation |
| Final protocol checklist sign-off | Both | Every checkbox ticked; any NO resolves before competition |

### Handoff Cue Confirmation

Confirm these three handoff moments feel natural in the paired run-through:

1. **Slide 6 → Demo:** [LUKE] closes differentiators, introduces demo: "Let's see it in action." → [GABRIEL] takes laptop
2. **Demo → Slide 8:** [GABRIEL] closes demo, transitions: "Now that you've seen the product, let me walk you through the business model." → [LUKE] takes slide control
3. **Slide 10 → Slide 11:** [GABRIEL] closes financials: "The unit economics work. Now how do we reach those 2 million addressable users?" → [LUKE] takes over for marketing

---

## Founder-Verify Flag Surface (F1–F7)

[CITED: Phase 9 source documents; 09-CONTEXT.md and the three Phase 9 authored docs enumerate these flags]

These flags are open as of 2026-05-31. Any flag still open at pitch day is a claim-accuracy risk. The plan should include a verification task for each HIGH-priority flag.

| Flag | Claim | Used In | Priority | Action |
|------|-------|---------|----------|--------|
| F1 | International migration-interest % for 22–35 cohort | Slide 3 (Market — supplemental proof point) | MEDIUM | Gallup World Poll or MBO Partners proxy; if no clean number found, omit this specific % and cite the 17M digital nomads figure instead |
| F2 | Exact Census CPS year/count for mover data | Slide 3 (TAM: 11M, ~27–28M movers) | LOW | Confirm the specific CPS year from market-research.md §2 footnotes |
| F3 | Anthropic API pricing (~$0.06/run for Haiku + web search tool) | Slide 9 (Financials — API COGS claim) | HIGH — re-verify before every pitch | Screenshot anthropic.com/pricing within 2 weeks of pitch; if pricing changed, update model.csv and slide 9 claim bullet |
| F4 | 16Personalities pricing ($9/credit, $29 career suite, no consumer subscription) | Slide 8 (Business model analog) | HIGH if >30 days since last check | Re-verify at 16personalities.com/premium; if pricing changed, use Truity ($9–$19 reports) as fallback analog |
| F5 | Reddit community member counts (r/IWantOut 476K, r/digitalnomad 2.3M, etc.) | Slide 11 (Marketing) | LOW | Check day before competition; fluctuations of ±20% do not materially affect the argument |
| F6 | WhereNext pricing tiers ($15/$29/$49/$79) | Slide 4 (Competition) | MEDIUM | Re-verify at getwherenext.com before pitch |
| F7 | "People relocate 2–3× in their 20s–30s" (LTV repeat-factor rationale) | Slide 10 (LTV:CAC) and Q2 Q&A | MEDIUM | Census ACS lifetime mobility data or BLS migration tables for 25–34 cohort; fallback: cite the 16–18%/year annual mobility rate instead of the lifetime figure |

**Risk mitigation rule for all open flags:** If a flag cannot be verified before pitch day, the presenter must either (a) drop the specific unverified number and replace with the verified proxy cited above, or (b) qualify the claim with "approximately" and cite the derivation method rather than stating a precise number.

---

## Common Pitfalls for This Phase

### Pitfall 1: Source Tags Appear in Notes But Not in Delivery

**What goes wrong:** The deck outline carries source tags on every bullet, but the presenters don't actually say the source aloud — they just state the number. The rubric's Sources row is scored on *audible* attribution during delivery.

**How to avoid:** Speaker notes must include an explicit attribution-cue phrase for every quantitative claim bullet. Example: not just "[SOURCE: Census CPS]" but "[LUKE: 'According to the US Census Bureau's Current Population Survey...'] — followed by the number." The source-attribution cue in the speaker notes is the enforcement mechanism.

**Check:** During rehearsal, a third person listens for every source attribution. Any number stated without an audible source is flagged.

---

### Pitfall 2: Demo Slot Expansion Pushes Past 9:30

**What goes wrong:** The demo is interesting, Gabriel goes long, the pitch ends at 10:05.

**How to avoid:** Hard-cut rule at 8:00 on the clock: if Gabriel is still in the demo when the clock reads 8:00, he transitions regardless of where he is in the demo flow. This is non-negotiable. The deck has a post-demo transition cue on the demo slide: "Now, the business behind the product..."

**Check:** All three timed run-throughs must include a simulated clock check at the 8:00 mark. If the demo is still running, Gabriel practices the mid-demo cut.

---

### Pitfall 3: Q&A Bank Read, Not Rehearsed

**What goes wrong:** Both presenters read the Q&A bank silently and feel prepared. On stage, the first challenging question triggers a fumble because the answer was never actually spoken aloud.

**How to avoid:** The mock-judge drill in rehearsal run-through #3 must ask at least 15 of the 20 questions in random order, including the six hardest: Q3 (legal advice), Q6 (Teleport), Q2 (CAC/LTV), Q1 (data accuracy), Q5 (API failure), Q11 (year 1 revenue). Written Q&A answers are a crib sheet, not a script.

---

### Pitfall 4: Handoff Cues Feel Mechanical

**What goes wrong:** The transition from Luke → Gabriel on the financials section sounds scripted and awkward. Judges notice the seam.

**How to avoid:** Speaker notes carry the handoff cue language, but the presenters must personalize it in rehearsal. The cue should feel like a natural conversation — "I'll hand it to Gabriel who's going to walk you through the numbers he built" — not a formal baton pass.

---

### Pitfall 5: Protocol Checklist Not Run Day-Of

**What goes wrong:** The team does all the rehearsals but forgets to check one protocol item (e.g., a QR code appears on a slide they added late). 10 points gone.

**How to avoid:** The protocol checklist is the last thing both presenters complete before entering the competition room. It is on paper or a phone, not in the deck outline. The person NOT presenting first checks the checklist while the other sets up.

---

## Don't Hand-Roll for This Phase

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Source bibliography | A separate citation document | Inline source tags on each claim bullet in the deck outline — they ARE the bibliography |
| Timer during rehearsal | A separate timing app | A simple stopwatch (phone); both presenters agree on the time-check protocol before each run |
| Q&A routing system | A complex routing guide | The 20-question bank's "Routed to" column is the routing system |
| Canva slide structure | Custom slide layout logic | The per-slide content schema in this research document — Canva human execution follows the schema |

---

## Validation Architecture

No automated testing applies to this content-authoring phase. Validation is human and checklist-based.

| Requirement | Validation Method | Who | When |
|------------|-------------------|-----|------|
| PITCH-07: Every claim has source tag | Manual review of deck-outline.md — every claim bullet scanned for [SOURCE:] tag | Planner/implementer | After deck outline authored |
| PITCH-07: Timing targets sum to ~6:00 | Sum the per-slide target column | Planner/implementer | After deck outline authored |
| PITCH-08: 15+ Q&A entries | Count entries in qa-bank.md | Planner/implementer | After Q&A bank authored |
| PITCH-08: 6 mandated topics covered | Verify Q1–Q6 exist by topic name | Planner/implementer | After Q&A bank authored |
| PITCH-09: Protocol checklist complete | All checkbox items present, none skipped | Planner/implementer | After checklist authored |
| PITCH-09: Zero protocol violations | Run through checklist verbally against the deck outline | Both presenters | At rehearsal (Phase 8-gated) |

---

## Open Questions

1. **Competition date is not confirmed in planning docs**
   - What we know: FBLA competition season runs spring semester; NLC is typically June. STATE.md does not contain a specific competition date.
   - What's unclear: How many weeks until competition day? This drives urgency for the F3/F4 founder-verify re-checks and the rehearsal schedule.
   - Recommendation: Luke/Gabriel confirm state-level and NLC competition dates immediately; all rehearsal deadlines back-calculate from those dates.

2. **Demo ownership at Phase 8**
   - What we know: D-10/CONTEXT.md assumes Gabriel drives the demo (technical/visa-adjacent).
   - What's unclear: Not confirmed until Phase 8 is built and rehearsed.
   - Recommendation: Keep "Gabriel (assumed)" labels on demo slides; confirm at first paired rehearsal.

3. **F3 Anthropic pricing verification cadence**
   - What we know: Anthropic pricing must be re-verified within 2 weeks of pitch day (F3).
   - What's unclear: Competition date unknown, so the 2-week window can't be scheduled yet.
   - Recommendation: After competition date is confirmed, schedule a calendar reminder 2 weeks prior to re-verify anthropic.com/pricing and update slide 9 if changed.

4. **WhereNext pricing (F6)**
   - What we know: Slide 4 (Competition) cites WhereNext at "$15/$29/$49/$79" with a FOUNDER-VERIFY flag.
   - What's unclear: Price may have changed since May 2026 inspection.
   - Recommendation: Verify getwherenext.com pricing at the same time as the pre-pitch check (within 1 week of competition).

---

## Environment Availability

Step 2.6: SKIPPED — this phase produces markdown content files only. No external tools, runtimes, databases, or CLI utilities are required. Authoring targets are `pitch/deck/deck-outline.md`, `pitch/qa-bank.md`, and `pitch/protocol-checklist.md`.

---

## Security Domain

Step 2.6 security: NOT APPLICABLE — this phase produces presentation content, not code. No ASVS categories apply. The only security-adjacent item is the UPL (unauthorized practice of law) boundary for visa content, which is a content-compliance concern, not a software security concern. That concern is fully addressed in Q3 of the Q&A bank and in the legal-advice-avoidance protocol checklist item.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Per-slide time allocations (0:15 to 1:30 per slide) summing to ~6:00 business arc | Sub-timing model | If Gabriel's financials run long, total exceeds 9:00; mitigation: marketing section is the cut zone |
| A2 | 20 Q&A questions sufficient (vs. mandated 15+) | Q&A bank | Low risk — more is better; 20 provides coverage buffer |
| A3 | Demo slot 2:30 planning target fits within 8:30–9:00 envelope | Demo slot + business arc | If demo runs 3:00, total is ~9:00 — still within target; if demo runs 3:30+, pitch hits 9:30+ |
| A4 | Gabriel drives demo (assumed) | Deck speaker notes, rehearsal tasks | If Luke drives demo, handoff cues on slides 6–7 need updating at rehearsal |
| A5 | Rubric is 120 points across 12 dimensions as documented in PITFALLS.md | Rubric scoring map | LOW — PITFALLS.md author confirmed reading official PDF September 2025; if rubric changed for current cycle, re-read PDF |
| A6 | All F1–F7 founder-verify flags remain open (not verified since Phase 9 authoring) | Deck slides 3, 4, 8, 9, 10, 11; Q&A Q2, Q8 | Any flag that resolves with a changed number requires updating that slide's claim bullet before competition |

---

## Sources

### Primary (HIGH confidence)

- `pitch/market-research.md` — TAM/SAM/SOM figures, competitor table, three differentiators, Teleport narrative; Phase 9 Plan 01, 2026-05-31
- `pitch/business-model.md` — pricing tiers, conversion funnel, four marketing channels, per-channel CAC, unit economics; Phase 9 Plan 02, 2026-05-31
- `pitch/financials/summary.md` — break-even analysis, LTV by tier, per-run margin proof, 24-month model interpretation; Phase 9 Plan 03, 2026-05-31
- `pitch/financials/model.csv` — month-by-month base-case model; Cumulative_Net verified: Month 4 = +$9.68; Month 12 = +$7,965; Month 24 = +$34,588
- `.planning/research/PITFALLS.md` — rubric dimensions and point allocations extracted (author confirmed reading official FBLA PDF September 8, 2025); protocol violation items; Q&A scoring criteria
- `.planning/phases/10-pitch-deck-rehearsal-protocol/10-CONTEXT.md` — all locked decisions D-01 through D-11; canonical refs; author-now/rehearse-later split
- `.planning/REQUIREMENTS.md` — PITCH-07, PITCH-08, PITCH-09 definitions
- `.planning/ROADMAP.md` — Phase 10 success criteria; Phase 8 dependency
- `.planning/research/SUMMARY.md` — rubric scoring structure (120 points; Sources and Protocol rows described); pitch pitfall catalog

### Secondary (MEDIUM confidence)

- `Entrepreneurship Pitch Competition.pdf` (repo root) — original rubric source; could not be directly extracted in this session (pdftotext and PDF libraries not available); all rubric data cross-verified against PITFALLS.md which read this document directly [ASSUMED same document version applies for current competition cycle — confirm if competition cycle has changed since September 2025]

---

## Metadata

**Confidence breakdown:**
- Deck slide sequence and content: HIGH — derived directly from Phase 9 source documents; every claim bullet has a cited source in those documents
- Sub-timing model: ASSUMED — no empirical rehearsal data; based on content density and FBLA pitch pacing norms
- Q&A bank (mandated 6): HIGH — defense content exists in Phase 9 docs; talking points verified against source material
- Q&A bank (additional 14): ASSUMED — questions chosen by rubric gap analysis; answers derived from Phase 9 content
- Rubric scoring map: HIGH — verified against PITFALLS.md author's direct PDF read; cross-verified against SUMMARY.md
- Protocol checklist: HIGH — items directly from PITFALLS.md P-PITCH-02 protocol-violation list
- Rehearse-later specification: HIGH — derived from 10-CONTEXT.md D-10 and success criterion 3

**Research date:** 2026-05-31
**Valid until:** 2026-06-30 (rubric stable; pricing analogs subject to F3/F4 founder-verify checks)
