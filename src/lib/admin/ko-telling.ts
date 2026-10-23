/**
 * Kanonisk kø-telling for AgencyOS-godkjenningskøen.
 *
 * ÉN kilde til sannhet for «hvor mange saker venter» — samme tall på
 * innboks-banneret (TriageV2), godkjenninger-hodet og varsler-siden.
 * Filtrene speiler loaderen i src/app/admin/godkjenninger/page.tsx:
 *   - PlanAction:      PENDING + coach-scope + spiller-scope, unntatt handlinger
 *                      som eies av egne spillerflyter (f.eks. samlingsinvitasjon)
 *                      (ADMIN ser også agency-rader: user.role ADMIN)
 *   - CaddieDraft:     PENDING + eier (samme userId som kan godkjenne)
 *   - SessionRequest:  PENDING + coach-scope + spiller-scope
 */

import { hentAkDeltePlanforslag, UTEN_AK_DELTE_PLANFORSLAG } from "@/lib/deling/ak-delte-planforslag";
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
    ...UTEN_AK_DELTE_PLANFORSLAG,
    status: "PENDING",
    actionType: { not: "WORKBENCH_GATHERING_INVITE" },
    OR: [{ coachId: viewer.id }, { coachId: null }],
    user: userFilter,
  };
}

export async function koTelling(
  coachUserId: string,
  viewerRole: string = "COACH",
  observasjoner?: { pendingCount: number },
): Promise<KoTelling> {
  const spillerScope = coachScopedPlayerWhere({ id: coachUserId, role: viewerRole });

  const [eldrePlanActions, caddieDrafts, sessionRequests, treningsobservasjoner] = await Promise.all([
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
    observasjoner ?? hentAkDeltePlanforslag({ id: coachUserId, role: viewerRole }, { maksRader: 0 }),
  ]);
  const planActions = eldrePlanActions + treningsobservasjoner.pendingCount;
  return {
    planActions,
    caddieDrafts,
    sessionRequests,
    totalt: planActions + caddieDrafts + sessionRequests,
  };
}
