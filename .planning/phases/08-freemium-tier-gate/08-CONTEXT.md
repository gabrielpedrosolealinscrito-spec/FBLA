# Phase 8: Freemium Tier Gate - Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 8 delivers the **demo-facing freemium funnel** as a UI/gating layer that wraps the output of Phases 2–7 (results map, financials, live-AI, roadmap, visa). It does NOT add new product capabilities — it controls *what is visible at each tier* and *how the upgrade story is told on stage*.

Scope:
- A free teaser that reveals just enough to create desire and locks the rest.
- Tier-correct feature unlocks for Free / Basic / Plus / Premium, keyed off the existing `Tier` type (`shared/types.ts:204`).
- A `DemoTierSwitcher` letting the presenter flip all four tiers live.
- The upsell mechanics (locks, pricing modal, trust badges, runs badge) that mirror the 16Personalities funnel.

No real payments, no real auth, no account persistence (all v1 out-of-scope / v2-deferred). Tiers are demonstrated by switching UI state.

**Reality flag for the planner:** Phase 8 gate logic is buildable now, but the "blurred real content" lock and the teaser both assume the underlying Phase 2–7 screens actually render. On the current branch most of those screens are not built yet. Treat the gate as a **wrapper layer** that degrades gracefully (frosted-skeleton fallback) where a real section doesn't exist yet, and reaches full fidelity (blur the real content) once the section is real.
</domain>

<decisions>
## Implementation Decisions

### Free teaser reveal (TIER-01)
- **D-01:** A free user sees the **real #1 city name + match %** (e.g. "Lisbon, Portugal — 94% match"). The *why* (which profile factors drove it), the financial detail, and everything below #1 are locked. Concrete payoff visible; the reasoning + meaning is the paywall.
- **D-02:** The rest of the ranked list is teased as a **blurred stack of locked city cards with a count** ("11 more cities matched — unlock your full ranking"). Implies depth behind the paywall (16Personalities-style).

### Lock / blur visual treatment (TIER-01)
- **D-03:** Locked sections render the **real content, CSS-blurred, with a centered padlock + a "what you unlock" CTA** on top (literal 16Personalities pattern). Most convincing — judges see real depth exists behind the gate. Where the underlying Phase 2–7 screen isn't built yet, fall back to a frosted-skeleton placeholder rather than a broken state.

### DemoTierSwitcher (success criteria 2 & 4)
- **D-04:** The switcher is a **floating segmented pill** with four buttons: `Free | Basic | Plus | Premium`. One tap re-renders the same screen at that tier. This is also the mechanism that satisfies the "cycle all four tiers in under 60s" criterion.
- **D-05:** **Hidden presenter mode.** The pill (and any demo controls) are **hidden by default** and revealed via a secret presenter gesture known only to the presenter (keyboard chord, e.g. `⌘+D`, or a corner triple-click — planner picks the most reliable). No accounts, no auth, no backend. Judges see a clean consumer app; the presenter summons controls on demand. This supersedes any "always-visible pill" reading of D-04.

### Runs model surfacing (TIER-02)
- **D-06:** The demo UI **surfaces the "runs" concept with a visible badge** (e.g. `Plus · 2 of 3 runs left`) in the header. Makes the never-expiring-credits pricing model tangible on stage — judges *see* the business model, reinforcing the Phase 9 narrative. Basic = 1 run, Plus = 3 runs, Premium = unlimited.

### Upsell mechanics (TIER-03)
- **D-07:** Each locked section carries a **minimal inline padlock**; clicking it **opens a full 4-tier pricing modal** showing all tiers side by side. One strong, deliberate conversion beat rather than many scattered asks. Good for a controlled demo moment.
- **D-08:** **Plus ($9.99) is badged "most popular"** and positioned as the primary CTA in the modal.

### Tier transition feel
- **D-09:** When a tier switch unlocks sections, they animate with a **blur-dissolve** (padlock fades, blurred content resolves into focus). Mirrors the lock metaphor — the thing being "paid for" visibly clarifies. Avoid layout-shifting slide animations on the battery-powered demo device.

### Trust / conversion elements in the pricing modal
- **D-10:** The pricing modal includes: **"most popular" badge on Plus**, a **30-day money-back guarantee** line, and **"credits never expire · no subscription"** microcopy (preempts the "why not a subscription?" Q&A).
- **D-11:** Include **3 testimonial cards** (5-star rating + short text review each). **Safeguard:** there are no real users yet, so fabricated quotes are a small Q&A credibility risk. Mitigate by (a) using real quotes from informal beta testers / team if any are gathered before pitch day, or (b) being ready to frame them as "illustrative of target-user feedback" if a judge probes. Do not present them as verified customer counts.

### Basic tier definition — SPEC CHANGE (TIER-02)
- **D-12:** **Basic ($0.99, 1 run) unlocks the top 3 cities fully** (name + why + core financials); cities #4+ stay locked with a Plus upsell. A "run" = one full results generation (not one city), which keeps the run model coherent.
- **D-12a:** ⚠ **This revises locked spec.** ROADMAP Phase 8 success criterion 2 and REQUIREMENTS `TIER-02` currently say Basic = "the single most optimal city + core financials." Per this discussion that becomes **"top 3 cities."** ROADMAP.md (line ~214) and REQUIREMENTS.md `TIER-02` must be updated to match before/at planning so spec and build stay in sync. Plus remains: full ranked list + live-AI + roadmap. Premium remains: + visa concierge.

