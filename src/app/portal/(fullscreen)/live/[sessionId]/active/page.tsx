/**
 * PlayerHQ · Live-økt aktiv V2 — TrainingSessionV2.
 *
 * Henter økt + drills og rendrer LiveActive-komponenten som styrer timer,
 * rep-logging og drill-fremdrift.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadLiveSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { LiveActive } from "@/components/portal/live";
import { filterLiveCoachMessages, type LiveCoachPanelData } from "@/components/portal/live/types";

export default async function LiveActivePage({
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

  const result = await loadLiveSession(sessionId);
  if (!result.ok) {
    if (result.reason === "notfound") notFound();
    redirect("/portal/planlegge");
  }

  // Terminal-statuser: coach kan fortsatt se; spiller sendes videre.
  if (result.data.status === "COMPLETED") redirect(`/portal/live/${sessionId}/summary`);
  if (result.data.status === "CANCELLED" || result.data.status === "SKIPPED") {
    redirect("/portal/planlegge");
  }

  // Coach ser read-only aktiv skjerm; for MVP sender vi likevel til brief.
  if (isCoach) {
    redirect(`/portal/live/${sessionId}/brief`);
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
    kind: "session-v2",
    tier: user.tier === "GRATIS" ? "GRATIS" : "PRO",
    userId: user.id,
    fornavn,
    initialer,
    initialMessages: filterLiveCoachMessages(thread?.messages),
  };

  return <LiveActive data={result.data} coachPanel={coachPanel} />;
}
