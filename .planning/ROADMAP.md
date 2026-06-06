# Roadmap: Potential — FBLA Entrepreneurship Pitch

## Overview

Two interwoven workstreams must both ship to place #1: (A) a live demoable product running quiz → matching → financials → live-AI → roadmap → visa concierge → tier gate, and (B) a complete pitch package covering every rubric dimension. The product phases build a vertical MVP slice-by-slice so a fully offline demo exists early; international scope, the live-AI layer, roadmap, and visa concierge layer on top. The pitch-package phases start after Phase 1 architecture decisions are locked and run in parallel with product Phases 5–8. Config granularity is `fine`, yielding 10 focused phases.

## Phases

**Phase Numbering:**

- Integer phases (1–10): Planned milestone work
- Decimal phases: Urgent insertions via `/gsd:phase insert`

- [x] **Phase 1: Scaffold & Port** - Verify reconciled repo, scaffold Vite + React, port prototype into component architecture (2026-05-30)
- [ ] **Phase 2: Quiz & Profile Capture** - Multi-step profile quiz capturing all fields including citizenship/immigration status
- [ ] **Phase 3: Matching & US Financial Spine** - Scoring engine, US financial model, ranked results — first fully offline demo
- [ ] **Phase 4: International Destinations & Country Models** - 4 intl cities with sourced data and country-correct financials
- [x] **Phase 5: Proxy, Live AI & Golden-Path Cache** - Server-side proxy, live AI data, bundled offline fallback tested as actual fallback (completed 2026-06-06)
- [ ] **Phase 6: Relocation Roadmap** - Template-first authored roadmap generator for all 6 sections, PDF export
- [ ] **Phase 7: Visa Concierge** - Premium eligibility screener, pathway comparison, document checklists, citations
- [ ] **Phase 8: Freemium Tier Gate** - Free teaser, tier unlocks UI, DemoTierSwitcher cycling all four tiers
- [x] **Phase 9: Pitch — Business Substance** - Sourced market sizing, competitive positioning, business model, financials, marketing (completed 2026-05-31)
- [x] **Phase 10: Pitch — Deck, Rehearsal & Protocol** - Slide deck, Q&A bank, timed rehearsals, protocol compliance checklist (completed 2026-05-31)

## Phase Details

### Phase 1: Scaffold & Port

**Goal**: A working repo on a single clean history with a real Vite + React build that runs `npm run dev` and renders the ported prototype with no visual regression.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02
**Success Criteria** (what must be TRUE):

  1. `git log --oneline --all` shows a single coherent history including `potential_v2.jsx`, README, FBLA PDF, and `.planning/` files
  2. `npm run dev` starts the app with no errors and the ported prototype renders in browser
  3. TypeScript vs JavaScript decision is committed in a STACK decision comment; engine and proxy directories exist with correct file extensions
  4. Existing dark-theme visual design (Instrument Serif, Manrope, JetBrains Mono) renders without regression

**Plans**: 3 plans
Plans:

- [x] 01-01-PLAN.md — Vite scaffold, git history verify, shared/types.ts compile proof (2026-05-30)
- [x] 01-02-PLAN.md — Port prototype to src/screens/PotentialApp.jsx, stub AI sections, visual parity checkpoint, delete root file
- [x] 01-03-PLAN.md — Vercel deploy config, first deploy, live URL confirmed, auto-deploy on main (2026-05-30)

**UI hint**: yes

### Phase 2: Quiz & Profile Capture

