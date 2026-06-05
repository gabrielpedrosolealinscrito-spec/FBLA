# Potential — Brand Kit

> **See where your life could look like — somewhere else.**
> A relocation compass for people entering adulthood: match, money, and a roadmap to get there.

Open **[`brand-kit.html`](./brand-kit.html)** for the full interactive guidelines (logo, color, type, voice, campaign). Everything else here is the raw material.

---

## Where this lives in the repo

This is the **brand track** — logo, color, type, voice, and the social campaign. It's the visual
counterpart to `pitch/` (the business case) and the source of truth for how the product and deck look.
The folder is self-contained: every file links relatively, so it runs from `brand/` with no build step.

Add it to the repo's folder map (`STRUCTURE.md` and `README.md`):

```
├── brand/       BRAND track     — logo, color, type, voice, social campaign (self-contained, no build)
```

| Folder | What |
|--------|------|
| `brand/` | Brand — logo, color, type, voice + 1080×1080 social posts |

---

## The idea

**A compass.** Find your bearing toward the life that fits — and the steps to reach it. The mark is a
gold compass rose set in an interlocking-circle rosette; it turns slowly wherever motion is possible.
The palette is night→dawn (deep blue-black giving way to gold). The feeling is
**calm, cinematic, certain** — a quiet promise, never a sales pitch.

---

## Colors  ·  `colors.css`

| Token | Hex | Use |
|---|---|---|
| Night 900 | `#050710` | full-bleed canvas |
| Night 800 | `#070A11` | primary background |
| Night 700 | `#0D1119` | surface |
| Night 600 | `#141B27` | card / panel |
| **Gold 500** | **`#E2B56B`** | **THE brand accent** |
| Gold 300 | `#EFD2A0` | highlight |
| Gold 600 / 700 | `#D2A45A` / `#CAA05A` | pressed / dawn glow |
| Amber Deep→Lit | `#3A2C1D` → `#8A5E2E` | dawn-gradient mids |
| Ivory | `#F3EDE1` | text on night |
| Positive / Negative | `#8FD6A8` / `#E0816A` | savings / deficit |

`colors.css` ships every token as a CSS variable plus the signature `--grad-dawn` / `--grad-night`
gradients — `<link>` it into anything.

## Type

- **Instrument Serif** — display, the wordmark, big emotional lines (italic for accent words)
- **Manrope** — body, UI, buttons, captions (400–700)
- **JetBrains Mono** — numbers, money, match scores, kicker labels (UPPERCASE + wide tracking)

## Voice in one line

Warm not hype · concrete over abstract · honest about money · a compass, not a cheerleader.
We say *"See your top match in 4 minutes."* We never say *"Unlock your DREAM life now!!!"*

---

## Assets  ·  `assets/`

| File | What |
|---|---|
| `compass.svg` | the compass mark — gold rose + rosette ring (static file) |
| `app-icon.svg` | 1024 app icon — compass on a night squircle |
| `compass.js` + `compass.css` | inline **spinning** compass for web (see below) |

**Using the animated mark on the web:** include `compass.css` + `compass.js`, then drop
`<span class="compass" data-compass="120"></span>` (number = pixel size). It renders the compass and
spins it (rosette + star counter-rotate; reduced-motion users see it still). `compass.svg` is the flat
file for places that can't run it (favicons, print, social avatars).

**Clear space:** at least the width of the outer ring on every side. **Pairings:** gold on night, or
gold on ivory — nothing else. Never recolor, stretch, skew, or shadow the mark; keep the spin slow.

---

## Campaign  ·  `posts/`  (1080×1080)

Drop-in caption copy for each:

1. **`01-launch.html` — Launch teaser**
   *Where should you actually live? We're building the compass. Join the waitlist — link in bio. #Potential*
2. **`02-reframe.html` — Reframe hook**
   *You chose your career, your friends, your whole life. The one thing most people never choose? The place. Potential helps you choose it.*
3. **`03-howitworks.html` — How it works**
   *Profile → Match → Roadmap. Three steps from "I think I want to leave" to a real plan — visa included. Free to start.*
4. **`04-match.html` — Match teaser**
   *Sample result: Lisbon, 94% match. $4,120 take-home, $1,180 rent, +$1,540 left to save every month. What would yours say?*
5. **`05-pricing.html` — Pricing**
   *Pay once, move forever. Runs are credits that never expire — no subscription, ever. Start free and see your match before you pay a cent.*

**Exporting a post to an image:** open the post file, screenshot at 1080×1080 (or print → PDF). Each
file auto-scales to any viewport and is print/screenshot-ready.

**Suggested launch order:** 01 → 02 → 03 → 04 → 05, ~2–3 days apart, building from emotional hook to
product to offer.

---

*Brand Kit v1.0 · 2026 · derived from the Potential product (fbla-ruddy.vercel.app).*
