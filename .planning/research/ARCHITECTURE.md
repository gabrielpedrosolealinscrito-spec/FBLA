# Architecture Research

**Domain:** Personalized relocation-discovery web product (quiz → scoring → financials → AI data layer → roadmap → paywall)
**Researched:** 2026-05-30
**Confidence:** HIGH (based on direct prototype analysis + established patterns for this shape of SPA + LLM proxy)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Quiz /  │  │  Scoring   │  │  Financial   │  │  Results UI  │  │
│  │ Profile  │  │  Engine    │  │  Calculator  │  │  + Paywall   │  │
│  └────┬─────┘  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘  │
│       │  Profile{}   │ ScoredCity[]   │ CityFinancials   │          │
│  ─────┴──────────────┴────────────────┴──────────────────┴───────── │
│                      State Store (React context / useState)          │
│  ─────────────────────────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Golden-Path Cache (bundled JSON)                │    │
│  │   Falls back to this immediately if proxy unreachable        │    │
│  └──────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────┤
│                     NETWORK BOUNDARY                                  │
│                (everything above runs offline)                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │   LLM Proxy  (serverless fn or local Node process)             │  │
│  │   - Holds API key server-side (never in client bundle)         │  │
│  │   - Checks tier entitlement before returning premium data      │  │
│  │   - Runtime cache (TTL 24h) on city+category pairs             │  │
│  │   - Roadmap generator endpoint (templates + LLM enrichment)    │  │
│  └──────────────────────┬─────────────────────────────────────────┘  │
│                         │                                             │
│           ┌─────────────┴─────────────┐                              │
│           │    Anthropic API           │                              │
│           │  (web_search tool + msgs) │                              │
│           └───────────────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

**The key invariant:** everything above the network boundary runs with zero network. The scoring engine, financial calculator, and results UI are pure functions of `Profile` + static city data. The live-AI layer is an enhancement that layers onto a working spine, not a dependency of it.

---

## Component Boundaries

### Data Contracts (what flows between components)

These are the objects that define boundaries. Each component owns one transformation:

| Object | Owner | Shape |
|--------|-------|-------|
| `Profile` | Quiz/Profile capture | career, finances, lifestyle, dealbreakers, openness to abroad, income, savings, debt, housing, dependents, remote flag, **citizenship/nationality, current immigration status** |
| `ScoredCity[]` | Scoring Engine | city record + matchScore (0–100) + per-factor breakdown (cost, career, lifestyle, safety, dealbreaker penalties) |
| `CityFinancials` | Financial Calculator | estimated salary (city-adjusted), take-home/month (country-tax-model-aware), expense breakdown (local cost basis), monthly savings, savings rate |
| `LiveCityData` | LLM Proxy | jobs[], housing_rent[], housing_buy[], nightlife[], outdoors[], food[], day_in_life narrative — all cacheable |
| `RelocationRoadmap` | Roadmap Generator (proxy-side) | steps[], timeline weeks/months, cost estimates, job-search path, housing path, visa/immigration pathway keyed by (profile.citizenship, destination.country) |
| `TierGrant` | Paywall Gate | enum: free \| basic \| plus \| premium — determines what UI sections render and what proxy endpoints respond to |

**Critical note on `Profile.citizenship` and `Profile.immigrationStatus`:** These fields are what the roadmap generator keys on (`(citizenship, destination_country)` → visa route). They must be captured in the quiz and present in the Profile contract at Step 2. The premium differentiator is built on this exact data; without it, the roadmap generator is routing blind.

**Critical note on `CityFinancials` for international destinations:** The prototype's financial model uses US federal tax (22%) + FICA (7.65%) + US state tax applied to a US-baseline costIndex. This model produces wrong numbers for international cities — showing a Lisbon salary taxed as a US resident, for example. `engine/financials.ts` must dispatch to a per-country tax model for non-US destinations. For v1, hand-author 2–3 international country models that cover the golden-path demo cities; full worldwide accuracy is the scaling story.

### Component Responsibilities

