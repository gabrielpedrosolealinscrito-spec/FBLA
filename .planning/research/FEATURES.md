# Feature Research: Potential — Relocation Discovery & City Matching

**Domain:** Consumer relocation-decision / city-matching / personalized advisory web product
**Researched:** 2026-05-30
**Confidence:** HIGH (competitor analysis, pricing analogs) / MEDIUM (specific visa figures — verify against official government sources before pitch)

---

## Competitor Reference Map

Before feature breakdown, the competitive context matters for what counts as table stakes vs. differentiator:

| Product | Model | What They Do | What They DON'T Do |
|---------|-------|-------------|-------------------|
| **Nomad List / nomads.com** | One-time $9.99–$19.99 lifetime | City scores, filter by 100+ factors, community | No personalized roadmap, no visa pathway, no financial projection for your income |
| **Numbeo** | Free, ad-supported | Crowdsourced cost-of-living data, city comparison | No personalization, no matching, no roadmap |
| **Niche.com** | Free, ad-supported | Data-ranked US neighborhoods, resident reviews | US-only, no personalization quiz, no roadmap, no financials |
| **AreaVibes** | Free, ad-supported | US/Canada liveability scores | No personalization, no roadmap, no international |
| **SmartAsset** | Free, lead-gen | Cost of living calculator, salary comparison | Lead-gen product — sells financial advisor referrals, not user outcomes |
| **Teleport.org** | Was free consumer product (exited DTC market) | City matching across 266 cities, quality-of-life scores | Acquired by MOVE Guides (2022), folded into Topia's enterprise B2B global-mobility platform — the most prominent DTC city-matcher exited the standalone consumer market entirely. Source: topia.com press release. |
| **WhereNext** | Free tools + $15/$29/$49/$79 one-time reports | 95 countries, 380 cities, relocation case + PDF reports, 90-day action plan | No live-AI layer, no job/housing listings, no immigration concierge |
| **Relocate.me** | Free, community | Country guides, job board for relocation offers | No personalization, no roadmap, no financial projection |
| **Movehub** | Free, lead-gen | Shipping quote comparisons for movers | No discovery, no decision support |
| **Boundless / SimpleCitizen** | $459–$989+ per case | Guided immigration application filing + attorney review | Single-country, single-visa type — no city discovery, no lifestyle matching |
| **16Personalities** | Free test + $29 one-time career suite | Personality insights, 40+ page career guide | Closest pricing analog for our Plus tier |
| **Truity** | Free test + $9–$19 individual reports | Career/personality reports | Direct pricing analog for our Basic tier |

**Key insight from the competitive landscape:** Every city-matching product that went free-only either failed to monetize (and exited the consumer market like Teleport) or remains a static data lookup with no action layer (Numbeo, AreaVibes, SmartAsset). The monetizable gap is exactly what Potential fills: discovery is free, the roadmap + concierge is what people pay for. WhereNext is the closest emerging competitor — at $15–$79 static PDFs, without a live-AI layer or immigration concierge, it validates the price range and leaves the differentiators wide open.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Tier | Notes |
|---------|--------------|------------|------|-------|
| Profile quiz (career, finances, lifestyle, priorities) | Every matching product asks who you are before making recommendations | MEDIUM | Free | Already in v0. 5-step flow is right scope. |
| City match results with a ranked list | The core output — users came to see where they should live | LOW | Free (teaser) / Basic (full list) | Free shows #1 match only; Basic unlocks full ranked list |
| Cost-of-living data per city | Users will immediately sanity-check any recommendation against cost | LOW | Free (headline number) / Basic (breakdown) | Numbeo/AreaVibes have trained this expectation |
| Income-adjusted financial projection | "Can I afford to live there on my salary?" is the first real question | MEDIUM | Basic | Salary input → take-home after taxes → expense breakdown → monthly savings delta |
| Safety, walkability, climate scores | Standard city-data dimensions; missing any one feels like a gap | LOW | Basic | Niche/AreaVibes/Nomad List all surface these |
| Search/filter/sort cities | Users want agency to explore beyond the algorithm's top pick | LOW | Basic | Even free tools like Numbeo offer this |
| Mobile-responsive layout | Majority of discovery happens on phones | LOW | All tiers | Existing dark-theme design should be responsive |
| City detail page | Clicking a recommended city needs a destination with real content | MEDIUM | Basic | Current v0 has this; needs to cover international cities |
| Save/compare cities | Users research over multiple sessions, want to revisit shortlist | MEDIUM | Basic | Session persistence or account-based saves |

