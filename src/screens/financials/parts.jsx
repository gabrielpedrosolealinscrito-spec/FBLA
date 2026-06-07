// ─────────────────────────────────────────────────────────────────
// Potential — Financials shared parts
// Tokens, formatters, and SVG/visual components reused by:
//   • FinancialsView.jsx        (full in-app screen)
//   • SlideModel.jsx            (deck Slide 9, 16:9)
//   • SlideLtv.jsx              (deck Slide 10, 16:9)
// Gold cinematic palette (matches Landing.jsx; gold over mint).
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { MONTHLY, TIERS, METRICS, breakEvenRow, ltvCacMidpoint } from '../../../shared/data/financials.js';

export const T = {
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
export const serif = { fontFamily: "'Instrument Serif', serif" };
export const mono = { fontFamily: "'JetBrains Mono', monospace" };
export const sans = { fontFamily: "'Manrope', sans-serif" };

export const fmtK = (n) => {
  const a = Math.abs(n);
  const s = a >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : a >= 1000 ? `$${Math.round(n / 1000)}K` : `$${Math.round(n)}`;
  return n < 0 ? s.replace('$', '-$') : s;
};

// ═══════════════════════════════════════════════════════════════════
//  Break-even chart — cumulative net over 24 months (the J-curve)
// ═══════════════════════════════════════════════════════════════════
export function BreakEvenChart() {
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

      {xTicks.map((m) => (
        <text key={m} x={x(m)} y={H - padB + 22} textAnchor="middle" style={mono}
          fontSize="11" fill={T.text3}>M{m}</text>
      ))}

      <path d={areaPath} fill="url(#feArea)" />
      <path d={linePath} fill="none" stroke="url(#feLine)" strokeWidth="2.6"
        strokeLinejoin="round" strokeLinecap="round" />

      <line x1={beX} y1={beY} x2={beX} y2={y(0)} stroke={T.gold} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <circle cx={beX} cy={beY} r="6.5" fill={T.bg} stroke={T.goldBright} strokeWidth="2.2" />
      <circle cx={beX} cy={beY} r="2.5" fill={T.goldBright} />
      <g transform={`translate(${beX + 14}, ${beY - 46})`}>
        <rect x="0" y="0" width="150" height="40" rx="8" fill="rgba(20,16,10,0.92)" stroke={T.border} />
        <text x="12" y="17" style={sans} fontSize="11.5" fontWeight="700" fill={T.goldBright}>
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
export function LtvCacBars() {
  const [ltvLo, ltvHi] = METRICS.blendedLtv;
  const [cacLo, cacHi] = METRICS.blendedCac;
  const max = Math.max(ltvHi, cacHi);
  const bar = (lo, hi, color, label, sub) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ ...sans, fontSize: 13, color: T.cream, fontWeight: 600 }}>{label}</span>
        <span style={{ ...mono, fontSize: 13, color }}>${lo}-${hi}</span>
      </div>
      <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ width: `${(hi / max) * 100}%`, height: '100%', borderRadius: 7, background: `linear-gradient(90deg, ${T.goldDeep}, ${color})` }} />
      </div>
      <div style={{ ...sans, fontSize: 11, color: T.text3, marginTop: 5 }}>{sub}</div>
    </div>
  );
  return (
    <div>
      {bar(ltvLo, ltvHi, T.goldBright, 'Blended LTV', 'one-time price × repeat factor (2-3× relocation)')}
      {bar(cacLo, cacHi, T.gold, 'Blended CAC', 'organic-first: SEO + Reddit + founder content')}
      <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(202,160,90,0.07)', border: `1px solid ${T.border}` }}>
        <span style={{ ...serif, fontSize: 26, color: T.goldBright }}>{ltvCacMidpoint().toFixed(1)}:1</span>
        <span style={{ ...sans, fontSize: 12, color: T.text2, marginLeft: 10 }}>
          LTV:CAC, lean by design (one-time model, not subscription)
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Unit economics table
// ═══════════════════════════════════════════════════════════════════
export function TierTable() {
  const th = { ...sans, fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'left', padding: '0 0 10px' };
  const td = { ...sans, fontSize: 13.5, color: T.cream, padding: '11px 0', borderTop: `1px solid ${T.borderSoft}` };
  return (
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
                <span style={{ ...sans, fontSize: 10, fontWeight: 700, marginLeft: 8, padding: '2px 7px', borderRadius: 6, color: T.bg, background: T.goldBright }}>{t.badge}</span>
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
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Stat card
// ═══════════════════════════════════════════════════════════════════
export function Stat({ value, label, sub }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 150, padding: '18px 20px', borderRadius: 14, background: T.panel, border: `1px solid ${T.border}` }}>
      <div style={{ ...serif, fontSize: 34, lineHeight: 1, color: T.goldBright }}>{value}</div>
      <div style={{ ...sans, fontSize: 13, color: T.cream, fontWeight: 600, marginTop: 8 }}>{label}</div>
      <div style={{ ...sans, fontSize: 11.5, color: T.text3, marginTop: 3 }}>{sub}</div>
    </div>
  );
}
