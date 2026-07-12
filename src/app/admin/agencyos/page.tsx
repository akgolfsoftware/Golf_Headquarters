/**
 * v2-preview: AgencyOS Cockpit (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell/AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data er identisk med den ekte /admin/agencyos-siden: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme loadDailyBrief-loader.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";
import { loadInnboksSammendrag } from "@/lib/innboks/data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { CockpitV2 } from "@/components/admin/v2/CockpitV2";

export const dynamic = "force-dynamic";

export default async function V2CockpitPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const [data, innboks] = await Promise.all([
    loadDailyBrief({ id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role }),
    loadInnboksSammendrag(),
  ]);
  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <CockpitV2 data={data} innboks={innboks} />
    </V2Shell>
  );
}
