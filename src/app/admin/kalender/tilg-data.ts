/**
 * Data for AG-05s Tilgjengelighet-fane (Precision Athletics, 29.09.2026).
 * Leser samme `CoachAvailability`-tabell som /admin/availability, uten nye felt:
 * flere vinduer per dag, datounntak (vindu på én dato), repetisjon
 * (`recurrenceInterval`), gyldighet (`validFrom`/`validTo`) og sted.
 *
 * Endringer går gjennom de uendrede handlingene addSlot/updateSlot/deleteSlot
 * (guard, eierskap og «ikke to steder samtidig»-vernet ligger der).
 */

import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export type TilgVindu = {
  id: string;
  /** 0=man..6=søn for ukentlige vinduer; null for datounntak. */
  ukedag: number | null;
  /** «YYYY-MM-DD» for datounntak; null for ukentlige vinduer. */
  dato: string | null;
  start: string;
  slutt: string;
  aktiv: boolean;
  stedId: string | null;
  stedNavn: string | null;
  gyldigFra: string | null;
  gyldigTil: string | null;
  /** 1/null = hver uke, 2 = annenhver, 3 = hver tredje … */
  repetisjon: number | null;
  /** Vinduet gjelder i dag (innenfor gyldighet). */
  gjelderNaa: boolean;
};

export type TilgData = {
  vinduer: TilgVindu[];
  steder: Array<{ id: string; navn: string }>;
  idag: string;
};

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export async function hentTilgjengelighet(user: User): Promise<TilgData> {
  const idag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
  const [slots, steder] = await Promise.all([
    prisma.coachAvailability.findMany({
      where: { coachId: user.id },
      orderBy: [{ weekday: "asc" }, { date: "asc" }, { startTime: "asc" }],
      select: {
        id: true, weekday: true, date: true, startTime: true, endTime: true, active: true,
        locationId: true, validFrom: true, validTo: true, recurrenceInterval: true,
        location: { select: { name: true } },
      },
    }),
    prisma.location.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return {
    idag,
    steder: steder.map((s) => ({ id: s.id, navn: s.name })),
    vinduer: slots.map((s) => {
      const fra = iso(s.validFrom);
      const til = iso(s.validTo);
      return {
        id: s.id,
        ukedag: s.weekday,
        dato: iso(s.date),
        start: s.startTime,
        slutt: s.endTime,
        aktiv: s.active,
        stedId: s.locationId,
        stedNavn: s.location?.name ?? null,
        gyldigFra: fra,
        gyldigTil: til,
        repetisjon: s.recurrenceInterval,
        gjelderNaa: (!fra || fra <= idag) && (!til || til >= idag),
      };
    }),
  };
}
