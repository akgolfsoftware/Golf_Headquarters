/**
 * Data-loader for AG-06 Booking (Precision Athletics). Leser samme Booking- og
 * ServiceType-tabeller som resten av appen. Coach ser eget scope
 * (`coachBookingScope`), admin ser alt. Pris er bookingens `priceOre` (satt fra
 * `ServiceType.priceOre` da den ble laget) — aldri hardkodet.
 *
 * Tider: lagret tid er naiv Oslo-veggklokke (src/lib/booking/policy.ts), så den
 * formateres uten tidssone-konvertering — samme som /admin/bookinger/[id].
 */

import { prisma } from "@/lib/prisma";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import type { User } from "@/generated/prisma/client";

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
  /** «YYYY-MM-DD» — forvalg når coach foreslår ny tid. */
  dato: string;
  /** Betalingsspor på bookingen. «Ikke betalt» = pris over 0 uten Stripe, klipp eller faktura-merke. */
  pay: "Betalt" | "Klipp" | "Faktura" | "Gratis" | "Ikke betalt";
  src: string | null;
  note: string | null;
  at: string;
  st: "Venter" | "Bekreftet" | "Avvist";
  /** Bookingen har en spillerkonto (kan få flytteforslag i PlayerHQ). */
  harSpiller: boolean;
  /** Foreslått ny tid som venter på spilleren («DD.MM HH:MM»). */
  forslag: string | null;
};

const p2 = (n: number) => String(n).padStart(2, "0");
const dato = (d: Date) => `${p2(d.getDate())}.${p2(d.getMonth() + 1)}`;
const kl = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
const iso = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

export function betaling(b: {
  priceOre: number;
  stripePaymentIntentId: string | null;
  subscriptionId: string | null;
  paymentMethod?: string | null;
}): AG06Booking["pay"] {
  if (b.stripePaymentIntentId) return "Betalt";
  if (b.subscriptionId || b.paymentMethod === "KLIPP") return "Klipp";
  if (b.paymentMethod === "FAKTURA") return "Faktura";
  if (b.paymentMethod === "GRATIS" || b.priceOre <= 0) return "Gratis";
  return "Ikke betalt";
}

function status(s: string): AG06Booking["st"] {
  if (s === "PENDING") return "Venter";
  if (s === "CANCELLED") return "Avvist";
  return "Bekreftet";
}

export async function hentAG06Bookinger(user: User): Promise<AG06Booking[]> {
  const rader = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
      ...coachBookingScope(user),
    },
    include: {
      user: { select: { name: true } },
      serviceType: { select: { id: true, name: true, durationMin: true, priceOre: true } },
      facility: { select: { name: true } },
      location: { select: { name: true } },
    },
    orderBy: { startAt: "desc" },
    take: 300,
  });

  return rader.map((r) => ({
    id: r.id,
    who: r.user?.name ?? r.guestName ?? "Gjest",
    guardian: r.user ? null : (r.guestEmail ?? r.guestPhone ?? null),
    svcId: r.serviceType.id,
    svcNavn: r.serviceType.name,
    min: r.serviceType.durationMin,
    priceOre: r.priceOre,
    where: r.facility?.name ?? r.location?.name ?? "—",
    date: dato(r.startAt),
    t: kl(r.startAt),
    dato: iso(r.startAt),
    pay: betaling(r),
    src: r.googleEventId ? "Google" : r.userId ? "PlayerHQ" : "Gjest",
    note: r.notes,
    at: dato(r.createdAt),
    st: status(r.status),
    harSpiller: r.userId != null,
    forslag: r.proposedStartAt ? `${dato(r.proposedStartAt)} ${kl(r.proposedStartAt)}` : null,
  }));
}

export type AG06Tjeneste = {
  id: string;
  navn: string;
  beskrivelse: string | null;
  varighetMin: number;
  prisOre: number;
  maksDeltakere: number;
  aktiv: boolean;
};

/** Alle tjenester (også skjulte), samme utvalg som /admin/services. */
export async function hentAG06Tjenester(): Promise<AG06Tjeneste[]> {
  const rader = await prisma.serviceType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: { id: true, name: true, description: true, durationMin: true, priceOre: true, maxDeltakere: true, active: true },
  });
  return rader.map((r) => ({
    id: r.id,
    navn: r.name,
    beskrivelse: r.description,
    varighetMin: r.durationMin,
    prisOre: r.priceOre,
    maksDeltakere: r.maxDeltakere,
    aktiv: r.active,
  }));
}
