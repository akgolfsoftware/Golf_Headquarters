import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { aktivtSpillerMedlemskapWhere, aktivtAkGruppeMedlemskapWhere } from "@/lib/domain/grupper";
import { tnFormat, tnScore, type TnResult } from "@/lib/portal-tester/tn-scoring";
import { TnResultSchema } from "@/lib/portal-tester/tn-scoring";
import { TnSessionSchema } from "@/lib/portal-tester/tn-session";
import { hentTnOversiktForBruker } from "@/lib/domain/tn-tilgang";
import { prisma } from "@/lib/prisma";
import { TN_CATALOG, TN_VERSION, tnProtocol, type TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnFromDefinitionId, tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import { resolveTilgang, type TilgangsNivaa, type TilgangsKilde } from "@/lib/feature-flags";
import { loadTesterScreen, type AxisGroup, type PlannedTest } from "@/lib/portal-tester/tester-data";
import { parseProtocol, type ScorekortForsok } from "@/lib/portal-tester/protocol";
import { parseForScoring, lavereErBedre, ScoringDetailsSchema } from "@/lib/portal-tester/test-scoring";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";

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

export type TnTurneringRad = {
  id: string;
  name: string;
  // Null = ingen dato registrert (manuell oppføring uten manualDate/manualEndDate).
  // Vises som "Dato ikke registrert" — ALDRI en oppdiktet dato.
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  sourceOrigin: string | null;
  results: { userId: string; position: number | null; score: number | null }[];
  entries: { userId: string; entryStatus: string }[];
};

export async function hentTnTurneringer(bruker: TnBruker) {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) return null;
  const spillerIder = await spillerIderFor(kontekst, bruker.id);
  const [katalogTurneringer, manuelleEntries] = await Promise.all([
    prisma.tournament.findMany({
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
        results: { where: { userId: { in: spillerIder } }, select: { userId: true, position: true, score: true } },
        entries: { where: { userId: { in: spillerIder } }, select: { userId: true, entryStatus: true } },
      },
      orderBy: { startDate: "desc" },
      take: 100,
    }),
    // Manuelle, spilleravgrensede oppføringer (ingen Tournament-rad — lagt
    // inn av spilleren selv via /team-norway/turneringer/ny → leggTilTurnering
    // med tournamentId=null). Disse er ALDRI del av katalogspørringen over
    // (den leser kun Tournament.entries, som krever tournamentId), så det er
    // ingen risiko for dobbelttelling her.
    prisma.tournamentEntry.findMany({
      where: { userId: { in: spillerIder }, tournamentId: null, manualName: { not: null } },
      select: { id: true, userId: true, manualName: true, manualDate: true, manualEndDate: true, entryStatus: true },
      orderBy: { manualDate: "desc" },
      take: 100,
    }),
  ]);

  const manuelleTurneringer: TnTurneringRad[] = manuelleEntries.map((entry) => ({
    id: `manual-${entry.id}`,
    name: entry.manualName ?? "Uten navn",
    startDate: entry.manualDate ?? entry.manualEndDate ?? null,
    endDate: entry.manualEndDate ?? entry.manualDate ?? null,
    location: null,
    sourceOrigin: "MANUAL",
    results: [],
    entries: [{ userId: entry.userId, entryStatus: entry.entryStatus }],
  }));

  // Kjente datoer først (nyest → eldst), ukjent dato (null) sist — ingen
  // oppdiktet dato brukes for å tvinge en sortering.
  const turneringer: TnTurneringRad[] = [...katalogTurneringer, ...manuelleTurneringer].sort((a, b) => {
    if (a.startDate === null && b.startDate === null) return 0;
    if (a.startDate === null) return 1;
    if (b.startDate === null) return -1;
    return b.startDate.getTime() - a.startDate.getTime();
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

/**
 * Eksplisitt TN-leserolle for testdag: COACH eller ASSISTANT (innsyn, som
 * resten av produktet), eller platform-ADMIN. IKKE `!erSpiller` — det ville
 * sluppet gjennom enhver annen rolle enn PLAYER. En spiller (og enhver uten
 * en av disse tre) ser aldri kø, utkast eller individuelle målinger her.
 */
function erTnTestdagLeser(kontekst: TnArbeidskontekst, bruker: TnBruker): boolean {
  return bruker.role === "ADMIN" || kontekst.rolle === "COACH" || kontekst.rolle === "ASSISTANT";
}

export type TnTestdagDeltakerRad = {
  id: string;
  spillerId: string;
  spillerNavn: string;
  order: number;
  status: "PENDING" | "SKIPPED" | "ABSENT" | "DONE";
  scoreTekst: string | null;
};

export type TnTestdagRad = {
  id: string;
  title: string;
  location: string | null;
  scheduledAt: Date;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  protokollNavn: string;
  antallDeltakere: number;
  antallFullfort: number;
};

/** Coach/assistent/admin: liste over testdager i Team Norway-gruppen (aktive og ferdige), nyeste først. */
export async function hentTnTestdager(bruker: TnBruker): Promise<{ kontekst: TnArbeidskontekst; dager: TnTestdagRad[] } | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || !erTnTestdagLeser(kontekst, bruker)) return null;
  const dager = await prisma.testDay.findMany({
    where: { groupId: kontekst.gruppe.id },
    orderBy: { scheduledAt: "desc" },
    take: 50,
    include: { testDefinition: { select: { name: true, protocol: true } }, participants: { select: { status: true } } },
  });
  return {
    kontekst,
    dager: dager.map((dag) => {
      const protokoll = tnProtocol((dag.testDefinition.protocol as { protocolId?: string } | null)?.protocolId ?? "");
      return {
        id: dag.id,
        title: dag.title,
        location: dag.location,
        scheduledAt: dag.scheduledAt,
        status: dag.status,
        protokollNavn: protokoll?.name ?? dag.testDefinition.name,
        antallDeltakere: dag.participants.length,
        antallFullfort: dag.participants.filter((p) => p.status === "DONE").length,
      };
    }),
  };
}

