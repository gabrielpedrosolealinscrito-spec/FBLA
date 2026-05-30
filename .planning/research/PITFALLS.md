# Pitfalls Research

**Domain:** Relocation-discovery web app + FBLA Entrepreneurship Pitch Competition
**Researched:** 2026-05-30
**Confidence:** HIGH (rubric read directly from official PDF; technical pitfalls from known LLM/API patterns)

---

## Part 1: Product / Technical Pitfalls

These pitfalls kill the demo or destroy credibility in Q&A.

---

### P-TECH-01: Live LLM Call Fails Mid-Demo with No Fallback

**What goes wrong:**
The demo's centerpiece is a live AI-powered listings/data layer called via the Anthropic API. Internet is "Not Provided" at the venue. If the hotspot drops, the API times out, or the call errors, the whole demo freezes mid-pitch. Judges see a spinner or a crash. The "wow moment" becomes a liability.

**Why it happens:**
The existing `potential_v2.jsx` already has a broken client-side fetch with no auth and no error handling. The instinct is to fix the auth and ship — without thinking through what happens when the call fails on stage.

**How to avoid:**
Before the demo phase is locked, implement a two-path system: (1) live call attempted first, (2) pre-generated "golden path" cache served as fallback if the call fails or takes >3s. The cache should be for the exact demo scenario (specific profile inputs → specific city results) so fallback output looks identical to live output. Never let the UI show a loading state for more than 3 seconds on stage.

**Warning signs:**
- No error boundary around the AI call
- No `timeout` parameter set on the fetch
- Demo only tested on fast WiFi, never on mobile hotspot
- No cached result files exist in the repo

**Phase to address:** Product build phase — demo hardening milestone. Must be done before any dry-run rehearsal.

---

### P-TECH-02: LLM Returns Unparseable or Junk JSON

**What goes wrong:**
The app asks the LLM to return structured data (job listings, housing, day-in-the-life details). LLM output is non-deterministic. Under prompt pressure, the model returns malformed JSON, partial JSON wrapped in markdown code fences, or prose instead of structure. The app either crashes trying to `JSON.parse()` or renders garbage.

**Why it happens:**
Prompts that say "return JSON" without enforcing a strict schema, without using the API's `response_format` or tool-calling structured output feature, and without a parse-and-retry fallback.

**How to avoid:**
Use Anthropic's tool-use / structured output feature to enforce a schema. Always wrap `JSON.parse()` in a try/catch that falls back to the cached result. Validate the parsed object against expected keys before rendering. Test with adversarial prompts before the demo.

**Warning signs:**
- Prompt says "return JSON" in plain text with no schema enforcement
- No try/catch around JSON.parse in the rendering path
- No schema validation (missing keys crash the UI)
- Only tested with "happy path" LLM responses

**Phase to address:** Product build phase — backend/proxy implementation sprint.

---

### P-TECH-03: API Key Exposed in Client-Side Code

**What goes wrong:**
The existing prototype makes a direct client-side fetch to the Anthropic API, which means the API key would be in the browser bundle. Anyone who opens DevTools during or after the demo can read the key. This is a security failure and, if a judge notices (unlikely but possible), a credibility hit.

**Why it happens:**
Single-file React prototype with no build tooling — the path of least resistance is to hardcode the key or put it in a `.env` that gets bundled.

**How to avoid:**
All Anthropic API calls must go through a server-side proxy (a minimal backend: Express, Cloudflare Worker, Vercel serverless function). The client calls `/api/enrich`, the server holds the key as an environment variable, the key never reaches the browser. This also enables rate limiting and the fallback caching layer.

**Warning signs:**
- Any `ANTHROPIC_API_KEY` or `REACT_APP_` key visible in browser network tab
- Direct `fetch('https://api.anthropic.com/...')` call in any `.jsx` or `.js` client file
- `.env` committed to the repo

**Phase to address:** Product build phase — first thing before any API integration work.

---

### P-TECH-04: Made-Up City / Salary / Cost Data That Judges Can Fact-Check

**What goes wrong:**
The app shows salary ranges, cost-of-living numbers, and housing costs for specific cities. If these are hardcoded estimates that don't match BLS data, Numbeo, or other known sources, a judge who lives in that city (or who Googles it during Q&A) will find the discrepancy. Instant credibility collapse.

**Why it happens:**
Hardcoding "reasonable-sounding" numbers is faster than integrating a real data source. The existing prototype does this for 12 US cities. It feels fine in development.

