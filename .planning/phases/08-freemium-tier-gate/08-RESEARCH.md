# Phase 8: Freemium Tier Gate — Research

**Researched:** 2026-06-05
**Domain:** React UI state architecture, CSS blur-gate visual treatment, freemium tier gating patterns
**Confidence:** HIGH (codebase fully verified; architecture is greenfield on known patterns)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Free user sees real #1 city name + match%. The "why" (profile factors), financial detail, and everything below #1 are locked.
- **D-02:** Rest of ranked list is a blurred stack of locked city cards with a count ("11 more cities matched — unlock your full ranking").
- **D-03:** Locked sections render real content, CSS-blurred, with centered padlock + "what you unlock" CTA on top. Where underlying Phase 2–7 screen is not built yet: frosted-skeleton placeholder fallback.
- **D-04:** DemoTierSwitcher is a floating segmented pill: `Free | Basic | Plus | Premium`. One tap re-renders at that tier.
- **D-05:** Hidden presenter mode. Pill is hidden by default; revealed via a secret presenter gesture. Judges see a clean consumer app; presenter summons controls on demand.
- **D-06:** Runs badge in header — e.g., `Plus · 2 of 3 runs left`. Basic = 1 run, Plus = 3 runs, Premium = unlimited.
- **D-07:** Each locked section has minimal inline padlock; clicking opens a full 4-tier pricing modal.
- **D-08:** Plus ($9.99) badged "most popular", positioned as primary CTA in modal.
- **D-09:** Tier unlock animates with blur-dissolve — padlock fades, blurred content resolves into focus. No layout-shifting slide animations.
- **D-10:** Modal includes: "most popular" badge on Plus, "30-day money-back guarantee" line, "credits never expire · no subscription" microcopy. (**See Open Questions — direct conflict with shipped pitch docs.**)
- **D-11:** 3 testimonial cards (5-star + short text). Safeguard: label as "illustrative of target-user feedback," not verified customer counts.
- **D-12:** Basic ($0.99, 1 run) unlocks top 3 cities fully (name + why + core financials); cities #4+ locked with Plus upsell. A "run" = one full results generation.
- **D-12a:** REQUIREMENTS.md `TIER-02` and ROADMAP Phase 8 success criterion 2 must be updated to reflect "top 3 cities" (not "single most optimal city"). `pitch/business-model.md:42` also still says "Single most optimal city" — stale and needs updating before demo.
- **D-13:** Tier-gate UI is responsive for both desktop and mobile.

### Claude's Discretion
- Exact secret gesture for hidden presenter mode — pick the most demo-reliable, document clearly.
- Exact blur radius / padlock iconography / modal layout — match dark theme (Instrument Serif / Manrope / JetBrains Mono).

### Deferred Ideas (OUT OF SCOPE)
- Real login / accounts / "developer login"
- Live content editing on stage (editable city / numbers from a dev panel)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TIER-01 | Free tier shows minimal teaser; deeper results and detail sections visibly locked/blurred to drive curiosity and upgrade prompts (16Personalities-style) | LockGate dual-mode architecture (blur real content / frosted skeleton); `TIER_FEATURES` rank-limit map; D-01/D-02 |
| TIER-02 | Basic / Plus / Premium tiers each unlock correct run-based feature set, demonstrable by switching tier state in the UI | `TIER_FEATURES` section-access map + rank-gate logic; `canAccess(active, required)` pure function; DemoTierSwitcher; D-12 top-3 spec |
| TIER-03 | Tier-locked features display a "what you unlock" upsell with Plus badged "most popular" as primary CTA | 4-tier pricing modal; inline padlock + modal trigger; D-07/D-08/D-10 |
</phase_requirements>

---

## Summary

Phase 8 builds a pure UI gating layer over Phases 2–7 output. No new product logic — only visibility rules and demo controls. The entire implementation is greenfield on known in-codebase patterns. No new packages are needed or recommended.

The governing risk is **LockGate dual-mode**: the gate must blur real rendered content where a section exists (financials, live-AI), and degrade gracefully to a frosted-skeleton placeholder where it doesn't (roadmap, visa — not yet built on this branch). These two modes must look identical from the outside and be handled by a single `<LockGate>` contract.

A second major risk is a **cross-doc conflict** that must be resolved before the pricing modal copy is written: Phase 8 D-10 specifies a "30-day money-back guarantee" in the modal, but `pitch/business-model.md:48` explicitly records the decision NOT to include one. If the demo shows it and a judge asks, the prepared Q&A answer is "no." This is not a blocker for planning, but is a blocker for the modal-copy task — it requires a user decision.

**Primary recommendation:** Lift `tier` + `presenterMode` to PotentialApp top-level state (or a thin TierContext). Build `<LockGate requiredTier>` + a `TIER_FEATURES` map as the single control surface. Use `filter:blur()` on content wrappers (not `backdrop-filter`). Use corner triple-tap as the presenter gesture.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Tier state (`tier`, `presenterMode`) | Client (React state) | — | No persistence, no auth; this is pure in-memory demo state |
| `TIER_FEATURES` visibility map | `shared/types.ts` (TypeScript) | — | Type contract lives at the typed boundary; feature map is static data |
| `canAccess(active, required)` gate logic | `shared/types.ts` or `src/lib/tierGate.ts` | — | Pure function; TS-testable; no UI |
| `<LockGate>` wrapper component | `src/components/LockGate.jsx` | — | JSX UI layer; inline-style idiom matching existing screens |
| **Rank-gating (D-02 blurred stack)** | **`ResultsMap.jsx`** | — | **ResultsMap renders the city list and owns the ranked-list cutoff. It renders the first N cards normally, then a single locked-blurred stack for the remainder. LockGate does not know about rank order.** |
| `<DemoTierSwitcher>` | `src/components/DemoTierSwitcher.jsx` | — | Floating pill; driven by presenterMode bool; sets tier |
| Pricing modal | `src/components/PricingModal.jsx` | — | Overlay; reuses body-lock + backdrop-filter panel idioms from Landing.jsx |
| Runs badge | Header area in `PotentialApp.jsx` city-detail header | — | Header already exists; badge is additive |
| Presenter gesture listener | `PotentialApp.jsx` root (or App.jsx) | — | Must persist across step changes; Landing.jsx's keydown is scoped to that screen |

---

## TIER_FEATURES Visibility Matrix

This matrix is the spine of `TIER_FEATURES`. Every LockGate instance keys off it. The planner should codify this table directly in code.

