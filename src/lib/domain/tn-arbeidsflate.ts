import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { hentTnOversiktForBruker } from "@/lib/domain/tn-tilgang";
import { prisma } from "@/lib/prisma";
import { TN_CATALOG, TN_VERSION, tnProtocol } from "@/lib/portal-tester/tn-catalog";

/**
 * Datalag for TN-00–TN-21.
 * Visuell fasit: de navngitte tn-malene i designsystem/team-norway/templates/.
 * Funksjonsfasit: AK Golf HQs eksisterende Prisma-modeller og domeneporter.
 * Det opprettes ikke parallelle Team Norway-tabeller for data som allerede finnes.
 */

export type TnBruker = { id: string; role: UserRole; name: string | null };

export type TnArbeidskontekst = {
  gruppe: { id: string; name: string };
  rolle: string;
  erSpiller: boolean;
  kanAdministrere: boolean;
};

export async function hentTnArbeidskontekst(bruker: TnBruker): Promise<TnArbeidskontekst | null> {
  const oversikt = await hentTnOversiktForBruker(bruker);
  if (!oversikt) return null;
  return {
    gruppe: oversikt.gruppe,
    rolle: oversikt.rolle,
    erSpiller: oversikt.rolle === "PLAYER",
    kanAdministrere: bruker.role === "ADMIN" || oversikt.rolle === "COACH",
  };
}

async function spillerIderFor(kontekst: TnArbeidskontekst, brukerId: string): Promise<string[]> {
  if (kontekst.erSpiller) return [brukerId];
  const medlemmer = await prisma.groupMember.findMany({
    where: { groupId: kontekst.gruppe.id, ...aktivtSpillerMedlemskapWhere() },
    select: { userId: true },
  });
  return medlemmer.map((medlem) => medlem.userId);
}

export type TnSpillerRad = {
  id: string;
  navn: string;
  hcp: number | null;
  klubb: string | null;
  skole: string | null;
  skolear: string | null;
  status: string;
  tester: number;
  sisteTest: Date | null;
  aktivPlan: string | null;
};

export async function hentTnSpillere(bruker: TnBruker) {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) return null;
  const spillerIder = await spillerIderFor(kontekst, bruker.id);
  const [spillere, tester, planer] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: spillerIder }, deletedAt: null },
      select: { id: true, name: true, hcp: true, homeClub: true, school: true, schoolYear: true, userStatus: true },
      orderBy: { name: "asc" },
    }),
    prisma.testResult.findMany({
      where: { userId: { in: spillerIder } },
      select: { userId: true, takenAt: true },
      orderBy: { takenAt: "desc" },
    }),
    prisma.trainingPlan.findMany({
      where: { userId: { in: spillerIder }, isActive: true },
      select: { userId: true, name: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const testPerSpiller = new Map<string, { antall: number; siste: Date | null }>();
  for (const test of tester) {
    const rad = testPerSpiller.get(test.userId) ?? { antall: 0, siste: null };
    rad.antall += 1;
    rad.siste ??= test.takenAt;
    testPerSpiller.set(test.userId, rad);
  }
  const planPerSpiller = new Map<string, string>();
  for (const plan of planer) if (!planPerSpiller.has(plan.userId)) planPerSpiller.set(plan.userId, plan.name);

  const rader: TnSpillerRad[] = spillere.map((spiller) => ({
    id: spiller.id,
    navn: spiller.name,
    hcp: spiller.hcp,
    klubb: spiller.homeClub,
    skole: spiller.school,
    skolear: spiller.schoolYear,
    status: spiller.userStatus,
    tester: testPerSpiller.get(spiller.id)?.antall ?? 0,
    sisteTest: testPerSpiller.get(spiller.id)?.siste ?? null,
    aktivPlan: planPerSpiller.get(spiller.id) ?? null,
  }));
  return { kontekst, rader };
}

export function hentTnProtokollbibliotek() {
  return {
    versjon: TN_VERSION,
    rader: TN_CATALOG.map((protokoll) => ({
      id: protokoll.id,
      navn: protokoll.name,
      omrade: protokoll.kind,
      forsok: protokoll.rows.length,
      kilde: protokoll.source,
      status: protokoll.blocked ? "UTKAST" : "KLAR",
    })),
  };
}

export function hentTnProtokolldetalj(id: string) {
  const protokoll = tnProtocol(id);
  if (!protokoll) return null;
  return { ...protokoll, versjon: TN_VERSION };
}

export async function hentTnTurneringer(bruker: TnBruker) {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) return null;
  const spillerIder = await spillerIderFor(kontekst, bruker.id);
  const turneringer = await prisma.tournament.findMany({
    where: {
      mergedIntoId: null,
      OR: [
        { results: { some: { userId: { in: spillerIder } } } },
        { entries: { some: { userId: { in: spillerIder } } } },
      ],
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      location: true,
      sourceOrigin: true,
      status: true,
      results: { where: { userId: { in: spillerIder } }, select: { userId: true, position: true, score: true } },
      entries: { where: { userId: { in: spillerIder } }, select: { userId: true, entryStatus: true } },
    },
    orderBy: { startDate: "desc" },
    take: 100,
  });
  return { kontekst, turneringer };
}

export async function hentTnRangliste(bruker: TnBruker) {
  const spillerside = await hentTnSpillere(bruker);
  if (!spillerside) return null;
  const ider = spillerside.rader.map((spiller) => spiller.id);
  const resultater = await prisma.tournamentResult.findMany({
    where: { userId: { in: ider } },
    select: { userId: true, position: true, score: true, tournament: { select: { startDate: true } } },
  });
  const perSpiller = new Map<string, { starter: number; plasseringSum: number; plasseringer: number; scoreSum: number; scorer: number }>();
  for (const resultat of resultater) {
    const rad = perSpiller.get(resultat.userId) ?? { starter: 0, plasseringSum: 0, plasseringer: 0, scoreSum: 0, scorer: 0 };
    rad.starter += 1;
    if (resultat.position !== null) { rad.plasseringSum += resultat.position; rad.plasseringer += 1; }
    if (resultat.score !== null) { rad.scoreSum += resultat.score; rad.scorer += 1; }
    perSpiller.set(resultat.userId, rad);
  }
  return {
    kontekst: spillerside.kontekst,
    rader: spillerside.rader.map((spiller) => {
      const resultat = perSpiller.get(spiller.id);
      return {
        ...spiller,
        starter: resultat?.starter ?? 0,
        snittplassering: resultat?.plasseringer ? resultat.plasseringSum / resultat.plasseringer : null,
        bruttoScore: resultat?.scorer ? resultat.scoreSum / resultat.scorer : null,
      };
    }),
  };
}

export async function hentTnSamlinger(bruker: TnBruker) {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) return null;
  const spillerIder = await spillerIderFor(kontekst, bruker.id);
  const rader = await prisma.trainingCamp.findMany({
    where: { userId: { in: spillerIder } },
    select: { id: true, userId: true, name: true, startDate: true, endDate: true, location: true, partner: true, notes: true },
    orderBy: { startDate: "desc" },
    take: 150,
  });
  const samlinger = new Map<string, typeof rader>();
  for (const rad of rader) {
    const nokkel = `${rad.name}|${rad.startDate.toISOString()}|${rad.endDate.toISOString()}`;
    samlinger.set(nokkel, [...(samlinger.get(nokkel) ?? []), rad]);
  }
  return { kontekst, samlinger: [...samlinger.values()].map((deltakere) => ({ ...deltakere[0]!, antallDeltakere: deltakere.length })) };
}

