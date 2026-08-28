/**
 * AgencyOS · AK-stigen — junior-stige (Mini → Elite).
 * Paper-fasit: agencyos-ak-stigen.html. Ny rute 2026-08-06.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import { AkStigenV2 } from "@/components/admin/v2/AkStigenV2";
import { lastAkStigenData } from "@/lib/agencyos/ak-stigen-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "AK-stigen · AgencyOS" };

export default async function AkStigenPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await lastAkStigenData();

  return (
    <V2Shell bredde="full" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TlTilbake href="/admin/agencyos">Cockpit</TlTilbake>
      <AkStigenV2 data={data} />
    </V2Shell>
  );
}
