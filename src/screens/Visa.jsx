import { useState, useEffect } from "react";
import { selectVisaPathways } from "../../shared/engine/visa.js";

// ═══════════════════════════════════════════
// VISA — Premium visa concierge screen (Phase 7, VISA-02/VISA-03/VISA-04)
//
// Renders the side-by-side pathway comparison (auto-fit grid, graded fit badge),
// per-pathway document checklists, sources-as-text + "data as of" stamps, the
// UPL disclaimer banner, and the attorney-referral CTA. Off-script destinations
// render the honest skeleton — never a dead-end (D-06).
//
// ZERO network calls on the render path — offline-mandatory (D-01).
// Inline-style only — no className, no tailwind, no CSS literal (Phase 2 D-01 lock).
// Inherits PotentialApp.jsx mint token system verbatim.
// Sources rendered as text/span only — never <a> (D-10 / see-not-click).
// ═══════════════════════════════════════════

// ── Grade styling maps (UI-SPEC §1 + PATTERNS Part D) ────────────────────────
const FIT_STYLES = {
  strong: {
    background: "rgba(110,231,183,0.08)",      // --accent-dim
    border: "1px solid rgba(110,231,183,0.15)",
    color: "var(--accent)",                    // #6EE7B7
  },
  possible: {
    background: "rgba(251,191,36,0.08)",       // --warn-dim
    border: "1px solid rgba(251,191,36,0.15)",
    color: "var(--accent2)",                   // #FBBF24
  },
  "long-shot": {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text2)",                     // #8896AB — NOT --neg (#F87171)
  },
};

const GRADE_ICONS = { strong: "✦", possible: "◐", "long-shot": "○" };

const GRADE_LABELS = { strong: "Strong fit", possible: "Possible", "long-shot": "Long shot" };

/**
 * Visa screen — Premium visa concierge.
 *
 * @param {object} profile       - User profile (citizenship, hasRemote, income, age, education)
 * @param {string} matchedCountry - Top matched destination country — accent-emphasis signal only, NOT a filter
 * @param {function} onBack      - Called when user presses Back to return to city detail
 */
