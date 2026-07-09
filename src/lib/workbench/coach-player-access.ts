import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canCoachAccessPlayer } from "@/lib/sg-hub/coach-access";

/** Coach/ADMIN med faktisk tilgang til spilleren — ellers feilmelding. */
export async function ensureCoachForPlayer(
  playerId: string,
): Promise<{ ok: true; coachId: string } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const allowed = await canCoachAccessPlayer(user.id, playerId, user.role as UserRole);
  if (!allowed) return { ok: false, error: "Ingen tilgang til denne spilleren" };
  return { ok: true, coachId: user.id };
}