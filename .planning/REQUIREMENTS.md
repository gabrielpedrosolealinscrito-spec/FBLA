# Requirements — Potential (FBLA Entrepreneurship Pitch)

**Defined:** 2026-05-30
**Source:** PROJECT.md + research (FEATURES.md, ARCHITECTURE.md, PITFALLS.md, SUMMARY.md)
**Two interwoven workstreams:** (A) the product/app we demo, (B) the pitch package the judges score. Winning needs both.

Demo "golden path": **US cities (existing 12) + Lisbon, Berlin, Toronto, London**. Fully-built visa pathways for Premium demo: **Portugal D8 + Canada Express Entry** (others shown as "coming soon").

---

## v1 Requirements (Competition-Ready)

### Foundation & Infrastructure

- [x] **FOUND-01**: Diverged git branches reconciled — `potential_v2.jsx` prototype, README, PDF, and `.planning/` all live on one coherent `main`
- [x] **FOUND-02**: Project builds and runs locally with a real toolchain (Vite + React), prototype ported in with no visual regression
- [ ] **FOUND-03**: Server-side proxy handles all Anthropic API calls — no API key is ever present in client code
- [ ] **FOUND-04**: App runs end-to-end on a laptop on battery with the live layer served from a bundled offline cache when no network is available

### Quiz / Profile Capture

- [ ] **QUIZ-01**: User completes a multi-step profile quiz covering career, finances, background, lifestyle, priorities, and dealbreakers
- [ ] **QUIZ-02**: User sets an explicit "openness to living abroad" input that influences results
- [ ] **QUIZ-03**: User declares citizenship and current immigration status (captured here so the visa roadmap can key off it later)
- [ ] **QUIZ-04**: User applies hard dealbreaker filters that eliminate non-matching destinations (not just soft-weight them)
- [ ] **QUIZ-05**: User sets a target move timeline (or "exploring / no timeline")

### Matching & Results

- [ ] **MATCH-01**: User receives a ranked list of matched cities scored against their profile
- [ ] **MATCH-02**: Results include international destinations alongside US cities
- [ ] **MATCH-03**: User can see why a city scored as it did (which profile factors drove the match)
- [ ] **MATCH-04**: User can sort/filter the ranked list (match, savings, salary, cost)

### Financial Reality

- [ ] **FIN-01**: User sees an income-adjusted financial projection per city: estimated salary, take-home after taxes, itemized expenses, monthly savings/deficit
- [ ] **FIN-02**: International cities use a country-correct financial/tax model (not the US model applied blindly)

### Live AI Data Layer (Plus tier centerpiece)

- [ ] **LIVE-01**: User sees real current job listings for their profession in a selected city, fetched live via the proxy
- [ ] **LIVE-02**: User sees real current housing listings (rent or buy per their preference) for a selected city
- [ ] **LIVE-03**: User sees an AI-generated "day in your life" narrative personalized to their profile and city
- [ ] **LIVE-04**: Live results gracefully fall back to cached golden-path data on API/parse failure (never a blank or broken state on stage)

### Relocation Roadmap (Plus tier differentiator)

- [ ] **ROAD-01**: User gets a step-by-step relocation roadmap for their top city covering timeline, financial prep, job-search path, housing path, and logistics checklist
- [ ] **ROAD-02**: Roadmap content is template-first (authored from real knowledge) and only LLM-enriched for prose — no invented procedural/legal steps
- [ ] **ROAD-03**: Roadmap is readable offline and exportable (e.g., PDF) for the demo

### Immigration / Visa Concierge (Premium tier)

- [ ] **VISA-01**: User completes an eligibility screener that maps their profile to likely visa pathway(s)
- [ ] **VISA-02**: User sees a pathway comparison (visa type, requirements, processing time, fee range, pros/cons) for at least Portugal D8 and Canada Express Entry
- [ ] **VISA-03**: User gets a per-pathway document checklist and cost/timeline estimate, with all figures cited to official government sources
- [ ] **VISA-04**: All visa copy stays within the UPL boundary (informational only; "consult a licensed attorney" framing; attorney-referral CTA)

### Freemium Tier Gate

