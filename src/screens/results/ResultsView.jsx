// ─────────────────────────────────────────────────────────────────
// Potential — ResultsView (Phase 3, Plan 07)
// Ranked list consuming MatchResult[]. MATCH-04 sort by 4 keys.
// No network/fetch calls — fully offline.
// ─────────────────────────────────────────────────────────────────

// ── Design tokens (copied from PotentialApp.jsx lines 153–167) ────
export const css = {
  "--bg":"#08090C","--surface":"#111318","--card":"#171B22","--card-hover":"#1C2029",
  "--border":"rgba(255,255,255,0.05)","--border-active":"rgba(255,255,255,0.12)",
  "--accent":"#6EE7B7","--accent2":"#FBBF24","--accent3":"#818CF8","--accent-dim":"rgba(110,231,183,0.08)",
  "--text":"#EEF2F7","--text2":"#8896AB","--text3":"#505C6F",
  "--neg":"#F87171","--pos":"#6EE7B7",
  fontFamily:"'Manrope', sans-serif", background:"var(--bg)", color:"var(--text)",
};

export const heading = { fontFamily:"'Instrument Serif', serif" };
export const mono = { fontFamily:"'JetBrains Mono', monospace" };

export const pill = (active) => ({
  padding:"8px 16px", borderRadius:10,
  border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
  background: active ? "var(--accent-dim)" : "var(--card)",
  color: active ? "var(--accent)" : "var(--text2)",
  fontSize:13, cursor:"pointer", fontWeight: active ? 600 : 400, transition:"all 0.2s",
  fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6,
});

// ── Number formatters (PotentialApp.jsx lines 26–27) ──────────────
export const fmt = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n/1000)}K` : `$${n}`;
export const fmtFull = (n) => `$${n.toLocaleString()}`;

// ── Sort keys (MATCH-04): pure helper, exported for tests ─────────
/**
 * Sort MatchResult[] by the given key.
 * Uses typed MatchResult fields: r.estSalary, r.monthlySavings, r.city.costIndex.
 * Returns a new sorted array (does not mutate input).
 */
export function sortResults(results, sortBy) {
  return [...results].sort((a, b) => {
    if (sortBy === "match")   return b.matchScore - a.matchScore;
    if (sortBy === "savings") return b.monthlySavings - a.monthlySavings;
    if (sortBy === "salary")  return b.estSalary - a.estSalary;
    if (sortBy === "cost")    return a.city.costIndex - b.city.costIndex;
    return 0;
  });
}

// ── Component ─────────────────────────────────────────────────────
/**
 * Props:
 *   results     — MatchResult[] from rankCities()
 *   sortBy      — "match" | "savings" | "salary" | "cost"
 *   setSortBy   — state setter
 *   onSelectCity — (MatchResult) => void — called when card is clicked
 */
export default function ResultsView({ results, sortBy, setSortBy, onSelectCity }) {
  if (!results || results.length === 0) {
    return (
      <div style={{ ...css, padding:24 }}>
        <p style={{ color:"var(--text3)" }}>No results yet.</p>
      </div>
    );
  }

  const sorted = sortResults(results, sortBy);

  const SORT_OPTIONS = [
    ["match",   "Best match"],
    ["savings", "Most savings"],
    ["salary",  "Top salary"],
    ["cost",    "Lowest cost"],
  ];

  return (
    <div style={{ ...css, padding:0 }}>
      {/* Sort pills */}
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {SORT_OPTIONS.map(([k, l]) => (
          <button key={k} onClick={() => setSortBy(k)} style={pill(sortBy === k)}>{l}</button>
        ))}
      </div>

      {/* City cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {sorted.map((r) => {
          const savingsColor = r.monthlySavings >= 0 ? "var(--pos)" : "var(--neg)";
          const savingsSign  = r.monthlySavings >= 0 ? "+" : "";
          return (
            <div
              key={r.city.name}
              onClick={() => onSelectCity(r)}
              style={{
                background:"var(--card)", borderRadius:14, padding:"18px 20px", cursor:"pointer",
                border:"1px solid var(--border)", transition:"all 0.15s",
                display:"grid", gridTemplateColumns:"auto 1fr auto", alignItems:"center", gap:16,
              }}
            >
              {/* Emoji */}
              <div style={{ fontSize:34, width:44, textAlign:"center" }}>{r.city.emoji}</div>

              {/* Name + score badge + vibe tags */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:3 }}>
                  <span style={{ fontSize:16, fontWeight:700 }}>{r.city.name}</span>
                  <span style={{
                    fontSize:11, color:"var(--accent)", fontWeight:700,
                    background:"var(--accent-dim)", padding:"2px 8px", borderRadius:6, ...mono
                  }}>
                    {r.matchScore}%
                  </span>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {r.city.vibe.slice(0, 3).map(v => (
                    <span key={v} style={{
                      fontSize:10, color:"var(--text3)", background:"var(--surface)",
                      padding:"2px 8px", borderRadius:4, textTransform:"uppercase", letterSpacing:"0.06em"
                    }}>{v}</span>
                  ))}
                </div>
              </div>

              {/* Financials */}
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:15, ...mono, fontWeight:600 }}>
                  {fmt(r.estSalary)}<span style={{ fontSize:10, color:"var(--text3)", fontWeight:400 }}>/yr</span>
                </div>
                <div style={{ fontSize:13, ...mono, color:savingsColor, fontWeight:600 }}>
                  {savingsSign}{fmt(Math.abs(r.monthlySavings))}<span style={{ fontSize:10, fontWeight:400 }}>/mo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
