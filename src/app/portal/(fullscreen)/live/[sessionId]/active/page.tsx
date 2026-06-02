/**
 * PlayerHQ · Live-økt aktiv (skjerm 2 + overgang skjerm 3) — forest-fullscreen.
 *
 * Det viktigste skjermbildet. Henter ekte data via loadLiveSession
 * (trainingPlanSession + drills). Auth-guard + eierskap/tier-gating beholdt.
 * Faktiske reps/tid logges klient-side (offline-først) i LiveActive.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadLiveSession } from "@/lib/portal-live/data";
import { LiveActive } from "@/components/portal/live";

export default async function LiveActivePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  // Live-logging krever PRO (coach/admin slipper gjennom for innsyn/test).
  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  if (user.tier === "GRATIS" && !isCoach) {
    redirect("/portal/meg/abonnement");
  }

  const result = await loadLiveSession(sessionId, user.id, isCoach);
  if (!result.ok) {
    if (result.reason === "notfound") notFound();
    redirect("/portal/tren");
  }

  // Terminal-statuser: ikke vis aktiv-UI.
  if (result.data.status === "COMPLETED") redirect(`/portal/live/${sessionId}/summary`);
  if (result.data.status === "ABANDONED") redirect(`/portal/live/${sessionId}/brief?avbrutt=1`);

  return <LiveActive data={result.data} />;
}
