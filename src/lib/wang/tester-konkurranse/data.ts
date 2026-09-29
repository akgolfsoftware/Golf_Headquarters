import "server-only";

import { lesTurneringsresultat, resultatKilde } from "@/lib/domain/turneringsresultat";
import { prisma } from "@/lib/prisma";

import { osloIso } from "./format";
import type { ElevResultat, GjennomfortTurnering, KommendePamelding, StatRunde } from "./konkurranse";
import type { KoDeltakerKilde, KoOppdragKilde, TestDefinisjonInfo } from "./tester";

/**
 * Datalastere for WANG Tester og Konkurranse. Alle spørringer er avgrenset
 * til `gruppeId` fra krevWangTrener() — ekte eller demogruppe, aldri slug.
 * Elevnavn er PII om mindreårige: disse funksjonene brukes bare fra
 * trenerflaten bak porten.
 */

export type WangElevLite = { id: string; navn: string; klasse: string | null };

const defValg = { id: true, name: true, scoringRule: true, pyramidArea: true } as const;

/** Aktive elever (PLAYER) i gruppa, sortert på navn. */
export async function hentElever(gruppeId: string): Promise<WangElevLite[]> {
  const rader = await prisma.groupMember.findMany({
    where: { groupId: gruppeId, endedAt: null, role: "PLAYER" },
    select: { user: { select: { id: true, name: true, email: true, schoolYear: true } } },
  });
  return rader
    .map((r) => ({ id: r.user.id, navn: r.user.name?.trim() || r.user.email, klasse: r.user.schoolYear }))
    .toSorted((a, b) => a.navn.localeCompare(b.navn, "nb"));
}

function navn(u: { name: string | null; email: string } | null | undefined): string | null {
  if (!u) return null;
  return u.name?.trim() || u.email;
}

// ---------------------------------------------------------------- WG-03

/** De fysiske testene i batteriet (FYS, felles katalog). */
export async function hentFysDefinisjoner(): Promise<TestDefinisjonInfo[]> {
  const defs = await prisma.testDefinition.findMany({
    where: { pyramidArea: "FYS", erCanon: true, isCustom: false },
    select: defValg,
    orderBy: { name: "asc" },
  });
  return defs;
}

export async function hentFysMalinger(elevId: string, testIder: string[]) {
  return prisma.testResult.findMany({
    where: { userId: elevId, testId: { in: testIder } },
    select: { testId: true, takenAt: true, score: true },
    orderBy: { takenAt: "asc" },
  });
}

// ---------------------------------------------------------------- WANG-08

export async function hentTestdager(gruppeId: string) {
  return prisma.testDay.findMany({
    where: { groupId: gruppeId },
    orderBy: { scheduledAt: "desc" },
    select: {
      id: true, title: true, location: true, scheduledAt: true, status: true,
      coach: { select: { name: true, email: true } },
      testDefinition: { select: defValg },
      participants: { select: { status: true } },
    },
  });
}

export async function hentTestdag(gruppeId: string, testdagId: string) {
  const dag = await prisma.testDay.findFirst({
    where: { id: testdagId, groupId: gruppeId },
    select: {
      id: true, title: true, location: true, scheduledAt: true, status: true,
      coach: { select: { name: true, email: true } },
      testDefinition: { select: defValg },
      participants: {
        orderBy: { order: "asc" },
        select: {
          id: true, order: true, status: true,
          player: { select: { id: true, name: true, email: true, schoolYear: true } },
          result: { select: { id: true, score: true, details: true, takenAt: true, witnessStatus: true, recordedBy: { select: { name: true, email: true } } } },
        },
      },
    },
  });
  if (!dag) return null;
  return {
    ...dag,
    coachNavn: navn(dag.coach) ?? "—",
    deltakere: dag.participants.map((p) => ({
      id: p.id, nr: p.order, status: p.status,
      elev: { id: p.player.id, navn: navn(p.player) ?? "—", klasse: p.player.schoolYear },
      resultat: p.result ? { ...p.result, maltAv: navn(p.result.recordedBy) } : null,
    })),
  };
}

