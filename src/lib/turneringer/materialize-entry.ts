/**
 * Materialiserer PublicPlayerRound + speiler til TournamentResult når
 * PublicPlayer er koblet til en PlayerHQ-bruker (User.publicPlayerId).
 *
 * Kalles etter upsert av PublicPlayerEntry fra GolfBox/DataGolf.
 */

import type { PrismaClient } from "@/generated/prisma/client";

export type MaterializeRoundsInput = {
  entryId: string;
  /** Brutto-score per runde (R1, R2, …). null = ikke spilt. */
  roundScores: (number | null)[];
  source: "GOLFBOX" | "DATAGOLF" | "NGF" | "MANUAL" | "WAGR";
};

/**
 * Upsert PublicPlayerRound for hver runde med tall.
 * Runder med null-score hoppes over (ikke spilt / cut).
 */
export async function materializePublicPlayerRounds(
  prisma: PrismaClient,
  input: MaterializeRoundsInput,
): Promise<{ rounds: number }> {
  let rounds = 0;
  for (let i = 0; i < input.roundScores.length; i++) {
    const score = input.roundScores[i];
    if (score == null || !Number.isFinite(score)) continue;
    const roundNumber = i + 1;
    await prisma.publicPlayerRound.upsert({
      where: {
        entryId_roundNumber: { entryId: input.entryId, roundNumber },
      },
      create: {
        entryId: input.entryId,
        roundNumber,
        score: Math.round(score),
        source: input.source,
      },
      update: {
        score: Math.round(score),
        source: input.source,
      },
    });
    rounds++;
  }
  return { rounds };
}

export type MirrorTournamentResultInput = {
  tournamentId: string;
  /** PublicPlayer.id */
  publicPlayerId: string;
  position: number | null;
  /** Prefer scoreToPar (til par); fallback totalScore. */
  scoreToPar: number | null;
  totalScore: number | null;
  /**
   * PublicPlayerEntry.status (REGISTERED | TEED_OFF | CUT | WITHDREW | FINISHED).
   * Brukes til TournamentEntry.entryStatus.
   */
  publicEntryStatus?: string | null;
};

/** Map public leaderboard-status → PlayerHQ TournamentEntryStatus. */
export function mapPublicStatusToEntryStatus(
  publicStatus: string | null | undefined,
): "PLANNED" | "CONFIRMED" | "WITHDRAWN" | "COMPLETED" | "DNF" {
  const s = (publicStatus ?? "").toUpperCase();
  if (s === "CUT" || s === "WITHDREW") return "DNF";
  if (s === "FINISHED") return "COMPLETED";
  if (s === "TEED_OFF") return "CONFIRMED";
  if (s === "REGISTERED") return "PLANNED";
  // Har vi resultat uten status → regn som gjennomført
  return "COMPLETED";
}

/**
 * Hvis PublicPlayer har linkedUser (User.publicPlayerId):
 * 1) upsert TournamentResult
 * 2) sørg for TournamentEntry (Analysere-listen baserer seg på entry)
 */
export async function mirrorTournamentResultForLinkedUser(
  prisma: PrismaClient,
  input: MirrorTournamentResultInput,
): Promise<{ mirrored: boolean; userId?: string; entryEnsured?: boolean }> {
  const user = await prisma.user.findFirst({
    where: { publicPlayerId: input.publicPlayerId, deletedAt: null },
    select: { id: true },
  });
  if (!user) return { mirrored: false };

  const score =
    input.scoreToPar != null
      ? input.scoreToPar
      : input.totalScore != null
        ? input.totalScore
        : null;

  await prisma.tournamentResult.upsert({
    where: {
      tournamentId_userId: {
        tournamentId: input.tournamentId,
        userId: user.id,
      },
    },
    create: {
      tournamentId: input.tournamentId,
      userId: user.id,
      position: input.position,
      score,
    },
    update: {
      position: input.position,
      score,
    },
  });

  const entryStatus = mapPublicStatusToEntryStatus(input.publicEntryStatus);
  const existingEntry = await prisma.tournamentEntry.findFirst({
    where: { userId: user.id, tournamentId: input.tournamentId },
    select: { id: true },
  });

  if (existingEntry) {
    await prisma.tournamentEntry.update({
      where: { id: existingEntry.id },
      data: { entryStatus },
    });
  } else {
    await prisma.tournamentEntry.create({
      data: {
        userId: user.id,
        tournamentId: input.tournamentId,
        entryStatus,
        notes: "Automatisk fra turneringsresultat",
      },
    });
  }

  return { mirrored: true, userId: user.id, entryEnsured: true };
}

/**
 * Bygg roundScores-array fra rounds-JSON blob (GolfBox-format).
 * Eksport for tester og backfill.
 */
export function roundScoresFromEntryRounds(
  rounds: unknown,
): (number | null)[] {
  if (!rounds || typeof rounds !== "object") return [];
  const r = rounds as Record<string, unknown>;
  if (Array.isArray(r.roundScores)) {
    return r.roundScores.map((v) =>
      typeof v === "number" && Number.isFinite(v) ? v : null,
    );
  }
  return [];
}
