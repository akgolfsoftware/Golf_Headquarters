/**
 * DataGolf-spillerkort (DG-01 / C10). Kun DataGolf-motor — Broadie og PEI
 * blandes aldri inn. V2Shell leverer chrome, DataGolfV2 innholdet.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentDataGolf } from "@/lib/portal-stats/datagolf-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { DataGolfV2 } from "@/components/portal/v2/DataGolfV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function AnalysereDataGolfPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await hentDataGolf(user.id);

  return (
    <V2Shell bredde="full" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/analysere">Analyse</TilbakeLenke>
      <DataGolfV2 data={data} spillerNavn={user.name ?? undefined} />
    </V2Shell>
  );
}
