/**
 * Data-loader for AG-06 Booking (Precision Athletics). Leser samme Booking- og
 * ServiceType-tabeller som resten av appen bruker — ingen nye felt, ingen
 * skjemaendring. Coach ser eget scope (`coachBookingScope`), admin ser alt.
 * Pris er bookingens `priceOre` (satt fra `ServiceType.priceOre` da den ble
 * laget) — aldri hardkodet, og «timepris»-fallbacket i tegningen er demodata.
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
  /** Betalingsspor på bookingen. «Ikke betalt» = pris over 0 uten Stripe eller klipp. */
  pay: "Betalt" | "Klipp" | "Gratis" | "Ikke betalt";
  src: string | null;
  note: string | null;
  at: string;
  st: "Venter" | "Bekreftet" | "Avvist";
};

const DATO_FMT = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
const KL_FMT = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

function betaling(b: { priceOre: number; stripePaymentIntentId: string | null; subscriptionId: string | null }): AG06Booking["pay"] {
  if (b.stripePaymentIntentId) return "Betalt";
  if (b.subscriptionId) return "Klipp";
  if (b.priceOre <= 0) return "Gratis";
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
    date: DATO_FMT.format(r.startAt),
    t: KL_FMT.format(r.startAt),
    pay: betaling(r),
    src: r.googleEventId ? "Google" : r.userId ? "PlayerHQ" : "Gjest",
    note: r.notes,
    at: DATO_FMT.format(r.createdAt),
    st: status(r.status),
  }));
}
