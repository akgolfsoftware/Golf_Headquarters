/**
 * AgencyOS e-post-innboks — v2. post@akgolf.no inn på cockpit-forsiden;
 * dette er den fulle flaten (liste + detalj + godkjenn-og-send).
 *
 * Egen top-level route (utenfor AdminShell) — V2Shell leverer all chrome
 * i mørk v2-scope, samme mønster som /admin/agencyos og /admin/innboks.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadAlleEpost } from "@/lib/innboks/data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { InnboksEpostV2 } from "@/components/admin/v2/InnboksEpostV2";

export const dynamic = "force-dynamic";

export default async function InnboksEpostPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const epost = await loadAlleEpost();
  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <InnboksEpostV2 epost={epost} />
    </V2Shell>
  );
}
