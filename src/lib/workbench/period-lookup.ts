/**
 * Periode-oppslag: gitt en spillers PeriodBlock-er, hvilken er aktiv på en gitt dato.
 * Ren, Prisma-fri modul (samme mønster som fokus.ts/sg-gap.ts) — kan gjenbrukes fra
 * load-workbench.ts (uke/mal-kontekst) uten en ny databasespørring.
 */

import type { LPhase } from "@/generated/prisma/client";

export type PeriodRange = {
  id: string;
  lPhase: LPhase;
  startDate: Date;
  endDate: Date;
};

/**
 * Perioden som dekker `date` (start ≤ date ≤ slutt), eller null hvis ingen.
 * Generisk over `T` slik at kallere kan sende inn fulle PeriodBlock-rader og
 * beholde alle felt (weeklyVolMin/Max, focus, notes …) på returverdien.
 */
export function findActivePeriod<T extends PeriodRange>(periods: T[], date: Date): T | null {
  const t = date.getTime();
  for (const p of periods) {
    if (p.startDate.getTime() <= t && p.endDate.getTime() >= t) return p;
  }
  return null;
}
