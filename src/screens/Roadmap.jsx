// ══════════════════════════════════════════════════════════════════
// ROADMAP — Offline personalized 6-section relocation roadmap.
//
// Renders the compiled roadmap for a selected city offline — no network
// calls on the render path (ROAD-03). Calls buildRoadmapForRow (pure),
// which compiles the authored template from the flat UI row.
//
// Print/PDF: an inline @media print stylesheet inside the same CSS
// template literal (ResultsMap.jsx convention — NOT a separate .css file).
// Source names/URLs are rendered as styled TEXT only — never <a> (D-10 / T-06-08).
// ══════════════════════════════════════════════════════════════════

import { buildRoadmapForRow } from '../lib/matchEngine.js';

const CSS = `
.rdm{
  --bg:#070a11; --bg2:#0d1119; --card:rgba(255,255,255,.04); --border:rgba(243,237,225,.12); --border2:rgba(243,237,225,.24);
  --accent:#e2b56b; --accent-ink:#13100a; --accent-dim:rgba(226,181,107,.13);
  --ink:#f3ede1; --dim:rgba(243,237,225,.56); --faint:rgba(243,237,225,.3);
  --serif:'Instrument Serif',serif; --mono:'JetBrains Mono',monospace;
  font-family:'Manrope',sans-serif; color:var(--ink); min-height:100vh;
  background:var(--bg);
  background-image:radial-gradient(120% 80% at 50% -10%, var(--bg2), var(--bg) 60%);
  -webkit-font-smoothing:antialiased;

  .rdm-top{
    display:flex; align-items:center; justify-content:space-between; gap:16px;
    padding:20px 28px; border-bottom:1px solid var(--border);
    position:sticky; top:0;
    background:color-mix(in srgb,var(--bg) 82%,transparent);
    backdrop-filter:blur(12px); z-index:20;
  }
  .rdm-brand{ font-family:var(--serif); font-size:22px; letter-spacing:.5px }
  .rdm-brand small{ font-style:italic; opacity:.55; font-size:13px }
  .rdm-btn{
    font-family:inherit; font-size:13px; color:var(--dim);
    background:var(--card); border:1px solid var(--border); border-radius:10px;
    padding:8px 14px; cursor:pointer; transition:.2s;
  }
  .rdm-btn:hover{ color:var(--accent); border-color:var(--accent) }
  .rdm-btn-export{
    font-family:inherit; font-size:13px; font-weight:700;
    color:var(--accent-ink); background:var(--accent); border:none;
    border-radius:10px; padding:9px 18px; cursor:pointer; transition:.2s;
    letter-spacing:0.03em;
  }
  .rdm-btn-export:hover{ opacity:.9 }
  .rdm-actions{ display:flex; gap:10px; align-items:center }

  .rdm-wrap{ max-width:720px; margin:0 auto; padding:32px 24px 80px }
  .rdm-header{ margin-bottom:32px }
  .rdm-title{ font-family:var(--serif); font-size:34px; margin:0 0 6px; line-height:1.15 }
  .rdm-subtitle{ color:var(--dim); font-size:14px; margin:0 }

  .rdm-section{
    background:var(--card); border:1px solid var(--border); border-radius:16px;
    padding:22px 24px; margin-bottom:14px;
  }
  .rdm-section-title{
    font-size:11px; text-transform:uppercase; letter-spacing:0.12em;
    color:var(--accent); font-weight:700; margin:0 0 16px;
  }
  .rdm-step{ margin-bottom:16px }
  .rdm-step:last-child{ margin-bottom:0 }
  .rdm-step-label{ font-size:15px; font-weight:700; margin:0 0 6px; color:var(--ink) }
  .rdm-step-detail{ font-size:14px; line-height:1.75; color:var(--dim); margin:0 }
  .rdm-step-source{
    font-size:11px; color:var(--faint); font-family:var(--mono);
    margin-top:6px; display:block; font-style:normal;
  }

  @media(max-width:560px){
    .rdm-title{ font-size:26px }
    .rdm-wrap{ padding:20px 16px 70px }
    .rdm-btn-export{ font-size:12px; padding:8px 14px }
  }

  @media print{
    /* Hide all app chrome, nav, and action buttons */
    .rdm-top, .rdm-actions, .no-print{ display:none !important }

    /* Drop dark theme — white/black ink for print/PDF */
    .rdm, .rdm-wrap, .rdm-section, .rdm-step, .rdm-header{
      background:#fff !important;
      color:#000 !important;
      border-color:#ccc !important;
      box-shadow:none !important;
      backdrop-filter:none !important;
    }
    .rdm-title, .rdm-step-label{ color:#000 !important }
    .rdm-subtitle, .rdm-step-detail{ color:#333 !important }
    .rdm-section-title{ color:#555 !important }
    .rdm-step-source{ color:#666 !important }

    /* Prevent awkward page-splits through a single section */
    .rdm-section{
      break-inside:avoid;
      page-break-inside:avoid;
      margin-bottom:20px !important;
      padding:16px !important;
      border:1px solid #ccc !important;
      border-radius:0 !important;
    }

    /* Remove sticky/fixed positioning */
    .rdm-top{ position:static !important }

    /* Let the content fill the printable area */
    .rdm-wrap{ max-width:100% !important; padding:0 !important }
    .rdm{ min-height:0 !important }
  }
}
`;

/**
 * Roadmap screen — offline 6-section relocation roadmap.
 *
 * @param {object} row     - A scored result row from scoreProfile() (flat: ...city + financials)
 * @param {object} profile - The quiz profile (citizenship, profession, housing)
 * @param {function} onBack - Called when user presses Back to return to city detail
 */
export default function Roadmap({ row, profile, onBack }) {
  // Compile the roadmap offline — pure, deterministic, no network (ROAD-03).
  const roadmap = buildRoadmapForRow(profile, row);

  // Section display names (human-readable labels for the 6 canonical IDs).
  const SECTION_ICONS = {
    timeline:  '🗓',
    financial: '💰',
    jobs:      '💼',
    housing:   '🏠',
    logistics: '📦',
    visa:      '🛂',
  };

  return (
    <div className="rdm">
      <style>{CSS}</style>

      {/* Sticky header with nav and actions */}
      <div className="rdm-top">
        <div className="rdm-brand">Potential <small>°</small></div>
        <div className="rdm-actions no-print">
          <button className="rdm-btn" onClick={onBack}>← Back</button>
          <button className="rdm-btn-export" onClick={() => window.print()}>Export PDF</button>
        </div>
      </div>

      {/* Main content */}
      <div className="rdm-wrap">
        {/* Hero */}
        <div className="rdm-header">
          <h1 className="rdm-title">Relocation Roadmap: {roadmap.cityName}</h1>
          <p className="rdm-subtitle">
            Your personalized 6-section plan — compiled offline, print-ready.
          </p>
        </div>

        {/* 6 roadmap sections */}
        {roadmap.sections.map((section) => (
          <div key={section.id} className="rdm-section">
            <p className="rdm-section-title">
              {SECTION_ICONS[section.id] ?? ''} {section.title}
            </p>
            {section.steps.map((step, i) => (
              <div key={i} className="rdm-step">
                <p className="rdm-step-label">{step.label}</p>
                <p className="rdm-step-detail">{step.detail}</p>
                {/* Source name rendered as TEXT — never a clickable link (D-10 / T-06-08) */}
                {step.sourceUrl && (
                  <span className="rdm-step-source">
                    Source: {step.sourceUrl}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
