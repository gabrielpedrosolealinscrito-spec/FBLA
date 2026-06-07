import { useState, useEffect } from "react";

// ── DemoTierSwitcher ─────────────────────────────────────────────────────────
// Floating segmented pill (presenter mode only). Hidden by default — revealed
// via the corner triple-tap gesture attached at PotentialApp root (D-04/D-05).
//
// THEME-SCOPE HAZARD: PotentialApp runs in a GREEN scope (--accent:#6EE7B7).
// ALL gold values HARDCODED — never CSS custom properties from the host scope.
// Active: color #e2b56b, bg rgba(226,181,107,.13), outline 1.5px solid #e2b56b.
// ─────────────────────────────────────────────────────────────────────────────

const TIERS = ["free", "basic", "plus", "premium"];

const LABELS = {
  free: "Free",
  basic: "Basic",
  plus: "Plus",
  premium: "Premium",
};

const LABELS_SHORT = {
  free: "Fr",
  basic: "Ba",
  plus: "+",
  premium: "Pr",
};

export default function DemoTierSwitcher({ tier, onTier, visible }) {
  if (!visible) return null;

  return (
    <>
      <style>{`
        .dts-label-full { display: inline; }
        .dts-label-abbr { display: none; }
        @media (max-width: 400px) {
          .dts-label-full { display: none; }
          .dts-label-abbr { display: inline; }
        }
      `}</style>
      <div style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 4,
        background: "rgba(13,17,25,0.90)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(243,237,225,0.14)",
        borderRadius: 100,
        padding: 8,
        zIndex: 9999,
      }}>
        {TIERS.map(t => {
          const active = tier === t;
          return (
            <button
              key={t}
              onClick={() => onTier(t)}
              style={{
                padding: "7px 16px",
                borderRadius: 100,
                border: "none",
                background: active ? "rgba(226,181,107,.13)" : "transparent",
                color: active ? "#e2b56b" : "rgba(243,237,225,0.5)",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.18s",
                outline: active ? "1.5px solid #e2b56b" : "none",
              }}
            >
              <span className="dts-label-full">{LABELS[t]}</span>
              <span className="dts-label-abbr">{LABELS_SHORT[t]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