### Differentiators (Competitive Advantage)

Features that set Potential apart. Not expected by users, but create real value and willingness to pay.

| Feature | Value Proposition | Complexity | Tier | Notes |
|---------|-------------------|------------|------|-------|
| **International destinations** | Most tools are US-only (Niche, AreaVibes, SmartAsset). International scope unlocks the "living abroad" narrative and the visa concierge upsell. | HIGH | Basic (international cities in ranked list) | Canada, UK, Germany, Portugal, Australia, Japan, Spain as v1 targets — countries with clear English-accessible immigration pathways |
| **Live AI data layer** (real jobs, real housing, day-in-the-life) | Transforms a static report into a dynamic, personal window. No competitor does this — this is the demo centerpiece and the product's magic. | HIGH | Plus | Already in v0 as broken client-side call; needs backend proxy. This is the single biggest Plus upsell driver. |
| **Relocation roadmap output** | A step-by-step "how to actually move there" with timeline, costs, action items, housing/job path, and visa track. No city-matching competitor offers this. WhereNext offers a static PDF; Potential's is dynamic and AI-generated. | HIGH | Plus | Full spec below in "Roadmap Contents" section |
| **Immigration/visa pathway** | The "how do I legally live there?" answer — eligibility screening, pathway map, document checklist, cost/timeline estimate, attorney referral. Founder's authentic expert edge. | HIGH | Premium | Full spec below in "Visa Concierge" section |
| **Financial reality view (income → savings)** | Input your actual salary or target salary range, see real monthly savings/deficit, tax wedge by country — not just raw cost data. | MEDIUM | Basic | Competitors show costs; Potential shows YOUR money in that city |
| **Openness-to-abroad slider in quiz** | Explicit "how open are you to living internationally?" input drives richer, more personal results than generic city lists | LOW | Free (part of quiz) | Unique to Potential's framing |
| **Day-in-the-life narrative** | AI-generated "here's what your typical Tuesday looks like in Lisbon on your income" — makes abstract data emotional and sticky | MEDIUM | Plus | Part of the live-AI layer output |
| **Dealbreaker hard filters** | "No cold winters," "must have walkable food scene," "no country with X political environment" — hard eliminates vs. soft weights | LOW | Free (part of quiz) | Makes recommendations feel genuinely personalized, not generic |
| **Hybrid one-time + subscription pricing** | Basic/Plus as one-time reports (impulse buy), Premium as subscription (recurring MRR narrative for judges) | LOW | Product architecture | Pricing model is a differentiator vs. competitors who are fully free or fully subscription |

### Anti-Features (Deliberately NOT Building)

