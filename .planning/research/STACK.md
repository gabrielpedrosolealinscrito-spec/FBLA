# Stack Research

**Domain:** Consumer web app — city-matching / relocation discovery, freemium funnel, AI-powered live-data layer
**Researched:** 2026-05-30
**Confidence:** HIGH (all versions verified against live sources today)

---

## The Demo Reality

Before the stack: the demo runs as `npm run dev` on the presenter's laptop. Judges cannot click links or scan QR codes. There is no "deployed URL" load path during the live demo. This collapses the stack decision to: **what runs best locally, looks most production-grade, and ports most of the existing code with the fewest surprises**.

Hosting/deployment is a pitch story ("deploys to Vercel in one command"), not a demo requirement.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.0.14 | Build tooling + dev server | Fastest cold start, HMR under 50ms, the existing JSX component drops in almost as-is. Next.js 16 is the other real option but requires a deeper rewrite and adds SSR complexity you don't need for a demo. |
| React | 19.2.6 | UI framework | Already used in prototype; v19 is stable and ships with Vite 8 + @vitejs/plugin-react v6. No Babel — Oxc handles React Refresh, smaller install. |
| Tailwind CSS | 4.1 | Utility styling | CSS-first config (@import "tailwindcss"), zero config to start, 5x faster full builds than v3. The existing dark-theme visual identity (colors, fonts) ports directly as @theme variables. shadcn/ui v4 requires Tailwind v4. |
| shadcn/ui | CLI 4.8.3 | Component library | Copy-paste components (not a package), meaning zero bundle bloat for unused pieces. Dark mode is first-class. March 2026 CLI v4 adds first-class Vite init. Used by judges as a credibility signal — it looks production-grade immediately. |
| Hono | 4.12.16 | Local proxy server (API backend) | The single file that holds ANTHROPIC_API_KEY and forwards requests to Anthropic. Ultra-lightweight (14kB, zero deps), runs on Node 20+ via @hono/node-server. 4.1x faster than Express. Alternatives: Express works but is heavier; Next.js Route Handlers are the other option if you went Next.js. |
| @anthropic-ai/sdk | 0.100.1 | Anthropic API client (server-side only) | Official SDK; use only in the Hono proxy, never in the browser bundle. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitejs/plugin-react | 6.x | React support in Vite | Required — enables JSX transform + Fast Refresh via Oxc |
| lucide-react | latest | Icon set | Used by shadcn/ui; consistent icon language judges read as "polished" |
| react-router-dom | 7.x | Client-side routing | For the landing → quiz → results → city-detail flow; keeps the app a SPA |
| framer-motion | 11.x | Page transitions + micro-animations | One well-placed transition on the results reveal is worth more to demo impressions than a dozen static screens |
| recharts | 2.x | Data visualization | Financial breakdown charts per city; simple API, works well with Tailwind color tokens |
| @tanstack/react-query | 5.x | Async state / caching | Manages the proxy fetch lifecycle AND is where you implement the offline cache (staleTime + persisted cache for golden-path cities) |
| dotenv | 16.x | .env file loading in Node | Loads ANTHROPIC_API_KEY for the Hono proxy in development; Vite's import.meta.env handles frontend vars separately |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node 20+ (LTS) | Runtime for Hono proxy + Vite | Required by @hono/node-server and Vite 8 |
| TypeScript | Type safety | Optional but shadcn/ui templates are TS-first; use it for the proxy and let Vite handle JSX/TSX — reduces runtime surprises in a live demo |
| Vite `concurrently` | Run frontend + proxy together | `concurrently "vite" "node server/index.js"` in a single `npm run dev` — one command for the demo |

---

## The Broken-Fetch Fix (Concrete)

**What is currently wrong:**

`potential_v2.jsx` calls `api.anthropic.com` directly from the browser with the API key in client-side code. This fails in two ways:
1. Anthropic rejects browser-origin requests (CORS) by design
2. Even if bypassed, the key is exposed to anyone who opens DevTools

**The only correct fix is a server-side proxy:**

