/**
 * Slag for slag — /portal/runde/live (PH-RD-02 til PH-RD-05, pakke 5).
 * Fasit: docs/design-system/utkast-playerhq/runder.html. Alltid lyst, også ute på banen (vedtak 14.10).
 * KUN brutto score — aldri netto.
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH08RundeLive.tsx.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadPh0809Data } from "@/lib/portal-runder/load-ph08-09";
import { PH08RundeLive } from "@/components/portal/precision/PH08RundeLive";

export const metadata = { title: "Slag for slag · PlayerHQ" };

export default async function RundeLivePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const data = await loadPh0809Data(user.id);

  return (
    <div className="pa-root" data-design="precision-athletics" data-theme="light" style={{ minHeight: "100vh" }}>
      <PH08RundeLive data={data} />
    </div>
  );
}