| Anti-Feature | Why It Seems Appealing | Why We Avoid It | What We Do Instead |
|-------------|------------------------|-----------------|-------------------|
| **Hard paywall on all results** | Maximizes per-session revenue | Kills top-of-funnel; free teaser is the conversion mechanism; judges score value-prop | Free teaser shows #1 match + one headline financial number, paywalls the rest |
| **Legal immigration advice / "we file your visa"** | Sounds like a premium full-service product | Unauthorized Practice of Law (UPL) — non-attorneys cannot give legal advice or prepare applications for compensation without attorney oversight. This is a real legal risk that would undermine credibility with judges if overclaimed. | Eligibility screening + pathway mapping + document checklists + cost/timeline estimates + licensed attorney referral. We inform and connect; we don't practice law. |
| **Exhaustive worldwide data (200+ countries, day 1)** | "Complete" sounds better | Unachievable with real data quality; sparse data for obscure cities undermines trust | 12 US cities + 7–10 international cities with high data confidence as v1 "golden path." Breadth is a scaling story. |
| **Native mobile apps (iOS/Android)** | Users live on phones | Not needed to win the competition; adds build complexity without pitch value | Mobile-responsive web. |
| **Real payment processing / live billing** | Looks more legit | Stripe integration takes time; judges evaluate the business model, not the checkout flow | Tier system demonstrable via UI state; billing described in pitch, not implemented |
| **Neighborhood-level granularity** | Niche does zip-code level rankings | Requires massive data; Potential's value is city-level decision, not apartment hunting | City-level. Housing listings (via AI layer) provide granularity at the Plus tier. |
| **Real-time data pipelines** | "Always current" sounds valuable | Data freshness creates ongoing cost and reliability risk; AI layer already provides recency feel | AI-powered live listings + quarterly data refresh cadence as the accuracy story |
| **Community / forums / social features** | Nomad List community is a feature | Building community requires network effects and moderation — wrong phase for a competition prototype | Not in scope; optionally add as v2 if product-market fit is validated |

---

## Relocation Roadmap — Concrete Contents Spec

The roadmap is the Plus tier's primary value driver. It answers: "OK, I want to move to Lisbon. Now what?" No city-matching competitor provides this in a personalized, dynamic format. WhereNext offers a static PDF; Potential's roadmap is generated from the user's specific profile (timeline, job situation, visa status, finances).

### Roadmap Structure (6 Sections)

**Section 1: Timeline Overview**
- User-input target move date (or "exploring / no timeline")
- Backward-calculated milestone schedule: "If you want to move in 9 months, here's what to do in months 1, 3, 6, 8, and at arrival"
- Visual timeline rail with completion checkboxes
- Confidence: MEDIUM — standard relocation guides use 6-month and 12-month phases; customizable to user input

**Section 2: Financial Preparation**
- How much runway to save before moving (3-month emergency fund in destination currency)
- One-time moving costs: shipping estimate (based on "apartment contents" size input), flights, security deposit (1–3x monthly rent typical)
- Setup costs: SIM card, local ID, bank account setup, residence permit fees
- Currency/banking strategy: keep home account, open local account (Wise/Revolut as transitional), direct deposit switch timeline
- Sources: CapRelo international relocation checklist, Tekce 12-month moving guide

**Section 3: Job Search Path**
- If user is remote/freelancer: checklist for notifying employer, tax residency rules in destination country, invoicing setup
- If user needs a local job: 3–6 month job search lead time, local job board links per city, LinkedIn localization tips, salary expectation calibration (from city financial model)
- Visa-linked job constraints: "Your profile suggests X visa, which requires employer sponsorship — job search must precede application"
- For international: note if city has strong expat job market in user's career domain (surfaced from quiz career data)

**Section 4: Housing Path**
- Phase 1 — Temporary accommodation (1–3 months): Airbnb, serviced apartments, hostels for initial landing
- Phase 2 — Mid-term rental: Furnished month-to-month; recommended platforms per city (Idealista for Spain/Portugal, Immobilienscout24 for Germany, Zoopla for UK, etc.)
- Phase 3 — Long-term lease: What to expect in local market (deposit norms, typical lease length, agent fees)
- Red flags by city: common rental scams in destination, foreign national renter constraints
- Estimated budget: pulled from city financial model, broken into phases

