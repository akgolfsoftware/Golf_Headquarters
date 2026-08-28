/**
 * v2-forhåndsvisning — PlayerHQ Plan (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), PlanV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra Hjem-siden (getDashboardData) — Plan
 * bruker week + weekProgress fra samme kontrakt.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { PlanV2 } from "@/components/portal/v2/PlanV2";
import { getPlayerDepthMode } from "@/lib/player-depth-mode";
import { hentUkePeriode } from "@/lib/portal-plan/uke-periode";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan · PlayerHQ" };

export default async function V2PlanPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [data, depthMode, periode] = await Promise.all([
    getDashboardData(user.id),
    getPlayerDepthMode(),
    hentUkePeriode(user.id),
  ]);

  return (
    <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={data.user.name} avatarUrl={data.user.avatarUrl}>
      <PlanV2 data={data} depthMode={depthMode} periode={periode} />
    </V2Shell>
  );
}
