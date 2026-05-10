import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { LiveTapper } from "./live-tapper";

export default async function LiveSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser();
  const { sessionId } = await params;

  if (user.tier === "GRATIS") {
    redirect("/portal/meg/abonnement");
  }

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true } },
      drills: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!session) notFound();

  const erEier = session.plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) {
    redirect("/portal/tren");
  }

  return <LiveTapper session={session} drills={session.drills} />;
}