**How to avoid:**
Source all city data from citable, authoritative sources: BLS Occupational Employment Statistics for salary, Numbeo or EPI Family Budget Calculator for cost of living, Zillow/Realtor.com median rent for housing. Document the source for every data point. For the pitch, you must be able to say "our salary data comes from BLS OES 2024" without hesitation.

**Warning signs:**
- Any number in the city data object that can't be traced to a URL
- Salary figures that don't match BLS for the stated occupation
- "Median rent" figures more than 20% off from Zillow current data
- No data source documentation in the codebase

**Phase to address:** Data/content phase — before any city data is treated as final. Revisit before pitch-prep phase.

---

### P-TECH-05: International Data Is Thin, Wrong, or Legally Sketchy

**What goes wrong:**
Adding international cities is a key differentiator. But international cost-of-living, salary, and especially immigration data is much harder to source accurately. If the app shows a salary range for Berlin or Lisbon that's in USD without conversion context, or shows an immigration pathway that's out of date, or if a judge asks "what's the actual process for a US citizen to move to Portugal" and the answer is wrong — the credibility of the premium visa concierge tier collapses.

**Why it happens:**
International data feels like "just more of the same" but it's fundamentally different. Numbeo covers many cities but salary data internationally is sparse. Immigration rules change frequently (Portugal's D7 visa requirements changed in 2024; Germany's Opportunity Card launched 2024). Using training-data-era knowledge without verification is how you get this wrong.

**How to avoid:**
For demo purposes, limit international cities to 3-5 where you can source accurate data (e.g., Canada, Germany, Portugal, Australia, UAE). For each: use Numbeo for CoL, local government sources for visa pathways, and add "data as of [date]" disclaimers. Gabriel's personal F-1 → OPT expertise is genuine but should be scoped to US-bound immigration, not claimed as universal expertise.

**Warning signs:**
- More than 5 international cities in v1 with no cited data sources
- Visa pathway steps that can't be traced to the destination country's official immigration site
- No "data as of" timestamp on international content
- App shows salaries in USD for cities where USD salaries are misleading

**Phase to address:** Data/content phase + pitch-prep phase (verify all international claims before final rehearsal).

---

### P-TECH-06: Immigration / Visa Claims That Are Legally Inaccurate or Create Liability

**What goes wrong:**
The premium tier's immigration concierge is the biggest differentiator — and the highest-risk content area. If the app states specific visa requirements, processing times, income thresholds, or eligibility rules that are wrong, a judge with international background will catch it. More importantly, framing it as "get your visa roadmap" implies legal advice, which is a liability and a credibility problem if the content is wrong.

**Why it happens:**
Immigration rules are jurisdiction-specific, version-specific, and change without notice. Gabriel's personal experience with F-1/OPT is real but limited to one pathway. Overgeneralizing is easy.

**How to avoid:**
Scope immigration content tightly: present it as "general information" with an explicit "this is not legal advice" disclaimer. Source every visa type from the official government website (USCIS, Germany BAMF, Immigration NZ, etc.). Only include pathways where you have a specific, citable source. In the pitch, frame it as "we surface the pathway information and connect users to the right resources" — not "we tell you exactly how to get your visa."

**Warning signs:**
- No disclaimer on immigration content
- Visa requirements sourced from blog posts, not official government sites
- Income thresholds or processing times stated as facts without a source date
- Language like "guaranteed" or "you will qualify"

**Phase to address:** Pitch-prep phase — legal framing, and data/content phase — source verification.

---

### P-TECH-07: Repo Divergence Creates a Build-Phase Blocker

**What goes wrong:**
Local `main` has only `README.md`. `origin/main` has `potential_v2.jsx`. They have diverged. If this isn't resolved at the start of the build phase, every subsequent commit will be confused about what the authoritative codebase is, and a forced push or bad merge could destroy the existing prototype.

**Why it happens:**
Two separate commits were made on two sides of the remote/local split without reconciling.

**How to avoid:**
First action in the build phase: fetch `origin/main`, review the divergence, and create a clean `main` that includes both `README.md` and `potential_v2.jsx`. Do not force-push. Do not rebase blindly.

**Warning signs:**
- `git log --oneline --all` shows two separate histories with no common ancestor
- Any `git push` results in "rejected, non-fast-forward"

**Phase to address:** Build phase — first task, before any other code work.

---

### P-TECH-08: Financial Model Doesn't Survive Q&A Scrutiny

