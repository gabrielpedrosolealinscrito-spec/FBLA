// ─────────────────────────────────────────────────────────────────
// Potential — InfoTooltip (Phase 4, Plan 03 / D-10)
// Reusable tappable "i" affordance: click toggles an inline panel with a
// plain-language explanation + source citation for uncommon country-specific
// concepts (National Insurance, NHR/IFICI, solidarity surcharge, provincial
// tax, the "data as of" stamp). Touch-friendly (click, not hover-only).
// No network requests — fully offline. Visual polish is the frontend pass.
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";

/**
 * Props:
 *   label?       — short concept name shown in the panel header (e.g. "National Insurance")
 *   explanation  — plain-language explanation string
 *   source?      — citation: a string, or { text, url } to render a link
 */
export default function InfoTooltip({ label, explanation, source }) {
  const [open, setOpen] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }}>
      <button
        type="button"
        aria-label={label ? `More info: ${label}` : "More info"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 16, height: 16, borderRadius: "50%",
          border: "1px solid var(--border-active)", background: "var(--surface)",
          color: "var(--text2)", fontSize: 11, fontWeight: 700, lineHeight: 1,
          cursor: "pointer", fontFamily: "inherit", padding: 0, marginLeft: 6,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}
      >
        i
      </button>

      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute", top: "140%", left: 0, zIndex: 30, width: 250,
            background: "var(--card)", border: "1px solid var(--border-active)",
            borderRadius: 10, padding: "12px 14px", color: "var(--text2)",
            fontSize: 12, lineHeight: 1.5, fontWeight: 400, textAlign: "left",
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          }}
        >
          {label && (
            <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
              {label}
            </div>
          )}
          <div style={{ marginBottom: source ? 8 : 0 }}>{explanation}</div>
          {source && (
            <div style={{
              color: "var(--text3)", fontSize: 11,
              borderTop: "1px solid var(--border)", paddingTop: 6,
            }}>
              {typeof source === "string" ? (
                <>Source: {source}</>
              ) : (
                <>
                  Source:{" "}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--accent)" }}
                  >
                    {source.text || source.url}
                  </a>
                </>
              )}
            </div>
          )}
        </span>
      )}
    </span>
  );
}
