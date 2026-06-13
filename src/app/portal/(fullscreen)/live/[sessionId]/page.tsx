/**
 * PlayerHQ · Live-økt V2 — status-router.
 *
 * /portal/live/[sessionId] rendrer ingen UI selv; den slår opp TrainingSessionV2s
 * status og sender videre til riktig underside (brief/active/summary).
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

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    select: {
      status: true,
      studentId: true,
      coachId: true,
      hostId: true,
      participants: { where: { userId: user.id } },
    },
  });
  if (!session) notFound();

  const isOwner =
    session.studentId === user.id ||
    session.coachId === user.id ||
    session.hostId === user.id;
  const isParticipant = session.participants.some((p) =>
    ["ACCEPTED", "ATTENDED"].includes(p.status),
  );
  if (!isOwner && !isParticipant && !isCoach) {
    redirect("/portal/planlegge");
  }

  switch (session.status) {
    case "COMPLETED":
      redirect(`/portal/live/${sessionId}/summary`);
    case "IN_PROGRESS":
      redirect(`/portal/live/${sessionId}/active`);
    case "CANCELLED":
    case "SKIPPED":
      redirect("/portal/planlegge");
    default: // PLANNED
      redirect(`/portal/live/${sessionId}/brief`);
  }
}
