import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * Pensjonert 2026-08-29. Var en full, 309 linjers Paper-port av TrackMan-
 * øktdetaljen som levde parallelt med `/portal/analysere/trackman/[id]` — to
 * fungerende implementasjoner av samme skjerm, som uunngåelig ville glidd fra
 * hverandre i data og utseende.
 *
 * Analyse-varianten er etterfølgeren (TM-11 er IA-fasit, og den siterer denne
 * fila som utgangspunkt). Lista på samme prefiks ble redirectet tidligere, men
 * detaljen ble stående — den halve konsolideringen er det denne fila lukker.
 *
 * Guarden er beholdt på FULL, som den var. Målruten under Analyse er åpnere,
 * men `talent-allowlist.test.ts` slår fast at TrackMan-aliasene skal være
 * låst for gratisprofilen. Om det spriket skal lukkes er en produktbeslutning,
 * ikke noe denne avdupliseringen avgjør.
 *
 * Merk: `mal/trackman/gapping` består — den har ingen tvilling under Analyse.
 */
export default async function TrackManDetaljRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  await requirePortalUser({ kreverTilgang: "FULL" });
  const { id } = await params;
  redirect(`/portal/analysere/trackman/${id}`);
}
