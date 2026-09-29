/**
 * Data for AG-05s Tilgjengelighet-fane — begrenset til tegningens omfang:
 * «Fast ukemønster», ett tidsvindu per ukedag, ingen sted-valg og ingen
 * dato-unntak. Alt annet (flere steder, årsplan, dato-unntak, Google-synk)
 * lever videre uendret på /admin/availability, som fortsatt er full fasit.
 *
 * Leser samme `CoachAvailability`-tabell — ingen nye felt.
 */

import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

export type UkedagRad = {
  ukedag: number; // 0=man..6=søn
  navn: string;
  slotId: string | null;
  paa: boolean;
  range: string; // "15:00–19:00" — siste kjente vindu, selv når av
};

const NAVN = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export async function hentUkemonster(user: User): Promise<UkedagRad[]> {
  const slots = await prisma.coachAvailability.findMany({
    where: { coachId: user.id, weekday: { not: null }, locationId: null, date: null },
    orderBy: { weekday: "asc" },
    select: { id: true, weekday: true, startTime: true, endTime: true, active: true },
  });
  const perDag = new Map<number, (typeof slots)[number]>();
  for (const s of slots) {
    if (s.weekday === null) continue;
    // Første treff vinner — tegningens omfang er ett vindu per dag.
    if (!perDag.has(s.weekday)) perDag.set(s.weekday, s);
  }
  return NAVN.map((navn, i) => {
    const s = perDag.get(i);
    return {
      ukedag: i,
      navn,
      slotId: s?.id ?? null,
      paa: s?.active ?? false,
      range: s ? `${s.startTime}–${s.endTime}` : "—",
    };
  });
}
