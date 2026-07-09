/**
 * v2-forhåndsvisning — PlayerHQ Økt (økt-detalj, retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell
 * leverer chrome-en (IkonRail/BunnNav), OktV2 rendrer innholds-stacken.
 *
 * Auth gjenbrukt 1:1 fra den ekte lese-flaten (src/app/portal/gjennomfore/[id]/
 * page.tsx). Til preview plukkes en EKTE eksempel-økt for testbrukeren.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getOktDetaljData, hentEksempelOktId } from "@/lib/portal-okt/okt-detalj-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { OktV2 } from "@/components/portal/v2/OktV2";

export const dynamic = "force-dynamic";

export default async function V2OktPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const sessionId = await hentEksempelOktId(user.id);
  const data = await getOktDetaljData(user.id, sessionId);

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <OktV2 data={data} />
    </V2Shell>
  );
}
