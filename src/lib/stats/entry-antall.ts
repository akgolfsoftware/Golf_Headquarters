/**
 * Antall turneringsdeltakelser per spiller — for en KJENT liste med spiller-ider.
 *
 * Bakgrunn (30.08.2026, Disk IO-varsel fra Supabase): Prismas
 * `_count: { select: { entries: true } }` oversettes til en UFILTRERT
 * `GROUP BY "playerId"` over hele `public_player_entries` (398k rader, 150 MB)
 * som LEFT JOIN-es mot resultatet — uansett hvor få rader spørringen returnerer.
 * Målt i `pg_stat_statements`: ~14 700 blokker (120 MB) per kall, og 3,7
 * MILLIARDER bufferlesninger totalt. Det var den klart største forbrukeren av
 * prosjektets Disk IO-budsjett.
 *
 * Denne helperen henter i stedet tellingen KUN for de idene som faktisk vises,
 * via unik-indeksen `(playerId, tournamentId)`.
 *
 * Regel: bruk ALDRI `_count` på `entries` i en listespørring — bruk denne.
 */
import type { PrismaClient } from "../../generated/prisma/client";

export async function hentEntryAntall(
  prisma: Pick<PrismaClient, "publicPlayerEntry">,
  playerIds: readonly string[],
): Promise<Map<string, number>> {
  const ider = [...new Set(playerIds)];
  if (ider.length === 0) return new Map();

  const rader = await prisma.publicPlayerEntry.groupBy({
    by: ["playerId"],
    where: { playerId: { in: ider } },
    _count: { _all: true },
  });

  return new Map(rader.map((r) => [r.playerId, r._count._all]));
}
