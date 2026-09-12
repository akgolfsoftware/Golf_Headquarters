/**
 * Kanonisk kø-telling for AgencyOS-godkjenningskøen.
 *
 * ÉN kilde til sannhet for «hvor mange saker venter» — samme tall på
 * innboks-banneret (TriageV2), godkjenninger-hodet og varsler-siden.
 * Filtrene speiler loaderen i src/app/admin/godkjenninger/page.tsx:
 *   - PlanAction:      PENDING + coach-scope + spiller-scope
 *                      (ADMIN ser også agency-rader: user.role ADMIN)
 *   - CaddieDraft:     PENDING + eier (samme userId som kan godkjenne)
 *   - SessionRequest:  PENDING + coach-scope + spiller-scope
 */

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { caddieDraftKoWhere } from "@/lib/caddie/draft-eier";

export type KoTelling = {
  planActions: number;
  caddieDrafts: number;
  sessionRequests: number;
  totalt: number;
};

/**
 * Samme PlanAction-filter som /admin/godkjenninger.
 * ADMIN ser også agency-rader (user.role ADMIN) — SoMe, kode-review,
 * booking-optimizer — som ellers forsvant bak spiller-scope.
 */
export function planActionKoWhere(viewer: {
  id: string;
  role: string;
}): Prisma.PlanActionWhereInput {
  const spillerScope = coachScopedPlayerWhere(viewer);
  const userFilter: Prisma.UserWhereInput =
    viewer.role === "ADMIN" ? { OR: [spillerScope, { role: "ADMIN" }] } : spillerScope;
  return {
    status: "PENDING",
    OR: [{ coachId: viewer.id }, { coachId: null }],
    user: userFilter,
  };
}

export async function koTelling(
  coachUserId: string,
  viewerRole: string = "COACH",
): Promise<KoTelling> {
  const spillerScope = coachScopedPlayerWhere({ id: coachUserId, role: viewerRole });

  const [planActions, caddieDrafts, sessionRequests] = await Promise.all([
    prisma.planAction.count({
      where: planActionKoWhere({ id: coachUserId, role: viewerRole }),
    }),
    prisma.caddieDraft.count({ where: caddieDraftKoWhere(coachUserId) }),
    prisma.sessionRequest
      .count({
        where: {
          status: "PENDING",
          OR: [{ coachId: coachUserId }, { coachId: null }],
          user: spillerScope,
        },
      })
      .catch(() => 0),
  ]);
  return {
    planActions,
    caddieDrafts,
    sessionRequests,
    totalt: planActions + caddieDrafts + sessionRequests,
  };
}