export type TnTestdag = {
  id: string;
  title: string;
  location: string | null;
  scheduledAt: Date;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  protokollNavn: string;
  deltakere: TnTestdagDeltakerRad[];
};

/** Coach/assistent/admin: ÉN validert testdag (aldri "nyeste" — id kommer fra ruten og kontrolleres mot gruppen). */
export async function hentTnTestdag(bruker: TnBruker, testDayId: string): Promise<{ kontekst: TnArbeidskontekst; dag: TnTestdag } | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || !erTnTestdagLeser(kontekst, bruker)) return null;
  const dag = await prisma.testDay.findFirst({
    where: { id: testDayId, groupId: kontekst.gruppe.id },
    include: {
      testDefinition: true,
      participants: {
        orderBy: { order: "asc" },
        include: { player: { select: { name: true } }, result: { select: { score: true, details: true } } },
      },
    },
  });
  if (!dag) return null;
  const protokoll = tnProtocol((dag.testDefinition.protocol as { protocolId?: string } | null)?.protocolId ?? "");
  return {
    kontekst,
    dag: {
      id: dag.id,
      title: dag.title,
      location: dag.location,
      scheduledAt: dag.scheduledAt,
      status: dag.status,
      protokollNavn: protokoll?.name ?? dag.testDefinition.name,
      deltakere: dag.participants.map((p) => {
        const detaljer = p.result?.details as Partial<TnResult> | null;
        const scoreTekst = p.status === "DONE" && p.result && detaljer?.unit ? tnFormat({ value: p.result.score, unit: detaljer.unit }) : null;
        return { id: p.id, spillerId: p.playerId, spillerNavn: p.player.name ?? "Ukjent", order: p.order, status: p.status, scoreTekst };
      }),
    },
  };
}

export type TnTestdagDeltakerDetalj = {
  id: string;
  spillerNavn: string;
  protokollId: string;
  protokollNavn: string;
  status: "PENDING" | "SKIPPED" | "ABSENT" | "DONE";
  scoreTekst: string | null;
  testDagId: string;
  testDagTitle: string;
  testDagStatus: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  /** Nærmeste PENDING-nabo i køen — ikke bare forrige/neste indeks (som ville stoppet på en DONE/SKIPPED/ABSENT-rad). Null = ingen flere PENDING i den retningen. */
  forrigePendingDeltakerId: string | null;
  nestePendingDeltakerId: string | null;
  eksisterendeUtkast: { revision: number; values: Record<string, Record<string, number | string | null>>; notes: string } | null;
  /** Presist ved uforenlig/foreldet lagret økt — vises i stedet for å late som utkastet er redigerbart. */
  utkastFeil: string | null;
  /** COACH/ADMIN — ASSISTANT (innsyn) ser samme skjerm, men uten skriveknapper (serveren ville avvist likevel). */
  kanSkrive: boolean;
};

/** Coach/assistent/admin: én deltakerrad + nærmeste PENDING-naboer i køen, for selve føringsskjermen. */
export async function hentTnTestdagDeltaker(bruker: TnBruker, deltakerId: string): Promise<TnTestdagDeltakerDetalj | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || !erTnTestdagLeser(kontekst, bruker)) return null;
  const deltaker = await prisma.testDayParticipant.findFirst({
    where: { id: deltakerId, testDay: { groupId: kontekst.gruppe.id } },
    include: {
      player: { select: { name: true } },
      testDay: { include: { testDefinition: true, participants: { orderBy: { order: "asc" }, select: { id: true, status: true } } } },
      session: { select: { scoringData: true } },
      result: { select: { score: true, details: true } },
    },
  });
  if (!deltaker) return null;
  const protokollId = (deltaker.testDay.testDefinition.protocol as { protocolId?: string } | null)?.protocolId ?? "";
  const protokoll = tnProtocol(protokollId);
  const naboer = deltaker.testDay.participants;
  const egenIndeks = naboer.findIndex((n) => n.id === deltaker.id);
  const forrigePendingDeltakerId = naboer.slice(0, egenIndeks).reverse().find((n) => n.status === "PENDING")?.id ?? null;
  const nestePendingDeltakerId = naboer.slice(egenIndeks + 1).find((n) => n.status === "PENDING")?.id ?? null;

  let eksisterendeUtkast: TnTestdagDeltakerDetalj["eksisterendeUtkast"] = null;
  let utkastFeil: string | null = null;
  if (deltaker.session) {
    const parsed = TnSessionSchema.safeParse(deltaker.session.scoringData);
    if (parsed.success) {
      eksisterendeUtkast = { revision: parsed.data.revision, values: parsed.data.values, notes: parsed.data.notes };
    } else {
      utkastFeil = "Den lagrede økten er fra en uforenlig eller foreldet protokollutgave og kan ikke vises som redigerbart utkast.";
    }
  }

  const detaljer = deltaker.result?.details as Partial<TnResult> | null;
  return {
    id: deltaker.id,
    spillerNavn: deltaker.player.name ?? "Ukjent",
    protokollId,
    protokollNavn: protokoll?.name ?? deltaker.testDay.testDefinition.name,
    status: deltaker.status,
    scoreTekst: deltaker.status === "DONE" && deltaker.result && detaljer?.unit ? tnFormat({ value: deltaker.result.score, unit: detaljer.unit }) : null,
    testDagId: deltaker.testDayId,
    testDagTitle: deltaker.testDay.title,
    testDagStatus: deltaker.testDay.status,
    forrigePendingDeltakerId,
    nestePendingDeltakerId,
    eksisterendeUtkast,
    utkastFeil,
    // Rollen alene er ikke nok: en avsluttet/kansellert/ennå-ikke-startet
    // testdag, eller en lagret økt fra en uforenlig protokollutgave
    // (utkastFeil), avvises av serveren uansett rolle — skjermen skal derfor
    // vise seg som skrivebeskyttet i disse tilfellene også, ikke bare late
    // som skriving er mulig og la brukeren møte en serverfeil ved lagring.
    kanSkrive: kontekst.kanAdministrere && deltaker.testDay.status === "ACTIVE" && !utkastFeil,
  };
}

