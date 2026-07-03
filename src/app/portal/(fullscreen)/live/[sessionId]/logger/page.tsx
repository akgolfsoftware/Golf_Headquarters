/**
 * PlayerHQ · Live-økt logger — alias for aktiv-skjermen (samme LiveActive-
 * flate). Beholdt som redirect fordi adressen har vært publisert eksternt.
 * Auth/tier/eierskap håndteres av active-siden den lander på.
 */

import { redirect } from "next/navigation";

export default async function LiveLoggerPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/portal/live/${sessionId}/active`);
}
