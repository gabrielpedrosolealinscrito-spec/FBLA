import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════════
// NavBar — shared top navigation (package 01, README §4 — CANONICAL).
//
// Supersedes the package-02 parallel-dev stub. Kept its fixed-overlay
// behavior on purpose: package 02 already mounts <NavBar transparent /> on
// Landing expecting the bar to fix itself to the top of the viewport, so this
// canonical version stays position:fixed to keep that integration working.
//
// FROZEN PROPS (do not change):
//   <NavBar links={[{ label, href }]} transparent />
//   • links       — [{ label, href }]; href uses the hash-route pattern
//                   (#/about …). Defaults to About / FAQ / Pricing / Login.
//   • transparent — true  → no background (overlay on a hero — 02's case).
//                   false → solid blurred near-black bar with a hairline rule.
//
// NOTE for marketing pages that mount this: the bar is fixed, so give page
// content top padding (~84px) so it isn't hidden underneath.
//
// Brand: Instrument Serif wordmark, Manrope caps links, gold on near-black,
// line style, no emojis.
// ═══════════════════════════════════════════════════════════════

const DEFAULT_LINKS = [
  { label: "About", href: "#/about" },
  { label: "FAQ", href: "#/faq" },
  { label: "Pricing", href: "#/pricing" },
  { label: "Login", href: "#/login" },
];

export default function NavBar({ links = DEFAULT_LINKS, transparent = false }) {
  // Track the live hash so the matching link gets the .active treatment.
  const [hash, setHash] = useState(typeof window !== "undefined" ? window.location.hash : "");
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const goHome = (e) => { e.preventDefault(); window.location.hash = ""; };

  return (
    <nav className={`nbx${transparent ? " nbx-transparent" : ""}`} aria-label="Primary">
      <style>{`
        .nbx{position:fixed;top:0;left:0;right:0;z-index:1000;
          display:flex;align-items:center;justify-content:space-between;
          padding:22px clamp(20px,5vw,48px);
          font-family:'Manrope',sans-serif;color:#f3ede1;
          background:rgba(7,10,17,.72);backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(243,237,225,.08);
          transition:background .4s cubic-bezier(.22,.61,.36,1)}
        .nbx-transparent{background:transparent;backdrop-filter:none;border-bottom-color:transparent}
        .nbx-brand{font-family:'Instrument Serif',serif;font-size:24px;
          letter-spacing:.5px;color:#f3ede1;text-decoration:none;opacity:.92;line-height:1;
          background:none;border:none;cursor:pointer;padding:0}
        .nbx-brand small{font-style:italic;opacity:.6;font-size:14px;margin-left:2px}
        .nbx-links{display:flex;align-items:center;gap:clamp(16px,3vw,34px)}
        .nbx-link{font-size:12.5px;letter-spacing:.18em;text-transform:uppercase;
          color:rgba(243,237,225,.62);text-decoration:none;font-weight:500;
          transition:color .3s cubic-bezier(.22,.61,.36,1)}
        .nbx-link:hover{color:#e2b56b}
        .nbx-link.active{color:#d2a45a}
        @media (max-width:560px){
          .nbx-links{gap:16px}
          .nbx-link{font-size:11px;letter-spacing:.12em}
        }
      `}</style>
      <button className="nbx-brand" onClick={goHome} aria-label="Potential home">
        Potential <small>°</small>
      </button>
      <div className="nbx-links">
        {links.map((l) => {
          const active = l.href && l.href !== "#" && hash.startsWith(l.href);
          return (
            <a key={l.href || l.label} className={`nbx-link${active ? " active" : ""}`} href={l.href}>
              {l.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
