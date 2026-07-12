/**
 * Kanonisk kø-telling for AgencyOS-godkjenningskøen.
 *
 * ÉN kilde til sannhet for «hvor mange saker venter» — samme tall på
 * innboks-banneret (TriageV2), godkjenninger-hodet og varsler-siden.
 * Filtrene speiler loaderen i src/app/admin/godkjenninger/page.tsx eksakt:
 *   - PlanAction:      PENDING + (coachId = coach ELLER coachId = null)
 *   - CaddieDraft:     PENDING
 *   - SessionRequest:  PENDING + (coachId = coach ELLER coachId = null)
 *     (.catch → 0: samme defensivitet som loaderen, som .catch-er til [])
 */

import { prisma } from "@/lib/prisma";

export type KoTelling = {
  planActions: number;
  caddieDrafts: number;
  sessionRequests: number;
  totalt: number;
};

export async function koTelling(coachUserId: string): Promise<KoTelling> {
  const [planActions, caddieDrafts, sessionRequests] = await Promise.all([
    prisma.planAction.count({
      where: { status: "PENDING", OR: [{ coachId: coachUserId }, { coachId: null }] },
    }),
    prisma.caddieDraft.count({ where: { status: "PENDING" } }),
    prisma.sessionRequest
      .count({ where: { status: "PENDING", OR: [{ coachId: coachUserId }, { coachId: null }] } })
      .catch(() => 0),
  ]);
  return {
    planActions,
    caddieDrafts,
    sessionRequests,
    totalt: planActions + caddieDrafts + sessionRequests,
  };
}
