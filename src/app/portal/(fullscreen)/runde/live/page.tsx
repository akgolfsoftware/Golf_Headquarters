/**
 * Live runde-føring — /portal/runde/live (PH-08 i Precision Athletics).
 * Kilde: ui_kits/playerhq/screens/PH-08.jsx (26.09.2026).
 * Natt/fokus-visning med store treffflater (56px knapper).
 * KUN brutto score — aldri netto.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadPh0809Data } from "@/lib/portal-runder/load-ph08-09";
import { PH08RundeLive } from "@/components/portal/precision/PH08RundeLive";

export const metadata = { title: "Runde live · PlayerHQ" };

export default async function RundeLivePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const data = await loadPh0809Data(user.id);

  return <PH08RundeLive data={data} />;
}
