import "server-only";

import { prisma } from "@/lib/prisma";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { erTnPersonligDataLeser, hentTnArbeidskontekst, hentTnSpillerTilgang, medTnSpillerData, type TnArbeidskontekst, type TnBruker } from "./tn-arbeidsflate";
import { plassVedAarsslutt } from "./tn-referanse-wagr-regler";
import { TN_FORSLAG_TYPER, tilWagrId, velgNesteTurneringer, type TnIupTurnering } from "./tn-iup-oversikt-regler";
import { hentWagrPlassForSpiller, type TnWagrPlass } from "./tn-wagr-plass";

export * from "./tn-iup-oversikt-regler";

export type { TnWagrPlass };

export type TnIupLaast = { kontekst: TnArbeidskontekst; navn: string; klubb: string | null; fodselsaar: number | null; wagr: TnWagrPlass | null };

/**
 * Låst IUP: treneren er i Team Norway-gruppa, spilleren er aktivt medlem der, men har ikke delt.
 * Gir bare navn, klubb, fødselsår og offentlig WAGR-plass (beslutningene 22.10), aldri noe annet fra PlayerHQ.
 * Null når treneren ikke er trener i gruppa eller spilleren ikke er medlem (da blir det 404).
 */
export async function hentTnIupLaast(bruker: TnBruker, spillerId: string): Promise<TnIupLaast | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller || !erTnPersonligDataLeser(kontekst, bruker)) return null;
  const medlem = await prisma.groupMember.findFirst({
    where: { groupId: kontekst.gruppe.id, userId: spillerId, ...aktivtSpillerMedlemskapWhere(), user: { deletedAt: null, anonymisertAt: null } },
    select: { user: { select: { name: true, homeClub: true, dateOfBirth: true } } },
  });
  if (!medlem) return null;
  return {
    kontekst,
    navn: medlem.user.name ?? "Ukjent",
    klubb: medlem.user.homeClub,
    fodselsaar: medlem.user.dateOfBirth ? medlem.user.dateOfBirth.getUTCFullYear() : null,
    wagr: await hentWagrPlassForSpiller(prisma, spillerId),
  };
}

export type TnIupDelt = {
  wagr: TnWagrPlass | null;
  nesteTurneringer: TnIupTurnering[];
  avslatteForslag: { avslatt: Date }[];
};

/**
 * Det Oversikt trenger utover TN-02-dataene: neste tre turneringer i planen, forslag spilleren
 * har avslått siste 14 dager, og WAGR-plassen. Leses innenfor delingslåsen.
 */
export async function hentTnIupDelt(bruker: TnBruker, spillerId: string, naa = new Date()): Promise<TnIupDelt | null> {
  const iDag = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth(), naa.getUTCDate()));
  const data = await medTnSpillerData(bruker, spillerId, async (tx, tilgang) => {
    const [paameldinger, avslatt] = await Promise.all([
      tx.tournamentEntry.findMany({
        where: { userId: tilgang.spillerId, entryStatus: { in: ["PLANNED", "CLAIMED_REGISTERED", "CONFIRMED"] } },
        select: { entryStatus: true, manualName: true, manualDate: true, tournament: { select: { name: true, startDate: true } }, wagrPlanEvent: { select: { name: true, startDate: true } } },
      }),
      tx.planAction.findMany({
        where: { userId: tilgang.spillerId, actionType: { in: [...TN_FORSLAG_TYPER] }, status: "REJECTED", decidedAt: { gte: new Date(naa.getTime() - 14 * 864e5) } },
        orderBy: { decidedAt: "desc" },
        select: { decidedAt: true },
      }),
    ]);
    const nesteTurneringer = velgNesteTurneringer(paameldinger, iDag);
    return { nesteTurneringer, avslatteForslag: avslatt.flatMap((a) => (a.decidedAt ? [{ avslatt: a.decidedAt }] : [])) };
  });
  if (!data) return null;
  return { ...data, wagr: await hentWagrPlassForSpiller(prisma, spillerId) };
}

export type TnIupRankingPunkt = { navn: string; dato: Date | null; aar: number; uke: number | null; plassering: string | null; plassFoer: number | null; plassEtter: number | null };
export type TnIupRanking = {
  wagr: { plass: number | null; bestePlass: number | null; snittPoeng: number | null; seire: number | null; aarsslutt: { aar: number; plass: number | null }[]; dato: Date } | null;
  /** WAGR-resultatene med plass før og etter, eldst først. */
  historikk: TnIupRankingPunkt[];
};

/**
 * IUP › Ranking. WAGR er offentlig, men leses bare når treneren har deling (samme lås som de andre fanene).
 * NGF-juniorranking finnes ikke i appen og vises «—» av skjermen. Null uten deling.
 */
export async function hentTnIupRanking(bruker: TnBruker, spillerId: string): Promise<TnIupRanking | null> {
  if (!(await hentTnSpillerTilgang(bruker, spillerId))) return null;
  const u = await prisma.user.findUnique({ where: { id: spillerId }, select: { publicPlayer: { select: { wagrId: true } } } });
  const wagrId = tilWagrId(u?.publicPlayer?.wagrId);
  if (wagrId === null) return { wagr: null, historikk: [] };
  const rad = await prisma.wagrRefPlayer.findUnique({
    where: { wagrPlayerId: wagrId },
    select: {
      rank: true, bestRank: true, pointsAvg: true, wins: true, yearEndRanks: true, wagrDate: true,
      results: { orderBy: [{ year: "asc" }, { week: "asc" }, { date: "asc" }], select: { name: true, date: true, year: true, week: true, finish: true, rankBefore: true, rankAfter: true } },
    },
  });
  if (!rad) return { wagr: null, historikk: [] };
  const iAar = rad.wagrDate.getUTCFullYear();
  return {
    wagr: {
      plass: rad.rank,
      bestePlass: rad.bestRank,
      snittPoeng: rad.pointsAvg,
      seire: rad.wins,
      aarsslutt: [iAar - 1, iAar - 2].map((aar) => ({ aar, plass: plassVedAarsslutt(rad.yearEndRanks, aar) })),
      dato: rad.wagrDate,
    },
    historikk: rad.results.map((r) => ({ navn: r.name, dato: r.date, aar: r.year, uke: r.week, plassering: r.finish, plassFoer: r.rankBefore, plassEtter: r.rankAfter })),
  };
}
