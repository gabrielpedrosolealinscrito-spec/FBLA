// ─────────────────────────────────────────────────────────────────
// Deck Slide 9 — Financials: Model + Unit Economics (16:9)
// Screenshot at 1920×1080 for Canva. Route: #/financials/model
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { METRICS, TIERS } from '../../../shared/data/financials.js';
import { T, serif, mono, sans, fmtK, BreakEvenChart, TierTable } from './parts.jsx';

export default function SlideModel() {
  const card = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22 };
  return (
    <div style={{ ...sans, width: '100vw', height: '100vh', background: T.bg, color: T.cream, display: 'flex', flexDirection: 'column', padding: '46px 60px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.6, color: T.gold, textTransform: 'uppercase' }}>
            Financials · the model
          </div>
          <h1 style={{ ...serif, fontSize: 44, lineHeight: 1.04, margin: '6px 0 0' }}>
            Break-even at Month 4. <span style={{ color: T.goldBright }}>API cost under 2% of revenue.</span>
          </h1>
        </div>
        <div style={{ ...mono, fontSize: 12, color: T.text3, textAlign: 'right' }}>
          24-month base case<br />model.csv · re-derivable in 60s
        </div>
      </div>

      {/* Main row */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 26, marginTop: 26, minHeight: 0 }}>
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <h2 style={{ ...serif, fontSize: 24, margin: 0 }}>Cumulative net income</h2>
            <span style={{ ...mono, fontSize: 11, color: T.text3 }}>USD · months 1-24</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <BreakEvenChart />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              [`Month ${METRICS.breakEvenMonth}`, 'Break-even'],
              [`${METRICS.grossMarginPlusRun}%`, 'Gross margin / Plus run'],
              [`<${Math.ceil(METRICS.cogsPctOfRevenue)}%`, 'API COGS of revenue'],
              [fmtK(METRICS.finalCum), 'Cumulative net · M24'],
            ].map(([v, l]) => (
              <div key={l} style={{ ...card, padding: '16px 18px' }}>
                <div style={{ ...serif, fontSize: 30, lineHeight: 1, color: T.goldBright }}>{v}</div>
                <div style={{ fontSize: 12.5, color: T.cream, fontWeight: 600, marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card, flex: 1 }}>
            <h2 style={{ ...serif, fontSize: 21, margin: '0 0 10px' }}>Unit economics by tier</h2>
            <TierTable />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ ...mono, fontSize: 10.5, color: T.text3, marginTop: 18 }}>
        Startup cost ~${METRICS.startupCost.toLocaleString()} (AI-native) · API COGS $0.06/run cited from Anthropic pricing
        [FOUNDER-VERIFY: F3] · conversion 5-8% anchored to FirstPageSage/Userpilot SaaS freemium benchmark · Slide 9
      </div>
    </div>
  );
}
