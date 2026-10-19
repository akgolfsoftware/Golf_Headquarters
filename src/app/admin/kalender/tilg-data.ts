/**
 * Data for AG-05s Tilgjengelighet-fane (bookingplanen steg 3): coachens egne
 * vinduer i `CoachAvailability` (ukentlige og enkeltdatoer fra i dag), kommende
 * fridager (heldags `CalendarEvent` med tittel «Fridag», src/lib/booking/fridag.ts)
 * aktive steder og coachens egen buffer mellom timer (`users.bookingBufferMin`).
 */

import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";
import { FRIDAG_TITTEL, erFridag } from "@/lib/booking/fridag";

export type TilgVindu = {
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

export type TilgData = {
  vinduer: TilgVindu[];
  fridager: Array<{ id: string; dato: string; grunn: string | null }>;
  /** Coachens buffer mellom to timer i minutter; tjenestens buffer gjelder i tillegg. */
  bufferMin: number;
  steder: Array<{ id: string; navn: string }>;
};

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export async function hentTilgjengelighet(user: User): Promise<TilgData> {
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
