/**
 * v2 — PlayerHQ Innstillinger · Språk og region (retning C). V2Shell leverer
 * chrome-en (IkonRail/BunnNav, aktiv «meg»), InnstillingerSprakV2 rendrer
 * innholds-stacken.
 *
 * v2-port 17. juli 2026: auth + preferanse-oppslaget (requirePortalUser +
 * prisma → lesPreferences) er uendret — kun presentasjonslaget er byttet.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { InnstillingerSprakV2 } from "@/components/portal/v2/InnstillingerSprakV2";

export const dynamic = "force-dynamic";

export default async function SprakPage() {
  const user = await requirePortalUser();
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferences: true },
  });
  const prefs = lesPreferences(fullUser ?? { preferences: null });

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/innstillinger">Innstillinger</TilbakeLenke>
      <InnstillingerSprakV2 data={{ spraak: prefs.spraak }} />
    </V2Shell>
  );
}
