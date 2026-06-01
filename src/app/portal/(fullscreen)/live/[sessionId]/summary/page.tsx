/**
 * PlayerHQ · Live-økt oppsummering (skjerm 4) — forest-fullscreen.
 *
 * Henter ekte data via loadLiveSession (trainingPlanSession + drills + neste
 * økt). Faktiske reps/tid leses klient-side fra sessionStorage-snapshot lagt
 * av aktiv-skjermen. Auth-guard + eierskap beholdt.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadLiveSession } from "@/lib/portal-live/data";
import { LiveSummary } from "@/components/portal/live";

export default async function SummaryPage({
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
    redirect("/portal/tren");
  }

  return <LiveSummary data={result.data} />;
}
