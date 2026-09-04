/**
 * Produktnavn for et abonnementsnivå (STEG 19.2c) — `Tier`-enumet
 * (GRATIS/PRO/ELITE) er databasenavn, ikke produktnavn. Kun to nivåer vises
 * i UI: TALENT (gratis) og FULL (betalt). ELITE er et dødt enum (BUSINESS-
 * RULES §Abonnement) og skal aldri vises som eget nivå — samme som PRO.
 */

import type { Tier } from "@/generated/prisma/client";

export function tierEtikett(tier: Tier | string): string {
  switch (tier) {
    case "GRATIS":
      return "TALENT";
    case "PRO":
    case "ELITE":
      return "FULL";
    default:
      return tier;
  }
}
