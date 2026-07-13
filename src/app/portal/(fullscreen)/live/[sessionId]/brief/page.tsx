/**
 * PlayerHQ · Live-økt brief V2 — TrainingSessionV2.
 *
 * Viser økt-mål, fokus, coach-kommentar og drills-liste. Start-knappen sender
 * spilleren til aktiv-skjermen.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadLiveSession as loadPlanLiveSession } from "@/lib/portal-live/data";
import { loadLiveSession as loadV2LiveSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { LiveBrief, PlanSessionBrief } from "@/components/portal/live";

export default async function LiveBriefPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;
  const isCoach = user.role === "COACH" || user.role === "ADMIN";

  const [v2, planSession] = await Promise.all([
    prisma.trainingSessionV2.findUnique({
      where: { id: sessionId },
      select: { id: true },
    }),
    prisma.trainingPlanSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    }),
  ]);

  if (planSession && !v2) {
    const result = await loadPlanLiveSession(sessionId, user.id, isCoach);
    if (!result.ok) {
      if (result.reason === "notfound") notFound();
      redirect("/portal/planlegge/workbench");
    }

    const { data } = result;
    const owner = await prisma.trainingPlanSession.findUnique({
      where: { id: sessionId },
      select: { plan: { select: { userId: true } } },
    });
    const erEier = owner?.plan.userId === user.id;
    const canStart = erEier && user.tier !== "GRATIS" && !data.completed;
    const blockReason: "completed" | "tier" | "coach" | null = data.completed
      ? "completed"
      : isCoach
        ? "coach"
        : user.tier === "GRATIS"
          ? "tier"
          : null;

    return <PlanSessionBrief data={data} canStart={canStart} blockReason={blockReason} />;
  }

  const result = await loadV2LiveSession(sessionId);
  if (!result.ok) {
    if (result.reason === "notfound") notFound();
    redirect("/portal/planlegge");
  }

  const { data } = result;
  const canStart = !isCoach && user.tier !== "GRATIS" && !data.completed;
  const blockReason: "completed" | "tier" | null = data.completed
    ? "completed"
    : user.tier === "GRATIS" && !isCoach
      ? "tier"
      : null;

  return <LiveBrief data={data} canStart={canStart} blockReason={blockReason} />;
}
