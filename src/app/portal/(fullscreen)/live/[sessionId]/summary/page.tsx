/**
 * PlayerHQ · Live-økt oppsummering (skjerm 4) — forest-fullscreen.
 *
 * Henter ekte data via loadLiveSession (trainingPlanSession + drills + neste
 * økt). Faktiske reps/tid leses klient-side fra sessionStorage-snapshot lagt
 * av aktiv-skjermen. Auth-guard + eierskap beholdt.
 *
 * Status-guard: kun COMPLETED (og ACTIVE/PAUSED for umiddelbar retur etter
 * goToSummary) vises her. ABANDONED → brief med avbrutt-notis. Alle andre
 * terminale statuser → tren-oversikt.
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

  const { status } = result.data;

  // ABANDONED → brief med avbrutt-banner.
  if (status === "ABANDONED") {
    redirect(`/portal/live/${sessionId}/brief?avbrutt=1`);
  }

  // Ikke-aktive statuser som ikke er COMPLETED eller ACTIVE/PAUSED → tren.
  // ACTIVE/PAUSED tillates fordi completeSession kaller redirect *etter* DB-skriv,
  // og status kan leses som ACTIVE i et race-vindu fra goToSummary-overgangen.
  if (
    status !== "COMPLETED" &&
    status !== "ACTIVE" &&
    status !== "PAUSED"
  ) {
    redirect("/portal/tren");
  }

  return <LiveSummary data={result.data} />;
}