// ---------------------------------------------------------------- WANG-37

export async function hentTestkoKilder(gruppeId: string, elevIder: string[]): Promise<{ deltakere: KoDeltakerKilde[]; oppdrag: KoOppdragKilde[] }> {
  const [deltakere, oppdrag] = await Promise.all([
    prisma.testDayParticipant.findMany({
      where: { testDay: { groupId: gruppeId }, playerId: { in: elevIder } },
      select: {
        id: true, status: true, playerId: true,
        testDay: { select: { id: true, title: true, scheduledAt: true, status: true, coach: { select: { name: true, email: true } }, testDefinition: { select: defValg } } },
        result: { select: { id: true, score: true, details: true, takenAt: true, witnessStatus: true, recordedBy: { select: { name: true, email: true } } } },
      },
    }),
    prisma.testAssignment.findMany({
      where: { playerId: { in: elevIder }, status: "OPEN" },
      select: { id: true, status: true, playerId: true, dueDate: true, coach: { select: { name: true, email: true } }, test: { select: defValg } },
    }),
  ]);
  return {
    deltakere: deltakere.map((d) => ({
      id: d.id, status: d.status, elevId: d.playerId,
      testDag: { id: d.testDay.id, title: d.testDay.title, scheduledAt: d.testDay.scheduledAt, status: d.testDay.status, coachNavn: navn(d.testDay.coach) ?? "—" },
      test: d.testDay.testDefinition,
      resultat: d.result ? { id: d.result.id, score: d.result.score, details: d.result.details, takenAt: d.result.takenAt, witnessStatus: d.result.witnessStatus, maltAv: navn(d.result.recordedBy) } : null,
    })),
    oppdrag: oppdrag.map((o) => ({ id: o.id, status: o.status, elevId: o.playerId, dueDate: o.dueDate, coachNavn: navn(o.coach) ?? "—", test: o.test })),
  };
}

// ---------------------------------------------------------------- WANG-22

export async function hentTestDefinisjon(id: string): Promise<TestDefinisjonInfo | null> {
  return prisma.testDefinition.findFirst({ where: { id, isCustom: false }, select: defValg });
}

/** Antall resultater ført per test i gruppa — viser om protokollen er i bruk. */
export async function hentBrukPerTest(elevIder: string[]): Promise<Map<string, number>> {
  if (elevIder.length === 0) return new Map();
  const rader = await prisma.testResult.groupBy({ by: ["testId"], where: { userId: { in: elevIder } }, _count: { _all: true } });
  return new Map(rader.map((r) => [r.testId, r._count._all]));
}

// ---------------------------------------------------------------- WANG-23 / 39

export async function hentResultater(elevIder: string[], fra?: Date) {
  if (elevIder.length === 0) return [];
  return prisma.testResult.findMany({
    where: { userId: { in: elevIder }, ...(fra ? { takenAt: { gte: fra } } : {}) },
    orderBy: { takenAt: "asc" },
    select: {
      id: true, userId: true, testId: true, takenAt: true, score: true, details: true, witnessStatus: true,
      test: { select: defValg },
      recordedBy: { select: { name: true, email: true } },
    },
  });
}

export async function hentNesteTestdag(gruppeId: string, elevId: string, naa: Date) {
  return prisma.testDay.findFirst({
    where: { groupId: gruppeId, scheduledAt: { gte: naa }, status: { in: ["PLANNED", "ACTIVE"] }, participants: { some: { playerId: elevId } } },
    orderBy: { scheduledAt: "asc" },
    select: { id: true, title: true, scheduledAt: true, location: true },
  });
}

// ---------------------------------------------------------------- Turneringer

const entryValg = {
  status: true, position: true, scoreToPar: true, totalScore: true, rounds: true, klasseNavn: true,
  roundDetails: { select: { roundNumber: true, score: true, toPar: true, source: true }, orderBy: { roundNumber: "asc" as const } },
  tournament: { select: { id: true, name: true, startDate: true, endDate: true, location: true, sourceOrigin: true, course: { select: { name: true } } } },
} as const;

