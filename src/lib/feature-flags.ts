// Feature flags og midlertidige overstyringer.
//
// **PRO-til-alle-kampanje:** Frem til 1. juni 2026 (Europe/Oslo) får ALLE
// brukere effektiv Pro-tilgang uavhengig av faktisk `tier` i databasen.
// Etter utløpsdato kollapser flagget til false og `tier`-feltet styrer
// igjen — ingen kode-endring trengs for å reversere.

import type { Tier } from "@/generated/prisma/client";

const PRO_FOR_ALLE_UTLOP = new Date("2026-06-01T00:00:00.000+02:00");

export function alleHarPro(now: Date = new Date()): boolean {
  return now.getTime() < PRO_FOR_ALLE_UTLOP.getTime();
}

/**
 * Returnerer effektiv tier basert på flagget. Bruk denne overalt der
 * tier-gating skjer — IKKE `user.tier` direkte.
 *
 * /portal/meg/abonnement viser fortsatt FAKTISK tier (les `user.tier`)
 * sammen med et kampanje-banner.
 */
export function effektivTier(actualTier: Tier): Tier {
  if (alleHarPro()) return "PRO";
  return actualTier;
}

/**
 * Brukervennlig informasjon om kampanjen — vises som banner i UI.
 */
export const PRO_KAMPANJE_INFO = {
  aktiv: alleHarPro(),
  utlopISO: PRO_FOR_ALLE_UTLOP.toISOString(),
  utlopFormatted: PRO_FOR_ALLE_UTLOP.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
};
