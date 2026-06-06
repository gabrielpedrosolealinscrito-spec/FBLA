import { useState, useEffect } from "react";
import { canAccess } from "../../shared/types";

// ═══════════════════════════════════════════════════════════════
// FrostedSkeleton — placeholder for unbuilt sections (visa, why).
// Gold card chrome: hardcode literals — do NOT inherit var(--card)
// (PotentialApp's green host scope → #171B22, wrong color).
// ═══════════════════════════════════════════════════════════════
function FrostedSkeleton() {
  const WIDTHS = [85, 70, 90, 60]; // static — no re-render flicker
  return (
    <div style={{
      padding: 24,
      borderRadius: 14,
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(243,237,225,.12)"
    }}>
      {WIDTHS.map((w, i) => (
        <div key={i} style={{
          height: 14,
          borderRadius: 6,
          background: "rgba(243,237,225,0.06)",
          marginBottom: 10,
          width: `${w}%`
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LockGate — dual-mode blur/padlock gate.
//
// Props:
//   tier         — active user tier ("free"|"basic"|"plus"|"premium")
//   requiredTier — minimum tier to access this section
//   lockedLabel  — CTA string shown over padlock (e.g. "Unlock Financial Snapshot")
//   onUnlock     — called when locked overlay is clicked (opens PricingModal)
//   children     — real content to blur, OR null → renders FrostedSkeleton
//
// Modes:
//   UNLOCKED (canAccess true):  renders children (or null) directly, no blur
//   LOCKED + real children:     filter:blur(8px) over children + padlock overlay
//   LOCKED + null children:     filter:blur(8px) over FrostedSkeleton + padlock overlay
//
// Theme hazard: LockGate mounts inside PotentialApp's GREEN scope (--accent:#6EE7B7).
// All gold/ivory values MUST be hardcoded literals — never CSS vars from host scope.
//
// Gold tokens:
//   --accent:#e2b56b  --accent-dim:rgba(226,181,107,.13)
//   --bg:#070a11  --card:rgba(255,255,255,.04)  --border:rgba(243,237,225,.12)
//   --ink:#f3ede1
// ═══════════════════════════════════════════════════════════════
export default function LockGate({ tier, requiredTier, lockedLabel, onUnlock, children }) {
  const locked = !canAccess(tier, requiredTier);
  const [animating, setAnimating] = useState(false);

  // On unlock transition: briefly animate the blur-dissolve (D-09)
  useEffect(() => {
    if (!locked) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 450);
      return () => clearTimeout(t);
    }
  }, [locked]);

  // prefers-reduced-motion: snap, skip transition (honor accessibility)
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fully unlocked and dissolve animation complete — render children directly
  if (!locked && !animating) {
    return children ?? null;
  }

  const blurAmount = locked ? "8px" : "0px";
  const overlayOpacity = locked ? 1 : 0;
  const filterTransition = reduced ? "none" : "filter 0.42s ease";
  const opacityTransition = reduced ? "none" : "opacity 0.38s ease";

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 14 }}>
      {/* Layer 1: blurred real content OR frosted skeleton */}
      <div style={{
        filter: `blur(${blurAmount})`,
        userSelect: "none",
        pointerEvents: "none",
        transition: filterTransition,
        willChange: animating ? "filter" : "auto"
      }}>
        {children != null ? children : <FrostedSkeleton />}
      </div>

      {/* Layer 2: padlock overlay + CTA (clickable) */}
      <div
        onClick={onUnlock}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          cursor: "pointer",
          background: "rgba(8,9,12,0.35)",
          opacity: overlayOpacity,
          transition: opacityTransition,
          borderRadius: 14
        }}
      >
        {/* Inline padlock SVG — hardcoded gold stroke, matches ResultsMap mk-pin pattern */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(226,181,107,0.9)"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>

        {/* Lock CTA label */}
        <span style={{
          fontSize: 13,
          color: "rgba(243,237,225,0.8)",
          fontFamily: "'Manrope', sans-serif",
          textAlign: "center",
          maxWidth: 200,
          fontWeight: 600
        }}>
          {lockedLabel ?? "Unlock to see this"}
        </span>
      </div>
    </div>
  );
}