**Section 5: Logistics Checklist**
- 6+ months before: passport validity check (needs 6 months beyond intended stay), visa research start, housing decision on current home (sell/sublet/break lease)
- 3 months before: visa application submission window, moving company quotes, healthcare/insurance research
- 1 month before: confirm shipping, notify bank/employer of address change, forward mail, prescription refills, vaccination check for destination
- Arrival week: airport pickup plan, SIM card, temporary cash/ATM, notify contacts of new address, bank account opening
- First 30 days in destination: register with local municipality (mandatory in most EU countries), open local bank account, set up utilities, find GP/doctor
- Sources: International Insurance moving abroad guide, CapRelo international relocation checklist

**Section 6: Visa / Immigration Track** (summary only at Plus; full detail is Premium)
- At Plus: surface the likely visa pathway based on user's nationality + destination + work situation; show timeline and cost range; upsell CTA to Premium for full concierge
- Message: "You likely qualify for [visa type]. Processing typically takes [X months] and costs [Y range]. Upgrade to Premium for your full eligibility assessment and step-by-step filing guide."
- Sources: Tekce, Taxes for Expats, Citizen Remote destination guides

---

## Immigration/Visa Concierge — Concrete Feature Spec

This is the Premium tier's exclusive differentiator. Founder's authentic expertise (F-1 → OPT → O-1A/H-1B navigation) makes this defensible. The UPL constraint defines the scope boundary precisely.

### What It IS (legally safe, genuinely useful)

| Sub-feature | Description | Confidence |
|------------|-------------|------------|
| **Eligibility screener** | 10–15 question intake (nationality, work situation, education, income, family ties, criminal history, travel history) that maps the user to 2–4 likely visa pathways | HIGH — standard immigration screening practice; ILRC and AILA publish templates for this |
| **Pathway comparison card** | Side-by-side view: visa type, eligibility requirements, processing time, government fees, likelihood score, pros/cons | HIGH — feature design is sound; specific figures per row need official source verification |
| **Document checklist (per pathway)** | "To apply for Portugal D8, you will need: [1] proof of remote income above the minimum threshold, [2] valid health insurance, [3] clean criminal record certificate, [4] NIF number..." — specific, actionable, downloadable | MEDIUM — checklist structure is correct; verify exact income minimums and document list against official Portuguese immigration authority (AIMA) before pitch |
| **Cost breakdown** | Government filing fees + biometrics + medical exam + translation costs + agent/attorney fees (estimated range, not quote) | MEDIUM — ranges sourced from expat guides (citizenremote, getgoldenvisa), not official government fee schedules; verify against official sources |
| **Processing timeline estimate** | Typical processing time by pathway — based on published processing times from expat guides | MEDIUM — processing times change; figures sourced from secondary expat guides, not official government backlogs; label as "typical estimate" not guarantee |
| **Common rejection reasons** | "The top rejection reasons for [visa type] and how to avoid each" — educational, not legal advice | HIGH — this framing is clearly informational, not legal advice |
| **Destination-specific immigration guides** | Curated per covered country: US (H-1B, O-1, EB-1), Canada (Express Entry, IIVC), Portugal (D7, D8), Germany (Job Seeker, Skilled Worker), UK (Skilled Worker), Spain (Digital Nomad), Australia (Skilled Independent) | MEDIUM — content accuracy depends on keeping current with policy changes; flag for ongoing maintenance |
| **Licensed attorney referral** | "Ready to file? Connect with an immigration attorney in [destination country]" — partner referral network (initially manual curation, eventually affiliate revenue) | MEDIUM — attorney referral is legal and common (Boundless does this at $79/30 min); network needs active curation |
| **Application tracker template** | Downloadable spreadsheet/checklist for tracking documents submitted, outstanding, and deadlines | HIGH — this is informational tooling, no legal risk |

### What It IS NOT (UPL boundary — do not cross)

- We do NOT prepare, review, or submit immigration forms
- We do NOT advise on specific case merits ("you WILL qualify" vs. "you appear to meet published requirements")
- We do NOT provide legal opinions on borderline situations
- We do NOT represent users before immigration authorities
- Framing in all copy: "This tool maps published visa requirements to your profile. For legal advice on your specific case, consult a licensed immigration attorney."

