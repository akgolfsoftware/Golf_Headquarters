/**
 * v2-forhåndsvisning — PlayerHQ Runder (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), RunderV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/mal/runder/page.tsx).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getRunderListModel } from "@/lib/portal-runder/runder-list-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { RunderV2 } from "@/components/portal/v2/RunderV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function V2RunderPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const model = await getRunderListModel(user.id);
  const fornavn = user.name ? user.name.split(" ")[0] : "";

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/mal">Mål</TilbakeLenke>
      <RunderV2 data={{ fornavn, hcp: user.hcp, rows: model.rows, kpis: model.kpis }} />
    </V2Shell>
  );
}
