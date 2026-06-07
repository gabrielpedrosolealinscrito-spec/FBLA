// ─────────────────────────────────────────────────────────────────
// Potential — FinancialsView
// Full in-app financials screen (PITCH-05). Composes the shared parts.
// For deck-framed 16:9 exports see financials/SlideModel + SlideLtv.
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { METRICS, TIERS } from '../../shared/data/financials.js';
import {
  T, serif, mono, sans, fmtK,
  BreakEvenChart, LtvCacBars, TierTable, Stat,
} from './financials/parts.jsx';

export default function FinancialsView() {
  const card = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24 };

  return (
    <div style={{ ...sans, background: T.bg, color: T.cream, minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ ...sans, fontSize: 12, fontWeight: 700, letterSpacing: 1.4, color: T.gold, textTransform: 'uppercase' }}>
            The model
          </div>
          <h1 style={{ ...serif, fontSize: 46, lineHeight: 1.05, color: T.cream, margin: '6px 0 0' }}>
            Break-even at Month 4. <span style={{ color: T.goldBright }}>API cost under 2% of revenue.</span>
          </h1>
          <p style={{ ...sans, fontSize: 15, color: T.text2, maxWidth: 620, marginTop: 12 }}>
            A 24-month base case built from stated assumptions, re-derivable in 60 seconds.
            AI-native, so startup cost is ~$1,000 and the marginal cost of one user is one API call.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
          <Stat value={`Month ${METRICS.breakEvenMonth}`} label="Break-even" sub={`${METRICS.breakEvenPaidUsers} cumulative paid users`} />
          <Stat value={`${METRICS.grossMarginPlusRun}%`} label="Gross margin / Plus run" sub={`$3.33 revenue vs $${METRICS.apiCogsPerRun} COGS`} />
          <Stat value={`<${Math.ceil(METRICS.cogsPctOfRevenue)}%`} label="API COGS of revenue" sub="Haiku + 1 web search per run" />
          <Stat value={fmtK(METRICS.finalCum)} label="Cumulative net · M24" sub="from a ~$1,000 startup cost" />
        </div>

        <div style={{ ...card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <h2 style={{ ...serif, fontSize: 24, color: T.cream, margin: 0 }}>Cumulative net income</h2>
            <span style={{ ...mono, fontSize: 11, color: T.text3 }}>model.csv · 24 months</span>
          </div>
          <BreakEvenChart />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 24 }}>
          <div style={card}>
            <h2 style={{ ...serif, fontSize: 24, color: T.cream, margin: '0 0 14px' }}>Unit economics by tier</h2>
            <TierTable />
            <div style={{ ...sans, fontSize: 11.5, color: T.text3, marginTop: 14, lineHeight: 1.5 }}>
              Blended revenue per paid user ~${METRICS.blendedRevPerPaidUser[0]}-${METRICS.blendedRevPerPaidUser[1]} ·
              tier mix {TIERS.map((t) => `${t.mixPct}`).join('/')} [ASSUMED] ·
              one-time purchases, no consumer subscription.
            </div>
          </div>

          <div style={card}>
            <h2 style={{ ...serif, fontSize: 24, color: T.cream, margin: '0 0 18px' }}>LTV : CAC</h2>
            <LtvCacBars />
          </div>
        </div>

        <p style={{ ...mono, fontSize: 11, color: T.text3, marginTop: 24, lineHeight: 1.6 }}>
          Source: pitch/financials/model.csv + summary.md · API COGS cited from Anthropic pricing
          [FOUNDER-VERIFY: F3] · conversion anchored to FirstPageSage/Userpilot 2-5% SaaS freemium benchmark.
        </p>
      </div>
    </div>
  );
}