### Visa Types Covered in v1 (prioritized by user profile fit)

| Destination | Visa Types | Target User |
|-------------|-----------|-------------|
| United States | H-1B specialty occupation, O-1A extraordinary ability, EB-1 extraordinary ability, F-1 student | Non-US users, or US users evaluating staying |
| Canada | Express Entry (CEC/FSW), Provincial Nominee, PGWP for students | High-skilled workers, recent graduates |
| Portugal | D7 passive income, D8 digital nomad, D2 entrepreneurship | Remote workers, passive income, entrepreneurs |
| Germany | Skilled Worker (Fachkräftezuwanderungsgesetz), Job Seeker, EU Blue Card | Degree-holders in shortage occupations |
| United Kingdom | Skilled Worker, Graduate Route | Post-study; employer-sponsored workers |
| Spain | Digital Nomad, Non-Lucrative | Remote workers, retirees |
| Australia | Skilled Independent (189), Skilled Nominated (190) | Points-tested skilled migrants |

---

## Freemium Tier Structure

Pricing analogs: 16Personalities ($29 one-time career suite — confirmed from official page), Truity ($9–$19 reports), WhereNext ($15/$29/$49 one-time PDFs — confirmed from live product), Nomad List ($9.99–$19.99 one-time). All are in the consumer-report or consumer-subscription space and directly validate Potential's price ladder.

### Tier 0: Free (The Hook)

Purpose: Drive top-of-funnel traffic; show enough value to trigger desire to upgrade; never feel like a bait-and-switch.

| Feature | Free Tier Behavior |
|---------|-------------------|
| Profile quiz (full 5 steps) | Fully accessible — this is investment, creates sunk cost |
| Match results | #1 match city only, city name + match score + one headline financial figure (e.g., "estimated monthly savings: +$340") |
| City data | No detail — clicking city triggers upgrade prompt |
| Roadmap | Not shown — locked with "See your full relocation roadmap" CTA |
| International cities | Not shown — locked |
| AI live listings | Not shown |
| Visa info | Not shown |

**Conversion trigger:** User sees their #1 match, gets one compelling number, wants to see full list + financial breakdown. Upgrade CTA is contextual ("You matched 7 cities. See all of them.").

### Tier 1: Basic (~$9, one-time)

Purpose: Impulse-buy threshold. "It's less than a coffee meeting with a friend who's moved abroad." Low friction, high volume. Anchors the price ladder.

| Feature | Basic Tier |
|---------|-----------|
| Full ranked match list (all cities) | Yes |
| Per-city match score breakdown | Yes — which quiz factors drove the score |
| Full financial breakdown per city | Yes — salary estimate, take-home, itemized expenses, monthly savings delta |
| Safety / climate / walkability scores | Yes |
| International cities in results | Yes |
| Compare up to 3 cities side-by-side | Yes |
| Save results (account) | Yes |
| Live AI data layer (jobs, housing) | No — locked |
| Relocation roadmap | No — locked |
| Visa concierge | No — locked |

**Conversion trigger:** User has Basic, loves a city, wants to know "OK but HOW do I actually get there?" → Plus upsell.

### Tier 2: Plus (~$29, one-time) — PRIMARY UPSELL TARGET

Purpose: The "real product." Contains the live-AI magic and the roadmap — the two things that make Potential feel unlike any competitor. This is what the pitch demo showcases. Price anchored against 16Personalities Career Suite ($29 one-time).

| Feature | Plus Tier |
|---------|-----------|
| Everything in Basic | Yes |
| Live AI data layer | Yes — real job listings, real housing listings, neighborhood vibe, day-in-the-life narrative, powered by LLM |
| Full relocation roadmap (all 6 sections) | Yes — personalized to their profile and target city |
| Visa pathway summary (1-pager) | Yes — visa type(s) likely applicable, timeline, cost range, attorney referral CTA |
| Priority city (full detail on top match) | Yes |
| PDF export of roadmap | Yes |
| Offline-readable output | Yes — critical for demo reliability |

