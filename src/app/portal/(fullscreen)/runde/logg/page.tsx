/**
 * Logg en runde (etterregistrering) — /portal/runde/logg (PH-09 i Precision Athletics).
 * Kilde: ui_kits/playerhq/screens/PH-09.jsx (26.09.2026).
 * Hull-for-hull registrering med brutto score.
 * KUN brutto score — aldri netto.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadPh0809Data } from "@/lib/portal-runder/load-ph08-09";
import { PH09RegistrerRunde } from "@/components/portal/precision/PH09RegistrerRunde";

export const metadata = { title: "Registrer runde · PlayerHQ" };

export default async function RundeLoggPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const data = await loadPh0809Data(user.id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-page)", color: "var(--text-primary)" }}>
      <PH09RegistrerRunde data={data} />
    </div>
  );
}
