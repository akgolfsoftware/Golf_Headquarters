/**
 * PlayerHQ · TrackMan-liste — TM-01.
 * Fasit: designsystem/train-lock/TM-01 TrackMan liste.dc.html
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TrackManListeTrainLock } from "@/components/portal/v2/TrackManListeTrainLock";
import { hentTrackManListe } from "@/lib/trackman/liste-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan · PlayerHQ" };

export default async function TrackManListePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const data = await hentTrackManListe(user.id);

  return (
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TrackManListeTrainLock data={data} />
    </V2Shell>
  );
}
