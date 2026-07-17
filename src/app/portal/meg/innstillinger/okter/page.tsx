/**
 * v2 — PlayerHQ Innstillinger · Apparater og økter (retning C). V2Shell leverer
 * chrome-en (IkonRail/BunnNav, aktiv «meg»), InnstillingerOkterV2 rendrer
 * innholds-stacken.
 *
 * v2-port 17. juli 2026: auth-guard uendret — kun presentasjonslaget er byttet.
 * Apparat-oversikten er fortsatt en ærlig «kommer Q3 2026»-tomtilstand.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { InnstillingerOkterV2 } from "@/components/portal/v2/InnstillingerOkterV2";

export const dynamic = "force-dynamic";

export default async function OkterPage() {
  const user = await requirePortalUser();

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/innstillinger">Innstillinger</TilbakeLenke>
      <InnstillingerOkterV2 />
    </V2Shell>
  );
}