**Goal**: Users can complete a multi-step profile quiz that captures every field required to drive matching, financials, roadmap routing, and the visa concierge — including citizenship and immigration status.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05
**Success Criteria** (what must be TRUE):

  1. User can navigate a multi-step quiz covering career, finances, background, lifestyle, priorities, and dealbreakers without errors
  2. User can set an explicit "openness to living abroad" slider that is stored on the Profile object and is consumed by the scoring engine to weight international city matches up or down
  3. User can declare citizenship and current immigration status; these fields are present on the Profile output and visible in browser state
  4. User can apply at least one hard dealbreaker that eliminates non-matching destinations (not just soft-weights them)
  5. User can set a target move timeline (or select "exploring / no timeline")
  6. The quiz adapts based on prior answers (conditional/branching follow-ups), not a fixed linear sequence
  7. When answers reveal conflicting priorities, the quiz surfaces a reconciling follow-up and stores the resolution (a tiebreaker/weight) on the Profile preference output

**Plans**: 4 plansPlans:
**Wave 1**

- [ ] 02-01-PLAN.md — Test runner + extended Profile/PreferenceProfile contract + City dealbreaker fields + pure tested derive-preferences/conflict-detection/branching engines

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 02-02-PLAN.md — Quiz reducer migration + steps 1–5 (Career/Finances/Background/Going Global/Lifestyle) with branching, openness slider, citizenship + auto/declared status, move timeline

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 02-03-PLAN.md — Motivations step, hard dealbreakers + capture-time warning, tension reconciliation panel, submit wiring that emits the derived PreferenceProfile

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 02-04-PLAN.md — Profile-completeness assertion + tests, and the full-quiz human-verify checkpoint

**UI hint**: yes

### Phase 3: Matching & US Financial Spine

**Goal**: Users receive a ranked list of US city matches with a full income-adjusted financial breakdown, running entirely offline on battery — the first end-to-end demoable slice.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: MATCH-01, MATCH-03, MATCH-04, FIN-01
**Success Criteria** (what must be TRUE):

  1. After submitting the quiz, user sees a ranked list of matched US cities scored against their profile
  2. User can expand any city match and see which profile factors drove the score (cost, career, lifestyle, safety, dealbreaker penalties)
  3. User can sort and filter the ranked list by match score, savings, salary, and cost
  4. Each city shows an income-adjusted projection: estimated salary, take-home after taxes, itemized expenses, and monthly savings/deficit
  5. The full flow (quiz → results → city detail with financials) runs on battery with no network connection

**Plans**: TBD
**UI hint**: yes

### Phase 4: International Destinations & Country Models

**Goal**: Results include Lisbon, Berlin, Toronto, and London with sourced city data and country-correct financial models — no US tax math applied to foreign salaries.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: MATCH-02, FIN-02
**Success Criteria** (what must be TRUE):

  1. All four golden-path international cities (Lisbon, Berlin, Toronto, London) appear in the ranked results list alongside US cities
  2. Each international city's financial breakdown uses a country-appropriate tax model (not the US federal/FICA model); take-home figures are plausible for the destination country and salary level
  3. Every city data point (salary, rent, cost index) has a source URL documented in the codebase; all figures can be cited on demand
  4. A "data as of [date]" timestamp is visible on international financial content

**Plans**: TBD
**UI hint**: yes

### Phase 5: Proxy, Live AI & Golden-Path Cache

**Goal**: The live AI data layer works via a backend proxy that never exposes the API key, and the bundled golden-path cache has been tested as the actual offline fallback — confirmed to render instantly when the hotspot is killed.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: FOUND-03, FOUND-04, LIVE-01, LIVE-02, LIVE-03, LIVE-04
**Success Criteria** (what must be TRUE):

  1. Live job listings, housing listings, and a day-in-the-life narrative for the demo city render in the Plus tier city detail panel via the backend proxy
  2. Opening browser DevTools network tab shows zero direct calls to `api.anthropic.com` from the client; all Anthropic API calls go through the local proxy
  3. The golden-path cache (`data/golden-path/demo-results.json`) is populated for the scripted demo profile and at least 2 cities
  4. When the hotspot is killed and the proxy is unreachable, live data panels render golden-path content instantly with no spinner and no blank state
  5. On API timeout or malformed LLM response, the UI falls back to golden-path data without crashing
  6. The brand fonts (Instrument Serif, Manrope, JetBrains Mono) are self-hosted (bundled woff2 + `@font-face`, or `@fontsource/*`) so the visual identity renders correctly with zero network — confirmed when the hotspot is killed, the fonts do NOT fall back to system defaults