/**
 * Spillerens fikserte kontekst for oversikt/tester/analyse (TN-utvidelse
 * 14.09.2026). Leser eksisterende tilgang FØR data — aldri en rå
 * spillerId fra URL/query alene:
 *  - spilleren selv: kun sin egen id.
 *  - coach/hjelpetrener/admin: spillerId må være et AKTIVT PLAYER-
 *    medlemskap i SAMME Team Norway-gruppe (`aktivtSpillerMedlemskapWhere`)
 *    — gruppetilhørighet er riktig skop for DELT TN-testdata (motsatt av
 *    personlig PlayerHQ-coachdata, som skal bruke `coachScopedPlayerWhere`).
 */
export type TnSpillerTilgang = {
  kontekst: TnArbeidskontekst;
  spillerId: string;
  spillerNavn: string;
};

/**
 * Strengere leserrolle enn `erTnTestdagLeser`, brukt KUN av de nye
 * personlige spillerdata-leserne i denne filen (aldri av de eksisterende
 * testdag-funksjonene — ingen utvidelse av gamle rettigheter). Krever BÅDE
 * riktig PLATTFORMROLLE (`User.role` — den autoritative kilden til «er
 * dette faktisk en trener-konto») OG riktig GRUPPEROLLE. En bruker hvis
 * plattformrolle er PLAYER/PARENT/GUEST skal ALDRI lese en annen spillers
 * personlige data — selv om det skulle finnes en (feilaktig/gammel)
 * `GroupMember`-rad med gruppe-rolle COACH/ASSISTANT for akkurat den
 * brukeren. Gruppemedlemskap alene er ikke nok; plattformrollen må også
 * faktisk være COACH (eller platform-ADMIN, som alltid har tilgang).
 */
function erTnPersonligDataLeser(kontekst: TnArbeidskontekst, bruker: TnBruker): boolean {
  if (bruker.role === "ADMIN") return true;
  return bruker.role === "COACH" && (kontekst.rolle === "COACH" || kontekst.rolle === "ASSISTANT");
}

export async function hentTnSpillerTilgang(bruker: TnBruker, spillerId: string): Promise<TnSpillerTilgang | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst) return null;
  if (kontekst.erSpiller) {
    // Global PLAYER skal KUN se seg selv — uansett hva `spillerId` i
    // URL-en/query-en sier. `kontekst.erSpiller` er gruppe-rollen alene;
    // en bruker med GRUPPE-rolle PLAYER men en avvikende PLATTFORMROLLE
    // (f.eks. GUEST) skal IKKE få en personlig lesevei bare fordi
    // gruppe-raden sier PLAYER — samme eksplisitte rolleprinsipp som
    // `erTnPersonligDataLeser` under, speilvendt for selv-tilgang.
    if (bruker.role !== "PLAYER" && bruker.role !== "COACH" && bruker.role !== "ADMIN") return null;
    if (bruker.id !== spillerId) return null;
    return { kontekst, spillerId, spillerNavn: bruker.name ?? "Ukjent" };
  }
  // Eksplisitt, STRENG leserrolle — se `erTnPersonligDataLeser` over. «ikke
  // PLAYER» er IKKE det samme som COACH/ASSISTANT/ADMIN, og gruppe-rollen
  // alene er ikke nok uten at plattformrollen faktisk er COACH/ADMIN.
  // `GroupMember.role` er en fri streng i skjemaet, ikke en lukket enum: et
  // medlem med en ukjent/annen rolle (GUEST o.l.) skal aldri kunne lese en
  // spillers
  // personlige data bare fordi de ikke er PLAYER.
  if (!erTnPersonligDataLeser(kontekst, bruker)) return null;
  const medlem = await prisma.groupMember.findFirst({
    where: { groupId: kontekst.gruppe.id, userId: spillerId, ...aktivtSpillerMedlemskapWhere() },
    select: { user: { select: { name: true } } },
  });
  if (!medlem) return null;
  return { kontekst, spillerId, spillerNavn: medlem.user.name ?? "Ukjent" };
}

/**
 * PlayerHQ-tilgangsstatus fra DEN eksisterende, kanoniske kilden
 * (`resolveTilgang`) — aldri utledet av TN-gruppemedlemskap alene (Team
 * Norway er `managedByAkGolf: false`, så det gir IKKE `AK_GRUPPE`-tilgang i
 * `resolveTilgang`). Viser kun det grove nivået (FULL/TALENT/INGEN) og
 * kilden — ingen Stripe-detaljer, ingen betalerinfo, ingen prisantakelse.
 * Kalles ALDRI med en rå spillerId — krever et allerede verifisert
 * `TnSpillerTilgang`-objekt, slik at kalleren beviser tilgangssjekken er
 * gjort. Fungerer aldri av rekonstruksjon — en feilet oppslag gir en
 * eksplisitt "feil"-status, aldri en stille "INGEN" som skjuler en ekte
 * databasefeil.
 */
export type TnSpillerLisens = { status: "ok"; niva: TilgangsNivaa; kilde: TilgangsKilde } | { status: "feil" };

export async function hentTnSpillerLisens(tilgang: TnSpillerTilgang): Promise<TnSpillerLisens> {
  try {
    const bruker = await prisma.user.findUniqueOrThrow({
      where: { id: tilgang.spillerId },
      select: { tier: true, profilType: true, createdAt: true, trialEndsAt: true },
    });
    const [coaching, playerhq, akGruppeCount] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId_kind: { userId: tilgang.spillerId, kind: "COACHING" } },
        select: { status: true, monthlyCredits: true, currentPeriodEnd: true },
      }),
      prisma.subscription.findUnique({
        where: { userId_kind: { userId: tilgang.spillerId, kind: "PLAYERHQ" } },
        select: { status: true, currentPeriodEnd: true, plan: true, stripeSubscriptionId: true },
      }),
      prisma.groupMember.count({ where: { userId: tilgang.spillerId, ...aktivtAkGruppeMedlemskapWhere() } }),
    ]);
    const t = resolveTilgang({
      tier: bruker.tier, profilType: bruker.profilType, createdAt: bruker.createdAt, trialEndsAt: bruker.trialEndsAt,
      coaching, playerhq, akGruppeCount,
    });
    return { status: "ok", niva: t.nivaa, kilde: t.kilde };
  } catch {
    return { status: "feil" };
  }
}

