/**
 * Gruppas periode endres: oppdater medlemmenes arvede kopier (PeriodBlock.sourceGroupId)
 * som ikke er tilpasset, og skriv timene nedover til ukene (plannivåene, punkt 4).
 * Regler: gruppe-arv-regler.ts. Guards bor i kalleren.
 */
import type { LPhase, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { fordelPeriodeTilUker } from "@/lib/workbench/periode-ukefordeling";
import { erUendretArv, type ArvbarePeriodeFelt } from "@/lib/workbench/gruppe-arv-regler";

export type ArvKvittering = {
  /** Arvede perioder som fulgte gruppa. */
  perioder: number;
  /** Arvede perioder spilleren har tilpasset, og som derfor ikke ble rørt. */
  egne: number;
  /** Uker som fikk nye timer, summert over spillerne. */
  uker: number;
  feilet: number;
};

export async function oppdaterArvedePerioder(
  groupId: string,
  foer: ArvbarePeriodeFelt,
  /** Samme data som skrives til gruppeperioden (Prisma update-data). */
  nyData: Prisma.PeriodBlockUncheckedUpdateInput,
  now: Date = new Date(),
): Promise<ArvKvittering> {
  const kvittering: ArvKvittering = { perioder: 0, egne: 0, uker: 0, feilet: 0 };
  const kopier = await prisma.periodBlock.findMany({
    where: { sourceGroupId: groupId, lPhase: foer.lPhase as LPhase, startDate: foer.startDate, endDate: foer.endDate },
    select: {
      id: true, lPhase: true, startDate: true, endDate: true, focus: true, weeklyVolMin: true,
      weeklyVolMax: true, weeklySessionBudget: true, axisMinutes: true, axisMinutesLight: true,
    },
  });
  for (const kopi of kopier) {
    if (!erUendretArv(kopi, foer)) {
      kvittering.egne++;
      continue;
    }
    try {
      await prisma.periodBlock.update({ where: { id: kopi.id }, data: nyData });
      kvittering.perioder++;
      const fordeling = await fordelPeriodeTilUker(kopi.id, now);
      kvittering.uker += fordeling.antallUker;
    } catch {
      kvittering.feilet++;
    }
  }
  return kvittering;
}
