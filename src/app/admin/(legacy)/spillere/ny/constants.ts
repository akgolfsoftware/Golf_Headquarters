/**
 * Konstanter + typer for spiller-onboarding-wizarden.
 *
 * Disse bor IKKE i actions.ts fordi den fila er "use server" — en server-
 * action-modul kan bare eksportere async funksjoner. Verdi-eksport (const-
 * arrays) derfra kaster en runtime-feil. Holdes derfor i en plain modul som
 * både wizard (klient) og actions (server) importerer fra.
 */

import type { PlayerProgram } from "@/generated/prisma/client";

export const ALL_PROGRAMS: PlayerProgram[] = [
  "WANG_TOPPIDRETT", "WANG_UNG",
  "GFGK_MINI", "GFGK_BREDDE", "GFGK_JENTER", "GFGK_ELITE",
  "AK_ACADEMY", "AK_ACADEMY_JUNIOR",
  "PLATFORM_ONLY",
];

export const SPILLER_KATEGORIER = ["A1", "A2", "B1", "B2", "C"] as const;
export type SpillerKategori = (typeof SPILLER_KATEGORIER)[number];

export const SPILLER_TIERS = ["GRATIS", "PRO"] as const;
export type SpillerTier = (typeof SPILLER_TIERS)[number];
