/**
 * Spiller-dashboard (100 %) — aggregert loader for domenene som IKKE dekkes
 * av loadSpillerDetaljOversikt/page-spørringene: helse, skade/permisjon,
 * abonnement/betalinger, bookinger, turneringsresultater, WAGR, TrackMan,
 * FYS-tester, mål, sesongplan/perioder, teknisk plan, fysisk plan,
 * coach-notater, video, dokumenter, utstyr, foresatte/samtykke, caddie,
 * varsler. Design-fasit: ui_kits/agencyos/spiller-dashboard.jsx i det
 * levende Claude Design-prosjektet (skrevet 2026-07-12).
 *
 * Kun ekte data — tomme lister/null betyr «vis ærlig tomtilstand», aldri
 * pyntetall. Alle spørringer er select-minimerte og kjøres parallelt.
 */

import { prisma } from "@/lib/prisma";

export interface SpillerDashboardEkstra {
  helse: {
    date: Date;
    restingHr: number | null;
    hrv: number | null;
    sleepHours: number | null;
    weightKg: number | null;
  }[];
  leaves: {
    reason: string;
    startAt: Date;
    endAt: Date | null;
    isInjury: boolean;
    returnedAt: Date | null;
    description: string | null;
  }[];
  abonnement: {
    tier: string;
    status: string;
    currentPeriodEnd: Date | null;
    monthlyCredits: number;
    creditsRemaining: number;
  } | null;
  betalinger: { amountOre: number; status: string; type: string; createdAt: Date }[];
  bookingerKommende: {
    startAt: Date;
    endAt: Date;
    status: string;
    priceOre: number;
    tjeneste: string;
    sted: string;
  }[];
  bookingerSiste: { startAt: Date; status: string; tjeneste: string }[];
  turneringsResultater: {
    navn: string;
    dato: Date | null;
    position: number | null;
    score: number | null;
  }[];
  wagr: { rank: number; moveDelta: number | null; ptsAvg: number } | null;
  trackman: { recordedAt: Date; shotCount: number; environment: string | null }[];
  fysTester: { navn: string; score: number; takenAt: Date }[];
  maal: {
    title: string;
    type: string;
    category: string;
    targetValue: number | null;
    targetDate: Date | null;
  }[];
  sesong: {
    year: number;
    name: string | null;
    perioder: {
      lPhase: string;
      startDate: Date;
      endDate: Date;
      focus: string | null;
      weeklyVolMin: number | null;
      weeklyVolMax: number | null;
    }[];
  } | null;
  teknisk: { navn: string; status: string; startDato: Date; sluttDato: Date | null } | null;
  fysisk: { navn: string; status: string; startDato: Date } | null;
  notater: { title: string | null; content: string; tags: string[]; createdAt: Date }[];
  videoer: { title: string; createdAt: Date; kilde: "coach" | "spiller" }[];
  dokumenter: { title: string; kind: string; createdAt: Date; url: string }[];
  utstyr: {
    driver: string | null;
    irons: string | null;
    wedges: string | null;
    putter: string | null;
    ball: string | null;
  } | null;
  foresatte: { navn: string; relasjon: string; approved: boolean; epost: string | null; telefon: string | null }[];
  samtykke: { paakrevd: boolean; gittAt: Date | null };
  caddie: { antall: number; sisteTittel: string | null; sisteAt: Date | null };
  varsler: { type: string; title: string; body: string | null; createdAt: Date }[];
}