export default function Visa({ profile, matchedCountry, onBack }) {
  const [anim, setAnim] = useState(false);

  // Animate on mount — same 60ms delay as PotentialApp goStep pattern
  useEffect(() => {
    setTimeout(() => setAnim(true), 60);
  }, []);

  // ── CSS token system — inherited from PotentialApp.jsx verbatim ──────────
  const css = {
    "--bg": "#08090C", "--surface": "#111318", "--card": "#171B22", "--card-hover": "#1C2029",
    "--border": "rgba(255,255,255,0.05)", "--border-active": "rgba(255,255,255,0.12)",
    "--accent": "#6EE7B7", "--accent2": "#FBBF24", "--accent3": "#818CF8", "--accent-dim": "rgba(110,231,183,0.08)",
    "--text": "#EEF2F7", "--text2": "#8896AB", "--text3": "#505C6F",
    "--neg": "#F87171", "--pos": "#6EE7B7",
    fontFamily: "'Manrope', sans-serif", background: "var(--bg)", color: "var(--text)", minHeight: "100vh",
  };
  const heading = { fontFamily: "'Instrument Serif', serif" };
  const mono = { fontFamily: "'JetBrains Mono', monospace" };
  const label = {
    fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text2)",
    display: "block", marginBottom: 8, fontWeight: 600,
  };
  const fadeIn = {
    opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(24px)",
    transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
  };

  // ── Guard: profile not ready ──────────────────────────────────────────────
  if (!profile) {
    return (
      <div style={{ ...css, padding: "48px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text2)", fontSize: 15 }}>Finish your profile to see visa pathways.</p>
        <button onClick={onBack} style={{ marginTop: 24, padding: "10px 22px", background: "var(--card)", border: "1px solid var(--border-active)", borderRadius: 12, color: "var(--text2)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
      </div>
    );
  }

  // Check for citizenship/destination
  if (!profile.citizenship && !profile.currentCity) {
    return (
      <div style={{ ...css, padding: "48px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--text2)", fontSize: 15 }}>Complete the &lsquo;Going Global&rsquo; step in the quiz to see visa pathways.</p>
        <button onClick={onBack} style={{ marginTop: 24, padding: "10px 22px", background: "var(--card)", border: "1px solid var(--border-active)", borderRadius: 12, color: "var(--text2)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
      </div>
    );
  }

  // ── Compute pathways — synchronous, offline, deterministic ───────────────
  const results = selectVisaPathways(profile, matchedCountry ?? "");

  // Detect off-script skeleton (single result with generic skeleton visa type)
  const isSkeleton = results.length === 1 && results[0].pathway.visaType.startsWith("Work Visa for");

  // ── Sub-components ────────────────────────────────────────────────────────

  // Fit badge (net-new, UI-SPEC §1)
  const FitBadge = ({ fit }) => {
    const styles = FIT_STYLES[fit.grade] ?? FIT_STYLES["long-shot"];
    const icon = GRADE_ICONS[fit.grade] ?? "○";
    const gradeLabel = GRADE_LABELS[fit.grade] ?? "Long shot";
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
        borderRadius: 8, fontSize: 13, fontWeight: 600, ...styles,
      }}>
        <span>{icon}</span>
        <span>{gradeLabel}: {fit.gatingFactor}</span>
      </div>
    );
  };

  // Source block — rendered as text, never <a> (D-10 / see-not-click)
  const SourceBlock = ({ sources }) => (
    <div style={{ marginTop: 8 }}>
      <span style={{ ...label, marginBottom: 4 }}>SOURCES</span>
      {sources.map((src, i) => (
        <p key={i} style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5, margin: "2px 0" }}>{src}</p>
      ))}
    </div>
  );

  // Disclaimer banner (VISA-04) — always rendered above pathway content
  const DisclaimerBanner = () => (
    <div style={{
      background: "rgba(251,191,36,0.08)",
      border: "1px solid rgba(251,191,36,0.15)",
      borderRadius: 12,
      padding: "12px 16px",
      marginBottom: 28,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#FBBF24", marginBottom: 4 }}>
        ⚠ Not legal advice.
      </div>
      <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
        This is an informational assessment only. Consult a licensed immigration attorney before acting on this information.
      </div>
    </div>
  );

  // Attorney referral CTA (D-04, UI-SPEC §7) — non-functional placeholder
  const AttorneyCTA = () => (
    <button
      onClick={() => {}}
      style={{
        width: "100%",
        padding: "14px 16px",
        background: "var(--card)",
        border: "1px solid var(--border-active)",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 600,
        color: "var(--text2)",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.03em",
        textAlign: "center",
        marginTop: 28,
      }}
    >
      Connect with a vetted immigration attorney
    </button>
  );

  // Off-script skeleton layout (D-06, UI-SPEC §8)
  if (isSkeleton) {
    const { pathway, fit } = results[0];
    return (
      <div style={{ ...css }}>
        {/* Back nav */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Back</button>
          <span style={{ ...heading, fontSize: 18, color: "var(--text3)" }}>potential</span>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 64px", ...fadeIn }}>
          {/* Heading */}
          <h1 style={{ ...heading, fontSize: 32, margin: "0 0 8px" }}>Visa Pathways</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", margin: "0 0 4px" }}>Based on your profile. Informational only, not legal advice.</p>
          <p style={{ fontSize: 13, color: "var(--text3)", margin: "0 0 24px" }}>No extra questions, just your citizenship and destination.</p>

          <DisclaimerBanner />

          {/* Skeleton card */}
          <div style={{ background: "var(--card)", borderRadius: 16, border: "1px solid var(--border)", padding: 24, marginBottom: 16 }}>
            <h2 style={{ ...heading, fontSize: 24, color: "var(--text2)", margin: "0 0 12px" }}>{pathway.visaType}</h2>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: "0 0 16px" }}>
              Typical documents for a remote-work or skilled-worker visa include...
            </p>
            <FitBadge fit={fit} />

            {/* Generic checklist */}
            <div style={{ marginTop: 20 }}>
              <span style={label}>DOCUMENT CHECKLIST</span>
              {pathway.documentChecklist.map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0",
                  borderBottom: i < pathway.documentChecklist.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: 13, color: "var(--text2)", lineHeight: 1.5,
                }}>
                  <span style={{ color: "var(--accent)", width: 16, flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Sources — text only, never links */}
            <SourceBlock sources={pathway.officialSources} />
          </div>

          <AttorneyCTA />
        </div>
      </div>
    );
  }

  // ── Full comparison layout (authored pathways) ────────────────────────────
  return (
    <div style={{ ...css }}>
      {/* Back nav */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Back</button>
        <span style={{ ...heading, fontSize: 18, color: "var(--text3)" }}>potential</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 64px", ...fadeIn }}>
        {/* Heading block */}
        <h1 style={{ ...heading, fontSize: 32, margin: "0 0 8px" }}>Visa Pathways</h1>
        <p style={{ fontSize: 14, color: "var(--text2)", margin: "0 0 4px" }}>Based on your profile. Informational only, not legal advice.</p>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: "0 0 24px" }}>No extra questions, just your citizenship and destination.</p>

        {/* Disclaimer banner (VISA-04) — always before pathway content */}
        <DisclaimerBanner />

        {/* Section label */}
        <span style={{ ...label, marginBottom: 16 }}>PATHWAY COMPARISON</span>

        {/* Side-by-side comparison grid (auto-fit, no @media) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}>
          {results.map(({ pathway, fit }, idx) => {
            const isMatchedDestination = matchedCountry && pathway.destinationCountry === matchedCountry;
            return (
              <div key={idx} style={{
                background: "var(--card)",
                borderRadius: 16,
                border: "1px solid var(--border)",
                ...(isMatchedDestination ? { borderLeft: "3px solid var(--accent)" } : {}),
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}>
                {/* Country name + visa type pill */}
                <div>
                  <h2 style={{ ...heading, fontSize: 20, margin: "0 0 8px" }}>{pathway.destinationCountry}</h2>
                  <div style={{
                    display: "inline-flex", alignItems: "center", padding: "4px 10px",
                    borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)",
                    fontSize: 11, color: "var(--text2)", fontWeight: 600, letterSpacing: "0.04em",
                  }}>
                    {pathway.visaType}
                  </div>
                </div>

                {/* Graded fit badge */}
                <FitBadge fit={fit} />

                {/* Requirements */}
                <div>
                  <span style={label}>REQUIREMENTS</span>
                  {pathway.requirements.map((req, i) => (
                    <p key={i} style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 6px" }}>• {req}</p>
                  ))}
                </div>

                {/* Processing time */}
                <div>
                  <span style={label}>PROCESSING TIME</span>
                  <p style={{ ...mono, fontSize: 13, color: "var(--text)", lineHeight: 1.5, margin: 0 }}>{pathway.processingTime}</p>
                </div>

                {/* Fee range */}
                <div>
                  <span style={label}>FEE RANGE (USD)</span>
                  <p style={{ ...mono, fontSize: 13, color: "var(--accent2)", lineHeight: 1.5, margin: 0 }}>{pathway.feeRangeUSD}</p>
                </div>

                {/* Pros */}
                <div>
                  <span style={label}>PROS</span>
                  {pathway.pros.map((pro, i) => (
                    <p key={i} style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 6px" }}>✦ {pro}</p>
                  ))}
                </div>

                {/* Cons */}
                <div>
                  <span style={label}>CONS</span>
                  {pathway.cons.map((con, i) => (
                    <p key={i} style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 6px" }}>◦ {con}</p>
                  ))}
                </div>

                {/* Sources + data as of */}
                <SourceBlock sources={pathway.officialSources} />
              </div>
            );
          })}
        </div>

        {/* Per-pathway document checklists (below comparison grid) */}
        <span style={{ ...label, marginBottom: 16 }}>DOCUMENT CHECKLISTS</span>
        {results.map(({ pathway }, idx) => (
          <div key={idx} style={{
            background: "var(--surface)",
            borderRadius: 16,
            border: "1px solid var(--border)",
            padding: 24,
            marginBottom: 16,
          }}>
            <span style={{ ...label, marginBottom: 8 }}>DOCUMENT CHECKLIST</span>
            <h3 style={{ ...heading, fontSize: 24, margin: "0 0 16px" }}>{pathway.visaType}</h3>
            {pathway.documentChecklist.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0",
                borderBottom: i < pathway.documentChecklist.length - 1 ? "1px solid var(--border)" : "none",
                fontSize: 13, color: "var(--text2)", lineHeight: 1.5,
              }}>
                <span style={{ color: "var(--accent)", width: 16, flexShrink: 0 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Attorney referral CTA (D-04, VISA-04) */}
        <AttorneyCTA />
      </div>
    </div>
  );
}
