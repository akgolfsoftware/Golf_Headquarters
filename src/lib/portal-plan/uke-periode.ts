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
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";

export type UkePeriode = {
  /** Klarspråk-navn, f.eks. «Spesialiseringsperiode». */
  navn: string;
  /** Coachens fritekst-fokus for perioden, når det er satt. */
  fokus: string | null;
  /** Hvilken uke i perioden `naa` ligger i (1 = første), og hvor mange uker perioden har. */
  uke: number;
  antallUker: number;
};

const DAG_MS = 86_400_000;

/** Mandagen (UTC-midnatt) i uka en Oslo-dato (YYYY-MM-DD) ligger i. */
function mandag(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  return t - ((new Date(t).getUTCDay() + 6) % 7) * DAG_MS;
}

/** Uke n av m i perioden. Periodedatoene er rene datoer (UTC-midnatt), `naa` et tidspunkt. */
export function periodeUke(start: Date, slutt: Date, naa: Date): { uke: number; antallUker: number } {
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  const forste = mandag(ymd(start));
  const antallUker = Math.round((mandag(ymd(slutt)) - forste) / (7 * DAG_MS)) + 1;
  const uke = Math.round((mandag(OSLO_YMD_FMT.format(naa)) - forste) / (7 * DAG_MS)) + 1;
  return { uke: Math.min(Math.max(uke, 1), antallUker), antallUker };
}

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

  return { navn: LPHASE_LABEL[aktiv.lPhase], fokus: aktiv.focus, ...periodeUke(aktiv.startDate, aktiv.endDate, naa) };
}