```
Browser  →  POST /api/chat  →  Hono server (localhost:3001)
                                  ↓
                          ANTHROPIC_API_KEY in process.env
                                  ↓
                          api.anthropic.com/v1/messages
                                  ↓
                          streamed response back to browser
```

**Minimal Hono proxy (server/index.js):**

```js
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import Anthropic from '@anthropic-ai/sdk'
import 'dotenv/config'

const app = new Hono()
const client = new Anthropic() // reads ANTHROPIC_API_KEY from env

app.post('/api/chat', async (c) => {
  const { cityName, userProfile } = await c.req.json()
  
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    tools: [{
      type: 'web_search_20260209',
      name: 'web_search',
      max_uses: 3
    }],
    messages: [{
      role: 'user',
      content: `Find real current jobs, rental listings, and day-in-life details for ${cityName} 
                for someone with this profile: ${JSON.stringify(userProfile)}`
    }]
  })
  
  return c.json(response)
})

serve({ fetch: app.fetch, port: 3001 })
```

**Key in `.env` (gitignored):**

```
ANTHROPIC_API_KEY=sk-ant-...
```

**The browser never sees the key.** It only calls `http://localhost:3001/api/chat`.

Note: `web_search_20260209` is the latest tool version (released 2026-02-09) with dynamic filtering support. It requires the code execution tool to be enabled if you want dynamic filtering. The older `web_search_20250305` also works and is simpler. For this demo, use `web_search_20250305` — it is stable, does not require code execution, and `max_uses: 3` keeps costs predictable at $0.03/request.

**Pricing reality:** web search costs $10/1,000 searches = $0.01/search, plus token costs. A 3-search demo interaction costs roughly $0.03–0.05. For a live demo, this is negligible.

---

## Offline Golden-Path Cache (Demo Insurance)

**The constraint:** internet is via phone hotspot at the competition. If the hotspot fails mid-pitch, the live-AI feature must not hard-crash.

**Implementation with TanStack Query:**

```js
// In the proxy response handler
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24h — cached response stays fresh
      gcTime: 1000 * 60 * 60 * 48,    // kept in cache 48h
    }
  }
})
```

Pre-flight: before the competition, load the app on the laptop, run the full demo flow for the 3-5 "showcase cities" (Austin, Berlin, Lisbon, etc.). TanStack Query caches the LLM responses in memory. If the hotspot fails during the pitch, the cached responses serve immediately — the feature still demos correctly.

For a more robust fallback, persist the cache to localStorage using `@tanstack/query-persist-client-core` — survives a page refresh.

---

## Data Sources

### Demo Data Architecture

The right framing for this demo is:

| Data type | Demo approach | Pitch/scaling story |
|-----------|--------------|---------------------|
| City financials (rent, salary, cost of living) | **Curated static dataset** — 12–20 cities, hardcoded or in a JSON file, sourced from public data below and cited | "In production, pulls live from BLS, HUD FMR, and World Bank APIs" |
| Live listings (jobs, rentals, day-in-life) | **Anthropic web_search** via the proxy | Same — this is already the production approach |
| City quality-of-life scores | **Teleport API** (free, no key required) | Scales to ~220 cities globally |
| Visa/immigration routes | **Curated content** in the hardcoded dataset (founder expertise) | "Maintained by immigration concierge team" |

Do not integrate live financial APIs for the demo. The curated dataset IS the product at this stage. The data sources below are what you cite in the pitch and what you build toward.

### Free APIs for Production Road (Cite in Pitch)

| Source | Coverage | Cost | Notes |
|--------|----------|------|-------|
| **Teleport API** (api.teleport.org) | ~220 cities globally, quality-of-life scores across 17 categories | Free, no API key | Status as of 2025 research: likely still operational per multiple active projects; VERIFY before building on it — ECONNREFUSED in test today, may have rate limits or be intermittent. Use it for quality-of-life scores; do not depend on it for core financial data. |
| **BLS OEWS API** (api.bls.gov/v2) | US salary data by occupation + metro area, 800+ occupations | Free; register for key to get 500 series/day vs. 25 unregistered | Authoritative, government-backed, citable in pitch. Use for salary estimates per city by job category. |
| **HUD FMR API** (huduser.gov/hudapi/public/fmr) | US rental data by metro/county | Free with account token | FY2025 data available. Authoritative for US rental benchmarks. |
| **World Bank API** (api.worldbank.org) | International economic data (GDP per capita, purchasing power, inflation) | Free, no key | Good for international city economic context. Latency can be slow — pre-fetch and cache. |
| **Census API** (api.census.gov) | US city demographics, median income | Free with key | Complements BLS for US cities |

