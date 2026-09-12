import type { Prisma } from "@/generated/prisma/client";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";

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
