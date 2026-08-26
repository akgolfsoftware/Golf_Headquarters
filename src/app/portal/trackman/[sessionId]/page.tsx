import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

type Props = { params: Promise<{ sessionId: string }> };

/**
 * Legacy session-URL → kanonisk TrackMan-session. Rettet 26.08 (B7) fra
 * `/portal/mal/trackman/[id]` (Paper-port) til `/portal/analysere/trackman/[id]`
 * (TM-11, Train-lock DispersionMap) — TM-11 er nå IA-fasit for økt-detalj.
 */
export default async function TrackManSessionLegacyRedirect({
  params,
}: Props): Promise<never> {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  await requirePortalUser({ kreverTilgang: "FULL" });
  const { sessionId } = await params;
  redirect(`/portal/analysere/trackman/${sessionId}`);
}
