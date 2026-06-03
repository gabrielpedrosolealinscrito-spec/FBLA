# Phase 2: Design Inspiration & Direction

**Captured:** 2026-05-30
**Status:** Design DNA locked with Gabriel — feeds `/gsd:ui-phase 2` (UI-SPEC) and any sketch pass.
**Source:** Live inspiration session (Gabriel-supplied references + answered design forks).

---

## Direction (locked decisions)

- **DD-01 — Aesthetic: Hybrid pixel-accent indie.** Pixel art is the *signature layer* (icons, hero sprites, decorative chrome, loaders, demo moments) over a **clean bold layout with readable body type**. NOT full 8/16-bit everything — readability on mobile stays priority one. The goal Gabriel stated: "move as far away from boring / AI-looking as possible, even if it means more steps."
- **DD-02 — Identity scope: project-wide design system, quiz-first build.** The indie identity applies across the small product surface (landing page, pricing, newsletter, quiz). **Phase 2 builds the quiz only.** Landing/pricing/newsletter are a separate lightweight phase; this doc defines the shared system so they stay coherent later.
- **DD-03 — This supersedes the Phase 1 "port the dark theme as-is" lock.** Phase 1 locked porting the existing inline-style dark theme unchanged. Gabriel is intentionally pushing the visual identity further. The existing dark tokens (`#08090C` bg, mint `#6EE7B7` / amber `#FBBF24` / indigo `#818CF8` accents, Instrument Serif + Manrope) are a *starting palette*, not a constraint — ui-phase decides whether the indie-pixel system stays dark or shifts brighter (see Open Questions).
- **DD-04 — No emojis. Pixel-art icons instead.** Every place the prototype would reach for an emoji uses a curated pixel-art glyph (see Asset Stack).
- **DD-05 — No dead empty backgrounds.** Backgrounds carry texture/motion: tiled pixel patterns, dithering, subtle starfield/parallax, decorative idle sprites in margins. Imagery and animation are load-bearing, not decoration-as-afterthought.
- **DD-06 — Asset sourcing: mix.** Free sets (pixelarticons + Kenney) for utility icons/UI chrome; **3-5 custom hero sprites** authored for the demo moments (archetype/result reveal, "Going Global" moment, tension fork, loader).

## Anti-references (what we are deliberately avoiding)

- The generic "AI SaaS quiz" look: centered card on a flat gradient, lots of whitespace, emoji bullets, default system font, Inter + a blurry blob.
- Emojis as iconography.
- Empty flat backgrounds.
- Anything that reads as a template the judges have seen 50 times.

---

## Reference sites & what to take from each

| Site | What Gabriel flagged | Design DNA to extract |
|------|----------------------|------------------------|
| **getindigo.ai** (primary) | "very good, indie type of UI" | Bold, characterful, illustration-rich, anti-corporate energy, confident type, color used fearlessly, density (no dead space). NOTE: getindigo is *illustrated/characterful*, not literally pixelated — we take its **energy and density**, and express it through pixel craft. |
| **smithrobinson.org** | animation / integration | Motion-forward, playful interaction, personality over polish-for-polish's-sake. |
| **wizardshock.xyz** | animation / integration | Indie/retro game energy, expressive transitions. |
| **rudolf.eightarms.co.uk** | animation / integration | Creative-studio craft: scroll-driven motion, layered composition, micro-interactions. |

**Common thread:** richly animated, image-dense, full of character — the opposite of a sterile form. These are the *feel* targets for the quiz's motion and composition.

---

## Asset Stack (verified, with licenses)

### Pixel icons — replace all emojis
- **Pixelarticons** — 800 free handcrafted pixel icons, **MIT licensed**, drawn on a strict 24×24 grid, `fill="currentColor"` (recolorable). Ships as React components (`import { Heart } from 'pixelarticons/react'`), raw SVG, CDN, or webfont. Tree-shakeable. This is the primary emoji-replacement set.
  - npm: https://www.npmjs.com/package/pixelarticons · browse: https://pixelarticons.com/ · repo: https://github.com/halfmage/pixelarticons
- **Kenney Pixel UI Pack** — 750 assets, **CC0** (no attribution), UI chrome: buttons, panels, frames, cursors, progress elements. https://kenney.nl/assets/pixel-ui-pack
- **Kenney Game Assets All-in-1** — 60k+ CC0 assets if we need more breadth. https://kenney.itch.io/kenney-game-assets

