// ─────────────────────────────────────────────────────────────────
// Potential — Visa Pathways Data Module (Phase 7, D-05/VISA-02/VISA-03)
// Authored TS constants — every figure cited to an official authority.
//
// Authored-truth boundary (D-05): No LLM-invented visa facts.
// All values in this file are transcribed from .planning/phases/07-visa-concierge/07-RESEARCH.md.
// Zero network calls on the concierge render path (D-01 offline-mandatory).
//
// Sources:
//   Portugal D8:
//     AIMA — Agência para a Integração, Migrações e Asilo (aima.gov.pt)
//       Residence permit authorization, fee schedule, appointment scheduling.
//     Ministério dos Negócios Estrangeiros / vistos.mne.gov.pt
//       National visa D8 requirements and consular process.
//     Portal das Finanças (portaldasfinancas.gov.pt)
//       NIF registration, rental-lease Finanças registration.
//
//   Canada Express Entry — Federal Skilled Worker (FSW):
//     IRCC — Immigration, Refugees and Citizenship Canada (canada.ca/express-entry)
//       CRS criteria, eligibility, draw history.
//     IRCC fee list (ircc.canada.ca/english/information/fees/fees.asp)
//       Processing fee CAD $990 + RPRF CAD $600 — effective April 30, 2026.
//     IRCC proof of funds (canada.ca/en/immigration-refugees-citizenship/services/
//       immigrate-canada/express-entry/documents/proof-funds)
//       Settlement fund requirements (2026 LICO table).
//
//   Data as of: 2026-06-05 (authoring date)
//   Confidence: MEDIUM — official .gov sites returned 403 at research time;
//   figures cross-verified against 3+ immigration guides/attorneys
//   consistent as of March–June 2026. VERIFY AT OFFICIAL AUTHORITIES
//   before presenting to users (see Task 3 human-verify checkpoint).
// ─────────────────────────────────────────────────────────────────

import type { VisaPathway } from '../types.js';

// ── Portugal D8 — Digital Nomad / Remote Work Visa ────────────────────────────

export const PORTUGAL_D8: VisaPathway = {
  destinationCountry: 'Portugal',
  visaType: 'Portugal D8 — Digital Nomad / Remote Work Visa',
  requirements: [
    'Proof of remote income ≥ €3,680/month (4× Portuguese minimum wage, Jan 2026)',
    'Employment contract or service agreements with non-Portuguese clients',
    'Health insurance with ≥ €30,000 coverage (Schengen-compliant)',
    'Criminal record certificate (apostilled, issued within 90 days)',
    'Proof of accommodation in Portugal (12-month lease, Finanças-registered)',
    'NIF (Portuguese tax number) — obtainable before arrival via consulate',
    'Portuguese or foreign bank account showing regular income history',
  ],
  processingTime: '4–9 months total (consulate: 4–8 weeks; AIMA appointment: 90–120 days backlog; card: 2–6 weeks)',
  feeRangeUSD: '$300–$330 in gov fees (consulate visa €90–110 + AIMA residence permit €170; EUR/USD 1.164 Jun 2026 — verify at authoring)',
  pros: [
    'No Portuguese employer required — remote income from non-PT clients qualifies',
    'Schengen Area travel with residence permit',
    'Path to permanent residency (5 years) and citizenship (5 years)',
    'NHR tax regime may apply (verify current eligibility)',
    'Lower cost of living vs. US or UK despite income threshold',
  ],
  cons: [
    'AIMA appointment backlogs: 400,000+ cases reported in 2026; total timeline 4–9 months',
    'Income threshold resets annually with Portuguese minimum wage (verify at AIMA at your appointment date)',
    'Savings of ≥ €11,040 (12× minimum wage) also required — not just monthly income',
    'Accommodation must be pre-secured before the visa application',
    'Portugal-sourced income does NOT count toward the 4× minimum-wage threshold',
  ],
  documentChecklist: [
    'Completed D8 national visa application form',
    'Valid passport (≥ 6 months validity, 2+ blank pages)',
    'Two recent passport photos (4.5 × 3.5 cm)',
    'Remote work proof: employment contract / freelance service agreements with foreign clients',
    'Bank statements (last 3 months) showing regular income deposits',
    'Proof of savings: ≥ €11,040 in bank (12× minimum wage)',
    'Criminal record certificate: apostilled + certified translation, issued within 90 days',
    'Health insurance certificate: ≥ €30,000 coverage, Schengen-compliant',
    '12-month rental lease registered at Portal das Finanças (or equivalent accommodation proof)',
    'NIF registration certificate (Portuguese tax number)',
    'Cover / motivation letter in English or Portuguese',
    'Fee payment confirmation (consulate visa fee: ~€110)',
  ],
  officialSources: [
    'AIMA — Agência para a Integração, Migrações e Asilo (aima.gov.pt): residence permit authorization, fees, appointment scheduling',
    'Ministério dos Negócios Estrangeiros / vistos.mne.gov.pt: national visa D8 requirements and consular process',
    'Portal das Finanças (portaldasfinancas.gov.pt): NIF registration, rental-lease Finanças registration',
    'Data as of: 2026-06-05 — verify current minimum wage (4× rule) and AIMA fee schedule before authoring final content',
  ],
};

