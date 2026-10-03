/**
 * PH24Venner — venner i PlayerHQSkall.
 * Viser at venner har trent, ikke plan, tall eller coach-notater.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { hentVennerData } from "@/lib/venner/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { FEATURES } from "@/lib/features";
import { VennerClient } from "./VennerClient";

export const dynamic = "force-dynamic";

export default async function VennerPage() {
  const user = await requirePortalUser();
  const [data, ulest] = await Promise.all([
    hentVennerData(),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph24v">
        <header>
          <p>PlayerHQ · Sosialt</p>
          <h1>Dine venner</h1>
          <p>Legg til venner og se at de har trent — aldri plan, tall eller coach-notater.</p>
        </header>
        <section className="pa-card ph24v-kort">
          <VennerClient initial={data} visLeaderboard={FEATURES.LEADERBOARD} />
        </section>
      </div>
    </PlayerHQSkall>
  );
}