**Plans**: 5 plans
Plans:

**Wave 1**

- [x] 05-01-PLAN.md — Foundation: @anthropic-ai/sdk + resolveJsonModule, golden-path stub (Austin+Lisbon, rent+buy) + pinned persona, 3 RED Wave-0 tests (FOUND-04, LIVE-01..04)

**Wave 2** *(parallel; blocked on Wave 1)*

- [x] 05-02-PLAN.md — Proxy: api/live-core.ts (validate/prompts/sanitize) + api/live.ts web_search handler with cache fallback (FOUND-03, LIVE-01..04)
- [x] 05-03-PLAN.md — Client: src/lib/fetchLive.js + PotentialApp.jsx button/parallel fan-out/skeletons + D-10 source-text cards (FOUND-04, LIVE-01..04)
- [x] 05-05-PLAN.md — Self-host brand fonts (@fontsource), remove Google Fonts CDN link — offline typography (SC6 / FOUND-04)

**Wave 3** *(blocked on Wave 2)*

- [x] 05-04-PLAN.md — Capture script (D-07) + end-of-phase SC1-SC5 verification (FOUND-03/04, LIVE-01..04)

**UI hint**: yes

### Phase 6: Relocation Roadmap

**Goal**: Plus-tier users get a step-by-step relocation roadmap for their top city covering all 6 sections, authored from template (not raw LLM), readable offline, and exportable as PDF.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: ROAD-01, ROAD-02, ROAD-03
**Success Criteria** (what must be TRUE):

  1. User unlocking Plus tier can view a relocation roadmap covering timeline, financial prep, job-search path, housing path, logistics checklist, and visa summary (6 sections)
  2. Roadmap content is generated from a pre-authored `ROADMAP_TEMPLATES[citizenship][destination_country]` structure; no structural visa or procedural steps are invented by the LLM
  3. The roadmap renders without any network connection (offline-readable)
  4. User can export or print the roadmap as a PDF from the browser

**Plans**: 5 plans (4 + 1 optional)
Plans:

**Wave 0**

- [x] 06-01-PLAN.md — RED Wave-0 test suite locking buildRoadmap/acceptEnrichment (ROAD-01/02/03 + D-02/D-05/D-07 + VISA-04)

**Wave 1** *(blocked on Wave 0)*

- [x] 06-02-PLAN.md — Engine: authoring types + GENERIC_TEMPLATE + targetFundUSD + pure offline buildRoadmap + acceptEnrichment validator (ROAD-01/02/03)

**Wave 2** *(blocked on Wave 1)*

- [x] 06-03-PLAN.md — Authored content: ROADMAP_TEMPLATES.US.US (domestic) + US.UK (London, UK visa pathway — never Portugal D8), sourced (ROAD-01/02)

**Wave 3** *(blocked on Wave 2)*

- [x] 06-04-PLAN.md — UI: Roadmap screen + inline @media print CSS + window.print() export + adapter + nav wiring + human-verify checkpoint (ROAD-01/03)

**Wave 4** *(optional; blocked on Wave 2 + the Phase 5 capture script)*

- [x] 06-05-PLAN.md — OPTIONAL build-time prose-enrich bake, validator-gated, non-blocking (ROAD-02)

**UI hint**: yes

### Phase 7: Visa Concierge

**Goal**: Premium-tier users can complete an eligibility screener, view a pathway comparison for Portugal D8 and Canada Express Entry, see a per-pathway document checklist and cost/timeline cited to official government sources, and read a clear "not legal advice" framing on all immigration content.
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: VISA-01, VISA-02, VISA-03, VISA-04
**Success Criteria** (what must be TRUE):

  1. User can complete a visa eligibility screener that maps their profile to likely visa pathways based on their citizenship and work situation
  2. User can view a side-by-side pathway comparison for at least Portugal D8 and Canada Express Entry (visa type, requirements, processing time, fee range, pros/cons)
  3. Each pathway shows a document checklist and cost/timeline estimate with every figure cited to an official government source (AIMA, IRCC, etc.) and a "data as of [date]" label
  4. All immigration content displays a visible "not legal advice — consult a licensed immigration attorney" disclaimer and an attorney-referral CTA