// ── Canada Express Entry — Federal Skilled Worker (FSW) ──────────────────────

export const CANADA_EXPRESS_ENTRY: VisaPathway = {
  destinationCountry: 'Canada',
  visaType: 'Canada Express Entry — Federal Skilled Worker (FSW)',
  requirements: [
    'Competitive CRS (Comprehensive Ranking System) score — general draws typically require ~480–550+ as of 2025–2026',
    'At least 1 year skilled work experience in an eligible NOC TEER 0, 1, 2, or 3 occupation',
    'Language: IELTS or CELPIP (English) or TEF/TCF (French) at minimum CLB 7',
    'Education: post-secondary credential assessed by a designated ECA organization',
    'Proof of settlement funds: CAD $15,263 for a single applicant (2026 LICO table)',
    'No valid Canadian employer sponsorship required — the March 25, 2025 rule change removed the former employer-based CRS bonus',
  ],
  processingTime: '6–8 months post-ITA (Invitation to Apply); 60-day window to submit complete PR application after ITA',
  feeRangeUSD: '~$1,140 government fees (CAD $1,590 = processing $990 + RPRF $600; CAD/USD 0.719 Jun 2026) — excludes ECA ($200–300 CAD), language tests ($300–350 CAD), biometrics ($85 CAD)',
  pros: [
    'No employer sponsorship required for FSW pathway',
    'Direct permanent residence (not a temporary visa) — immediate right to live and work',
    'Family members included in one application',
    'Universal public healthcare (provincial) once PR is issued',
    'Pathway to Canadian citizenship (3 years as PR)',
  ],
  cons: [
    'CRS score requirement is high: general draws typically require 480–550+ since the employer-based CRS bonus was removed in March 2025',
    'Remote work for foreign companies does NOT count as Canadian work experience for CRS scoring',
    'Education Credential Assessment required for non-Canadian degrees (adds $200–300 CAD cost and 3–5 months)',
    'Language tests (IELTS/CELPIP) must be taken and results valid — additional cost and timeline',
    'Proof of settlement funds (CAD $15,263 single) must be liquid and not borrowed',
  ],
  documentChecklist: [
    'Valid passport or travel document',
    'Language test results: IELTS / CELPIP (English) or TEF / TCF (French) — within validity period',
    'Educational Credential Assessment (ECA) report from a designated organization (e.g. WES)',
    'Proof of work experience: employment reference letters, pay stubs, contracts (NOC-aligned)',
    'Proof of settlement funds: bank letter or statements showing CAD $15,263+ (single applicant)',
    'Police clearance certificate(s): for every country lived in ≥ 6 consecutive months since age 18',
    'Medical examination results (to be done after receiving ITA, from IRCC-approved physician)',
    'Birth certificate',
    'Marriage / divorce documents (if applicable)',
    'Recent passport-sized photographs (applicant and dependents)',
  ],
  officialSources: [
    'IRCC — Immigration, Refugees and Citizenship Canada (canada.ca/express-entry): CRS criteria, eligibility, draw history',
    'IRCC fee list (ircc.canada.ca/english/information/fees/fees.asp): processing fee CAD $990 + RPRF CAD $600 — effective April 30, 2026',
    'IRCC proof of funds (canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds): CAD $15,263 single applicant (2026 LICO table)',
    'Data as of: 2026-06-05 — verify current draw cutoffs and settlement fund table at canada.ca before authoring final content',
  ],
};

// ── Generic Skeleton — honest fallback for off-script destinations (D-06) ──────

export const GENERIC_SKELETON: VisaPathway = {
  destinationCountry: '[Country]',
  visaType: 'Work Visa — [Country]',
  requirements: [
    'Verify current requirements at the official immigration authority for [Country]',
  ],
  processingTime: 'Verify at official source',
  feeRangeUSD: 'Verify at official source',
  pros: [
    'International work authorization',
    'Potential path to residency',
  ],
  cons: [
    'Requirements, fees, and timelines vary — verify at official source',
  ],
  documentChecklist: [
    'Valid passport (minimum 6 months validity beyond intended stay)',
    'Proof of remote income or employment contract',
    'Health insurance documentation',
    'Bank statements / proof of funds',
    'Criminal background check (apostilled)',
    'Completed visa application form',
  ],
  officialSources: [
    'Verify current fees, processing times, and requirements at the official immigration authority for [Country].',
    'DATA AS OF: 2026-06 — GENERIC SKELETON — VERIFY LOCALLY',
  ],
};

// ── VISA_PATHWAYS — flat registry keyed by citizenship (VISA-02) ─────────────
//
// FLAT shape: Record<string, VisaPathway[]> — key = profile.citizenship.
// NOT the nested Record<string, Record<string, ...>> shape from roadmap-templates.ts.
// Both authored pathways are always returned for US citizens regardless of
// matched destination. matchedCountry is an accent-emphasis signal only
// (which column gets the border highlight in the UI), NOT a filter.

export const VISA_PATHWAYS: Record<string, VisaPathway[]> = {
  US: [PORTUGAL_D8, CANADA_EXPRESS_ENTRY],
};