| Component | Owns | Does NOT own |
|-----------|------|-------------|
| Quiz / Profile Capture | Profile state including citizenship + immigration status, step navigation, validation | Scoring, display of results |
| Scoring Engine | matchScore, factor breakdown, dealbreaker filtering | Financial math, UI rendering |
| Financial Calculator | Salary adjustment, country-aware tax/take-home, expense model, savings | Score logic, AI data |
| Results UI | Ranked city list, tier-gated sections, city detail panels | Score computation, financial math |
| LLM Proxy | API key, tier entitlement enforcement, runtime cache, roadmap template | Client rendering, quiz logic |
| Roadmap Generator | Step templates keyed by (citizenship, destination_country), LLM enrichment | Raw visa generation without template — see anti-patterns |
| Paywall Gate | `TierGrant` state, demo tier-switching UI, blur/lock overlays | Actual billing (out of scope for demo) |
| Golden-Path Cache | Pre-fetched `LiveCityData` + `RelocationRoadmap` for one scripted demo profile | Dynamic cache; this is static bundled JSON |

---

## Recommended Project Structure

```
src/
├── components/
│   ├── quiz/                  # Step-by-step profile capture
│   │   ├── QuizShell.jsx      # Navigation, step state
│   │   ├── steps/             # One file per quiz step
│   │   └── types.ts           # Profile type definition (incl. citizenship, immigrationStatus)
│   ├── results/
│   │   ├── ResultsList.jsx    # Ranked city cards + sort/filter
│   │   ├── CityDetail.jsx     # Expanded city panel
│   │   ├── FinancialBreakdown.jsx
│   │   ├── LiveDataPanel.jsx  # Renders LiveCityData, triggers fetch
│   │   └── RoadmapPanel.jsx   # Renders RelocationRoadmap (premium)
│   ├── paywall/
│   │   ├── TierGate.jsx       # Blur overlay + upgrade prompt
│   │   └── DemoTierSwitcher.jsx  # Dev/demo control to switch tiers
│   └── shared/                # Design system: buttons, cards, typography
├── engine/
│   ├── scoring.ts             # getMatchScore(profile, city) → ScoredCity
│   ├── financials.ts          # getSalary, getTakeHome, getExpenses, getSavings — dispatches to country model
│   ├── country-models.ts      # Per-country tax/cost model (US, Portugal, Mexico, etc.); US is default
│   └── ranking.ts             # sortByField, applyDealbreakers
├── data/
│   ├── cities.ts              # Static city records (US + intl)
│   ├── salaries.ts            # BASE_SALARIES map (profession → US national median)
│   ├── golden-path/           # Bundled offline fallback
│   │   ├── demo-profile.json  # The scripted demo input (frozen after Step 6)
│   │   └── demo-results.json  # Pre-fetched LiveCityData + Roadmap for demo profile
│   └── countries/             # Country-specific visa template data (premium roadmap)
├── proxy/                     # Server-side proxy (Node/serverless)
│   ├── index.ts               # Request router
│   ├── handlers/
│   │   ├── live-data.ts       # Anthropic API call + runtime cache
│   │   └── roadmap.ts         # Template lookup keyed by (citizenship, destination) + LLM enrichment
│   ├── cache.ts               # In-memory or file-based runtime cache
│   └── entitlements.ts        # Tier check before responding
├── store/
│   └── AppContext.tsx          # Profile, results, tier state; minimal — no Redux
└── app/
    ├── App.jsx
    └── index.jsx
```

### Structure Rationale