**Numbeo: do not use.** $260/month minimum for API access (confirmed 2026-05-30). Cite it as a competitor in the pitch.

**Teleport API status note:** The api.teleport.org endpoint was ECONNREFUSED when tested today. Public API directories still list it as active. Before building on it, manually test `https://api.teleport.org/api/cities/?search=Austin` in your browser. If it's down, the fallback is hardcoded quality-of-life scores in your static dataset, cited to Numbeo's public rankings page (no API needed, just reference the published index).

### International Cities — How to Handle

The prototype has 12 US cities. Adding international is the strategic differentiator.

**For the demo:** pick 5–8 international cities (Berlin, Lisbon, Toronto, Singapore, Mexico City, Sydney, Dubai, London) and build their financial profiles as curated static JSON, citing:
- World Bank GDP/PPP data for cost-of-living context
- Expatistan or Numbeo's *public* (non-API) rankings pages as cited sources
- The LLM/web_search layer handles the "real listings" part for any city

**For visa/immigration routes:** this is the premium differentiator and the founder has direct expertise. Curate these manually for the demo cities. No API needed or appropriate — this is proprietary content.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vite + Hono (two processes) | Next.js 16 App Router (one framework) | If the team is already Next.js-native OR if you decide to deploy the demo to a public URL (Vercel one-click deploy) — Next.js tells a cleaner one-framework story to judges. Does require a larger rewrite from the single JSX component. |
| shadcn/ui + Tailwind v4 | Keep existing inline styles | ONLY if time to rebuild is too short. Inline styles are not wrong, but shadcn/ui gives you modal/drawer/card primitives for the freemium paywall UI that would take hours to hand-build. |
| TanStack Query for caching | SWR | Both work. TanStack Query has better cache persistence options needed for the offline fallback. |
| Hono for proxy | Express | Express works fine. Hono is lighter and faster to write. Only switch to Express if you hit a Node.js compatibility issue. |
| `web_search_20250305` | `web_search_20260209` | Use 20260209 only if you want dynamic filtering (requires also enabling code execution tool). For this demo, 20250305 is simpler and more than capable. |
| Vercel (deployment story) | Netlify | Vercel is better for Next.js (if you go that route) and has more build minutes on free tier (6,000 vs 300). For Vite + static, Netlify's Starter permits commercial use on free tier — Vercel's Hobby plan is non-commercial. For a pitch demo that doesn't actually need to be deployed, this distinction doesn't matter. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Client-side Anthropic fetch** (current broken code) | Key is exposed in browser; Anthropic blocks browser-origin requests by CORS. Even `anthropic-dangerous-direct-browser-access: true` header just means the key is still visible in DevTools. Not fixable client-side. | Hono proxy server holding key in .env |
| **Numbeo API** | $260/month minimum, no free tier (confirmed). | BLS + HUD FMR for US; World Bank for international; LLM/web_search for live context |
| **Teleport API as primary data source** | Status uncertain (ECONNREFUSED on test); crowdsourced data quality questions. | Curated static dataset + BLS + World Bank |
| **Create React App** | Deprecated. Unmaintained. | Vite |
| **Next.js if you want a quick port** | Next.js 16 with App Router requires restructuring the existing 809-line component into pages/layouts/server components. Valuable framework but wrong tool for a fast prototype port. | Vite — the existing component works almost as-is |
| **Firebase / Supabase** | Overkill for a demo that has no user accounts, no persistent data, no auth. Adds complexity for no demo value. | Static JSON + local state + Hono proxy |
| **Real payment processing (Stripe)** | Out of scope per PROJECT.md. Judges want to see the tier logic, not a live billing flow. | Mock paywall UI — blur/lock components behind a fake "Upgrade" modal |
| **Native mobile (React Native, Expo)** | Out of scope per PROJECT.md. | Responsive web with Tailwind |

