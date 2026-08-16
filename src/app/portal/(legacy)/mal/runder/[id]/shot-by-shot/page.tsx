import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Legacy → moderne runde-detalj. */
export default async function LegacyRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  // (legacy)-layouten krever kun innlogging (17.08) — nivået håndheves her.
  // Nivået følger MÅLRUTEN: /portal/mal/runder er åpen for TALENT
  // (talent-allowlist.ts). FULL her ville stengt et gammelt bokmerke til en
  // flate brukeren faktisk har tilgang til.
  await requirePortalUser({ kreverTilgang: "TALENT" });
  const { id } = await params;
  redirect(`/portal/mal/runder/${id}`);
}
