/**
 * PlayerHQ · Live-økt — status-router.
 *
 * Støtter TrainingSessionV2, TrainingPlanSession og WorkbenchSession
 * (coach-publisert økt fra I dag).
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { resolveLiveSession } from "@/lib/portal-live/resolve-live-session";
import { liveRouteForResolved } from "@/lib/portal-live/live-route";

export default async function LiveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  if (user.tier === "GRATIS" && !isCoach) {
    redirect("/portal/meg/abonnement");
  }

  const resolved = await resolveLiveSession(sessionId, user.id);
  const rute = liveRouteForResolved(resolved, { userId: user.id, isCoach });
  if (rute.type === "notfound") notFound();
  if (rute.type === "forbidden") redirect("/portal/planlegge/workbench");
  redirect(rute.href);
}
