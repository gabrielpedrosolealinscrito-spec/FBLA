# Potential — FBLA Entrepreneurship Pitch

## What This Is

**Potential** is a freemium web product that helps people entering adulthood figure out *where they should live* — and then gives them a concrete roadmap to actually get there. You take a deep, quiz-style profile (career, finances, lifestyle, dealbreakers, openness to living abroad), and it matches you to real cities (US and international), shows what your life and money would actually look like there, and — at paid tiers — maps the step-by-step relocation path including the immigration/visa route.

This GSD project is the **full competition deliverable** for the **FBLA Collegiate Entrepreneurship Pitch Competition (2025–2026)**: the working prototype *plus* the business model, financials, market research, marketing/growth strategy, and pitch presentation. The product is what we pitch; the pitch is what gets judged.

## Core Value

**Place #1 in the FBLA Entrepreneurship Pitch.** Every decision optimizes for the judges' 120-point rubric — not just a slick app. When app polish and pitch substance compete for time, pitch substance wins.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

**Pitch business-substance deliverables — authored + goal-verified in Phase 9** (sourced, Q&A-defensible documents under `pitch/`; 7 founder-verify flags F1–F7 carried for live-source confirmation before pitch day):
- [x] Problem identification & market opportunity — bottom-up TAM→SAM→SOM, Census/Pew/MBO/Truity cited (`pitch/market-research.md`) — *Validated in Phase 9*
- [x] Business concept & innovation — competitive positioning (Nomad List / WhereNext / Teleport→Topia) + three differentiators (`pitch/market-research.md`) — *Validated in Phase 9*
- [x] Value proposition & customer benefit (`pitch/business-model.md`) — *Validated in Phase 9*
- [x] Business model & pricing — run-based one-time pricing, no consumer subscription, recurring via affiliate + future B2B (`pitch/business-model.md`) — *Validated in Phase 9*
- [x] Feasibility & financials — 24-month base-case model, break-even ~Month 3–4, ~97–98% Plus margin (`pitch/financials/`) — *Validated in Phase 9*
- [x] Marketing & growth — four named channels with per-channel CAC, funnel driving to Plus (`pitch/business-model.md`) — *Validated in Phase 9*

(Product app requirements remain hypotheses until shipped — `potential_v2.jsx` is a v0 prototype to react to, NOT validated product.)

### Active

<!-- Current scope. Building toward these. Hypotheses until shipped + validated. -->

**Product — the app we demo:**
- [ ] Deep quiz-style profile capture (career, finances, background, lifestyle, priorities, dealbreakers, openness to living abroad)
- [ ] City matching/scoring engine that ranks destinations to the user's profile
- [ ] International destinations included (not US-only)
- [ ] Financial reality view per city (estimated salary, take-home, expense breakdown, monthly savings)
- [ ] Live AI data layer (real jobs, real housing, day-in-the-life) backed by a real backend/proxy — not the broken client-side call
- [ ] Relocation **roadmap** output: step-by-step "how to actually move there" (timeline, costs, action steps, job/housing path)
- [ ] Immigration/visa pathway as the premium differentiator
- [ ] Freemium funnel: free teaser at results (minimal preview + blurred/locked deeper sections to drive curiosity), then paywalled tiers
- [ ] Tiered offering, run-based one-time pricing (never-expiring credits, no subscription): Basic $0.99 (1 run) / Plus $9.99 (3 runs, upsell target, "most popular") / Premium $29.99 (unlimited runs), with features layered per tier

**Pitch package — what wins the competition:**
- (Business-substance dimensions — problem/market, concept, value prop, business model, financials, marketing — authored + verified in Phase 9; see Validated above.)
- [ ] Pitch deck + 10-min presentation + 5-min Q&A prep, sourced/cited *(Phase 10)*

### Out of Scope

<!-- Explicit boundaries with reasoning. -->

- **Hard paywall on all results** — rejected; free teaser converts better and scores value-prop/marketing rubric points.
- **Native mobile apps** — web is enough for the demo and the pitch story; not worth the build time.
- **Real payment processing / live billing infrastructure** — the tiers must be *demonstrable* and *credible to judges*, but we don't need a production Stripe integration to win. Revisit only if time allows.
- **Fully production-ready data accuracy for every global city** — demo needs a polished "golden path"; exhaustive worldwide data is a scaling story, not a v1 requirement.

## Context

