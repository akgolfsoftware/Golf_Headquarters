import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

type Props = { params: Promise<{ sessionId: string }> };

/** Legacy session-URL → kanonisk TrackMan-session. */
export default async function TrackManSessionLegacyRedirect({
  params,
}: Props): Promise<never> {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  await requirePortalUser({ kreverTilgang: "FULL" });
  const { sessionId } = await params;
  redirect(`/portal/mal/trackman/${sessionId}`);
}
