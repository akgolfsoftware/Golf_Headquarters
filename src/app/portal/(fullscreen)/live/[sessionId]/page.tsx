/**
 * PlayerHQ · Live-økt — status-router.
 *
 * Støtter TrainingSessionV2 (brief/active/summary) og TrainingPlanSession
 * (økt fra Workbench → /portal/tren/[id] eller tapper).
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

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

  const v2 = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: {
      status: true,
      studentId: true,
      coachId: true,
      hostId: true,
      participants: { where: { userId: user.id } },
    },
  });

  if (v2) {
    const isOwner =
      v2.studentId === user.id ||
      v2.coachId === user.id ||
      v2.hostId === user.id;
    const isParticipant = v2.participants.some((p) =>
      ["ACCEPTED", "ATTENDED"].includes(p.status),
    );
    if (!isOwner && !isParticipant && !isCoach) {
      redirect("/portal/planlegge/workbench");
    }

    switch (v2.status) {
      case "COMPLETED":
        redirect(`/portal/live/${sessionId}/summary`);
      case "IN_PROGRESS":
        redirect(`/portal/live/${sessionId}/active`);
      case "CANCELLED":
      case "SKIPPED":
        redirect("/portal/planlegge/workbench");
      default:
        redirect(`/portal/live/${sessionId}/brief`);
    }
  }

  const planSession = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: {
      status: true,
      plan: { select: { userId: true } },
    },
  });

  if (!planSession) notFound();

  const erEier = planSession.plan.userId === user.id;
  if (!erEier && !isCoach) {
    redirect("/portal/planlegge/workbench");
  }

  switch (planSession.status) {
    case "COMPLETED":
      redirect(`/portal/tren/${sessionId}`);
    case "ACTIVE":
    case "PAUSED":
      redirect(`/portal/live/${sessionId}/tapper`);
    default:
      redirect(`/portal/tren/${sessionId}`);
  }
}