// ─────────────────────────────────────────────────────────────────
// Potential — FinancialsView
// Presentation-grade rendering of the 24-month model (PITCH-05).
// Doubles as the in-app financials screen AND the source for deck
// Slides 9 & 10 (pitch/deck/deck-outline.md) — screenshot-ready.
//
// Gold cinematic palette (matches Landing.jsx; D — gold over mint).
// Hand-rolled SVG, no charting dependency.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import {
  MONTHLY,
  TIERS,
  METRICS,
  breakEvenRow,
  ltvCacMidpoint,
} from '../../shared/data/financials.js';

// ── Gold design tokens ────────────────────────────────────────────
const T = {
  bg: '#070a11',
  panel: '#0d1119',
  panel2: '#111824',
  border: 'rgba(202,160,90,0.16)',
  borderSoft: 'rgba(255,255,255,0.06)',
  gold: '#caa05a',
  goldBright: '#e2b56b',
  goldDeep: '#6e4f2a',
  cream: '#f3ede1',
  text2: '#9aa3b4',
  text3: '#5c6675',
  pos: '#c9a86a',
  neg: '#c87a59',
};
const serif = { fontFamily: "'Instrument Serif', serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const sans = { fontFamily: "'Manrope', sans-serif" };

// ── Number formatters ─────────────────────────────────────────────
const fmtK = (n) => {
  const a = Math.abs(n);
  const s = a >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : a >= 1000 ? `$${Math.round(n / 1000)}K` : `$${Math.round(n)}`;
  return n < 0 ? s.replace('$', '–$') : s;
};
const fmtMoney = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ═══════════════════════════════════════════════════════════════════
//  Break-even chart — cumulative net over 24 months (the J-curve)
// ═══════════════════════════════════════════════════════════════════
function BreakEvenChart() {
  const W = 760, H = 380;
  const padL = 56, padR = 28, padT = 28, padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const cums = MONTHLY.map((r) => r.cum);
  const yMin = Math.min(...cums, 0) * 1.15;
  const yMax = Math.max(...cums) * 1.06;

  const x = (m) => padL + ((m - 1) / (MONTHLY.length - 1)) * plotW;
  const y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const pts = MONTHLY.map((r) => [x(r.m), y(r.cum)]);
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(24).toFixed(1)},${y(yMin).toFixed(1)} L${x(1).toFixed(1)},${y(yMin).toFixed(1)} Z`;

  const be = breakEvenRow();
  const beX = x(be.m), beY = y(be.cum);

  const yTicks = [0, 10000, 20000, 30000];
  const xTicks = [1, 6, 12, 18, 24];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="feArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.gold} stopOpacity="0.30" />
          <stop offset="100%" stopColor={T.gold} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="feLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={T.goldDeep} />
          <stop offset="18%" stopColor={T.gold} />
          <stop offset="100%" stopColor={T.goldBright} />
        </linearGradient>
      </defs>

      {/* y gridlines + labels */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)}
            stroke={t === 0 ? 'rgba(243,237,225,0.28)' : T.borderSoft}
            strokeWidth={t === 0 ? 1.2 : 1}
            strokeDasharray={t === 0 ? '4 4' : undefined} />
          <text x={padL - 10} y={y(t) + 4} textAnchor="end" style={mono}
            fontSize="11" fill={t === 0 ? T.text2 : T.text3}>{fmtK(t)}</text>
        </g>
      ))}

      {/* x labels */}
      {xTicks.map((m) => (
        <text key={m} x={x(m)} y={H - padB + 22} textAnchor="middle" style={mono}
          fontSize="11" fill={T.text3}>M{m}</text>
      ))}

      {/* area + line */}
      <path d={areaPath} fill="url(#feArea)" />
      <path d={linePath} fill="none" stroke="url(#feLine)" strokeWidth="2.6"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* break-even marker + callout */}
      <line x1={beX} y1={beY} x2={beX} y2={y(0)} stroke={T.gold} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <circle cx={beX} cy={beY} r="6.5" fill={T.bg} stroke={T.goldBright} strokeWidth="2.2" />
      <circle cx={beX} cy={beY} r="2.5" fill={T.goldBright} />
      <g transform={`translate(${beX + 14}, ${beY - 46})`}>
        <rect x="0" y="0" width="150" height="40" rx="8"
          fill="rgba(20,16,10,0.92)" stroke={T.border} />
        <text x="12" y="17" style={{ ...sans }} fontSize="11.5" fontWeight="700" fill={T.goldBright}>
          Break-even · Month {be.m}
        </text>
        <text x="12" y="31" style={mono} fontSize="11" fill={T.text2}>
          Cumulative net {fmtK(be.cum).replace('$', '+$')}
        </text>
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  LTV : CAC comparison bars
// ═══════════════════════════════════════════════════════════════════
function LtvCacBars() {
  const ltvLo = METRICS.blendedLtv[0], ltvHi = METRICS.blendedLtv[1];
  const cacLo = METRICS.blendedCac[0], cacHi = METRICS.blendedCac[1];
  const max = Math.max(ltvHi, cacHi);
  const bar = (lo, hi, color, label, sub) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ ...sans, fontSize: 13, color: T.cream, fontWeight: 600 }}>{label}</span>
        <span style={{ ...mono, fontSize: 13, color }}>${lo}–${hi}</span>
      </div>
      <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{
          width: `${(hi / max) * 100}%`, height: '100%', borderRadius: 7,
          background: `linear-gradient(90deg, ${T.goldDeep}, ${color})`,
        }} />
      </div>
      <div style={{ ...sans, fontSize: 11, color: T.text3, marginTop: 5 }}>{sub}</div>
    </div>
  );
  return (
    <div>
      {bar(ltvLo, ltvHi, T.goldBright, 'Blended LTV', 'one-time price × repeat factor (2–3× relocation)')}
      {bar(cacLo, cacHi, T.gold, 'Blended CAC', 'organic-first: SEO + Reddit + founder content')}
      <div style={{
        marginTop: 16, padding: '12px 14px', borderRadius: 10,
        background: 'rgba(202,160,90,0.07)', border: `1px solid ${T.border}`,
      }}>
        <span style={{ ...serif, fontSize: 26, color: T.goldBright }}>{ltvCacMidpoint().toFixed(1)}:1</span>
        <span style={{ ...sans, fontSize: 12, color: T.text2, marginLeft: 10 }}>
          LTV:CAC — lean by design (one-time model, not subscription)
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Stat card
// ═══════════════════════════════════════════════════════════════════
function Stat({ value, label, sub }) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 150, padding: '18px 20px', borderRadius: 14,
      background: T.panel, border: `1px solid ${T.border}`,
    }}>
      <div style={{ ...serif, fontSize: 34, lineHeight: 1, color: T.goldBright }}>{value}</div>
      <div style={{ ...sans, fontSize: 13, color: T.cream, fontWeight: 600, marginTop: 8 }}>{label}</div>
      <div style={{ ...sans, fontSize: 11.5, color: T.text3, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Screen
// ═══════════════════════════════════════════════════════════════════
export default function FinancialsView() {
  const card = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24 };
  const th = { ...sans, fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'left', padding: '0 0 10px' };
  const td = { ...sans, fontSize: 13.5, color: T.cream, padding: '11px 0', borderTop: `1px solid ${T.borderSoft}` };

  return (
    <div style={{ ...sans, background: T.bg, color: T.cream, minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ ...sans, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, color: T.gold, textTransform: 'uppercase' }}>
            The model
          </div>
          <h1 style={{ ...serif, fontSize: 46, lineHeight: 1.05, color: T.cream, margin: '6px 0 0' }}>
            Break-even at Month 4. <span style={{ color: T.goldBright }}>API cost under 2% of revenue.</span>
          </h1>
          <p style={{ ...sans, fontSize: 15, color: T.text2, maxWidth: 620, marginTop: 12 }}>
            A 24-month base case built from stated assumptions — re-derivable in 60 seconds.
            AI-native, so startup cost is ~$1,000 and the marginal cost of one user is one API call.
          </p>
        </div>

        {/* Stat band */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
          <Stat value={`Month ${METRICS.breakEvenMonth}`} label="Break-even" sub={`${METRICS.breakEvenPaidUsers} cumulative paid users`} />
          <Stat value={`${METRICS.grossMarginPlusRun}%`} label="Gross margin / Plus run" sub={`$3.33 revenue vs $${METRICS.apiCogsPerRun} COGS`} />
          <Stat value={`<${Math.ceil(METRICS.cogsPctOfRevenue)}%`} label="API COGS of revenue" sub="Haiku + 1 web search per run" />
          <Stat value={fmtK(METRICS.finalCum)} label="Cumulative net · M24" sub="from a ~$1,000 startup cost" />
        </div>

        {/* Break-even chart */}
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <h2 style={{ ...serif, fontSize: 24, color: T.cream, margin: 0 }}>Cumulative net income</h2>
            <span style={{ ...mono, fontSize: 11, color: T.text3 }}>model.csv · 24 months</span>
          </div>
          <BreakEvenChart />
        </div>

        {/* Two columns: unit economics + LTV:CAC */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 24 }}>
          <div style={card}>
            <h2 style={{ ...serif, fontSize: 24, color: T.cream, margin: '0 0 14px' }}>Unit economics by tier</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Tier</th>
                  <th style={{ ...th, textAlign: 'right' }}>Price</th>
                  <th style={{ ...th, textAlign: 'right' }}>Mix</th>
                  <th style={{ ...th, textAlign: 'right' }}>LTV</th>
                  <th style={{ ...th, textAlign: 'right' }}>Margin</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((t) => (
                  <tr key={t.id}>
                    <td style={td}>
                      <span style={{ fontWeight: 600 }}>{t.name}</span>
                      {t.badge && (
                        <span style={{
                          ...sans, fontSize: 10, fontWeight: 700, marginLeft: 8, padding: '2px 7px',
                          borderRadius: 6, color: T.bg, background: T.goldBright,
                        }}>{t.badge}</span>
                      )}
                      <div style={{ ...sans, fontSize: 11, color: T.text3 }}>{t.runs}</div>
                    </td>
                    <td style={{ ...td, ...mono, textAlign: 'right' }}>${t.price}</td>
                    <td style={{ ...td, ...mono, textAlign: 'right', color: T.text2 }}>{t.mixPct}%</td>
                    <td style={{ ...td, ...mono, textAlign: 'right', color: T.goldBright }}>~${t.ltv}</td>
                    <td style={{ ...td, ...mono, textAlign: 'right', color: T.pos }}>{t.margin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ ...sans, fontSize: 11.5, color: T.text3, marginTop: 14, lineHeight: 1.5 }}>
              Blended revenue per paid user ~${METRICS.blendedRevPerPaidUser[0]}–${METRICS.blendedRevPerPaidUser[1]} ·
              tier mix {TIERS.map((t) => `${t.mixPct}`).join('/')} [ASSUMED] ·
              one-time purchases, no consumer subscription.
            </div>
          </div>

          <div style={card}>
            <h2 style={{ ...serif, fontSize: 24, color: T.cream, margin: '0 0 18px' }}>LTV : CAC</h2>
            <LtvCacBars />
          </div>
        </div>

        {/* Footer / source line */}
        <p style={{ ...mono, fontSize: 11, color: T.text3, marginTop: 24, lineHeight: 1.6 }}>
          Source: pitch/financials/model.csv + summary.md · API COGS cited from Anthropic pricing
          [FOUNDER-VERIFY: F3] · conversion anchored to FirstPageSage/Userpilot 2–5% SaaS freemium benchmark.
        </p>
      </div>
    </div>
  );
}