- **Competition:** FBLA Collegiate Entrepreneurship Pitch, 2025–2026 guidelines (PDF in repo root). Team of 1–4. Judged live, in person, on a 120-point rubric across 6 content dimensions + delivery + protocol adherence. Two phases: preliminary then final. Up to 4 entries per state; top sections advance.
- **The #1 goal is to win**, stated explicitly by Gabriel. This is the priority lens for all tradeoffs.
- **Existing prototype:** `potential_v2.jsx` (809-line React component, "Potential — Life Simulator v2") exists on the `origin/main` branch. It has: landing → 5-step profile → scored matches across 12 hardcoded **US** cities → city detail with financial breakdown + AI-powered live listings via the Anthropic API. Strong visual design (dark theme, Instrument Serif / Manrope / JetBrains Mono). Treat as **v0 reference, not locked spec.**
- **Founder's edge:** Gabriel has direct, lived expertise in the immigration/visa space (F-1 → OPT → O-1A/H-1B). This is why the premium tier is an immigration concierge — it's defensible and authentic, and it makes "living abroad" real rather than decorative.
- **Demo plan:** the team will run the live-AI layer on stage via **personal phone hotspot** (they've done this before). So the live data feature stays as the centerpiece rather than being faked.

## Constraints

- **Competition rule — Internet:** "Internet Access: Not Provided" at venue. *Mitigation:* personal phone hotspot (proven by team). Live-AI features depend on this working — must have an offline-safe fallback / golden-path cache as insurance.
- **Competition rule — Links/QR:** judges may *see* but not *click or scan* links/QR codes. The demo must be self-contained on the presenting device; no "scan this to try it."
- **Competition rule — Devices:** max two personal devices (laptop/tablet/phone/laptop-sized monitor), one facing judges. No projectors, no external speakers, no electricity provided. Presentation must run on battery.
- **Competition rule — Sources:** all claims (market size, financials, competitor data) must be backed by credible, cited sources. The rubric scores citation quality directly.
- **Competition rule — Competitor-only prep:** only registered student competitors may build/prepare. (Claude assists Gabriel; Gabriel is the competitor doing the work.)
- **Tech — existing stack:** React (single JSX component, inline styles, no build tooling committed yet). Live data via Anthropic API — currently a broken client-side `fetch` with no auth; needs a real backend/proxy so a key isn't exposed.
- **Repo state:** local `main` has `README.md`; `origin/main` has `potential_v2.jsx`. Branches have **diverged** — must be reconciled before any build phase. (Flagged, not yet resolved.)
- **Timeline:** driven by FBLA NLC dates (check state deadlines; membership dues due March 1). Treat as fixed external deadline.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Scope = full pitch package, not app-only | 4 of 6 rubric dimensions are business-plan, not app. Winning needs both. | — Pending |
| Core value = win #1, not "ship the app" | Optimizes every tradeoff toward the judges' rubric. | — Pending |
| Include international destinations in v1 | Enables "living abroad" angle + premium visa concierge differentiator. | — Pending |
| Freemium with free teaser at results | Better conversion than hard paywall; scores value-prop/marketing points. | — Pending |
| Run-based one-time pricing (Basic $0.99 / Plus $9.99 / Premium $29.99), no consumer subscription | Relocation is a one-time decision — a subscription is hard to defend in Q&A. Runs = never-expiring credits remove the "use it or lose it" objection. Recurring/scaling revenue comes from affiliate/referral + future B2B, not consumer MRR. | — Pending (revised 2026-05-30, supersedes earlier hybrid sub pricing) |
| Model pricing/packaging + free-locked teaser on 16Personalities | Proven, recognizable consumer business on the exact funnel (free quiz → free-but-locked results → one-time unlock). Citable Q&A proof point. See `.planning/research/competitors/16personalities/`. | — Pending |
| $0.99 Basic as a near-frictionless entry purchase | Micro-price maximizes first-purchase conversion, then upsell to Plus/Premium. | — Pending |
| Premium = immigration/visa concierge | Leverages founder's real expertise; defensible moat; ties to international scope. | — Pending |
| Plus tier is the marketing upsell target | Middle tier carries the live-AI + roadmap "wow"; growth strategy aims users here. | — Pending |
| Keep live-AI layer as demo centerpiece (hotspot) | Team can run internet via phone hotspot on stage; it's the product's magic. | — Pending |
| Demo needs offline golden-path fallback | Insurance against hotspot/API failure mid-pitch. | — Pending |
| Deploy as a real website on Vercel | Easiest path; static frontend + serverless `/api` proxy holds the Anthropic key. | — Pending |
| Three parallel tracks: frontend / backend / pitch | Team works async; each owns a folder; meets at `shared/types.ts`. | — Pending |
| Contract-first (`shared/types.ts`) | Lets frontend + backend build in parallel without collisions. | — Pending |
| Repo split: `src/` `shared/` `api/` `pitch/` | Folder ownership = conflict-free parallel commits. See `STRUCTURE.md`. | — Pending |
| Slide deck built in Canva | Polished + fast; raw content/sources stay in `pitch/`, demo is part of the presentation. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-31 — Phase 9 complete: the six business-substance pitch deliverables are authored, sourced, and goal-verified (`pitch/market-research.md`, `pitch/business-model.md`, `pitch/financials/`). Next: Phase 10 — deck, rehearsal & protocol.*
