/**
 * Rask score (etterregistrering) — /portal/runde/logg (PH-RD-06, pakke 5).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, skjerm «rask». Alltid lyst.
 * KUN brutto score — aldri netto.
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH09RegistrerRunde.tsx.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadPh0809Data } from "@/lib/portal-runder/load-ph08-09";
import { PH09RegistrerRunde } from "@/components/portal/precision/PH09RegistrerRunde";

export const metadata = { title: "Rask score · PlayerHQ" };

export default async function RundeLoggPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const data = await loadPh0809Data(user.id);

  return (
    <div className="pa-root" data-design="precision-athletics" data-theme="light" style={{ minHeight: "100vh" }}>
      <PH09RegistrerRunde data={data} fullskjerm />
    </div>
  );
}
