/**
 * PlayerHQ Analyse-hub — TM-04.
 * Fasit: designsystem/train-lock/TM-04 Analyse-hub TrackMan.dc.html
 * Historikk/runder ligger på /portal/analysere/historikk.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { AnalyseHubTrainLock } from "@/components/portal/v2/AnalyseHubTrainLock";
import { hentAnalyseHub } from "@/lib/portal-analyse/tm-hub-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analyse · PlayerHQ" };

export default async function AnalyserePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await hentAnalyseHub(user.id);

  return (
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AnalyseHubTrainLock data={data} />
    </V2Shell>
  );
}
