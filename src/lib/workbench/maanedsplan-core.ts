/**
 * Plannivåene henger sammen (Anders 14.10.2026, punkt 2): lagre månedsplan og skriv
 * månedens tilpassede timer nedover til ukeplanene fra og med inneværende uke.
 * Gåtte uker røres aldri. Guards bor i wrapperne; kjernen antar autorisert userId
 * (samme mønster som periode-core).
 */

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { osloPlanDato } from "@/lib/workbench/plan-kontekst";
import { fordelPeriodeTilUker } from "@/lib/workbench/periode-ukefordeling";
import { ukeTimerFraMinutter } from "@/lib/workbench/periode-ukefordeling-regler";
import {
  MaanedInputSchema, alleUkerIMaaned, gjeldendeOverstyringer, parseUkeOverstyringer, ukeNokkel, ukerForMaaned,
  type MaanedKvittering, type UkeOverstyringer,
} from "@/lib/workbench/maanedsplan-regler";
import { byggMaanedUker } from "@/lib/workbench/maaned-visning";
import { fraDatoKolonne } from "@/lib/workbench/wb-map";
import type { MaanedDetaljer } from "@/lib/domain/workbench/types";

export type LagreMaanedResultat =
  | { ok: true; kvittering: MaanedKvittering; fordelingFeilet?: boolean }
  | { ok: false; error: string };

function maanedGrenser(year: number, month: number) {
  return { fra: new Date(Date.UTC(year, month - 1, 1)), til: new Date(Date.UTC(year, month, 0)) };
}

export async function lagreMaanedCore(
  userId: string,
  createdById: string,
  rawInput: unknown,
  now: Date = new Date(),
): Promise<LagreMaanedResultat> {
  const parsed = MaanedInputSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false, error: "Ugyldig månedsinput" };
  const { year, month, fokus, notat, evaluering, uker } = parsed.data;
  const { fra, til } = maanedGrenser(year, month);

  const forrige = await prisma.monthPlan.findUnique({
    where: { userId_year_month: { userId, year, month } },
    select: { weekAxisMinutes: true },
  });
  const forrigeUker = parseUkeOverstyringer(forrige?.weekAxisMinutes);
  const nyeUker = uker === undefined ? forrigeUker : uker;

  const sesong = await prisma.seasonPlan.findFirst({
    where: { userId, startDate: { lte: fra }, endDate: { gte: fra } },
    select: { id: true },
  });
  const felter = {
    seasonPlanId: sesong?.id ?? null,
    focus: fokus || null,
    notes: notat || null,
    evaluation: evaluering || null,
    weekAxisMinutes: Object.keys(nyeUker).length > 0 ? nyeUker : Prisma.DbNull,
  };
  await prisma.monthPlan.upsert({
    where: { userId_year_month: { userId, year, month } },
    create: { userId, year, month, createdById, ...felter },
    update: felter,
  });

  // Fra og med inneværende uke: skriv månedens tilpassede tall til ukeplanene.
  const iDag = osloPlanDato(now);
  const skrives = gjeldendeOverstyringer(nyeUker, year, month, iDag);
  if (skrives.length > 0) {
    await prisma.$transaction(
      skrives.map(({ uke, minutter }) => {
        const data = ukeTimerFraMinutter(minutter);
        return prisma.weekPlan.upsert({
          where: { playerId_isoYear_weekNumber: { playerId: userId, isoYear: uke.isoYear, weekNumber: uke.weekNumber } },
          create: {
            playerId: userId, isoYear: uke.isoYear, weekNumber: uke.weekNumber,
            seasonPlanId: sesong?.id ?? null, weekType: "UTVIKLING", notes: [], ...data,
          },
          update: data,
        });
      }),
    );
  }

  // Uker som ikke lenger er tilpasset går tilbake til periodens tall.
  const fjernet = new Set(
    ukerForMaaned(year, month, iDag)
      .map((u) => ukeNokkel(u.isoYear, u.weekNumber))
      .filter((k) => forrigeUker[k] && !nyeUker[k]),
  );
  let tilbake = 0;
  let fordelingFeilet = false;
  if (fjernet.size > 0) {
    try {
      const perioder = await prisma.periodBlock.findMany({
        where: { seasonPlan: { userId }, startDate: { lte: til }, endDate: { gte: fra } },
        select: { id: true },
      });
      for (const p of perioder) tilbake += (await fordelPeriodeTilUker(p.id, now, fjernet)).antallUker;
    } catch {
      fordelingFeilet = true;
    }
  }

  const alle = [...skrives.map((s) => s.uke)];
  const antallUker = skrives.length + tilbake;
  return {
    ok: true,
    ...(fordelingFeilet && { fordelingFeilet: true }),
    kvittering: {
      antallUker,
      fraUke: alle[0] ? ukeNokkel(alle[0].isoYear, alle[0].weekNumber) : null,
      tilUke: alle.length ? ukeNokkel(alle[alle.length - 1].isoYear, alle[alle.length - 1].weekNumber) : null,
    },
  };
}

