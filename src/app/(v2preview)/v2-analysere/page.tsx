/**
 * v2-forhåndsvisning — PlayerHQ Analysere (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), AnalysereV2 rendrer innholds-stacken.
 *
 * Auth + dataloadere gjenbrukt 1:1 fra den ekte siden (src/app/portal/analysere/page.tsx).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadMinGolf } from "@/lib/min-golf/load-min-golf";
import { loadAnalyticsWorkbenchData } from "@/app/portal/analysere/actions";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { AnalysereV2 } from "@/components/portal/v2/AnalysereV2";

export const dynamic = "force-dynamic";

export default async function V2AnalyserePreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [minGolf, workbench] = await Promise.all([
    loadMinGolf(user.id),
    loadAnalyticsWorkbenchData(user.id),
  ]);

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AnalysereV2 data={{ minGolf, workbench }} />
    </V2Shell>
  );
}