| Content / Section | Free | Basic | Plus | Premium | Gate Mode |
|-------------------|------|-------|------|---------|-----------|
| #1 city name + match % | ✓ | ✓ | ✓ | ✓ | Always visible |
| #1 city "why" + full financials | locked | ✓ | ✓ | ✓ | Section-level |
| Cities #2–3 full (name + why + financials) | locked | ✓ | ✓ | ✓ | Rank-gated (ResultsMap) |
| Cities #4+ | locked | locked | ✓ | ✓ | Rank-gated (ResultsMap) |
| Live-AI layer (jobs, housing, day-in-life) | locked | locked | ✓ | ✓ | Section-level (LockGate) |
| Relocation Roadmap | locked | locked | ✓ | ✓ | Section-level (LockGate) |
| Visa Concierge | locked | locked | locked | ✓ | Section-level (LockGate) |

**Critical architecture note:** Gate granularity is NOT uniform. Two modes are needed:
1. **Section-level gate** (`<LockGate requiredTier>`) — locks an entire section. Owned by `LockGate`. Handles: roadmap, visa, live-AI, city "why"/financials for Free.
2. **Rank-gate** — cuts the city list at N items and blurs the remainder into a "blurred stack with count." Owned by **`ResultsMap`** directly, not by `LockGate`. Free = show top 1, Basic = show top 3, Plus/Premium = show all.

`TIER_FEATURES` must express both modes. `<LockGate>` handles section-level gating. `ResultsMap` reads `TIER_FEATURES.rankShowUpTo[tier]` and renders accordingly.

---

## SECTIONS Manifest (frosted-skeleton fallback)

**Why this exists:** The roadmap and visa sections are not yet built on the current branch. LockGate must still render them — locked for Free/Basic, and as a frosted skeleton placeholder when unlocked but the component doesn't exist yet. Without a manifest, CityDetail would need conditional logic for each section, and unbuilt sections would simply not render at all.

**How it works:** A static `SECTIONS` map in `CityDetail.jsx` (or as a shared constant) lists every expected section, the component to render if built, and the `requiredTier`:

```javascript
// src/screens/CityDetail.jsx or shared/sections.ts
// Each entry: { key, label, requiredTier, Component }
// Component is null when the screen isn't built yet — LockGate renders frosted skeleton
const SECTIONS = [
  { key: "financials",  label: "Financial Snapshot",  requiredTier: "basic",   Component: FinancialDetail },
  { key: "liveAI",      label: "Live AI Data",         requiredTier: "plus",    Component: LiveAISection },
  { key: "roadmap",     label: "Relocation Roadmap",   requiredTier: "plus",    Component: null }, // not built yet
  { key: "visa",        label: "Visa Concierge",       requiredTier: "premium", Component: null }, // not built yet
];

// Renderer:
SECTIONS.map(({ key, label, requiredTier, Component }) => (
  <LockGate key={key} tier={tier} requiredTier={requiredTier} lockedLabel={`Unlock ${label}`} onUnlock={openModal}>
    {Component ? <Component city={selectedCity} profile={profile} tier={tier} /> : null}
  </LockGate>
))
```

**The contract:** `LockGate` receives `children` as null when the component is absent. It renders `<FrostedSkeleton>` in that case. When the real component ships in a future phase, you swap `null` for the import — the gate wrapping does not change.

This pattern means Phase 8 can build the complete gate layer with placeholder skeletons, and each future phase (7, 6) drops in real components with zero gate-layer changes.

---

## Standard Stack

### Core (no new packages — all existing)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | `^19.2.6` | Component model | Already in project |
| Vite | `^8.0.14` | Build / dev | Already in project |
| Vitest | `^4.1.8` | Unit testing | Already installed; `npm test` runs it |
| @testing-library/react | `^16.3.2` | Component tests | Already installed |

**No new packages needed or recommended.** The inline-style JSX idiom used by all existing screens means no CSS library, no animation library, and no modal library. Adding Framer Motion or a component library would break the established pattern and introduce bundle weight for a battery-powered demo device.

### Installation
```bash
# No installs — all packages already present
```

---

## Package Legitimacy Audit

**Not applicable — Phase 8 installs zero new packages.** All capabilities are built from existing React, CSS, and vanilla DOM APIs already in the repo. The planner must not add Framer Motion, Headless UI, Radix, react-icons, or any other package to implement this phase.

---

## Architecture Patterns

### System Architecture Diagram

```
PotentialApp (App root)
  │
  ├── [tier: Tier]          ← app-level state (FREE default)
  ├── [presenterMode: bool] ← app-level state (false default)
  │
  ├── gesture listener (click + touchstart at root, persists across steps)
  │        └── triple-tap bottom-right corner (80x80px) → setPresenterMode(m => !m)
  │
  ├── <RunsBadge tier={tier} />      ← header, always mounted when step >= 2
  │
  ├── <DemoTierSwitcher               ← floating pill, visible only if presenterMode
  │       tier={tier}
  │       onTier={setTier}
  │       visible={presenterMode} />
  │
  ├── <PricingModal                   ← portal/overlay; opened by LockGate CTA click
  │       open={modalOpen}
  │       onClose={...}
  │       onTier={setTier}
  │       currentTier={tier} />
  │
  └── [step-rendered screen]
        ResultsMap
          ├── Top N cities (normal render, N = TIER_FEATURES.rankShowUpTo[tier])
          └── Blurred stack + count (rank-gate — owned by ResultsMap, not LockGate)

        CityDetail
          └── SECTIONS.map → <LockGate tier requiredTier>
                  {Component ?? null}   ← null → FrostedSkeleton inside LockGate
              </LockGate>
```

Data flow:
- User/presenter sets `tier` via DemoTierSwitcher
- Every screen reads `tier` from prop or context
- `<LockGate>` compares `tier` to `requiredTier` via `canAccess(tier, requiredTier)` for section-level gating
- `ResultsMap` reads `TIER_FEATURES.rankShowUpTo[tier]` for rank-level gating
- Locked: renders blur wrapper + padlock overlay + CTA
- Unlocked: renders children; if children are null, renders FrostedSkeleton

### Recommended Project Structure

