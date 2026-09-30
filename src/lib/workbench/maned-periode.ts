/**
 * Periodefokus for en måned i Workbench (AG-11-MND).
 *
 * Månedens fokus finnes ikke som eget felt: det hentes fra perioden i
 * spillerens årsplan (PeriodBlock) som dekker måneden. Dekker flere perioder
 * måneden, brukes den som har flest dager i måneden. Ingen skriving.
 *
 * FORUTSETNING: kalleren har allerede kontrollert coachens tilgang til
 * spilleren (`coachScopedPlayerWhere`).
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { LPHASE_LABEL } from "@/lib/labels/taxonomy";
import { parseSessionBudget, type SessionBudget } from "@/lib/workbench/perioder";
import { velgPeriode, type PeriodeKandidat } from "@/lib/workbench/maned-periode-valg";

export type ManedPeriode = {
  type: string;
  fokus: string | null;
  start: string;
  slutt: string;
  budsjett: SessionBudget | null;
};

const dato = (d: Date) => d.toISOString().slice(0, 10);

export async function hentManedPeriode(playerId: string, monthStart: string, monthEnd: string): Promise<ManedPeriode | null> {
  const aar = Number(monthStart.slice(0, 4));
  const plan = await prisma.seasonPlan.findFirst({
    where: { userId: playerId, year: aar },
    select: {
      periodBlocks: {
        where: { startDate: { lte: new Date(`${monthEnd}T23:59:59Z`) }, endDate: { gte: new Date(`${monthStart}T00:00:00Z`) } },
        select: { lPhase: true, startDate: true, endDate: true, focus: true, weeklySessionBudget: true },
        orderBy: { startDate: "asc" },
      },
    },
  });
  if (!plan) return null;
  const kandidater: PeriodeKandidat[] = plan.periodBlocks.map((b) => ({ type: b.lPhase, start: dato(b.startDate), slutt: dato(b.endDate), fokus: b.focus, budsjett: b.weeklySessionBudget }));
  const valgt = velgPeriode(kandidater, monthStart, monthEnd);
  if (!valgt) return null;
  return {
    type: LPHASE_LABEL[valgt.type as keyof typeof LPHASE_LABEL] ?? valgt.type,
    fokus: valgt.fokus?.trim() || null,
    start: valgt.start,
    slutt: valgt.slutt,
    budsjett: parseSessionBudget(valgt.budsjett),
  };
}