/**
 * Primær bedre-retning slik `tnScore` selv velger primærmetrikken — ALDRI
 * blindt `metrics[0]`. For 8-ball-protokoller er `metrics[0]` "Gjennomsnittlig
 * PEI" (lavere er bedre), men den faktiske primærscoren (`TnResult.score`,
 * altså tallet som faktisk sammenlignes/rangeres) er "Totalt antall poeng"
 * (HØYERE er bedre) — se `tnScore` i tn-scoring.ts. Returnerer `null` når
 * retningen ikke kan fastslås trygt (i stedet for å anta `true`).
 */
function tnPrimaerRetning(protokoll: TnProtocol, metrics: TnResult["metrics"]): boolean | null {
  if (protokoll.points8Ball) {
    const poeng = metrics.find((m) => m.label === "Totalt antall poeng");
    return poeng ? poeng.lowerIsBetter : null;
  }
  return metrics[0] ? metrics[0].lowerIsBetter : null;
}

type TnRaRad = { id: string; takenAt: Date; score: number; details: unknown };

/**
 * Validerer HVER sammenlignet rad — ikke bare den nyeste — og reberegner
 * resultatet KANONISK fra de rå forsøksverdiene (`tnScore`) i stedet for å
 * stole på det som ble lagret (score, enhet OG retning kan i prinsippet
 * være feil/manipulert/fra en senere endret formel). En rad tas kun med
 * når (a) JSON-en parser som et gyldig `TnResult`, (b) er skrevet for
 * NØYAKTIG denne protokollen (`protocolId`) og gjeldende `TN_VERSION`,
 * (c) protokollen for radens EGET `count` faktisk finnes og har riktig
 * antall forsøksrader (variable-count-protokoller uten riktig antall er
 * ikke sammenlignbare), (d) `tnScore` kan beregnes fra de rå verdiene uten
 * feil, og (e) det reberegnede tallet OG enheten samsvarer med det som
 * faktisk står i `score`-kolonnen. Alt annet telles som "utelatt" og
 * forklares i UI — det skjuler ALDRI hele testen bare fordi én rad
 * (f.eks. den nyeste) er uforenlig.
 */
function tnValiderRader<T extends TnRaRad>(rader: T[], protokoll: TnProtocol): { gyldige: (T & { parsed: TnResult; retning: boolean })[]; utelatt: number } {
  const gyldige: (T & { parsed: TnResult; retning: boolean })[] = [];
  let utelatt = 0;
  for (const r of rader) {
    const parsed = TnResultSchema.safeParse(r.details);
    if (!parsed.success || parsed.data.protocolId !== protokoll.id || parsed.data.version !== TN_VERSION) {
      utelatt += 1;
      continue;
    }
    const forventetProtokoll = protokoll.variableCount ? tnProtocol(protokoll.id, parsed.data.count) : protokoll;
    if (!forventetProtokoll || forventetProtokoll.rows.length !== parsed.data.count) {
      utelatt += 1;
      continue;
    }
    let kanonisk: TnResult;
    try {
      kanonisk = tnScore(forventetProtokoll, parsed.data.values);
    } catch {
      utelatt += 1;
      continue;
    }
    if (kanonisk.score !== r.score || kanonisk.unit !== parsed.data.unit) {
      utelatt += 1;
      continue;
    }
    const retning = tnPrimaerRetning(forventetProtokoll, kanonisk.metrics);
    if (retning === null) {
      utelatt += 1;
      continue;
    }
    gyldige.push({ ...r, parsed: parsed.data, retning });
  }
  return { gyldige, utelatt };
}

export type TnSpillerTestRad = {
  testId: string;
  protokollNavn: string;
  antall: number;
  antallUtelatt: number;
  // Alle nullable: en protokoll med KUN uforenlige rader vises fortsatt
  // (med forklaring i UI via antallUtelatt), i stedet for å forsvinne
  // stille fra oversikten.
  sisteScore: number | null;
  sisteEnhet: string | null;
  sisteFormatert: string | null;
  sisteDato: Date;
  forrigeScore: number | null;
  besteScore: number | null;
  besteFormatert: string | null;
  lowerIsBetter: boolean | null;
  sisteTestdagDeltakerId: string | null;
};

/**
 * Testoversikt per protokoll — ALDRI summert mellom protokoller (en
 * putte-test og en lengdetest er ikke sammenlignbare størrelser). Hver
 * rad er sin egen protokoll med siste/forrige/beste og riktig
 * bedre-retning KANONISK reberegnet (`tnValiderRader`), ikke lest fra
 * lagrede felt. En protokoll med kun uforenlige rader vises fortsatt —
 * med `antallUtelatt` lik totalen og alle måltall `null` — i stedet for
 * å forsvinne stille fra oversikten.
 */
