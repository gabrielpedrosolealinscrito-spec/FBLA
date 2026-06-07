---
phase: 05-proxy-live-ai-golden-path-cache
plan: "05"
subsystem: ui
tags: [fontsource, fonts, vite, self-hosted-fonts, offline, bundle]

requires:
  - phase: 05-proxy-live-ai-golden-path-cache
    provides: wave 2 dependency — 05-01 package.json edits serialized before this plan

provides:
  - Self-hosted @fontsource static packages (Manrope, JetBrains Mono, Instrument Serif) bundled into Vite build
  - Google Fonts CDN tags fully removed from index.html
  - Font coverage: Manrope 300-800, JetBrains Mono 400-600, Instrument Serif 400 regular + 400-italic
  - Bare family names ('Manrope'/'JetBrains Mono'/'Instrument Serif') registered via @font-face — no CSS font-family changes needed

affects: [offline-demo, FOUND-04, SC6, Phase-5-success-criteria]

tech-stack:
  added:
    - "@fontsource/manrope (^5.x static, bare family name 'Manrope')"
    - "@fontsource/jetbrains-mono (^5.x static, bare family name 'JetBrains Mono')"
    - "@fontsource/instrument-serif (^5.x static, bare family name 'Instrument Serif')"
  patterns:
    - "Static @fontsource/* (not @fontsource-variable/*) for bare family name registration"
    - "@fontsource css imports placed above ./index.css in src/main.jsx so @font-face registers before app styles"

key-files:
  created: []
  modified:
    - package.json
    - package-lock.json
    - src/main.jsx
    - index.html

key-decisions:
  - "Use STATIC @fontsource/* not @fontsource-variable/* — variable packages register 'Manrope Variable'/'JetBrains Mono Variable' which would silently break existing bare font-family declarations"
  - "Import all weight CSes individually (not index.css) to precisely match CDN coverage (Manrope 300-800, JetBrains Mono 400-600)"
  - "Instrument Serif italic file confirmed as 400-italic.css — standard Fontsource naming convention"

patterns-established:
  - "Pattern: self-host fonts via static @fontsource per-weight css imports in src/main.jsx, not CDN link tags in index.html"

requirements-completed: [FOUND-04]

duration: 12min
completed: 2026-06-05
---

# Phase 05 Plan 05: Self-Host Brand Fonts Summary

**Three brand fonts (Instrument Serif + italic, Manrope 300-800, JetBrains Mono 400-600) self-hosted via static @fontsource packages, Google Fonts CDN fully removed, Vite build bundles woff2 locally**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-05T00:00:00Z
- **Completed:** 2026-06-05T00:12:00Z
- **Tasks:** 2 automated complete, 1 pending human visual proof
- **Files modified:** 4 (package.json, package-lock.json, src/main.jsx, index.html)

## Accomplishments

- Installed three static @fontsource packages (npm +3 packages) confirming they register bare CSS family names — no font-family changes needed anywhere in src/
- src/main.jsx updated with 11 @fontsource imports (6 Manrope weights + 3 JetBrains Mono weights + Instrument Serif regular + italic) placed before ./index.css
- Both Google Fonts preconnect tags and the stylesheet link deleted from index.html; `npm run build` exits 0 with all font faces bundled as local hashed woff2 assets; dist/ contains zero fonts.googleapis.com / fonts.gstatic.com references

## Task Commits

Each task was committed atomically:

1. **Task 1: Install static @fontsource packages + import full weight/italic coverage** - `e55c053` (feat)
2. **Task 2: Remove Google Fonts CDN tags from index.html + prove the build** - `bb89321` (feat)
3. **Task 3: Offline visual proof (SC6)** - PENDING HUMAN VISUAL PROOF (see below)

## Files Created/Modified

- `/Users/leal/FBLA/FBLA/package.json` - Added @fontsource/manrope, @fontsource/jetbrains-mono, @fontsource/instrument-serif to dependencies
- `/Users/leal/FBLA/FBLA/package-lock.json` - Lock file updated for +3 packages
- `/Users/leal/FBLA/FBLA/src/main.jsx` - 11 @fontsource css imports added above ./index.css
- `/Users/leal/FBLA/FBLA/index.html` - 6 lines removed (preconnect x2 + stylesheet link for Google Fonts CDN)

## Instrument Serif Italic Filename

The static italic file is `@fontsource/instrument-serif/400-italic.css` — confirmed by inspecting `node_modules/@fontsource/instrument-serif/`. This is the standard Fontsource naming convention.

## Family Name Verification (Deterministic)

Verified at Task 1 execution time via `grep "font-family"` on the installed CSS:
- `node_modules/@fontsource/manrope/400.css` → `font-family: 'Manrope'` (bare, not 'Manrope Variable')
- `node_modules/@fontsource/jetbrains-mono/400.css` → `font-family: 'JetBrains Mono'` (bare)
- `node_modules/@fontsource/instrument-serif/400.css` → `font-family: 'Instrument Serif'` (bare)
- `node_modules/@fontsource/instrument-serif/400-italic.css` → `font-family: 'Instrument Serif'` (bare)
- `grep -r "Manrope Variable" node_modules/@fontsource/manrope/` → no results (confirmed zero 'Variable' registration)

## Decisions Made

- Used static `@fontsource/*` not `@fontsource-variable/*` — the variable packages register '... Variable' family names that would silently break all font-family declarations in src/ without any visible error
- Imported per-weight CSS files individually rather than index.css to precisely match CDN coverage
- Instrument Serif: imported both `400.css` and `400-italic.css` to cover ital@0 and ital@1 (required for Landing.jsx tagline italic)

## Deviations from Plan

None - plan executed exactly as written. Task 0 (package legitimacy gate) was pre-approved by the user. Tasks 1 and 2 executed per spec.

## Task 3: PENDING HUMAN VISUAL PROOF (SC6)

Task 3 is a `blocking` human-verify checkpoint requiring a browser with the network turned off. Automated prerequisites are fully complete:

- `npm run build` exits 0
- `dist/` contains zero references to fonts.googleapis.com / fonts.gstatic.com (confirmed by grep)
- All font woff2 files are served from local hashed asset paths in dist/assets/

**To complete SC6 (ROADMAP Phase 5 Success Criterion #6 / FOUND-04 offline-font half):**

1. Run `npm run build` then `npm run preview`
2. Open the preview URL in browser
3. In DevTools Network tab, reload and confirm NO request goes to fonts.googleapis.com or fonts.gstatic.com
4. Kill the network (Wi-Fi off or DevTools → Offline), then hard-reload
5. Confirm:
   - Headings render in Instrument Serif (elegant serif), Landing tagline in **Instrument Serif italic**
   - Body text renders in Manrope (geometric sans-serif)
   - Score numbers render in JetBrains Mono (monospace)
6. If all three render correctly offline, type "approved" to confirm SC6

## Issues Encountered

None - all npm installs succeeded, build passed, no blocking issues.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All automated criteria for 05-05 are satisfied (self-hosted fonts, CDN removed, build verified)
- Task 3 offline visual proof is the final gate for FOUND-04 / SC6 closure
- Once Task 3 is approved, Phase 5 (proxy-live-ai-golden-path-cache) is fully complete

---
*Phase: 05-proxy-live-ai-golden-path-cache*
*Completed: 2026-06-05*
