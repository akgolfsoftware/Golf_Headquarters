/**
 * Gapping-data — carry per kølle fra TrackMan-øktene siste 90 dager (D5).
 *
 * Køllelista utledes fra TrackMan-dataene selv, ikke fra `EquipmentBag`.
 * Utstyrsbagen lagrer køllene som seks fritekstfelter («irons», «wedges») og
 * lar seg ikke matche maskinelt mot `TrackManShot.club` («5-jern»). Å prøve
 * ville gitt stille feiltreff; å lese det målte er både enklere og ærligere.
 * Se docs/taksonomi-verifikasjon.md §c.
 *
 * Regnestykket bor i src/lib/domain/gapping.ts — denne filen henter bare data.
 */

import { prisma } from "@/lib/prisma";
import { beregnGapping, type Gapping } from "@/lib/domain/gapping";

/** Vinduet fasiten oppgir i undertittelen: «siste 90 dager». */
export const VINDU_DAGER = 90;

export type GappingData = Gapping & {
  vinduDager: number;
  /** Antall TrackMan-økter tallene er hentet fra. */
  okter: number;
};

export async function hentGapping(
  userId: string,
  now = new Date(),
): Promise<GappingData> {
  const fra = new Date(now.getTime() - VINDU_DAGER * 86_400_000);

  const okter = await prisma.trackManSession.findMany({
    where: { userId, recordedAt: { gte: fra } },
    select: {
      id: true,
      shots: {
        // Slag uten carry kan ikke plasseres på kartet — de filtreres i
        // spørringen så de ikke teller som nevner heller.
        where: { carryDistance: { not: null } },
        select: { club: true, carryDistance: true },
      },
    },
  });

  const slag = okter.flatMap((o) =>
    o.shots.flatMap((s) =>
      s.carryDistance != null
        ? [{ klubb: s.club.trim(), carry: s.carryDistance }]
        : [],
    ),
  );

  return {
    ...beregnGapping(slag),
    vinduDager: VINDU_DAGER,
    okter: okter.length,
  };
}
