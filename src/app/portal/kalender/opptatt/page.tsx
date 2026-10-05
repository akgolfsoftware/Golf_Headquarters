/**
 * PH10Opptatt — spillerens egne avtaler i PlayerHQSkall.
 * Skole, gruppetrening og fravær hentes fortsatt andre steder.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { OpptattTidV2 } from "@/components/portal/v2/OpptattTidV2";
import { hentEgenOpptattTid } from "../opptatt-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OpptattTidPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const naa = new Date();
  const fra = new Date(naa.getTime() - 28 * 24 * 60 * 60 * 1000);
  const til = new Date(naa.getFullYear() + 1, naa.getMonth(), naa.getDate());
  const [rader, ulest] = await Promise.all([
    hentEgenOpptattTid(fra, til),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/kalender" className="ph-tilbake">Kalender</Link>
        <OpptattTidV2 rader={rader} />
      </div>
    </PlayerHQSkall>
  );
}
