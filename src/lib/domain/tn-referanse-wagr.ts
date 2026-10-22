import "server-only";

import { prisma } from "@/lib/prisma";
import { byggWagrLeaderboard, wagrAarForAar, wagrAarsscore, type WagrAarPunkt, type WagrRefGruppe, type WagrRefSpillerRad } from "./tn-referanse-wagr-regler";

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

export type WagrRefValg = { wagrId: number; navn: string; plass: number | null };
export type WagrRefKort = {
  wagrId: number;
  navn: string;
  land: string;
  plass: number | null;
  bestePlass: number | null;
  snittPoeng: number | null;
  seire: number | null;
  scoreIAar: number | null;
  scoreIFjor: number | null;
  aarForAar: WagrAarPunkt[];
  turneringIder: number[];
  wagrDato: Date;
};

const kortSelect = {
  wagrPlayerId: true, name: true, country: true, rank: true, bestRank: true, pointsAvg: true, wins: true, yearEndRanks: true, yearStats: true, wagrDate: true,
  results: { select: { wagrEventId: true } },
} as const;

function tilKort(p: { wagrPlayerId: number; name: string; country: string; rank: number | null; bestRank: number | null; pointsAvg: number | null; wins: number | null; yearEndRanks: unknown; yearStats: unknown; wagrDate: Date; results: { wagrEventId: number }[] }): WagrRefKort {
  const iAar = p.wagrDate.getUTCFullYear();
  return {
    wagrId: p.wagrPlayerId, navn: p.name, land: p.country, plass: p.rank, bestePlass: p.bestRank, snittPoeng: p.pointsAvg, seire: p.wins,
    scoreIAar: wagrAarsscore(p.yearStats, iAar), scoreIFjor: wagrAarsscore(p.yearStats, iAar - 1),
    aarForAar: wagrAarForAar(p.yearEndRanks, p.rank, p.wagrDate),
    turneringIder: [...new Set(p.results.map((r) => r.wagrEventId))],
    wagrDato: p.wagrDate,
  };
}

/** Alle spillerne i WAGR-referansen, til velgeren i Sammenlign. Sortert på plass. */
export async function hentWagrRefValg(): Promise<WagrRefValg[]> {
  const rader = await prisma.wagrRefPlayer.findMany({ orderBy: [{ rank: { sort: "asc", nulls: "last" } }, { name: "asc" }], select: { wagrPlayerId: true, name: true, rank: true } });
  return rader.map((r) => ({ wagrId: r.wagrPlayerId, navn: r.name, plass: r.rank }));
}

/** Kortene for de valgte spillerne, i rekkefølgen de er valgt. */
export async function hentWagrRefKort(ider: number[]): Promise<WagrRefKort[]> {
  if (ider.length === 0) return [];
  const rader = await prisma.wagrRefPlayer.findMany({ where: { wagrPlayerId: { in: ider } }, select: kortSelect });
  return ider.flatMap((id) => {
    const p = rader.find((r) => r.wagrPlayerId === id);
    return p ? [tilKort(p)] : [];
  });
}

/**
 * Søk i WAGR-referansen på navn (minst to bokstaver). Tabellen har noen titalls spillere, så `contains`
 * uten trigram-indeks er greit her (gotchas §Database gjelder store tabeller).
 */
export async function sokWagrRef(sok: string): Promise<(WagrRefValg & { land: string; grupper: string[] })[]> {
  const q = sok.trim();
  if (q.length < 2) return [];
  const rader = await prisma.wagrRefPlayer.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    orderBy: [{ rank: { sort: "asc", nulls: "last" } }, { name: "asc" }],
    take: 50,
    select: { wagrPlayerId: true, name: true, rank: true, country: true, groups: { select: { group: { select: { name: true } } } } },
  });
  return rader.map((r) => ({ wagrId: r.wagrPlayerId, navn: r.name, plass: r.rank, land: r.country, grupper: r.groups.map((g) => g.group.name) }));
}

/** Rankinguka for de siste tallene i referansen, eller null når tabellene er tomme. */
export async function hentWagrRefDato(): Promise<Date | null> {
  const g = await prisma.wagrRefGroup.findFirst({ orderBy: { wagrDate: "desc" }, select: { wagrDate: true } });
  return g?.wagrDate ?? null;
}
