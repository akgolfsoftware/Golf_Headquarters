/**
 * PH25Sprak — språk i PlayerHQSkall.
 * Samme lagring. Engelsk er fortsatt sperret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { InnstillingerSprakV2 } from "@/components/portal/v2/InnstillingerSprakV2";

export const dynamic = "force-dynamic";

export default async function SprakPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const [fullUser, ulest] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { preferences: true } }),
    getUnreadNotifications(user.id, 1),
  ]);
  const prefs = lesPreferences(fullUser ?? { preferences: null });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <InnstillingerSprakV2 data={{ spraak: prefs.spraak }} />
      </div>
    </PlayerHQSkall>
  );
}
