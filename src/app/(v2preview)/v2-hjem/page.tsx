/**
 * v2-forhåndsvisning — PlayerHQ Hjem (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), HjemV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden (src/app/portal/page.tsx).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { HjemV2 } from "@/components/portal/v2/HjemV2";

export const dynamic = "force-dynamic";

export default async function V2HjemPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getDashboardData(user.id);

  return (
    <V2Shell aktiv="hjem" nav={PLAYERHQ_NAV} navn={data.user.name} avatarUrl={data.user.avatarUrl}>
      <HjemV2 data={data} />
    </V2Shell>
  );
}
