/**
 * v2-forhåndsvisning — PlayerHQ DataGolf (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), DataGolfV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt: requirePortalUser + hentDataGolf (ekte data fra
 * BrukerSammenligning + BrukerSgInput + PgaPlayerSeason).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentDataGolf } from "@/lib/portal-stats/datagolf-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { DataGolfV2 } from "@/components/portal/v2/DataGolfV2";

export const dynamic = "force-dynamic";

export default async function V2DataGolfPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await hentDataGolf(user.id);

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <DataGolfV2 data={data} />
    </V2Shell>
  );
}
