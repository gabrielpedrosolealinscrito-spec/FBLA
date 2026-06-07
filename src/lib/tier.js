// src/lib/tier.js
// useTier() — the ONE tier helper every package reads (README §1). No package
// writes its own tier check; they all call this.
//
//   import { useTier } from '../lib/tier';
//   const { tier, isPremium, isGlobal } = useTier();
//
// Tier model (README §1):
//   free    -> base results, N1 city basic view, US-only
//   premium -> full city breakdowns, all matches, roadmap/visa
//   global  -> everything in premium + the "Going Global" international flow
//
// Source of truth is the logged-in user's profiles.tier (via useAuth). Falls
// back to 'free' when logged out or when the profile hasn't loaded yet.
//
// NOTE on the legacy 4-tier scale: shared/types.ts historically defined
// free|basic|plus|premium for the existing LockGate/canAccess gating. Package 00
// adds 'global' on top of that order (additive — see shared/types.ts) so a
// 'global' profile still passes every premium gate. The free/premium/global
// product model above is the forward intent; converging the pricing UI onto it
// is package 01/05's job, not 00's.

import { useAuth } from './auth.jsx';

export function useTier() {
  const { profile } = useAuth();
  const tier = profile?.tier ?? 'free';
  return {
    tier,
    isPremium: tier === 'premium' || tier === 'global',
    isGlobal: tier === 'global',
  };
}
