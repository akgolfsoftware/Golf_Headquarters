/**
 * Kanonisk kø-telling for AgencyOS-godkjenningskøen.
 *
 * ÉN kilde til sannhet for «hvor mange saker venter» — samme tall på
 * innboks-banneret (TriageV2), godkjenninger-hodet og varsler-siden.
 * Filtrene speiler loaderen i src/app/admin/godkjenninger/page.tsx:
 *   - PlanAction:      PENDING + coach-scope + spiller-scope
 *   - CaddieDraft:     PENDING (ADMIN: alle; COACH: filtreres i UI — her
 *                      teller vi kun admin-alle / coach 0 hvis ikke ADMIN)
 *   - SessionRequest:  PENDING + coach-scope + spiller-scope
 */

import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";

export type KoTelling = {
  planActions: number;
  caddieDrafts: number;
  sessionRequests: number;
  totalt: number;
};

export async function koTelling(
  coachUserId: string,
  viewerRole: string = "COACH",
): Promise<KoTelling> {
  const spillerScope = coachScopedPlayerWhere({ id: coachUserId, role: viewerRole });

  const [planActions, caddieDrafts, sessionRequests] = await Promise.all([
    prisma.planAction.count({
      where: {
        status: "PENDING",
        OR: [{ coachId: coachUserId }, { coachId: null }],
        user: spillerScope,
      },
    }),
    // Caddie-utkast: full telling kun for ADMIN (coach ser filtrert liste i UI)
    viewerRole === "ADMIN"
      ? prisma.caddieDraft.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
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
