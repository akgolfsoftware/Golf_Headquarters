import type { Prisma } from "@/generated/prisma/client";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { aktivtTrenerMedlemskapWhere } from "@/lib/domain/grupper";

/** Samme spillerporte som hjem, spillerkort og Workbench. */
export function stallenPlayerWhere(
  coach: { id: string; role: string },
  q?: string,
): Prisma.UserWhereInput {
  const scope = coachScopedPlayerWhere(coach);
  const sok = q?.trim();
  if (!sok) return scope;
  return {
    AND: [
      scope,
      {
        OR: [
          { name: { contains: sok, mode: "insensitive" } },
          { email: { contains: sok, mode: "insensitive" } },
          { homeClub: { contains: sok, mode: "insensitive" } },
        ],
      },
    ],
  };
}

/**
 * Grupper coachen faktisk ser økter for. Matcher spillerporten:
 * eiergruppen eller aktivt trener-/hjelpetrener-medlemskap. ADMIN ser alle.
 */
export function stallenGruppeWhere(coach: {
  id: string;
  role: string;
}): Prisma.GroupWhereInput {
  if (coach.role !== "COACH") return {};
  return {
    OR: [
      { coachId: coach.id },
      { members: { some: aktivtTrenerMedlemskapWhere(coach.id) } },
    ],
  };
}
