/**
 * Data for AG-05s Tilgjengelighet-fane — det faste ukemønsteret. Leser samme
 * `CoachAvailability`-tabell som /admin/availability, uten nye felt.
 *
 * Fanen viser bare ukentlige vinduer som gjelder i dag (validFrom/validTo).
 * Har en dag nøyaktig ett slikt vindu, kan det slås av og på her. Har dagen
 * flere (flere steder eller perioder), står antallet, og endringen gjøres på
 * /admin/availability, som fortsatt er full fasit for steder, dato-unntak,
 * årsplan og Google-synk. Ingen tid lages på antakelse.
 */

import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export type UkedagRad = {
  ukedag: number; // 0=man..6=søn (samme som SlotInput.weekday)
  navn: string;
  /** Satt bare når dagen har nøyaktig ett ukentlig vindu. */
  slotId: string | null;
  antall: number;
  paa: boolean;
  /** «15:00–19:00 · Studio 1», eller null når dagen ikke har ett enkelt vindu. */
  tekst: string | null;
};

const NAVN = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export async function hentUkemonster(user: User): Promise<UkedagRad[]> {
  const idag = new Date(`${new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date())}T00:00:00.000Z`);
  const slots = await prisma.coachAvailability.findMany({
    where: {
      coachId: user.id,
      weekday: { not: null },
      date: null,
      AND: [
        { OR: [{ validFrom: null }, { validFrom: { lte: idag } }] },
        { OR: [{ validTo: null }, { validTo: { gte: idag } }] },
      ],
    },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    select: { id: true, weekday: true, startTime: true, endTime: true, active: true, location: { select: { name: true } } },
  });
  return NAVN.map((navn, i) => {
    const dag = slots.filter((s) => s.weekday === i);
    const en = dag.length === 1 ? dag[0] : null;
    return {
      ukedag: i,
      navn,
      slotId: en?.id ?? null,
      antall: dag.length,
      paa: dag.some((s) => s.active),
      tekst: en ? `${en.startTime}–${en.endTime}${en.location ? ` · ${en.location.name}` : ""}` : null,
    };
  });
}