---

## Project Layout (Recommended)

```
/
├── src/
│   ├── components/        # shadcn/ui components + custom
│   ├── pages/             # LandingPage, QuizPage, ResultsPage, CityDetailPage
│   ├── lib/               # scoring engine, financial calculator, city data
│   ├── data/
│   │   └── cities.json    # curated dataset: 12 US + 8 international cities
│   └── main.jsx
├── server/
│   └── index.js           # Hono proxy — the ONLY place ANTHROPIC_API_KEY lives
├── .env                   # ANTHROPIC_API_KEY=sk-ant-... (gitignored)
├── .env.example           # ANTHROPIC_API_KEY=your_key_here (committed)
├── package.json
└── vite.config.js
```

Single `npm run dev` starts both processes via concurrently. One command, one terminal, demo-ready.

---

## Installation

```bash
# Scaffold
npm create vite@latest potential -- --template react
cd potential

# Tailwind v4
npm install tailwindcss @tailwindcss/vite

# shadcn/ui (Vite template)
npx shadcn@latest init

# Routing + state
npm install react-router-dom @tanstack/react-query framer-motion recharts lucide-react

# Proxy server
npm install hono @hono/node-server @anthropic-ai/sdk dotenv

# Dev utilities
npm install -D concurrently
```

Add to `package.json` scripts:
```json
"dev": "concurrently \"vite\" \"node server/index.js\""
```

Vite config for Tailwind v4:
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()]
})
```

Tailwind v4 CSS entry (replaces the old @tailwind directives):
```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --font-serif: 'Instrument Serif', serif;
  --font-sans: 'Manrope', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  /* preserve the existing dark-theme color palette here */
}
```

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| React 19.2.6 | Vite 8 + @vitejs/plugin-react 6 | Stable. Next.js 16 also targets React 19.2. |
| Tailwind 4.1 | shadcn/ui CLI 4.8.3 | shadcn init now handles the CSS-first config automatically |
| Hono 4.12 | Node 20+ | Requires @hono/node-server adapter for Node runtime |
| @anthropic-ai/sdk 0.100.1 | Node 20+ | Server-side only; do not import in Vite-bundled frontend code |
| TanStack Query 5.x | React 19 | v5 is the React 19-compatible release |

---

## Sources

- Anthropic official docs (platform.claude.com) — web_search tool versions (20250305, 20260209), tool type string, pricing ($10/1K searches), supported models — HIGH confidence
- npmjs.com — @anthropic-ai/sdk 0.100.1, vite 8.0.14, react 19.2.6, hono 4.12.16, shadcn 4.8.3 — HIGH confidence (checked live today)
- vite.dev/blog/announcing-vite8 — Vite 8 release, Rolldown bundler, @vitejs/plugin-react v6 with Oxc — HIGH confidence
- nextjs.org/docs — Next.js 16.2.6 current release — HIGH confidence
- tailwindcss.com/blog/tailwindcss-v4 — Tailwind v4 CSS-first config, Lightning CSS, migration notes — HIGH confidence
- ui.shadcn.com/docs/changelog — shadcn CLI v4 March 2026, Vite first-class support — HIGH confidence
- numbeo.com/common/api.jsp — $260/month minimum, no free tier — HIGH confidence (confirmed live today)
- bls.gov/bls/api_features.htm — Free BLS API, 500 series/day with key — HIGH confidence
- huduser.gov/portal/dataset/fmr-api.html — HUD FMR free API with token — HIGH confidence
- WebSearch — Teleport API operational status uncertain (ECONNREFUSED on direct test, listed as active in 2025 directories) — LOW confidence, verify before using
- WebSearch — Vercel Hobby (non-commercial), Netlify Starter (commercial OK), both have free tiers — MEDIUM confidence (check ToS before pitch)

---

*Stack research for: Potential — city-matching relocation web app*
*Researched: 2026-05-30*
