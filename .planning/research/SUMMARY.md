# Project Research Summary

**Project:** Potential — FBLA Entrepreneurship Pitch
**Domain:** Consumer relocation-discovery web app + FBLA competition deliverable
**Researched:** 2026-05-30
**Confidence:** HIGH (stack, architecture, pitfall patterns) / MEDIUM (visa figures, Teleport API status)

---

## Executive Summary

Potential is a freemium, quiz-driven web product that matches users to cities (US + international) and delivers a personalized financial model, relocation roadmap, and immigration pathway at paid tiers. The closest competitor (WhereNext, $15–$79 static PDFs) validates the price range but leaves the live-AI layer and visa concierge entirely open. Teleport — the most prominent prior DTC city-matcher — exited the consumer market entirely and was absorbed into enterprise B2B (Topia), confirming there is no well-capitalized consumer incumbent to displace. The monetizable gap is real: discovery is free, the roadmap and concierge are what people pay for.

The recommended build approach centers on an **offline spine first**: Steps 0–3 of the build order produce a fully demo-able app (quiz → scored results → financial breakdown → tier gate UI) that runs on battery with zero network. The live-AI layer attaches at the leaf (city detail panel) rather than blocking the spine. This matters because internet is "Not Provided" at the venue — the spine plus bundled golden-path cache is competition insurance against hotspot failure. The Hono server proxy is the only correct fix for the broken client-side Anthropic fetch in the existing prototype; everything else in the stack (Vite 8, React 19, Tailwind 4, shadcn/ui) falls into place around it.

This project has two interwoven workstreams: **building the product** and **winning the pitch**. The FBLA rubric allocates 4 of 6 content dimensions to business-plan substance — market opportunity, business concept, value proposition, feasibility/financials — and only one to the product demo. The pitch package (sourced market sizing, full funnel with conversion rates, Q&A bank, protocol compliance) must be treated as a first-class deliverable, not an afterthought. The biggest single risk is not a technical failure — it is unsourced claims, weak market sizing, or a protocol violation (QR code, physical leave-behind) that each cost a full scoring dimension.

---

## Key Findings

### Recommended Stack

The demo runs locally as `npm run dev` on the presenter's laptop — there is no deployed URL load path at the venue. This collapses the stack decision to what runs best locally, ports the existing 809-line JSX component with minimal friction, and looks production-grade to judges. The answer is Vite 8 + Hono, not Next.js.

**Core technologies:**

- **Vite 8.0.14**: Build tooling + dev server — fastest cold start, HMR under 50ms, existing JSX drops in almost as-is. Next.js requires a deeper rewrite for no demo benefit.
- **React 19.2.6**: UI framework — already in prototype; stable with Vite 8 + @vitejs/plugin-react v6 (Oxc, no Babel).
- **Tailwind CSS 4.1**: Utility styling — CSS-first config, 5x faster builds than v3, existing dark-theme palette ports directly as @theme variables. Required for shadcn/ui v4.
- **shadcn/ui CLI 4.8.3**: Copy-paste component library — zero bundle bloat, dark mode first-class, production-grade visual credibility with judges. March 2026 CLI adds first-class Vite init.
- **Hono 4.12.16**: Local proxy server — holds ANTHROPIC_API_KEY server-side and forwards to Anthropic. 14kB, zero deps, 4.1x faster than Express. This is the fix for the broken client-side fetch.
- **@anthropic-ai/sdk 0.100.1**: Server-side only, via the Hono proxy. Web search tool `web_search_20250305` recommended (stable, no code-execution dependency, ~$0.03/demo interaction at `max_uses: 3`).
- **@tanstack/react-query 5.x**: Manages the proxy fetch lifecycle AND implements the offline cache (staleTime 24h; persist to localStorage for page-refresh resilience).
- **concurrently**: Runs Vite + Hono as a single `npm run dev` — one command, one terminal, demo-ready.

**Open decision — TypeScript vs JavaScript:** STACK.md leans toward TypeScript for proxy and engine modules (shadcn templates are TS-first, reduces runtime surprises in a live demo). Must be decided at Step 0. See Open Questions.