**What goes wrong:**
The financials shown in the pitch (startup costs, revenue projections, path to profitability) get challenged in Q&A. A judge asks: "How did you arrive at 10,000 users in year 1?" or "What are your customer acquisition costs?" If the numbers were generated as "reasonable-sounding" rather than derived from comparable benchmarks, the answer falls apart.

**Why it happens:**
Financial projections for early-stage products are genuinely speculative. The temptation is to back into "impressive" numbers rather than build up from defensible assumptions.

**How to avoid:**
Build the financial model bottom-up from stated assumptions, not top-down from a target revenue. Every number needs a source or a stated assumption: "CAC of $X based on SaaS benchmarks from [source]"; "conversion rate of Y% based on freemium industry averages from [source]". Prepare 3 specific Q&A answers: why year 1 user count is realistic, what the biggest cost driver is, and when you break even.

**Warning signs:**
- Revenue projections that grow at >3x per year without a stated acquisition mechanism
- No stated CAC, LTV, or conversion rate
- "We project $X million in year 3" with no connecting math
- Startup cost list that omits server/API costs, legal/compliance, or marketing spend

**Phase to address:** Pitch-prep phase — financial model build.

---

## Part 2: Competition / Pitch Pitfalls

These pitfalls cost rubric points directly. The rubric is 120 points total: 6 content dimensions (each 0-10) + Persuasiveness (0-10) + Sources (0-10) + Organization/Language (0-10) + Delivery/Body Language (0-10) + Q&A (0-10) + Protocol Adherence (0 or 10, all-or-nothing).

---

### P-PITCH-01: Unsourced Claims Drop the "Substantiates Sources" Score to Zero

**What goes wrong:**
The rubric has a dedicated line item: "Substantiates and cites sources used while conducting research" — scored 0-10, with "Sources are not cited" receiving 0 points. Any market size claim, competitor comparison, financial benchmark, or data point stated without a cited source is a free point giveaway to competitors.

**Why it happens:**
Presenters treat sources as a formality and add them as a slide appendix nobody looks at. The rubric rewards sources being woven into the presentation itself ("according to the U.S. Census Bureau..."), not buried in a notes section.

**How to avoid:**
Every quantitative claim in the pitch must have an audible or visible attribution during delivery. Build a source slide as a backup. Prepare a full bibliography with URLs. In Q&A, be able to state the source for any number you cited.

**Warning signs:**
- Market size stated without a source (e.g., "the relocation market is $X billion")
- Competitor data stated without attribution
- Financial benchmarks stated as facts without "according to [source]"
- Sources deck prepared but never mentioned during the pitch itself

**Phase to address:** Pitch-prep phase — every claim must be sourced before the deck is finalized.

---

### P-PITCH-02: Protocol Violation Drops the Full 10-Point Protocol Score to Zero

**What goes wrong:**
The "Adherence to Competitive Events Guidelines" row is binary: all criteria must be met to earn the 10 points; one violation drops it to 0. The six criteria are: (1) max 2 allowable devices, one facing judges; (2) presentation aligned with assigned topic; (3) no interaction with judges during setup; (4) no materials left behind; (5) links/QR codes not clicked or scanned by judges; (6) no external speakers; (7) no food or live animals.

The highest-risk violation for this project: **a QR code on the demo screen that a judge reflexively tries to scan**, or **the team trying to hand judges a physical one-pager** and forgetting they can't leave it behind.

**Why it happens:**
QR codes are natural "try the app" CTAs. Physical leave-behinds feel like a professional touch. Neither is allowed.

**How to avoid:**
Never include a scannable QR code anywhere on the device screen during the pitch. Never hand judges anything they'll need to return. If showing the URL, display it as plain text only. Rehearse the setup so nobody touches the judge table. Run the protocol checklist as the last pre-competition step.

**Warning signs:**
- Any slide contains a QR code intended for judges
- Team plans to print one-pagers for judges
- Demo includes a "scan to try" CTA

**Phase to address:** Pitch-prep phase — protocol review milestone before first rehearsal.

---

### P-PITCH-03: Weak / Unsourced Market Sizing Tanks "Problem Identification & Market Opportunity"

**What goes wrong:**
The rubric's top content dimension — "Problem Identification & Market Opportunity" — requires demonstrating "strong understanding of target market and convincingly validates the business opportunity" to earn 9-10 points. Vague market sizing ("millions of people move each year") or unsourced TAM/SAM numbers score 1-6. This dimension is 8.3% of the total score.

