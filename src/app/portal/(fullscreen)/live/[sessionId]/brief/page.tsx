/**
 * PlayerHQ · Live-økt brief V2 — TrainingSessionV2.
 *
 * Viser økt-mål, fokus, coach-kommentar og drills-liste. Start-knappen sender
 * spilleren til aktiv-skjermen.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadLiveSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { LiveBrief } from "@/components/portal/live";

export default async function LiveBriefPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  const result = await loadLiveSession(sessionId, user.id, isCoach);
  if (!result.ok) {
    if (result.reason === "notfound") notFound();
    redirect("/portal/planlegge");
  }

  const { data } = result;

  // Spiller kan starte hvis hen eier/deltar og ikke er gratis. Coach ser read-only.
  const canStart = !isCoach && user.tier !== "GRATIS" && !data.completed;
  const blockReason: "completed" | "tier" | null = data.completed
    ? "completed"
    : user.tier === "GRATIS" && !isCoach
      ? "tier"
      : null;

  return <LiveBrief data={data} canStart={canStart} blockReason={blockReason} />;
}