export async function hentTnSpillerTester(bruker: TnBruker, spillerId: string): Promise<{ tilgang: TnSpillerTilgang; rader: TnSpillerTestRad[] } | null> {
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) return null;
  const resultater = await prisma.testResult.findMany({
    where: { userId: spillerId, testId: { startsWith: "tn-v3-" } },
    orderBy: { takenAt: "desc" },
    select: { id: true, testId: true, takenAt: true, score: true, details: true },
  });
  const koblinger = await prisma.testDayParticipant.findMany({
    where: { resultId: { in: resultater.map((r) => r.id) } },
    select: { id: true, resultId: true },
  });
  const koblingMap = new Map(koblinger.map((k) => [k.resultId, k.id]));
  const grupper = new Map<string, typeof resultater>();
  for (const r of resultater) {
    const liste = grupper.get(r.testId) ?? [];
    liste.push(r);
    grupper.set(r.testId, liste);
  }
  const rader: TnSpillerTestRad[] = [];
  for (const [testId, liste] of grupper) {
    const protokoll = tnFromDefinitionId(testId);
    if (!protokoll) continue; // ukjent protokoll — vises ikke, gjettes ikke
    const { gyldige, utelatt } = tnValiderRader(liste, protokoll);
    if (gyldige.length === 0) {
      // ALLE rader var uforenlige — vis protokollen med en synlig
      // forklaring i stedet for å la den forsvinne stille.
      rader.push({
        testId, protokollNavn: protokoll.name, antall: 0, antallUtelatt: utelatt,
        sisteScore: null, sisteEnhet: null, sisteFormatert: null, sisteDato: liste[0].takenAt,
        forrigeScore: null, besteScore: null, besteFormatert: null, lowerIsBetter: null,
        sisteTestdagDeltakerId: null,
      });
      continue;
    }
    const retning = gyldige[0].retning;
    const scores = gyldige.map((r) => r.score);
    const beste = retning ? Math.min(...scores) : Math.max(...scores);
    rader.push({
      testId,
      protokollNavn: protokoll.name,
      antall: gyldige.length,
      antallUtelatt: utelatt,
      sisteScore: gyldige[0].score,
      sisteEnhet: gyldige[0].parsed.unit,
      sisteFormatert: tnFormat({ value: gyldige[0].score, unit: gyldige[0].parsed.unit }),
      sisteDato: gyldige[0].takenAt,
      forrigeScore: gyldige[1]?.score ?? null,
      besteScore: beste,
      besteFormatert: tnFormat({ value: beste, unit: gyldige[0].parsed.unit }),
      lowerIsBetter: retning,
      sisteTestdagDeltakerId: koblingMap.get(gyldige[0].id) ?? null,
    });
  }
  rader.sort((a, b) => b.sisteDato.getTime() - a.sisteDato.getTime());
  return { tilgang, rader };
}

export type TnSpillerTestResultRad = {
  id: string;
  takenAt: Date;
  score: number;
  unit: string;
  formatert: string;
  recordedByCoach: boolean;
  testdagDeltakerId: string | null;
};

export type TnSpillerTestDetalj = {
  tilgang: TnSpillerTilgang;
  testId: string;
  protokollNavn: string;
  lowerIsBetter: boolean | null;
  besteScore: number | null;
  besteFormatert: string | null;
  historikk: TnSpillerTestResultRad[];
  antallUtelatt: number;
  sisteForsok: { label: string; verdi: string }[];
};

/**
 * Full historikk + siste forsøksrader for ÉN protokoll (aldri blandet med
 * andre). Validerer HVER rad kanonisk (`tnValiderRader`) — en uforenlig/
 * korrupt NYESTE rad skjuler ikke hele testen; gyldige eldre rader vises
 * fortsatt. Returnerer `null` KUN når spilleren aldri har registrert noe
 * på denne protokollen — finnes det rader, men ALLE er uforenlige, vises
 * en tom, forklart detaljside i stedet for et stille 404.
 */
export async function hentTnSpillerTestDetalj(bruker: TnBruker, spillerId: string, testId: string): Promise<TnSpillerTestDetalj | null> {
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) return null;
  const protokollBase = tnFromDefinitionId(testId);
  if (!protokollBase) return null;
  const resultater = await prisma.testResult.findMany({
    where: { userId: spillerId, testId },
    orderBy: { takenAt: "desc" },
    select: { id: true, takenAt: true, score: true, details: true, recordedById: true },
  });
  if (resultater.length === 0) return null;
  const { gyldige, utelatt } = tnValiderRader(resultater, protokollBase);
  if (gyldige.length === 0) {
    return {
      tilgang, testId, protokollNavn: protokollBase.name, lowerIsBetter: null,
      besteScore: null, besteFormatert: null, historikk: [], antallUtelatt: utelatt, sisteForsok: [],
    };
  }
  const retning = gyldige[0].retning;
  const koblinger = await prisma.testDayParticipant.findMany({
    where: { resultId: { in: gyldige.map((r) => r.id) } },
    select: { id: true, resultId: true },
  });
  const koblingMap = new Map(koblinger.map((k) => [k.resultId, k.id]));
  const scores = gyldige.map((r) => r.score);
  const beste = retning ? Math.min(...scores) : Math.max(...scores);
  const historikk: TnSpillerTestResultRad[] = gyldige.map((r) => ({
    id: r.id,
    takenAt: r.takenAt,
    score: r.score,
    unit: r.parsed.unit,
    formatert: tnFormat({ value: r.score, unit: r.parsed.unit }),
    recordedByCoach: r.recordedById !== null,
    testdagDeltakerId: koblingMap.get(r.id) ?? null,
  }));
  // Siste GYLDIGE rad (ikke nødvendigvis aller siste rad) er grunnlaget for
  // forsøksvisningen — variable-count-protokoller trenger riktig antall
  // rader for AKKURAT den gjennomføringen.
  const sisteGyldig = gyldige[0].parsed;
  const protokoll = protokollBase.variableCount ? tnProtocol(protokollBase.id, sisteGyldig.count) : protokollBase;
  const sisteForsok = protokoll
    ? protokoll.rows.map((row, i) => {
        const felter = sisteGyldig.values[String(i + 1)] ?? {};
        const tekst = row.fields
          .map((f) => {
            const v = felter[f.key];
            if (v === null || v === undefined || v === "") return `${f.label}: —`;
            return `${f.label}: ${v}${f.unit ? ` ${f.unit}` : ""}`;
          })
          .join(" · ");
        return { label: `Forsøk ${i + 1} · ${row.label}`, verdi: tekst };
      })
    : [];
  return {
    tilgang, testId, protokollNavn: protokollBase.name, lowerIsBetter: retning,
    besteScore: beste, besteFormatert: tnFormat({ value: beste, unit: gyldige[0].parsed.unit }),
    historikk, antallUtelatt: utelatt, sisteForsok,
  };
}

