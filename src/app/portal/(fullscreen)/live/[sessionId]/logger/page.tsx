/**
 * PlayerHQ · Live-økt logger — alias for aktiv-skjermen (samme LiveActive-
 * flate). Beholdt som redirect fordi adressen har vært publisert eksternt.
 * Eierskap håndteres av active-siden den lander på.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function LiveLoggerPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}): Promise<never> {
  // (fullscreen)-layouten krever kun innlogging (17.08) — tilgangsnivået
  // håndheves her. Målruten .../active krever FULL; aliaset speiler den.
  await requirePortalUser({ kreverTilgang: "FULL" });
  const { sessionId } = await params;
  redirect(`/portal/live/${sessionId}/active`);
}
