/**
 * Aktiv treningsperiode for ukesammendraget på PlayerHQ Plan (PP-1.2).
 *
 * Paper-fasiten (`fase1/playerhq-plan.html`) åpner Plan med en ukeoppsummering
 * der «Periode» er én av fem rader. Perioden ligger på spillerens årsplan
 * (SeasonPlan → PeriodBlock), som Workbench allerede leser — men Plan-siden
 * gjorde det ikke, så raden manglet helt.
 *
 * Egen liten laster framfor et nytt felt i getDashboardData: Plan er den eneste
 * flaten som trenger den, og dashboard-lasteren deles av Hjem, Analyse og Meg.
 *
 * Ingen periode satt = null. Kalleren skriver «Ikke satt» — vi gjetter aldri en
 * periode spilleren ikke har fått.
 */

import { prisma } from "@/lib/prisma";
import { findActivePeriod } from "@/lib/workbench/period-lookup";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";

export type UkePeriode = {
  /** Klarspråk-navn, f.eks. «Spesialiseringsperiode». */
  navn: string;
  /** Coachens fritekst-fokus for perioden, når det er satt. */
  fokus: string | null;
};

/** Perioden som dekker `naa` i spillerens årsplan, eller null. */
export async function hentUkePeriode(userId: string, naa: Date = new Date()): Promise<UkePeriode | null> {
  const seasonPlan = await prisma.seasonPlan.findFirst({
    where: { userId, startDate: { lte: naa }, endDate: { gte: naa } },
    select: {
      periodBlocks: {
        select: { id: true, lPhase: true, startDate: true, endDate: true, focus: true },
      },
    },
  });
  if (!seasonPlan) return null;

  const aktiv = findActivePeriod(seasonPlan.periodBlocks, naa);
  if (!aktiv) return null;

  return { navn: LPHASE_LABEL[aktiv.lPhase], fokus: aktiv.focus };
}
