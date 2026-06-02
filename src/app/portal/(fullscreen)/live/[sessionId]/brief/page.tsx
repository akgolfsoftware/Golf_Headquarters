/**
 * PlayerHQ · Live-økt brief (skjerm 1) — forest-fullscreen.
 *
 * Henter ekte data via loadLiveSession (trainingPlanSession + drills).
 * Auth-guard + eierskap/tier-gating beholdt. Render: LiveBrief.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadLiveSession, findOngoingSession } from "@/lib/portal-live/data";
import { LiveBrief } from "@/components/portal/live";

export default async function LiveBriefPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ avbrutt?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;
  const { avbrutt } = await searchParams;

  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  const result = await loadLiveSession(sessionId, user.id, isCoach);
  if (!result.ok) {
    if (result.reason === "notfound") notFound();
    redirect("/portal/tren");
  }

  const { data } = result;

  // Pågående økt (ACTIVE/PAUSED) for spilleren selv — «Fortsett pågående økt?».
  const ongoing = isCoach ? null : await findOngoingSession(user.id);

  // Bare eier kan starte; coach ser read-only. GRATIS-tier blokkeres.
  const erEier = !isCoach; // coach/admin treffer aldri eier-grenen her som spiller
  const canStart = user.tier !== "GRATIS" && erEier && !data.completed;
  const blockReason: "completed" | "tier" | null = data.completed
    ? "completed"
    : user.tier === "GRATIS"
      ? "tier"
      : null;

  return (
    <LiveBrief
      data={data}
      canStart={canStart}
      blockReason={blockReason}
      ongoing={ongoing}
      abandoned={avbrutt === "1"}
    />
  );
}
