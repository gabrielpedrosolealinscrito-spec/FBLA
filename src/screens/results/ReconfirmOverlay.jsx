// ─────────────────────────────────────────────────────────────────
// Potential — ReconfirmOverlay (Phase 3, Plan 07)
// D-02: Re-confirm overlay when a dealbreaker demotes the raw #1 city.
// Props: { signal: ReconfirmSignal, onKeep: () => void, onLift: () => void }
// signal = { city: City, dealbreaker: string, factLabel: string }
// No network/fetch calls — fully offline.
// ─────────────────────────────────────────────────────────────────

import { mono } from './ResultsView.jsx';

/**
 * Props:
 *   signal   — ReconfirmSignal from rankCities(): { city, dealbreaker, factLabel }
 *   onKeep   — called when user confirms the dealbreaker still applies (dismiss overlay)
 *   onLift   — called when user says it's fine (remove dealbreaker, re-rank)
 */
export default function ReconfirmOverlay({ signal, onKeep, onLift }) {
  if (!signal) return null;

  const { city, factLabel } = signal;

  return (
    // Full-screen backdrop
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(8,9,12,0.85)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:24,
    }}>
      {/* Card */}
      <div style={{
        background:"var(--card)", borderRadius:20, border:"1px solid var(--border-active)",
        padding:32, maxWidth:480, width:"100%", boxShadow:"0 0 60px rgba(251,191,36,0.1)",
      }}>
        {/* Amber warning accent */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.2)",
          borderRadius:8, padding:"6px 12px", marginBottom:20,
        }}>
          <span style={{ fontSize:14 }}>⚠️</span>
          <span style={{ fontSize:11, color:"var(--accent2)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>
            Dealbreaker alert
          </span>
        </div>

        <h2 style={{
          fontFamily:"'Instrument Serif', serif", fontSize:24, lineHeight:1.2,
          marginBottom:12, color:"var(--text)",
        }}>
          {city.name} would be your top match
        </h2>

        <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, marginBottom:24 }}>
          Based on your profile, <strong style={{ color:"var(--text)" }}>{city.name}</strong> scores
          highest for you. But it has <strong style={{ color:"var(--accent2)" }}>{factLabel}</strong>.
          You marked this as a dealbreaker — is that still the case?
        </p>

        {/* City fact chip */}
        <div style={{
          background:"var(--surface)", borderRadius:10, border:"1px solid var(--border)",
          padding:"12px 16px", marginBottom:24,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <span style={{ fontSize:24 }}>{city.emoji}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>{city.name}</div>
            <div style={{ fontSize:12, color:"var(--accent2)", marginTop:2 }}>{factLabel}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button
            onClick={onKeep}
            style={{
              width:"100%", padding:"14px", borderRadius:12,
              background:"var(--surface)", border:"1px solid var(--border)",
              color:"var(--text2)", fontSize:14, fontWeight:600, cursor:"pointer",
              fontFamily:"inherit", transition:"all 0.15s",
            }}
          >
            Yes, still a dealbreaker — keep filtering
          </button>

          <button
            onClick={onLift}
            style={{
              width:"100%", padding:"14px", borderRadius:12,
              background:"var(--accent)", border:"none",
              color:"#08090C", fontSize:14, fontWeight:700, cursor:"pointer",
              fontFamily:"inherit", transition:"all 0.15s",
            }}
          >
            No, it&rsquo;s fine — show me {city.name} as #1
          </button>
        </div>

        <p style={{ fontSize:11, color:"var(--text3)", marginTop:16, textAlign:"center", ...mono }}>
          Changing this only affects the current session.
        </p>
      </div>
    </div>
  );
}
