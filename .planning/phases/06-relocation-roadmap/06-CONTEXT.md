# Phase 6: Relocation Roadmap - Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Fill the already-locked `Roadmap` contract (`shared/types.ts` lines 178-187) for the user's top city: 6 authored sections — `timeline · financial · jobs · housing · logistics · visa` — each a list of `steps[]: {label, detail, sourceUrl?}`. Authored **template-first** (ROAD-02: procedural/legal/visa steps are real authored knowledge, never LLM-invented), **personalized** with the user's real engine output, **readable offline** (ROAD-03), and **exportable as PDF**. Delivers ROAD-01, ROAD-02, ROAD-03.

**Tier note:** the roadmap is a **Plus**-tier feature, but the tier *gate* (paywall, unlock UI) is **Phase 8's** job — Phase 6 builds the roadmap surface itself, not the gating. The visa section teases the **Premium** concierge (Phase 7).

**The contract is already locked** (Phase 1 scaffold). Phase 6 decides HOW to fill it — what data threads in, how/whether prose is enriched, which pairs are authored, and the visa section's depth — not the section shape (fixed: 6 sections).

**Owns:** the `ROADMAP_TEMPLATES[citizenship][destinationCountry]` authored content, the render-time personalization that threads `MatchResult`/`Profile` numbers into template steps, the offline roadmap render, the PDF export, and the optional capture-time prose-enrich.

**Does NOT own:** the tier gate / paywall (Phase 8), the full visa concierge — eligibility screener, pathway comparison, doc checklists (Phase 7), the live-AI city data layer (Phase 5, already built — this phase *reuses* its proxy/cache).

</domain>

<decisions>
## Implementation Decisions

### Personalization depth (ROAD-01)
- **D-01: Fully threaded with the user's real engine output.** Template steps interpolate the actual numbers the engine already computes per user — `monthlySavings` drives a real move-fund timeline, the `jobs` section names the user's profession + the city's salary figure, `housing` uses their rent-vs-buy preference + the city's real rent/buy numbers. The "wow" is personalization, not live generation. Reuses `MatchResult` + `Profile` data already on hand offline.
- **D-02: Negative/zero savings → honest reframe, never a faked timeline.** When projected `monthlySavings <= 0` for the top city, the financial/timeline section does NOT invent or clamp a timeline. It surfaces the reality ("at your projected income this city runs a monthly deficit") and pivots the step to closing the income/expense gap before moving. Consistent with the project-wide honesty boundary (Phase 12 D-01/D-07: never punish the user, but stay truthful).

### Generation timing (ROAD-02 / ROAD-03)
- **D-03: Pre-baked offline roadmap is the critical path.** Roadmap = authored templates + render-time interpolation of local engine numbers. The default/offline render makes **zero network calls** — fully deterministic, demo-safe on a dead hotspot. Number-threading (D-01) needs no LLM; it reads local `MatchResult`/`Profile`.
- **D-04: Optional prose-enrich layer, off the critical path, reusing Phase 5 infrastructure.** An optional LLM layer may polish the *prose* of authored steps. It MUST reuse the Phase 5 `/api` proxy + golden-path cache + sanitize layer — **no new backend**. The capture script (Phase 5 D-07) runs the enrich **once at build time** and bakes the polished prose into the golden-path cache, so even **offline** the demo shows the enriched version. A live re-enrich on a working hotspot is an optional on-stage flourish, never required.
- **D-05: LLM touches `detail` prose ONLY.** The enrich layer may rewrite the `detail` text of a step. It MUST NOT invent, reorder, or alter authored `label`s, procedural steps, legal/visa facts, or `sourceUrl`s (ROAD-02 hard boundary). Authored procedural truth is immutable; only its phrasing may be smoothed.

### Coverage + fallback (ROAD-01)
- **D-06: Author the demo persona → BOTH golden-path cities.** Author full roadmaps for the persona's citizenship → the #1 US match (domestic move, lighter visa section) AND Lisbon (the international visa "wow"). This pins to the same persona + city pair as the Phase 5 golden-path cache (D-06 there), so the demo never shows financials for one city and a roadmap for another.
- **D-07: Uncovered pairs → generic-but-honest offline fallback roadmap.** Any citizenship×destination outside the authored set renders a real, generic skeleton roadmap (still offline, still the 6 sections, no invented procedural/legal steps) so the app never dead-ends if a judge picks an off-script city. Not a "coming soon" lock, not a blank — a usable generic plan.

