/**
 * Data-loader for AG-06 Booking (Precision Athletics). Leser samme Booking- og
 * ServiceType-tabeller som resten av appen bruker. Betalingsmåte og coachens
 * forslag om ny tid kom 15.10.2026 (beslutninger.md §COACH SOM AVLYSER). Coach ser eget scope (`coachBookingScope`), admin ser alt.
 * Pris er bookingens `priceOre` (satt fra `ServiceType.priceOre` da den ble
 * laget) — aldri hardkodet, og «timepris»-fallbacket i tegningen er demodata.
 */

import { prisma } from "@/lib/prisma";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import type { User } from "@/generated/prisma/client";
import { FRIDAG_TITTEL, erFridag } from "@/lib/booking/fridag";

export type AG06Booking = {
  id: string;
  who: string;
  guardian: string | null;
  svcId: string;
  svcNavn: string;
  min: number;
  priceOre: number;
  where: string;
  date: string;
  t: string;
  /** Betalingsspor på bookingen. «Ikke betalt» = pris over 0 uten Stripe, klipp eller faktura. */
  pay: "Betalt" | "Klipp" | "Faktura" | "Gratis" | "Ikke betalt";
  src: string | null;
  note: string | null;
  at: string;
  st: "Venter" | "Bekreftet" | "Avlyst" | "Gjennomført";
  /** Dagnummer og kort ukedag for datoboksen i lista («5», «man»). */
  dag: string;
  ukedag: string;
  /** Sluttid «11:30». */
  slutt: string;
  coach: string | null;
  /** Start i ms, for Kommende/Tidligere i lista. */
  startMs: number;
  /** Bekreftet og ikke startet: kan avlyses eller få forslag om ny tid. */
  kommende: boolean;
  /** Spillerkonto finnes; gjester kan ikke godta et forslag i PlayerHQ. */
  harKonto: boolean;
  /** Coachens forslag om ny tid som spilleren ikke har svart på. */
  forslag: string | null;
};

const DATO_FMT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
const KL_FMT = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

function betaling(b: { priceOre: number; stripePaymentIntentId: string | null; subscriptionId: string | null; paymentMethod: string | null }): AG06Booking["pay"] {
  if (b.stripePaymentIntentId) return "Betalt";
  if (b.subscriptionId) return "Klipp";
  if (b.paymentMethod === "FAKTURA") return "Faktura";
  if (b.priceOre <= 0) return "Gratis";
  return "Ikke betalt";
}

const DAG_FMT = new Intl.DateTimeFormat("nb-NO", { day: "numeric", timeZone: "Europe/Oslo" });
const UKEDAG_FMT = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "Europe/Oslo" });

function status(s: string): AG06Booking["st"] {
  if (s === "PENDING") return "Venter";
  if (s === "CANCELLED") return "Avlyst";
  if (s === "COMPLETED") return "Gjennomført";
  return "Bekreftet";
}

/** Klokka for Kommende/Tidligere, lest én gang på serveren per visning. */
export function naaMs(): number {
  return Date.now();
}

export async function hentAG06Bookinger(user: User): Promise<AG06Booking[]> {
  const rader = await prisma.booking.findMany({
    where: {
      ...coachBookingScope(user),
    },
    include: {
      user: { select: { name: true } },
      coach: { select: { name: true } },
      serviceType: { select: { id: true, name: true, durationMin: true, priceOre: true } },
      facility: { select: { name: true } },
      location: { select: { name: true } },
    },
    orderBy: { startAt: "desc" },
    take: 300,
  });

  const naa = Date.now();
  return rader.map((r) => ({
    id: r.id,
    who: r.user?.name ?? r.guestName ?? "Gjest",
    guardian: r.user ? null : (r.guestEmail ?? r.guestPhone ?? null),
    svcId: r.serviceType.id,
    svcNavn: r.serviceType.name,
    min: r.serviceType.durationMin,
    priceOre: r.priceOre,
    where: r.facility?.name ?? r.location?.name ?? "—",
    date: DATO_FMT.format(r.startAt),
    t: KL_FMT.format(r.startAt),
    pay: betaling(r),
    src: r.googleEventId ? "Google" : r.userId ? "PlayerHQ" : "Gjest",
    note: r.notes,
    at: DATO_FMT.format(r.createdAt),
    st: status(r.status),
    kommende: r.status === "CONFIRMED" && r.startAt.getTime() > naa,
    harKonto: r.userId != null,
    forslag: r.proposedStartAt ? `${DATO_FMT.format(r.proposedStartAt)} ${KL_FMT.format(r.proposedStartAt)}` : null,
    dag: DAG_FMT.format(r.startAt).replace(".", ""),
    ukedag: UKEDAG_FMT.format(r.startAt).replace(".", ""),
    slutt: KL_FMT.format(r.endAt),
    coach: r.coach?.name ?? null,
    startMs: r.startAt.getTime(),
  }));
}