```
src/
├── components/
│   ├── LockGate.jsx         # blur wrapper + padlock overlay (dual-mode: blur real / frosted skeleton)
│   ├── DemoTierSwitcher.jsx # floating segmented pill (presenterMode-gated)
│   ├── PricingModal.jsx     # 4-tier pricing overlay
│   └── RunsBadge.jsx        # header badge: "Plus · 2 of 3 runs left"
├── lib/
│   └── tierGate.ts          # canAccess() pure function (if not in shared/)
├── screens/
│   └── PotentialApp.jsx     # lift tier + presenterMode state here; add gesture listener
shared/
└── types.ts                 # add TIER_FEATURES map + TIER_RUNS_MAP here (typed)
```

### Pattern 1: canAccess Pure Function

**What:** Tier ordering comparison. Takes the active tier and required tier, returns boolean.
**When to use:** Inside `<LockGate>` and in any conditional render that needs tier awareness.

```typescript
// Source: derived from shared/types.ts:204 Tier union [VERIFIED: codebase]
// Place in shared/types.ts or src/lib/tierGate.ts

export type Tier = "free" | "basic" | "plus" | "premium";
const TIER_ORDER: Record<Tier, number> = { free: 0, basic: 1, plus: 2, premium: 3 };
export const canAccess = (active: Tier, required: Tier): boolean =>
  TIER_ORDER[active] >= TIER_ORDER[required];
```

This function is a pure TS utility — test it exhaustively with Vitest.

### Pattern 2: LockGate Component (dual-mode)

**What:** Wraps any section. Blurs real children when locked; renders frosted skeleton when children are absent.
**When to use:** Every section gated by tier. Accepts `requiredTier` (section-level gating). Does NOT handle rank-gating — that is ResultsMap's job.

```jsx
// Source: pattern derived from existing blur idioms in ResultsMap.jsx and Landing.jsx [VERIFIED: codebase]
// src/components/LockGate.jsx

function LockGate({ tier, requiredTier, lockedLabel, onUnlock, children }) {
  const locked = !canAccess(tier, requiredTier);
  const [animating, setAnimating] = React.useState(false);

  // Track unlock: when locked transitions false, briefly animate
  React.useEffect(() => {
    if (!locked) { setAnimating(true); setTimeout(() => setAnimating(false), 450); }
  }, [locked]);

  if (!locked && !animating) return children ?? null;

  const hasRealContent = Boolean(children);
  const blurAmount = locked ? "8px" : "0px";
  const overlayOpacity = locked ? 1 : 0;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 14 }}>
      {/* Layer 1: blurred real content OR frosted skeleton */}
      <div style={{
        filter: `blur(${blurAmount})`, userSelect: "none", pointerEvents: "none",
        transition: "filter 0.42s ease", willChange: animating ? "filter" : "auto"
      }}>
        {hasRealContent ? children : <FrostedSkeleton />}
      </div>
      {/* Layer 2: padlock overlay + CTA */}
      <div onClick={onUnlock} style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer",
        background: "rgba(8,9,12,0.35)",
        opacity: overlayOpacity, transition: "opacity 0.38s ease",
        borderRadius: 14
      }}>
        {/* Inline padlock SVG — matches ResultsMap mk pin pattern [VERIFIED: codebase] */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="rgba(226,181,107,0.9)" strokeWidth="1.6" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style={{
          fontSize: 13, color: "rgba(243,237,225,0.8)",
          fontFamily: "'Manrope', sans-serif", textAlign: "center", maxWidth: 200
        }}>
          {lockedLabel ?? "Unlock to see this"}
        </span>
      </div>
    </div>
  );
}
```

**Unlock animation (D-09):** Transition `filter: blur(8px)` → `filter: blur(0)` and overlay `opacity: 1` → `opacity: 0`. Use CSS transition on `filter` and `opacity` only — compositor-eligible, no layout shift, battery-safe. Never animate `height`, `margin`, `padding`, or `transform: translate` during the blur-dissolve.

### Pattern 3: CSS Blur — filter vs backdrop-filter

**Critical distinction.** The codebase uses `backdrop-filter: blur()` for glass-bar effects (header in ResultsMap, panel in Landing). **That blurs what is BEHIND the element.** To blur locked content itself, use `filter: blur()` on the content's wrapper div.

```
backdrop-filter: blur(12px)  ← blurs BEHIND — for glass panels/headers
filter: blur(8px)            ← blurs the ELEMENT ITSELF — for locked content (use this)
```

Both are in the codebase. Phase 8 uses `filter: blur()` for LockGate. [VERIFIED: codebase — `ResultsMap.jsx:37` uses `backdrop-filter:blur(12px)` on `.top`; `Landing.jsx:35` uses `backdrop-filter:blur(8px)` on `.ctl`]

**Perf note on battery:** Large-area `filter: blur()` animation triggers GPU compositing. Bound the region — apply filter to the section wrapper, not the full screen. Add `will-change: filter` during the transition only (set on lockout entry, remove on completion). Test on the actual presenting device.

`prefers-reduced-motion` is already honored in Landing.jsx — use the same guard for the blur-dissolve:

```javascript
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// If reduced: skip transition, snap directly to unlocked state
```

### Pattern 4: Presenter Gesture — Corner Triple-Tap

