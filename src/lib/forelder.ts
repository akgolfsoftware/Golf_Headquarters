// Helpers for Foreldreportal — henter koblede barn for en innlogget forelder.

import { prisma } from "@/lib/prisma";
import type { PaymentStatus, PyramidArea } from "@/generated/prisma/client";

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
