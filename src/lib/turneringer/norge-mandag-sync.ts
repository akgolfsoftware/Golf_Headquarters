/**
 * Mandagssync for norsk turneringsdata-lag.
 * - DataGolf NOR-spillerliste (eksisterende)
 * - GolfBox schedule (kommende + frister)
 * - Navnelink + backfill
 * - Dedupe formateringsvarianter
 */
import { prisma } from "@/lib/prisma";
import { syncNorwegianPlayers } from "@/lib/turneringer/sync";
import { syncGolfBoxSchedules } from "@/lib/turneringer/golfbox-sync";
import {
  linkPublicPlayersByExactName,
  backfillTournamentResultsForLinkedUsers,
} from "@/lib/turneringer/link-public-players";
import { runDedupePlayerNames } from "@/lib/turneringer/dedupe-player-names";

export async function runNorgeMandagSync(): Promise<{
  players: { added: number; updated: number };
  golfbox: { customers: number; events: number; upcoming: number };
  link: { linked: number; scannedUsers: number };
  backfill: { mirrored: number };
  dedupe: { mergedGroups: number; fuzzyLeft: number };
}> {
  const players = await syncNorwegianPlayers();
  const golfbox = await syncGolfBoxSchedules(prisma);
  const link = await linkPublicPlayersByExactName(prisma);
  const backfill = await backfillTournamentResultsForLinkedUsers(prisma);
  const dedupe = await runDedupePlayerNames(prisma, { apply: true });

  return {
    players,
    golfbox,
    link: { linked: link.linked, scannedUsers: link.scannedUsers },
    backfill: { mirrored: backfill.mirrored },
    dedupe: {
      mergedGroups: dedupe.mergedGroups,
      fuzzyLeft: dedupe.fuzzyLeft,
    },
  };
}