export async function hentTnManedsplan(bruker: TnBruker) {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) return null;
  const naa = new Date();
  const fra = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth() - 1, 1));
  const til = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth() + 2, 1));
  const [okter, perioder] = await Promise.all([
    prisma.groupSchedule.findMany({
      where: { groupId: kontekst.gruppe.id, startAt: { gte: fra, lt: til } },
      select: { id: true, title: true, description: true, startAt: true, endAt: true, location: true, kind: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.groupPeriodBlock.findMany({
      where: { groupId: kontekst.gruppe.id, startDate: { lt: til }, endDate: { gte: fra } },
      select: { id: true, lPhase: true, startDate: true, endDate: true, focus: true, weeklyVolMin: true, weeklyVolMax: true },
      orderBy: { startDate: "asc" },
    }),
  ]);
  return { kontekst, fra, til, okter, perioder };
}

export async function hentTnSkoler(bruker: TnBruker) {
  const spillerside = await hentTnSpillere(bruker);
  if (!spillerside) return null;
  const grupper = new Map<string, TnSpillerRad[]>();
  for (const spiller of spillerside.rader) {
    const skole = spiller.skole?.trim() || "Ikke registrert";
    grupper.set(skole, [...(grupper.get(skole) ?? []), spiller]);
  }
  return { kontekst: spillerside.kontekst, skoler: [...grupper.entries()].map(([skole, spillere]) => ({ skole, spillere })) };
}

export async function hentTnTrenere(bruker: TnBruker) {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) return null;
  const rader = await prisma.groupMember.findMany({
    where: { groupId: kontekst.gruppe.id, role: { in: ["COACH", "ASSISTANT"] }, endedAt: null },
    select: { role: true, joinedAt: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { user: { name: "asc" } },
  });
  return { kontekst, rader };
}

export async function hentTnReferansenivaer(bruker: TnBruker) {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) return null;
  const rader = TN_CATALOG.flatMap((protokoll) =>
    protokoll.rows
      .filter((rad) => rad.target !== undefined)
      .slice(0, 6)
      .map((rad) => ({ protokollId: protokoll.id, protokoll: protokoll.name, mal: rad.label, verdi: rad.target ?? null })),
  );
  return { kontekst, versjon: TN_VERSION, rader };
}
