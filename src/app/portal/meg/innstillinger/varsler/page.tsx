/**
 * v2 — PlayerHQ Innstillinger · Varsler (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav, aktiv «meg»), InnstillingerVarslerV2 rendrer innholds-stacken.
 *
 * v2-port 17. juli 2026: auth + preferanse-oppslaget (requirePortalUser +
 * prisma → lesPreferences) er uendret — kun presentasjonslaget er byttet.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { InnstillingerVarslerV2 } from "@/components/portal/v2/InnstillingerVarslerV2";

export const dynamic = "force-dynamic";

export default async function VarslerPage() {
  const user = await requirePortalUser();
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferences: true },
  });
  const prefs = lesPreferences(fullUser ?? { preferences: null });

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/innstillinger">Innstillinger</TilbakeLenke>
      <InnstillingerVarslerV2 data={{ notif: prefs.notif, spraak: prefs.spraak }} />
    </V2Shell>
  );
}