### Visa-section depth (ROAD-01 / Phase 7 boundary)
- **D-08: Visa section = short authored summary + UPL line + Premium upsell teaser.** The Plus-tier roadmap's `visa` section holds: the headline pathway for that citizenship→country (e.g. "Portugal D8"), 2-3 key facts (rough timeline/cost), the UPL "informational only, not legal advice" framing (inherits Phase 7 VISA-04), and a teaser pointing to the full **Premium** concierge. Drives the Plus→Premium funnel and avoids duplicating Phase 7's deep build. The full eligibility screener / pathway comparison / document checklists stay in Phase 7.

### Carried-forward defaults (locked, not re-discussed)
- **PDF export = `window.print()` + print CSS** (ROAD-03). Zero-dependency, offline, battery-safe, no clickable-link / see-not-click risk. (Claude-discretion default; planner may confirm.)
- **Sources render as styled text, not clickable links.** `sourceUrl?` exists in the contract but is NOT rendered as an `<a>` — inherits Phase 5 D-10 + the competition see-not-click rule. Source *name* shown as text.
- **Offline render is mandatory** (ROAD-03): no live call on the roadmap's critical path. The optional enrich (D-04) is the only online touch and it is non-blocking + cached.

### Claude's Discretion (defer to UI-phase / research / planning)
- **Where the roadmap surfaces** — a dedicated `Roadmap` screen (named in `src/README.md`) vs a section inside `CityDetail`, and the navigation from results. Left to the UI-phase + planner.
- Exact `ROADMAP_TEMPLATES` module layout / file location under `shared/data/` and the render-time interpolation helper's shape.
- Section ordering / visual treatment within the 6 fixed sections, PDF print-stylesheet fidelity, per-step citation density.
- The prose-enrich prompt design + sanitize schema (reuse/extend the Phase 5 patterns).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The contract being filled (the spine of this phase)
- `shared/types.ts` §"Relocation roadmap" (lines 178-187) — `Roadmap` (`cityName`, `sections[]`) and `RoadmapSection` (`id` ∈ `timeline|financial|jobs|housing|logistics|visa`, `title`, `steps[]: {label, detail, sourceUrl?}`). **The 6-section shape is LOCKED here — do not redesign it.**
- `shared/types.ts` §"Profile" (lines ~52-54) — `citizenship`, `immigrationStatus` (the keys into `ROADMAP_TEMPLATES[citizenship][destinationCountry]`).
- `shared/types.ts` §"City"/"MatchResult" — `country` (destination key), `monthlySavings` (can be negative — D-02), `ExpenseBreakdown`, salary/financial fields threaded by D-01.
- `shared/types.ts` §"Visa concierge"/"Freemium tiers" (lines 189-204) — `VisaPathway` + `Tier` (`free|basic|plus|premium`): the visa-section teaser (D-08) points forward to this Phase 7 contract; roadmap is Plus tier.
- `shared/README.md` — notes `data/` holds "roadmap templates (backend-owned)" — where `ROADMAP_TEMPLATES` lives.

### Phase 5 infrastructure the optional enrich reuses (D-04)
- `.planning/phases/05-proxy-live-ai-golden-path-cache/05-CONTEXT.md` — D-07 (capture script bakes output into the golden-path cache — the mechanism D-04 reuses for prose), D-01/D-02 (two-layer fallback, client + proxy), D-08 (cached fallback visually invisible), D-10 (source-as-text, not links — carried forward here).
- `api/README.md` — the Anthropic proxy spec (validate/sanitize/cache-fallback). The enrich endpoint extends this, not a new backend.
- `data/golden-path/demo-results.json` (Phase 5 output) — the cache the enriched prose is baked into.
- `scripts/capture-golden-path` (Phase 5) — the build-time capture script the prose-enrich bake hooks into.

### Engine output the roadmap threads (D-01)
- `.planning/phases/03-matching-us-financial-spine/03-CONTEXT.md` — the `MatchResult` shape (scoreFactors, financial breakdown, `monthlySavings`) the roadmap personalizes against; D-09 (`shared/data/cities.ts`).
- `shared/engine/` (financial, scoring, country-models) + `shared/data/cities.ts` — the real per-user numbers + city facts the templates interpolate.