**Why it happens:**
Market sizing is done quickly using a Google search rather than triangulating from Census data, Bureau of Labor Statistics, or migration surveys. The number feels big enough so it's not scrutinized.

**How to avoid:**
Build a bottom-up market size: start from Census Bureau annual interstate mover count (~8M households), layer in international migration interest (State Dept passport data, international student enrollment), define the addressable segment (young adults aged 22-35 considering a move in the next 2 years), source each layer. This is more defensible than a top-down "relocation industry is $X billion."

**Warning signs:**
- TAM stated as a single unsourced number
- No distinction between TAM/SAM/SOM
- Market size not tied to the specific customer segment the product targets
- No demographic data on who actually relocates and why

**Phase to address:** Pitch-prep phase — market sizing build.

---

### P-PITCH-04: Hand-Wavy Business Model Loses "Business Model" Points

**What goes wrong:**
The rubric requires "specific and realistic strategies for pricing, sales, and distribution that align with the business concept" for 9-10 points. "We'll charge $X/month" with no conversion funnel, no distribution channel detail, and no unit economics is a 7-8 at best.

**Why it happens:**
The product is built; the pricing feels obvious; the business model section of the deck gets the least time. Presenters assume the product sells itself and skip the distribution logic.

**How to avoid:**
Build out the full funnel in the pitch: free tier drives traffic (channel: social/organic/SEO) → quiz completion creates engagement → freemium gate at results drives Plus conversion → Plus users see the premium immigration tier → conversion rates and price points stated explicitly with benchmark sourcing. Distribution strategy must name specific channels (Reddit communities for expats, LinkedIn for young professionals, college career centers as B2B2C). One-time report pricing + subscription MRR must both be stated with the "why" behind each.

**Warning signs:**
- Pricing mentioned but no stated conversion rate assumption
- "We'll grow through social media" with no specific platform strategy
- No B2B or partnership channel discussed
- Revenue model relies entirely on paid subscriptions with no free-to-paid funnel logic

**Phase to address:** Pitch-prep phase — business model narrative.

---

### P-PITCH-05: Generic Marketing Strategy Scores 1-6

**What goes wrong:**
The rubric's "Marketing & Growth Strategy" dimension rewards presentations that are "well-researched, creative, and targeted" using "appropriate platforms and partnerships, showing strong understanding of customer engagement and scalability." Generic strategies ("use Instagram, TikTok, and LinkedIn") score 1-6.

**Why it happens:**
Marketing strategy is treated as a list of channels rather than a sequenced go-to-market plan tied to the specific target customer.

**How to avoid:**
Anchor the strategy to the exact customer: young adults aged 22-30 considering their first post-college city or international move. The channels that index highest for this segment: Reddit (r/financialindependence, r/digitalnomad, r/cscareerquestions), TikTok (personal finance and "moving abroad" content), LinkedIn (career-focused angle), college career center partnerships (direct pipeline of graduating seniors). Show a content flywheel: quiz results are shareable → organic loops. Name one specific partnership hypothesis and why it would work.

**Warning signs:**
- Marketing section lists channels without explaining why those channels for this audience
- No user acquisition cost estimate per channel
- No viral/organic loop described (the quiz-to-share mechanism is the obvious one)
- No partnership strategy mentioned

**Phase to address:** Pitch-prep phase — marketing narrative.

---

### P-PITCH-06: No Clear Differentiation Loses "Business Concept & Innovation" Points

**What goes wrong:**
The rubric requires "strong innovation and clear value differentiation from existing solutions" for 9-10 points in Business Concept & Innovation. If the answer to "why not just use Niche.com, BestPlaces.net, or Nomad List?" is weak or not addressed, this dimension drops.

**Why it happens:**
Founders are so close to their product they assume differentiation is obvious. Judges have seen many apps that claim to be "like X but better."

**How to avoid:**
Explicitly name 2-3 competitors and state what they don't do. The differentiation for Potential is specific: (1) personalized matching to a user-defined profile vs. generic rankings; (2) financial reality modeling (what your specific salary and budget looks like in each city) vs. generic cost-of-living indexes; (3) immigration pathway as a product feature — no competitor does this. The founder's lived F-1/OPT experience is the authenticity layer that makes the immigration feature credible.

**Warning signs:**
- No competitor mentioned by name in the pitch
- Differentiation is stated as "we're more personalized" without showing how
- Immigration/visa angle not presented as a primary differentiator
- Competitor comparison slide missing or vague

**Phase to address:** Pitch-prep phase — competitive positioning.

---