**Conversion trigger:** User has Plus roadmap, clicks into visa section, sees "Your full immigration pathway is in Premium." → Premium upsell for internationally-moving users only.

### Tier 3: Premium (~$99 or $9.99/month subscription) — IMMIGRATION CONCIERGE

Purpose: Captures the internationally-bound user who needs the full visa picture. Subscription model creates MRR narrative for judges. Attorney referral creates potential B2B2C affiliate revenue stream.

| Feature | Premium Tier |
|---------|-------------|
| Everything in Plus | Yes |
| Full eligibility screener (visa match) | Yes |
| Pathway comparison cards | Yes |
| Per-pathway document checklist | Yes |
| Cost/timeline breakdown per visa | Yes |
| Common rejection pitfalls guide | Yes |
| Attorney referral (curated partners) | Yes |
| Application tracker template download | Yes |
| Updates when visa policy changes (subscription only) | Yes — this justifies recurring billing vs. one-time |
| Email support for "what does this mean?" questions | Yes — not legal advice, but product/navigation support |

**Pricing note:** One-time $99 OR $9.99/month. Subscription preferred for MRR story in pitch. Position as: "Visa policy changes. Your subscription keeps your pathway current."

---

## Feature Dependencies

```
Quiz Profile (Free)
    └──required by──> City Matching Engine (Free/Basic)
                          └──required by──> Financial Projection (Basic)
                          └──required by──> Live AI Layer (Plus)
                          └──required by──> Relocation Roadmap (Plus)
                                                └──required by──> Visa Pathway Summary (Plus)
                                                                      └──required by──> Full Visa Concierge (Premium)

International Cities (Basic)
    └──required by──> International Visa Concierge (Premium)
    └──enables──> "Living Abroad" pitch narrative

Live AI Layer (Plus)
    └──depends on──> Backend API Proxy (infrastructure — not a feature, a constraint)
    └──depends on──> Offline Golden Path Cache (competition insurance)
```

### Dependency Notes

- Quiz must come before matching — this is already correct in v0
- International cities must be in the data layer before the visa concierge means anything
- The backend proxy for the live AI layer must exist before Plus tier can be demonstrated — this is a blocker
- Offline cache is not a feature but a constraint driven by competition rules (no internet provided at venue)

---

## MVP Definition for Competition Demo

### Launch With (Demo-Ready)

These must work on stage, on battery, via hotspot, with a golden-path fallback:

- [ ] Full 5-step quiz (including international openness and dealbreakers)
- [ ] City matching results showing Free teaser (1 city) vs. Basic (full list) — demonstrable tier jump
- [ ] Financial projection per city for at least the "golden path" demo city
- [ ] International cities present in results (minimum: Lisbon, Berlin, Toronto, London — real data for these four)
- [ ] Live AI data layer working via backend proxy — real jobs + housing + day-in-the-life for golden path city
- [ ] Roadmap output for the golden path city — all 6 sections populated (can be semi-static for demo)
- [ ] Visa concierge for at least 2 pathways (e.g., Portugal D8, Canada Express Entry) — demonstrate Premium tier
- [ ] Tier gate UI — showing locked features with upgrade prompt, showing what each tier unlocks

### Add After Competition (V1 Public)

- [ ] Real Stripe integration (payments)
- [ ] Account persistence / saved profiles
- [ ] Expanded city database (20+ international cities)
- [ ] Attorney referral network (actively curated)
- [ ] Email delivery of reports

### Defer to V2

- [ ] Community features / nomad forums
- [ ] Real-time visa policy change tracking
- [ ] Employer-side B2B product (relocation benefits for remote-first companies)
- [ ] Native mobile app

---

## Feature Prioritization Matrix

