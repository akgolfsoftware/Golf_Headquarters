/**
 * AgencyOS · Innstillinger · Periodenavn.
 * Viser periodenavn (TrainingPeriod.name) som ikke er gjenkjent av den
 * hardkodede ordboken i periode-navn.ts, og lar coach koble dem til en
 * periodetype uten kodeendring. Server component — auth + last, mutasjoner
 * i actions.ts.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { hentPeriodeNavnOversikt, PERIODE_NAVN_LABELS } from "./actions";
import { PeriodeNavnV2 } from "@/components/admin/v2/PeriodeNavnV2";

export const dynamic = "force-dynamic";

export default async function PeriodeNavnPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const oversikt = await hentPeriodeNavnOversikt();

  return (
    <V2Shell nav={AGENCYOS_NAV}>
      <TilbakeLenke href="/admin/settings">Innstillinger</TilbakeLenke>
      <PeriodeNavnV2 oversikt={oversikt} typer={PERIODE_NAVN_LABELS} />
    </V2Shell>
  );
}