### P-PITCH-07: Going Over 10 Minutes Wastes All Remaining Presentation Time

**What goes wrong:**
The timing is hard: 10-minute presentation, 5-minute Q&A, time allocations exclusive. A one-minute warning is given but time may not be shifted between segments. Running over means the last content section gets cut mid-sentence. The Delivery/Organization score suffers. More critically, if you're still mid-pitch when time is called, the judges didn't hear the close.

**Why it happens:**
The demo is the most variable element. Live demos take longer than rehearsed. When something interesting happens on screen, it's tempting to narrate longer. The financial section always expands in nervous energy.

**How to avoid:**
Time-box the demo to 90 seconds maximum. Run the full pitch rehearsal 3+ times with a stopwatch. Target 8:30-9:00 to leave a genuine buffer. Know which section to cut first if running long (the marketing section is the safest to compress). Never rehearse on fast WiFi if the demo will run on a hotspot.

**Warning signs:**
- Rehearsal runs 9:45+ consistently
- No defined cut point if running long
- Demo has no time limit and expands with narration
- Financial section has 4+ slides

**Phase to address:** Pitch-prep phase — rehearsal milestone.

---

### P-PITCH-08: Weak Q&A Answers Score 1-6 on the Q&A Rubric Row

**What goes wrong:**
The rubric has a dedicated Q&A score: "Demonstrates the ability to effectively answer questions" — 0-10. Incomplete answers, off-topic responses, or "I don't know" answers score 1-6. This is 5 minutes of direct examination where judges probe the weakest parts of the pitch.

**Why it happens:**
Q&A prep is always the last thing added to rehearsal and the first thing cut when time is short. Teams prepare the pitch but not the questions.

**How to avoid:**
Build a Q&A bank of the 15 hardest questions a judge could ask, with written answers. Required coverage: financial model assumptions, how you'd get your first 1,000 users, why this over competitors, how accurate the data is, how the immigration content avoids being legal advice, what happens if the API fails, what's the timeline to profitability. Rehearse answers out loud — not just think through them.

The hardest expected questions for this specific pitch:
- "How do you ensure your city data is accurate?"
- "Isn't this just a fancier Niche.com or Numbeo?"
- "How do you handle visa regulations that change constantly?"
- "What's your CAC and LTV?"
- "What's your moat once a competitor copies the quiz format?"

**Warning signs:**
- No written Q&A bank exists
- Q&A never rehearsed separately from the main presentation
- Financial model numbers can't be explained from first principles
- No prepared answer for the data accuracy question

**Phase to address:** Pitch-prep phase — Q&A preparation milestone, at least 1 week before competition.

---

### P-PITCH-09: Value Proposition Not Clearly Differentiated from Existing Tools

**What goes wrong:**
The "Value Proposition & Customer Benefit" dimension requires "compelling, clearly articulating unique customer benefits and strong reasons why customers would choose this over competitors" for 9-10 points. A generic "it helps you find where to live" statement scores 1-6.

**Why it happens:**
Value proposition is the hardest thing to articulate tightly. Teams describe features, not transformation.

**How to avoid:**
Frame the value prop as transformation, not features: "You go from 'I don't know where I should live' to a ranked list of cities with a financial model showing exactly what your life looks like — plus the step-by-step path to actually get there." The premium hook: "For the first time, 'moving abroad' goes from a daydream to an executable plan." Lead with the outcome, not the feature list.

**Warning signs:**
- Value prop slide describes what the app does rather than what the user gains
- No before/after framing
- No explicit tie to the customer's emotional problem (uncertainty, fear of making a wrong choice)

**Phase to address:** Pitch-prep phase — deck narrative review.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded city data | Fast to build, no API needed | Wrong numbers destroy credibility; hard to update | Never for competition — must be sourceable |
| Client-side API key | No backend needed | Key exposed in browser; protocol risk | Never |
| No JSON schema enforcement on LLM output | Simpler prompt | Demo crashes on malformed response | Never for demo path |
| Skip golden-path cache | Simpler codebase | Live failure on stage has no recovery | Never — must have fallback |
| "Reasonable-sounding" financial projections | Fast to produce | Collapses under Q&A | Never — build from assumptions |
| Single-device rehearsal on WiFi | Convenient | Hotspot + 2-device setup behaves differently | Fine for early drafts; banned from week 2 of rehearsal |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Anthropic API | Direct client-side fetch exposes key | Server-side proxy only; key in env var server-side |
| Anthropic API | No timeout set; UI hangs indefinitely | Set 5s timeout; fall back to cache on timeout |
| Anthropic API | Plain-text "return JSON" prompt | Use tool-use / structured output to enforce schema |
| City data sources | Scraping Numbeo without respecting ToS | Use Numbeo's API or cite publicly available data; document the source |
| BLS OES data | Using stale year's numbers | Pin the OES year in the data and cite it explicitly |

