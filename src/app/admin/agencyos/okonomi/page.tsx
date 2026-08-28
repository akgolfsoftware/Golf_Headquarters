/**
 * AgencyOS Økonomi — EC-01 (C10).
 *
 * Tripletex-lesing. FORFALT fra Stripe. Reports flettes inn. Ingen
 * Invoice-migrasjon. Server component.
 */

import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminOkonomiV2 } from "@/components/admin/v2/AdminOkonomiV2";
import { hentOkonomiFlate } from "@/lib/admin/okonomi-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Økonomi · AgencyOS" };

export default async function V2AdminOkonomiPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await hentOkonomiFlate({ id: user.id, role: user.role });

  return (
    <V2Shell bredde="full" aktiv="mer" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminOkonomiV2 data={data} />
    </V2Shell>
  );
}
