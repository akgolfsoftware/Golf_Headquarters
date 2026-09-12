import type { Prisma } from "@/generated/prisma/client";

/** Tilgang til coach-spørsmål. Ingen Prisma-kall. */

export function kanSeSporsmal(input: {
  viewerId: string;
  viewerRole: string;
  askerUserId: string;
  coachUserId: string | null;
  harSpillerTilgang: boolean;
}): boolean {
  if (input.viewerId === input.askerUserId) return true;
  if (input.viewerRole === "ADMIN") return true;
  if (input.viewerRole !== "COACH") return false;
  if (input.coachUserId === input.viewerId) return true;
  if (input.coachUserId === null) return input.harSpillerTilgang;
  return false;
}

export function kanSvarePaSporsmal(input: {
  viewerId: string;
  viewerRole: string;
  coachUserId: string | null;
  harSpillerTilgang: boolean;
}): boolean {
  if (input.viewerRole === "ADMIN") return true;
  if (input.viewerRole !== "COACH") return false;
  if (input.coachUserId === input.viewerId) return true;
  if (input.coachUserId === null) return input.harSpillerTilgang;
  return false;
}

/** Coach ser egne tildelte spørsmål og åpen kø kun for egne spillere. */
export function sporsmalListeFilter(input: {
  viewerId: string;
  viewerRole: string;
  coachedPlayerIds: string[];
}): Prisma.QuestionWhereInput {
  if (input.viewerRole === "ADMIN") {
    return { OR: [{ coachUserId: input.viewerId }, { coachUserId: null }] };
  }
  return {
    OR: [
      { coachUserId: input.viewerId },
      { coachUserId: null, askerUserId: { in: input.coachedPlayerIds } },
    ],
  };
}
