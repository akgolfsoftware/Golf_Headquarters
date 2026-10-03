/**
 * PH25PushValg — varselvalg i PlayerHQSkall.
 * Samme preferanser og samme push på enheten.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { InnstillingerVarslerV2 } from "@/components/portal/v2/InnstillingerVarslerV2";

export const dynamic = "force-dynamic";

export default async function VarslerPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const [fullUser, ulest] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { preferences: true } }),
    getUnreadNotifications(user.id, 1),
  ]);
  const prefs = lesPreferences(fullUser ?? { preferences: null });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <InnstillingerVarslerV2 data={{ notif: prefs.notif, spraak: prefs.spraak }} />
      </div>
    </PlayerHQSkall>
  );
}
