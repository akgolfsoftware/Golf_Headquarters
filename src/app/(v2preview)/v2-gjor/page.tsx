/**
 * v2-forhåndsvisning — PlayerHQ Gjør (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), GjorV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/gjennomfore/page.tsx).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { GjorV2 } from "@/components/portal/v2/GjorV2";

export const dynamic = "force-dynamic";

export default async function V2GjorPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getGjennomforeData(user.id);

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <GjorV2 data={data} />
    </V2Shell>
  );
}
