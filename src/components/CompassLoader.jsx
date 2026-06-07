import { useState } from "react";
import Compass from "./Compass.jsx";

// ═══════════════════════════════════════════════════════════════
// COMPASS LOADER — the brand loading state (the rotating brand compass),
// replacing any numeric/spinner loader. The compass itself now comes from the
// shared <Compass> component (single source of truth, README §6); this file
// only adds the loader chrome (fullscreen backdrop, fade-out, caption) and its
// own reduced-motion check, because it is mounted as a *sibling* of screens
// that scope their styles (e.g. Landing's `.lp` tree) and inherits none of
// their CSS vars or scoped `prefers-reduced-motion` rules.
//
// (ResultsMap.jsx still keeps its own small inline copy — that file is owned by
// another package; fold it onto <Compass> when it's next touched.)
// ═══════════════════════════════════════════════════════════════

// Resolve once at module load: respect the OS reduced-motion setting even
// before package 03's `useA11y()` exists. Pass `reduceMotion` to override.
const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CompassLoader({
  reduceMotion,
  hiding = false,
  label = "Charting your potential",
  fullscreen = true,
}) {
  // prop wins when provided (future useA11y wiring); else fall back to OS pref.
  const [still] = useState(reduceMotion ?? prefersReduced);
  const motion = reduceMotion ?? still;

  return (
    <div
      className={`cl${fullscreen ? " cl-full" : ""}${hiding ? " cl-hide" : ""}${motion ? " cl-still" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <style>{`
        .cl{display:grid;place-items:center;gap:30px;color:#e2b56b;
          font-family:'Instrument Serif',serif;
          --cl-gold-soft:rgba(226,181,107,.55)}
        .cl-full{position:fixed;inset:0;z-index:9999;background:#070a11;
          transition:opacity 1.1s cubic-bezier(.22,.61,.36,1)}
        .cl-hide{opacity:0;pointer-events:none}
        @keyframes clBreathe{0%,100%{opacity:.35}50%{opacity:.75}}
        .cl-cap{font-size:15px;letter-spacing:.18em;text-transform:uppercase;
          color:var(--cl-gold-soft);animation:clBreathe 3s ease-in-out infinite}
        /* reduced motion: no breathing — honoured via prop OR OS pref (compass handles its own) */
        .cl-still .cl-cap{animation:none}
        @media (prefers-reduced-motion:reduce){.cl-cap{animation:none}}
      `}</style>

      <Compass size={128} tickDur={9} starDur={5} reduceMotion={!!motion} />

      {label ? <div className="cl-cap">{label}</div> : null}
    </div>
  );
}
