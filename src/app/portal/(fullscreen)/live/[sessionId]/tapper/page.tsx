import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { filterLiveCoachMessages, type LiveCoachPanelData } from "@/components/portal/live/types";
import { TapperShell } from "./tapper-shell";

const DEFAULT_CLUBS = [
  { id: "driver", name: "Driver" },
  { id: "iron-7", name: "7-jern" },
  { id: "wedge", name: "Wedge" },
  { id: "putter", name: "Putter" },
];

/**
 * Live · Tapper-modus — fullscreen, minimal UI for å logge ball på range.
 * Designet etter wireframe/design-package/project/screens/02-live-tapper.html
 *
 * Mobile-first: tap-target ≥56px, tap-knapp 120px, store mini-stats.
 */
export default async function LiveTapperPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  const { sessionId } = await params;

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true, name: true } },
    },
  });
  if (!session) notFound();

  const erEier = session.plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) {
    redirect("/portal/planlegge/workbench");
  }

  const thread = await prisma.coachingSession.findUnique({
    where: { userId_liveSessionId: { userId: user.id, liveSessionId: sessionId } },
    select: { messages: true },
  });
  const fornavn = user.name?.split(" ")[0] ?? "deg";
  const initialer = user.name
    ? user.name.split(" ").map((d) => d[0]).slice(0, 2).join("").toUpperCase()
    : "DU";
  const coachPanel: LiveCoachPanelData = {
    sessionId,
    kind: "plan-session",
    tier: user.tier === "GRATIS" ? "GRATIS" : "PRO",
    userId: user.id,
    fornavn,
    initialer,
    initialMessages: filterLiveCoachMessages(thread?.messages),
  };

  // Gjenopptak: tidligere lagrede tellinger for økten (session_ball_logs).
  const lagrede = await prisma.sessionBallLog.findMany({
    where: { planSessionId: session.id },
    select: { club: true, count: true },
  });
  const initialCounts = Object.fromEntries(lagrede.map((r) => [r.club, r.count]));

  return (
    <TapperShell
      sessionId={session.id}
      facilityLabel={session.plan.name}
      defaultClubs={DEFAULT_CLUBS}
      coachPanel={coachPanel}
      initialCounts={initialCounts}
    />
  );
}