/** Offentlige turneringsresultater for elevene som er koblet til turneringsbasen. */
export async function hentOffentligeResultater(elever: WangElevLite[], turneringId?: string) {
  if (elever.length === 0) return { koblet: 0, rader: [] as Array<ElevResultat & { turnering: { id: string; name: string; startDate: Date; endDate: Date | null; sted: string | null; kilde: string | null } }> };
  const brukere = await prisma.user.findMany({
    where: { id: { in: elever.map((e) => e.id) }, publicPlayerId: { not: null } },
    select: { id: true, publicPlayerId: true },
  });
  const perSpiller = new Map(brukere.map((b) => [b.publicPlayerId as string, b.id]));
  const elevEtterId = new Map(elever.map((e) => [e.id, e]));
  if (perSpiller.size === 0) return { koblet: 0, rader: [] };
  const entries = await prisma.publicPlayerEntry.findMany({
    where: { playerId: { in: [...perSpiller.keys()] }, tournament: { mergedIntoId: null, ...(turneringId ? { id: turneringId } : {}) } },
    orderBy: { tournament: { startDate: "desc" } },
    select: { playerId: true, ...entryValg },
  });
  const rader = entries.flatMap((e) => {
    const elevId = perSpiller.get(e.playerId);
    const elev = elevId ? elevEtterId.get(elevId) : undefined;
    if (!elev) return [];
    const r = lesTurneringsresultat(e);
    return [{
      elevId: elev.id, navn: elev.navn, klasse: e.klasseNavn ?? elev.klasse, status: e.status,
      runder: r.runder, brutto: r.brutto, motPar: r.motPar, plasseringTekst: r.plasseringTekst, plassering: r.plassering, kildeDato: r.kildeDato,
      turnering: {
        id: e.tournament.id, name: e.tournament.name, startDate: e.tournament.startDate, endDate: e.tournament.endDate,
        sted: e.tournament.course?.name ?? e.tournament.location, kilde: e.tournament.sourceOrigin,
      },
    }];
  });
  return { koblet: perSpiller.size, rader };
}

/** Gjennomførte turneringer (startet før i dag), gruppert per turnering. */
export function grupperGjennomforte(rader: Awaited<ReturnType<typeof hentOffentligeResultater>>["rader"]): GjennomfortTurnering[] {
  const kart = new Map<string, GjennomfortTurnering>();
  for (const r of rader) {
    const t = kart.get(r.turnering.id) ?? { turneringId: r.turnering.id, navn: r.turnering.name, startDato: r.turnering.startDate, sted: r.turnering.sted, kilde: r.turnering.kilde ? resultatKilde(r.turnering.kilde) : null, deltakere: [] };
    t.deltakere.push(r);
    kart.set(r.turnering.id, t);
  }
  return [...kart.values()].toSorted((a, b) => b.startDato.getTime() - a.startDato.getTime());
}

export type KommendeTurnering = {
  turneringId: string | null;
  navn: string;
  startDato: Date;
  sted: string | null;
  frist: Date | null;
  pameldinger: KommendePamelding[];
};

