import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { hentAkTreningsobservasjoner } from "./ak-treningsobservasjon";
import { hentAkUkeforslag, begrensDelteForslag, type DelteForslag, type ForslagsLesevalg } from "./ak-ukeforslag-lesing";
export { begrensForslagsliste } from "./ak-treningsobservasjon";

/** Both complete families, including legacy/malformed rows, are excluded from
 * older membership-only paths. Each has its own current sharing reader. */
export const UTEN_AK_DELTE_PLANFORSLAG: Prisma.PlanActionWhereInput = {
  NOT: { OR: [{ agentName: { in: ["training-gap", "weekly-plan-proposals"] } },
    { actionType: { in: ["COACH_REVIEW", "TRAINING_GAP", "WEEKLY_PROPOSAL"] } }] },
};
export async function hentAkDeltePlanforslag(viewer: Parameters<typeof hentAkTreningsobservasjoner>[0], valg: ForslagsLesevalg = {}): Promise<DelteForslag> {
  const [observasjoner, uke] = await Promise.all([hentAkTreningsobservasjoner(viewer, valg), hentAkUkeforslag(viewer, valg)]);
  return { planActions: begrensDelteForslag([...observasjoner.planActions, ...uke.planActions], valg),
    pendingCount: observasjoner.pendingCount + uke.pendingCount,
    acceptedCount: observasjoner.acceptedCount + uke.acceptedCount,
    rejectedCount: observasjoner.rejectedCount + uke.rejectedCount,
    accepted7d: observasjoner.accepted7d + uke.accepted7d,
    rejected7d: observasjoner.rejected7d + uke.rejected7d,
    godkjentAvViewer: observasjoner.godkjentAvViewer + uke.godkjentAvViewer,
    eldstePending: [observasjoner.eldstePending, uke.eldstePending].filter(r => r !== null)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0] ?? null };
}
