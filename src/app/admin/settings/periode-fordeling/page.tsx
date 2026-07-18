/**
 * AgencyOS · Innstillinger · Periode-fordeling (fase 1, godkjent 2026-07-18).
 * Coach setter den globale pyramide-fordelingen (min/maks-%) per periode manuelt.
 * Verdiene overstyrer defaultene via resolveren; finnes ingen overstyring vises
 * dagens default. Server component — auth + last, mutasjoner i actions.ts.
 *
 * COACH + ADMIN (metodikk-styring). Fordelingen er anbefaling, aldri sperre.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { hentPeriodeFordelinger } from "./actions";
import { PeriodeFordelingV2 } from "@/components/admin/v2/PeriodeFordelingV2";

export const dynamic = "force-dynamic";

export default async function PeriodeFordelingPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const rader = await hentPeriodeFordelinger();

  return (
    <V2Shell nav={AGENCYOS_NAV}>
      <TilbakeLenke href="/admin/settings">Innstillinger</TilbakeLenke>
      <PeriodeFordelingV2 rader={rader} />
    </V2Shell>
  );
}
