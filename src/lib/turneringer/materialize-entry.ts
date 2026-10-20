/**
 * Materialiserer PublicPlayerRound + speiler til TournamentResult når
 * PublicPlayer er koblet til en PlayerHQ-bruker (User.publicPlayerId).
 *
 * Kalles etter upsert av PublicPlayerEntry fra GolfBox/DataGolf.
 */

import type { Prisma } from "@/generated/prisma/client";

type ResultDatabase = Pick<Prisma.TransactionClient, "publicPlayerRound" | "user" | "tournamentResult" | "tournamentEntry">;

export type MaterializeRoundsInput = {
  entryId: string;
  /** Brutto-score per runde (R1, R2, …). null = ikke spilt. */
  roundScores: (number | null)[];
  source: "GOLFBOX" | "DATAGOLF" | "NGF" | "MANUAL" | "WAGR" | "NCAA";
  roundToPar?: (number | null)[];
  /** Full kildekorrigering for denne deltakelsen, innenfor samme datakilde. */
  replace?: boolean;
};

/**
 * Upsert PublicPlayerRound for hver runde med tall.
 * Runder med null-score hoppes over (ikke spilt / cut).
 */
export async function materializePublicPlayerRounds(
  prisma: ResultDatabase,
  input: MaterializeRoundsInput,
): Promise<{ rounds: number }> {
  let rounds = 0;
  if (input.replace) {
    await prisma.publicPlayerRound.deleteMany({ where: {
      entryId: input.entryId, source: input.source,
      roundNumber: { notIn: input.roundScores.flatMap((score, i) => Number.isSafeInteger(score) && score! > 0 ? [i + 1] : []) },
    } });
  }
  for (let i = 0; i < input.roundScores.length; i++) {
    const score = input.roundScores[i];
    if (score == null || !Number.isSafeInteger(score) || score <= 0) continue;
    const roundNumber = i + 1;
    const value = input.roundToPar?.[i];
    const toPar = value != null && Number.isSafeInteger(value) ? value : null;
    await prisma.publicPlayerRound.upsert({
      where: {
        entryId_roundNumber: { entryId: input.entryId, roundNumber },
      },
      create: {
        entryId: input.entryId,
        roundNumber,
        score,
        toPar,
        source: input.source,
      },
      update: {
        score,
        ...(input.roundToPar ? { toPar } : {}),
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
  /** Eget felt: brukes aldri som brutto score. */
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
  if (["CUT", "WITHDREW", "DQ", "DNF"].includes(s)) return "DNF";
  if (s === "FINISHED") return "COMPLETED";
  if (s === "TEED_OFF") return "CONFIRMED";
  if (s === "REGISTERED") return "PLANNED";
  // Et ukjent kildefelt dokumenterer ikke at spilleren fullførte.
  return "PLANNED";
}

/**
 * STOPPET 20.10.2026: skrev en kopi av resultatet til TournamentResult og TournamentEntry for
 * spillere koblet via User.publicPlayerId. Resultatene lever nå bare i spillerens bekreftede
 * profil (dashboard.profile_links, `hentSpillerprofil`), og alle miljøer leser derfra. En kopi per
 * miljø er det som ga dobbeltrader. Funksjonen finnes fortsatt, slik at kallerne ikke trenger å
 * endres på én gang, men skriver ingenting.
 *
 * Eksisterende speilrader ryddes av scripts/rydd-speilrader-turnering.ts (tørrkjøring som standard).
 */
export async function mirrorTournamentResultForLinkedUser(
  _prisma: ResultDatabase,
  _input: MirrorTournamentResultInput,
): Promise<{ mirrored: boolean; userId?: string; entryEnsured?: boolean }> {
  return { mirrored: false };
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
      typeof v === "number" && Number.isSafeInteger(v) && v > 0 ? v : null,
    );
  }
  return [];
}
