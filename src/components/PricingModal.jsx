import { useEffect } from "react";

// ═══════════════════════════════════════════════════════
// PricingModal — 4-tier pricing overlay with testimonials
//
// Theme note: mounts inside PotentialApp's GREEN scope so
// all gold values are hardcoded (#e2b56b / rgba(226,181,107,...))
// and zero CSS custom properties from the host are used.
// ═══════════════════════════════════════════════════════

// ── Tier configuration — UI-SPEC Feature Copy by Tier ──
const TIERS_CONFIG = [
  {
    key: "free",
    label: "Free",
    price: "$0",
    priceNote: "forever",
    features: ["#1 city match", "City name + match %"],
    cta: "Current plan",
    ctaClickable: false,
  },
  {
    key: "basic",
    label: "Basic",
    price: "$0.99",
    priceNote: "1 run · never expires",
    features: ["Top 3 cities fully revealed", "City 'why' + core financials", "Offline-ready results"],
    cta: "Get Basic",
    ctaClickable: true,
  },
  {
    key: "plus",
    label: "Plus",
    price: "$9.99",
    priceNote: "3 runs · never expires",
    features: ["Full ranked list (all cities)", "Live AI: jobs, housing, day-in-life", "Relocation roadmap", "Everything in Basic"],
    cta: "Get Plus",
    ctaClickable: true,
    isPopular: true,
  },
  {
    key: "premium",
    label: "Premium",
    price: "$29.99",
    priceNote: "unlimited runs",
    features: ["Visa concierge + pathway comparison", "Document checklist + timeline", "Everything in Plus"],
    cta: "Get Premium",
    ctaClickable: true,
  },
];

// ── Testimonials — UI-SPEC Testimonial Copy ──
const TESTIMONIALS = [
  {
    quote: "Showed me Toronto was a better fit than Austin — saved me months of research.",
    author: "Alex M.",
  },
  {
    quote: "The roadmap was the only tool that actually broke down what moving abroad costs.",
    author: "Priya K.",
  },
  {
    quote: "Switched from Plus to Premium for the visa step. Worth every cent.",
    author: "Jordan T.",
  },
];

export default function PricingModal({ open, onClose, onTier, currentTier }) {
  // Body scroll-lock — reuses existing Landing.jsx class `lp-locked`.
  // Effect runs before early-return to satisfy hooks ordering rules.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("lp-locked");
    return () => {
      document.body.classList.remove("lp-locked");
    };
  }, [open]);

  if (!open) return null;

  const heading = { fontFamily: "'Instrument Serif', serif" };
  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <>
      <style>{`
        .pm-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 32px 0;
        }
        .pm-testimonials {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
        }
        @media (max-width: 520px) {
          .pm-grid {
            grid-template-columns: 1fr;
          }
          .pm-testimonials {
            grid-template-columns: 1fr;
          }
          .pm-plus-card {
            order: -1;
          }
        }
        .pm-modal-inner {
          opacity: 0;
          transform: translateY(10px);
          animation: pm-enter 0.4s cubic-bezier(.22,.61,.36,1) forwards;
        }
        @keyframes pm-enter {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Full-screen dim layer — plain rgba only (GPU-safe, no backdrop-filter) */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "rgba(8,9,12,0.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          overflowY: "auto",
        }}
      >
        {/* Modal card — backdrop-filter on the CARD only */}
        <div
          className="pm-modal-inner"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#0d1119",
            borderRadius: 20,
            border: "1px solid rgba(243,237,225,0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            maxWidth: 820,
            width: "100%",
            padding: "32px 24px 24px",
            position: "relative",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          {/* Dismiss button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "none",
              border: "none",
              color: "rgba(243,237,225,0.4)",
              fontSize: 22,
              cursor: "pointer",
              lineHeight: 1,
              padding: "4px 8px",
              fontFamily: "inherit",
            }}
            aria-label="Dismiss"
          >
            ×
          </button>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <h2 style={{ ...heading, fontSize: 28, margin: 0, color: "#f3ede1", fontWeight: 400 }}>
              Unlock Your Full Potential
            </h2>
            <p style={{ fontSize: 13, color: "rgba(243,237,225,0.5)", marginTop: 8, letterSpacing: "0.02em" }}>
              Credits never expire · No subscription · No commitment
            </p>
          </div>

          {/* 4-tier pricing grid */}
          <div className="pm-grid">
            {TIERS_CONFIG.map((tier) => (
              <div
                key={tier.key}
                className={tier.isPopular ? "pm-plus-card" : ""}
                style={{
                  background: tier.isPopular ? "rgba(226,181,107,0.06)" : "rgba(243,237,225,0.03)",
                  border: tier.isPopular
                    ? "1.5px solid rgba(226,181,107,0.5)"
                    : "1px solid rgba(243,237,225,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  position: "relative",
                }}
              >
                {/* "MOST POPULAR" badge */}
                {tier.isPopular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#e2b56b",
                      color: "#08090C",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      padding: "3px 10px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                      fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Tier label */}
                <div
                  style={{
                    ...heading,
                    fontSize: 20,
                    color: "#f3ede1",
                    fontWeight: 400,
                    marginTop: tier.isPopular ? 8 : 0,
                  }}
                >
                  {tier.label}
                </div>

                {/* Price */}
                <div
                  style={{
                    ...mono,
                    fontSize: 26,
                    fontWeight: 700,
                    color: tier.isPopular ? "#e2b56b" : "#f3ede1",
                    lineHeight: 1,
                  }}
                >
                  {tier.price}
                </div>
                <div style={{ fontSize: 11, color: "rgba(243,237,225,0.4)", marginTop: -4 }}>
                  {tier.priceNote}
                </div>

                {/* Feature bullets */}
                <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {tier.features.map((feat) => (
                    <li
                      key={feat}
                      style={{
                        fontSize: 14,
                        color: "rgba(243,237,225,0.75)",
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: "#e2b56b", flexShrink: 0, fontSize: 13, marginTop: 1 }}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div style={{ marginTop: "auto", paddingTop: 16 }}>
                  {tier.ctaClickable ? (
                    <button
                      onClick={() => { onTier(tier.key); onClose(); }}
                      style={{
                        width: "100%",
                        padding: "11px 0",
                        background: tier.isPopular ? "#e2b56b" : "rgba(243,237,225,0.07)",
                        color: tier.isPopular ? "#08090C" : "#f3ede1",
                        border: tier.isPopular ? "none" : "1px solid rgba(243,237,225,0.15)",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: "0.02em",
                        transition: "opacity 0.15s",
                      }}
                    >
                      {tier.cta}
                    </button>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        padding: "11px 0",
                        background: "none",
                        color: "rgba(243,237,225,0.3)",
                        border: "1px solid rgba(243,237,225,0.08)",
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 400,
                        textAlign: "center",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                      }}
                    >
                      {tier.cta}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Trust footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgba(243,237,225,0.4)",
              marginTop: 8,
              letterSpacing: "0.01em",
            }}
          >
            30-day money-back guarantee · Credits never expire · No subscription
          </div>

          {/* Testimonials */}
          <div className="pm-testimonials">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(243,237,225,0.08)",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ color: "#e2b56b", fontSize: 14, letterSpacing: 2 }}>★★★★★</div>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(243,237,225,0.75)",
                    lineHeight: 1.5,
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  "{t.quote}"
                </p>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(243,237,225,0.4)",
                    letterSpacing: "0.03em",
                    fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  — {t.author}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Dismiss button */}
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "1px solid rgba(243,237,225,0.15)",
                color: "rgba(243,237,225,0.5)",
                fontSize: 13,
                padding: "8px 24px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
