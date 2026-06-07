import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// COMPASS LOADER — the brand loading state (a slowly rotating antique
// compass rose), replacing any numeric/spinner loader. Self-contained:
// it carries its own type + gold values and its own reduced-motion check,
// because it is mounted as a *sibling* of screens that scope their styles
// (e.g. Landing's `.lp` tree), so it inherits none of their CSS vars and
// is not reached by their scoped `prefers-reduced-motion` rules.
//
// The compass SVG mirrors the antique rose in `ResultsMap.jsx` (which keeps
// its own copy — that file is owned by another package; de-dup later).
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
          --cl-gold:#e2b56b;--cl-gold-soft:rgba(226,181,107,.55);--cl-gold-faint:rgba(226,181,107,.4)}
        .cl-full{position:fixed;inset:0;z-index:9999;background:#070a11;
          transition:opacity 1.1s cubic-bezier(.22,.61,.36,1)}
        .cl-hide{opacity:0;pointer-events:none}
        .cl-disc{position:relative;width:128px;height:128px;line-height:0}
        .cl-layer{position:absolute;inset:0}
        .cl-layer>svg{width:100%;height:100%;display:block;overflow:visible}
        @keyframes clTicks{to{transform:rotate(360deg)}}
        @keyframes clStar{to{transform:rotate(-360deg)}}
        @keyframes clBreathe{0%,100%{opacity:.35}50%{opacity:.75}}
        .cl-ticks{animation:clTicks 9s linear infinite;transform-origin:50% 50%}
        .cl-star{animation:clStar 5s linear infinite;transform-origin:50% 50%}
        .cl-cap{font-size:15px;letter-spacing:.18em;text-transform:uppercase;
          color:var(--cl-gold-soft);animation:clBreathe 3s ease-in-out infinite}
        /* reduced motion: no rotation, no breathing — honoured via prop OR OS pref */
        .cl-still .cl-ticks,.cl-still .cl-star,.cl-still .cl-cap{animation:none}
        @media (prefers-reduced-motion:reduce){
          .cl-ticks,.cl-star,.cl-cap{animation:none}
        }
      `}</style>

      <span className="cl-disc" aria-hidden="true">
        <span className="cl-layer cl-ticks">
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="none" stroke="var(--cl-gold-faint)" strokeWidth="1" />
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i * Math.PI) / 12;
              const r1 = i % 6 === 0 ? 12 : 15;
              const r2 = 18;
              return (
                <line
                  key={i}
                  x1={20 + Math.sin(a) * r1}
                  y1={20 - Math.cos(a) * r1}
                  x2={20 + Math.sin(a) * r2}
                  y2={20 - Math.cos(a) * r2}
                  stroke="var(--cl-gold-soft)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </span>
        <span className="cl-layer cl-star">
          <svg viewBox="0 0 40 40">
            {[0, 90, 180, 270].map((deg) => {
              const a = (deg * Math.PI) / 180;
              const tx = 20 + Math.sin(a) * 13;
              const ty = 20 - Math.cos(a) * 13;
              const lx = 20 + Math.cos(a) * 4;
              const ly = 20 + Math.sin(a) * 4;
              const rx = 20 - Math.cos(a) * 4;
              const ry = 20 - Math.sin(a) * 4;
              return (
                <path
                  key={deg}
                  d={`M${lx} ${ly} L${tx} ${ty} L${rx} ${ry} Z`}
                  fill={deg === 0 ? "var(--cl-gold)" : "rgba(226,181,107,.5)"}
                />
              );
            })}
            <circle cx="20" cy="20" r="2.4" fill="var(--cl-gold)" />
          </svg>
        </span>
      </span>

      {label ? <div className="cl-cap">{label}</div> : null}
    </div>
  );
}
