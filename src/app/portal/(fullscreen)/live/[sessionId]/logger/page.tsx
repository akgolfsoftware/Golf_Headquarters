/**
 * PlayerHQ · Live-økt logger (rep-logging) — forest-fullscreen.
 *
 * Loggeren er rep-loggings-opplevelsen — samme forest-flate som aktiv drill
 * (skjerm 2 i designet): stor mono-timer, rep-tracker, sirkulære rep-knapper,
 * logg-rad. Henter ekte data via loadLiveSession. Auth-guard + tier-gating
 * beholdt. Ett mønster — aktiv og logger deler LiveActive.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadLiveSession } from "@/lib/portal-live/data";
import { LiveActive } from "@/components/portal/live";

export const dynamic = "force-dynamic";

export default async function LiveLoggerPage({
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
