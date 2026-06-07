// src/components/Compass.jsx
// THE brand compass mark — antique 4-point gold rose + 24-tick bezel, in two
// counter-rotating layers. Single source of truth for the motif (README §6):
// the loader (CompassLoader), the login mark, and the pricing watermark all
// render THIS, so the app shows one compass everywhere instead of divergent
// per-screen drawings.
//
// Props:
//   size         px (number)      — rendered square size (default 64)
//   spin         bool             — rotate the layers (default true)
//   tickDur      seconds (number) — tick-ring period, clockwise (default 9)
//   starDur      seconds (number) — star period, counter-clockwise (default 5)
//   reduceMotion bool             — force-stop animation (a11y; OS pref also honored)
//   className    string           — extra class on the wrapper span
//
// Gold values are HARDCODED — consumers mount inside differently-scoped style
// trees, so the mark must never inherit a host scope's var(--accent).

const GOLD = "#e2b56b";
const GOLD_SOFT = "rgba(226,181,107,.55)";
const GOLD_FAINT = "rgba(226,181,107,.4)";
const STAR_DIM = "rgba(226,181,107,.5)";

export default function Compass({
  size = 64,
  spin = true,
  tickDur = 9,
  starDur = 5,
  reduceMotion = false,
  className = "",
}) {
  const animate = spin && !reduceMotion;
  // NOTE: position is set via the .cmp class (NOT inline) so a consumer can
  // override it — e.g. Pricing's `.pp .compass{position:absolute}` watermark.
  // An inline position:relative here would win over that class and break it.
  const wrap = { width: size, height: size, lineHeight: 0, display: "inline-block", flex: "none" };
  const layer = { position: "absolute", inset: 0 };
  const svgBase = { width: "100%", height: "100%", display: "block", overflow: "visible", transformOrigin: "50% 50%" };

  return (
    <span className={`cmp ${className}`.trim()} aria-hidden="true" style={wrap}>
      <style>{`
        .cmp{position:relative}
        @keyframes cmpCW{to{transform:rotate(360deg)}}
        @keyframes cmpCCW{to{transform:rotate(-360deg)}}
        @media (prefers-reduced-motion:reduce){.cmp svg{animation:none!important}}
      `}</style>

      {/* Tick-ring layer */}
      <span style={layer}>
        <svg viewBox="0 0 40 40" style={{ ...svgBase, animation: animate ? `cmpCW ${tickDur}s linear infinite` : "none" }}>
          <circle cx="20" cy="20" r="18" fill="none" stroke={GOLD_FAINT} strokeWidth="1" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * Math.PI) / 12;
            const r1 = i % 6 === 0 ? 12 : 15;
            const r2 = 18;
            return (
              <line key={i}
                x1={20 + Math.sin(a) * r1} y1={20 - Math.cos(a) * r1}
                x2={20 + Math.sin(a) * r2} y2={20 - Math.cos(a) * r2}
                stroke={GOLD_SOFT} strokeWidth="1" />
            );
          })}
        </svg>
      </span>

      {/* 4-point star rose (north solid gold, others dim) */}
      <span style={layer}>
        <svg viewBox="0 0 40 40" style={{ ...svgBase, animation: animate ? `cmpCCW ${starDur}s linear infinite` : "none" }}>
          {[0, 90, 180, 270].map((deg) => {
            const a = (deg * Math.PI) / 180;
            const tx = 20 + Math.sin(a) * 13, ty = 20 - Math.cos(a) * 13;
            const lx = 20 + Math.cos(a) * 4, ly = 20 + Math.sin(a) * 4;
            const rx = 20 - Math.cos(a) * 4, ry = 20 - Math.sin(a) * 4;
            return <path key={deg} d={`M${lx} ${ly} L${tx} ${ty} L${rx} ${ry} Z`} fill={deg === 0 ? GOLD : STAR_DIM} />;
          })}
          <circle cx="20" cy="20" r="2.4" fill={GOLD} />
        </svg>
      </span>
    </span>
  );
}
