import "server-only";

import { prisma } from "@/lib/prisma";
import {
  byggTurneringshistorikk,
  type Turneringshistorikk,
  type TurneringsRad,
} from "@/lib/domain/turneringshistorikk";

/**
 * Henter spillerens egen turneringshistorikk fra den offentlige
 * turneringsbasen, via koblingen `User.publicPlayerId`.
 *
 * Dette er offentlige resultater spilleren selv har spilt — ingen ny
 * personopplysning oppstår ved å vise dem tilbake til eieren.
 *
 * Formingen ligger i `byggTurneringshistorikk` (ren, testet). Denne funksjonen
 * gjør kun oppslaget, og skiller de to tomme tilstandene: ikke koblet, eller
 * koblet uten turneringer.
 */
export async function hentTurneringshistorikk(
  userId: string,
): Promise<Turneringshistorikk> {
  const bruker = await prisma.user.findUnique({
    where: { id: userId },
    select: { publicPlayerId: true },
  });

  if (!bruker?.publicPlayerId) return byggTurneringshistorikk([], false);

  const entries = await prisma.publicPlayerEntry.findMany({
    where: {
      playerId: bruker.publicPlayerId,
      // Sammenslåtte dubletter skal ikke dukke opp to ganger.
      tournament: { mergedIntoId: null },
    },
    orderBy: { tournament: { startDate: "desc" } },
    select: {
      status: true,
      position: true,
      scoreToPar: true,
      tournament: {
        select: {
          id: true,
          name: true,
          sourceOrigin: true,
          tour: true,
          startDate: true,
        },
      },
    },
  });

  const rader: TurneringsRad[] = entries.map((e) => ({
    turneringId: e.tournament.id,
    navn: e.tournament.name,
    kilde: e.tournament.sourceOrigin,
    tour: e.tournament.tour,
    startDato: e.tournament.startDate,
    plassering: e.position,
    motPar: e.scoreToPar,
    status: e.status,
  }));

  return byggTurneringshistorikk(rader, true);
}
