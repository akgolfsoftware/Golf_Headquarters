import "server-only";

import { prisma } from "@/lib/prisma";
import { lesTurneringsresultat } from "@/lib/domain/turneringsresultat";
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

  const [entries, manuelle] = await Promise.all([bruker?.publicPlayerId ? prisma.publicPlayerEntry.findMany({
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
      totalScore: true, rounds: true, klasseNavn: true, updatedAt: true,
      roundDetails: { select: { roundNumber: true, score: true, toPar: true, source: true }, orderBy: { roundNumber: "asc" } },
      tournament: {
        select: {
          id: true,
          name: true,
          sourceOrigin: true,
          tour: true,
          startDate: true,
          officialUrl: true,
        },
      },
    },
  }) : Promise.resolve([]), prisma.tournamentEntry.findMany({
    where: { userId, withdrawnAt: null, OR: [{ tournamentId: null }, { tournament: { mergedIntoId: null } }] },
    select: { id: true, manualName: true, manualDate: true, entryStatus: true, category: true,
      tournament: { select: { id: true, name: true, sourceOrigin: true, tour: true, startDate: true, officialUrl: true } } },
    orderBy: { createdAt: "desc" },
  })]);

  const rader: TurneringsRad[] = entries.map((e) => ({
    turneringId: e.tournament.id,
    navn: e.tournament.name,
    kilde: e.tournament.sourceOrigin,
    tour: e.tournament.tour,
    startDato: e.tournament.startDate,
    ...lesTurneringsresultat(e),
    klasse: e.klasseNavn,
    kildeUrl: e.tournament.officialUrl,
    status: e.status,
  }));
  const seen = new Set(rader.map(r => r.turneringId));
  for (const e of manuelle) {
    const t = e.tournament;
    const id = t?.id ?? e.id;
    const dato = t?.startDate ?? e.manualDate;
    if (seen.has(id) || !dato) continue;
    rader.push({ turneringId: id, navn: t?.name ?? e.manualName ?? "Egen turnering", startDato: dato,
      kilde: t?.sourceOrigin ?? "MANUAL", tour: t?.tour ?? null, status: e.entryStatus,
      plassering: null, motPar: null, brutto: null, runder: [], klasse: e.category, kildeUrl: t?.officialUrl ?? null });
    seen.add(id);
  }
  return byggTurneringshistorikk(rader, !!bruker?.publicPlayerId || rader.length > 0);
}
