/**
 * Rapporter navnelikheter som kan trenge identitetskontroll. Navn er ikke en
 * bekreftet spilleridentitet, heller ikke når det bare finnes én kandidat.
 * Denne funksjonen kobler derfor aldri automatisk User.publicPlayerId.
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
  skippedUnverifiedIdentity: number;
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

  // Navn brukes kun til å telle kandidater for driftsoversikten, aldri som
  // tilstrekkelig bevis for å koble to personprofiler.
  const byNorm = new Map<string, typeof publicPlayers>();
  for (const p of publicPlayers) {
    const k = normalizePlayerName(p.name);
    if (!k) continue;
    if (!byNorm.has(k)) byNorm.set(k, []);
    byNorm.get(k)!.push(p);
  }

  let skippedAmbiguous = 0;
  let skippedNoMatch = 0;
  let skippedAlreadyLinkedPlayer = 0;
  let skippedUnverifiedIdentity = 0;

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
    if (candidates[0].linkedUser && candidates[0].linkedUser.id !== u.id) {
      skippedAlreadyLinkedPlayer++;
    } else {
      skippedUnverifiedIdentity++;
    }
  }

  return {
    scannedUsers: users.length,
    linked: 0,
    skippedAmbiguous,
    skippedNoMatch,
    skippedAlreadyLinkedPlayer,
    skippedUnverifiedIdentity,
  };
}

/**
 * For alle allerede-koblede brukere: speil eksisterende PublicPlayerEntry →
 * TournamentResult + TournamentEntry. Brukes etter eksisterende kobling.
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
 * Speil resultater for en allerede registrert PublicPlayer-kobling.
 * Uten en slik kobling returneres needsVerifiedLink; navn alene kobler ikke.
 * Brukes ved profilopprettelse, onboarding og profil-oppdatering.
 */
export async function linkAndSyncUserTournamentResults(
  prisma: PrismaClient,
  userId: string,
): Promise<{ linked: boolean; publicPlayerId?: string; mirrored: number; needsVerifiedLink?: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, publicPlayerId: true },
  });
  if (!user) return { linked: false, mirrored: 0 };

  const publicPlayerId = user.publicPlayerId;
  if (!publicPlayerId) {
    return { linked: false, mirrored: 0, needsVerifiedLink: true };
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
