import { TIER_RUNS_MAP } from '../../shared/types';

// ── RunsBadge ────────────────────────────────────────────────────────────────
// Header chip showing tier + run count from the shared TIER_RUNS_MAP contract.
// Mounts in the city-detail header when step === 2 and selectedCity is set.
//
// THEME-SCOPE HAZARD: PotentialApp runs in a GREEN scope (--accent:#6EE7B7).
// ALL gold values HARDCODED — never CSS custom properties from the host scope.
// Chip: JetBrains Mono 11px, color #e2b56b, bg rgba(226,181,107,.13), radius 6.
// ─────────────────────────────────────────────────────────────────────────────

export default function RunsBadge({ tier }) {
  const label = TIER_RUNS_MAP[tier];
  if (!label) return null;

  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      color: "#e2b56b",
      background: "rgba(226,181,107,.13)",
      padding: "3px 10px",
      borderRadius: 6,
      letterSpacing: ".03em",
    }}>
      {label}
    </span>
  );
}
