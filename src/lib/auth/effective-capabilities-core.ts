// Ren beregning av effektive capabilities (G6). Ingen Next/Prisma-imports —
// enhetstestbar uten mock (samme mønster som action-guards-assert.ts).

import { Capability } from "./cbac";

export type CapabilityOverride = {
  capability: string;
  mode: string; // "GRANT" | "REVOKE" — lagret som String i DB
};

const GYLDIGE = new Set<string>(Object.values(Capability));

/**
 * Rolle-default ± overrides. GRANT legger til, REVOKE fjerner. Ukjente
 * capability-strenger og ukjente modes ignoreres stille (fremtidige
 * capabilities skal ikke knekke gamle deploys). Med `immun: true` (ADMIN)
 * ignoreres alle overrides — Anders kan aldri låse seg ute.
 */
export function beregnEffektive(
  roleCaps: readonly Capability[],
  overrides: readonly CapabilityOverride[],
  opts: { immun?: boolean } = {},
): Set<Capability> {
  const effektive = new Set<Capability>(roleCaps);
  if (opts.immun) return effektive;

  for (const o of overrides) {
    if (!GYLDIGE.has(o.capability)) continue;
    const cap = o.capability as Capability;
    if (o.mode === "GRANT") effektive.add(cap);
    else if (o.mode === "REVOKE") effektive.delete(cap);
  }
  return effektive;
}