**Data sources:** Curated static JSON for city financials (BLS OES for US salaries, HUD FMR for US rent, World Bank/Expatistan for international context, Numbeo public pages as cited sources). Anthropic web_search handles real-time listings. Teleport API status is uncertain (ECONNREFUSED on test 2026-05-30) — LOW confidence; use hardcoded quality-of-life scores with Numbeo public rankings as fallback citation. Numbeo API is $260/month minimum — do not integrate.

### Expected Features

Full feature details in `.planning/research/FEATURES.md`.

**Must have (table stakes — demo-grade):**
- Full 5-step quiz including citizenship/nationality, immigration status, international openness slider, and dealbreaker hard filters
- City match results: free teaser (#1 match + one headline financial figure), full ranked list at Basic+
- Financial projection per city using country-aware tax model — not the US-only model applied to international salaries
- International cities present in results (minimum 4 for demo: Lisbon, Berlin, Toronto, London)
- Mobile-responsive layout, city detail page, tier gate UI with blur/lock overlays and DemoTierSwitcher

**Should have (competitive differentiators — what the demo showcases):**
- Live AI data layer (real jobs, real housing, day-in-the-life) via backend proxy — the "wow moment" and primary Plus upsell driver
- Full relocation roadmap (6 sections: timeline, financial prep, job search, housing, logistics checklist, visa summary) — dynamic and profile-specific, not a static PDF; WhereNext offers static PDF at $79, Potential's is dynamic
- Immigration/visa concierge at Premium tier — eligibility screener, pathway comparison, document checklist, cost/timeline, attorney referral; scoped as general information + disclaimer, not legal advice
- DemoTierSwitcher: UI control to toggle free/basic/plus/premium so judges see all tiers in 60 seconds

**Defer to v2+:**
- Real Stripe integration, account persistence, community/forums, real-time visa policy tracking, native mobile, employer-side B2B product, attorney referral network (active curation)

**Validated pricing ladder (all pricing analogs confirmed from live products):**
- Tier 0: Free — quiz + #1 match teaser + one headline number
- Tier 1: Basic ~$9 one-time — full ranked list + financial breakdown + international cities (Truity $9–$19 analog)
- Tier 2: Plus ~$29 one-time — live AI layer + full roadmap + visa summary (primary upsell target; 16Personalities Career Suite $29 analog)
- Tier 3: Premium ~$99 one-time OR $9.99/month — full immigration concierge (subscription preferred for MRR narrative; WhereNext tops at $79 with no concierge)

**Teleport exit narrative for pitch:** Teleport was acquired by MOVE Guides and folded into Topia's enterprise B2B platform (Topia press release). Use this as proof that the consumer market was underserved, not saturated.

### Architecture Approach

The architecture follows a **pipeline with an offline spine**: every stage from quiz to scored results to financial breakdown is a pure function of static data — zero network required. The live-AI layer attaches at the leaf node (city detail panel) and degrades gracefully to the bundled golden-path cache on network loss. Steps 0–3 of the build order deliver a fully demo-able product before the API proxy is even written.

**Major components:**

1. **Quiz / Profile Capture** — captures Profile{} including citizenship, immigration status, and international openness; these fields are the routing key for the entire premium roadmap system
2. **Scoring Engine** (`engine/scoring.ts`) — pure function: `scoreCity(profile, city) → ScoredCity`. No React, no network. Unit-testable in isolation.
3. **Financial Calculator** (`engine/financials.ts`) — dispatches to `engine/country-models.ts` for non-US cities. V1 needs at minimum US + Portugal/EU country models. Without this dispatch, international financial breakdowns are wrong — a credibility failure on screen.
4. **Results UI + Tier Gate** — renders ranked list; TierGate wrapper blurs/locks sections based on TierGrant enum; DemoTierSwitcher lets presenter toggle during pitch
5. **LLM Proxy** (`proxy/`) — holds ANTHROPIC_API_KEY server-side; enforces tier entitlement; checks runtime cache (TTL 24h) before calling Anthropic; runs as separate Node process via Hono
6. **Two-Tier Cache** — Tier 1: bundled static JSON in `data/golden-path/` (survives total network loss, zero dependencies — this is the demo fallback); Tier 2: runtime proxy cache (reduces API cost and latency, but requires hotspot — NOT the fallback). These must never be conflated.
7. **Roadmap Generator** — proxy-side; uses pre-authored `ROADMAP_TEMPLATES[citizenship][destination_country]`; calls LLM only for prose enrichment, not structural content. Template-first is non-negotiable — raw LLM-generated visa steps will be confidently wrong under judge Q&A.

**Key data contracts:** Profile (includes citizenship + immigrationStatus — must be captured in quiz before any roadmap generation), ScoredCity[], CityFinancials (country-model-aware), LiveCityData (cacheable), RelocationRoadmap (keyed by citizenship + destination), TierGrant.

### Critical Pitfalls

Full pitfall catalog (17 items, mapped to phases) in `.planning/research/PITFALLS.md`.

**Top 5 — if any of these land, the pitch fails:**

1. **P-TECH-07: Diverged repo branches** — Local `main` has only README; `origin/main` has `potential_v2.jsx`. Blocks all build work. First action: fetch, reconcile, establish single clean history. Do not force-push or rebase blindly. Verify with `git log --oneline --all`.

2. **P-TECH-01: Live AI fails mid-demo with no fallback** — The demo centerpiece becomes a liability if the hotspot drops. Fix: bundled golden-path JSON (Tier 1 cache) + 3-second timeout on proxy fetch + try/catch that renders golden-path instantly on failure. Must be built and tested as actual fallback before any dry-run rehearsal.

3. **P-PITCH-02: Protocol violation drops the full 10-point protocol score to zero** — Binary, all-or-nothing row. Highest-risk violations: QR code on screen that a judge tries to scan; physical leave-behind that can't remain with judges. Never put a scannable QR code on any device screen. No printed materials as leave-behinds.

4. **P-PITCH-01: Unsourced claims score 0 on the Sources rubric row** — Every quantitative claim needs an audible, in-presentation attribution ("according to the US Census Bureau..."), not just a notes appendix. Every city data point must trace to a URL. Every visa step must trace to an official government site.

5. **P-TECH-04/P-TECH-05: Made-up or unsourced city data / international data collapses under Q&A** — Hardcoded "reasonable-sounding" numbers that don't match BLS/HUD/World Bank data are a live credibility failure. Limit to 3–5 international cities with sourced data, with "data as of [date]" timestamps on all international content.

---

## Implications for Roadmap

This is a two-workstream project. The roadmap must interleave product build phases with pitch preparation phases. The rubric allocates the majority of points to business-plan substance, not product polish. When product polish and pitch substance compete for time, pitch substance wins.

### Cross-Cutting Consensus (appears in 2+ research docs independently)

| Decision | Sources | Status |
|----------|---------|--------|
| Step 0 = reconcile diverged branches | PROJECT.md, ARCH Step 0, P-TECH-07 | Absolute blocker — first action |
| Vite + Hono proxy / kill client-side Anthropic key | STACK, ARCH, P-TECH-03 | First build task after reconcile |
| Two-tier cache: bundled JSON (not proxy cache) as demo fallback | STACK, ARCH Pattern 2 + Anti-Pattern 2, P-TECH-01 | Must exist before any rehearsal |
| citizenship + immigration-status captured in quiz | ARCH Profile contract, FEATURES MVP spec | Drives entire premium roadmap routing |
| Template-first visa roadmap (LLM enriches prose only) | ARCH Pattern 3 + Anti-Pattern 1, FEATURES concierge spec | Premium tier credibility; do not let LLM author structural visa content |
| Country-aware financial models for intl cities | ARCH Anti-Pattern 4, P-TECH-05, FEATURES | Without this, international financial breakdowns are wrong on screen |

---

### Phase 1: Foundation and Offline Spine

**Rationale:** Unblocks all subsequent work. Repo reconciliation blocks everything. Steps 0–3 from ARCHITECTURE.md deliver the minimum viable demo as a fully offline product.

**Delivers:** Working repo with single clean history; Vite + Hono scaffold; existing prototype ported into component architecture; quiz → scoring → financial breakdown → tier gate UI running on battery with zero network; 4 international cities with country-correct financials; DemoTierSwitcher cycling all four tiers.

**Key tasks:**
- Reconcile diverged branches (P-TECH-07)
- Decide TypeScript vs JavaScript (open question — resolve here)
- Port `potential_v2.jsx` into Quiz, Scoring Engine, Financial Calculator, Results UI, TierGate components
- Add `engine/country-models.ts` with US + Portugal/EU (at minimum)
- Add 4 international cities to `data/cities.ts` with sourced data (Lisbon, Berlin, Toronto, London)
- Capture citizenship + immigrationStatus fields in quiz Profile
- Wire DemoTierSwitcher for all four tiers

**Avoids:** P-TECH-07 (repo divergence), P-TECH-04 (unsourced city data), P-TECH-05 (wrong international data), ARCH Anti-Pattern 3 (scoring logic inside React), ARCH Anti-Pattern 4 (US tax on foreign salaries)

**End state:** Fully offline demo — quiz → scored results → international cities with credible financials → visible tier gating. No internet required.

**Research flag:** Standard patterns — skip research phase. Stack and architecture are fully specified.

---

### Phase 2: Live AI Layer and Demo Hardening

**Rationale:** The proxy + golden-path cache must exist and be tested before any rehearsal. These two are inseparable — building the proxy without the golden-path cache means the first rehearsal has no fallback.

**Delivers:** Hono proxy with API key management, tier entitlement enforcement, and runtime cache; live jobs/housing/day-in-the-life output for demo cities; bundled golden-path JSON for 3 demo cities; 3-second timeout + fallback activation confirmed in rehearsal; API key never appears in browser DevTools.

**Key tasks:**
- Build Hono proxy endpoint `POST /api/live-data` using `web_search_20250305`
- Verify API key never appears in browser DevTools network tab (P-TECH-03)
- Use Anthropic tool-use / structured output to enforce JSON schema; wrap all `JSON.parse()` in try/catch with schema validation (P-TECH-02)
- Set 5-second timeout on every proxy fetch
- Script golden-path demo profile, run full flow against proxy, save `data/golden-path/demo-results.json`
- Test fallback deliberately: kill the hotspot, confirm golden-path renders instantly with no spinner

**Avoids:** P-TECH-01 (no fallback), P-TECH-02 (malformed LLM JSON), P-TECH-03 (exposed API key), ARCH Anti-Pattern 2 (proxy cache conflated with offline fallback)

**End state:** Demo runs with hotspot (live AI) or without (golden path). Presenter cannot be blocked by a network failure.

**Research flag:** Standard patterns — Hono proxy and TanStack Query cache are well-documented.

---

### Phase 3: Relocation Roadmap and Premium Visa Concierge

**Rationale:** This is the product's revenue story and the Premium tier's differentiator. Template-first authoring using Gabriel's real expertise is the moat. Citizenship field in Profile (Phase 1) must be in place before this routing works.

**Delivers:** Roadmap Generator with `ROADMAP_TEMPLATES[citizenship][destination_country]`; all 6 roadmap sections for the golden-path city; visa concierge for at least 2 pathways (Portugal D8, Canada Express Entry); Premium tier fully demonstrable on stage; PDF export.

**Key tasks:**
- Author `ROADMAP_TEMPLATES` for demo pathways from Gabriel's expertise and official government sources
- Build `POST /api/roadmap` proxy endpoint: template-first + LLM prose enrichment
- Build RoadmapPanel rendering all 6 sections
- Implement visa concierge UI: eligibility screener, pathway comparison cards, document checklists, cost/timeline, attorney referral CTA
- Add "data as of [date]" timestamps and "not legal advice" disclaimer on all immigration content
- Trace every visa step to official government URL (AIMA, BAMF, IRCC, USCIS) before it appears in the demo

**Avoids:** ARCH Anti-Pattern 1 (LLM as authoritative visa source), P-TECH-06 (wrong/legally sketchy immigration claims), P-PITCH-06 (no differentiation)

**End state:** Full premium tier demonstrable on stage. DemoTierSwitcher cycles all four tiers in 60 seconds, showing each unlock.

**Research flag:** Visa content requires a dedicated QA pass verifying all figures against official government sources. Not a research phase — a content verification step before any figures are committed to the demo.

---

### Phase 4: Pitch Package — Business Plan Substance

**Rationale:** 4 of 6 rubric content dimensions are business-plan. Market opportunity, business concept, value proposition, and feasibility/financials all require sourced research and narrative. This is a first-class deliverable that runs in parallel with Phases 2–3, not a slide deck built in the final week.

**Delivers:** Sourced market sizing (bottom-up from Census/BLS migration data); full funnel with stated conversion rates and channel rationale; unit economics (CAC, LTV) with benchmark sources; startup cost model + 3-year projections built bottom-up from stated assumptions; competitive positioning slide naming Nomad List, WhereNext, and Niche.com explicitly; Teleport acquisition narrative as market gap proof.

**Key tasks:**
- Market sizing: Census Bureau annual interstate mover count (~8M households) + international migration interest + 22–35 demographic segment; cite each layer
- Business model: free tier → quiz engagement → Plus conversion → Premium immigration upsell; state conversion rate assumptions with freemium benchmark sources (2–5% typical)
- Channels: Reddit (r/digitalnomad, r/cscareerquestions, r/financialindependence), TikTok (moving-abroad content), LinkedIn (career angle), college career center B2B2C partnerships; explain why each channel for this audience
- Financial model: startup costs (API costs, legal/compliance, marketing spend all included), CAC per channel, LTV by tier, break-even month; every assumption stated and re-derivable in 60 seconds
- Competitive positioning: name 2–3 competitors; state what each cannot do; Teleport exit as market validation

**Avoids:** P-PITCH-03 (weak market sizing), P-PITCH-04 (hand-wavy business model), P-PITCH-05 (generic marketing), P-PITCH-06 (no differentiation), P-TECH-08 (financial model caves in Q&A)

**End state:** Every quantitative claim in the pitch traces to a citable source. Financial projections re-derivable from first principles in under 60 seconds.

**Research flag:** Needs a research step for market sizing (Census, BLS migration data) and CAC benchmarks (SaaS freemium comps). This phase should trigger a research sub-task.

---

### Phase 5: Pitch Prep — Deck, Rehearsal, Protocol

**Rationale:** All substance from Phases 1–4 must be assembled into a 10-minute presentation with defensible Q&A and zero protocol violations. Final integration layer; must have a fixed calendar deadline working backward from competition date.

**Delivers:** Pitch deck with audible source attributions on every quantitative claim; 15-question Q&A bank written and rehearsed aloud; three timed full run-throughs landing 8:30–9:00 on a phone hotspot; protocol compliance checklist complete; value proposition stated as transformation, not features.

**Key tasks:**
- Deck narrative: problem → market → solution → differentiation → demo → business model → financials → marketing → ask
- Audible source attribution woven into delivery for every quantitative claim
- Q&A bank covering: data accuracy, CAC/LTV, legal advice avoidance, competitive moat, API failure resilience, year-1 user count derivation, Teleport question ("wasn't Teleport trying this?")
- Three full timed rehearsals on phone hotspot + battery; target 8:30–9:00
- Value prop test: transformation framing ("from 'I don't know where to live' to an executable plan") not feature list
- Protocol checklist: no QR codes on any device screen; no physical materials for judges; no contact with judges during setup

**Avoids:** P-PITCH-01 (unsourced claims), P-PITCH-02 (protocol violation), P-PITCH-07 (over time limit), P-PITCH-08 (weak Q&A), P-PITCH-09 (weak value proposition)

**End state:** Competition-ready. No protocol risk. Full run clocks 8:30–9:00 on hotspot.

**Research flag:** Standard execution — no research needed. Q&A rehearsal is a practice exercise.

---

### Phase Ordering Rationale

- Phase 1 must be first: the diverged repo blocks all code work; the offline spine must exist before the live AI layer can attach to it; citizenship field in Profile must exist before the roadmap generator can route
- Phase 2 must follow Phase 1: proxy depends on the spine components and the Profile contract being in place
- Phase 3 must follow Phase 2: Roadmap Generator is a proxy-side component; depends on Phase 2 proxy infrastructure
- Phase 4 runs in parallel with Phases 2–3 starting after Phase 1 architecture decisions are settled; does not wait for product completion
- Phase 5 must be last; must have a hard calendar deadline tied to state/NLC competition dates

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified live on npmjs.com 2026-05-30; Vite 8, React 19, Hono 4.12, shadcn 4.8 confirmed |
| Features | HIGH / MEDIUM | Competitor pricing confirmed from live product inspection; specific visa figures (income thresholds, processing times) are MEDIUM — must be verified against official government sources before they appear in the demo or pitch |
| Architecture | HIGH | Based on direct analysis of `potential_v2.jsx` plus established patterns for this SPA shape; two-tier cache design is sound |
| Pitfalls | HIGH | Rubric read directly from official FBLA PDF (September 2025); technical pitfalls from known LLM/API production patterns |

**Overall confidence:** HIGH on approach and priorities; MEDIUM on specific international data figures and visa content

### Gaps to Address

- **Which 3–5 international cities are the golden path?** STACK lists Berlin/Lisbon/Toronto/Singapore/Mexico City/Sydney/Dubai/London; FEATURES MVP spec says Lisbon/Berlin/Toronto/London; PITFALLS says Canada/Germany/Portugal/Australia/UAE. Not contradictory but need a single committed list before Phase 1 data work begins. **Recommendation: Lisbon, Berlin, Toronto, London as the 4-city demo core** (appear consistently across all three docs, English-accessible immigration pathways, strong expat job markets). Add Sydney as a 5th if data time allows.

- **TypeScript vs JavaScript:** STACK.md leans TS for proxy and engine modules but does not mandate. **Recommendation: TS for `engine/` and `proxy/`** (pure functions; type safety catches scoring bugs before the demo), **JS/JSX for React components** (less friction porting the existing 809-line prototype). Decide and commit at Step 0.

- **Teleport API viability:** ECONNREFUSED on test 2026-05-30. Verify manually in browser before building on it. If down, substitute hardcoded quality-of-life scores citing Numbeo public rankings. Do not make the quality-of-life feature a hard dependency on Teleport.

- **Specific visa figures against official government sources:** Portugal D7/D8 income thresholds, Germany Skilled Worker salary floor, Canada Express Entry point thresholds, and H-1B/O-1 criteria must all be verified against AIMA, BAMF, IRCC, and USCIS official sites before any figure appears in the demo or pitch. Secondary sources (citizenremote, getgoldenvisa) are research starting points, not citable primary sources for the pitch.

- **Financial model for the pitch:** Not yet built. Needs sourced CAC benchmarks, API cost estimates at various usage levels, and conversion rate assumptions from freemium industry data. This is Phase 4 work; Phase 5 is blocked until it is complete.

- **FBLA state deadlines and NLC dates:** PROJECT.md notes membership dues due March 1. Confirm actual preliminary and final competition dates before the roadmap locks — all phases back-calculate from those dates.

---

## Sources

### Primary (HIGH confidence)
- npmjs.com — Vite 8.0.14, React 19.2.6, Hono 4.12.16, shadcn CLI 4.8.3, @anthropic-ai/sdk 0.100.1 (verified live 2026-05-30)
- platform.claude.ai / Anthropic docs — web_search tool versions, pricing ($10/1K searches), structured output
- FBLA 2025-2026 Competitive Events Guidelines PDF (September 8, 2025) — rubric, timing, protocol rules read directly
- `potential_v2.jsx` (origin/main branch, 809 lines) — direct prototype analysis
- 16Personalities premium career suite ($29) — official product page
- WhereNext (getwherenext.com) — live product inspection May 2026
- Topia.com press release — Teleport/MOVE Guides acquisition confirmation
- bls.gov/bls/api_features.htm — BLS OES API, free with key
- huduser.gov/portal/dataset/fmr-api.html — HUD FMR free API

### Secondary (MEDIUM confidence)
- citizenremote.com, getgoldenvisa.com — visa pathway overviews for Portugal D7/D8, Germany, Canada (starting points; verify figures against official sources before pitch)
- firstpagesage.com, userpilot.com — freemium conversion rate benchmarks (2–5% typical, 30%+ outlier)
- internationalinsurance.com, caprelo.com — international relocation checklist phases
- api.worldbank.org, Expatistan public pages — international cost-of-living context (cite Numbeo public rankings as primary public reference in pitch)
- Nomad List / nomads.com — live product inspection May 2026

### Tertiary (LOW confidence — verify before using)
- api.teleport.org — quality-of-life scores, ~220 cities globally (ECONNREFUSED on test 2026-05-30; verify before building on it)
- Vercel Hobby plan (non-commercial) / Netlify Starter (commercial OK) — ToS details (verify before using in pitch story)

---

*Research completed: 2026-05-30*
*Ready for roadmap: yes*