---

## "Looks Done But Isn't" Checklist

- [ ] **Demo fallback:** Golden-path cache exists and has been tested as the actual fallback — not just coded but never triggered
- [ ] **API proxy:** All Anthropic calls go through the server proxy — verified by opening browser DevTools network tab and confirming no direct `api.anthropic.com` calls
- [ ] **City data sourcing:** Every number in every city's financial breakdown has a URL source in a comment or doc
- [ ] **Immigration content:** Every visa pathway step traces to an official government URL, and the "data as of" date is visible
- [ ] **Sources in pitch:** Every quantitative claim in the deck has an audible attribution during delivery
- [ ] **Protocol compliance:** No QR codes on any device screen; no physical materials planned to be left with judges
- [ ] **Time check:** Full run-through with hotspot internet hits 8:30-9:00 on stopwatch
- [ ] **Q&A bank:** 15-question written bank exists and has been rehearsed aloud
- [ ] **Financial model:** Every year-1 projection can be re-derived from stated assumptions in under 60 seconds
- [ ] **Repo state:** Local `main` and `origin/main` reconciled before any build work

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| P-TECH-01: No live demo fallback | Product build — demo hardening | Trigger the fallback deliberately in rehearsal; demo runs clean |
| P-TECH-02: Malformed LLM JSON | Product build — backend/proxy sprint | Unit test with adversarial LLM responses; no crash |
| P-TECH-03: Exposed API key | Product build — first task | DevTools network tab shows no direct api.anthropic.com calls |
| P-TECH-04: Made-up city data | Data/content phase | Every number has a source URL in the codebase |
| P-TECH-05: Bad international data | Data/content phase | International cities limited to 3-5 with cited sources |
| P-TECH-06: Wrong immigration claims | Data/content + pitch-prep | Every visa step traced to official gov site; disclaimer visible |
| P-TECH-07: Repo divergence | Build phase — first task | `git log --oneline --all` shows single clean history |
| P-TECH-08: Financial model caves in Q&A | Pitch-prep — financial model build | Can re-derive year-1 projection from assumptions in 60s |
| P-PITCH-01: Unsourced claims | Pitch-prep — deck finalization | Every claim has audible attribution; full bibliography ready |
| P-PITCH-02: Protocol violation | Pitch-prep — protocol review | Protocol checklist run day before competition |
| P-PITCH-03: Weak market sizing | Pitch-prep — market sizing build | Market size built bottom-up from Census/BLS data |
| P-PITCH-04: Hand-wavy business model | Pitch-prep — business model narrative | Full funnel with conversion rates stated and benchmarked |
| P-PITCH-05: Generic marketing | Pitch-prep — marketing narrative | Specific channels named with audience-fit rationale |
| P-PITCH-06: No differentiation | Pitch-prep — competitive positioning | 2-3 competitors named; differentiation stated explicitly |
| P-PITCH-07: Over time limit | Pitch-prep — rehearsal milestone | 3 timed runs all land 8:30-9:00 |
| P-PITCH-08: Weak Q&A | Pitch-prep — Q&A preparation milestone | 15-question bank written; all rehearsed aloud |
| P-PITCH-09: Weak value proposition | Pitch-prep — deck narrative review | Value prop stated as transformation, not features |

---

## Sources

- FBLA 2025-2026 Competitive Events Guidelines: Entrepreneurship Pitch Competition (official PDF, updated September 8, 2025) — rubric, timing, protocol rules, penalty points read directly
- PROJECT.md constraints and demo plan (repo `.planning/PROJECT.md`)
- Anthropic API documentation — structured output / tool-use schema enforcement (direct knowledge, HIGH confidence)
- Known patterns from LLM-in-production systems: JSON parsing failure modes, fallback architecture (HIGH confidence, widely documented)
- BLS Occupational Employment Statistics: bls.gov/oes (authoritative salary source)
- Numbeo cost-of-living data: numbeo.com (authoritative CoL benchmark)

---
*Pitfalls research for: Potential — relocation-discovery web app + FBLA Entrepreneurship Pitch*
*Researched: 2026-05-30*