### Scope & requirements
- `.planning/ROADMAP.md` §"Phase 6: Relocation Roadmap" — goal + 4 success criteria (the verification target); `Depends on: Phase 5`.
- `.planning/REQUIREMENTS.md` — ROAD-01 (6-section roadmap), ROAD-02 (template-first, LLM-prose-only, no invented steps), ROAD-03 (offline + PDF export). Plus VISA-04 (UPL framing — inherited by the visa section, D-08).
- `.planning/PROJECT.md` — win-#1 lens, demo constraints (no venue internet, hotspot, see-not-click links, battery-only), Premium = immigration concierge (the D-08 upsell target).
- `STRUCTURE.md` — repo layout, contract-first rule (`shared/` = TS contract + data; `src/` = JSX UI).
- `.planning/phases/01-scaffold-port/01-CONTEXT.md` — locked stack/deploy (Vite + React, TS for `shared/`+`api/`, Vercel auto-deploy on `main`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`Roadmap` / `RoadmapSection` contract** (`shared/types.ts`) — already locked; implement against it, no contract design needed.
- **Phase 5 proxy + golden-path cache + capture script** — the optional prose-enrich (D-04) extends this rather than building new backend.
- **`MatchResult` + `Profile` + `shared/engine/`** — supply every personalized number the roadmap threads (D-01) entirely offline; no recomputation needed.
- **`shared/data/cities.ts`** — real city facts (rent, salary, country) the templates interpolate.
- **`src/screens` Roadmap surface** — `src/README.md` names a `Roadmap` screen in the scaffold (surfacing left to UI-phase, D-discretion).

### Established Patterns
- **Template-first + thin LLM** — mirrors the project's honesty stance: authored truth, LLM only for phrasing (D-05). Same boundary the scoring engine uses (no invented data).
- **Capture-time bake into golden-path** (Phase 5 D-07) — the prose-enrich follows the exact same offline-safe pattern.
- **Source-as-text, never clickable** (Phase 5 D-10 + see-not-click rule).
- **Contract-first** (`STRUCTURE.md`): templates + data in `shared/` (TS), roadmap UI + PDF export in `src/` (JSX).

### Integration Points
- New `ROADMAP_TEMPLATES[citizenship][destinationCountry]` authored data (likely `shared/data/`), consumed by a render-time interpolation helper that injects `MatchResult`/`Profile` numbers.
- Roadmap UI surface in `src/screens/` (separate screen vs CityDetail section — UI-phase decides), reachable from results for the top city.
- PDF export = `window.print()` + a print stylesheet on the roadmap surface.
- Optional enrich: roadmap prose ← Phase 5 `/api` proxy (cached); baked at capture time.

</code_context>

<specifics>
## Specific Ideas

- **The personalized timeline is the marquee moment**: "based on your $1,400/mo savings, your move fund lands in ~8 months" reads as the tool *knowing the user*, not a brochure — this is why D-01 chose fully-threaded over generic.
- **Honest reframe as a credibility play** (D-02): when a city is unaffordable, telling the truth ("monthly deficit — here's the gap to close") is more judge-defensible than a faked countdown, and consistent with the scoring engine's honesty boundary.
- **Capture-time prose bake** (D-04) is what makes "optional live enrich" worth it: the demo always shows polished prose (offline), and the live re-enrich is a flourish, not a dependency.
- **Visa section as the Plus→Premium funnel hinge** (D-08): the roadmap gives a real visa summary, then points to the Premium concierge — a natural in-product upsell the judges can see.

</specifics>

<deferred>
## Deferred Ideas

- **Full visa concierge** — eligibility screener, multi-pathway comparison, per-pathway document checklists, official-source citations → **Phase 7** (Premium). Phase 6's visa section is a summary + teaser only (D-08).
- **Tier gate / paywall / unlock UI** — the roadmap is Plus-tier, but gating it is **Phase 8** (TIER work). Phase 6 builds the surface; Phase 8 locks it behind the tier.
- **Authoring roadmaps for many citizenship×country pairs** — Phase 6 authors the demo persona's pairs + a generic fallback (D-06/D-07). Scaling the authored matrix to many citizenships/destinations is post-pitch (same "more data" scaling story as the city dataset).
- **Live (not cached) prose-enrich as a routine feature** — D-04 keeps it optional + capture-baked for the demo. A fuller live-enrich-per-view feature is post-pitch if ever.

## Open dependency (shared with Phase 5 — pin before the capture script runs)
- **The rehearsed demo persona's citizenship + #1 US city must be finalized** before authoring the persona-specific roadmaps (D-06) and before the capture script bakes enriched prose (D-04). Same blocker Phase 5 flagged (the persona defines the golden-path pair); not a new dependency. Lisbon is the working international assumption — confirm against the demo script.

### Reviewed Todos (not folded)
None — no pending todos matched this phase.

</deferred>

---

*Phase: 06-relocation-roadmap*
*Context gathered: 2026-06-05*
