import type { ExerciseSource, ExerciseVisibility, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/** Coach-IDer spilleren er aktivt enrollert under. */
export async function getMyCoachIds(userId: string): Promise<string[]> {
  const enrollments = await prisma.playerEnrollment.findMany({
    where: { userId, endedAt: null, coachId: { not: null } },
    select: { coachId: true },
  });
  return enrollments
    .map((e) => e.coachId)
    .filter((id): id is string => id !== null);
}

type DrillAccessRow = {
  source: ExerciseSource;
  visibility: ExerciseVisibility;
  createdBy: string | null;
};

/** Samme OR-regel som getDrillLibrary — gjenbrukes for tilgangssjekk. */
export function drillAccessWhere(
  userId: string,
  coachIds: string[],
): Prisma.ExerciseDefinitionWhereInput {
  return {
    OR: [
      { source: "SYSTEM" },
      ...(coachIds.length > 0
        ? [
            {
              source: "COACH" as const,
              visibility: "COACH_PLAYERS" as const,
              createdBy: { in: coachIds },
            },
            {
              source: "COACH" as const,
              visibility: "PRIVATE" as const,
              createdBy: { in: coachIds },
            },
          ]
        : []),
      { source: "PLAYER", createdBy: userId },
    ],
  };
}

export function userCanAccessDrillRow(
  userId: string,
  coachIds: string[],
  drill: DrillAccessRow,
): boolean {
  if (drill.source === "SYSTEM") return true;
  if (drill.source === "PLAYER") return drill.createdBy === userId;
  if (drill.source === "COACH") {
    if (!drill.createdBy || !coachIds.includes(drill.createdBy)) return false;
    return drill.visibility === "COACH_PLAYERS" || drill.visibility === "PRIVATE";
  }
  return false;
}

/** Sjekk om spiller har tilgang til én drill (direkte URL / actions). */
export async function canUserAccessDrill(userId: string, drillId: string): Promise<boolean> {
  const [drill, coachIds] = await Promise.all([
    prisma.exerciseDefinition.findUnique({
      where: { id: drillId },
      select: { source: true, visibility: true, createdBy: true },
    }),
    getMyCoachIds(userId),
  ]);
  if (!drill) return false;
  return userCanAccessDrillRow(userId, coachIds, drill);
}