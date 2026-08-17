import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * /portal/tren/ovelser/[id] (gammel adresse) → /portal/drills/[id].
 * Detalj-siden serveres fortsatt fra legacy-treet på kanonisk adresse —
 * id-en bevares så gamle lenker fortsatt treffer riktig øvelse.
 */
export default async function OvelseDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  // Rot-layouten krever kun innlogging (16.08) — tilgangsnivået håndheves her.
  await requirePortalUser({ kreverTilgang: "FULL" });
  const { id } = await params;
  redirect(`/portal/drills/${id}`);
}