/** Én tjeneste slik fanen «Tjenester og pris» i AG-06 viser og redigerer den. */
export type AG06Tjeneste = {
  id: string;
  slug: string;
  navn: string;
  beskrivelse: string | null;
  prisOre: number;
  varighetMin: number;
  maxDeltakere: number;
  coachUserId: string | null;
  coachNavn: string | null;
  locationId: string | null;
  stedNavn: string | null;
  kategori: string | null;
  bufferForMin: number;
  bufferEtterMin: number;
  minVarselTimer: number;
  maksDagerFram: number;
  aktiv: boolean;
  /** Antall bookinger som peker på tjenesten. 0 = kan slettes, ellers bare slås av. */
  antallBookinger: number;
};

export type AG06TjenesteValg = {
  coacher: Array<{ id: string; navn: string }>;
  steder: Array<{ id: string; navn: string }>;
};

/**
 * Alle tjenester, også avslåtte, med coach, sted og bookingreglene. Tjenester
 * er en delt admin-ressurs: coach og admin ser det samme (som /admin/services gjorde).
 */
export async function hentAG06Tjenester(): Promise<{ tjenester: AG06Tjeneste[]; valg: AG06TjenesteValg }> {
  const [rader, coacher, steder] = await Promise.all([
    prisma.serviceType.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      include: {
        coach: { select: { name: true } },
        location: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return {
    tjenester: rader.map((r) => ({
      id: r.id,
      slug: r.slug,
      navn: r.name,
      beskrivelse: r.description,
      prisOre: r.priceOre,
      varighetMin: r.durationMin,
      maxDeltakere: r.maxDeltakere,
      coachUserId: r.coachUserId,
      coachNavn: r.coach?.name ?? null,
      locationId: r.locationId,
      stedNavn: r.location?.name ?? null,
      kategori: r.kategori,
      bufferForMin: r.bufferForMin,
      bufferEtterMin: r.bufferEtterMin,
      minVarselTimer: r.minVarselTimer,
      maksDagerFram: r.maksDagerFram,
      aktiv: r.active,
      antallBookinger: r._count.bookings,
    })),
    valg: {
      coacher: coacher.map((c) => ({ id: c.id, navn: c.name ?? c.email ?? "Uten navn" })),
      steder: steder.map((s) => ({ id: s.id, navn: s.name })),
    },
  };
}

/** Ett tilgjengelighetsvindu slik fanen Tilgjengelighet viser og redigerer det. */
export type AG06Vindu = {
  id: string;
  /** 0 = mandag … 6 = søndag; null for én dato. */
  weekday: number | null;
  date: string | null;
  startTime: string;
  endTime: string;
  locationId: string | null;
  stedNavn: string | null;
  validFrom: string | null;
  validTo: string | null;
  recurrenceInterval: number | null;
  active: boolean;
};

export type AG06Tilgjengelighet = {
  vinduer: AG06Vindu[];
  fridager: Array<{ id: string; dato: string; grunn: string | null }>;
  bufferMin: number;
  steder: Array<{ id: string; navn: string }>;
};

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

/** Coachens egne vinduer, kommende fridager og buffer (bookingplanen steg 3). */
export async function hentAG06Tilgjengelighet(user: User): Promise<AG06Tilgjengelighet> {
  const idag = new Date(`${new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date())}T00:00:00.000Z`);
  const [vinduer, fridager, meg, steder] = await Promise.all([
    prisma.coachAvailability.findMany({
      where: { coachId: user.id, OR: [{ date: null }, { date: { gte: idag } }] },
      orderBy: [{ weekday: "asc" }, { date: "asc" }, { startTime: "asc" }],
      include: { location: { select: { name: true } } },
    }),
    prisma.calendarEvent.findMany({
      where: { coachId: user.id, title: { startsWith: FRIDAG_TITTEL }, endAt: { gt: idag } },
      orderBy: { startAt: "asc" },
      select: { id: true, title: true, startAt: true },
      take: 100,
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { bookingBufferMin: true } }),
    prisma.location.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return {
    vinduer: vinduer.map((v) => ({
      id: v.id,
      weekday: v.weekday,
      date: iso(v.date),
      startTime: v.startTime,
      endTime: v.endTime,
      locationId: v.locationId,
      stedNavn: v.location?.name ?? null,
      validFrom: iso(v.validFrom),
      validTo: iso(v.validTo),
      recurrenceInterval: v.recurrenceInterval,
      active: v.active,
    })),
    fridager: fridager.filter((f) => erFridag(f.title)).map((f) => ({
      id: f.id,
      dato: f.startAt.toISOString().slice(0, 10),
      grunn: f.title.startsWith(`${FRIDAG_TITTEL} · `) ? f.title.slice(FRIDAG_TITTEL.length + 3) : null,
    })),
    bufferMin: meg?.bookingBufferMin ?? 0,
    steder: steder.map((s) => ({ id: s.id, navn: s.name })),
  };
}