/** Kommende turneringer elevene har på planen (TournamentEntry), gruppert per turnering. */
export async function hentKommende(elever: WangElevLite[], naa: Date, turneringId?: string): Promise<KommendeTurnering[]> {
  if (elever.length === 0) return [];
  const idag = new Date(`${osloIso(naa)}T00:00:00Z`);
  const entries = await prisma.tournamentEntry.findMany({
    where: {
      userId: { in: elever.map((e) => e.id) },
      withdrawnAt: null,
      ...(turneringId
        ? { tournamentId: turneringId }
        : { OR: [{ tournament: { startDate: { gte: idag }, mergedIntoId: null } }, { tournamentId: null, manualDate: { gte: idag } }] }),
    },
    select: {
      id: true, userId: true, entryStatus: true, manualName: true, manualDate: true,
      tournament: { select: { id: true, name: true, startDate: true, location: true, entryCloses: true, course: { select: { name: true } } } },
    },
  });
  const elevEtterId = new Map(elever.map((e) => [e.id, e]));
  const kart = new Map<string, KommendeTurnering>();
  for (const e of entries) {
    const elev = elevEtterId.get(e.userId);
    const start = e.tournament?.startDate ?? e.manualDate;
    if (!elev || !start) continue;
    const nokkel = e.tournament?.id ?? `manuell-${e.id}`;
    const t = kart.get(nokkel) ?? {
      turneringId: e.tournament?.id ?? null,
      navn: e.tournament?.name ?? e.manualName ?? "Egen turnering",
      startDato: start,
      sted: e.tournament?.course?.name ?? e.tournament?.location ?? null,
      frist: e.tournament?.entryCloses ?? null,
      pameldinger: [],
    };
    t.pameldinger.push({ elevId: elev.id, navn: elev.navn, klasse: elev.klasse, status: e.entryStatus });
    kart.set(nokkel, t);
  }
  return [...kart.values()].toSorted((a, b) => a.startDato.getTime() - b.startDato.getTime());
}

export async function hentTurneringInfo(turneringId: string) {
  return prisma.tournament.findFirst({
    where: { id: turneringId },
    select: { id: true, name: true, startDate: true, endDate: true, location: true, entryCloses: true, sourceOrigin: true, tour: true, lastSyncAt: true, course: { select: { name: true } } },
  });
}

/** Periodeblokken som dekker en dato, og siste testdag før den. */
export async function hentKnyttetTil(gruppeId: string, dato: Date) {
  const [periode, testdag] = await Promise.all([
    prisma.groupPeriodBlock.findFirst({ where: { groupId: gruppeId, startDate: { lte: dato }, endDate: { gte: dato } }, select: { lPhase: true, focus: true } }),
    prisma.testDay.findFirst({ where: { groupId: gruppeId, scheduledAt: { lt: dato }, status: { not: "CANCELLED" } }, orderBy: { scheduledAt: "desc" }, select: { id: true, title: true, scheduledAt: true } }),
  ]);
  return { periode, testdag };
}

// ---------------------------------------------------------------- WANG-09

export async function hentSamlinger(gruppeId: string) {
  return prisma.groupSchedule.findMany({
    where: { groupId: gruppeId, kind: { in: ["SAMLING", "HELDAGSSAMLING"] } },
    orderBy: { startAt: "asc" },
    select: { id: true, title: true, description: true, startAt: true, endAt: true, location: true, kind: true, maxParticipants: true },
  });
}

export async function hentSamling(gruppeId: string, id: string) {
  return prisma.groupSchedule.findFirst({
    where: { id, groupId: gruppeId, kind: { in: ["SAMLING", "HELDAGSSAMLING"] } },
    select: { id: true, title: true, description: true, startAt: true, endAt: true, location: true, kind: true, maxParticipants: true },
  });
}

// ---------------------------------------------------------------- WANG-27

/** Én elevs turneringsrunder med brutto, fra turneringsbasen. */
export async function hentElevRunder(elev: WangElevLite): Promise<{ koblet: boolean; runder: StatRunde[]; hentet: Date | null }> {
  const { koblet, rader } = await hentOffentligeResultater([elev]);
  const runder: StatRunde[] = rader.flatMap((r) =>
    r.runder
      .filter((x) => x.brutto !== null && x.brutto > 0)
      .map((x) => ({ dato: r.turnering.startDate, turnering: `${r.turnering.name} · R${x.nummer}`, sted: r.turnering.sted, brutto: x.brutto as number, motPar: x.motPar, hull: x.hull })),
  );
  const datoer = rader.map((r) => r.kildeDato).filter((d): d is Date => d !== null);
  const hentet = datoer.length ? new Date(Math.max(...datoer.map((d) => d.getTime()))) : null;
  return { koblet: koblet > 0, runder, hentet };
}