| Feature | User Value | Build Cost | Demo Priority |
|---------|------------|------------|---------------|
| Quiz + city matching | HIGH | LOW (v0 exists) | P1 |
| Financial projection | HIGH | LOW (v0 partial) | P1 |
| International cities (4 cities) | HIGH | MEDIUM | P1 |
| Live AI layer (backend proxy) | HIGH | HIGH | P1 — demo centerpiece |
| Relocation roadmap | HIGH | MEDIUM | P1 |
| Tier gate UI (free/basic/plus/premium) | HIGH (pitch) | LOW | P1 |
| Visa concierge (2 pathways) | HIGH (pitch) | MEDIUM | P1 |
| Offline golden path cache | MEDIUM (insurance) | LOW | P1 (risk mgmt) |
| Full city database (12+ US, 10+ intl) | MEDIUM | MEDIUM | P2 |
| PDF export | MEDIUM | LOW | P2 |
| Save/compare cities | LOW | MEDIUM | P3 |
| Attorney referral network | LOW (v1) | HIGH | P3 |

---

## Competitor Feature Analysis

| Feature | Nomad List | WhereNext | Niche.com | Teleport (exited DTC) | **Potential** |
|---------|------------|-----------|-----------|-------------------|--------------|
| Personalization quiz | No | 4-question intake | No | Yes (full quiz) | Yes (5-step, deep) |
| International cities | Yes (150+) | Yes (95 countries) | No (US only) | Yes (266 cities) | Yes (v1: 10–14) |
| Financial projection (YOUR money) | No | Partial | No | Partial | Yes — full income→savings |
| Live job/housing listings | No | No | No | No | Yes (Plus, AI-powered) |
| Relocation roadmap | No | Static PDF | No | No | Yes (Plus, dynamic) |
| Visa pathway | No | Mentioned in reports | No | No | Yes (Premium, full spec) |
| Free tier with teaser | No (paid-only) | Yes | Yes | Yes (was free) | Yes (quiz + 1 match) |
| One-time payment | Yes ($9.99–$19.99) | Yes ($15–$79) | No (free/ad) | N/A | Yes (Basic $9, Plus $29) |
| Subscription option | No | No | No | N/A | Yes (Premium $9.99/mo) |
| Business model | One-time memberships | One-time reports | Ad-supported | Exited to enterprise B2B | Hybrid: one-time + subscription |

---

## Sources

- Nomad List / nomads.com — live product inspection (May 2026)
- WhereNext (getwherenext.com) — live product inspection (May 2026): https://getwherenext.com/
- 16Personalities Premium Career Suite ($29 pricing + features confirmed from official page) — https://www.16personalities.com/premium/career-suite
- Truity pricing ($9–$19 reports) — https://www.truity.com/
- Teleport acquisition by MOVE Guides → Topia — https://www.topia.com/company/news/press-release-move-guides-acquires-teleport/
- Boundless immigration services scope and attorney referral model — https://www.boundless.com/
- SimpleCitizen pricing ($459–$989) — https://www.simplecitizen.com/pricing/
- International relocation checklist phases — https://www.internationalinsurance.com/moving-abroad/checklist/ and https://www.caprelo.com/insights-resources/employee-experience/international-relocation-checklist-the-complete-step-by-step-guide-to-moving-abroad/
- Portugal D7/D8 visa overview (secondary source — verify official figures against AIMA Portugal) — https://citizenremote.com/visas/portugal-digital-nomad-visa/
- ILRC immigration screening tool methodology — https://www.ilrc.org/resources/screening-immigration-relief-client-intake-form-and-notes
- Freemium conversion rate benchmarks (2–5% typical, 30%+ outliers) — https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/ and https://userpilot.com/blog/freemium-conversion-rate/
- Niche.com methodology — https://www.niche.com/places-to-live/rankings/methodology/
- Relocate.me product — https://relocate.me/

---

*Feature research for: Potential — relocation discovery and city matching consumer web product*
*Researched: 2026-05-30*
