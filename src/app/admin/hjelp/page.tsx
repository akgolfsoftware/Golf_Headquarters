/**
 * v2: AgencyOS Hjelp. Egen top-level route (v2preview-mønster) som IKKE
 * arver AdminShell — kun root-layout — så V2Shell leverer all chrome
 * (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Statisk innhold (samme fasit som /admin/(legacy)/hjelp) — ingen
 * Prisma-spørringer. Auth via requirePortalUser (COACH/ADMIN), samme som
 * legacy-siden.
 *
 * Server component. "Hjelp" ligger i AGENCYOS_MER (Drift-gruppen) — ikke i
 * toppnavet — så aktiv-nøkkelen følger presedensen fra /admin/team og
 * /admin/email-templates (andre Drift-siter): "cockpit".
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminHjelpV2 } from "@/components/admin/v2/AdminHjelpV2";

export default async function V2AdminHjelpPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminHjelpV2 />
    </V2Shell>
  );
}
