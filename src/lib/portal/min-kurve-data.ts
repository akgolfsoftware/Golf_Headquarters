import "server-only";

import { prisma } from "@/lib/prisma";
import { lesTurneringsresultat } from "@/lib/domain/turneringsresultat";
import { hentSpillerprofil } from "@/lib/profil-kobling/data";
import { tilTurneringer } from "@/lib/profil-kobling/til-turneringer";
import {
  byggMinKurve,
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
 * Henter grunnlaget for «Min kurve» (PH-21) fra den felles spillerprofilen (dashboard.profile_links,
 * migrasjon 0025). Samme kilde som resten av HQ, ingen kopi. Uten bekreftet kobling vises kurven
 * som «ikke koblet».
 *
 * Filtrene er de samme som før (konstantene i domenet): til-par for turneringen må ligge mellom
 * TOPAR_MIN og TOPAR_MAKS. En turnering er fullstendig når hver runde har score og til-par, som
 * databasen bare gir for runder med kjent par på alle 18 hull.
 *
 * Data Golf-turneringer (public.*, gammel kobling) tas bare med når kalleren har sjekket kanSeDataGolf.
 * De er disjunkte fra profilens turneringer, som aldri inneholder Data Golf.
 *
 * `dataSistHentet` er null: profilfunksjonen har ikke et synketidspunkt per turnering.
 */
export async function hentMinKurve(
  userId: string,
  onsketSesong?: string,
  /** Data Golf-turneringer bare for admin (kanSeDataGolf). Standard nei. */
  { medDataGolf = false }: { medDataGolf?: boolean } = {},
): Promise<MinKurveData> {
  const [profil, dataGolf] = await Promise.all([
    hentSpillerprofil(userId),
    medDataGolf ? hentDataGolfEntries(userId) : Promise.resolve([]),
  ]);

  if (!profil && dataGolf.length === 0) {
    return { ...byggMinKurve([], false), dataSistHentet: null };
  }

  const fraProfil: KurveRad[] = tilTurneringer(profil?.turneringer ?? [])
    .filter((t) => t.resultat.scoreToPar != null && t.resultat.scoreToPar >= TOPAR_MIN && t.resultat.scoreToPar <= TOPAR_MAKS)
    .map((t) => {
      const result = lesTurneringsresultat(t.resultat);
      return {
        turneringId: t.id, navn: t.navn, startDato: t.start,
        toparTotal: result.motPar ?? 0,
        rundescorer: result.runder.map((r) => r.brutto ?? 0),
        rundemotPar: result.runder.map((r) => r.motPar),
        fullstendig: result.motPar != null && result.runder.length > 0 && result.runder.every((r) => r.brutto != null && r.motPar != null),
        plassering: result.plassering, status: t.resultat.status, kilde: t.kilde,
      };
    });

  const fraDataGolf: KurveRad[] = dataGolf.map((e) => {
    const result = lesTurneringsresultat(e);
    const dgComplete = e.status === "FINISHED"
      && e.roundDetails.length > 0 && e.roundDetails.every((r) => r.score != null && r.toPar != null)
      && e.roundDetails.reduce((sum, r) => sum + (r.toPar ?? 0), 0) === e.scoreToPar;
    return {
      turneringId: e.tournament.id, navn: e.tournament.name, startDato: e.tournament.startDate,
      toparTotal: result.motPar ?? 0,
      rundescorer: result.runder.map((r) => r.brutto ?? 0),
      rundemotPar: result.runder.map((r) => r.motPar),
      fullstendig: result.motPar != null && dgComplete,
      plassering: result.plassering, status: e.status, kilde: e.tournament.sourceOrigin,
    };
  });

  const rader = [...fraProfil, ...fraDataGolf].sort((a, b) => a.startDato.getTime() - b.startDato.getTime());
  return { ...byggMinKurve(rader, true, onsketSesong), dataSistHentet: null };
}

/** Bare Data Golf-turneringer fra public.* (gammel kobling). Brukes aldri uten kanSeDataGolf. */
async function hentDataGolfEntries(userId: string) {
  const bruker = await prisma.user.findUnique({ where: { id: userId }, select: { publicPlayerId: true } });
  if (!bruker?.publicPlayerId) return [];
  return prisma.publicPlayerEntry.findMany({
    where: {
      playerId: bruker.publicPlayerId,
      scoreToPar: { not: null, gte: TOPAR_MIN, lte: TOPAR_MAKS },
      tournament: { mergedIntoId: null, sourceOrigin: "DATAGOLF" },
    },
    orderBy: { tournament: { startDate: "asc" } },
    select: {
      scoreToPar: true, position: true, status: true, totalScore: true, rounds: true, klasseNavn: true,
      tournament: { select: { id: true, name: true, startDate: true, sourceOrigin: true } },
      roundDetails: { orderBy: { roundNumber: "asc" }, select: { score: true, toPar: true, roundNumber: true, source: true } },
    },
  });
}
