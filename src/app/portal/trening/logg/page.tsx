/**
 * PH26TreningLogg — logg en treningsøkt i PlayerHQSkall.
 * Lagring går fortsatt til /api/portal/trening/logg.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TreningLoggV2 } from "@/components/portal/v2/TreningLoggV2";

export default async function TreningLoggPage() {
  const user = await requirePortalUser();
  const ulest = await getUnreadNotifications(user.id, 1);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/gjennomfore" className="ph-tilbake">Gjør</Link>
        <TreningLoggV2 />
      </div>
    </PlayerHQSkall>
  );
}
