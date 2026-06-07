// ─────────────────────────────────────────────────────────────────
// Deck Slide 10 — Financials: Break-Even + LTV:CAC (16:9)
// Screenshot at 1920×1080 for Canva. Route: #/financials/ltv
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { METRICS, TIERS } from '../../../shared/data/financials.js';
import { T, serif, mono, sans, LtvCacBars } from './parts.jsx';

export default function SlideLtv() {
  const card = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 };
  return (
    <div style={{ ...sans, width: '100vw', height: '100vh', background: T.bg, color: T.cream, display: 'flex', flexDirection: 'column', padding: '46px 60px', overflow: 'hidden' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.6, color: T.gold, textTransform: 'uppercase' }}>
          Financials · unit economics
        </div>
        <h1 style={{ ...serif, fontSize: 44, lineHeight: 1.04, margin: '6px 0 0' }}>
          Positive unit economics, <span style={{ color: T.goldBright }}>by design.</span>
        </h1>
      </div>

      {/* Main row */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 26, marginTop: 26, minHeight: 0 }}>
        {/* LTV by tier */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ ...serif, fontSize: 24, margin: '0 0 16px' }}>Lifetime value by tier</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {TIERS.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 12, background: T.panel2, border: `1px solid ${T.borderSoft}` }}>
                <div>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{t.name}</span>
                  {t.badge && (
                    <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 8, padding: '2px 7px', borderRadius: 6, color: T.bg, background: T.goldBright }}>{t.badge}</span>
                  )}
                  <div style={{ ...mono, fontSize: 11.5, color: T.text3, marginTop: 3 }}>${t.price} · {t.runs} · {t.margin}% margin</div>
                </div>
                <div style={{ ...serif, fontSize: 30, color: T.goldBright }}>~${t.ltv}</div>
              </div>
            ))}
          </div>
          <div style={{ ...mono, fontSize: 11, color: T.text3, marginTop: 14 }}>
            LTV = price × (1 + repeat factor) · 2-3× relocation in the 22-35 cohort [FOUNDER-VERIFY: F7]
          </div>
        </div>

        {/* LTV:CAC + defense */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={card}>
            <h2 style={{ ...serif, fontSize: 24, margin: '0 0 18px' }}>LTV : CAC</h2>
            <LtvCacBars />
          </div>
          <div style={{ ...card, flex: 1, background: 'rgba(202,160,90,0.06)' }}>
            <div style={{ ...serif, fontSize: 19, color: T.cream, lineHeight: 1.4 }}>
              The 1.4:1 ratio is intentional.
            </div>
            <p style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.55, marginTop: 8 }}>
              Relocation is a one-time decision. Charging monthly for it destroys the
              relationship. We earn repeat revenue from natural life recurrence, not a
              subscription. The moat is data and trust, then the B2B layer.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ ...mono, fontSize: 10.5, color: T.text3, marginTop: 18 }}>
        Blended LTV ~${METRICS.blendedLtv[0]}-${METRICS.blendedLtv[1]} vs blended CAC ~${METRICS.blendedCac[0]}-${METRICS.blendedCac[1]}
        (organic-first) · positive from Month 1 · Source: financials/summary.md · Slide 10
      </div>
    </div>
  );
}