**Plans**: 4 plans
Plans:

**Wave 0**

- [ ] 07-01-PLAN.md — RED visa.test.ts suite + visa.ts stub locking selectVisaPathways + graded fit + skeleton + non-filtering invariant (VISA-01/02/03)

**Wave 1** *(blocked on Wave 0)*

- [ ] 07-02-PLAN.md — Authored visa-pathways.ts: Portugal D8 + Canada Express Entry (citation-perfect) + GENERIC_SKELETON + flat registry; figures human-verify checkpoint (VISA-02/03)

**Wave 2** *(blocked on Wave 1)*

- [ ] 07-03-PLAN.md — Engine GREEN: real selectVisaPathways + computeGradedFit (gradeD8/gradeExpressEntry/isPostSecondaryDegree); all Wave 0 tests pass (VISA-01)

**Wave 3** *(blocked on Wave 2)*

- [ ] 07-04-PLAN.md — Visa.jsx side-by-side comparison + checklists + sources-as-text + disclaimer/CTA + skeleton + PotentialApp nav wiring; browser human-verify (VISA-02/03/04)

**UI hint**: yes

### Phase 8: Freemium Tier Gate

**Goal**: The complete freemium funnel is demonstrable on stage: free teaser locks deeper content with upgrade prompts, each tier correctly unlocks its feature set, and the DemoTierSwitcher lets the presenter cycle all four tiers in under 60 seconds.
**Mode:** mvp
**Depends on**: Phase 7
**Requirements**: TIER-01, TIER-02, TIER-03
**Success Criteria** (what must be TRUE):

  1. A user in the free tier sees a minimal teaser (that a #1 match exists) with deeper results and detail sections visibly locked/blurred to drive curiosity and upgrade prompts (16Personalities-style locked results)
  2. Switching tiers reveals the correct run-based feature set with no broken states: Basic $0.99 (1 run — the top 3 cities fully: name + why + core financials; cities #4+ stay locked), Plus $9.99 (3 runs — full ranked list + live-AI layer + roadmap), Premium $29.99 (unlimited runs — adds the visa concierge)
  3. Every locked section displays a "what you unlock" upsell message with Plus ($9.99, badged "most popular") positioned as the primary call-to-action
  4. The DemoTierSwitcher control cycles through all four tiers during a live demo, making every tier visible to judges in under 60 seconds

**Plans**: TBD
**UI hint**: yes

### Phase 9: Pitch — Business Substance

**Goal**: Every rubric dimension tied to business-plan substance (problem/market, business concept, value proposition, business model, feasibility/financials, marketing/growth) has a sourced, defensible deliverable that can be cited from memory in Q&A.
**Mode:** mvp
**Depends on**: Phase 1 (concept and architecture locked; runs in parallel with Phases 5–8)
**Requirements**: PITCH-01, PITCH-02, PITCH-03, PITCH-04, PITCH-05, PITCH-06
**Success Criteria** (what must be TRUE):

  1. A bottom-up market sizing document exists built from Census Bureau annual mover data (~8M households), international migration interest figures, and the 22–35 demographic segment — every layer cited to a primary source (PITCH-01)
  2. A competitive positioning document names Nomad List, WhereNext, and the Teleport-to-Topia acquisition explicitly, states what each competitor cannot do, and articulates Potential's three specific differentiators (PITCH-02, PITCH-03)
  3. A business model document specifies the run-based, one-time pricing (Free teaser, Basic $0.99 = 1 run, Plus $9.99 = 3 runs and the primary upsell, Premium $29.99 = unlimited runs; runs are never-expiring credits, no subscription), a full conversion funnel with stated conversion-rate assumptions (high first-purchase via the near-frictionless $0.99 entry, low re-run rate) benchmarked to freemium/16Personalities data, named recurring/scaling revenue (affiliate/referral + future B2B employer), and named distribution channels with audience-fit rationale (PITCH-04, PITCH-06)
  4. A financial model exists built bottom-up from stated assumptions: startup costs (API, legal, marketing), CAC per channel, LTV by tier, break-even month — every number re-derivable from first principles in 60 seconds (PITCH-05)

**Plans**: TBD

### Phase 10: Pitch — Deck, Rehearsal & Protocol

**Goal**: The pitch deck is built, every quantitative claim has an audible source attribution, three timed full run-throughs clock 8:30–9:00 on a phone hotspot, a 15-question Q&A bank is written and rehearsed aloud, and the protocol compliance checklist is passed with zero violations.
**Mode:** mvp
**Depends on**: Phase 9 (all business substance complete); Phase 8 (product demo complete and fallback confirmed)
**Requirements**: PITCH-07, PITCH-08, PITCH-09
**Success Criteria** (what must be TRUE):

  1. A slide deck exists following the narrative arc: problem → market → solution → differentiation → demo → business model → financials → marketing → ask, with audible source attributions woven into the delivery script for every quantitative claim
  2. A written Q&A bank of at least 15 questions exists covering data accuracy, CAC/LTV, legal advice avoidance, competitive moat, API failure resilience, and the "wasn't Teleport doing this?" question — all rehearsed aloud
  3. Three complete timed run-throughs of the full pitch on a phone hotspot land between 8:30 and 9:00
  4. The protocol compliance checklist is verified: no QR codes on any device screen, no physical materials for judges to keep, no contact with judges during setup, presentation runs on battery within the 2-device limit

**Plans**: 3 plans
Plans:

- [x] 10-01-PLAN.md — Deck outline + speaker notes (`pitch/deck/deck-outline.md`): 12–14 slides, source-tagged claim bullets, sub-timing table (PITCH-07)
- [x] 10-02-PLAN.md — Q&A bank (`pitch/qa-bank.md`): 20 questions, domain routing, source-tagged talking points (PITCH-08)
- [x] 10-03-PLAN.md — Protocol checklist + rehearse-later spec (`pitch/protocol-checklist.md`); timed run-throughs gated on Phase 8 (PITCH-09)

> **Author-now / rehearse-later split:** Plans 10-01/10-02 and the checklist + rehearsal spec in 10-03 are fully executable now. The three timed hotspot run-throughs (success criterion 3) and the mock-judge Q&A drill are a Phase 8–gated checkpoint inside 10-03 (Task 3) — specified now, executed once Phase 8 (live demo) ships.

## Progress

**Execution Order:**
Phases 1–8 are product (sequential by dependency). Phases 9–10 are pitch package. Phase 9 starts after Phase 1 and runs in parallel with Phases 5–8. Phase 10 requires both Phase 9 and Phase 8 to be complete.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold & Port | 3/3 | Complete | 2026-05-30 |
| 2. Quiz & Profile Capture | 0/4 | Not started | - |
| 3. Matching & US Financial Spine | 0/TBD | Not started | - |
| 4. International Destinations & Country Models | 0/TBD | Not started | - |
| 5. Proxy, Live AI & Golden-Path Cache | 5/5 | Complete   | 2026-06-06 |
| 6. Relocation Roadmap | 4/5 | In Progress|  |
| 7. Visa Concierge | 0/TBD | Not started | - |
| 8. Freemium Tier Gate | 0/TBD | Not started | - |
| 9. Pitch — Business Substance | 3/3 | Complete    | 2026-05-31 |
| 10. Pitch — Deck, Rehearsal & Protocol | 3/3 | Complete    | 2026-05-31 |
