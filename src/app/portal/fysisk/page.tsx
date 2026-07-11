/**
 * v2-forhåndsvisning — PlayerHQ Fysisk logging (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell
 * leverer chrome-en (IkonRail/BunnNav), FysiskV2 rendrer innholds-stacken.
 *
 * Auth gjenbrukt 1:1 fra de andre PlayerHQ-previewsidene; data fra den nye
 * fysisk-loaderen (src/lib/portal-fysisk/fysisk-data.ts).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getFysiskData } from "@/lib/portal-fysisk/fysisk-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { FysiskV2 } from "@/components/portal/v2/FysiskV2";

export const dynamic = "force-dynamic";

export default async function V2FysiskPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getFysiskData(user.id);

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={data.spillerNavn} avatarUrl={user.avatarUrl}>
      <FysiskV2 data={data} />
    </V2Shell>
  );
}
