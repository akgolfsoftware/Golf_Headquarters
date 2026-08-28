/**
 * /portal/venner — B-pakke i kode.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentVennerData } from "@/lib/venner/actions";
import { VennerClient } from "./VennerClient";
import { TL } from "@/lib/v2/train-lock";

import { Caps, Tittel, Kort } from "@/components/v2";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { FEATURES } from "@/lib/features";

export const dynamic = "force-dynamic";

export default async function VennerPage() {
  const user = await requirePortalUser();
  const data = await hentVennerData();

  return (
    <V2Shell bredde="kolonne" aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div data-paper-portal-venner style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <div>
          <Caps>PlayerHQ · Sosialt</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="venner">Dine</Tittel>
          </div>
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "8px 0 0", lineHeight: 1.45 }}>
            Legg til venner og se at de har trent — aldri plan, tall eller coach-notater.
          </p>
        </div>
        <Kort>
          <VennerClient initial={data} visLeaderboard={FEATURES.LEADERBOARD} />
        </Kort>
      </div>
    </V2Shell>
  );
}