### Broader pixel art (custom hero sprite reference + fillers)
- itch.io pixel-art / UI tag (check per-pack license; many CC0): https://itch.io/game-assets/free/tag-pixel-art/tag-user-interface · CC0 filter: https://itch.io/game-assets/assets-cc0

### Custom hero sprites (3-5, authored)
Candidates for the demo moments:
1. **Archetype / result reveal** — a signature sprite for the user's outcome.
2. **"Going Global" sprite** — globe / passport / plane motif for the international demo moment (D-06).
3. **Tension fork** — a "two paths" sprite for the reconciling follow-up (D-14).
4. **Loader / between-question idle** — a small animated sprite (CSS `steps()` spritesheet).
5. (optional) **Quiz mascot** — a recurring character that gives the flow personality.
Author in Aseprite/Piskel; export spritesheets; animate with CSS `steps()`.

### Type
- **Body / UI:** keep **Manrope** (already loaded) for readable body — pixel fonts are unreadable at body size.
- **Display / accent:** a pixel display face for headers, the result reveal, section markers. Options: Press Start 2P, Silkscreen, **Pixelify Sans**, VT323 (all Google Fonts). Pixelify Sans is the most readable of the four.
- Decide in ui-phase whether Instrument Serif survives or the pixel display face replaces it.

### Motion
- **Framer Motion** (recommended in 02-RESEARCH.md) for direction-aware card transitions (slide left on Continue, right on Back) via `AnimatePresence` + `custom` prop. Single install, no config.
- Sprite idle/looping animation via CSS `steps()` spritesheets.
- Scroll-reveal + parallax for the landing page (later phase).

### Palettes (for a cohesive limited pixel palette)
- Lospec Palette List — https://lospec.com/palette-list (lock a limited palette so pixel + UI feel cohesive).

---

## Resolved by approved sketch (`sketches/quiz-card.html`, approved 2026-05-30)

Gabriel reviewed a live mockup of one quiz card and approved it ("perfect, I LIKE this"). The sketch is the **visual contract** — ui-phase derives the UI-SPEC from it.

1. **Dark vs bright → DARK base, locked.** Keep `#08090C` bg + mint `#6EE7B7` primary / amber `#FBBF24` (current step, CTA-adjacent) / indigo `#818CF8` (adaptive/tension moments). Dot-grid + scanline background texture (DD-05).
2. **Pixel chrome level → hybrid, approved.** Clean cards with **pixel icons on every option** + chunky pixel CTA (press-down shadow) + segmented pixel progress + blinking cursor block. NOT full pixel-frame borders on every card — the approved level is "pixel accents on a clean dark layout." (Can push harder later if desired; current level is the lock.)
3. **Type → locked.** Display = **Pixelify Sans** (prompt, kicker, step counter, CTA). Body/options = **Manrope** (readability). Instrument Serif retired from the quiz in favor of the pixel display face.
4. **Tension callout → keep prominent.** The indigo "these priorities pull apart — next we'll break the tie" callout is the visible adaptive/"real logic" pitch moment (D-14). Approved at sketch prominence.
5. **Icons → pixelarticons (MIT) in production**, swapping the hand-built sketch SVGs. Custom hero sprites still authored for demo moments (DD-06).
6. **Motion → Framer Motion** for direction-aware card slides (L on Continue, R on Back) + CSS `steps()` sprite idle loop. Static in sketch; animated in build.

### Still open (minor — ui-phase decides)
- **Mascot or no mascot?** A recurring pixel character adds pitch memorability vs custom-art cost. Not blocking; the corner idle sprite in the sketch is a lightweight stand-in.

---

## Build-scope guardrail (do not let this leak into Phase 2 planning)

- **Phase 2 = quiz + profile capture only** (QUIZ-01..05). The pixel-art quiz UI, adaptive flow, profile synthesis, `shared/types.ts` extension.
- **Landing page, pricing, newsletter = separate later phase.** They inherit this design system but are NOT Phase 2 deliverables. Capture as a scope note so the planner doesn't pull them in.

---

*Phase: 02-quiz-profile-capture*
*Design inspiration captured: 2026-05-30 via live session with Gabriel*