export type TnGruppeanalyseValg = { kontekst: TnArbeidskontekst; protokoller: { id: string; navn: string }[]; testdager: TnTestdagRad[] };

/** Coach/assistent/admin: valgmuligheter for gruppeanalyse (protokoll ELLER testdag). */
export async function hentTnGruppeanalyseValg(bruker: TnBruker): Promise<TnGruppeanalyseValg | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || !erTnPersonligDataLeser(kontekst, bruker)) return null;
  const testdager = await hentTnTestdager(bruker);
  return {
    kontekst,
    protokoller: TN_CATALOG.filter((p) => !p.blocked && !p.variableCount).map((p) => ({ id: p.id, navn: p.name })),
    testdager: testdager?.dager ?? [],
  };
}

/**
 * `status` bevares eksplisitt fra `TestDayParticipant` — «ingen resultat»
 * kan bety PENDING, SKIPPED, ABSENT eller (sjeldent) et resultat som ikke
 * besto valideringen. Å slå alt sammen til bare `score: null` ville
 * slettet nettopp den forskjellen for coachen.
 */
export type TnGruppeanalyseRad = {
  spillerId: string;
  spillerNavn: string;
  status: "PENDING" | "SKIPPED" | "ABSENT" | "DONE" | "IKKE_TESTDAG";
  score: number | null;
  formatert: string | null;
};
export type TnGruppeanalyseResultat = {
  kontekst: TnArbeidskontekst;
  protokollNavn: string;
  lowerIsBetter: boolean;
  grunnlag: { type: "testdag" | "protokoll"; navn: string; dato: Date | null };
  rader: TnGruppeanalyseRad[];
};

function sorterGruppeanalyse(rader: TnGruppeanalyseRad[], lowerIsBetter: boolean): TnGruppeanalyseRad[] {
  return [...rader].sort((a, b) => {
    // Manglende data er UKJENT, ikke en dårlig plassering på 0 — havner
    // sist, men blandes aldri inn i selve rangeringen mellom kjente tall.
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return lowerIsBetter ? a.score - b.score : b.score - a.score;
  });
}

/**
 * Gruppeanalyse gjelder ALDRI "alle tall om alle spillere" — kun ÉN valgt
 * testdag (faktiske deltakere den dagen) eller ÉN valgt protokoll
 * (beste GYLDIGE resultat per aktiv spiller på nøyaktig den protokollen).
 * Aldri blandet mellom protokoller/kind. Hver rad valideres enkeltvis med
 * samme regel som spillerens egen oversikt (`tnValiderRader`).
 */
export async function hentTnGruppeanalyseResultat(bruker: TnBruker, params: { protokollId?: string; testDayId?: string }): Promise<TnGruppeanalyseResultat | null> {
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || !erTnPersonligDataLeser(kontekst, bruker)) return null;

  if (params.testDayId) {
    const dag = await prisma.testDay.findFirst({
      where: { id: params.testDayId, groupId: kontekst.gruppe.id },
      include: {
        testDefinition: true,
        participants: { include: { player: { select: { name: true } }, result: { select: { id: true, score: true, details: true } } } },
      },
    });
    if (!dag) return null;
    const protokollId = (dag.testDefinition.protocol as { protocolId?: string } | null)?.protocolId ?? "";
    const protokoll = tnProtocol(protokollId);
    if (!protokoll) return null;
    // Statisk fra protokollen (samme regel som `tnScore` bruker for å velge
    // primærmetrikk): kun 8-ball-protokoller har "høyere er bedre"
    // (Totalt antall poeng). Alle andre har PEI/antall slag som primær,
    // som alltid er "lavere er bedre" — se tn-scoring.ts.
    const lowerIsBetter = !protokoll.points8Ball;
    const rader: TnGruppeanalyseRad[] = dag.participants.map((p) => {
      if (p.status !== "DONE" || !p.result) {
        return { spillerId: p.playerId, spillerNavn: p.player.name ?? "Ukjent", status: p.status, score: null, formatert: null };
      }
      const { gyldige } = tnValiderRader([{ id: p.result.id, takenAt: dag.scheduledAt, score: p.result.score, details: p.result.details }], protokoll);
      const rad = gyldige[0];
      return {
        spillerId: p.playerId, spillerNavn: p.player.name ?? "Ukjent", status: "DONE" as const,
        score: rad ? rad.score : null,
        formatert: rad ? tnFormat({ value: rad.score, unit: rad.parsed.unit }) : null,
      };
    });
    return {
      kontekst, protokollNavn: protokoll.name, lowerIsBetter,
      grunnlag: { type: "testdag", navn: dag.title, dato: dag.scheduledAt },
      rader: sorterGruppeanalyse(rader, lowerIsBetter),
    };
  }

  if (params.protokollId) {
    const protokoll = tnProtocol(params.protokollId);
    if (!protokoll || protokoll.blocked) return null;
    const testId = tnDefinitionId(protokoll);
    const lowerIsBetter = protokoll.points8Ball ? false : true;
    const spillere = await prisma.groupMember.findMany({
      where: { groupId: kontekst.gruppe.id, ...aktivtSpillerMedlemskapWhere() },
      select: { userId: true, user: { select: { name: true } } },
    });
    const rader: TnGruppeanalyseRad[] = await Promise.all(
      spillere.map(async (s) => {
        const kandidater = await prisma.testResult.findMany({
          where: { userId: s.userId, testId },
          orderBy: { takenAt: "desc" },
          select: { id: true, takenAt: true, score: true, details: true },
        });
        const { gyldige } = tnValiderRader(kandidater, protokoll);
        if (gyldige.length === 0) return { spillerId: s.userId, spillerNavn: s.user.name ?? "Ukjent", status: "IKKE_TESTDAG" as const, score: null, formatert: null };
        const scores = gyldige.map((r) => r.score);
        const beste = lowerIsBetter ? Math.min(...scores) : Math.max(...scores);
        return {
          spillerId: s.userId, spillerNavn: s.user.name ?? "Ukjent", status: "DONE" as const,
          score: beste, formatert: tnFormat({ value: beste, unit: gyldige[0].parsed.unit }),
        };
      }),
    );
    return {
      kontekst, protokollNavn: protokoll.name, lowerIsBetter,
      grunnlag: { type: "protokoll", navn: protokoll.name, dato: null },
      rader: sorterGruppeanalyse(rader, lowerIsBetter),
    };
  }

  return null;
}

