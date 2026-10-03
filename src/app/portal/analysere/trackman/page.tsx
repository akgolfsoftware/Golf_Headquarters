/**
 * PH17TrackMan — TrackMan-listen i PlayerHQSkall.
 * Samme økter og samme opplasting.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TrackManListeTrainLock } from "@/components/portal/v2/TrackManListeTrainLock";
import { hentTrackManListe } from "@/lib/trackman/liste-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan · PlayerHQ" };

export default async function TrackManListePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const [data, ulest] = await Promise.all([
    hentTrackManListe(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <TrackManListeTrainLock data={data} />
      </div>
    </PlayerHQSkall>
  );
}