export async function loadSpillerDashboardEkstra(playerId: string): Promise<SpillerDashboardEkstra> {
  const now = new Date();

  const [
    helse,
    leaves,
    abonnement,
    betalinger,
    bookingerKommende,
    bookingerSiste,
    turneringsResultater,
    wagr,
    trackman,
    fysTester,
    maal,
    sesong,
    teknisk,
    fysisk,
    notater,
    coachVideoer,
    spillerVideoer,
    dokumenter,
    utstyr,
    foresatteRel,
    samtykkeUser,
    caddieAntall,
    caddieSiste,
    varsler,
  ] = await Promise.all([
    prisma.healthEntry.findMany({
      where: { userId: playerId },
      orderBy: { date: "desc" },
      take: 7,
      select: { date: true, restingHr: true, hrv: true, sleepHours: true, weightKg: true },
    }),
    prisma.leave.findMany({
      where: { userId: playerId },
      orderBy: { startAt: "desc" },
      take: 5,
      select: { reason: true, startAt: true, endAt: true, isInjury: true, returnedAt: true, description: true },
    }),
    prisma.subscription.findUnique({
      where: { userId: playerId },
      select: { tier: true, status: true, currentPeriodEnd: true, monthlyCredits: true, creditsRemaining: true },
    }),
    prisma.payment.findMany({
      where: { userId: playerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { amountOre: true, status: true, type: true, createdAt: true },
    }),
    prisma.booking.findMany({
      where: { userId: playerId, startAt: { gte: now }, status: { notIn: ["CANCELLED"] } },
      orderBy: { startAt: "asc" },
      take: 3,
      select: {
        startAt: true,
        endAt: true,
        status: true,
        priceOre: true,
        serviceType: { select: { name: true } },
        location: { select: { name: true } },
      },
    }),
    prisma.booking.findMany({
      where: { userId: playerId, startAt: { lt: now } },
      orderBy: { startAt: "desc" },
      take: 3,
      select: { startAt: true, status: true, serviceType: { select: { name: true } } },
    }),
    prisma.tournamentResult.findMany({
      where: { userId: playerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        position: true,
        score: true,
        tournament: { select: { name: true, startDate: true } },
      },
    }),
    prisma.wagrSnapshot.findUnique({
      where: { userId: playerId },
      select: { rank: true, moveDelta: true, ptsAvg: true },
    }),
    prisma.trackManSession.findMany({
      where: { userId: playerId },
      orderBy: { recordedAt: "desc" },
      take: 3,
      select: { recordedAt: true, shotCount: true, environment: true },
    }),
    prisma.testResult.findMany({
      where: { userId: playerId, test: { pyramidArea: "FYS" } },
      orderBy: { takenAt: "desc" },
      take: 4,
      select: { score: true, takenAt: true, test: { select: { name: true } } },
    }),
    prisma.goal.findMany({
      where: { userId: playerId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, type: true, category: true, targetValue: true, targetDate: true },
    }),
    prisma.seasonPlan.findFirst({
      where: { userId: playerId },
      orderBy: { year: "desc" },
      select: {
        year: true,
        name: true,
        periodBlocks: {
          orderBy: { startDate: "asc" },
          select: {
            lPhase: true,
            startDate: true,
            endDate: true,
            focus: true,
            weeklyVolMin: true,
            weeklyVolMax: true,
          },
        },
      },
    }),
    prisma.technicalPlan.findFirst({
      where: { userId: playerId, planVariant: null },
      orderBy: { startDato: "desc" },
      select: { navn: true, status: true, startDato: true, sluttDato: true },
    }),
    prisma.fysiskPlan.findFirst({
      where: { userId: playerId },
      orderBy: { updatedAt: "desc" },
      select: { navn: true, status: true, startDato: true },
    }),
    prisma.coachNote.findMany({
      where: { playerId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, content: true, tags: true, createdAt: true },
    }),
    prisma.sessionVideo.findMany({
      where: { playerId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, createdAt: true },
    }),
    prisma.playerSwingVideo.findMany({
      where: { userId: playerId, status: "READY" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { createdAt: true },
    }),
    prisma.document.findMany({
      where: { userId: playerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, kind: true, createdAt: true, url: true },
    }),
    prisma.equipmentBag.findUnique({
      where: { userId: playerId },
      select: { driver: true, irons: true, wedges: true, putter: true, ball: true },
    }),
    prisma.parentRelation.findMany({
      where: { childId: playerId },
      select: {
        relationship: true,
        approved: true,
        parent: { select: { name: true, email: true, phone: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: playerId },
      select: { requiresGuardianConsent: true, guardianConsentGivenAt: true },
    }),
    prisma.caddieConversation.count({ where: { userId: playerId } }),
    prisma.caddieConversation.findFirst({
      where: { userId: playerId },
      orderBy: { updatedAt: "desc" },
      select: { title: true, updatedAt: true },
    }),
    prisma.notification.findMany({
      where: { userId: playerId },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { type: true, title: true, body: true, createdAt: true },
    }),
  ]);

  return {
    helse: helse.slice().reverse(), // eldst→nyest for sparklines
    leaves,
    abonnement,
    betalinger,
    bookingerKommende: bookingerKommende.map((b) => ({
      startAt: b.startAt,
      endAt: b.endAt,
      status: b.status,
      priceOre: b.priceOre,
      tjeneste: b.serviceType.name,
      sted: b.location.name,
    })),
    bookingerSiste: bookingerSiste.map((b) => ({
      startAt: b.startAt,
      status: b.status,
      tjeneste: b.serviceType.name,
    })),
    turneringsResultater: turneringsResultater.map((r) => ({
      navn: r.tournament.name,
      dato: r.tournament.startDate,
      position: r.position,
      score: r.score,
    })),
    wagr,
    trackman,
    fysTester: fysTester.map((t) => ({ navn: t.test.name, score: t.score, takenAt: t.takenAt })),
    maal,
    sesong: sesong ? { year: sesong.year, name: sesong.name, perioder: sesong.periodBlocks } : null,
    teknisk,
    fysisk,
    notater,
    videoer: [
      ...coachVideoer.map((v) => ({ title: v.title, createdAt: v.createdAt, kilde: "coach" as const })),
      ...spillerVideoer.map((v) => ({ title: "Swing-video (spiller)", createdAt: v.createdAt, kilde: "spiller" as const })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4),
    dokumenter,
    utstyr,
    foresatte: foresatteRel.map((f) => ({
      navn: f.parent.name,
      relasjon: f.relationship,
      approved: f.approved,
      epost: f.parent.email,
      telefon: f.parent.phone,
    })),
    samtykke: {
      paakrevd: samtykkeUser?.requiresGuardianConsent ?? false,
      gittAt: samtykkeUser?.guardianConsentGivenAt ?? null,
    },
    caddie: {
      antall: caddieAntall,
      sisteTittel: caddieSiste?.title ?? null,
      sisteAt: caddieSiste?.updatedAt ?? null,
    },
    varsler,
  };
}
