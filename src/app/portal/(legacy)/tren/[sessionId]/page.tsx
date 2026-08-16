import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Legacy → moderne live-økt (PlayerHQ B / v2). */
export default async function LegacyRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}): Promise<never> {
  // (legacy)-layouten krever kun innlogging (17.08) — nivået håndheves her.
  // Målruten /portal/live står ikke på talent-allowlisten: FULL.
  await requirePortalUser({ kreverTilgang: "FULL" });
  const { sessionId } = await params;
  redirect(`/portal/live/${sessionId}`);
}