/** Månedsplanen for visning; null når ingenting er lagret for måneden. */
export async function hentMaaned(userId: string, year: number, month: number) {
  const rad = await prisma.monthPlan.findUnique({
    where: { userId_year_month: { userId, year, month } },
    select: { focus: true, notes: true, evaluation: true, weekAxisMinutes: true },
  });
  if (!rad) return null;
  return {
    fokus: rad.focus,
    notat: rad.notes,
    evaluering: rad.evaluation,
    uker: parseUkeOverstyringer(rad.weekAxisMinutes),
  };
}

const HENDELSE_TYPER = new Set(["TESTUKE", "TRENINGSSAMLING", "HELDAGSSAMLING"]);

/**
 * PH-11-MND: ukene i måneden med fordelt (ukeplanen), lagt inn og gjennomført, periodene
 * som overlapper måneden og testuker, samlinger og turneringer. Bare lesing.
 */
export async function hentMaanedDetaljer(
  userId: string,
  year: number,
  month: number,
  okter: Parameters<typeof byggMaanedUker>[0]["okter"],
  overstyringer: UkeOverstyringer,
): Promise<MaanedDetaljer> {
  const { fra, til } = maanedGrenser(year, month);
  const uker = alleUkerIMaaned(year, month);
  const [ukeplaner, blokker, turneringer] = await Promise.all([
    uker.length === 0 ? [] : prisma.weekPlan.findMany({
      where: { playerId: userId, OR: uker.map((u) => ({ isoYear: u.isoYear, weekNumber: u.weekNumber })) },
      select: {
        isoYear: true, weekNumber: true, plannedHoursFys: true, plannedHoursTek: true,
        plannedHoursSlag: true, plannedHoursSpill: true, plannedHoursTurn: true,
      },
    }),
    prisma.periodBlock.findMany({
      where: { seasonPlan: { userId }, startDate: { lte: til }, endDate: { gte: fra } },
      orderBy: { startDate: "asc" },
      select: { id: true, lPhase: true, startDate: true, endDate: true, focus: true },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId, entryStatus: { not: "WITHDRAWN" },
        OR: [{ tournament: { startDate: { gte: fra, lte: til } } }, { manualDate: { gte: fra, lte: til } }],
      },
      select: { tournament: { select: { name: true, startDate: true, endDate: true } }, manualName: true, manualDate: true },
    }),
  ]);
  const blokk = blokker.map((b) => ({
    id: b.id, type: b.lPhase, startDate: fraDatoKolonne(b.startDate), endDate: fraDatoKolonne(b.endDate), focus: b.focus,
  }));
  const hendelser: MaanedDetaljer["hendelser"] = [
    ...blokk.filter((b) => HENDELSE_TYPER.has(b.type)).map((b) => ({ type: b.type, navn: b.focus ?? "", startDate: b.startDate, endDate: b.endDate })),
    ...turneringer.flatMap((t) => {
      const navn = t.tournament?.name ?? t.manualName;
      const start = t.tournament?.startDate ?? t.manualDate;
      if (!navn || !start) return [];
      const slutt = t.tournament?.endDate ?? start;
      return [{ type: "TURNERING" as const, navn, startDate: fraDatoKolonne(start), endDate: fraDatoKolonne(slutt) }];
    }),
  ].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return {
    uker: byggMaanedUker({ year, month, okter, ukeplaner, overstyringer }),
    perioder: blokk.filter((b) => !HENDELSE_TYPER.has(b.type)),
    hendelser,
  };
}
