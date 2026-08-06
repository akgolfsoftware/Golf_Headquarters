/**
 * AgencyOS · AK-stigen — junior-stige (Mini → Elite).
 * Paper-fasit: agencyos-ak-stigen.html. Ny rute 2026-08-06.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AkStigenV2 } from "@/components/admin/v2/AkStigenV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "AK-stigen · AgencyOS" };

export default async function AkStigenPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Ærlig tom tilstand først — tellinger kobles når junior-grupper er modellert i stall-loader.
  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AkStigenV2 />
    </V2Shell>
  );
}
