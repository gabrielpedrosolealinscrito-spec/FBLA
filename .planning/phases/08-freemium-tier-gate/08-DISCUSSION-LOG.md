# Phase 8: Freemium Tier Gate - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-05
**Phase:** 8-freemium-tier-gate
**Areas discussed:** Free teaser reveal, Lock/blur visual, DemoTierSwitcher, Runs + upsell UX, Tier transition feel, Trust/conversion badges, Basic tier edge cases, Demo device / responsive (+ hidden presenter mode)

---

## Free teaser reveal — what a free user sees

| Option | Description | Selected |
|--------|-------------|----------|
| Named city, locked why | Real #1 city name + match %, lock reasoning/financials/rest | ✓ |
| Blurred city, visible % | Show % but blur/redact city name | |
| City + teaser stat | Named city + one hook stat | |

**User's choice:** Named city, locked why
**Notes:** Strongest curiosity-per-pixel; concrete payoff visible, the "why + what it means for you" is the paywall.

## Free teaser — hinting the rest of the ranked list

| Option | Description | Selected |
|--------|-------------|----------|
| Blurred stack + count | Blurred stack of locked city cards + count ("11 more matched") | ✓ |
| Just a count line | Single text line, no blurred cards | |
| Ranks 2–3 blurred names | Tease #2/#3 as blurred rows | |

**User's choice:** Blurred stack + count

## Lock / blur visual treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Blurred real content + padlock | Render real content, CSS-blur, centered padlock + CTA (literal 16P) | ✓ |
| Frosted skeleton | Generic shimmer placeholder, no real data | |
| Blur + peek top edge | First row sharp, gradient-blur into lock | |

**User's choice:** Blurred real content + padlock
**Notes:** Most convincing — judges see real depth behind the gate. CONTEXT adds a frosted-skeleton fallback where Phase 2–7 screens aren't built yet.

## DemoTierSwitcher — form factor

| Option | Description | Selected |
|--------|-------------|----------|
| Floating segmented pill | Persistent 4-button pill, one tap re-renders | ✓ |
| Keyboard shortcut | Press 1–4, no visible control | |
| Top-bar dropdown | "Viewing as: Plus ▾" header menu | |

**User's choice:** Floating pill (after a clarification — user initially didn't understand the concept; explained it as a presenter prop to fake tier state with no real payments).
**Notes:** Later refined by the hidden-presenter-mode decision (see below) — pill stays the design but is hidden by default.

## Runs concept in the demo UI

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — visible runs badge | "Plus · 2 of 3 runs left" indicator | ✓ |
| No — pure feature unlock | Runs stay a deck concept only | |
| Static label only | "Plus — 3 runs" static, no live counter | |

**User's choice:** Yes — visible runs badge
**Notes:** Makes the never-expiring-credits pricing model tangible on stage; reinforces Phase 9 narrative.

## Upsell prompt placement

| Option | Description | Selected |
|--------|-------------|----------|
| Inline on each lock | Each padlock carries its own unlock message | |
| Click lock → pricing modal | Minimal inline padlock opens full 4-tier modal | ✓ |
| Both | Inline teaser + modal on click | |

**User's choice:** Click lock → pricing modal
**Notes:** One strong, deliberate conversion beat for a controlled demo.

## Tier transition feel

| Option | Description | Selected |
|--------|-------------|----------|
| Blur-dissolve | Blur-out→sharp as sections unlock, padlock fades | ✓ |
| Instant snap | No animation | |
| Slide/expand in | Sections slide/expand, push content down | |

**User's choice:** Blur-dissolve
**Notes:** Mirrors the lock metaphor; avoid layout-shifting animations on the battery demo device.

## Trust / conversion badges in pricing modal

| Option | Description | Selected |
|--------|-------------|----------|
| "Most popular" on Plus | Anchor badge on Plus | ✓ |
| 30-day money-back | Guarantee line | ✓ |
| Social proof line | Testimonial/stat | ✓ (expanded — see notes) |
| Runs-never-expire note | "Credits never expire · no subscription" microcopy | ✓ |

**User's choice:** All four; social proof expanded via free-text to **3 testimonial cards (5 stars + text review each)**.
**Notes:** Flagged the fabricated-testimonial Q&A risk; CONTEXT D-11 records a safeguard (use real beta quotes if gathered, or frame as illustrative).

## Basic tier edge cases — rest of ranked list

| Option | Description | Selected |
|--------|-------------|----------|
| Stays locked → upsell Plus | Only #1 unlocked, rest locked | |
| Full list, details locked | All city names visible, deeper details locked | |
| Top 3 cities | Top 3 revealed, rest locked | ✓ (free-text: "Top 3 but still upsell") |

**User's choice:** Top 3 unlocked, rest locked + Plus upsell (confirmed in follow-up).
**Notes:** ⚠ Revises ROADMAP success criterion 2 + REQUIREMENTS TIER-02 ("single best city" → "top 3"). A "run" = one full results generation, not one city. Flagged for roadmap/requirements update.

## Demo device / responsive target

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed laptop layout | One known resolution | |
| Responsive desktop+mobile | Full responsive | ✓ |
| Laptop + tablet | Two target sizes | |

**User's choice:** Responsive desktop+mobile
**Notes:** User wants robustness; planner should still pixel-verify the presenting device as primary.

## Presenter/demo control gating (raised via free-text "developer login" idea)

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden presenter mode | Controls hidden by default, revealed via secret gesture, no auth | ✓ |
| Always-visible pill | Pill on screen the whole demo | |
| Fake dev "login" screen | Cosmetic code/PIN gate | |

**User's choice:** Hidden presenter mode
**Notes:** User asked whether a real login should be a new phase. Routed: real auth/accounts are v2-deferred and out of Phase 8; the underlying need (hide dev controls from judges) is met by a no-auth hidden presenter mode.

---

## Claude's Discretion

- Exact secret gesture for hidden presenter mode (keyboard chord vs corner triple-click).
- Blur radius / padlock iconography / pricing-modal layout, within the existing dark theme.

## Deferred Ideas

- **Real login / accounts ("developer login"):** routed to no-auth hidden presenter mode; real auth is v2-deferred, own phase if revived.
- **Live content editing on stage** (dev panel to change cities/numbers): rejected for v1 — fixed golden path preferred; future admin/CMS capability only.