/**
 * Øvrige PlayerHQ-tester (utover TN-katalogen) for en TN-spiller. Gjenbruker
 * den EKSISTERENDE, generelle testoversikten (`loadTesterScreen`) — kalt med
 * MÅLSPILLERENS egne felt (id/navn/hcp/tier), ikke den innloggede coachens —
 * og fjerner tn-v3-radene herfra (de har sin egen, dedikerte visning i
 * `hentTnSpillerTester`, med riktigere protokollvalidering enn den generelle
 * heuristikken). Hver lenke skrives om til TN-spillerens EGEN rute — aldri
 * coachens egen /portal, som ville vist coachens data i stedet for spillerens.
 */
export type TnSpillerPlanlagtTest = { id: string; testId: string; navn: string; status: "PÅGÅR" | "PLANLAGT" | "ÅPEN TILDELING"; nar: string | null; frist: Date | null; href: string };
export type TnSpillerOvrigeTester = { tilgang: TnSpillerTilgang; grupper: AxisGroup[]; planlagt: TnSpillerPlanlagtTest[] };

/**
 * Skriver om en PlannedTest (`loadTesterScreen().planned` — KUN pågående/
 * påbegynte `TestSession`-rader, IKKE `TestAssignment`) sin coach-egne
 * /portal-href til spillerens TN-rute. `p.id` er `TestSession.id`, IKKE
 * testdefinisjonens id — ruten og tn-v3-filteret må bruke `p.testId`.
 */
function tnOmTnRuteForPlanlagt(spillerId: string, p: PlannedTest): TnSpillerPlanlagtTest {
  return { id: p.id, testId: p.testId, navn: p.name, status: p.state === "ongoing" ? "PÅGÅR" : "PLANLAGT", nar: p.when, frist: null, href: `/team-norway/spiller/${spillerId}/tester/${p.testId}` };
}

/**
 * Øvrige PlayerHQ-tester (utover TN-katalogen) for en TN-spiller. Gjenbruker
 * den EKSISTERENDE, generelle testoversikten (`loadTesterScreen`) — kalt med
 * MÅLSPILLERENS egne felt (id/navn/hcp/tier), ikke den innloggede coachens —
 * og fjerner tn-v3-radene herfra (de har sin egen, dedikerte visning i
 * `hentTnSpillerTester`, med riktigere protokollvalidering enn den generelle
 * heuristikken). HVER lenke skrives om til TN-spillerens EGEN rute — aldri
 * coachens egen /portal.
 *
 * «Planlagt/åpent» kombinerer TO reelt ulike kilder:
 *  - `loadTesterScreen().planned` — kun PÅGÅENDE/påbegynte `TestSession`.
 *    Loaderen bruker IKKE `TestAssignment` til dette; den henter
 *    tildelinger kun for `forfallDato` på allerede-testede rader
 *    (`forfallByTest`), aldri som egne "planlagt"-oppføringer.
 *  - Faktiske ÅPNE `TestAssignment`-rader for MÅLSPILLEREN, hentet direkte
 *    her med `testTilgangWhere(spillerId)` på definisjonen (samme
 *    synlighetsregel som resten av spillerens test-univers).
 */
export async function hentTnSpillerOvrigeTester(bruker: TnBruker, spillerId: string): Promise<TnSpillerOvrigeTester | null> {
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) return null;
  const malSpiller = await prisma.user.findUnique({ where: { id: spillerId }, select: { id: true, name: true, hcp: true, tier: true } });
  if (!malSpiller) return null;
  const [skjerm, apneTildelinger] = await Promise.all([
    loadTesterScreen(malSpiller),
    prisma.testAssignment.findMany({
      where: { playerId: spillerId, status: "OPEN", testId: { not: { startsWith: "tn-v3-" } }, test: testTilgangWhere(spillerId) },
      orderBy: { createdAt: "desc" },
      select: { id: true, testId: true, dueDate: true, test: { select: { name: true } } },
    }),
  ]);
  const grupper = skjerm.groups
    .map((gruppe) => ({
      ...gruppe,
      rows: gruppe.rows
        .filter((rad) => !rad.id.startsWith("tn-v3-"))
        .map((rad) => ({ ...rad, href: `/team-norway/spiller/${spillerId}/tester/${rad.id}` })),
    }))
    .filter((gruppe) => gruppe.rows.length > 0);
  const pagaende = skjerm.planned.filter((p) => !p.testId.startsWith("tn-v3-")).map((p) => tnOmTnRuteForPlanlagt(spillerId, p));
  const tildelt: TnSpillerPlanlagtTest[] = apneTildelinger.map((t) => ({
    id: t.id, testId: t.testId, navn: t.test.name, status: "ÅPEN TILDELING",
    nar: null, frist: t.dueDate, href: `/team-norway/spiller/${spillerId}/tester/${t.testId}`,
  }));
  return { tilgang, grupper, planlagt: [...pagaende, ...tildelt] };
}

/** Grupperer forsøk på label → steg-liste (samme mønster som /portal/tren/tester/[testId]). */
function tnGrupperSteg(forsok: ScorekortForsok[]): { label: string; antall: number; target: string | null }[] {
  const m = new Map<string, { label: string; antall: number; target: string | null }>();
  for (const f of forsok) {
    const eksisterende = m.get(f.label);
    if (eksisterende) eksisterende.antall += 1;
    else m.set(f.label, { label: f.label, antall: 1, target: f.target ?? null });
  }
  return [...m.values()];
}

