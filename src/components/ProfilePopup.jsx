import { useEffect } from "react";
import { useAuth } from "../lib/auth.jsx";
import { useTier } from "../lib/tier.js";
import { useA11y } from "../lib/a11y.jsx";

// ═══════════════════════════════════════════════════════════════
// ProfilePopup — account info + site-wide accessibility controls
// (wishlist package 03). Opened from the persistent ProfileButton.
//
// Brand: gold-on-near-black, Instrument Serif heads / Manrope body /
// JetBrains Mono numerals. Mounts at the app root (outside PotentialApp's
// themed scope) so all gold values are HARDCODED — no host CSS vars, no
// general/Unicode emoji (README §6); icons are inline line-SVGs.
// ═══════════════════════════════════════════════════════════════

const GOLD = "#e2b56b";
const INK = "#0d1119";
const IVORY = "#f3ede1";
const heading = { fontFamily: "'Instrument Serif', serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

const TIER_LABEL = { free: "Free", premium: "Premium", global: "Global" };

// ── Line-icon toggle switch (no emoji) ──
function Toggle({ on, onChange, label, id }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      id={id}
      onClick={() => onChange(!on)}
      style={{
        position: "relative",
        width: 40,
        height: 22,
        flexShrink: 0,
        borderRadius: 100,
        border: "1px solid " + (on ? GOLD : "rgba(243,237,225,0.18)"),
        background: on ? "rgba(226,181,107,0.20)" : "rgba(243,237,225,0.05)",
        cursor: "pointer",
        transition: "all 0.2s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: on ? GOLD : "rgba(243,237,225,0.55)",
          transition: "all 0.2s",
        }}
      />
    </button>
  );
}

function Row({ label, hint, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "11px 0",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: IVORY, fontWeight: 500 }}>{label}</div>
        {hint && (
          <div style={{ fontSize: 11, color: "rgba(243,237,225,0.42)", marginTop: 2 }}>
            {hint}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default function ProfilePopup({ onClose }) {
  const { user, profile, signOut } = useAuth();
  const { tier } = useTier();
  const { reduceMotion, setReduceMotion, volume, setVolume, muted, setMuted } = useA11y();

  // Close on Escape — popup is a lightweight menu, not a modal.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const displayName =
    (profile && profile.name) || (user && user.email) || "Guest";
  const tierLabel = TIER_LABEL[tier] || "Free";
  const pct = Math.round((volume ?? 0) * 100);

  const go = (hash) => { window.location.hash = hash; onClose(); };
  const handleSignOut = async () => { await signOut(); onClose(); };

  const linkBtn = {
    background: "none",
    border: "none",
    color: GOLD,
    fontSize: 12.5,
    fontFamily: "inherit",
    cursor: "pointer",
    padding: "8px 0",
    letterSpacing: "0.02em",
    textAlign: "left",
  };

  return (
    <>
      <style>{`
        .pp-vol{ -webkit-appearance:none; appearance:none; width:100%; height:3px;
          border-radius:100px; background:rgba(243,237,225,0.18); outline:none; cursor:pointer; }
        .pp-vol::-webkit-slider-thumb{ -webkit-appearance:none; appearance:none;
          width:15px; height:15px; border-radius:50%; background:${GOLD};
          border:none; cursor:pointer; box-shadow:0 0 0 4px rgba(226,181,107,0.12); }
        .pp-vol::-moz-range-thumb{ width:15px; height:15px; border-radius:50%;
          background:${GOLD}; border:none; cursor:pointer; }
        .pp-vol:disabled{ opacity:.4; cursor:not-allowed; }
        .pp-enter{ opacity:0; transform:translateY(-6px) scale(.98);
          animation:pp-in .18s cubic-bezier(.22,.61,.36,1) forwards; transform-origin:top right; }
        @keyframes pp-in{ to{ opacity:1; transform:translateY(0) scale(1); } }
      `}</style>

      <div
        className="pp-enter"
        role="dialog"
        aria-label="Account and accessibility settings"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 296,
          background: INK,
          border: "1px solid rgba(243,237,225,0.10)",
          borderRadius: 16,
          boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
          padding: "18px 18px 14px",
          fontFamily: "'Manrope', sans-serif",
          color: IVORY,
        }}
      >
        {/* ── Account ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span
            aria-hidden="true"
            style={{
              width: 40, height: 40, flexShrink: 0, borderRadius: "50%",
              border: "1px solid rgba(226,181,107,0.4)",
              background: "rgba(226,181,107,0.08)",
              display: "grid", placeItems: "center",
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
              stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
            </svg>
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                ...heading, fontSize: 19, fontWeight: 400, color: IVORY, lineHeight: 1.15,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200,
              }}
            >
              {displayName}
            </div>
            <div style={{ ...mono, fontSize: 10.5, letterSpacing: "0.12em", color: GOLD, textTransform: "uppercase", marginTop: 3 }}>
              {tierLabel} plan
            </div>
          </div>
        </div>

        {!user && (
          <button onClick={() => go("#/login")} style={{ ...linkBtn, fontWeight: 600, paddingTop: 4 }}>
            Sign in to save your results &rarr;
          </button>
        )}

        <div style={{ height: 1, background: "rgba(243,237,225,0.08)", margin: "12px 0 2px" }} />

        {/* ── Accessibility ── */}
        <div
          style={{
            ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
            color: "rgba(243,237,225,0.4)", margin: "10px 0 2px",
          }}
        >
          Accessibility
        </div>

        <Row label="Reduced motion" hint="Calm transitions & spin">
          <Toggle on={reduceMotion} onChange={setReduceMotion} label="Reduced motion" />
        </Row>

        <Row label="Mute sound" hint="Ambient soundtrack">
          <Toggle on={muted} onChange={setMuted} label="Mute sound" />
        </Row>

        <div style={{ padding: "6px 0 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
            <span style={{ fontSize: 13.5, color: muted ? "rgba(243,237,225,0.4)" : IVORY, fontWeight: 500 }}>
              Volume
            </span>
            <span style={{ ...mono, fontSize: 12, color: muted ? "rgba(243,237,225,0.35)" : GOLD }}>
              {pct}%
            </span>
          </div>
          <input
            type="range"
            className="pp-vol"
            min="0"
            max="100"
            step="1"
            value={pct}
            disabled={muted}
            aria-label="Volume"
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
          />
        </div>

        <div style={{ height: 1, background: "rgba(243,237,225,0.08)", margin: "2px 0 4px" }} />

        {/* ── Links ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <button onClick={() => go("#/pricing")} style={linkBtn}>
            Manage plan
          </button>
          {user && (
            <button onClick={handleSignOut} style={{ ...linkBtn, color: "rgba(243,237,225,0.55)" }}>
              Sign out
            </button>
          )}
        </div>
      </div>
    </>
  );
}