- **engine/**: Pure functions with no React, no network. Can be unit-tested in isolation. Scoring and financials are offline-safe; keeping them here makes that explicit.
- **engine/country-models.ts**: The financial model must dispatch here for international cities. Without this, international financial breakdowns are US-tax numbers on foreign salaries — a credibility failure on screen. V1 needs at minimum: US (existing), Portugal/EU (income tax ~28% + social security), Mexico (ISR tiered scale). Add more as the golden path expands.
- **data/golden-path/**: Static JSON checked into the repo. The laptop can be in airplane mode and the demo still runs. This is insurance, not a server concern.
- **proxy/**: Runs as a separate process. Holds the API key. Enforces tier entitlement. Could be a local `node proxy/index.ts` on the demo laptop, or deployed to Vercel/Cloudflare Workers for production story.
- **store/**: Flat React context. No Redux. The state shape is simple enough — `profile`, `results`, `tier`, `liveData` — that context + useState is the right weight for this project.

---

## Architectural Patterns

### Pattern 1: Pipeline with offline spine

**What:** The quiz → scoring → financials → results path is a pure data pipeline. Each stage is a transformation of its input; no stage requires network. The live-AI layer attaches at the leaf (city detail) rather than blocking the spine.

**When to use:** Any product where one killer feature (live AI) could fail at demo time. Build the spine so it demos without the feature, then layer the feature on top.

**Trade-offs:** Slightly more code than the monolith. Pays off immediately: if the hotspot dies mid-pitch, the presenter keeps going with the offline spine.

```typescript
// engine/scoring.ts — pure function, no imports from React or network
export function scoreCity(profile: Profile, city: CityRecord): ScoredCity {
  let score = 50;
  // lifestyle tag overlap
  const tagOverlap = profile.lifestyleTags.filter(t => city.vibe.includes(t)).length;
  score += tagOverlap * 8;
  // cost weight
  if (profile.importanceRank[0] === "cost") score += (110 - city.costIndex) * 0.4;
  // dealbreaker elimination
  if (hasDealbreaker(profile.dealBreakers, city)) return { ...city, matchScore: 0, eliminated: true };
  return { ...city, matchScore: Math.min(100, score), factors: { ... } };
}
```

### Pattern 2: Two-tier cache for LLM proxy

**What:** Two distinct caches with different purposes and lifetimes.

- **Tier 1 — bundled golden-path (frontend):** Static JSON for one scripted demo profile, committed to the repo, bundled into the build. Works in airplane mode. This is the pitch insurance.
- **Tier 2 — runtime proxy cache (server-side):** In-memory or file-based cache with a 24-hour TTL. Avoids redundant API calls for the same city+category pair during a live session. This is cost and latency control, not the demo fallback.

**Critical distinction:** Tier 2 requires the proxy to be reachable. If the hotspot is dead, Tier 2 does nothing. Only Tier 1 survives full network loss. Never conflate them.

```typescript
// In LiveDataPanel.jsx — tries proxy first, falls back to bundled cache
async function fetchLiveData(city: string, category: string, profile: Profile) {
  const goldenKey = `${city}_${category}`;
  const goldenPath = goldenPathData[goldenKey]; // imported from data/golden-path/demo-results.json

  try {
    const res = await fetch(`/api/live-data`, { body: JSON.stringify({ city, category, profile }) });
    return await res.json();
  } catch {
    // hotspot dead or proxy unreachable → fall back to golden path
    return goldenPath ?? EMPTY_STATE;
  }
}
```

### Pattern 3: Template-first roadmap generation

**What:** The roadmap generator at the proxy uses pre-authored templates keyed by `(citizenship, destination_country)` and calls the LLM only for prose enrichment and personalization — not for the factual structure of visa steps.

**When to use:** Any time LLM output will be presented as authoritative to an expert audience (judges who may probe). Pure LLM-generated visa timelines risk being confidently wrong.

**Trade-offs:** More upfront work authoring templates. Gabriel's real immigration expertise is exactly what these templates encode — this is the moat. The `citizenship` and `immigrationStatus` fields in `Profile` are what makes this routing possible; they must be captured at quiz time.

```typescript
// proxy/handlers/roadmap.ts
export async function generateRoadmap(profile: Profile, city: CityRecord): Promise<RelocationRoadmap> {
  // Keyed by citizenship + destination, not just destination
  const template = ROADMAP_TEMPLATES[profile.citizenship]?.[city.country] ?? DEFAULT_TEMPLATE;
  // Template gives correct structure: steps[], timeline, visa pathway
  // LLM only enriches narrative and personalizes to profile
  const enriched = await callAnthropicForEnrichment(template, profile, city);
  return { ...template, narrative: enriched };
}
```

### Pattern 4: Client-side tier gate (demo) with server-enforced boundary (production)

**What:** The client renders `TierGrant` state to blur/lock premium UI sections. This is the demo-grade paywall — a judge sees the gating effect. The server-side proxy independently enforces the same boundary: roadmap and visa endpoints check the `tier` header before responding.

**Why both layers:** Client gate alone is bypassable (inspector, state mutation). Server gate alone provides no visible demo effect. For the pitch, client gate is what judges see. Server gate is the production credibility answer to "how do you actually enforce that?"

```typescript
// components/paywall/TierGate.jsx
export function TierGate({ requiredTier, children }) {
  const { tier } = useAppContext();
  if (tierRank(tier) >= tierRank(requiredTier)) return children;
  return <BlurOverlay message={`Unlock with ${requiredTier}`} onUpgrade={handleUpgrade} />;
}

// proxy/entitlements.ts — server side, enforced independently
export function checkTier(request: Request, required: Tier): boolean {
  const clientTier = request.headers.get("x-tier") ?? "free";
  return tierRank(clientTier) >= tierRank(required);
  // NOTE: in production this becomes a real session/token check, not a header
}
```

---

## Data Flow

### Full pipeline: quiz submission → ranked results

```
User completes quiz (incl. citizenship + immigration status)
      ↓
Profile{} captured in AppContext
      ↓
Scoring Engine: scoreCity(profile, city) for each city in cities.ts
      ↓
Financial Calculator: getFinancials(profile, city) for each city
  → dispatches to country-models.ts for non-US cities
      ↓
Ranking: sort ScoredCity[] by matchScore, apply dealbreaker filter
      ↓
Results UI renders:
  - Top city teaser (free tier)
  - Full ranked list (basic+)
  - Financial breakdown per city using country-appropriate model (basic+)
  - [TierGate: plus] Live data panels (jobs, housing, etc.)
  - [TierGate: premium] Relocation roadmap + visa pathway keyed to profile.citizenship
```

### Live data flow: city detail expand → LLM result

```
User expands city detail panel
      ↓
LiveDataPanel checks golden-path cache (synchronous, always available)
      ↓
If: hotspot + proxy reachable
  → POST /api/live-data {city, category, profile, tier}
  → Proxy checks entitlement (tier header)
  → Proxy checks runtime cache (TTL 24h)
      → Cache hit: return cached JSON immediately
      → Cache miss: call Anthropic API with web_search tool
                  → cache result, return to client
  → Client renders live data

If: proxy unreachable (hotspot dead)
  → Client renders golden-path JSON immediately
  → Presenter continues demo without interruption
```

### Roadmap generation flow (premium)

```
User unlocks premium roadmap for a city
      ↓
Client POST /api/roadmap {city, profile, tier}
      ↓
Proxy enforces tier === "premium"
      ↓
ROADMAP_TEMPLATES[profile.citizenship][city.country] loaded
      ↓
Anthropic API called: template + profile → personalized narrative
      ↓
RelocationRoadmap{steps[], timeline, costs, visa_pathway, narrative}
      ↓
RoadmapPanel renders step-by-step output
```

### State management

```
AppContext (React context)
  ↓ (read via useAppContext hook)
  profile        → Quiz mutates this (including citizenship, immigrationStatus)
  scoredCities   → Set once after quiz submit, re-computed only on profile change
  tier           → TierGate reads this; DemoTierSwitcher mutates it during demo
  liveDataCache  → LiveDataPanel writes fetched results here (client-side runtime cache)
```

---

## Suggested Build Order

Dependencies drive this order. Each step delivers something demoable.

| Step | What Gets Built | Demo-able Result | Dependencies |
|------|-----------------|-----------------|--------------|
| 0 | **Reconcile diverged branches; establish build tooling (Vite + TS or Vite + JS)** | Repo has one working tree; `npm run dev` starts | Prerequisite for everything |
| 1 | Decompose monolith: extract engine/ (scoring, financials + country-models) as pure modules | Unit tests pass offline; international financials correct | Step 0 |
| 2 | Quiz / Profile Capture as standalone component with clean Profile{} output including citizenship + immigrationStatus fields | Quiz runs, submits Profile with all premium-required fields | Step 1 |
| 3 | Results UI: ranked list + financial breakdown + free-tier teaser (no live data) | Full offline demo: quiz → results with country-correct financials | Steps 1–2 |
| 4 | Add international cities to data/cities.ts; add matching country models to country-models.ts | Results show global destinations with credible financial numbers | Steps 1–3 |
| 5 | LLM Proxy: set up server endpoint, API key management, tier header check | Live data works with hotspot | Steps 1–3 |
| 6 | Golden-path cache: script one demo profile through the proxy, save JSON to data/golden-path/ | Offline fallback exists — do this before any live rehearsal | Step 5 |
| 7 | LiveDataPanel: wire to proxy with golden-path fallback | Live AI layer works; fails gracefully | Steps 5–6 |
| 8 | Roadmap Generator: author visa templates keyed by (citizenship, destination) + proxy endpoint | Premium roadmap works with Gabriel's real knowledge | Steps 2, 5 |
| 9 | RoadmapPanel + paywall TierGate UI | Demo shows tiered paywall | Steps 7–8 |
| 10 | DemoTierSwitcher: UI control to switch tiers during pitch | Judges can see all tiers in 60 seconds | Step 9 |

**Step 0 is the actual first step.** The branches have diverged (local `main` has only `README.md`; `origin/main` has `potential_v2.jsx`). Step 1 cannot proceed until the monolith is in the local working tree and a build system exists. Deciding TypeScript vs JavaScript belongs to STACK.md, but the step must happen before any engine extraction.

**Step 3 is the first end-to-end demo.** It runs offline with no hotspot. Steps 0–3 are the minimum viable pitch demo. Everything after is enhancement.

**Step 6 (golden-path cache) must happen before any live demo rehearsal.** If the team rehearses the live AI path without the cache saved, a hotspot failure during actual rehearsal has no fallback.

---

## Offline Golden-Path Design

The golden path is a scripted demo profile that showcases the product's best features. It should be chosen to hit the premium tier cleanly and show international destinations.

**Selection criteria for the golden-path profile:**
- Pick a profession and finances that produce at least 2 international city matches in the top 5
- Pick citizenship/immigration status that makes the visa pathway interesting (F-1 student → abroad is a natural fit)
- Pick lifestyle tags that produce a compelling "day in the life" narrative
- Pick the profile once, freeze it, pre-fetch all categories for top 3 cities

**What gets saved to data/golden-path/demo-results.json:**
- `LiveCityData` for top 3 cities, all categories (jobs, housing_rent, nightlife, outdoors, food, day_in_life)
- `RelocationRoadmap` for top 1 city at premium tier

**How the fallback activates:**
The client's `fetchLiveData` function wraps every proxy call in a try/catch. On network failure, it reads from the imported golden-path JSON synchronously. From the UI perspective, the data appears instantly (no loading spinner) which actually looks better than the live path. This is a feature, not a degraded state.

---

## Paywall Architecture

### Demo-grade (what we build)

```
tier: "free" | "basic" | "plus" | "premium"
  ↓ stored in AppContext
  ↓ read by TierGate wrapper components
  ↓ DemoTierSwitcher lets presenter toggle during pitch

Tier gates (client-side):
  free   → top 1 match headline only
  basic  → full ranked list + financial breakdowns
  plus   → + live AI data (jobs, housing, day in life)
  premium → + relocation roadmap + visa pathway
```

### Production-grade (the "how it scales" story for judges)

```
Server session token issued at login/purchase
  ↓ stored in httpOnly cookie (not accessible to client JS)
  ↓ proxy reads token, verifies against database
  ↓ proxy refuses premium-tier data if token doesn't carry premium entitlement
  ↓ client-side gate becomes cosmetic reinforcement only
```

This two-layer answer is what to give if a judge asks "what prevents someone from inspecting your code and bypassing the paywall?" Answer: the client gate is UX; the server gate is enforcement.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–100 users (FBLA demo) | React SPA + local Node proxy on laptop. No database. Tier in client state. |
| 100–10K users | Deploy proxy to Vercel/Cloudflare Workers. Add runtime cache (Redis or KV). Real auth (Clerk/Auth.js). Stripe for billing. |
| 10K–1M users | Edge-cache LLM responses (content is not user-specific). CDN for SPA. Background-job roadmap generation. Database for user profiles and saved searches. |

**First scaling bottleneck is LLM API cost**, not compute. Each live-data fetch hits Anthropic with web_search; at volume, runtime caching (keyed by city+category, TTL 24–48h) is the primary cost lever. Content doesn't change hour-to-hour.

---

## Anti-Patterns

### Anti-Pattern 1: LLM as authoritative visa source

**What people do:** Pass profile + destination to an LLM, display the visa steps verbatim.

**Why it's wrong:** LLMs hallucinate immigration timelines, fee amounts, and form numbers with high confidence. A judge who asks follow-up questions about the visa process will expose this immediately. Gabriel's real expertise is the moat; outsourcing it to raw LLM inverts the advantage.

**Do this instead:** Author `ROADMAP_TEMPLATES` keyed by `(citizenship, destination_country)` using Gabriel's real knowledge. Call the LLM only to generate narrative prose and personalize tone, not to generate the structural content.

### Anti-Pattern 2: Proxy cache as the offline fallback

**What people do:** Build a server-side cache and assume it covers the "offline" scenario because cached responses don't need the API.

**Why it's wrong:** The proxy cache still requires the proxy to be reachable, which requires the hotspot. Hotspot failure kills both the live path and the cached-proxy path simultaneously.

**Do this instead:** The offline fallback is static JSON bundled in the frontend build. Zero network dependencies.

### Anti-Pattern 3: Scoring engine inside React components

**What people do:** Keep scoring and financial math as functions inside the component (as in the existing monolith), co-located with JSX.

**Why it's wrong:** Untestable without rendering a component. Impossible to run in a proxy or a test without a browser environment. Harder to reason about correctness for a system where scores directly drive the pitch demo.

**Do this instead:** Extract to engine/ as pure TypeScript functions. Import them into components. Test them directly with `vitest` or similar.

### Anti-Pattern 4: US tax model applied to international cities

**What people do:** Add international city records with a costIndex and feed them through the existing US-centric financial model (federal 22%, FICA 7.65%, US state tax).

**Why it's wrong:** The results look plausible but are wrong — showing, for example, a Lisbon software engineer's monthly savings as though they're filing a US 1040. Any judge who looks at the international financial breakdown will question it, which is the worst moment to lose credibility given the premium differentiator is about international relocation.

**Do this instead:** `engine/country-models.ts` maps country codes to a tax/cost calculation function. The financial calculator dispatches through this. V1 needs 2–3 hand-authored models for the golden-path demo countries; exhaustive global coverage is the scaling story.

### Anti-Pattern 5: Hard paywall on all results

**What people do:** Require login/payment before showing any city results.

**Why it's wrong:** Kills the demo flow. Also explicitly out of scope per PROJECT.md — the free teaser is the conversion mechanism and scores value-prop points with judges.

**Do this instead:** Free tier shows top 1 match with one headline number. The value hook is visible; the depth is gated.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Anthropic API | Server-side only, via proxy. POST /v1/messages with web_search tool. | Never call from client — exposes API key. Current prototype does this; fix is step 5 in build order. |
| Font APIs (Google Fonts) | CDN link in index.html | Currently loaded via JS side effect in component; move to HTML for offline resilience. Fonts already loaded in browser cache from rehearsal will work offline. |
| Stripe (future) | Server-side webhook + session token | Out of scope for demo; name it in the "scales to production" story. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Quiz → Scoring Engine | Profile{} passed as argument, including citizenship + immigrationStatus | Pure function call; no context needed |
| Scoring Engine → Results UI | ScoredCity[] via AppContext | Set once post-submit; derived state, not persistent |
| Financial Calculator → Country Models | Function dispatch by city.country | Pure function; no network, no React |
| Results UI → LLM Proxy | HTTP POST with city, category, tier | The network boundary; everything else is in-process |
| Proxy → Roadmap Generator | Internal function call (same process) | No separate network hop needed for demo |
| LLM Proxy → Golden-Path Cache | Import at build time (frontend JSON) | Not a network call; synchronous read |

---

## Sources

- Direct analysis of `potential_v2.jsx` (809 lines, `origin/main` branch) — HIGH confidence
- React context + useState patterns for app-level state: standard React docs pattern — HIGH confidence
- Anthropic API web_search tool: already demonstrated working in prototype prompts (lines 197–222 of prototype) — HIGH confidence
- Two-tier cache design: established pattern for LLM-backed SPAs requiring offline demo resilience — MEDIUM confidence (pattern is sound; specific implementation details may vary)
- Server-side tier enforcement pattern: standard entitlement-check architecture — HIGH confidence
- Country-specific financial model requirement: derived from prototype analysis (US-only costIndex model) and international destinations requirement in PROJECT.md — HIGH confidence

---

*Architecture research for: Potential — personalized relocation discovery (FBLA Entrepreneurship Pitch 2025-2026)*
*Researched: 2026-05-30*
