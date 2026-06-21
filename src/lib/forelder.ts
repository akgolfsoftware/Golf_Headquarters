// Helpers for Foreldreportal — henter koblede barn for en innlogget forelder.

import { prisma } from "@/lib/prisma";
import type { PaymentStatus, PyramidArea } from "@/generated/prisma/client";
import { startOfWeek, endOfWeek, ukenummer } from "@/lib/uke-helpers";
import { computeStreak, aktivStreak } from "@/lib/streak";

export async function hentBarnForForelder(parentUserId: string) {
  const links = await prisma.parentRelation.findMany({
    where: { parentId: parentUserId },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          hcp: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return links.map((l) => ({
    linkId: l.id,
    relationship: l.relationship,
    child: l.child,
  }));
}

export async function assertBarnTilhorerForelder(
  parentUserId: string,
  childId: string
): Promise<boolean> {
  const rel = await prisma.parentRelation.findUnique({
    where: { parentId_childId: { parentId: parentUserId, childId } },
  });
  return !!rel;
}

// ── Foreldre-portal · landing-data (mobil-først) ──────────────────────────
// Aggregerer KPI, kommende økter, fakturaer og aktivitet for ÉT fokus-barn
// (det første koblede barnet). Foreldre-portalen er lese-først.

export type ForelderBarn = {
  id: string;
  name: string;
  avatarUrl: string | null;
  hcp: number | null;
  relationship: string;
};

export type KommendeOkt = {
  id: string;
  title: string;
  scheduledAt: Date;
  pyramidArea: PyramidArea;
  childName: string;
};

export type KommendeBooking = {
  id: string;
  startAt: Date;
  serviceName: string;
  locationName: string;
  durationMin: number;
  coachName: string | null;
  status: "BETALT" | "VENT";
};

export type ForelderFaktura = {
  id: string;
  beskrivelse: string;
  amountOre: number;
  status: PaymentStatus;
  createdAt: Date;
  childName: string | null;
};

export type ForelderAktivitet = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: Date;
  link: string | null;
};

export type ForelderOversikt = {
  /** Antall koblede barn — styrer bytte-UI og tomtilstander. */
  antallBarn: number;
  /** Fokus-barnet (første koblede). Null hvis ingen barn er koblet. */
  fokusBarn: ForelderBarn | null;
  coachNavn: string | null;
  klubb: string | null;
  kpi: {
    okter30d: number;
    nesteBooking: KommendeBooking | null;
    utestaaendeOre: number;
    utestaaendeAntall: number;
  };
  kommendeBookinger: KommendeBooking[];
  kommendeOkter: KommendeOkt[];
  fakturaer: ForelderFaktura[];
  aktivitet: ForelderAktivitet[];
};

const UBETALT: PaymentStatus[] = ["PENDING", "FAILED"];

/**
 * Henter all data til /forelder-landingen for det første koblede barnet.
 * Returnerer `fokusBarn: null` når forelderen ikke er koblet til noen barn.
 */
export async function hentForelderOversikt(
  parentUserId: string
): Promise<ForelderOversikt> {
  const barn = await hentBarnForForelder(parentUserId);

  if (barn.length === 0) {
    return {
      antallBarn: 0,
      fokusBarn: null,
      coachNavn: null,
      klubb: null,
      kpi: {
        okter30d: 0,
        nesteBooking: null,
        utestaaendeOre: 0,
        utestaaendeAntall: 0,
      },
      kommendeBookinger: [],
      kommendeOkter: [],
      fakturaer: [],
      aktivitet: [],
    };
  }

  const fokus = barn[0];
  const childId = fokus.child.id;
  const now = new Date();
  const om7dager = new Date(now);
  om7dager.setDate(om7dager.getDate() + 7);
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  const [
    klubbBarn,
    okter30dAntall,
    nesteBookingRad,
    kommendeBookingerRad,
    kommendeOkterRad,
    paymentsRad,
    notifRad,
  ] = await Promise.all([
    // Hjemmeklubb hentes separat (ikke i select-listen til hentBarnForForelder).
    prisma.user.findUnique({
      where: { id: childId },
      select: { homeClub: true },
    }),
    // ØKTER · 30 D — antall gjennomførte logger siste 30 dager.
    prisma.trainingPlanSessionLog.count({
      where: {
        completedAt: { gte: tretti, not: null },
        session: { plan: { userId: childId } },
      },
    }),
    // NESTE BOOKING — neste reelle booking (ikke avlyst) frem i tid.
    prisma.booking.findFirst({
      where: {
        userId: childId,
        startAt: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { startAt: "asc" },
      include: {
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
        coach: { select: { name: true } },
      },
    }),
    // Kommende bookinger neste 7 dager (for "Kommende"-listen).
    prisma.booking.findMany({
      where: {
        userId: childId,
        startAt: { gte: now, lte: om7dager },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { startAt: "asc" },
      take: 6,
      include: {
        serviceType: { select: { name: true, durationMin: true } },
        location: { select: { name: true } },
        coach: { select: { name: true } },
      },
    }),
    // Kommende planlagte treningsøkter neste 7 dager.
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: childId },
        status: { in: ["PLANNED", "ACTIVE"] },
        scheduledAt: { gte: now, lte: om7dager },
      },
      orderBy: { scheduledAt: "asc" },
      take: 6,
      select: { id: true, title: true, scheduledAt: true, pyramidArea: true },
    }),
    // Fakturaer — siste betalinger.
    prisma.payment.findMany({
      where: { userId: childId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Siste aktivitet — barnets varsler.
    prisma.notification.findMany({
      where: { userId: childId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const coachNavn = nesteBookingRad?.coach?.name ?? null;
  const fornavn = fokus.child.name.split(" ")[0] ?? fokus.child.name;

  const nesteBooking: KommendeBooking | null = nesteBookingRad
    ? {
        id: nesteBookingRad.id,
        startAt: nesteBookingRad.startAt,
        serviceName: nesteBookingRad.serviceType.name,
        locationName: nesteBookingRad.location.name,
        durationMin: nesteBookingRad.serviceType.durationMin,
        coachName: nesteBookingRad.coach?.name ?? null,
        status: nesteBookingRad.status === "CONFIRMED" ? "BETALT" : "VENT",
      }
    : null;

  const ubetalte = paymentsRad.filter((p) => UBETALT.includes(p.status));
  const utestaaendeOre = ubetalte.reduce((s, p) => s + p.amountOre, 0);

  return {
    antallBarn: barn.length,
    fokusBarn: {
      id: childId,
      name: fokus.child.name,
      avatarUrl: fokus.child.avatarUrl,
      hcp: fokus.child.hcp,
      relationship: fokus.relationship,
    },
    coachNavn,
    klubb: klubbBarn?.homeClub ?? null,
    kpi: {
      okter30d: okter30dAntall,
      nesteBooking,
      utestaaendeOre,
      utestaaendeAntall: ubetalte.length,
    },
    kommendeBookinger: kommendeBookingerRad.map((b) => ({
      id: b.id,
      startAt: b.startAt,
      serviceName: b.serviceType.name,
      locationName: b.location.name,
      durationMin: b.serviceType.durationMin,
      coachName: b.coach?.name ?? null,
      status: b.status === "CONFIRMED" ? "BETALT" : "VENT",
    })),
    kommendeOkter: kommendeOkterRad.map((s) => ({
      id: s.id,
      title: s.title,
      scheduledAt: s.scheduledAt,
      pyramidArea: s.pyramidArea,
      childName: fornavn,
    })),
    fakturaer: paymentsRad.slice(0, 3).map((p) => ({
      id: p.id,
      beskrivelse: p.description ?? p.type,
      amountOre: p.amountOre,
      status: p.status,
      createdAt: p.createdAt,
      childName: fornavn,
    })),
    aktivitet: notifRad.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      createdAt: n.createdAt,
      link: n.link,
    })),
  };
}

// ── Foreldreportal · terminal-lys ukerapport (fasit «Forelderportal (terminal-lys)») ──
// Read-only, forklarende: samtykke-status + narrativ ukerapport + 8-ukers SG-trend +
// coach-notat. ALT avledet fra barnets EKTE data — ingen fabrikerte tall.

export type ForelderUkerapport = {
  childFirstName: string;
  childName: string;
  childAge: number | null; // fra dateOfBirth; null hvis ukjent
  consentActive: boolean;
  ukenummer: number;
  oktFullfort: number;
  oktPlanlagt: number;
  /** Norsk navn på området barnet jobbet mest med denne uka (null = ingen data). */
  fokusOmrade: string | null;
  /** Retning på SG-utviklingen for narrativen. */
  sgRetning: "opp" | "ned" | "stabil" | null;
  oppmotePct: number | null;
  sgTrendDelta: number | null;
  streak: number;
  /** 8 søylehøyder (0–100) for ukentlig SG-total, eldst først. */
  trend8uker: number[];
  coachNote: { author: string; body: string } | null;
  /** Timer trent denne uka (sum av fullførte øktvarigheter). */
  trentTimer: number;
  /** Snitt SG-total for runder denne uka (null = ingen runder). */
  ukeSg: number | null;
  /** Beste testresultat (navn + score) — null hvis ingen tester. */
  hoydepunkt: { testNavn: string; score: number } | null;
};

const AKSE_NAVN: Record<PyramidArea, string> = {
  FYS: "fysisk trening",
  TEK: "teknikk",
  SLAG: "slag",
  SPILL: "spillet",
  TURN: "turnering",
};

export async function hentForelderUkerapport(
  parentUserId: string
): Promise<ForelderUkerapport | null> {
  const barn = await hentBarnForForelder(parentUserId);
  if (barn.length === 0) return null;

  const childId = barn[0].child.id;
  const childName = barn[0].child.name;
  const childFirstName = childName.split(" ")[0] ?? childName;

  const now = new Date();
  const ukeStart = startOfWeek(now);
  const ukeSlutt = endOfWeek(now);
  const for14 = new Date(now);
  for14.setDate(for14.getDate() - 13);
  const for8uker = new Date(now);
  for8uker.setDate(for8uker.getDate() - 7 * 8);

  const [child, ukeOkter, streakLogger, runder, coachVarsel, besteTest] =
    await Promise.all([
    prisma.user.findUnique({
      where: { id: childId },
      select: { dateOfBirth: true, guardianConsentGivenAt: true },
    }),
    // Øktene denne uka (status + varighet + drill-områder for fokus + oppmøte).
    prisma.trainingSessionV2.findMany({
      where: { studentId: childId, startTime: { gte: ukeStart, lte: ukeSlutt } },
      select: {
        status: true,
        startTime: true,
        endTime: true,
        drills: { select: { pyramide: true } },
      },
    }),
    // Fullførte økter siste 14 dager (for streak).
    prisma.trainingSessionV2.findMany({
      where: { studentId: childId, status: "COMPLETED", startTime: { gte: for14 } },
      select: { startTime: true },
    }),
    // Runder siste 8 uker (for SG-trend + delta).
    prisma.round.findMany({
      where: { userId: childId, playedAt: { gte: for8uker } },
      select: { playedAt: true, sgTotal: true },
      orderBy: { playedAt: "asc" },
    }),
    // Siste coach-melding (varsel type «melding»).
    prisma.notification.findFirst({
      where: { userId: childId, type: "melding" },
      orderBy: { createdAt: "desc" },
      select: { title: true, body: true },
    }),
    // Beste testresultat (høydepunkt).
    prisma.testResult.findFirst({
      where: { userId: childId },
      orderBy: { score: "desc" },
      select: { score: true, test: { select: { name: true } } },
    }),
  ]);

  // Alder fra fødselsdato (kun hvis kjent — aldri gjettet).
  let childAge: number | null = null;
  if (child?.dateOfBirth) {
    const diff = now.getTime() - child.dateOfBirth.getTime();
    childAge = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  }

  // Økter denne uka.
  const oktPlanlagt = ukeOkter.length;
  const fullforte = ukeOkter.filter((o) => o.status === "COMPLETED");
  const oktFullfort = fullforte.length;
  const oppmotePct =
    oktPlanlagt > 0 ? Math.round((oktFullfort / oktPlanlagt) * 100) : null;

  // Timer trent denne uka (sum av fullførte øktvarigheter).
  const trentMs = fullforte.reduce(
    (s, o) => s + (o.endTime.getTime() - o.startTime.getTime()),
    0
  );
  const trentTimer = Math.round((trentMs / 3_600_000) * 10) / 10;

  // Fokus-område: hyppigste pyramide blant denne ukas drills.
  const omradeTelling = new Map<PyramidArea, number>();
  for (const o of ukeOkter) {
    for (const d of o.drills) {
      omradeTelling.set(d.pyramide, (omradeTelling.get(d.pyramide) ?? 0) + 1);
    }
  }
  let fokusOmrade: string | null = null;
  if (omradeTelling.size > 0) {
    const topp = [...omradeTelling.entries()].sort((a, b) => b[1] - a[1])[0][0];
    fokusOmrade = AKSE_NAVN[topp];
  }

  // Streak (sammenhengende aktive dager fra i dag).
  const streak = aktivStreak(computeStreak(streakLogger.map((l) => l.startTime), 14));

  // 8-ukers SG-trend: ukentlig snitt sgTotal → normaliserte søylehøyder.
  const ukeSnitt: (number | null)[] = Array.from({ length: 8 }, () => null);
  const ukeSum: number[] = new Array(8).fill(0);
  const ukeAnt: number[] = new Array(8).fill(0);
  for (const r of runder) {
    const ukerSiden = Math.floor(
      (now.getTime() - r.playedAt.getTime()) / (7 * 24 * 3600 * 1000)
    );
    const idx = 7 - ukerSiden; // eldst (0) → nyest (7)
    if (idx >= 0 && idx < 8 && r.sgTotal != null) {
      ukeSum[idx] += r.sgTotal;
      ukeAnt[idx] += 1;
    }
  }
  for (let i = 0; i < 8; i++) {
    if (ukeAnt[i] > 0) ukeSnitt[i] = ukeSum[i] / ukeAnt[i];
  }
  const verdier = ukeSnitt.filter((v): v is number => v != null);
  const minV = verdier.length ? Math.min(...verdier) : 0;
  const maxV = verdier.length ? Math.max(...verdier) : 1;
  const spenn = maxV - minV || 1;
  const trend8uker = ukeSnitt.map((v) =>
    v == null ? 0 : Math.round(((v - minV) / spenn) * 80 + 20)
  );

  // SG-trend-delta: snitt siste 4 uker − snitt forrige 4 uker.
  const snittBolk = (fra: number, til: number): number | null => {
    const vs = ukeSnitt.slice(fra, til).filter((v): v is number => v != null);
    return vs.length ? vs.reduce((s, v) => s + v, 0) / vs.length : null;
  };
  const nyereSnitt = snittBolk(4, 8);
  const eldreSnitt = snittBolk(0, 4);
  let sgTrendDelta: number | null = null;
  let sgRetning: "opp" | "ned" | "stabil" | null = null;
  if (nyereSnitt != null && eldreSnitt != null) {
    sgTrendDelta = Math.round((nyereSnitt - eldreSnitt) * 10) / 10;
    sgRetning = sgTrendDelta > 0.05 ? "opp" : sgTrendDelta < -0.05 ? "ned" : "stabil";
  } else if (nyereSnitt != null) {
    sgRetning = "stabil";
  }

  // SG denne uka (snitt sgTotal for runder spilt etter ukestart).
  const ukeRunder = runder.filter(
    (r) => r.playedAt >= ukeStart && r.sgTotal != null
  );
  const ukeSg =
    ukeRunder.length > 0
      ? Math.round(
          (ukeRunder.reduce((s, r) => s + (r.sgTotal ?? 0), 0) /
            ukeRunder.length) *
            10
        ) / 10
      : null;

  return {
    childFirstName,
    childName,
    childAge,
    consentActive: child?.guardianConsentGivenAt != null,
    ukenummer: ukenummer(now),
    oktFullfort,
    oktPlanlagt,
    fokusOmrade,
    sgRetning,
    oppmotePct,
    sgTrendDelta,
    streak,
    trend8uker,
    coachNote: coachVarsel
      ? { author: coachVarsel.title, body: coachVarsel.body ?? "" }
      : null,
    trentTimer,
    ukeSg,
    hoydepunkt: besteTest
      ? { testNavn: besteTest.test.name, score: besteTest.score }
      : null,
  };
}