- [ ] **TIER-01**: Free tier shows a minimal teaser (that a #1 match exists); deeper results and detail sections are visibly locked/blurred to drive curiosity and upgrade prompts (16Personalities-style)
- [ ] **TIER-02**: Basic ($0.99, 1 run) / Plus ($9.99, 3 runs) / Premium ($29.99, unlimited runs) tiers each unlock the correct run-based feature set, demonstrable by switching tier state in the UI
- [ ] **TIER-03**: Tier-locked features display a clear "what you unlock" upsell, with Plus positioned as the primary upsell target

### Pitch Package (what the judges score)

- [x] **PITCH-01**: Problem identification & market opportunity, with sized, cited market data
- [x] **PITCH-02**: Business concept & innovation framed against the competitor landscape (incl. the Teleport-exited-to-enterprise narrative)
- [x] **PITCH-03**: Value proposition & customer benefit articulated for the target user
- [x] **PITCH-04**: Business model — run-based one-time pricing (Basic $0.99 / Plus $9.99 / Premium $29.99 as never-expiring credits, no consumer subscription; recurring/scaling revenue via affiliate + future B2B) — with pricing, sales, and distribution
- [x] **PITCH-05**: Feasibility & financials — startup costs, unit economics, projections, profitability path, all defensible in Q&A
- [x] **PITCH-06**: Marketing & growth strategy, including how users are driven to the Plus upsell
- [x] **PITCH-07**: Pitch deck + ≤10-minute presentation built, with every claim sourced/cited (Sources row is directly scored)
- [x] **PITCH-08**: Q&A preparation — anticipated-question bank with defensible answers (esp. financials and visa accuracy)
- [x] **PITCH-09**: Protocol checklist passed — within time, no judge-clicked links/QR, no external speakers, nothing left with judges, dress code met

---

## v2 Requirements (Deferred — Post-Competition)

- [ ] Real payment processing (Stripe) and live billing
- [ ] Account persistence / saved profiles across sessions
- [ ] Expanded city database (20+ international cities)
- [ ] Additional fully-built visa pathways beyond Portugal D8 + Canada Express Entry
- [ ] Curated attorney-referral network with affiliate revenue
- [ ] Email delivery of reports
- [ ] Real-time visa-policy-change tracking (future Premium add-on / B2B value — no longer tied to a consumer subscription)
- [ ] Employer-side B2B product (relocation benefits for remote-first companies)

## Out of Scope

- **Hard paywall on all results** — kills conversion and costs value-prop/marketing rubric points; free teaser is the funnel.
- **Legal immigration advice / filing visas for users** — Unauthorized Practice of Law; real liability and a credibility risk in Q&A. We inform and refer, never practice law.
- **Exhaustive worldwide data on day one** — sparse data destroys trust; breadth is a scaling story, not a v1 deliverable.
- **Native mobile apps** — mobile-responsive web is enough to win; native adds build cost with no pitch value.
- **Production billing infrastructure** — judges score the business model, not a checkout flow; tiers are demonstrable via UI state.
- **Neighborhood-level granularity / real-time data pipelines / community features** — out of scope for a competition prototype.

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1: Scaffold & Port | Complete |
| FOUND-02 | Phase 1: Scaffold & Port | Complete |
| QUIZ-01 | Phase 2: Quiz & Profile Capture | Pending |
| QUIZ-02 | Phase 2: Quiz & Profile Capture | Pending |
| QUIZ-03 | Phase 2: Quiz & Profile Capture | Pending |
| QUIZ-04 | Phase 2: Quiz & Profile Capture | Pending |
| QUIZ-05 | Phase 2: Quiz & Profile Capture | Pending |
| MATCH-01 | Phase 3: Matching & US Financial Spine | Pending |
| MATCH-03 | Phase 3: Matching & US Financial Spine | Pending |
| MATCH-04 | Phase 3: Matching & US Financial Spine | Pending |
| FIN-01 | Phase 3: Matching & US Financial Spine | Pending |
| MATCH-02 | Phase 4: International Destinations & Country Models | Pending |
| FIN-02 | Phase 4: International Destinations & Country Models | Pending |
| FOUND-03 | Phase 5: Proxy, Live AI & Golden-Path Cache | Pending |
| FOUND-04 | Phase 5: Proxy, Live AI & Golden-Path Cache | Pending |
| LIVE-01 | Phase 5: Proxy, Live AI & Golden-Path Cache | Pending |
| LIVE-02 | Phase 5: Proxy, Live AI & Golden-Path Cache | Pending |
| LIVE-03 | Phase 5: Proxy, Live AI & Golden-Path Cache | Pending |
| LIVE-04 | Phase 5: Proxy, Live AI & Golden-Path Cache | Pending |
| ROAD-01 | Phase 6: Relocation Roadmap | Pending |
| ROAD-02 | Phase 6: Relocation Roadmap | Pending |
| ROAD-03 | Phase 6: Relocation Roadmap | Pending |
| VISA-01 | Phase 7: Visa Concierge | Pending |
| VISA-02 | Phase 7: Visa Concierge | Pending |
| VISA-03 | Phase 7: Visa Concierge | Pending |
| VISA-04 | Phase 7: Visa Concierge | Pending |
| TIER-01 | Phase 8: Freemium Tier Gate | Pending |
| TIER-02 | Phase 8: Freemium Tier Gate | Pending |
| TIER-03 | Phase 8: Freemium Tier Gate | Pending |
| PITCH-01 | Phase 9: Pitch — Business Substance | Complete |
| PITCH-02 | Phase 9: Pitch — Business Substance | Complete |
| PITCH-03 | Phase 9: Pitch — Business Substance | Complete |
| PITCH-04 | Phase 9: Pitch — Business Substance | Complete |
| PITCH-05 | Phase 9: Pitch — Business Substance | Complete |
| PITCH-06 | Phase 9: Pitch — Business Substance | Complete |
| PITCH-07 | Phase 10: Pitch — Deck, Rehearsal & Protocol | Complete |
| PITCH-08 | Phase 10: Pitch — Deck, Rehearsal & Protocol | Complete |
| PITCH-09 | Phase 10: Pitch — Deck, Rehearsal & Protocol | Complete |