### Device / responsive target
- **D-13:** Build the tier-gate UI **responsive for both desktop and mobile** (not a single fixed laptop layout). User wants robustness across device types. Planner should still pixel-verify on the actual presenting device as the primary target.

### Claude's Discretion
- Exact secret gesture for hidden presenter mode (keyboard chord vs corner triple-click) — pick the most demo-reliable, document it clearly so the presenter can rehearse it.
- Exact blur radius / padlock iconography / modal layout — match the existing dark theme (Instrument Serif / Manrope / JetBrains Mono).
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Pricing & funnel model (the thing we mirror)
- `.planning/research/competitors/16personalities/NOTES.md` — the pricing/packaging + product-UX teardown this whole funnel mirrors (free-but-locked results, padlock + "unlock full report" CTA, "most popular" badge, money-back guarantee, credits-never-expire, reports-as-runs). Source PDFs alongside it (`your-profile.pdf`, `premium-career-suite.pdf`, `reports-for-pros.pdf`, `teams.pdf`, `testimonials.pdf`).

### Requirements & scope
- `.planning/REQUIREMENTS.md` — `TIER-01`, `TIER-02` (⚠ being revised per D-12a), `TIER-03`. Also note the v1 out-of-scope lines: no real payment processing, no account persistence (relevant to the "no real login" decision D-05).
- `.planning/ROADMAP.md` §"Phase 8: Freemium Tier Gate" (line ~205) — goal + 4 success criteria. ⚠ Success criterion 2 to be updated per D-12a.
- `.planning/PROJECT.md` — pricing/tier Key Decisions (run-based one-time pricing; Plus = upsell hero; Premium = visa concierge); "no real payment processing" + "no native apps" out-of-scope.

### Type contract
- `shared/types.ts:204` — `export type Tier = "free" | "basic" | "plus" | "premium"` — the gate keys off this. No gating logic exists yet; this is greenfield.

### Pitch alignment (so the demo matches the deck)
- `pitch/business-model.md` — run-based pricing the demo must visually echo (runs badge D-06, modal copy D-10).
- `pitch/qa-bank.md` — Q&A bank; the testimonials safeguard (D-11) and money-back/no-subscription copy (D-10) should align with prepared answers.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shared/types.ts:204` `Tier` union — the single source of truth the gate reads from. Add tier→feature-visibility mapping near it.
- `src/screens/ResultsMap.jsx` — the results screen the teaser + locks wrap. Existing dark-theme styling, sticky top bar with `backdrop-filter: blur(...)` already in use (good precedent for the blur-lock aesthetic).
- `src/screens/Landing.jsx` — existing blur/overlay/scroll-lock CSS patterns (`blur(...)`, body lock classes) — reusable idioms for the padlock overlay and pricing modal.

### Established Patterns
- TS at the contract layer (`shared/`, `api/`), JSX with inline styles in `src/screens/`. Keep the gate in JSX/`src` consistent with the prototype-origin UI layer; put the tier→feature map type in `shared/types.ts`.
- Dark theme, fonts: Instrument Serif / Manrope / JetBrains Mono (self-hosted via `@fontsource/*`).

### Integration Points
- The gate wraps every Phase 2–7 results/detail section. Cleanest approach: a tier-aware `<LockGate tier requiredTier>` wrapper + a central `TIER_FEATURES` map, so each screen declares what tier it needs and the gate handles blur/padlock/modal uniformly.
- `DemoTierSwitcher` sets a single app-level tier state that everything reads — and a separate hidden "presenter mode" boolean that controls switcher visibility.
</code_context>

<specifics>
## Specific Ideas

- Mirror 16Personalities literally: blurred real content + padlock + "unlock the full report" energy, "most popular" on the middle tier, money-back guarantee, credits-never-expire copy.
- The "watch it unlock" moment (blur-dissolve on tier-up) is intended as a deliberate on-stage wow beat — the planner should make it smooth, not janky, on battery.
- Runs badge is intentionally a *pitch device*: it shows the business model live, not just in the deck.
</specifics>

<deferred>
## Deferred Ideas

- **Real login / accounts / "developer login":** Came up as a way to gate presenter controls. Routed to a lightweight no-auth "hidden presenter mode" instead (D-05). Real auth + account persistence is already **v2-deferred** in REQUIREMENTS and is its own phase if ever revived post-competition. Not in Phase 8.
- **Live content editing on stage** (changing a city / tweaking numbers from a dev panel): rejected for v1 — the demo wants a fixed golden path, not editable-on-stage state. Risky under pitch pressure. Future "admin/CMS" capability if the product is ever pursued past the competition.

</deferred>

---

*Phase: 8-Freemium Tier Gate*
*Context gathered: 2026-06-05*