export type TnSpillerOvrigTestDetalj = {
  tilgang: TnSpillerTilgang;
  testId: string;
  navn: string;
  regel: string;
  enhet: string | null;
  lowerIsBetter: boolean | null;
  steg: { label: string; antall: number; target: string | null }[];
  historikk: { id: string; takenAt: Date; score: number }[];
  sisteForsok: { nr: number; ok: boolean | null; side: "V" | "H" | null }[];
};

/**
 * Detalj for en ØVRIG (ikke-TN) test — gjenbruker de SAMME kanoniske
 * hjelperne som `/portal/tren/tester/[testId]` selv bruker
 * (`parseProtocol`/`parseForScoring`/`lavereErBedre`/`ScoringDetailsSchema`),
 * slik at protokollens faktiske steg/instruksjon og siste-forsøk-rutenett
 * (OK/BOM for Gate-typer) vises der kilden faktisk har dem — ikke en
 * påstand om at generiske tester mangler forsøksstruktur. `testTilgangWhere`
 * gjelder for MÅLSPILLEREN (spillerId), ikke bare et rått `id`-oppslag —
 * samme synlighetsregel som spillerens egen /portal-visning.
 */
export async function hentTnSpillerOvrigTestDetalj(bruker: TnBruker, spillerId: string, testId: string): Promise<TnSpillerOvrigTestDetalj | null> {
  const tilgang = await hentTnSpillerTilgang(bruker, spillerId);
  if (!tilgang) return null;
  const definisjon = await prisma.testDefinition.findFirst({
    where: { id: testId, AND: [testTilgangWhere(spillerId)] },
    select: { name: true, scoringRule: true, protocol: true },
  });
  if (!definisjon) return null;
  const resultater = await prisma.testResult.findMany({
    where: { userId: spillerId, testId },
    orderBy: { takenAt: "desc" },
    select: { id: true, takenAt: true, score: true, details: true },
  });
  // En gyldig testdefinisjon (protokoll/instruksjon finnes, evt. en åpen
  // tildeling) skal vise protokollen med «ingen resultater ennå» — ALDRI
  // et 404 bare fordi spilleren ikke har fullført den ennå.
  const spec = parseProtocol(definisjon.protocol);
  const scoringSpec = parseForScoring(definisjon.protocol);
  const lowerIsBetter = scoringSpec.kind === "fallback" ? null : lavereErBedre(scoringSpec.kind);
  const erGateType = scoringSpec.kind === "count_ok" || scoringSpec.kind === "hit_rate";
  let sisteForsok: { nr: number; ok: boolean | null; side: "V" | "H" | null }[] = [];
  if (erGateType && resultater.length > 0) {
    const parsedDetails = ScoringDetailsSchema.safeParse(resultater[0].details);
    if (parsedDetails.success) {
      sisteForsok = parsedDetails.data.perSlag.map((s) => ({
        nr: s.nr,
        ok: typeof s.verdier.ok === "boolean" ? s.verdier.ok : typeof s.verdier.sunket === "boolean" ? s.verdier.sunket : null,
        side: s.verdier.miss_side === "V" || s.verdier.miss_side === "H" ? (s.verdier.miss_side as "V" | "H") : null,
      }));
    }
  }
  return {
    tilgang, testId, navn: definisjon.name, regel: definisjon.scoringRule,
    enhet: scoringSpec.unit, lowerIsBetter, steg: spec ? tnGrupperSteg(spec.forsok) : [],
    historikk: resultater.map((r) => ({ id: r.id, takenAt: r.takenAt, score: r.score })),
    sisteForsok,
  };
}

export type TnSpillerAktivPlan = { id: string; navn: string; status: string; startDato: Date; sluttDato: Date | null };

/** Aktive planer fra den eksisterende TrainingPlan-kilden — ikke bare et testkort. */
export async function hentTnSpillerAktivePlaner(tilgang: TnSpillerTilgang): Promise<TnSpillerAktivPlan[]> {
  const planer = await prisma.trainingPlan.findMany({
    where: { userId: tilgang.spillerId, isActive: true },
    select: { id: true, name: true, status: true, startDate: true, endDate: true },
    orderBy: { startDate: "desc" },
  });
  return planer.map((p) => ({ id: p.id, navn: p.name, status: p.status, startDato: p.startDate, sluttDato: p.endDate }));
}

export type TnSpillerAnalyseHub = {
  sgAkser: { id: string; etikett: string; tekst: string; verdi: number | null }[];
  trackman: { klubb: string; datoKort: string; setning: string; meta: string } | null;
};

/**
 * Valgt spillers REELLE SG/TrackMan-oppsummering — gjenbruker den
 * eksisterende `hentAnalyseHub(userId)` (samme kilde som spillerens egen
 * PlayerHQ-analyse), kalt med MÅLSPILLERENS id. Lovlig innsyn er allerede
 * bevist av `hentTnSpillerTilgang` (aktivt TN-gruppemedlemskap, samme
 * grunnlag som `coachScopedPlayerWhere`s gruppe-gren) — ingen ny consent-
 * eller helserettighet innføres. `dypere`-lenkene i kilden peker til
 * coachens EGEN /portal og utelates derfor bevisst.
 */
export async function hentTnSpillerAnalyseHub(tilgang: TnSpillerTilgang): Promise<TnSpillerAnalyseHub> {
  const { hentAnalyseHub } = await import("@/lib/portal-analyse/tm-hub-data");
  const hub = await hentAnalyseHub(tilgang.spillerId);
  return {
    sgAkser: hub.sgAkser,
    trackman: hub.trackman ? { klubb: hub.trackman.klubb, datoKort: hub.trackman.datoKort, setning: hub.trackman.setning, meta: hub.trackman.meta } : null,
  };
}
