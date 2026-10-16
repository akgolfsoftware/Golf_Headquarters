/**
 * Skriver periodens timer per akse til ukeplanene (regler: periode-ukefordeling-regler.ts).
 */

import { prisma } from "@/lib/prisma";
import { parseAxisMinutes } from "@/lib/workbench/perioder";
import { osloPlanDato } from "@/lib/workbench/plan-kontekst";
import {
  minutterForUke, ukeTimerFraMinutter, ukerForPeriode, type FordelingKvittering,
} from "@/lib/workbench/periode-ukefordeling-regler";
import { overstyrteUkenokler, ukeNokkel } from "@/lib/workbench/maanedsplan-regler";

/**
 * Skriv periodens timer per akse til ukeplanene fra og med inneværende uke.
 * Perioden må være lagret. Tom fordeling (ingen axisMinutes) røres ikke.
 * Uker en måned har tilpasset («Endret i måneden») beholder månedens tall.
 * `kunUker` (nøkler «ÅÅÅÅ-Uxx») begrenser skrivingen til disse ukene.
 */
export async function fordelPeriodeTilUker(
  periodeId: string,
  now: Date = new Date(),
  kunUker?: ReadonlySet<string>,
): Promise<FordelingKvittering> {
  const tom: FordelingKvittering = { antallUker: 0, fraUke: null, tilUke: null };
  const periode = await prisma.periodBlock.findUnique({
    where: { id: periodeId },
    select: {
      startDate: true, endDate: true, axisMinutes: true, axisMinutesLight: true,
      seasonPlan: { select: { id: true, userId: true } },
    },
  });
  if (!periode) return tom;
  const tall = {
    axisMinutes: parseAxisMinutes(periode.axisMinutes),
    axisMinutesLight: parseAxisMinutes(periode.axisMinutesLight),
  };
  if (!tall.axisMinutes && !tall.axisMinutesLight) return tom;

  const uker = ukerForPeriode(
    periode.startDate.toISOString().slice(0, 10),
    periode.endDate.toISOString().slice(0, 10),
    osloPlanDato(now),
  );
  if (uker.length === 0) return tom;

  const playerId = periode.seasonPlan.userId;
  const maaneder = await prisma.monthPlan.findMany({
    where: { userId: playerId },
    select: { weekAxisMinutes: true },
  });
  const tilpasset = overstyrteUkenokler(maaneder);
  const aktuelle = uker.filter((u) => {
    const nokkel = ukeNokkel(u.isoYear, u.weekNumber);
    return !tilpasset.has(nokkel) && (!kunUker || kunUker.has(nokkel));
  });
  if (aktuelle.length === 0) return tom;

  const eksisterende = await prisma.weekPlan.findMany({
    where: { playerId, isoYear: { in: [...new Set(aktuelle.map((u) => u.isoYear))] } },
    select: { isoYear: true, weekNumber: true, weekType: true },
  });
  const typeForUke = new Map(eksisterende.map((w) => [`${w.isoYear}-${w.weekNumber}`, w.weekType]));

  const skrives = aktuelle.flatMap((u) => {
    const lett = typeForUke.get(`${u.isoYear}-${u.weekNumber}`) === "VEDLIKEHOLD";
    const minutter = minutterForUke(tall, lett);
    return minutter ? [{ uke: u, data: ukeTimerFraMinutter(minutter) }] : [];
  });
  if (skrives.length === 0) return tom;

  await prisma.$transaction(
    skrives.map(({ uke, data }) =>
      prisma.weekPlan.upsert({
        where: { playerId_isoYear_weekNumber: { playerId, isoYear: uke.isoYear, weekNumber: uke.weekNumber } },
        create: {
          playerId, isoYear: uke.isoYear, weekNumber: uke.weekNumber,
          seasonPlanId: periode.seasonPlan.id, weekType: "UTVIKLING", notes: [], ...data,
        },
        update: data,
      }),
    ),
  );
  const forste = skrives[0].uke;
  const siste = skrives[skrives.length - 1].uke;
  return {
    antallUker: skrives.length,
    fraUke: `${forste.isoYear}-U${forste.weekNumber}`,
    tilUke: `${siste.isoYear}-U${siste.weekNumber}`,
  };
}
