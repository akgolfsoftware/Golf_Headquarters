import "server-only";

import { prisma } from "@/lib/prisma";
import { byggWagrLeaderboard, type WagrRefGruppe, type WagrRefSpillerRad } from "./tn-referanse-wagr-regler";

export * from "./tn-referanse-wagr-regler";

/**
 * Referanse › WAGR (beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 3). Leser
 * tabellene pipelines fyller hver mandag (wagr_ref_*, scripts/add-wagr-ref-tabeller-2026-10-21.ts).
 * Er tabellene tomme, gir den ingen grupper, og skjermen viser «—» med lenke til teamnorwayref.
 */
export async function hentWagrReferanse(gruppeId: string | undefined): Promise<{ grupper: WagrRefGruppe[]; valgt: WagrRefGruppe | null; rader: WagrRefSpillerRad[] }> {
  const grupper: WagrRefGruppe[] = (
    await prisma.wagrRefGroup.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, title: true, selection: true, onlyYear: true, wagrDate: true },
    })
  ).map((g) => ({ id: g.id, navn: g.name, tittel: g.title, utvalg: g.selection, kunAar: g.onlyYear, wagrDato: g.wagrDate }));

  const valgt = grupper.find((g) => g.id === gruppeId) ?? grupper[0] ?? null;
  if (!valgt) return { grupper, valgt: null, rader: [] };

  const medlemmer = await prisma.wagrRefGroupMember.findMany({
    where: { groupId: valgt.id },
    select: {
      level: true,
      player: {
        select: {
          wagrPlayerId: true,
          name: true,
          country: true,
          rank: true,
          pointsAvg: true,
          bestRank: true,
          wins: true,
          yearEndRanks: true,
          results: {
            where: valgt.kunAar ? { year: valgt.kunAar } : undefined,
            orderBy: [{ date: "desc" }, { year: "desc" }, { week: "desc" }],
            take: 1,
            select: { name: true, date: true, finish: true },
          },
        },
      },
    },
  });

  return {
    grupper,
    valgt,
    rader: byggWagrLeaderboard(
      medlemmer.map((m) => ({
        nivaa: m.level,
        wagrId: m.player.wagrPlayerId,
        navn: m.player.name,
        land: m.player.country,
        plass: m.player.rank,
        snittPoeng: m.player.pointsAvg,
        bestePlass: m.player.bestRank,
        seire: m.player.wins,
        aarsslutt: m.player.yearEndRanks,
        sisteTurnering: m.player.results[0] ?? null,
      })),
      valgt.wagrDato,
    ),
  };
}
