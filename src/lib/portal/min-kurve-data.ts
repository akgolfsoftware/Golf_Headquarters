import "server-only";

import { prisma } from "@/lib/prisma";
import {
  byggMinKurve,
  RUNDESCORE_MAKS,
  RUNDESCORE_MIN,
  TOPAR_MAKS,
  TOPAR_MIN,
  type KurveRad,
  type MinKurve,
} from "@/lib/domain/min-kurve";

export type MinKurveData = MinKurve & {
  /** Sist en av spillerens turneringsrader ble skrevet/synket. Null uten rader. */
  dataSistHentet: Date | null;
};

/**
 * Henter grunnlaget for «Min kurve» (PH-21) via `User.publicPlayerId`.
 *
 * Leser spillerens egne rader direkte fra `public_player_entries` +
 * `public_player_rounds` — ikke fra `dashboard.mv_topar_grunnlag`. Viewet er et
 * nattlig snapshot (refresh 05:00, PR #749) laget for kohort-aggregater over
 * 942 000 runder; for én spiller er den direkte spørringen billig (indeks på
 * playerId/entryId) og viser en fersk synk samme dag, ikke neste morgen.
 * Filtrene er de samme som viewets (konstantene i domenet), så tallet
 * spilleren ser er det coachens Innsikt regner på.
 *
 * Offentlige resultater spilleren selv har spilt — ingen ny personopplysning
 * oppstår ved å vise dem tilbake til eieren.
 */
export async function hentMinKurve(userId: string, onsketSesong?: string): Promise<MinKurveData> {
  const bruker = await prisma.user.findUnique({
    where: { id: userId },
    select: { publicPlayerId: true },
  });

  if (!bruker?.publicPlayerId) {
    return { ...byggMinKurve([], false), dataSistHentet: null };
  }

  const entries = await prisma.publicPlayerEntry.findMany({
    where: {
      playerId: bruker.publicPlayerId,
      scoreToPar: { not: null, gte: TOPAR_MIN, lte: TOPAR_MAKS },
      // Sammenslåtte dubletter skal ikke dukke opp to ganger.
      tournament: { mergedIntoId: null },
    },
    orderBy: { tournament: { startDate: "asc" } },
    select: {
      scoreToPar: true,
      position: true,
      status: true,
      updatedAt: true,
      tournament: { select: { id: true, name: true, startDate: true, sourceOrigin: true } },
      roundDetails: {
        where: { score: { gte: RUNDESCORE_MIN, lte: RUNDESCORE_MAKS } },
        orderBy: { roundNumber: "asc" },
        select: { score: true },
      },
    },
  });

  const rader: KurveRad[] = entries.map((e) => ({
    turneringId: e.tournament.id,
    navn: e.tournament.name,
    startDato: e.tournament.startDate,
    // Filteret over garanterer at scoreToPar ikke er null.
    toparTotal: e.scoreToPar ?? 0,
    rundescorer: e.roundDetails.map((r) => r.score).filter((s): s is number => s != null),
    plassering: e.position,
    status: e.status,
    kilde: e.tournament.sourceOrigin,
  }));

  const dataSistHentet = entries.reduce<Date | null>(
    (sist, e) => (sist === null || e.updatedAt > sist ? e.updatedAt : sist),
    null,
  );

  return { ...byggMinKurve(rader, true, onsketSesong), dataSistHentet };
}
