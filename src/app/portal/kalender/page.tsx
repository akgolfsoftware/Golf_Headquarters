/**
 * v2-forhåndsvisning — PlayerHQ Kalender (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell leverer
 * chrome-en (IkonRail/BunnNav), KalenderV2 rendrer innholds-stacken.
 *
 * Auth gjenbrukt fra den ekte siden (src/app/portal/kalender/page.tsx);
 * loaderen (hentKalenderData) gjenbruker Aar-logikken derfra og utvider med
 * ekte økt-spørringer for Dag/Uke/Maaned.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { KalenderV2 } from "@/components/portal/v2/KalenderV2";
import { hentKalenderData } from "./data";

export const dynamic = "force-dynamic";

export default async function V2KalenderPreviewPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const data = await hentKalenderData(user.id, user.name ?? "Spiller", user.avatarUrl ?? null);

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={data.spillerNavn} avatarUrl={data.avatarUrl}>
      <KalenderV2 data={data} />
    </V2Shell>
  );
}