**Decision (Claude's Discretion — D-05):** Use **bottom-right corner triple-tap/click** as the presenter gesture.

**Why not keyboard chord (e.g., `⌘+D`):**
- `⌘+D` is the browser "bookmark" shortcut — calling `event.preventDefault()` is fragile and browser-version-dependent.
- Any keyboard chord requires a keyboard, which contradicts D-13 (mobile-responsive) — on touch devices, there is no keyboard.
- Triple-tap in a corner works for mouse click and finger tap identically.

**Implementation pattern:**

```javascript
// Attach at PotentialApp root — NOT inside a screen — so it persists across step changes
// Source: gesture pattern derived from Landing.jsx's window.addEventListener("keydown", onKey) [VERIFIED: codebase]

let tapCount = 0, tapTimer = null;

function onPresenterGesture(e) {
  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  const inCorner = clientX > window.innerWidth - 80 && clientY > window.innerHeight - 80;
  if (!inCorner) { tapCount = 0; return; }
  tapCount++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { tapCount = 0; }, 600); // 600ms window for 3 taps
  if (tapCount >= 3) { tapCount = 0; setPresenterMode(m => !m); }
}

// In PotentialApp, in a useEffect with [] deps:
window.addEventListener("click", onPresenterGesture);
window.addEventListener("touchstart", onPresenterGesture, { passive: true });
// cleanup: remove both on unmount
```

**Presenter rehearsal note:** The gesture activates in the bottom-right corner (80×80 px hotspot). Three quick taps toggle presenter mode on/off. Document this clearly in the commit message and phase verification notes.

### Pattern 5: Existing Modal/Overlay Idiom (Landing.jsx)

The `.panel` class in Landing.jsx is the closest existing modal analog:

```css
/* Landing.jsx:84 [VERIFIED: codebase] */
.lp .panel {
  position: fixed; right: 30px; bottom: 92px; z-index: 26;
  background: rgba(13,16,22,.82);
  backdrop-filter: blur(14px);
  border: 1px solid var(--ivory-faint);
  border-radius: 16px;
  opacity: 0; transform: translateY(10px); pointer-events: none;
  transition: .4s var(--ease);
}
.lp .panel.open { opacity: 1; transform: none; pointer-events: auto; }
```

And body scroll-lock:
```javascript
// Landing.jsx:152 — body overflow lock [VERIFIED: codebase]
document.body.classList.add("lp-locked");   // overflow:hidden;height:100vh
document.body.classList.remove("lp-locked"); // cleanup
```

The pricing modal reuses these patterns: fixed overlay, backdrop-filter glass background, body scroll-lock on open, transition on `opacity`+`transform` for entry/exit animation.

### Pattern 6: Pricing Modal (D-07, D-08, D-10, D-11)

**What:** Full-screen 4-tier pricing overlay. Opens when any padlock is clicked. Shows all four tiers side-by-side, Plus badged "most popular", money-back + credits-never-expire microcopy (OQ-1 pending), and 3 testimonial cards below.

**Layout:** CSS grid `1fr 1fr 1fr 1fr` on desktop; single-column with Plus first on mobile (<520px). Plus column has a glowing border + "most popular" badge to draw the eye.

```jsx
// Source: inline-style pattern; layout derived from 16Personalities pricing modal [VERIFIED: NOTES.md]
// src/components/PricingModal.jsx

const TIERS_CONFIG = [
  {
    key: "free",
    label: "Free",
    price: "$0",
    priceNote: "forever",
    features: ["#1 city match", "City name + match %"],
    cta: "Current plan",
    ctaAction: null,
    popular: false,
  },
  {
    key: "basic",
    label: "Basic",
    price: "$0.99",
    priceNote: "1 run · never expires",
    features: ["Top 3 cities fully revealed", "City \"why\" + core financials", "Offline-ready results"],
    cta: "Get Basic",
    ctaAction: "basic",
    popular: false,
  },
  {
    key: "plus",
    label: "Plus",
    price: "$9.99",
    priceNote: "3 runs · never expires",
    features: ["Full ranked list (all cities)", "Live AI: jobs, housing, day-in-life", "Relocation roadmap", "Everything in Basic"],
    cta: "Get Plus",
    ctaAction: "plus",
    popular: true,  // D-08: "most popular" badge
  },
  {
    key: "premium",
    label: "Premium",
    price: "$29.99",
    priceNote: "unlimited runs",
    features: ["Visa concierge + pathway comparison", "Document checklist + timeline", "Everything in Plus"],
    cta: "Get Premium",
    ctaAction: "premium",
    popular: false,
  },
];

// Testimonials (D-11) — static illustrative quotes; frame as "illustrative of target-user feedback"
const TESTIMONIALS = [
  { stars: 5, text: "Showed me Toronto was a better fit than Austin — saved me months of research.", name: "Alex M." },
  { stars: 5, text: "The roadmap was the only tool that actually broke down what moving abroad costs.", name: "Priya K." },
  { stars: 5, text: "Switched from Plus to Premium for the visa step. Worth every cent.", name: "Jordan T." },
];

function PricingModal({ open, onClose, onTier, currentTier }) {
  React.useEffect(() => {
    if (open) document.body.classList.add("lp-locked");
    else document.body.classList.remove("lp-locked");
    return () => document.body.classList.remove("lp-locked");
  }, [open]);

  if (!open) return null;

  return (
    /* Full-screen dim layer — rgba only, no backdrop-filter here (GPU cost) */
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9998,
      background: "rgba(4,5,8,0.80)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "24px 16px"
    }}>
      {/* Modal card — stop propagation so clicks inside don't close */}
      <div onClick={e => e.stopPropagation()} style={{
        background: "rgba(13,16,22,0.96)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(243,237,225,0.1)", borderRadius: 20,
        maxWidth: 880, width: "100%", maxHeight: "90vh", overflowY: "auto",
        padding: "40px 32px 32px"
      }}>
        {/* Header */}
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: "#f3ede1",
          textAlign: "center", marginBottom: 8 }}>
          Unlock Your Full Potential
        </h2>
        <p style={{ textAlign: "center", color: "rgba(243,237,225,0.5)",
          fontFamily: "'Manrope', sans-serif", fontSize: 14, marginBottom: 32 }}>
          Credits never expire · No subscription · No commitment
        </p>

        {/* 4-column tier grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
          /* Mobile override via inline media is not possible; handle via className or JS width check */
        }}>
          {TIERS_CONFIG.map(t => (
            <div key={t.key} style={{
              background: t.popular ? "rgba(226,181,107,0.06)" : "rgba(243,237,225,0.03)",
              border: t.popular ? "1.5px solid rgba(226,181,107,0.5)" : "1px solid rgba(243,237,225,0.08)",
              borderRadius: 14, padding: "20px 16px", position: "relative",
              display: "flex", flexDirection: "column", gap: 12
            }}>
              {/* "Most popular" badge (D-08) */}
              {t.popular && (
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: "#e2b56b", color: "#070a11", fontSize: 10, fontWeight: 700,
                  padding: "3px 12px", borderRadius: 100, letterSpacing: "0.08em",
                  fontFamily: "'Manrope', sans-serif", whiteSpace: "nowrap"
                }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#f3ede1" }}>
                {t.label}
              </div>
              <div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26,
                  color: t.popular ? "#e2b56b" : "#f3ede1" }}>
                  {t.price}
                </span>
                <span style={{ fontSize: 12, color: "rgba(243,237,225,0.4)",
                  fontFamily: "'Manrope', sans-serif", marginLeft: 6 }}>
                  {t.priceNote}
                </span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0,
                display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                {t.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: "rgba(243,237,225,0.65)",
                    fontFamily: "'Manrope', sans-serif", paddingLeft: 16, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "#e2b56b" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {t.ctaAction ? (
                <button onClick={() => { onTier(t.ctaAction); onClose(); }} style={{
                  padding: "10px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  background: t.popular ? "#e2b56b" : "rgba(243,237,225,0.08)",
                  color: t.popular ? "#070a11" : "#f3ede1",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14
                }}>
                  {t.cta}
                </button>
              ) : (
                <div style={{ padding: "10px 0", textAlign: "center",
                  fontSize: 13, color: "rgba(243,237,225,0.3)",
                  fontFamily: "'Manrope', sans-serif" }}>
                  {currentTier === "free" ? "Current plan" : t.cta}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust microcopy (D-10) */}
        <p style={{ textAlign: "center", color: "rgba(243,237,225,0.35)",
          fontFamily: "'Manrope', sans-serif", fontSize: 12, marginTop: 20 }}>
          {/* PENDING OQ-1: include or remove the money-back guarantee line before demo */}
          {/* Option A (if OQ-1 resolves to include): "30-day money-back guarantee · Credits never expire · No subscription" */}
          {/* Option B (if OQ-1 resolves to drop): "Credits never expire · No subscription · No commitment" */}
          Credits never expire · No subscription · No commitment
        </p>

        {/* Testimonial cards (D-11) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12, marginTop: 28 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background: "rgba(243,237,225,0.03)",
              border: "1px solid rgba(243,237,225,0.06)",
              borderRadius: 12, padding: "16px 14px"
            }}>
              <div style={{ color: "#e2b56b", fontSize: 13, marginBottom: 8 }}>
                {"★".repeat(t.stars)}
              </div>
              <p style={{ fontSize: 13, color: "rgba(243,237,225,0.6)",
                fontFamily: "'Manrope', sans-serif", lineHeight: 1.5, margin: 0 }}>
                "{t.text}"
              </p>
              <p style={{ fontSize: 11, color: "rgba(243,237,225,0.3)",
                fontFamily: "'Manrope', sans-serif", marginTop: 8, marginBottom: 0 }}>
                — {t.name}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile: testimonials stack (3-col breaks below ~480px; use JS or className breakpoint) */}

        {/* Close */}
        <button onClick={onClose} style={{
          display: "block", margin: "24px auto 0",
          background: "transparent", border: "none",
          color: "rgba(243,237,225,0.35)", fontSize: 13, cursor: "pointer",
          fontFamily: "'Manrope', sans-serif"
        }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
```

**Mobile note:** The 4-column tier grid and 3-column testimonial grid both break below ~520px. Since this is inline-styles JSX (no CSS media query block), handle the responsive stack either by: (a) measuring `window.innerWidth` in a `useState` + `resize` listener, or (b) using a wrapper `<style>` tag scoped to the modal with a `@media` block. Option (b) is consistent with how `ResultsMap.jsx` handles media queries (scoped `<style>` tags inside the component). On mobile, bump Plus to `order: -1` so the recommended tier appears first in the stack.

**OQ-1 slot:** The trust microcopy line is marked with a comment. Swap the copy once OQ-1 is resolved. This is the only task blocked by the conflict.

### Anti-Patterns to Avoid

- **Slide animations on unlock:** Layout-property animations (`height`, `transform: translateY`) during unlock cause layout shift and feel janky on battery. Use only `filter` + `opacity` for the blur-dissolve (D-09).
- **backdrop-filter on locked content:** This blurs what is behind the content. Use `filter: blur()` instead on the content wrapper.
- **Keyboard-only presenter gesture:** Breaks mobile (D-13). Use corner triple-tap.
- **⌘+D as presenter chord:** Browser bookmark shortcut — unreliable.
- **Adding new npm packages:** Breaks the inline-style idiom. No Framer Motion, Radix, Headless UI, or icon libraries.
- **Mounting gesture listener inside a screen component:** Landing.jsx's keydown lives on `window` but is inside a useEffect that unmounts. The presenter gesture must live at PotentialApp root to survive step changes.
- **backdrop-filter on the pricing modal's full-screen overlay:** Fine for the modal panel itself, but if you apply it to the full-screen dim layer it's a GPU perf hazard. Use `rgba` background on the dim layer, `backdrop-filter` only on the modal card.
- **Putting rank-gate logic inside LockGate:** LockGate does section-level gating. Rank-gating (the D-02 blurred stack of N remaining cities) belongs in ResultsMap, which owns the city list render order.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tier ordering comparison | Custom comparison chain | `TIER_ORDER` record + `canAccess()` pure function | Single source of truth, testable in <5 lines |
| Animation library | Framer Motion, GSAP | CSS `transition: filter 0.4s ease` | Compositor-eligible, zero bundle cost, works offline |
| Modal/overlay component | Third-party modal lib | Compose from Landing.jsx `.panel` idiom + body scroll-lock | Already established pattern in codebase |
| Icon library | react-icons, lucide-react | Inline SVG padlock (18×18px) | Matches existing `mk` pin SVG pattern in ResultsMap.jsx |

**Key insight:** The existing codebase achieves its visual quality entirely with inline CSS and inline SVG. Adding a library for Phase 8 would introduce inconsistency, bundle weight, and a potential single point of failure on a battery-powered demo device.

---

## Common Pitfalls

### Pitfall 1: Using backdrop-filter to blur locked content
**What goes wrong:** `backdrop-filter: blur()` blurs what is rendered *behind* the element — e.g., a glass panel effect. If applied to locked content itself, the content appears unblurred and the background behind it is blurred. This is visually wrong.
**Why it happens:** The codebase uses `backdrop-filter` extensively (ResultsMap sticky header, Landing panel). It's the natural reach for "blur something."
**How to avoid:** Always apply `filter: blur(8px)` to the content wrapper element for locked content. `backdrop-filter` is for glass-panel effects only.
**Warning signs:** Locked section shows content clearly while background looks blurred.

### Pitfall 2: Gesture listener not surviving step changes
**What goes wrong:** Presenter mounts DemoTierSwitcher or attaches the gesture listener inside a screen component (e.g., ResultsMap). When the user navigates to CityDetail (step still 2, but `selectedCity` is set), the screen re-renders, the effect re-runs, or the listener is detached. Presenter gesture stops working mid-demo.
**Why it happens:** PotentialApp renders screens conditionally via `if (step === N)` — not a router. Components mount/unmount on step change. Landing.jsx's pattern of `window.addEventListener` inside `useEffect` is correct *for Landing* because Landing unmounts cleanly. But a gesture listener that must persist across ALL screens belongs at the root.
**How to avoid:** Attach the presenter gesture listener in `PotentialApp.jsx`'s top-level `useEffect([], [])` — the same component that owns `step`, `tier`, and `presenterMode`.
**Warning signs:** Gesture works on the results map but stops working after selecting a city.

### Pitfall 3: Large-area filter:blur animation hurts battery
**What goes wrong:** Animating `filter: blur()` on a section that spans most of the viewport triggers GPU texture uploads per frame. On a battery-powered laptop during a demo, this can produce dropped frames or thermal throttling precisely when the "wow moment" blur-dissolve is playing.
**Why it happens:** `filter` forces compositing on the whole painted region.
**How to avoid:** (a) Keep blur transition short — `0.4s` is enough for the reveal to look premium. (b) Wrap only the section, not the full-screen body. (c) Add `will-change: filter` to the element before the transition starts and remove it immediately after. (d) Honor `prefers-reduced-motion`.
**Warning signs:** Choppy animation during the tier-unlock moment on the actual demo device.

### Pitfall 4: ⌘+D keyboard chord conflicts with browser
**What goes wrong:** `⌘+D` (or `Ctrl+D`) triggers browser "bookmark this page." Even with `event.preventDefault()`, some browsers ignore it for system shortcuts.
**Why it happens:** Natural first instinct for a hidden developer gesture.
**How to avoid:** Use corner triple-tap/click. Works across mouse and touch. Does not conflict with any browser shortcut.

### Pitfall 5: Runs badge shows wrong values for Premium
**What goes wrong:** Premium = unlimited runs. Displaying "∞ of ∞ runs left" or "3/3" confuses the demo narrative.
**Why it happens:** The badge is templated and the unlimited case isn't special-cased.
**How to avoid:** Define `TIER_RUNS_MAP` statically:
```javascript
// [ASSUMED values that match D-06 and business-model.md]
const TIER_RUNS_MAP = {
  free:    { label: "Free",    runsLeft: 0, runsTotal: 0,     display: "Free tier" },
  basic:   { label: "Basic",   runsLeft: 1, runsTotal: 1,     display: "Basic · 1 of 1 run" },
  plus:    { label: "Plus",    runsLeft: 2, runsTotal: 3,     display: "Plus · 2 of 3 runs left" },
  premium: { label: "Premium", runsLeft: null, runsTotal: null, display: "Premium · unlimited" },
};
```
The `runsLeft: 2` for Plus is illustrative — the demo never decrements; it's a static show. The "2 of 3" midpoint is chosen so the badge looks like a real product in use, not a fresh account.

### Pitfall 6: Money-back guarantee conflict — DECISION NEEDED
**What goes wrong:** D-10 specifies a "30-day money-back guarantee" in the pricing modal. `pitch/business-model.md:48` explicitly records the decision NOT to include one: "No money-back guarantee at launch... Potential has elected not to include it." If the modal shows it and a judge asks about refunds, the prepared Q&A answer says no. This is a live contradiction.
**Why it happens:** Phase 8 CONTEXT was decided in a session without cross-referencing the Phase 9 business-model doc.
**How to avoid:** User must decide before the modal-copy task executes: either (a) add the guarantee everywhere including updating business-model.md, or (b) drop the line from D-10 and keep the "no money-back" decision. Either is fine; the conflict cannot survive into the demo.
**Warning signs:** See Open Questions OQ-1 below.

---

## Code Examples

### Runs Badge (D-06)

```jsx
// Source: inline-style pattern from PotentialApp.jsx [VERIFIED: codebase]
// Mounts in header when step >= 2 and tier !== "free"
function RunsBadge({ tier }) {
  const map = {
    free:    null,
    basic:   "Basic · 1 of 1 run",
    plus:    "Plus · 2 of 3 runs left",
    premium: "Premium · unlimited",
  };
  const label = map[tier];
  if (!label) return null;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
      color: "var(--accent)", background: "var(--accent-dim)",
      padding: "3px 10px", borderRadius: 6, letterSpacing: "0.03em"
    }}>
      {label}
    </span>
  );
}
```

### DemoTierSwitcher (D-04)

```jsx
// Source: .pill CSS idiom from ResultsMap.jsx:46-48 [VERIFIED: codebase]
const TIERS = ["free", "basic", "plus", "premium"];
function DemoTierSwitcher({ tier, onTier, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      display: "flex", gap: 4, background: "rgba(13,17,25,0.90)",
      backdropFilter: "blur(14px)", border: "1px solid rgba(243,237,225,0.14)",
      borderRadius: 100, padding: "6px 8px", zIndex: 9999
    }}>
      {TIERS.map(t => (
        <button key={t} onClick={() => onTier(t)} style={{
          padding: "7px 16px", borderRadius: 100, border: "none",
          background: tier === t ? "rgba(226,181,107,0.13)" : "transparent",
          color: tier === t ? "#e2b56b" : "rgba(243,237,225,0.5)",
          fontFamily: "inherit", fontSize: 13, fontWeight: tier === t ? 600 : 400,
          cursor: "pointer", transition: "all 0.18s",
          outline: tier === t ? "1.5px solid #e2b56b" : "none"
        }}>
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
```

### FrostedSkeleton (frosted placeholder for unbuilt screens)

```jsx
// Source: new — no existing skeleton; pattern derived from card idiom [ASSUMED]
// Use static widths (not Math.random()) to avoid unstable render
function FrostedSkeleton({ lines = 4 }) {
  const WIDTHS = [85, 70, 90, 60]; // static — no re-render flicker
  return (
    <div style={{ padding: 24, borderRadius: 14, background: "var(--card)", border: "1px solid var(--border)" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: 14, borderRadius: 6,
          background: "rgba(243,237,225,0.06)",
          marginBottom: 10, width: `${WIDTHS[i % WIDTHS.length]}%`
        }} />
      ))}
    </div>
  );
}
```

---

## State Architecture

**Active tier + presenterMode must live at PotentialApp root:**

```jsx
// In PotentialApp.jsx, add to the top-level useState block:
const [tier, setTier] = useState("free");
const [presenterMode, setPresenterMode] = useState(false);
```

**Why PotentialApp, not a Context:**

The codebase currently uses zero React Context. All state is lifted and prop-drilled. The existing pattern is:
- `PotentialApp` holds `step`, `profile`, `results`, `selectedCity`, etc.
- Screens receive values as props.

Adding `tier` and `presenterMode` to PotentialApp follows this exact pattern. The only new consideration is that `<DemoTierSwitcher>` must render on top of every screen — this is achievable by rendering it conditionally at PotentialApp level, outside the `if (step === N)` screen switches:

```jsx
// PotentialApp render logic (after all the screen ifs):
return (
  <>
    {/* ...screen switch renders here... */}
    <DemoTierSwitcher tier={tier} onTier={setTier} visible={presenterMode} />
    <PricingModal open={modalOpen} onClose={closeModal} onTier={setTier} currentTier={tier} />
  </>
);
```

**Passing `tier` to screens:** Each screen receives `tier` as a prop. Screens that are not yet built get the `<LockGate>` wrapper regardless — the frosted skeleton is the fallback.

**A thin TierContext is a valid alternative** if prop-drilling through 5+ levels becomes painful. This is Claude's Discretion; the planner may choose either pattern. TierContext would match idiomatic React, but breaks the existing prop-drill idiom. Either is defensible.

---

## Responsive Design (D-13)

The 4-tier pricing modal is the hardest mobile case: 4 columns side-by-side breaks below ~480px.

Since inline-style JSX cannot use `@media` directly, the recommended approach is a scoped `<style>` tag inside the modal component (matches how `ResultsMap.jsx` handles media queries):

```jsx
// Inside PricingModal, above the JSX return:
<style>{`
  .pm-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .pm-testimonials { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  @media (max-width: 520px) {
    .pm-grid { grid-template-columns: 1fr; }
    .pm-testimonials { grid-template-columns: 1fr; }
    .pm-plus-card { order: -1; }  /* bump Plus to top on mobile */
  }
`}</style>
```

Existing mobile breakpoints in the codebase:
- `ResultsMap.jsx:74`: `@media(max-width:560px)` — adjusts font and padding
- `Landing.jsx:92`: `@media (prefers-reduced-motion: reduce)` — not a width breakpoint

The DemoTierSwitcher pill will need to shrink on small screens. Options: shorten labels to `Fr | Ba | + | ★`, or reduce font size + padding. Recommend the abbreviated-label approach.

---

## 16Personalities Analog Reference

Key mechanics from `NOTES.md` that directly map to Phase 8 decisions:

| 16Personalities Mechanic | Phase 8 Implementation | Note |
|---|---|---|
| Free results, premium sections locked/blurred with padlock + "Get the full report" | D-03: CSS blur + padlock + CTA | Exact mirror |
| "MOST POPULAR" badge on anchor tier | D-08: Plus badged "most popular" | Exact mirror |
| "Credits never expire · no commitment or subscription required" | D-10 microcopy | Exact mirror |
| Money-back guarantee ($29 premium tier) | D-10 says include it. **business-model.md:48 says do NOT.** | Conflict — see OQ-1 |
| Testimonials with disclosure framing | D-11: 3 testimonials + safeguard framing | Apply same "illustrative" framing |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.8 |
| Config file | `vite.config.js` (test block, jsdom environment) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| TIER-01, TIER-02 | `canAccess(active, required)` returns correct bool for all 16 tier pairs | unit | `npm test -- --grep "canAccess"` | Wave 0 |
| TIER-02 | Rank-gate: `showUpTo(results, tier)` returns correct N cities per tier | unit | `npm test -- --grep "rankGate"` | Wave 0 |
| TIER-01, TIER-03 | `<LockGate>` renders children when unlocked | component | `npm test -- --grep "LockGate unlocked"` | Wave 0 |
| TIER-01, TIER-03 | `<LockGate>` renders padlock + blur wrapper when locked | component | `npm test -- --grep "LockGate locked"` | Wave 0 |
| TIER-01, TIER-03 | `<LockGate>` renders FrostedSkeleton when locked and children is null | component | `npm test -- --grep "LockGate skeleton"` | Wave 0 |
| TIER-02 | `<DemoTierSwitcher>` does not render when presenterMode=false | component | `npm test -- --grep "DemoTierSwitcher"` | Wave 0 |
| D-06 | `<RunsBadge>` displays correct string per tier | component | `npm test -- --grep "RunsBadge"` | Wave 0 |

**Manual-only checkpoints:**
- Blur-dissolve animation smoothness on the actual demo device (D-09)
- Corner triple-tap gesture activates switcher (D-05)
- Pricing modal body-lock + responsive layout on mobile width (D-13)
- Blur + padlock render visually correct at each tier transition
- Full demo run: Free → Basic → Plus → Premium cycle in < 60 seconds (SC-4)

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + manual checklist passed before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `shared/tierGate.test.ts` — covers `canAccess` (16 tier-pair assertions) + `rankGate` (4 tier assertions)
- [ ] `tests/lock-gate.test.tsx` — LockGate renders children / renders padlock / renders FrostedSkeleton when children null
- [ ] `tests/demo-switcher.test.tsx` — DemoTierSwitcher visibility, tier selection
- [ ] `tests/runs-badge.test.tsx` — RunsBadge output per tier

---

## Security Domain

> `security_enforcement` is absent from `.planning/config.json` — absent = enabled. Section required.

### Applicable ASVS Categories

| ASVS Category | Applies | Rationale / Standard Control |
|---------------|---------|-------------------------------|
| V2 Authentication | No | No real auth in this phase. Tiers are in-memory UI state. No credentials are checked. |
| V3 Session Management | No | No sessions, no cookies, no persistence. Tier resets to "free" on page reload by design. |
| V4 Access Control | No | The gate is presentation-layer only — it hides/blurs UI, does not protect server resources. There are no server resources being gated. Real access control is v2-deferred. |
| V5 Input Validation | Partial | The only "input" is the tier switch (4 known string values) and the presenter gesture (tap count). Neither involves user-provided data that reaches a server. Validate that `setTier` only accepts values in the `Tier` union. |
| V6 Cryptography | No | No cryptographic operations. |
| V7 Error Handling | N/A | No network calls in this phase. |
| V8 Data Protection | No | No user data is collected, stored, or transmitted in this phase. |

### Security-by-Obscurity Acknowledgment (D-05)

The presenter mode is intentionally security-by-obscurity. The DemoTierSwitcher is hidden from judges by a corner triple-tap gesture known only to the presenter. This is **not real access control** — it is a demo UX device. There is nothing confidential behind the gate in this v1 implementation (no real payment data, no real user accounts, no real server authorization). The correct framing:

- Obscurity is appropriate here because the "protected" thing is a demo control panel, not sensitive data.
- If a judge stumbles on the gesture, they see tier controls — not a security breach.
- Document this clearly in phase notes so a future developer does not mistake it for a security boundary.

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Status |
|---------|--------|--------|
| Tier bypass (user opens DevTools and sets `window.__tier = "premium"`) | Elevation of Privilege | Acceptable for v1. This is a demo; there is no server resource being unlocked. A user bypassing the blur in DevTools sees blurred content unblurred — not a meaningful attack surface. |
| Presenter mode discovery | Information Disclosure | Low risk. Discovering the gesture reveals the DemoTierSwitcher, not secrets. |
| XSS via testimonial text | Tampering | Not applicable — testimonials are static hardcoded strings, not user input. |

**Overall security posture for Phase 8:** The phase has no attack surface that requires mitigation. It handles no user data, makes no network calls, and provides no server-side access control. All security work for real access control is deferred to v2 (real auth + payments).

---

## Environment Availability

**Step 2.6: SKIPPED — Phase 8 is a code-only change. No external tools, services, CLIs, runtimes, or databases beyond the existing local Vite dev server are required.**

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `backdrop-filter` for all blur effects | `filter: blur()` on content, `backdrop-filter` on glass panels | CSS spec evolution | Use the right property for the right use case |
| Keyboard-only secret gestures | Cross-device triple-tap corner gesture | Mobile-first era | Works for touch + mouse |

**No deprecated patterns apply here.** Phase 8 is fully greenfield with no migration from legacy code.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | FrostedSkeleton static line widths `[85,70,90,60]` are reasonable placeholders | Code Examples | Minor visual; low impact |
| A2 | `presenterMode` defaults to `false` (hidden) is the right UX for demo judges | State Architecture | If judges accidentally discover the gesture, not a real risk; low impact |
| A3 | "2 of 3 runs left" for Plus badge is the right illustrative value (mid-usage) | Runs Badge | Could show `3 of 3` instead; user preference |
| A4 | `pitch/qa-bank.md` still says "full financial snapshot for #1 city" for Basic — stale vs D-12 | Cross-doc conflicts | If qa-bank text is recited verbatim in rehearsal, it will contradict the demo that shows top-3 |

---

## Open Questions

### OQ-1 (DECISION-NEEDED — blocks modal-copy task): Money-back guarantee conflict

**What we know:** Phase 8 D-10 says modal must include "30-day money-back guarantee." `pitch/business-model.md:48` says **"No money-back guarantee at launch — Potential has elected not to include it."** The deck files (deck-outline.md, pitch-script.md, pitch-script-v2.md) do not mention money-back — they are neutral. qa-bank.md does not mention money-back.

**What's unclear:** Which decision wins — the Phase 8 context, or the Phase 9 business-model doc?

**Risk if unresolved:** Demo shows money-back guarantee. Judge asks "if I want a refund in 15 days, how do I get it?" The prepared Q&A says no. Credibility hit in a scored category.

**Options:**
- Option A: Add money-back guarantee. Update `pitch/business-model.md:48` and the Q&A bank to match. This is what 16Personalities does ($29 Premium with 30-day guarantee). Planner adds this as a doc-update task.
- Option B: Drop the money-back line from D-10. Modal shows "credits never expire · no subscription" only. Consistent with current business-model.md. Simpler.

**Recommendation:** Raise to user before the modal-copy task executes. The planner can write the task as "insert money-back copy here — pending OQ-1 resolution" rather than blocking the plan. The Pattern 6 code above already has the OQ-1 comment slot in place.

### OQ-2 (lower severity — stale doc): Basic tier description in qa-bank

**What we know:** D-12 = Basic unlocks top 3 cities. `pitch/qa-bank.md` still says "Basic $0.99: full financial snapshot for #1 city." ROADMAP and REQUIREMENTS were updated per D-12a per the CONTEXT, but qa-bank was not explicitly listed.

**What's unclear:** Whether qa-bank.md was updated or not (the CONTEXT says ROADMAP + REQUIREMENTS need updating, not qa-bank).

**Recommendation:** Planner includes a Wave 0 task to update `pitch/qa-bank.md` and `pitch/business-model.md` to reflect D-12 (top 3 cities for Basic). Low-risk but worth tracking so the verbal answer in Q&A matches the demo.

---

## Sources

### Primary (HIGH confidence)
- `shared/types.ts:204` — `Tier` union verified in codebase
- `src/screens/ResultsMap.jsx` — blur/panel/sticky-header CSS idioms verified
- `src/screens/Landing.jsx` — body scroll-lock, backdrop-filter panel, keydown gesture pattern verified
- `src/screens/PotentialApp.jsx` — step-based screen pattern, state architecture verified
- `.planning/phases/08-freemium-tier-gate/08-CONTEXT.md` — all decisions D-01 through D-13
- `.planning/research/competitors/16personalities/NOTES.md` — 16Personalities mechanic mapping
- `pitch/business-model.md` — pricing model and the "no money-back guarantee" decision
- `package.json` — confirmed dependency inventory (React 19, Vitest, @testing-library/react)
- `vite.config.js` — Vitest jsdom environment confirmed
- `.planning/config.json` — `security_enforcement` absent (treated as enabled); `nyquist_validation: true`

### Secondary (MEDIUM confidence)
- CSS `filter` vs `backdrop-filter` distinction — standard CSS specification [CITED: MDN, established spec]
- `will-change: filter` GPU optimization guidance — standard performance practice
- `prefers-reduced-motion` pattern — established accessibility pattern already honored in Landing.jsx
- ASVS V2–V8 applicability — derived from OWASP ASVS 4.0 category definitions applied to this phase's actual scope

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing packages, codebase verified
- Architecture: HIGH — existing patterns extrapolated; `TIER_FEATURES` matrix derived directly from D-01/D-02/D-12 decisions
- Pitfalls: HIGH — derived from direct codebase inspection (filter vs backdrop-filter, gesture scoping)
- Cross-doc conflicts: HIGH — both documents read directly; conflict is unambiguous
- Security domain: HIGH — ASVS categories confirmed not applicable; reasoning is directly from phase scope (no auth, no server, no user data)

**Research date:** 2026-06-05
**Valid until:** Phase competition date (stable codebase, no fast-moving dependencies)
