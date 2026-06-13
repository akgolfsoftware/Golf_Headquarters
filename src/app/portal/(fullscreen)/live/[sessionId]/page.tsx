/**
 * PlayerHQ · Live-økt — status-router.
 *
 * Roten /portal/live/[sessionId] rendrer ingen UI selv: den slår opp øktas
 * status og sender videre til riktig under-side (brief/active/summary).
 * Under-sidene har egne auth-/tier-/eierskaps-guards, så svitsjen her er
 * kun ruting — ikke siste forsvarslinje.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function LiveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  const { sessionId } = await params;

  // Live krever PRO (coach/admin slipper gjennom for innsyn/test).
  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  if (user.tier === "GRATIS" && !isCoach) {
    redirect("/portal/meg/abonnement");
  }

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    select: { status: true, plan: { select: { userId: true } } },
  });
  if (!session) notFound();

  if (session.plan.userId !== user.id && !isCoach) {
    redirect("/portal/tren");
  }

  switch (session.status) {
    case "COMPLETED":
      redirect(`/portal/live/${sessionId}/summary`);
    case "ABANDONED":
      redirect(`/portal/live/${sessionId}/brief?avbrutt=1`);
    case "ACTIVE":
    case "PAUSED":
      redirect(`/portal/live/${sessionId}/active`);
    case "SKIPPED":
    case "CANCELLED":
      // Ikke aktive lenger — brief ville vist en START-CTA som først feiler
      // ved startSession. Samme gren som startSession sin default.
      redirect("/portal/tren");
    default: // PLANNED
      redirect(`/portal/live/${sessionId}/brief`);
  }
}
