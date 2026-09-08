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
import { mapWbToLiveSessionData } from "@/lib/portal-live/wb-live-map";

export default async function LiveBriefPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;
  const isCoach = user.role === "COACH" || user.role === "ADMIN";

  const [v2, planSession, wbRow] = await Promise.all([
    prisma.trainingSessionV2.findUnique({
      where: { id: sessionId },
      select: { id: true },
    }),
    prisma.trainingPlanSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    }),
    prisma.workbenchSession.findUnique({
      where: { id: sessionId },
      include: { drills: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  if (!v2 && !planSession && wbRow) {
    const erEier = wbRow.playerId === user.id;
    if (!erEier && !isCoach) {
      redirect("/portal/planlegge/workbench");
    }
    if (wbRow.status === "COMPLETED") {
      redirect(`/portal/live/${sessionId}/summary`);
    }
    if (wbRow.status === "IN_PROGRESS") {
      redirect(`/portal/live/${sessionId}/tapper`);
    }
    const data = mapWbToLiveSessionData({
      id: wbRow.id,
      title: wbRow.title,
      status: wbRow.status,
      pyramid: wbRow.pyramid,
      durationMinutes: wbRow.durationMinutes,
      date: wbRow.date,
      startMinute: wbRow.startMinute,
      location: wbRow.location,
      notes: wbRow.notes,
      publishedAt: wbRow.publishedAt,
      createdAt: wbRow.createdAt,
      drills: wbRow.drills,
    });
    const canStart = erEier && user.tier !== "GRATIS" && !data.completed;
    const blockReason: "completed" | "tier" | "coach" | null = data.completed
      ? "completed"
      : isCoach && !erEier
        ? "coach"
        : user.tier === "GRATIS"
          ? "tier"
          : null;
    return <PlanSessionBrief data={data} canStart={canStart} blockReason={blockReason} />;
  }

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
