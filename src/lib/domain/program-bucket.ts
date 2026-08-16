/**
 * Program-bøtte: PlayerProgram (åtte enum-verdier) → de tre programmene
 * coachen faktisk tenker i — AK Golf Academy, WANG Toppidrett, GFGK Junior.
 *
 * Paper-fasiten filtrerer på nettopp disse tre, både på Spillere
 * (`agencyos-spillere.html` §FILTRE) og i Kalenderen (`agencyos-kalender.html`
 * §FILTRE). Mappingen bodde i `stallen-data.ts`; den er flyttet hit fordi
 * kalenderen trenger den samme, og to kopier ville før eller siden sprikt.
 *
 * PLATFORM_ONLY er bevisst null: det er en plattformkonto uten program, ikke
 * et fjerde program.
 *
 * NB: dette er en VISNINGS-bøtte (filtre/etiketter). Skal du finne spillerens
 * COACH (varsling, V2-økter, meldinger), bruk resolveValgtCoachId i
 * ./valgt-coach.ts — aldri utled coach fra bøtta her.
 */

import type { PlayerProgram } from "@/generated/prisma/client";

export type GroupBucket = "WANG" | "GFGK" | "AKA";

export const PROGRAM_BUCKET: Record<PlayerProgram, GroupBucket | null> = {
  WANG_TOPPIDRETT: "WANG",
  WANG_UNG: "WANG",
  GFGK_MINI: "GFGK",
  GFGK_BREDDE: "GFGK",
  GFGK_JENTER: "GFGK",
  GFGK_ELITE: "GFGK",
  AK_ACADEMY: "AKA",
  AK_ACADEMY_JUNIOR: "AKA",
  PLATFORM_ONLY: null,
};

/** Fulle programnavn slik de skrives i UI. */
export const BUCKET_NAVN: Record<GroupBucket, string> = {
  AKA: "AK Golf Academy",
  WANG: "WANG Toppidrett",
  GFGK: "GFGK Junior",
};

/**
 * Første aktive innmelding som peker på et program. En spiller kan stå i
 * flere (f.eks. Academy + GFGK); da vinner den første, som er samme regel
 * stallen har brukt siden 2026-07.
 */
export function bucketFraEnrollments(
  enrollments: { program: PlayerProgram }[],
): GroupBucket | null {
  for (const e of enrollments) {
    const b = PROGRAM_BUCKET[e.program];
    if (b) return b;
  }
  return null;
}

/**
 * Programmet til en gruppe: det flest av medlemmene står i. Brukes på
 * gruppeserier i kalenderen, der økta tilhører en gruppe og ikke én spiller.
 * Ingen medlemmer med program → null, altså «vet ikke», ikke et gjettet
 * program. Ved likt antall vinner den første i BUCKET-rekkefølgen, så
 * resultatet er stabilt mellom kall.
 */
export function flertallsBucket(bucketer: (GroupBucket | null)[]): GroupBucket | null {
  const antall = new Map<GroupBucket, number>();
  for (const b of bucketer) {
    if (b) antall.set(b, (antall.get(b) ?? 0) + 1);
  }
  let beste: GroupBucket | null = null;
  let flest = 0;
  for (const b of ["AKA", "WANG", "GFGK"] as const) {
    const n = antall.get(b) ?? 0;
    if (n > flest) {
      flest = n;
      beste = b;
    }
  }
  return beste;
}
