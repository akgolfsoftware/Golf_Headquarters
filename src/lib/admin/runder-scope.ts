import type { Prisma } from "@/generated/prisma/client";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";

/**
 * Scope for rundeanalysen (`/admin/runder`): head coach (ADMIN) ser runder for
 * alle coachede spillere, assistant coach (COACH) bare for egne spillere.
 */
export function rundeScopeWhere(viewer: { id: string; role: string }): Prisma.RoundWhereInput {
  return { user: coachScopedPlayerWhere(viewer) };
}
