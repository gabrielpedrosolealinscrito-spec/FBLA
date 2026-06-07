---
phase: 8
slug: freemium-tier-gate
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-06
---

# Phase 8 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Register authored at plan-time (all 4 PLANs carried `<threat_model>` blocks). This audit
> **verifies declared mitigations exist** — it does not retroactively scan for new threats.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| (none) | Phase 8 is presentation-layer only. `LockGate` hides/blurs UI but protects no server resource. Tier state is in-memory React state that resets to `"free"` on reload. No auth, no sessions, no network calls, no persistence, no user data. | none |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-08-01 | Elevation of Privilege | Tier state / LockGate blur bypass via DevTools | accept | Client-only CSS blur; no server resource gated (see Accepted Risks) | closed |
| T-08-02 | Information Disclosure | Presenter-mode corner triple-tap gesture | accept | Security-by-obscurity over a demo control panel, not a boundary (see Accepted Risks) | closed |
| T-08-05 | Input Validation | `setTier` / `onTier` values | mitigate | Only the four `Tier`-union keys reach `setTier`; no free-text path (see Mitigation Evidence) | closed |
| T-08-06 | Tampering | FrostedSkeleton / teaser / pricing / testimonial copy | accept | All copy is static hardcoded literals; no injection surface (see Accepted Risks) | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

No HIGH-severity threats. Zero new packages → no supply-chain row. No payment processing (v2-deferred) → no PCI/billing surface.

---

## Mitigation Evidence

### T-08-05 — Input Validation: `setTier`/`onTier` values (mitigate)

**Declared mitigation:** `setTier`/`onTier` only ever receives one of the four `Tier`-union keys
hardcoded in the DemoTierSwitcher array and PricingModal/`TIERS_CONFIG` CTAs — no free-text input
reaches state.

**Verification — full call-site trace of `setTier`/`onTier`:**

`setTier` is defined at `src/screens/PotentialApp.jsx:58` and passed to exactly two consumers:
1. `PricingModal` — `onTier={setTier}` (`PotentialApp.jsx:472`)
2. `DemoTierSwitcher` — `onTier={setTier}` (`PotentialApp.jsx:475`)

- **DemoTierSwitcher** (`DemoTierSwitcher.jsx:12,60`): `onTier(t)` where `t ∈ TIERS = ["free","basic","plus","premium"]` (hardcoded array).
- **PricingModal** (`PricingModal.jsx:12-50,279`): `onTier(tier.key)` where `tier` is an element of the compile-time literal `TIERS_CONFIG`; keys are `"free"/"basic"/"plus"/"premium"`, all valid members of the `Tier` union in `shared/types.ts:204`.

Exhaustive grep of `src/` confirms 7 total call sites (definition, prop-passes, literal emissions). **No free-text, URL param, localStorage, or network value reaches `setTier`.** Mitigation fully present. **CLOSED.**

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-08-01 | T-08-01 | DevTools un-blur reveals already-client-rendered content; no server resource, API call, auth check, or persistent data behind the gate. `tier` state is in-memory and resets to `"free"` on reload. Real access control is v2-deferred. v1 demo scope. | gsd-security-auditor | 2026-06-06 |
| AR-08-02 | T-08-02 | Corner triple-tap (`PotentialApp.jsx:70-91`) toggles only the `visible` prop of `DemoTierSwitcher`. Discovery reveals a demo tier-control panel, not secrets, credentials, or data. Security-by-obscurity over a demo control, not a security boundary. v1 demo scope. | gsd-security-auditor | 2026-06-06 |
| AR-08-06 | T-08-06 | All gated copy is static: `FrostedSkeleton` (`LockGate.jsx:9-29`) literal JSX; `TIERS_CONFIG`/`TESTIMONIALS` (`PricingModal.jsx:12-66`) compile-time literal arrays; blurred-stack interpolation (`ResultsMap.jsx:191`) is a `number` (React auto-escapes). No user-generated string in any copy surface → no XSS/injection. | gsd-security-auditor | 2026-06-06 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-06 | 4 | 4 | 0 | gsd-security-auditor (sonnet) |

### Security Audit 2026-06-06
| Metric | Count |
|--------|-------|
| Threats found | 4 |
| Closed | 4 |
| Open | 0 |

Auditor verdict: **SECURED** — 4/4 threats closed, 0 open, 0 unregistered flags. All four
SUMMARY.md Threat Surface Scan sections report no new network endpoints, auth paths, schema
changes, or packages. Threat IDs T-08-03/T-08-04 are non-contiguous authoring artifacts, not
coverage gaps.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-06
