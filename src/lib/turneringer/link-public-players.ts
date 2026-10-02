/**
 * Bevarer kallkontrakten for tidligere navnebasert kontokobling.
 * Navnelikhet er ikke identitetsbevis og oppretter aldri en ny binding.
 * Ny binding krever en separat, verifisert vei med stabil kilde-ID.
 */

import type { PrismaClient } from "@/generated/prisma/client";
import { mirrorTournamentResultForLinkedUser } from "@/lib/turneringer/materialize-entry";

export type LinkPublicPlayersResult = {
  scannedUsers: number;
  linked: number;
  skippedAmbiguous: number;
  skippedNoMatch: number;
  skippedAlreadyLinkedPlayer: number;
  skippedUnverified: number;
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
    select: { id: true },
  });
  return {
    scannedUsers: users.length,
    linked: 0,
    skippedAmbiguous: 0,
    skippedNoMatch: 0,
    skippedAlreadyLinkedPlayer: 0,
    skippedUnverified: users.length,
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
      anonymisertAt: null,
    },
    select: { id: true, publicPlayerId: true },
  });

  let mirrored = 0;
  for (const u of users) {
    if (!u.publicPlayerId) continue;
    const publicPlayerId = u.publicPlayerId;
    const entries = await prisma.publicPlayerEntry.findMany({
      where: { playerId: u.publicPlayerId, tournament: { mergedIntoId: null } },
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

      const r = await prisma.$transaction(tx => mirrorTournamentResultForLinkedUser(tx, {
        tournamentId: e.tournamentId,
        publicPlayerId,
        position: e.position,
        scoreToPar: e.scoreToPar,
        totalScore: e.totalScore,
        publicEntryStatus: e.status,
      }));
      if (r.mirrored) mirrored++;
    }
  }

  return { users: users.length, mirrored };
}

/**
 * Speil turneringsresultater for en allerede koblet bruker.
 * Ukoblede brukere får aldri en binding fra navn, heller ikke ved ett treff.
 * Signaturen beholdes for profilopprettelse, onboarding og profiloppdatering.
 */
export async function linkAndSyncUserTournamentResults(
  prisma: PrismaClient,
  userId: string,
): Promise<{ linked: boolean; publicPlayerId?: string; mirrored: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, publicPlayerId: true },
  });
  if (!user) return { linked: false, mirrored: 0 };

  const publicPlayerId = user.publicPlayerId;

  if (!publicPlayerId) {
    return { linked: false, mirrored: 0 };
  }

  const entries = await prisma.publicPlayerEntry.findMany({
    where: { playerId: publicPlayerId, tournament: { mergedIntoId: null } },
    select: {
      tournamentId: true,
      position: true,
      scoreToPar: true,
      totalScore: true,
      status: true,
    },
  });

  let mirrored = 0;
  for (const e of entries) {
    const score =
      e.scoreToPar != null
        ? e.scoreToPar
        : e.totalScore != null
          ? e.totalScore
          : null;
    if (e.position == null && score == null) continue;

    const r = await prisma.$transaction((tx) =>
      mirrorTournamentResultForLinkedUser(tx, {
        tournamentId: e.tournamentId,
        publicPlayerId: publicPlayerId!,
        position: e.position,
        scoreToPar: e.scoreToPar,
        totalScore: e.totalScore,
        publicEntryStatus: e.status,
      }),
    );
    if (r.mirrored) mirrored++;
  }

  return { linked: true, publicPlayerId, mirrored };
}
