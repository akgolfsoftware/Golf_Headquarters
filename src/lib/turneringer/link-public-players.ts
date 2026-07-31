/**
 * Auto-koble PlayerHQ-brukere til PublicPlayer via eksakt navnematch.
 *
 * Regler (samme disiplin som dedupe):
 * - Kun normalizePlayerName-likhet (formaterings-normalisering).
 * - Hopp over hvis 0 treff eller >1 PublicPlayer med samme normaliserte navn.
 * - Hopp over hvis PublicPlayer allerede er koblet til en annen bruker.
 * - Aldri gjett middelsnavn-varianter.
 */

import type { PrismaClient } from "@/generated/prisma/client";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";
import { mirrorTournamentResultForLinkedUser } from "@/lib/turneringer/materialize-entry";

export type LinkPublicPlayersResult = {
  scannedUsers: number;
  linked: number;
  skippedAmbiguous: number;
  skippedNoMatch: number;
  skippedAlreadyLinkedPlayer: number;
};

export async function linkPublicPlayersByExactName(
  prisma: PrismaClient,
): Promise<LinkPublicPlayersResult> {
  const users = await prisma.user.findMany({
    where: {
      publicPlayerId: null,
      deletedAt: null,
      anonymisertAt: null,
      role: { in: ["PLAYER", "COACH", "ADMIN"] },
    },
    select: { id: true, name: true },
  });

  const publicPlayers = await prisma.publicPlayer.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      linkedUser: { select: { id: true } },
    },
  });

  // Map normalisert navn → kandidater
  const byNorm = new Map<string, typeof publicPlayers>();
  for (const p of publicPlayers) {
    const k = normalizePlayerName(p.name);
    if (!k) continue;
    if (!byNorm.has(k)) byNorm.set(k, []);
    byNorm.get(k)!.push(p);
  }

  let linked = 0;
  let skippedAmbiguous = 0;
  let skippedNoMatch = 0;
  let skippedAlreadyLinkedPlayer = 0;

  for (const u of users) {
    const k = normalizePlayerName(u.name);
    if (!k) {
      skippedNoMatch++;
      continue;
    }
    const candidates = byNorm.get(k) ?? [];
    if (candidates.length === 0) {
      skippedNoMatch++;
      continue;
    }
    if (candidates.length > 1) {
      skippedAmbiguous++;
      continue;
    }
    const target = candidates[0];
    // PublicPlayer.linkedUser er reverse av User.publicPlayerId
    if (target.linkedUser && target.linkedUser.id !== u.id) {
      skippedAlreadyLinkedPlayer++;
      continue;
    }

    try {
      await prisma.user.update({
        where: { id: u.id },
        data: { publicPlayerId: target.id },
      });
      linked++;
      // Unngå at to brukere i samme batch tar samme public player
      target.linkedUser = { id: u.id };
    } catch {
      // P2002: race / unique — hopp over
      skippedAlreadyLinkedPlayer++;
    }
  }

  return {
    scannedUsers: users.length,
    linked,
    skippedAmbiguous,
    skippedNoMatch,
    skippedAlreadyLinkedPlayer,
  };
}

/**
 * For alle allerede-koblede brukere: speil eksisterende PublicPlayerEntry →
 * TournamentResult + TournamentEntry. Brukes av cron etter link.
 */
export async function backfillTournamentResultsForLinkedUsers(
  prisma: PrismaClient,
): Promise<{ users: number; mirrored: number }> {
  const users = await prisma.user.findMany({
    where: {
      publicPlayerId: { not: null },
      deletedAt: null,
    },
    select: { id: true, publicPlayerId: true },
  });

  let mirrored = 0;
  for (const u of users) {
    if (!u.publicPlayerId) continue;
    const entries = await prisma.publicPlayerEntry.findMany({
      where: { playerId: u.publicPlayerId },
      select: {
        tournamentId: true,
        position: true,
        scoreToPar: true,
        totalScore: true,
        status: true,
      },
    });
    for (const e of entries) {
      const score =
        e.scoreToPar != null
          ? e.scoreToPar
          : e.totalScore != null
            ? e.totalScore
            : null;
      // Kun speil når vi har noe resultat
      if (e.position == null && score == null) continue;

      const r = await mirrorTournamentResultForLinkedUser(prisma, {
        tournamentId: e.tournamentId,
        publicPlayerId: u.publicPlayerId,
        position: e.position,
        scoreToPar: e.scoreToPar,
        totalScore: e.totalScore,
        publicEntryStatus: e.status,
      });
      if (r.mirrored) mirrored++;
    }
  }

  return { users: users.length, mirrored };
}
